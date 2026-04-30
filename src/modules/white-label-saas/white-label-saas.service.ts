import crypto from 'crypto';
import Tenant, { SaaSUsageMetric, SaaSBilling, SaaSApiKey } from './white-label-saas.model';
import logger from '@/shared/utils/logger.util';

class WhiteLabelService {
    async getTenants() {
        return await Tenant.find().lean();
    }

    async createTenant(data: any) {
        const tenant = new Tenant(data);
        await tenant.save();
        logger.info(`Tenant created: ${tenant._id}`);
        return tenant;
    }

    async getTenantById(tenantId: string) {
        const tenant = await Tenant.findById(tenantId).lean();
        if (!tenant) throw new Error('Tenant not found');
        return tenant;
    }

    async updateTenant(tenantId: string, data: any) {
        const tenant = await Tenant.findByIdAndUpdate(tenantId, data, { new: true });
        if (!tenant) throw new Error('Tenant not found');
        logger.info(`Tenant updated: ${tenantId}`);
        return tenant;
    }

    async deleteTenant(tenantId: string) {
        await Tenant.findByIdAndDelete(tenantId);
        logger.info(`Tenant deleted: ${tenantId}`);
    }

    async getBranding(tenantId: string) {
        const tenant = await Tenant.findById(tenantId).lean();
        return tenant?.branding || {};
    }

    async updateBranding(tenantId: string, branding: any) {
        const tenant = await Tenant.findByIdAndUpdate(tenantId, { branding }, { new: true });
        logger.info(`Branding updated for tenant: ${tenantId}`);
        return tenant?.branding;
    }

    async getUsageMetrics(tenantId: string) {
        try {
            const metrics = await SaaSUsageMetric.find({ tenantId })
                .sort({ createdAt: -1 })
                .lean();
            return metrics;
        } catch (error) {
            logger.error(`Failed to get usage metrics for tenant ${tenantId}: ${error}`);
            throw error;
        }
    }

    async getBillingInfo(tenantId: string) {
        try {
            const billing = await SaaSBilling.findOne({ tenantId }).lean();
            if (!billing) throw new Error('Billing info not found for tenant');
            return billing;
        } catch (error) {
            logger.error(`Failed to get billing info for tenant ${tenantId}: ${error}`);
            throw error;
        }
    }

    async updateBillingInfo(tenantId: string, data: any) {
        try {
            const billing = await SaaSBilling.findOneAndUpdate(
                { tenantId },
                { $set: data },
                { new: true, upsert: true },
            );
            logger.info(`Billing info updated for tenant: ${tenantId}`);
            return billing;
        } catch (error) {
            logger.error(`Failed to update billing info for tenant ${tenantId}: ${error}`);
            throw error;
        }
    }

    async getApiKeys(tenantId: string) {
        try {
            const keys = await SaaSApiKey.find({ tenantId, isActive: true })
                .select('-key')
                .sort({ createdAt: -1 })
                .lean();
            return keys;
        } catch (error) {
            logger.error(`Failed to get API keys for tenant ${tenantId}: ${error}`);
            throw error;
        }
    }

    async generateApiKey(tenantId: string, name?: string) {
        try {
            const key = `sk_${crypto.randomBytes(32).toString('hex')}`;
            const apiKey = new SaaSApiKey({
                tenantId,
                key,
                name: name || 'Default API Key',
                permissions: ['read'],
                isActive: true,
            });
            await apiKey.save();
            logger.info(`API key generated for tenant: ${tenantId}`);
            return apiKey;
        } catch (error) {
            logger.error(`Failed to generate API key for tenant ${tenantId}: ${error}`);
            throw error;
        }
    }

    async revokeApiKey(keyId: string) {
        try {
            const apiKey = await SaaSApiKey.findByIdAndUpdate(
                keyId,
                { isActive: false },
                { new: true },
            );
            if (!apiKey) throw new Error('API key not found');
            logger.info(`API key revoked: ${keyId}`);
            return apiKey;
        } catch (error) {
            logger.error(`Failed to revoke API key ${keyId}: ${error}`);
            throw error;
        }
    }
}

export default new WhiteLabelService();
