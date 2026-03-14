import { PartnerController } from './partner.controller';

export class PartnerRoutes {
    private controller: PartnerController;

    constructor() {
        this.controller = new PartnerController();
    }

    public getRoutes() {
        return [
            { method: 'POST', path: '/api/partners/profile', handler: (req: any, res: any) => this.controller.createPartnerProfile(req, res) },
            { method: 'POST', path: '/api/partners/bulk-import', handler: (req: any, res: any) => this.controller.bulkImportStudents(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/dashboard', handler: (req: any, res: any) => this.controller.getPartnerDashboard(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/revenue-share', handler: (req: any, res: any) => this.controller.calculateRevenueShare(req, res) },
            { method: 'POST', path: '/api/partners/compliance-export', handler: (req: any, res: any) => this.controller.generateComplianceExport(req, res) },
            { method: 'POST', path: '/api/partners/tender', handler: (req: any, res: any) => this.controller.submitTenderDocumentation(req, res) },
            { method: 'POST', path: '/api/partners/municipal-report', handler: (req: any, res: any) => this.controller.submitMunicipalReport(req, res) },
            { method: 'POST', path: '/api/partners/agreement', handler: (req: any, res: any) => this.controller.createPartnerAgreement(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/performance', handler: (req: any, res: any) => this.controller.getPartnerPerformance(req, res) },
            { method: 'POST', path: '/api/partners/communication', handler: (req: any, res: any) => this.controller.sendPartnerCommunication(req, res) },
            { method: 'POST', path: '/api/partners/support', handler: (req: any, res: any) => this.controller.createSupportTicket(req, res) },
            { method: 'PUT', path: '/api/partners/support/:supportId/resolve', handler: (req: any, res: any) => this.controller.resolveSupportTicket(req, res) }
        ];
    }
}
