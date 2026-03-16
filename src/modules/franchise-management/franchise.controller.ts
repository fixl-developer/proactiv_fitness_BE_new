import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { FranchiseService } from './franchise.service';

@injectable()
export class FranchiseController {
    constructor(@inject(FranchiseService) private franchiseService: FranchiseService) { }

    // Franchise Profile Management
    async createFranchise(req: Request, res: Response): Promise<void> {
        try {
            const franchise = await this.franchiseService.createFranchise(req.body);
            res.status(201).json({ success: true, data: franchise });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async updateFranchise(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const franchise = await this.franchiseService.updateFranchise(franchiseId, req.body);
            res.status(200).json({ success: true, data: franchise });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getFranchise(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const franchise = await this.franchiseService.getFranchise(franchiseId);
            res.status(200).json({ success: true, data: franchise });
        } catch (error) {
            res.status(404).json({ success: false, error: (error as Error).message });
        }
    }

    async getAllFranchises(req: Request, res: Response): Promise<void> {
        try {
            const franchises = await this.franchiseService.getAllFranchises();
            res.status(200).json({ success: true, data: franchises });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getFranchisesByStatus(req: Request, res: Response): Promise<void> {
        try {
            const { status } = req.query;
            const franchises = await this.franchiseService.getFranchisesByStatus(status as string);
            res.status(200).json({ success: true, data: franchises });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async approveFranchise(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const franchise = await this.franchiseService.approveFranchise(franchiseId);
            res.status(200).json({ success: true, data: franchise });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async rejectFranchise(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const { reason } = req.body;
            const franchise = await this.franchiseService.rejectFranchise(franchiseId, reason);
            res.status(200).json({ success: true, data: franchise });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Royalty Management
    async calculateRoyalty(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const { monthlyRevenue } = req.body;
            const royalty = await this.franchiseService.calculateRoyalty(franchiseId, monthlyRevenue);
            res.status(201).json({ success: true, data: royalty });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getRoyalties(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const royalties = await this.franchiseService.getRoyalties(franchiseId);
            res.status(200).json({ success: true, data: royalties });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async processRoyaltyPayment(req: Request, res: Response): Promise<void> {
        try {
            const { royaltyId } = req.params;
            const royalty = await this.franchiseService.processRoyaltyPayment(royaltyId);
            res.status(200).json({ success: true, data: royalty });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getRoyaltyReport(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const { year } = req.query;
            const report = await this.franchiseService.getRoyaltyReport(franchiseId, parseInt(year as string));
            res.status(200).json({ success: true, data: report });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Dashboard
    async generateDashboard(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const dashboard = await this.franchiseService.generateDashboard(franchiseId);
            res.status(200).json({ success: true, data: dashboard });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Performance Tracking
    async trackPerformance(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const performance = await this.franchiseService.trackPerformance(franchiseId, req.body);
            res.status(201).json({ success: true, data: performance });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getPerformance(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const performance = await this.franchiseService.getPerformance(franchiseId);
            res.status(200).json({ success: true, data: performance });
        } catch (error) {
            res.status(404).json({ success: false, error: (error as Error).message });
        }
    }

    async getPerformanceHistory(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const { months } = req.query;
            const history = await this.franchiseService.getPerformanceHistory(franchiseId, parseInt(months as string) || 12);
            res.status(200).json({ success: true, data: history });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Compliance Management
    async addComplianceCheck(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const compliance = await this.franchiseService.addComplianceCheck(franchiseId, req.body);
            res.status(201).json({ success: true, data: compliance });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getCompliances(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const compliances = await this.franchiseService.getCompliances(franchiseId);
            res.status(200).json({ success: true, data: compliances });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async updateComplianceStatus(req: Request, res: Response): Promise<void> {
        try {
            const { complianceId } = req.params;
            const { status } = req.body;
            const compliance = await this.franchiseService.updateComplianceStatus(complianceId, status);
            res.status(200).json({ success: true, data: compliance });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Training Management
    async createTraining(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const training = await this.franchiseService.createTraining(franchiseId, req.body);
            res.status(201).json({ success: true, data: training });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getTrainings(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const trainings = await this.franchiseService.getTrainings(franchiseId);
            res.status(200).json({ success: true, data: trainings });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async completeTraining(req: Request, res: Response): Promise<void> {
        try {
            const { trainingId } = req.params;
            const training = await this.franchiseService.completeTraining(trainingId);
            res.status(200).json({ success: true, data: training });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Support Ticket Management
    async createSupportTicket(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const ticket = await this.franchiseService.createSupportTicket(franchiseId, req.body);
            res.status(201).json({ success: true, data: ticket });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getSupportTickets(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const tickets = await this.franchiseService.getSupportTickets(franchiseId);
            res.status(200).json({ success: true, data: tickets });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async updateSupportTicket(req: Request, res: Response): Promise<void> {
        try {
            const { ticketId } = req.params;
            const ticket = await this.franchiseService.updateSupportTicket(ticketId, req.body);
            res.status(200).json({ success: true, data: ticket });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Agreement Management
    async createAgreement(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const agreement = await this.franchiseService.createAgreement(franchiseId, req.body);
            res.status(201).json({ success: true, data: agreement });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getAgreements(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const agreements = await this.franchiseService.getAgreements(franchiseId);
            res.status(200).json({ success: true, data: agreements });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async renewAgreement(req: Request, res: Response): Promise<void> {
        try {
            const { agreementId } = req.params;
            const agreement = await this.franchiseService.renewAgreement(agreementId);
            res.status(200).json({ success: true, data: agreement });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Bulk Operations
    async deleteFranchise(req: Request, res: Response): Promise<void> {
        try {
            const { franchiseId } = req.params;
            const result = await this.franchiseService.deleteFranchise(franchiseId);
            res.status(200).json({ success: true, data: { deleted: result } });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async searchFranchises(req: Request, res: Response): Promise<void> {
        try {
            const { query } = req.query;
            const franchises = await this.franchiseService.searchFranchises(query as string);
            res.status(200).json({ success: true, data: franchises });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getFranchiseStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await this.franchiseService.getFranchiseStats();
            res.status(200).json({ success: true, data: stats });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }
}
