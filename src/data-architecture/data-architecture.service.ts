import { Db, Document } from 'mongodb';
import { MigrationRunner } from './migrations/migration-runner';
import { SeedLoader, allSeedData } from './seeds';
import { ChangeStreamManager, LocationDailyStatsProcessor, UserActivitySummaryProcessor } from './utils';
import { AppendOnlyService, AuditLogService, LedgerService, QueryService } from './services';
import logger from '../shared/utils/logger.util';

// Import all migrations
import { createCollectionsMigration } from './migrations/001-create-collections';
import { createIndexesMigration } from './migrations/002-create-indexes';
import { setupConstraintsMigration } from './migrations/003-setup-constraints';

/**
 * Data Architecture Service - Main orchestrator for the data layer
 */
export class DataArchitectureService {
    private db: Db;
    private migrationRunner: MigrationRunner;
    private seedLoader: SeedLoader;
    private changeStreamManager: ChangeStreamManager;
    private queryService: QueryService;
    private auditLogService: AuditLogService;
    private ledgerService: LedgerService;

    constructor(db: Db) {
        this.db = db;

        // Initialize migration runner with all migrations
        const migrations = [
            createCollectionsMigration,
            createIndexesMigration,
            setupConstraintsMigration,
        ];
        this.migrationRunner = new MigrationRunner(db, migrations);

        // Initialize other services
        this.seedLoader = new SeedLoader(db);
        this.changeStreamManager = new ChangeStreamManager(db);
        this.queryService = new QueryService(db);
        this.auditLogService = new AuditLogService(db);
        this.ledgerService = new LedgerService(db);

        this.setupChangeStreamProcessors();
    }

    /**
     * Initialize the data architecture
     */
    async initialize(): Promise<void> {
        logger.info('Initializing Data Architecture...');

        try {
            // Run migrations
            await this.runMigrations();

            // Load seed data
            await this.loadSeedData();

            // Start change streams
            await this.startChangeStreams();

            logger.info('Data Architecture initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize Data Architecture:', error);
            throw error;
        }
    }

    /**
     * Run database migrations
     */
    async runMigrations(): Promise<void> {
        logger.info('Running database migrations...');
        await this.migrationRunner.runPendingMigrations();
    }

    /**
     * Load seed data
     */
    async loadSeedData(): Promise<void> {
        logger.info('Loading seed data...');
        const results = await this.seedLoader.loadSeeds(allSeedData);

        const totalInserted = results.reduce((sum, result) => sum + result.inserted, 0);
        const totalSkipped = results.reduce((sum, result) => sum + result.skipped, 0);
        const totalErrors = results.reduce((sum, result) => sum + result.errors, 0);

        logger.info(`Seed data loaded: ${totalInserted} inserted, ${totalSkipped} skipped, ${totalErrors} errors`);
    }

    /**
     * Setup change stream processors
     */
    private setupChangeStreamProcessors(): void {
        // Register location daily stats processor
        this.changeStreamManager.registerProcessor(
            'location-daily-stats',
            new LocationDailyStatsProcessor(this.db)
        );

        // Register user activity summary processor
        this.changeStreamManager.registerProcessor(
            'user-activity-summary',
            new UserActivitySummaryProcessor(this.db)
        );
    }

    /**
     * Start change streams
     */
    async startChangeStreams(): Promise<void> {
        logger.info('Starting change streams...');
        await this.changeStreamManager.startAllStreams();
    }

    /**
     * Stop change streams
     */
    async stopChangeStreams(): Promise<void> {
        logger.info('Stopping change streams...');
        await this.changeStreamManager.stopAllStreams();
    }

    /**
     * Get migration status
     */
    async getMigrationStatus() {
        return this.migrationRunner.getStatus();
    }

    /**
     * Rollback last migration
     */
    async rollbackLastMigration(): Promise<void> {
        await this.migrationRunner.rollbackLastMigration();
    }

    /**
     * Get change stream status
     */
    getChangeStreamStatus() {
        return this.changeStreamManager.getStreamStatus();
    }

    /**
     * Get query service
     */
    getQueryService(): QueryService {
        return this.queryService;
    }

    /**
     * Get audit log service
     */
    getAuditLogService(): AuditLogService {
        return this.auditLogService;
    }

    /**
     * Get ledger service
     */
    getLedgerService(): LedgerService {
        return this.ledgerService;
    }

    /**
     * Create append-only service for a collection
     */
    createAppendOnlyService<T extends Document>(collectionName: string): AppendOnlyService<T> {
        return new AppendOnlyService<T>(this.db, collectionName);
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<{
        database: boolean;
        migrations: any;
        changeStreams: any;
    }> {
        try {
            // Check database connection
            await this.db.admin().ping();

            // Get migration status
            const migrationStatus = await this.getMigrationStatus();

            // Get change stream status
            const changeStreamStatus = this.getChangeStreamStatus();

            return {
                database: true,
                migrations: migrationStatus,
                changeStreams: changeStreamStatus,
            };
        } catch (error) {
            logger.error('Data Architecture health check failed:', error);
            return {
                database: false,
                migrations: null,
                changeStreams: null,
            };
        }
    }

    /**
     * Shutdown gracefully
     */
    async shutdown(): Promise<void> {
        logger.info('Shutting down Data Architecture...');
        await this.stopChangeStreams();
        logger.info('Data Architecture shutdown complete');
    }
}