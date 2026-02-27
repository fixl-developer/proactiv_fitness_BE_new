import { Db, MongoClient } from 'mongodb';
import { Migration, MigrationRecord } from './migration.interface';
import logger from '../../shared/utils/logger.util';

const MIGRATIONS_COLLECTION = '_migrations';

export class MigrationRunner {
    private db: Db;
    private migrations: Migration[];

    constructor(db: Db, migrations: Migration[]) {
        this.db = db;
        this.migrations = migrations.sort((a, b) => a.version - b.version);
    }

    /**
     * Get all applied migrations
     */
    private async getAppliedMigrations(): Promise<MigrationRecord[]> {
        const collection = this.db.collection<MigrationRecord>(MIGRATIONS_COLLECTION);
        return collection.find({}).sort({ version: 1 }).toArray();
    }

    /**
     * Record a migration as applied
     */
    private async recordMigration(
        migration: Migration,
        executionTime: number
    ): Promise<void> {
        const collection = this.db.collection<MigrationRecord>(MIGRATIONS_COLLECTION);
        await collection.insertOne({
            version: migration.version,
            name: migration.name,
            appliedAt: new Date(),
            executionTime,
        });
    }

    /**
     * Remove a migration record (for rollback)
     */
    private async removeMigrationRecord(version: number): Promise<void> {
        const collection = this.db.collection<MigrationRecord>(MIGRATIONS_COLLECTION);
        await collection.deleteOne({ version });
    }

    /**
     * Validate migration sequence
     */
    private validateMigrations(): void {
        const versions = this.migrations.map((m) => m.version);
        const uniqueVersions = new Set(versions);

        if (versions.length !== uniqueVersions.size) {
            throw new Error('Duplicate migration versions detected');
        }

        for (let i = 0; i < versions.length; i++) {
            if (versions[i] !== i + 1) {
                throw new Error(`Migration version sequence broken at version ${i + 1}`);
            }
        }
    }

    /**
     * Run pending migrations
     */
    async runPendingMigrations(): Promise<void> {
        this.validateMigrations();

        const appliedMigrations = await this.getAppliedMigrations();
        const appliedVersions = new Set(appliedMigrations.map((m) => m.version));

        const pendingMigrations = this.migrations.filter(
            (m) => !appliedVersions.has(m.version)
        );

        if (pendingMigrations.length === 0) {
            logger.info('No pending migrations');
            return;
        }

        logger.info(`Running ${pendingMigrations.length} pending migrations`);

        for (const migration of pendingMigrations) {
            await this.runMigration(migration);
        }

        logger.info('All migrations completed successfully');
    }

    /**
     * Run a single migration
     */
    private async runMigration(migration: Migration): Promise<void> {
        logger.info(`Running migration ${migration.version}: ${migration.name}`);

        const startTime = Date.now();

        try {
            await migration.up(this.db);
            const executionTime = Date.now() - startTime;
            await this.recordMigration(migration, executionTime);

            logger.info(
                `Migration ${migration.version} completed in ${executionTime}ms`
            );
        } catch (error) {
            logger.error(`Migration ${migration.version} failed:`, error);
            throw error;
        }
    }

    /**
     * Rollback the last migration
     */
    async rollbackLastMigration(): Promise<void> {
        const appliedMigrations = await this.getAppliedMigrations();

        if (appliedMigrations.length === 0) {
            logger.info('No migrations to rollback');
            return;
        }

        const lastMigration = appliedMigrations[appliedMigrations.length - 1];
        const migration = this.migrations.find((m) => m.version === lastMigration.version);

        if (!migration) {
            throw new Error(`Migration ${lastMigration.version} not found in migration list`);
        }

        logger.info(`Rolling back migration ${migration.version}: ${migration.name}`);

        try {
            await migration.down(this.db);
            await this.removeMigrationRecord(migration.version);

            logger.info(`Migration ${migration.version} rolled back successfully`);
        } catch (error) {
            logger.error(`Rollback of migration ${migration.version} failed:`, error);
            throw error;
        }
    }

    /**
     * Get migration status
     */
    async getStatus(): Promise<{
        total: number;
        applied: number;
        pending: number;
        appliedMigrations: MigrationRecord[];
    }> {
        const appliedMigrations = await this.getAppliedMigrations();
        const appliedVersions = new Set(appliedMigrations.map((m) => m.version));

        const pendingCount = this.migrations.filter(
            (m) => !appliedVersions.has(m.version)
        ).length;

        return {
            total: this.migrations.length,
            applied: appliedMigrations.length,
            pending: pendingCount,
            appliedMigrations,
        };
    }
}
