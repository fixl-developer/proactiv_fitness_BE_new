import { Db } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { AuditLog, ConsentLog, CustodyLog, FinancialLog, CertificationLog, AutomationLog, ImpersonationLog } from '../interfaces';
import { HashChainService } from './hash-chain.service';
import logger from '../../../shared/utils/logger.util';

export interface AuditLogInput {
    tenantId: string;
    actorId: string;
    actorType: 'user' | 'admin' | 'system';
    actionType: string;
    actionCategory: string;
    resourceId?: string;
    resourceType?: string;
    context: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    impersonationContext?: {
        adminId: string;
        adminEmail: string;
        reason: string;
        sessionId: string;
    };
}

/**
 * Log Writer Service for creating immutable audit logs
 */
export class LogWriterService {
    private db: Db;
    private hashChainService: HashChainService;
    private buffer: AuditLog[] = [];
    private bufferSize = 100;
    private flushInterval = 5000; // 5 seconds
    private flushTimer?: NodeJS.Timeout;

    constructor(db: Db) {
        this.db = db;
        this.hashChainService = new HashChainService(db);
        this.startFlushTimer();
    }

    /**
     * Create a single audit log
     */
    async createLog(input: AuditLogInput): Promise<string> {
        const logId = uuidv4();
        const now = new Date();
        const timestampNanos = now.getTime() * 1000000 + (now.getMilliseconds() % 1000) * 1000;

        // Get previous hash and sequence number
        const [previousHash, sequenceNumber] = await Promise.all([
            this.hashChainService.getLatestHash(input.tenantId),
            this.hashChainService.getNextSequenceNumber(input.tenantId),
        ]);

        // Create log entry
        const logEntry: Partial<AuditLog> = {
            logId,
            tenantId: input.tenantId,
            sequenceNumber,
            timestamp: now,
            timestampNanos,
            actorId: input.actorId,
            actorType: input.actorType,
            actionType: input.actionType,
            actionCategory: input.actionCategory,
            resourceId: input.resourceId,
            resourceType: input.resourceType,
            context: input.context,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
            requestId: input.requestId,
            impersonation: input.impersonationContext,
            previousHash,
            anonymized: false,
            legalHolds: [],
            retentionCategory: input.actionCategory,
            immutable: true,
            createdAt: now,
        };

        // Compute current hash
        const currentHash = this.hashChainService.computeLogHash(logEntry, previousHash);
        logEntry.currentHash = currentHash;

        // Add to buffer or write immediately
        if (this.bufferSize > 1) {
            this.buffer.push(logEntry as AuditLog);
            if (this.buffer.length >= this.bufferSize) {
                await this.flushBuffer();
            }
        } else {
            await this.writeLogToDatabase(logEntry as AuditLog);
        }

        logger.debug('Audit log created', {
            logId,
            tenantId: input.tenantId,
            actionType: input.actionType,
            sequenceNumber,
        });

        return logId;
    }

    /**
     * Create multiple audit logs in batch
     */
    async createBatch(inputs: AuditLogInput[]): Promise<string[]> {
        if (inputs.length === 0) return [];

        const logIds: string[] = [];
        const tenantId = inputs[0].tenantId;

        // Validate all logs are for the same tenant
        if (!inputs.every(input => input.tenantId === tenantId)) {
            throw new Error('All logs in batch must be for the same tenant');
        }

        // Get initial previous hash and sequence number
        const [initialPreviousHash, initialSequenceNumber] = await Promise.all([
            this.hashChainService.getLatestHash(tenantId),
            this.hashChainService.getNextSequenceNumber(tenantId),
        ]);

        const logs: AuditLog[] = [];
        let previousHash = initialPreviousHash;
        let sequenceNumber = initialSequenceNumber;

        for (const input of inputs) {
            const logId = uuidv4();
            const now = new Date();
            const timestampNanos = now.getTime() * 1000000 + (now.getMilliseconds() % 1000) * 1000;

            const logEntry: Partial<AuditLog> = {
                logId,
                tenantId: input.tenantId,
                sequenceNumber,
                timestamp: now,
                timestampNanos,
                actorId: input.actorId,
                actorType: input.actorType,
                actionType: input.actionType,
                actionCategory: input.actionCategory,
                resourceId: input.resourceId,
                resourceType: input.resourceType,
                context: input.context,
                ipAddress: input.ipAddress,
                userAgent: input.userAgent,
                requestId: input.requestId,
                impersonation: input.impersonationContext,
                previousHash,
                anonymized: false,
                legalHolds: [],
                retentionCategory: input.actionCategory,
                immutable: true,
                createdAt: now,
            };

            // Compute current hash
            const currentHash = this.hashChainService.computeLogHash(logEntry, previousHash);
            logEntry.currentHash = currentHash;

            logs.push(logEntry as AuditLog);
            logIds.push(logId);

            // Update for next iteration
            previousHash = currentHash;
            sequenceNumber++;
        }

        // Write batch to database
        await this.writeBatchToDatabase(logs);

        logger.info('Audit log batch created', {
            tenantId,
            count: logs.length,
            logIds,
        });

        return logIds;
    }

    /**
     * Specialized logging functions
     */

    async logConsentChange(
        tenantId: string,
        actorId: string,
        consentType: string,
        previousState: boolean,
        newState: boolean,
        minorId?: string,
        guardianId?: string,
        ipAddress?: string
    ): Promise<string> {
        return this.createLog({
            tenantId,
            actorId,
            actorType: guardianId ? 'user' : 'user',
            actionType: newState ? 'consent.granted' : 'consent.revoked',
            actionCategory: 'consent',
            resourceId: minorId || actorId,
            resourceType: 'user',
            context: {
                consentType,
                previousState,
                newState,
                guardianId,
                minorId,
            },
            ipAddress,
        });
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
        return this.createLog({
            tenantId,
            actorId,
            actorType: 'admin',
            actionType,
            actionCategory: 'custody',
            resourceId: minorId,
            resourceType: 'user',
            context: {
                guardianId,
                minorId,
                custodyType,
                permissions,
                previousPermissions,
                effectiveDate: new Date(),
            },
            ipAddress,
        });
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
        return this.createLog({
            tenantId,
            actorId,
            actorType: 'admin',
            actionType,
            actionCategory: 'financial',
            resourceId: transactionId,
            resourceType: 'transaction',
            context: {
                transactionId,
                amount,
                currency,
                reasonCode,
                reasonDescription,
            },
            ipAddress,
        });
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
        return this.createLog({
            tenantId,
            actorId,
            actorType: 'admin',
            actionType,
            actionCategory: 'certification',
            resourceId: trainerId,
            resourceType: 'user',
            context: {
                trainerId,
                certificationType,
                issuingOrganization,
                issueDate,
                expirationDate,
            },
            ipAddress,
        });
    }

    async logAutomationRule(
        tenantId: string,
        actorId: string,
        actionType: 'rule.created' | 'rule.modified' | 'rule.deleted' | 'rule.executed',
        ruleId: string,
        ruleName: string,
        ruleDefinition?: any,
        previousDefinition?: any,
        ipAddress?: string
    ): Promise<string> {
        return this.createLog({
            tenantId,
            actorId,
            actorType: 'admin',
            actionType,
            actionCategory: 'automation',
            resourceId: ruleId,
            resourceType: 'automation_rule',
            context: {
                ruleId,
                ruleName,
                ruleDefinition,
                previousDefinition,
            },
            ipAddress,
        });
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
        return this.createLog({
            tenantId,
            actorId: adminId,
            actorType: 'admin',
            actionType,
            actionCategory: 'impersonation',
            resourceId: targetUserId,
            resourceType: 'user',
            context: {
                targetUserId,
                sessionDuration,
            },
            impersonationContext: {
                adminId,
                adminEmail,
                reason,
                sessionId,
            },
            ipAddress,
        });
    }

    /**
     * Private methods
     */

    private async writeLogToDatabase(log: AuditLog): Promise<void> {
        const collection = this.db.collection('audit_logs');
        await collection.insertOne(log);
    }

    private async writeBatchToDatabase(logs: AuditLog[]): Promise<void> {
        if (logs.length === 0) return;

        const collection = this.db.collection('audit_logs');
        await collection.insertMany(logs);
    }

    private async flushBuffer(): Promise<void> {
        if (this.buffer.length === 0) return;

        const logsToWrite = [...this.buffer];
        this.buffer = [];

        try {
            await this.writeBatchToDatabase(logsToWrite);
            logger.debug('Buffer flushed', { count: logsToWrite.length });
        } catch (error) {
            logger.error('Failed to flush buffer', { error, count: logsToWrite.length });
            // Re-add to buffer for retry
            this.buffer.unshift(...logsToWrite);
            throw error;
        }
    }

    private startFlushTimer(): void {
        this.flushTimer = setInterval(async () => {
            try {
                await this.flushBuffer();
            } catch (error) {
                logger.error('Scheduled buffer flush failed', { error });
            }
        }, this.flushInterval);
    }

    /**
     * Cleanup method
     */
    async shutdown(): Promise<void> {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        await this.flushBuffer();
    }
}