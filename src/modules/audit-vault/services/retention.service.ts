import { Db, Collection } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { RetentionPolicy, LegalHold, RetentionEligibility } from '../interfaces';
import logger from '../../../shared/utils/logger.util';

/**
 * Retention Service for managing audit log retention and legal holds
 */
export class RetentionService {
    private db: Db;
    private retentionPoliciesCollection: Collection<RetentionPolicy>;
    private legalHoldsCollection: Collection<LegalHold>;
    private auditLogsCollection: Collection;

    constructor(db: Db) {
        this.db = db;
        this.retentionPoliciesCollection = db.collection<RetentionPolicy>('retention_policies');
        this.legalHoldsCollection = db.collection<LegalHold>('legal_holds');
        this.auditLogsCollection = db.collection('audit_logs');
    }

    /**
     * Create retention policy
     */
    async createRetentionPolicy(
        policy: Omit<RetentionPolicy, '_id' | 'policyId' | 'createdAt' | 'updatedAt'>
    ): Promise<string> {
        const policyId = uuidv4();
        const now = new Date();

        const completePolicy: RetentionPolicy = {
            ...policy,
            policyId,
            createdAt: now,
            updatedAt: now,
        };

        await this.retentionPoliciesCollection.insertOne(completePolicy);

        logger.info('Retention policy created', {
            policyId,
            name: policy.name,
            category: policy.category,
            retentionPeriod: policy.retentionPeriod
        });

        return policyId;
    }

    /**
     * Update retention policy
     */
    async updateRetentionPolicy(
        policyId: string,
        updates: Partial<Omit<RetentionPolicy, '_id' | 'policyId' | 'createdAt'>>
    ): Promise<void> {
        const result = await this.retentionPoliciesCollection.updateOne(
            { policyId },
            {
                $set: {
                    ...updates,
                    updatedAt: new Date(),
                },
                $inc: { version: 1 },
            } as any
        );

        if (result.matchedCount === 0) {
            throw new Error(`Retention policy not found: ${policyId}`);
        }

        logger.info('Retention policy updated', { policyId });
    }

    /**
     * Get retention policy
     */
    async getRetentionPolicy(policyId: string): Promise<RetentionPolicy | null> {
        return this.retentionPoliciesCollection.findOne({ policyId });
    }

    /**
     * List retention policies
     */
    async listRetentionPolicies(tenantId?: string): Promise<RetentionPolicy[]> {
        const filter: any = { isActive: true };
        if (tenantId) {
            filter.$or = [
                { tenantId },
                { tenantId: null } // Platform-wide policies
            ];
        }

        return this.retentionPoliciesCollection
            .find(filter)
            .sort({ priority: -1, createdAt: -1 })
            .toArray();
    }

    /**
     * Create legal hold
     */
    async createLegalHold(
        hold: Omit<LegalHold, '_id' | 'holdId' | 'createdAt' | 'updatedAt'>
    ): Promise<string> {
        const holdId = uuidv4();
        const now = new Date();

        const completeHold: LegalHold = {
            ...hold,
            holdId,
            createdAt: now,
            updatedAt: now,
        };

        await this.legalHoldsCollection.insertOne(completeHold);

        // Apply hold to existing logs
        await this.applyLegalHoldToExistingLogs(holdId, hold.scope, hold.tenantId);

        logger.info('Legal hold created', {
            holdId,
            name: hold.name,
            tenantId: hold.tenantId,
            effectiveDate: hold.effectiveDate
        });

        return holdId;
    }

    /**
     * Release legal hold
     */
    async releaseLegalHold(
        holdId: string,
        releasedBy: string,
        releaseReason: string
    ): Promise<void> {
        const now = new Date();

        const result = await this.legalHoldsCollection.updateOne(
            { holdId, status: 'active' },
            {
                $set: {
                    status: 'released',
                    isActive: false,
                    releasedDate: now,
                    releasedBy,
                    releaseReason,
                    updatedAt: now,
                }
            }
        );

        if (result.matchedCount === 0) {
            throw new Error(`Active legal hold not found: ${holdId}`);
        }

        // Remove hold from audit logs
        await this.removeLegalHoldFromLogs(holdId);

        logger.info('Legal hold released', {
            holdId,
            releasedBy,
            releaseReason
        });
    }

    /**
     * Get legal hold
     */
    async getLegalHold(holdId: string): Promise<LegalHold | null> {
        return this.legalHoldsCollection.findOne({ holdId });
    }

    /**
     * List legal holds
     */
    async listLegalHolds(tenantId: string, activeOnly: boolean = true): Promise<LegalHold[]> {
        const filter: any = { tenantId };
        if (activeOnly) {
            filter.isActive = true;
        }

        return this.legalHoldsCollection
            .find(filter)
            .sort({ effectiveDate: -1 })
            .toArray();
    }

    /**
     * Check retention eligibility for logs
     */
    async checkRetentionEligibility(
        tenantId: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<RetentionEligibility[]> {
        // Get applicable policies
        const policies = await this.listRetentionPolicies(tenantId);

        // Get active legal holds
        const legalHolds = await this.listLegalHolds(tenantId, true);

        // Build query for logs
        const logFilter: any = { tenantId };
        if (startDate || endDate) {
            logFilter.timestamp = {};
            if (startDate) logFilter.timestamp.$gte = startDate;
            if (endDate) logFilter.timestamp.$lte = endDate;
        }

        const logs = await this.auditLogsCollection
            .find(logFilter, { projection: { _id: 1, timestamp: 1, category: 1, resourceType: 1, legalHolds: 1 } })
            .toArray();

        const eligibilityResults: RetentionEligibility[] = [];

        for (const log of logs) {
            const eligibility = await this.evaluateLogRetentionEligibility(
                log,
                policies,
                legalHolds
            );
            eligibilityResults.push(eligibility);
        }

        return eligibilityResults;
    }

    /**
     * Process retention for eligible logs
     */
    async processRetention(tenantId: string, dryRun: boolean = false): Promise<{
        eligible: number;
        processed: number;
        errors: string[];
    }> {
        const eligibilityResults = await this.checkRetentionEligibility(tenantId);
        const eligibleLogs = eligibilityResults.filter(result => result.eligible);

        let processed = 0;
        const errors: string[] = [];

        if (!dryRun) {
            for (const eligibility of eligibleLogs) {
                try {
                    await this.archiveLog(eligibility.logId);
                    processed++;
                } catch (error: any) {
                    const errorMsg = `Failed to archive log ${eligibility.logId}: ${error?.message || 'Unknown error'}`;
                    errors.push(errorMsg);
                    logger.error(errorMsg, { error });
                }
            }
        }

        logger.info('Retention processing completed', {
            tenantId,
            eligible: eligibleLogs.length,
            processed,
            errors: errors.length,
            dryRun
        });

        return {
            eligible: eligibleLogs.length,
            processed,
            errors
        };
    }

    /**
     * Private methods
     */

    private async evaluateLogRetentionEligibility(
        log: any,
        policies: RetentionPolicy[],
        legalHolds: LegalHold[]
    ): Promise<RetentionEligibility> {
        const logId = log._id.toString();

        // Check if log is under legal hold
        const applicableLegalHolds = legalHolds.filter(hold =>
            this.isLogUnderLegalHold(log, hold)
        );

        if (applicableLegalHolds.length > 0) {
            return {
                logId,
                eligible: false,
                reason: 'Under legal hold',
                legalHolds: applicableLegalHolds.map(hold => hold.holdId),
                applicablePolicies: []
            };
        }

        // Find applicable retention policies
        const applicablePolicies = policies.filter(policy =>
            this.isPolicyApplicableToLog(log, policy)
        );

        if (applicablePolicies.length === 0) {
            return {
                logId,
                eligible: false,
                reason: 'No applicable retention policy',
                legalHolds: [],
                applicablePolicies: []
            };
        }

        // Use policy with highest priority
        const policy = applicablePolicies.sort((a, b) => b.priority - a.priority)[0];

        // Check if retention period has passed
        const retentionDate = new Date(log.timestamp);
        retentionDate.setDate(retentionDate.getDate() + policy.retentionPeriod);

        const now = new Date();
        const eligible = now >= retentionDate;

        return {
            logId,
            eligible,
            reason: eligible ? 'Retention period expired' : 'Retention period not yet expired',
            eligibleDate: eligible ? undefined : retentionDate,
            legalHolds: [],
            applicablePolicies: [policy.policyId]
        };
    }

    private isLogUnderLegalHold(log: any, hold: LegalHold): boolean {
        // Check if log falls within legal hold scope
        const logDate = new Date(log.timestamp);

        // Check date range
        if (hold.scope.startDate && logDate < hold.scope.startDate) {
            return false;
        }
        if (hold.scope.endDate && logDate > hold.scope.endDate) {
            return false;
        }

        // Check categories
        if (hold.scope.categories && hold.scope.categories.length > 0) {
            if (!hold.scope.categories.includes(log.category)) {
                return false;
            }
        }

        // Check resource types
        if (hold.scope.resourceTypes && hold.scope.resourceTypes.length > 0) {
            if (!hold.scope.resourceTypes.includes(log.resourceType)) {
                return false;
            }
        }

        return true;
    }

    private isPolicyApplicableToLog(log: any, policy: RetentionPolicy): boolean {
        // Check categories
        if (policy.conditions.categories && policy.conditions.categories.length > 0) {
            if (!policy.conditions.categories.includes(log.category)) {
                return false;
            }
        }

        // Check resource types
        if (policy.conditions.resourceTypes && policy.conditions.resourceTypes.length > 0) {
            if (!policy.conditions.resourceTypes.includes(log.resourceType)) {
                return false;
            }
        }

        return true;
    }

    private async applyLegalHoldToExistingLogs(
        holdId: string,
        scope: LegalHold['scope'],
        tenantId: string
    ): Promise<void> {
        const filter: any = { tenantId };

        // Apply scope filters
        if (scope.startDate || scope.endDate) {
            filter.timestamp = {};
            if (scope.startDate) filter.timestamp.$gte = scope.startDate;
            if (scope.endDate) filter.timestamp.$lte = scope.endDate;
        }

        if (scope.categories && scope.categories.length > 0) {
            filter.category = { $in: scope.categories };
        }

        if (scope.resourceTypes && scope.resourceTypes.length > 0) {
            filter.resourceType = { $in: scope.resourceTypes };
        }

        if (scope.actorIds && scope.actorIds.length > 0) {
            filter.actorId = { $in: scope.actorIds };
        }

        if (scope.resourceIds && scope.resourceIds.length > 0) {
            filter.resourceId = { $in: scope.resourceIds };
        }

        // Add legal hold to matching logs
        const result: any = await this.auditLogsCollection.updateMany(
            filter,
            { $addToSet: { legalHolds: holdId } } as any
        );

        logger.info('Applied legal hold to existing logs', {
            holdId,
            matchedLogs: result?.matchedCount,
            modifiedLogs: result?.modifiedCount
        });
    }

    private async removeLegalHoldFromLogs(holdId: string): Promise<void> {
        const result: any = await this.auditLogsCollection.updateMany(
            { legalHolds: holdId },
            { $pull: { legalHolds: holdId } } as any
        );

        logger.info('Removed legal hold from logs', {
            holdId,
            modifiedLogs: result?.modifiedCount
        });
    }

    private async archiveLog(logId: string): Promise<void> {
        // Move log to archive collection
        const log = await this.auditLogsCollection.findOne({ _id: logId } as any);
        if (!log) {
            throw new Error(`Log not found: ${logId}`);
        }

        const archiveCollection = this.db.collection('audit_logs_archive');
        await archiveCollection.insertOne({
            ...log,
            archivedAt: new Date()
        });

        // Remove from active collection
        await this.auditLogsCollection.deleteOne({ _id: logId } as any);
    }
}