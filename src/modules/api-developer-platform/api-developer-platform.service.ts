import * as crypto from 'crypto';
import {
    APIKeyModel,
    OAuthAppModel,
    WebhookModel,
    ApiUsageLogModel,
} from './api-developer-platform.model';
import logger from '@/shared/utils/logger.util';

class ApiDeveloperService {
    // ── API Docs & Endpoints ─────────────────────────────────────────────

    async getApiDocs() {
        try {
            const totalKeys = await APIKeyModel.countDocuments({ isDeleted: { $ne: true } });
            const totalApps = await OAuthAppModel.countDocuments({ isDeleted: { $ne: true } });
            const totalWebhooks = await WebhookModel.countDocuments({ isDeleted: { $ne: true } });

            return {
                title: 'Proactiv Fitness API',
                version: '1.0.0',
                description: 'Complete API documentation for Proactiv Fitness platform',
                stats: {
                    totalApiKeys: totalKeys,
                    totalOAuthApps: totalApps,
                    totalWebhooks: totalWebhooks,
                },
            };
        } catch (error) {
            logger.error('Error fetching API docs', error);
            throw error;
        }
    }

    async getApiEndpoints() {
        try {
            const logs = await ApiUsageLogModel.aggregate([
                {
                    $group: {
                        _id: { endpoint: '$endpoint', method: '$method' },
                        totalRequests: { $sum: 1 },
                        avgResponseTime: { $avg: '$responseTime' },
                        lastUsed: { $max: '$timestamp' },
                    },
                },
                { $sort: { totalRequests: -1 } },
            ]);

            return logs.map((log) => ({
                path: log._id.endpoint,
                method: log._id.method,
                totalRequests: log.totalRequests,
                avgResponseTime: Math.round(log.avgResponseTime),
                lastUsed: log.lastUsed,
            }));
        } catch (error) {
            logger.error('Error fetching API endpoints', error);
            throw error;
        }
    }

    async getApiEndpointById(endpointId: string) {
        try {
            const logs = await ApiUsageLogModel.aggregate([
                { $match: { endpoint: endpointId } },
                {
                    $group: {
                        _id: { endpoint: '$endpoint', method: '$method' },
                        totalRequests: { $sum: 1 },
                        avgResponseTime: { $avg: '$responseTime' },
                        successCount: {
                            $sum: { $cond: [{ $lt: ['$statusCode', 400] }, 1, 0] },
                        },
                        errorCount: {
                            $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] },
                        },
                        lastUsed: { $max: '$timestamp' },
                    },
                },
            ]);

            if (!logs.length) {
                return null;
            }

            const log = logs[0];
            return {
                path: log._id.endpoint,
                method: log._id.method,
                totalRequests: log.totalRequests,
                avgResponseTime: Math.round(log.avgResponseTime),
                successCount: log.successCount,
                errorCount: log.errorCount,
                successRate: log.totalRequests
                    ? Number(((log.successCount / log.totalRequests) * 100).toFixed(2))
                    : 0,
                lastUsed: log.lastUsed,
            };
        } catch (error) {
            logger.error(`Error fetching endpoint ${endpointId}`, error);
            throw error;
        }
    }

    // ── API Keys ─────────────────────────────────────────────────────────

    async getApiKeys(userId: string) {
        try {
            return await APIKeyModel.find({ tenantId: userId, isDeleted: { $ne: true } }).lean();
        } catch (error) {
            logger.error(`Error fetching API keys for user ${userId}`, error);
            throw error;
        }
    }

    async generateApiKey(userId: string, data: any) {
        try {
            const keyId = crypto.randomBytes(16).toString('hex');
            const key = `sk_${crypto.randomBytes(24).toString('hex')}`;
            const secret = crypto.randomBytes(32).toString('hex');

            const apiKey = new APIKeyModel({
                keyId,
                tenantId: userId,
                name: data.name,
                key,
                secret,
                permissions: data.permissions || [],
                rateLimit: data.rateLimit || 1000,
            });

            await apiKey.save();
            logger.info(`API key generated for user ${userId}`);
            return apiKey;
        } catch (error) {
            logger.error(`Error generating API key for user ${userId}`, error);
            throw error;
        }
    }

    async revokeApiKey(keyId: string) {
        try {
            const apiKey = await APIKeyModel.findOneAndUpdate(
                { keyId, isDeleted: { $ne: true } },
                { status: 'revoked', isDeleted: true, deletedAt: new Date() },
                { new: true },
            );

            if (!apiKey) {
                throw new Error(`API key not found: ${keyId}`);
            }

            logger.info(`API key revoked: ${keyId}`);
            return apiKey;
        } catch (error) {
            logger.error(`Error revoking API key ${keyId}`, error);
            throw error;
        }
    }

    // ── OAuth Apps ───────────────────────────────────────────────────────

    async getOAuthApps(userId: string) {
        try {
            return await OAuthAppModel.find({ userId, isDeleted: { $ne: true } }).lean();
        } catch (error) {
            logger.error(`Error fetching OAuth apps for user ${userId}`, error);
            throw error;
        }
    }

    async createOAuthApp(userId: string, data: any) {
        try {
            const clientId = `client_${crypto.randomBytes(16).toString('hex')}`;
            const clientSecret = `secret_${crypto.randomBytes(32).toString('hex')}`;

            const oauthApp = new OAuthAppModel({
                name: data.name,
                clientId,
                clientSecret,
                redirectUri: data.redirectUri,
                scopes: data.scopes || [],
                userId,
                isActive: true,
            });

            await oauthApp.save();
            logger.info(`OAuth app created for user ${userId}: ${oauthApp.name}`);
            return oauthApp;
        } catch (error) {
            logger.error(`Error creating OAuth app for user ${userId}`, error);
            throw error;
        }
    }

    async updateOAuthApp(appId: string, data: any) {
        try {
            const oauthApp = await OAuthAppModel.findOneAndUpdate(
                { _id: appId, isDeleted: { $ne: true } },
                { $set: data },
                { new: true },
            );

            if (!oauthApp) {
                throw new Error(`OAuth app not found: ${appId}`);
            }

            logger.info(`OAuth app updated: ${appId}`);
            return oauthApp;
        } catch (error) {
            logger.error(`Error updating OAuth app ${appId}`, error);
            throw error;
        }
    }

    async deleteOAuthApp(appId: string) {
        try {
            const oauthApp = await OAuthAppModel.findOneAndUpdate(
                { _id: appId, isDeleted: { $ne: true } },
                { isDeleted: true, deletedAt: new Date(), isActive: false },
                { new: true },
            );

            if (!oauthApp) {
                throw new Error(`OAuth app not found: ${appId}`);
            }

            logger.info(`OAuth app deleted: ${appId}`);
            return oauthApp;
        } catch (error) {
            logger.error(`Error deleting OAuth app ${appId}`, error);
            throw error;
        }
    }

    // ── Webhooks ─────────────────────────────────────────────────────────

    async getWebhooks(userId: string) {
        try {
            return await WebhookModel.find({ userId, isDeleted: { $ne: true } }).lean();
        } catch (error) {
            logger.error(`Error fetching webhooks for user ${userId}`, error);
            throw error;
        }
    }

    async createWebhook(userId: string, data: any) {
        try {
            const secret = crypto.randomBytes(32).toString('hex');

            const webhook = new WebhookModel({
                url: data.url,
                events: data.events || [],
                secret,
                userId,
                isActive: true,
                failCount: 0,
            });

            await webhook.save();
            logger.info(`Webhook created for user ${userId}: ${webhook.url}`);
            return webhook;
        } catch (error) {
            logger.error(`Error creating webhook for user ${userId}`, error);
            throw error;
        }
    }

    async updateWebhook(webhookId: string, data: any) {
        try {
            const webhook = await WebhookModel.findOneAndUpdate(
                { _id: webhookId, isDeleted: { $ne: true } },
                { $set: data },
                { new: true },
            );

            if (!webhook) {
                throw new Error(`Webhook not found: ${webhookId}`);
            }

            logger.info(`Webhook updated: ${webhookId}`);
            return webhook;
        } catch (error) {
            logger.error(`Error updating webhook ${webhookId}`, error);
            throw error;
        }
    }

    async deleteWebhook(webhookId: string) {
        try {
            const webhook = await WebhookModel.findOneAndUpdate(
                { _id: webhookId, isDeleted: { $ne: true } },
                { isDeleted: true, deletedAt: new Date(), isActive: false },
                { new: true },
            );

            if (!webhook) {
                throw new Error(`Webhook not found: ${webhookId}`);
            }

            logger.info(`Webhook deleted: ${webhookId}`);
            return webhook;
        } catch (error) {
            logger.error(`Error deleting webhook ${webhookId}`, error);
            throw error;
        }
    }

    // ── Analytics & Rate Limits ──────────────────────────────────────────

    async getApiAnalytics(userId: string) {
        try {
            const apps = await OAuthAppModel.find({ userId, isDeleted: { $ne: true } }).select('_id');
            const appIds = apps.map((app) => app._id);

            const [totals, topEndpoints] = await Promise.all([
                ApiUsageLogModel.aggregate([
                    { $match: { $or: [{ userId }, { appId: { $in: appIds } }] } },
                    {
                        $group: {
                            _id: null,
                            totalRequests: { $sum: 1 },
                            avgResponseTime: { $avg: '$responseTime' },
                            successCount: {
                                $sum: { $cond: [{ $lt: ['$statusCode', 400] }, 1, 0] },
                            },
                        },
                    },
                ]),
                ApiUsageLogModel.aggregate([
                    { $match: { $or: [{ userId }, { appId: { $in: appIds } }] } },
                    {
                        $group: {
                            _id: '$endpoint',
                            totalRequests: { $sum: 1 },
                            avgResponseTime: { $avg: '$responseTime' },
                        },
                    },
                    { $sort: { totalRequests: -1 } },
                    { $limit: 10 },
                ]),
            ]);

            const stats = totals[0] || { totalRequests: 0, avgResponseTime: 0, successCount: 0 };
            const successRate = stats.totalRequests
                ? Number(((stats.successCount / stats.totalRequests) * 100).toFixed(2))
                : 0;

            return {
                totalRequests: stats.totalRequests,
                successRate,
                averageResponseTime: Math.round(stats.avgResponseTime || 0),
                topEndpoints: topEndpoints.map((ep) => ({
                    endpoint: ep._id,
                    totalRequests: ep.totalRequests,
                    avgResponseTime: Math.round(ep.avgResponseTime),
                })),
            };
        } catch (error) {
            logger.error(`Error fetching analytics for user ${userId}`, error);
            throw error;
        }
    }

    async getRateLimits(userId: string) {
        try {
            const now = new Date();
            const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const apiKey = await APIKeyModel.findOne({
                tenantId: userId,
                isDeleted: { $ne: true },
                status: 'active',
            }).lean();

            const requestsPerMinuteLimit = apiKey?.rateLimit || 1000;
            const requestsPerDayLimit = requestsPerMinuteLimit * 60 * 24;

            const [minuteCount, dayCount] = await Promise.all([
                ApiUsageLogModel.countDocuments({
                    userId,
                    timestamp: { $gte: oneMinuteAgo },
                }),
                ApiUsageLogModel.countDocuments({
                    userId,
                    timestamp: { $gte: oneDayAgo },
                }),
            ]);

            return {
                requestsPerMinute: requestsPerMinuteLimit,
                requestsPerDay: requestsPerDayLimit,
                currentUsagePerMinute: minuteCount,
                currentUsagePerDay: dayCount,
            };
        } catch (error) {
            logger.error(`Error fetching rate limits for user ${userId}`, error);
            throw error;
        }
    }

    // ── Controller-compatible aliases (used by routes) ───────────────────

    async createAPIKey(data: { tenantId: string; name: string; permissions?: string[]; rateLimit?: number }) {
        return this.generateApiKey(data.tenantId, data);
    }

    async getAPIKeys(tenantId: string) {
        return this.getApiKeys(tenantId);
    }

    async revokeAPIKey(keyId: string) {
        return this.revokeApiKey(keyId);
    }
}

export default new ApiDeveloperService();
