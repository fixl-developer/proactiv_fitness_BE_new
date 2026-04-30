import { Db, Collection } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { HashChainService } from './hash-chain.service';
import logger from '../../../shared/utils/logger.util';

export interface IntegrityVerificationResult {
    verificationId: string;
    tenantId: string;
    startSequence: number;
    endSequence: number;
    totalLogs: number;
    verifiedLogs: number;
    isValid: boolean;
    violations: IntegrityViolation[];
    startedAt: Date;
    completedAt: Date;
    duration: number;
}

export interface IntegrityViolation {
    logId: string;
    sequenceNumber: number;
    violationType: 'hash_mismatch' | 'sequence_gap' | 'timestamp_anomaly' | 'missing_previous_hash';
    expectedValue?: string;
    actualValue?: string;
    description: string;
}

export interface IntegrityVerificationJob {
    _id?: string;
    verificationId: string;
    tenantId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startSequence?: number;
    endSequence?: number;
    result?: IntegrityVerificationResult;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Integrity Verifier Service for validating audit log chain integrity
 */
export class IntegrityVerifierService {
    private db: Db;
    private hashChainService: HashChainService;
    private verificationJobsCollection: Collection<IntegrityVerificationJob>;
    private auditLogsCollection: Collection;

    constructor(db: Db) {
        this.db = db;
        this.hashChainService = new HashChainService(db);
        this.verificationJobsCollection = db.collection<IntegrityVerificationJob>('integrity_verifications');
        this.auditLogsCollection = db.collection('audit_logs');
    }

    /**
     * Start integrity verification
     */
    async startVerification(
        tenantId: string,
        startSequence?: number,
        endSequence?: number
    ): Promise<string> {
        const verificationId = uuidv4();
        const now = new Date();

        const job: IntegrityVerificationJob = {
            verificationId,
            tenantId,
            status: 'pending',
            startSequence,
            endSequence,
            createdAt: now,
            updatedAt: now,
        };

        await this.verificationJobsCollection.insertOne(job);

        // Start verification asynchronously
        this.runVerification(verificationId).catch(error => {
            logger.error('Integrity verification failed', { verificationId, error });
        });

        logger.info('Integrity verification started', {
            verificationId,
            tenantId,
            startSequence,
            endSequence
        });

        return verificationId;
    }

    /**
     * Get verification job status
     */
    async getVerificationJob(verificationId: string): Promise<IntegrityVerificationJob | null> {
        return this.verificationJobsCollection.findOne({ verificationId });
    }

    /**
     * List verification jobs
     */
    async listVerificationJobs(
        tenantId: string,
        limit: number = 50
    ): Promise<IntegrityVerificationJob[]> {
        return this.verificationJobsCollection
            .find({ tenantId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray();
    }

    /**
     * Run verification job
     */
    private async runVerification(verificationId: string): Promise<void> {
        const startTime = new Date();

        try {
            // Update status to running
            await this.verificationJobsCollection.updateOne(
                { verificationId },
                { $set: { status: 'running', updatedAt: new Date() } }
            );

            const job = await this.verificationJobsCollection.findOne({ verificationId });
            if (!job) {
                throw new Error('Verification job not found');
            }

            // Perform verification
            const result = await this.performIntegrityVerification(
                job.tenantId,
                job.startSequence,
                job.endSequence
            );

            result.verificationId = verificationId;
            result.startedAt = startTime;
            result.completedAt = new Date();
            result.duration = result.completedAt.getTime() - startTime.getTime();

            // Log violations if any
            if (result.violations.length > 0) {
                await this.logIntegrityViolations(result.violations, job.tenantId);
            }

            // Update job with results
            await this.verificationJobsCollection.updateOne(
                { verificationId },
                {
                    $set: {
                        status: 'completed',
                        result,
                        updatedAt: new Date(),
                    }
                }
            );

            logger.info('Integrity verification completed', {
                verificationId,
                tenantId: job.tenantId,
                isValid: result.isValid,
                violations: result.violations.length,
                duration: result.duration
            });

        } catch (error) {
            // Update job with error
            await this.verificationJobsCollection.updateOne(
                { verificationId },
                {
                    $set: {
                        status: 'failed',
                        error: error instanceof Error ? error.message : 'Unknown error',
                        updatedAt: new Date(),
                    }
                }
            );

            logger.error('Integrity verification failed', { verificationId, error });
            throw error;
        }
    }

    /**
     * Perform integrity verification
     */
    private async performIntegrityVerification(
        tenantId: string,
        startSequence?: number,
        endSequence?: number
    ): Promise<IntegrityVerificationResult> {
        const violations: IntegrityViolation[] = [];

        // Build query
        const query: any = { tenantId };
        if (startSequence !== undefined || endSequence !== undefined) {
            query.sequenceNumber = {};
            if (startSequence !== undefined) query.sequenceNumber.$gte = startSequence;
            if (endSequence !== undefined) query.sequenceNumber.$lte = endSequence;
        }

        // Get logs in sequence order
        const logs = await this.auditLogsCollection
            .find(query)
            .sort({ sequenceNumber: 1 })
            .toArray();

        let verifiedLogs = 0;
        let previousHash = '';
        let expectedSequence = startSequence || 1;

        for (const log of logs) {
            // Check sequence continuity
            if (log.sequenceNumber !== expectedSequence) {
                violations.push({
                    logId: log.logId,
                    sequenceNumber: log.sequenceNumber,
                    violationType: 'sequence_gap',
                    expectedValue: expectedSequence.toString(),
                    actualValue: log.sequenceNumber.toString(),
                    description: `Expected sequence ${expectedSequence}, found ${log.sequenceNumber}`
                });
            }

            // Check previous hash
            if (log.previousHash !== previousHash) {
                violations.push({
                    logId: log.logId,
                    sequenceNumber: log.sequenceNumber,
                    violationType: 'missing_previous_hash',
                    expectedValue: previousHash,
                    actualValue: log.previousHash,
                    description: 'Previous hash mismatch in chain'
                });
            }

            // Verify current hash
            const expectedHash = this.hashChainService.computeLogHash(log as any, log.previousHash);
            if (log.currentHash !== expectedHash) {
                violations.push({
                    logId: log.logId,
                    sequenceNumber: log.sequenceNumber,
                    violationType: 'hash_mismatch',
                    expectedValue: expectedHash,
                    actualValue: log.currentHash,
                    description: 'Computed hash does not match stored hash'
                });
            } else {
                verifiedLogs++;
            }

            // Check timestamp anomalies (logs should be roughly chronological)
            if (logs.indexOf(log) > 0) {
                const previousLog = logs[logs.indexOf(log) - 1];
                if (log.timestamp < previousLog.timestamp) {
                    violations.push({
                        logId: log.logId,
                        sequenceNumber: log.sequenceNumber,
                        violationType: 'timestamp_anomaly',
                        description: 'Log timestamp is earlier than previous log'
                    });
                }
            }

            previousHash = log.currentHash;
            expectedSequence = log.sequenceNumber + 1;
        }

        return {
            verificationId: '', // Will be set by caller
            tenantId,
            startSequence: startSequence || (logs.length > 0 ? logs[0].sequenceNumber : 0),
            endSequence: endSequence || (logs.length > 0 ? logs[logs.length - 1].sequenceNumber : 0),
            totalLogs: logs.length,
            verifiedLogs,
            isValid: violations.length === 0,
            violations,
            startedAt: new Date(), // Will be set by caller
            completedAt: new Date(), // Will be set by caller
            duration: 0 // Will be set by caller
        };
    }

    /**
     * Log integrity violations
     */
    private async logIntegrityViolations(
        violations: IntegrityViolation[],
        tenantId: string
    ): Promise<void> {
        const violationLogsCollection = this.db.collection('integrity_violations');

        const violationDocs = violations.map(violation => ({
            ...violation,
            tenantId,
            detectedAt: new Date(),
            resolved: false
        }));

        await violationLogsCollection.insertMany(violationDocs);

        logger.warn('Integrity violations detected and logged', {
            tenantId,
            violationCount: violations.length,
            violationTypes: [...new Set(violations.map(v => v.violationType))]
        });
    }

    /**
     * Get integrity statistics
     */
    async getIntegrityStatistics(tenantId: string): Promise<{
        totalVerifications: number;
        successfulVerifications: number;
        failedVerifications: number;
        totalViolations: number;
        violationsByType: Record<string, number>;
        lastVerification?: Date;
        chainHealth: 'healthy' | 'warning' | 'critical';
    }> {
        const [verificationStats, violationStats] = await Promise.all([
            this.getVerificationStatistics(tenantId),
            this.getViolationStatistics(tenantId)
        ]);

        // Determine chain health
        let chainHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (violationStats.totalViolations > 0) {
            chainHealth = violationStats.totalViolations > 10 ? 'critical' : 'warning';
        }

        return {
            ...verificationStats,
            ...violationStats,
            chainHealth
        };
    }

    /**
     * Schedule periodic verification
     */
    async schedulePeriodicVerification(
        tenantId: string,
        intervalHours: number = 24
    ): Promise<void> {
        // This would integrate with a job scheduler like node-cron
        // For now, just log the scheduling request
        logger.info('Periodic verification scheduled', {
            tenantId,
            intervalHours
        });

        // In a real implementation, you would:
        // 1. Store the schedule in a database
        // 2. Use a job scheduler to run verifications
        // 3. Handle schedule updates and cancellations
    }

    /**
     * Private helper methods
     */

    private async getVerificationStatistics(tenantId: string): Promise<{
        totalVerifications: number;
        successfulVerifications: number;
        failedVerifications: number;
        lastVerification?: Date;
    }> {
        const pipeline = [
            { $match: { tenantId } },
            {
                $group: {
                    _id: null,
                    totalVerifications: { $sum: 1 },
                    successfulVerifications: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    failedVerifications: {
                        $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                    },
                    lastVerification: { $max: '$createdAt' }
                }
            }
        ];

        const result = await this.verificationJobsCollection.aggregate(pipeline).toArray();

        return result.length > 0 ? (result[0] as any) : {
            totalVerifications: 0,
            successfulVerifications: 0,
            failedVerifications: 0
        };
    }

    private async getViolationStatistics(tenantId: string): Promise<{
        totalViolations: number;
        violationsByType: Record<string, number>;
    }> {
        const violationLogsCollection = this.db.collection('integrity_violations');

        const pipeline = [
            { $match: { tenantId } },
            {
                $group: {
                    _id: '$violationType',
                    count: { $sum: 1 }
                }
            }
        ];

        const results = await violationLogsCollection.aggregate(pipeline).toArray();

        const violationsByType: Record<string, number> = {};
        let totalViolations = 0;

        for (const result of results) {
            violationsByType[result._id] = result.count;
            totalViolations += result.count;
        }

        return {
            totalViolations,
            violationsByType
        };
    }
}