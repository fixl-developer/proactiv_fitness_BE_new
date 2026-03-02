import { Integration, IntegrationLog, Webhook } from './integration.model';
import { ICreateIntegrationRequest, IUpdateIntegrationRequest, IIntegrationCallRequest, IWebhookRequest } from './integration.interface';
import { AppError } from '../../shared/utils/app-error.util';
import { v4 as uuidv4 } from 'uuid';

export class IntegrationService {
    // Integration Management
    async createIntegration(data: ICreateIntegrationRequest, userId: string): Promise<any> {
        const integrationId = uuidv4();

        const integration = new Integration({
            integrationId,
            integrationType: data.integrationType,
            provider: data.provider,
            name: data.name,
            description: data.description,
            config: data.config,
            businessUnitId: 'bu-001',
            createdBy: userId
        });

        const savedIntegration = await integration.save();

        // Perform initial health check
        await this.performHealthCheck(integrationId);

        return savedIntegration;
    }

    async getIntegrations(filters: any): Promise<any[]> {
        const query: any = {};

        if (filters.integrationType) query.integrationType = filters.integrationType;
        if (filters.provider) query.provider = filters.provider;
        if (filters.status) query.status = filters.status;

        return await Integration.find(query).sort({ createdAt: -1 });
    }

    async getIntegration(integrationId: string): Promise<any> {
        const integration = await Integration.findOne({ integrationId });

        if (!integration) {
            throw new AppError('Integration not found', 404);
        }

        return integration;
    }

    async updateIntegration(integrationId: string, data: IUpdateIntegrationRequest): Promise<any> {
        const integration = await Integration.findOne({ integrationId });

        if (!integration) {
            throw new AppError('Integration not found', 404);
        }

        return await Integration.findOneAndUpdate(
            { integrationId },
            { ...data, updatedAt: new Date() },
            { new: true }
        );
    }

    async deleteIntegration(integrationId: string): Promise<void> {
        const integration = await Integration.findOne({ integrationId });

        if (!integration) {
            throw new AppError('Integration not found', 404);
        }

        await Integration.findOneAndUpdate(
            { integrationId },
            { status: 'inactive', updatedAt: new Date() }
        );
    }

    // Integration Calls
    async callIntegration(data: IIntegrationCallRequest): Promise<any> {
        const integration = await Integration.findOne({ integrationId: data.integrationId });

        if (!integration) {
            throw new AppError('Integration not found', 404);
        }

        if (integration.status !== 'active') {
            throw new AppError('Integration is not active', 400);
        }

        const startTime = Date.now();
        let response: any;
        let success = false;

        try {
            // Simulate API call based on integration type
            response = await this.executeIntegrationCall(integration, data.action, data.payload);
            success = true;

            // Update usage stats
            await Integration.findOneAndUpdate(
                { integrationId: data.integrationId },
                {
                    $inc: { 'usage.totalCalls': 1, 'usage.successfulCalls': 1 },
                    'usage.lastUsed': new Date()
                }
            );
        } catch (error: any) {
            response = { error: error.message };

            // Update usage stats
            await Integration.findOneAndUpdate(
                { integrationId: data.integrationId },
                {
                    $inc: { 'usage.totalCalls': 1, 'usage.failedCalls': 1 },
                    'usage.lastUsed': new Date()
                }
            );
        }

        const duration = Date.now() - startTime;

        // Log the call
        await this.logIntegrationCall(
            data.integrationId,
            integration.integrationType,
            integration.provider,
            data.action,
            data.payload,
            response,
            duration,
            success
        );

        return response;
    }

    // Health Check
    async performHealthCheck(integrationId: string): Promise<any> {
        const integration = await Integration.findOne({ integrationId });

        if (!integration) {
            throw new AppError('Integration not found', 404);
        }

        let isHealthy = false;
        let errorMessage: string | undefined;

        try {
            // Simulate health check
            await this.checkIntegrationHealth(integration);
            isHealthy = true;
        } catch (error: any) {
            errorMessage = error.message;
        }

        return await Integration.findOneAndUpdate(
            { integrationId },
            {
                'healthCheck.lastChecked': new Date(),
                'healthCheck.isHealthy': isHealthy,
                'healthCheck.errorMessage': errorMessage,
                status: isHealthy ? 'active' : 'error'
            },
            { new: true }
        );
    }

    // Webhook Management
    async receiveWebhook(data: IWebhookRequest): Promise<any> {
        const webhookId = uuidv4();

        const webhook = new Webhook({
            webhookId,
            integrationId: data.integrationId,
            eventType: data.eventType,
            payload: data.payload
        });

        const savedWebhook = await webhook.save();

        // Process webhook asynchronously
        this.processWebhook(webhookId);

        return savedWebhook;
    }

    async getWebhooks(integrationId: string): Promise<any[]> {
        return await Webhook.find({ integrationId }).sort({ createdAt: -1 }).limit(100);
    }

    // Integration Logs
    async getIntegrationLogs(integrationId: string, filters: any): Promise<any[]> {
        const query: any = { integrationId };

        if (filters.success !== undefined) query.success = filters.success;
        if (filters.action) query.action = filters.action;

        return await IntegrationLog.find(query)
            .sort({ timestamp: -1 })
            .limit(filters.limit || 100);
    }

    // Helper Methods
    private async executeIntegrationCall(integration: any, action: string, payload: any): Promise<any> {
        // Simulate integration-specific logic
        switch (integration.integrationType) {
            case 'payment_gateway':
                return this.handlePaymentGateway(integration, action, payload);
            case 'accounting':
                return this.handleAccounting(integration, action, payload);
            case 'email_sms':
                return this.handleEmailSms(integration, action, payload);
            case 'calendar':
                return this.handleCalendar(integration, action, payload);
            case 'access_control':
                return this.handleAccessControl(integration, action, payload);
            default:
                return { success: true, message: 'Integration call executed' };
        }
    }

    private async handlePaymentGateway(integration: any, action: string, payload: any): Promise<any> {
        // Simulate payment gateway operations
        return {
            success: true,
            transactionId: uuidv4(),
            amount: payload.amount,
            status: 'completed'
        };
    }

    private async handleAccounting(integration: any, action: string, payload: any): Promise<any> {
        // Simulate accounting software operations
        return {
            success: true,
            invoiceId: uuidv4(),
            syncStatus: 'synced'
        };
    }

    private async handleEmailSms(integration: any, action: string, payload: any): Promise<any> {
        // Simulate email/SMS operations
        return {
            success: true,
            messageId: uuidv4(),
            status: 'sent'
        };
    }

    private async handleCalendar(integration: any, action: string, payload: any): Promise<any> {
        // Simulate calendar operations
        return {
            success: true,
            eventId: uuidv4(),
            status: 'created'
        };
    }

    private async handleAccessControl(integration: any, action: string, payload: any): Promise<any> {
        // Simulate access control operations
        return {
            success: true,
            accessGranted: true,
            deviceId: payload.deviceId
        };
    }

    private async checkIntegrationHealth(integration: any): Promise<void> {
        // Simulate health check
        if (integration.config.environment === 'sandbox') {
            return;
        }
        throw new Error('Health check not implemented for production');
    }

    private async logIntegrationCall(
        integrationId: string,
        integrationType: string,
        provider: string,
        action: string,
        payload: any,
        response: any,
        duration: number,
        success: boolean
    ): Promise<void> {
        const logId = uuidv4();

        const log = new IntegrationLog({
            logId,
            integrationId,
            integrationType,
            provider,
            action,
            request: {
                method: 'POST',
                endpoint: `/api/${action}`,
                payload
            },
            response: {
                statusCode: success ? 200 : 500,
                data: success ? response : undefined,
                error: success ? undefined : response.error
            },
            duration,
            success
        });

        await log.save();
    }

    private async processWebhook(webhookId: string): Promise<void> {
        // Simulate webhook processing
        setTimeout(async () => {
            await Webhook.findOneAndUpdate(
                { webhookId },
                {
                    status: 'processing'
                }
            );
        }, 1000);

        setTimeout(async () => {
            await Webhook.findOneAndUpdate(
                { webhookId },
                {
                    status: 'completed',
                    processedAt: new Date()
                }
            );
        }, 3000);
    }
}
