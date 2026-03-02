import { Request, Response, NextFunction } from 'express';
import { IntegrationService } from './integration.service';

const integrationService = new IntegrationService();

export class IntegrationController {
    async createIntegration(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.userId || 'system';
            const integration = await integrationService.createIntegration(req.body, userId);

            res.status(201).json({
                success: true,
                message: 'Integration created successfully',
                data: integration
            });
        } catch (error) {
            next(error);
        }
    }

    async getIntegrations(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = {
                integrationType: req.query.integrationType as string,
                provider: req.query.provider as string,
                status: req.query.status as string
            };

            const integrations = await integrationService.getIntegrations(filters);

            res.status(200).json({
                success: true,
                message: 'Integrations retrieved successfully',
                data: integrations
            });
        } catch (error) {
            next(error);
        }
    }

    async getIntegration(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { integrationId } = req.params;
            const integration = await integrationService.getIntegration(integrationId);

            res.status(200).json({
                success: true,
                message: 'Integration retrieved successfully',
                data: integration
            });
        } catch (error) {
            next(error);
        }
    }

    async updateIntegration(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { integrationId } = req.params;
            const integration = await integrationService.updateIntegration(integrationId, req.body);

            res.status(200).json({
                success: true,
                message: 'Integration updated successfully',
                data: integration
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteIntegration(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { integrationId } = req.params;
            await integrationService.deleteIntegration(integrationId);

            res.status(200).json({
                success: true,
                message: 'Integration deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async callIntegration(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await integrationService.callIntegration(req.body);

            res.status(200).json({
                success: true,
                message: 'Integration call executed successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async performHealthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { integrationId } = req.params;
            const result = await integrationService.performHealthCheck(integrationId);

            res.status(200).json({
                success: true,
                message: 'Health check completed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async receiveWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const webhook = await integrationService.receiveWebhook(req.body);

            res.status(200).json({
                success: true,
                message: 'Webhook received successfully',
                data: webhook
            });
        } catch (error) {
            next(error);
        }
    }

    async getWebhooks(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { integrationId } = req.params;
            const webhooks = await integrationService.getWebhooks(integrationId);

            res.status(200).json({
                success: true,
                message: 'Webhooks retrieved successfully',
                data: webhooks
            });
        } catch (error) {
            next(error);
        }
    }

    async getIntegrationLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { integrationId } = req.params;
            const filters = {
                success: req.query.success === 'true' ? true : req.query.success === 'false' ? false : undefined,
                action: req.query.action as string,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 100
            };

            const logs = await integrationService.getIntegrationLogs(integrationId, filters);

            res.status(200).json({
                success: true,
                message: 'Integration logs retrieved successfully',
                data: logs
            });
        } catch (error) {
            next(error);
        }
    }
}
