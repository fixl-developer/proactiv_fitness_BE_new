/**
 * Feature Flags Main Service
 * 
 * Main orchestrator service that coordinates all feature flag operations
 * and provides a unified interface for the module.
 */

import { MongoClient } from 'mongodb';
import { FlagRepository } from './repositories/flag.repository';
import { EvaluationEngine } from './services/evaluation-engine.service';
import { FlagManagementService } from './services/flag-management.service';
import { FeatureFlagsController } from './controllers/feature-flags.controller';
import { Logger } from '../shared/utils/logger.util';
import { AppError } from '../shared/utils/app-error.util';

export class FeatureFlagsService {
    private logger = Logger.getInstance();
    private flagRepository: FlagRepository;
    private evaluationEngine: EvaluationEngine;
    private managementService: FlagManagementService;
    private controller: FeatureFlagsController;

    constructor(private dbClient: MongoClient) {
        this.initializeServices();
    }

    /**
     * Initialize all service components
     */
    private initializeServices(): void {
        try {
            // Initialize repository
            this.flagRepository = new FlagRepository(this.dbClient);

            // Initialize evaluation engine
            this.evaluationEngine = new EvaluationEngine(this.flagRepository);

            // Initialize management service
            this.managementService = new FlagManagementService(this.flagRepository);

            // Initialize controller
            this.controller = new FeatureFlagsController(this.evaluationEngine, this.managementService);

            this.logger.info('Feature Flags service initialized successfully');
        } catch (error) {
            this.logger.error('Error initializing Feature Flags service:', error);
            throw new AppError('Failed to initialize Feature Flags service', 500);
        }
    }

    /**
     * Initialize database indexes
     */
    async initializeDatabase(): Promise<void> {
        try {
            await this.flagRepository.createIndexes();
            this.logger.info('Feature Flags database initialized successfully');
        } catch (error) {
            this.logger.error('Error initializing Feature Flags database:', error);
            throw new AppError('Failed to initialize Feature Flags database', 500);
        }
    }

    /**
     * Get the controller instance for route registration
     */
    getController(): FeatureFlagsController {
        return this.controller;
    }

    /**
     * Get the evaluation engine for direct access
     */
    getEvaluationEngine(): EvaluationEngine {
        return this.evaluationEngine;
    }

    /**
     * Get the management service for direct access
     */
    getManagementService(): FlagManagementService {
        return this.managementService;
    }

    /**
     * Health check for the service
     */
    async healthCheck(): Promise<{
        status: string;
        timestamp: string;
        components: Record<string, string>;
    }> {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            components: {
                repository: 'healthy',
                evaluationEngine: 'healthy',
                managementService: 'healthy',
                controller: 'healthy'
            }
        };

        try {
            // Test database connection
            await this.flagRepository.findMany({}, 1, 0);
        } catch (error) {
            health.status = 'unhealthy';
            health.components.repository = 'unhealthy';
            this.logger.error('Feature Flags health check failed:', error);
        }

        return health;
    }

    /**
     * Graceful shutdown
     */
    async shutdown(): Promise<void> {
        try {
            this.logger.info('Shutting down Feature Flags service...');
            // Perform any cleanup operations here
            this.logger.info('Feature Flags service shutdown complete');
        } catch (error) {
            this.logger.error('Error during Feature Flags service shutdown:', error);
            throw error;
        }
    }
}