import { createHash } from 'crypto';
import { Db } from 'mongodb';
import { AuditLog } from '../interfaces';
import logger from '../../../shared/utils/logger.util';

/**
 * Hash Chain Service for maintaining audit log integrity
 */
export class HashChainService {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    /**
     * Compute hash for an audit log entry
     */
    computeLogHash(log: Partial<AuditLog>, previousHash: string): string {
        const hashInput = [
            log.tenantId,
            log.logId,
            log.timestamp?.toISOString(),
            log.actorId,
            log.actionType,
            JSON.stringify(log.context || {}),
            previousHash,
        ].join('|');

        return createHash('sha256').update(hashInput).digest('hex');
    }

    /**
     * Get the latest hash for a tenant
     */
    async getLatestHash(tenantId: string): Promise<string> {
        const collection = this.db.collection('audit_logs');

        const latestLog = await collection
            .findOne(
                { tenantId },
                {
                    sort: { sequenceNumber: -1 },
                    projection: { currentHash: 1 }
                }
            );

        return latestLog?.currentHash || '';
    }

    /**
     * Get the next sequence number for a tenant
     */
    async getNextSequenceNumber(tenantId: string): Promise<number> {
        const collection = this.db.collection('audit_logs');

        const latestLog = await collection
            .findOne(
                { tenantId },
                {
                    sort: { sequenceNumber: -1 },
                    projection: { sequenceNumber: 1 }
                }
            );

        return (latestLog?.sequenceNumber || 0) + 1;
    }

    /**
     * Verify hash chain integrity for a range of logs
     */
    async verifyChain(
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
        const collection = this.db.collection('audit_logs');

        const filter: any = { tenantId };
        if (startSequence !== undefined) {
            filter.sequenceNumber = { $gte: startSequence };
        }
        if (endSequence !== undefined) {
            filter.sequenceNumber = { ...filter.sequenceNumber, $lte: endSequence };
        }

        const logs = await collection
            .find(filter)
            .sort({ sequenceNumber: 1 })
            .toArray();

        const breaks: any[] = [];
        let previousHash = '';
        let verifiedLogs = 0;

        for (const log of logs) {
            const expectedHash = this.computeLogHash(log, previousHash);

            if (expectedHash === log.currentHash) {
                verifiedLogs++;
            } else {
                breaks.push({
                    logId: log.logId,
                    sequenceNumber: log.sequenceNumber,
                    expectedHash,
                    actualHash: log.currentHash,
                });
            }

            previousHash = log.currentHash;
        }

        const verified = breaks.length === 0;

        logger.info('Hash chain verification completed', {
            tenantId,
            totalLogs: logs.length,
            verifiedLogs,
            breaks: breaks.length,
            verified,
        });

        return {
            verified,
            totalLogs: logs.length,
            verifiedLogs,
            breaks,
        };
    }

    /**
     * Verify a single log's hash
     */
    verifyLogHash(log: AuditLog, previousHash: string): boolean {
        const expectedHash = this.computeLogHash(log, previousHash);
        return expectedHash === log.currentHash;
    }

    /**
     * Generate hash chain for a batch of logs
     */
    generateHashChain(
        logs: Partial<AuditLog>[],
        initialPreviousHash: string
    ): Array<{ log: Partial<AuditLog>; hash: string }> {
        const result: Array<{ log: Partial<AuditLog>; hash: string }> = [];
        let previousHash = initialPreviousHash;

        for (const log of logs) {
            const hash = this.computeLogHash(log, previousHash);
            result.push({ log, hash });
            previousHash = hash;
        }

        return result;
    }
}