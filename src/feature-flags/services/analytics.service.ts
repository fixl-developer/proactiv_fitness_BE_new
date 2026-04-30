import { Db } from 'mongodb';
import { FlagEvaluation, Environment } from '../interfaces';
import logger from '../../shared/utils/logger.util';

export interface FlagAnalytics {
    flagKey: string;
    tenantId: string | null;
    environment: Environment;
    totalEvaluations: number;
    uniqueUsers: number;
    trueEvaluations: number;
    falseEvaluations: number;
    conversionRate: number;
    lastEvaluatedAt: Date;
    evaluationsByDay: Array<{
        date: string;
        evaluations: number;
        uniqueUsers: number;
    }>;
    evaluationsByVariant?: Array<{
        variant: string;
        evaluations: number;
        percentage: number;
    }>;
}

export interface TenantAnalytics {
    tenantId: string | null;
    environment: Environment;
    totalFlags: number;
    activeFlags: number;
    totalEvaluations: number;
    uniqueUsers: number;
    topFlags: Array<{
        flagKey: string;
        evaluations: number;
    }>;
    evaluationTrends: Array<{
        date: string;
        evaluations: number;
    }>;
}

/**
 * Analytics Service for Feature Flags
 */
export class AnalyticsService {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    /**
     * Record a flag evaluation
     */
    async recordEvaluation(
        flagKey: string,
        evaluation: FlagEvaluation,
        context: {
            tenantId: string;
            environment: Environment;
            userId?: string;
            sessionId?: string;
        }
    ): Promise<void> {
        try {
            const evaluationRecord = {
                flagKey,
                tenantId: context.tenantId,
                environment: context.environment,
                userId: context.userId,
                sessionId: context.sessionId,
                value: evaluation.value,
                variant: evaluation.variant,
                reason: evaluation.reason,
                ruleId: evaluation.ruleId,
                timestamp: new Date(),
                evaluationTime: evaluation.evaluationTime
            };

            await this.db.collection('flag_evaluations').insertOne(evaluationRecord);

            // Update daily aggregates
            await this.updateDailyAggregates(flagKey, context.tenantId, context.environment, context.userId);
        } catch (error) {
            logger.error('Failed to record flag evaluation:', error);
        }
    }

    /**
     * Get analytics for a specific flag
     */
    async getFlagAnalytics(
        flagKey: string,
        tenantId: string | null,
        environment: Environment,
        days: number = 30
    ): Promise<FlagAnalytics> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const pipeline = [
            {
                $match: {
                    flagKey,
                    tenantId,
                    environment,
                    timestamp: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalEvaluations: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$userId' },
                    trueEvaluations: {
                        $sum: {
                            $cond: [{ $eq: ['$value', true] }, 1, 0]
                        }
                    },
                    falseEvaluations: {
                        $sum: {
                            $cond: [{ $eq: ['$value', false] }, 1, 0]
                        }
                    },
                    lastEvaluatedAt: { $max: '$timestamp' },
                    variants: { $push: '$variant' }
                }
            }
        ];

        const [result] = await this.db.collection('flag_evaluations').aggregate(pipeline).toArray();

        if (!result) {
            return {
                flagKey,
                tenantId,
                environment,
                totalEvaluations: 0,
                uniqueUsers: 0,
                trueEvaluations: 0,
                falseEvaluations: 0,
                conversionRate: 0,
                lastEvaluatedAt: new Date(),
                evaluationsByDay: [],
                evaluationsByVariant: []
            };
        }

        const uniqueUsers = result.uniqueUsers.filter((u: any) => u != null).length;
        const conversionRate = result.totalEvaluations > 0
            ? (result.trueEvaluations / result.totalEvaluations) * 100
            : 0;

        // Get daily breakdown
        const evaluationsByDay = await this.getDailyEvaluations(flagKey, tenantId, environment, days);

        // Get variant breakdown
        const evaluationsByVariant = await this.getVariantBreakdown(flagKey, tenantId, environment, days);

        return {
            flagKey,
            tenantId,
            environment,
            totalEvaluations: result.totalEvaluations,
            uniqueUsers,
            trueEvaluations: result.trueEvaluations,
            falseEvaluations: result.falseEvaluations,
            conversionRate: Math.round(conversionRate * 100) / 100,
            lastEvaluatedAt: result.lastEvaluatedAt,
            evaluationsByDay,
            evaluationsByVariant
        };
    }

    /**
     * Get analytics for a tenant
     */
    async getTenantAnalytics(
        tenantId: string | null,
        environment: Environment,
        days: number = 30
    ): Promise<TenantAnalytics> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get flag counts
        const flagStats = await this.db.collection('feature_flags').aggregate([
            {
                $match: { tenantId, environment }
            },
            {
                $group: {
                    _id: null,
                    totalFlags: { $sum: 1 },
                    activeFlags: {
                        $sum: {
                            $cond: [{ $eq: ['$isEnabled', true] }, 1, 0]
                        }
                    }
                }
            }
        ]).toArray();

        // Get evaluation stats
        const evaluationStats = await this.db.collection('flag_evaluations').aggregate([
            {
                $match: {
                    tenantId,
                    environment,
                    timestamp: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalEvaluations: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$userId' }
                }
            }
        ]).toArray();

        // Get top flags
        const topFlags = await this.db.collection('flag_evaluations').aggregate([
            {
                $match: {
                    tenantId,
                    environment,
                    timestamp: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$flagKey',
                    evaluations: { $sum: 1 }
                }
            },
            {
                $sort: { evaluations: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    flagKey: '$_id',
                    evaluations: 1,
                    _id: 0
                }
            }
        ]).toArray();

        // Get evaluation trends
        const evaluationTrends = await this.getDailyEvaluationTrends(tenantId, environment, days);

        const flagStatsResult = flagStats[0] || { totalFlags: 0, activeFlags: 0 };
        const evaluationStatsResult = evaluationStats[0] || { totalEvaluations: 0, uniqueUsers: [] };

        return {
            tenantId,
            environment,
            totalFlags: flagStatsResult.totalFlags,
            activeFlags: flagStatsResult.activeFlags,
            totalEvaluations: evaluationStatsResult.totalEvaluations,
            uniqueUsers: evaluationStatsResult.uniqueUsers.filter((u: any) => u != null).length,
            topFlags: topFlags as Array<{ flagKey: string; evaluations: number }>,
            evaluationTrends
        };
    }

    /**
     * Clean up old evaluation records
     */
    async cleanupOldRecords(retentionDays: number = 90): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const result = await this.db.collection('flag_evaluations').deleteMany({
            timestamp: { $lt: cutoffDate }
        });

        logger.info(`Cleaned up ${result.deletedCount} old evaluation records`);
        return result.deletedCount;
    }

    /**
     * Private helper methods
     */

    private async updateDailyAggregates(
        flagKey: string,
        tenantId: string | null,
        environment: Environment,
        userId?: string
    ): Promise<void> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const update = {
            $inc: { evaluations: 1 },
            $addToSet: userId ? { uniqueUsers: userId } : {}
        };

        if (!userId) {
            delete update.$addToSet;
        }

        await this.db.collection('flag_daily_stats').updateOne(
            {
                flagKey,
                tenantId,
                environment,
                date: today
            },
            update,
            { upsert: true }
        );
    }

    private async getDailyEvaluations(
        flagKey: string,
        tenantId: string | null,
        environment: Environment,
        days: number
    ): Promise<Array<{ date: string; evaluations: number; uniqueUsers: number }>> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const results = await this.db.collection('flag_daily_stats').find({
            flagKey,
            tenantId,
            environment,
            date: { $gte: startDate }
        }).sort({ date: 1 }).toArray();

        return results.map(r => ({
            date: r.date.toISOString().split('T')[0],
            evaluations: r.evaluations || 0,
            uniqueUsers: (r.uniqueUsers || []).length
        }));
    }

    private async getVariantBreakdown(
        flagKey: string,
        tenantId: string | null,
        environment: Environment,
        days: number
    ): Promise<Array<{ variant: string; evaluations: number; percentage: number }>> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const results = await this.db.collection('flag_evaluations').aggregate([
            {
                $match: {
                    flagKey,
                    tenantId,
                    environment,
                    timestamp: { $gte: startDate },
                    variant: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$variant',
                    evaluations: { $sum: 1 }
                }
            },
            {
                $sort: { evaluations: -1 }
            }
        ]).toArray();

        const totalEvaluations = results.reduce((sum, r) => sum + r.evaluations, 0);

        return results.map(r => ({
            variant: r._id,
            evaluations: r.evaluations,
            percentage: totalEvaluations > 0
                ? Math.round((r.evaluations / totalEvaluations) * 10000) / 100
                : 0
        }));
    }

    private async getDailyEvaluationTrends(
        tenantId: string | null,
        environment: Environment,
        days: number
    ): Promise<Array<{ date: string; evaluations: number }>> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const results = await this.db.collection('flag_evaluations').aggregate([
            {
                $match: {
                    tenantId,
                    environment,
                    timestamp: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$timestamp'
                        }
                    },
                    evaluations: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]).toArray();

        return results.map(r => ({
            date: r._id,
            evaluations: r.evaluations
        }));
    }
}