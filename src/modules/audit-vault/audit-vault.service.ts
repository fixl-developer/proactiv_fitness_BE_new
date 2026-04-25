import { Db } from 'mongodb';
import { HashChainService } from './services/hash-chain.service';
import { LogWriterService } from './services/log-writer.service';
import { AuditQueryService } from './services/query.service';
import { ExportService } from './services/export.service';
import { RetentionService } from './services/retention.service';
import { IntegrityVerifierService } from './services/integrity-verifier.service';
import { AuditLog, AuditCategory, AuditSeverity } from './interfaces';
import logger from '../../shared/utils/logger.util';

/**
 * Main Audit Vault Service - Orchestrates all audit functionality
 */
export class AuditVaultService {
    private db: Db;
    private hashChainService: HashChainService;
    private logWriterService: LogWriterService;
    private queryService: AuditQueryService;
    private exportService: ExportService;
    private retentionService: RetentionService;
    private integrityVerifierService: IntegrityVerifierService;

    constructor(db: Db, exportDir?: string) {
        this.db = db;

        // Initialize all services
        this.hashChainService = new HashChainService(db);
        this.logWriterService = new LogWriterService(db);
        this.queryService = new AuditQueryService(db);
        this.exportService = new ExportService(db, exportDir);
        this.retentionService = new RetentionService(db);
        this.integrityVerifierService = new IntegrityVerifierService(db);
    }

    /**
     * Initialize the audit vault
     */
    async initialize(): Promise<void> {
        logger.info('Initializing Audit Vault...');

        try {
            // Create indexes for audit logs collection
            await this.createIndexes();

            // Start periodic cleanup tasks
            await this.startPeriodicTasks();

            logger.info('Audit Vault initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize Audit Vault:', error);
            throw error;
        }
    }

    /**
     * Log Writer Service methods
     */
    async createAuditLog(
        tenantId: string,
        actorId: string,
        actionType: string,
        category: AuditCategory,
        severity: AuditSeverity,
        resourceType: string,
        resourceId: string,
        context: Record<string, any>,
        metadata?: {
            ipAddress?: string;
            userAgent?: string;
            sessionId?: string;
            requestId?: string;
        }
    ): Promise<string> {
        return this.logWriterService.createLog({
            tenantId,
            actorId,
            actorType: 'user',
            actionType,
            actionCategory: category,
            resourceId,
            resourceType,
            context,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            requestId: metadata?.requestId,
        });
    }

    async createBatchAuditLogs(logs: Array<{
        tenantId: string;
        actorId: string;
        actionType: string;
        category: AuditCategory;
        severity: AuditSeverity;
        resourceType: string;
        resourceId: string;
        context: Record<string, any>;
        metadata?: {
            ipAddress?: string;
            userAgent?: string;
            sessionId?: string;
            requestId?: string;
        };
    }>): Promise<string[]> {
        const logInputs = logs.map(log => ({
            tenantId: log.tenantId,
            actorId: log.actorId,
            actorType: 'user' as const,
            actionType: log.actionType,
            actionCategory: log.category,
            resourceId: log.resourceId,
            resourceType: log.resourceType,
            context: log.context,
            ipAddress: log.metadata?.ipAddress,
            userAgent: log.metadata?.userAgent,
            requestId: log.metadata?.requestId,
        }));

        return this.logWriterService.createBatch(logInputs);
    }

    /**
     * Specialized logging methods
     */
    async logConsentChange(
        tenantId: string,
        actorId: string,
        consentType: string,
        granted: boolean,
        minorId?: string,
        guardianId?: string,
        ipAddress?: string
    ): Promise<string> {
        return this.logWriterService.logConsentChange(
            tenantId,
            actorId,
            consentType,
            !granted, // previous state
            granted,  // new state
            minorId,
            guardianId,
            ipAddress
        );
    }

    async logCustodyChange(
        tenantId: string,
        actorId: string,
        actionType: 'custody.added' | 'custody.removed' | 'custody.modified',
        guardianId: string,
        minorId: string,
        custodyType: 'primary' | 'secondary' | 'emergency',
        permissions: string[],
        previousPermissions?: string[],
        ipAddress?: string
    ): Promise<string> {
        return this.logWriterService.logCustodyChange(
            tenantId,
            actorId,
            actionType,
            guardianId,
            minorId,
            custodyType,
            permissions,
            previousPermissions,
            ipAddress
        );
    }

    async logFinancialTransaction(
        tenantId: string,
        actorId: string,
        actionType: 'refund.issued' | 'adjustment.applied' | 'credit.applied',
        transactionId: string,
        amount: number,
        currency: string,
        reasonCode: string,
        reasonDescription: string,
        ipAddress?: string
    ): Promise<string> {
        return this.logWriterService.logFinancialTransaction(
            tenantId,
            actorId,
            actionType,
            transactionId,
            amount,
            currency,
            reasonCode,
            reasonDescription,
            ipAddress
        );
    }

    async logCertificationChange(
        tenantId: string,
        actorId: string,
        actionType: 'certification.added' | 'certification.expired' | 'certification.revoked',
        trainerId: string,
        certificationType: string,
        issuingOrganization: string,
        issueDate: Date,
        expirationDate?: Date,
        ipAddress?: string
    ): Promise<string> {
        return this.logWriterService.logCertificationChange(
            tenantId,
            actorId,
            actionType,
            trainerId,
            certificationType,
            issuingOrganization,
            issueDate,
            expirationDate,
            ipAddress
        );
    }

    async logImpersonation(
        tenantId: string,
        adminId: string,
        adminEmail: string,
        actionType: 'impersonation.started' | 'impersonation.action' | 'impersonation.ended',
        targetUserId: string,
        sessionId: string,
        reason: string,
        sessionDuration?: number,
        ipAddress?: string
    ): Promise<string> {
        return this.logWriterService.logImpersonation(
            tenantId,
            adminId,
            adminEmail,
            actionType,
            targetUserId,
            sessionId,
            reason,
            sessionDuration,
            ipAddress
        );
    }

    /**
     * Query Service methods
     */
    getQueryService(): AuditQueryService {
        return this.queryService;
    }

    /**
     * Export Service methods
     */
    getExportService(): ExportService {
        return this.exportService;
    }

    /**
     * Retention Service methods
     */
    getRetentionService(): RetentionService {
        return this.retentionService;
    }

    /**
     * Integrity Verifier methods
     */
    getIntegrityVerifierService(): IntegrityVerifierService {
        return this.integrityVerifierService;
    }

    /**
     * Hash Chain Service methods
     */
    async verifyChainIntegrity(
        tenantId: string,
        startSequence?: number,
        endSequence?: number
    ): Promise<{
        verified: boolean;
        totalLogs: number;
        verifiedLogs: number;
        breaks: Array<{
            logId: string;
            sequenceNumber: number;
            expectedHash: string;
            actualHash: string;
        }>;
    }> {
        return this.hashChainService.verifyChain(tenantId, startSequence, endSequence);
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<{
        database: boolean;
        services: {
            logWriter: boolean;
            query: boolean;
            export: boolean;
            retention: boolean;
            integrityVerifier: boolean;
        };
        statistics: {
            totalLogs: number;
            recentLogs: number;
            pendingExports: number;
            activeLegalHolds: number;
        };
    }> {
        try {
            // Check database connection
            await this.db.admin().ping();

            // Get statistics
            const auditLogsCollection = this.db.collection('audit_logs');
            const exportJobsCollection = this.db.collection('export_jobs');
            const legalHoldsCollection = this.db.collection('legal_holds');

            const [totalLogs, recentLogs, pendingExports, activeLegalHolds] = await Promise.all([
                auditLogsCollection.countDocuments({}),
                auditLogsCollection.countDocuments({
                    timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                }),
                exportJobsCollection.countDocuments({ status: { $in: ['pending', 'processing'] } }),
                legalHoldsCollection.countDocuments({ isActive: true })
            ]);

            return {
                database: true,
                services: {
                    logWriter: true,
                    query: true,
                    export: true,
                    retention: true,
                    integrityVerifier: true,
                },
                statistics: {
                    totalLogs,
                    recentLogs,
                    pendingExports,
                    activeLegalHolds,
                }
            };
        } catch (error) {
            logger.error('Audit Vault health check failed:', error);
            return {
                database: false,
                services: {
                    logWriter: false,
                    query: false,
                    export: false,
                    retention: false,
                    integrityVerifier: false,
                },
                statistics: {
                    totalLogs: 0,
                    recentLogs: 0,
                    pendingExports: 0,
                    activeLegalHolds: 0,
                }
            };
        }
    }

    /**
     * Shutdown gracefully
     */
    async shutdown(): Promise<void> {
        logger.info('Shutting down Audit Vault...');

        try {
            await this.logWriterService.shutdown();
            logger.info('Audit Vault shutdown complete');
        } catch (error) {
            logger.error('Error during Audit Vault shutdown:', error);
            throw error;
        }
    }

    /**
     * Private methods
     */

    private async createIndexes(): Promise<void> {
        const auditLogsCollection = this.db.collection('audit_logs');

        const indexes = [
            // Tenant isolation
            { tenantId: 1, timestamp: -1 },
            { tenantId: 1, sequenceNumber: 1 },

            // Query optimization
            { tenantId: 1, actorId: 1, timestamp: -1 },
            { tenantId: 1, actionType: 1, timestamp: -1 },
            { tenantId: 1, actionCategory: 1, timestamp: -1 },
            { tenantId: 1, resourceType: 1, resourceId: 1, timestamp: -1 },

            // Hash chain integrity
            { tenantId: 1, sequenceNumber: 1 },

            // Full-text search
            { '$**': 'text' },

            // Legal holds and retention
            { legalHolds: 1 },
            { retentionCategory: 1, timestamp: 1 },
        ];

        for (const index of indexes) {
            try {
                await auditLogsCollection.createIndex(index as any);
            } catch (error) {
                logger.warn('Failed to create index:', { index, error });
            }
        }

        logger.info('Audit log indexes created');
    }

    private async startPeriodicTasks(): Promise<void> {
        // Start periodic export cleanup (every hour)
        setInterval(async () => {
            try {
                await this.exportService.cleanupExpiredExports();
            } catch (error) {
                logger.error('Periodic export cleanup failed:', error);
            }
        }, 60 * 60 * 1000);

        logger.info('Periodic tasks started');
    }
}