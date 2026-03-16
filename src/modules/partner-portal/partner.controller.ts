import { Request, Response } from 'express';
import { PartnerService } from './partner.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { sendSuccess } from '../../shared/utils/response.util';

const partnerService = new PartnerService();

export class PartnerController {
    private service: PartnerService;

    constructor() {
        this.service = new PartnerService();
    }

    async createPartnerProfile(req: any, res: any): Promise<void> {
        try {
            const profile = await this.service.createPartnerProfile(req.body);
            res.status(201).json({ success: true, data: profile });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async bulkImportStudents(req: any, res: any): Promise<void> {
        try {
            const bulkImport = await this.service.bulkImportStudents(req.body);
            res.status(201).json({ success: true, data: bulkImport });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getPartnerDashboard(req: any, res: any): Promise<void> {
        try {
            const { partnerId } = req.params;
            const dashboard = await this.service.getPartnerDashboard(partnerId);
            res.status(200).json({ success: true, data: dashboard });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async calculateRevenueShare(req: any, res: any): Promise<void> {
        try {
            const { partnerId } = req.params;
            const { period } = req.query;
            const revShare = await this.service.calculateRevenueShare(partnerId, period as string);
            res.status(200).json({ success: true, data: revShare });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async generateComplianceExport(req: any, res: any): Promise<void> {
        try {
            const exportData = await this.service.generateComplianceExport(req.body);
            res.status(201).json({ success: true, data: exportData });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async submitTenderDocumentation(req: any, res: any): Promise<void> {
        try {
            const tender = await this.service.submitTenderDocumentation(req.body);
            res.status(201).json({ success: true, data: tender });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async submitMunicipalReport(req: any, res: any): Promise<void> {
        try {
            const report = await this.service.submitMunicipalReport(req.body);
            res.status(201).json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async createPartnerAgreement(req: any, res: any): Promise<void> {
        try {
            const agreement = await this.service.createPartnerAgreement(req.body);
            res.status(201).json({ success: true, data: agreement });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getPartnerPerformance(req: any, res: any): Promise<void> {
        try {
            const { partnerId } = req.params;
            const { period } = req.query;
            const performance = await this.service.getPartnerPerformance(partnerId, period as string);
            res.status(200).json({ success: true, data: performance });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async sendPartnerCommunication(req: any, res: any): Promise<void> {
        try {
            const communication = await this.service.sendPartnerCommunication(req.body);
            res.status(201).json({ success: true, data: communication });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async createSupportTicket(req: any, res: any): Promise<void> {
        try {
            const ticket = await this.service.createSupportTicket(req.body);
            res.status(201).json({ success: true, data: ticket });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async resolveSupportTicket(req: any, res: any): Promise<void> {
        try {
            const { supportId } = req.params;
            const { resolution } = req.body;
            const ticket = await this.service.resolveSupportTicket(supportId, resolution);
            res.status(200).json({ success: true, data: ticket });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }
}
