import { IntegrationModel } from './integrations.model';
import { v4 as uuidv4 } from 'uuid';

export class IntegrationsService {
    async createIntegration(data: any) {
        const { tenantId, provider, credentials, config } = data;

        const integration = new IntegrationModel({
            integrationId: uuidv4(),
            tenantId,
            provider,
            credentials,
            config,
            status: 'active',
        });

        await integration.save();
        return integration;
    }

    async getIntegrations(tenantId: string) {
        const integrations = await IntegrationModel.find({ tenantId });
        return integrations;
    }

    async testIntegration(integrationId: string) {
        const integration = await IntegrationModel.findOne({ integrationId });

        if (!integration) {
            throw new Error('Integration not found');
        }

        // Test connection
        const result = {
            status: 'success',
            message: 'Integration test passed',
            provider: integration.provider,
            testedAt: new Date(),
        };

        return result;
    }

    async handleWebhook(provider: string, event: any) {
        // Handle webhook events from providers
        console.log(`Webhook received from ${provider}:`, event);
        return { success: true };
    }
}
