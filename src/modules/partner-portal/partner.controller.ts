import { PartnerService } from './partner.service';

export class PartnerController {
    private service: PartnerService;

    constructor() {
        this.service = new PartnerService();
    }

    private ok(res: any, data: any, status = 200) {
        res.status(status).json({ success: true, data });
    }

    private err(res: any, error: unknown, status = 500) {
        res.status(status).json({ success: false, error: (error as Error).message });
    }

    // ===== Legacy compatibility =====
    async createPartnerProfile(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.createPartnerProfile(req.body), 201); } catch (e) { this.err(res, e); }
    }

    async bulkImportStudents(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.bulkImportStudents(req.body), 201); } catch (e) { this.err(res, e); }
    }

    async getPartnerDashboard(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPartnerDashboard(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    async calculateRevenueShare(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.calculateRevenueShare(req.params.partnerId, req.query.period as string)); } catch (e) { this.err(res, e); }
    }

    async generateComplianceExport(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.generateComplianceExport(req.body), 201); } catch (e) { this.err(res, e); }
    }

    async submitTenderDocumentation(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.submitTenderDocumentation(req.body), 201); } catch (e) { this.err(res, e); }
    }

    async submitMunicipalReport(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.submitMunicipalReport(req.body), 201); } catch (e) { this.err(res, e); }
    }

    async createPartnerAgreement(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.createPartnerAgreement(req.body), 201); } catch (e) { this.err(res, e); }
    }

    async getPartnerPerformance(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPartnerPerformance(req.params.partnerId, req.query.period as string)); } catch (e) { this.err(res, e); }
    }

    async sendPartnerCommunication(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.sendPartnerCommunication(req.body), 201); } catch (e) { this.err(res, e); }
    }

    async createSupportTicket(req: any, res: any): Promise<void> {
        try {
            const partnerId = req.params?.partnerId || req.body?.partnerId || '';
            this.ok(res, await this.service.createSupportTicket(partnerId, req.body), 201);
        } catch (e) { this.err(res, e); }
    }

    async resolveSupportTicket(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.resolveSupportTicket(req.params.supportId, req.body.resolution)); } catch (e) { this.err(res, e); }
    }

    // ===== Profile & core data =====
    async getPartnerProfile(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPartnerProfile(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    async updatePartnerProfile(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.updatePartnerProfile(req.params.partnerId, req.body)); } catch (e) { this.err(res, e); }
    }

    async getPartnerStats(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPartnerStats(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    // ===== Programs =====
    async getPartnerPrograms(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPartnerPrograms(req.params.partnerId, req.query)); } catch (e) { this.err(res, e); }
    }

    async createPartnerProgram(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.createPartnerProgram(req.params.partnerId, req.body), 201); } catch (e) { this.err(res, e); }
    }

    async updatePartnerProgram(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.updatePartnerProgram(req.params.partnerId, req.params.programId, req.body)); } catch (e) { this.err(res, e); }
    }

    async deletePartnerProgram(req: any, res: any): Promise<void> {
        try { await this.service.deletePartnerProgram(req.params.partnerId, req.params.programId); res.status(200).json({ success: true, message: 'Program deleted' }); } catch (e) { this.err(res, e); }
    }

    // ===== Students =====
    async getPartnerStudents(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPartnerStudents(req.params.partnerId, req.query)); } catch (e) { this.err(res, e); }
    }

    async createPartnerStudent(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.createPartnerStudent(req.params.partnerId, req.body), 201); } catch (e) { this.err(res, e); }
    }

    async updatePartnerStudent(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.updatePartnerStudent(req.params.partnerId, req.params.studentId, req.body)); } catch (e) { this.err(res, e); }
    }

    async deletePartnerStudent(req: any, res: any): Promise<void> {
        try { await this.service.deletePartnerStudent(req.params.partnerId, req.params.studentId); res.status(200).json({ success: true, message: 'Student deleted' }); } catch (e) { this.err(res, e); }
    }

    async getPartnerBookings(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPartnerBookings(req.params.partnerId, req.query)); } catch (e) { this.err(res, e); }
    }

    async getPartnerRevenue(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPartnerRevenue(req.params.partnerId, req.query)); } catch (e) { this.err(res, e); }
    }

    async getPartnerMetrics(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPartnerMetrics(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    async getPartnerNotifications(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPartnerNotifications(req.params.partnerId, req.query)); } catch (e) { this.err(res, e); }
    }

    async markNotificationRead(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.markNotificationRead(req.params.notificationId)); } catch (e) { this.err(res, e); }
    }

    async getPartnerDocuments(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPartnerDocuments(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    async uploadDocument(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.uploadDocument(req.params.partnerId, req.body), 201); } catch (e) { this.err(res, e); }
    }

    async downloadPartnerDocument(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.downloadPartnerDocument(req.params.partnerId, req.params.documentId)); } catch (e) { this.err(res, e); }
    }

    async requestResource(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.requestResource(req.params.partnerId, req.body), 201); } catch (e) { this.err(res, e); }
    }

    async getPartnerContacts(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPartnerContacts(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    async updatePartnerContacts(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.updatePartnerContacts(req.params.partnerId, req.body)); } catch (e) { this.err(res, e); }
    }

    async getPartnerAgreements(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPartnerAgreements(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    // ===== Analytics =====
    async getPerformanceMetrics(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPerformanceMetrics(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    async getPerformanceTrends(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPerformanceTrends(req.params.partnerId, req.query)); } catch (e) { this.err(res, e); }
    }

    async getStudentProgress(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getStudentProgress(req.params.partnerId, req.query)); } catch (e) { this.err(res, e); }
    }

    async getClassPerformance(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getClassPerformance(req.params.partnerId, req.query)); } catch (e) { this.err(res, e); }
    }

    async getRevenueAnalytics(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getRevenueAnalytics(req.params.partnerId, req.query)); } catch (e) { this.err(res, e); }
    }

    async getGrowthAnalytics(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getGrowthAnalytics(req.params.partnerId, req.query.period as string)); } catch (e) { this.err(res, e); }
    }

    async getComplianceAnalytics(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getComplianceMetrics(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    async getQualityMetrics(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getQualityMetrics(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    async getCustomerSatisfaction(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getCustomerSatisfaction(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    async getMarketAnalytics(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getMarketAnalytics(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    async getCompetitiveAnalysis(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getCompetitiveAnalysis(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    async getForecastAnalytics(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getForecastAnalytics(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    async getBenchmarkAnalytics(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getBenchmarkAnalytics(req.params.partnerId, req.query.metric as string)); } catch (e) { this.err(res, e); }
    }

    async getGoalProgress(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getGoalProgress(req.params.partnerId, req.query)); } catch (e) { this.err(res, e); }
    }

    async getOpportunityAnalysis(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getOpportunityAnalysis(req.params.partnerId, req.query)); } catch (e) { this.err(res, e); }
    }

    async exportAnalyticsReport(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.exportAnalyticsReport(req.params.partnerId, req.query.format as string)); } catch (e) { this.err(res, e); }
    }

    // ===== Marketing =====
    async getMarketingCampaigns(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getMarketingCampaigns(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    async createMarketingCampaign(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.createMarketingCampaign(req.params.partnerId, req.body), 201); } catch (e) { this.err(res, e); }
    }

    async getMarketingLeads(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getMarketingLeads(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    // ===== Integrations =====
    async getIntegrations(req: any, res: any): Promise<void> {
        try {
            const result = await this.service.getIntegrations(req.params.partnerId);
            this.ok(res, result.integrations || []);
        } catch (e) { this.err(res, e); }
    }

    async createIntegration(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.createIntegration(req.params.partnerId, req.body), 201); } catch (e) { this.err(res, e); }
    }

    async updateIntegration(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.updateIntegration(req.params.integrationId, req.body)); } catch (e) { this.err(res, e); }
    }

    async deleteIntegration(req: any, res: any): Promise<void> {
        try { await this.service.deleteIntegration(req.params.integrationId); res.status(200).json({ success: true, message: 'Integration deleted' }); } catch (e) { this.err(res, e); }
    }

    async toggleIntegration(req: any, res: any): Promise<void> {
        try {
            const enabled = req.body?.status === 'CONNECTED' || req.body?.status === 'connected' || req.body?.enabled === true;
            this.ok(res, await this.service.toggleIntegration(req.params.integrationId, enabled));
        } catch (e) { this.err(res, e); }
    }

    async testIntegration(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.testIntegration(req.params.integrationId)); } catch (e) { this.err(res, e); }
    }

    // ===== Support =====
    async getSupportTickets(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getSupportTickets(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    async addTicketMessage(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.addTicketMessage(req.params.ticketId, req.body), 201); } catch (e) { this.err(res, e); }
    }

    // ===== Messages =====
    async getMessagesHandler(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getMessages(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    async sendMessageHandler(req: any, res: any): Promise<void> {
        try {
            const data = {
                ...req.body,
                body: req.body?.body || req.body?.content || '',
                from: req.body?.from || req.body?.recipient || 'Partner Admin',
            };
            this.ok(res, await this.service.sendMessage(req.params.partnerId, data), 201);
        } catch (e) { this.err(res, e); }
    }

    async replyToMessage(req: any, res: any): Promise<void> {
        try {
            const data = { ...req.body, message: req.body?.message || req.body?.content || '' };
            this.ok(res, await this.service.replyToMessage(req.params.messageId, data), 201);
        } catch (e) { this.err(res, e); }
    }

    async markMessageRead(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.markMessageRead(req.params.messageId)); } catch (e) { this.err(res, e); }
    }

    async archiveMessage(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.archiveMessage(req.params.messageId)); } catch (e) { this.err(res, e); }
    }

    // ===== Settings =====
    async getPartnerSettings(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPartnerSettings(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    async updatePartnerSettings(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.updatePartnerSettings(req.params.partnerId, req.body)); } catch (e) { this.err(res, e); }
    }

    // ===== Reports =====
    async getPartnerReports(req: any, res: any): Promise<void> {
        try {
            const result = await this.service.getPartnerReports(req.params.partnerId, {
                period: req.query.period,
                status: req.query.status,
                reportType: req.query.reportType,
            });
            this.ok(res, result);
        } catch (e) { this.err(res, e); }
    }

    async getPartnerReportsSummary(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPartnerReportsSummary(req.params.partnerId, req.query.period as string)); } catch (e) { this.err(res, e); }
    }

    async createPartnerReport(req: any, res: any): Promise<void> {
        try {
            const userId = req.user?.id || req.body?.createdBy || req.params.partnerId;
            this.ok(res, await this.service.createPartnerReport(req.params.partnerId, req.body, userId), 201);
        } catch (e) { this.err(res, e); }
    }

    async getPartnerReportById(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPartnerReportById(req.params.partnerId, req.params.reportId)); } catch (e) { this.err(res, e); }
    }

    async deletePartnerReport(req: any, res: any): Promise<void> {
        try { await this.service.deletePartnerReport(req.params.partnerId, req.params.reportId); res.status(200).json({ success: true, message: 'Report deleted' }); } catch (e) { this.err(res, e); }
    }

    async downloadPartnerReport(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.downloadPartnerReport(req.params.partnerId, req.params.reportId)); } catch (e) { this.err(res, e); }
    }

    // ===== Commissions (called by /api/v1/commissions/* router) =====
    async getCommissions(req: any, res: any): Promise<void> {
        try {
            const partnerId = (req.query.partnerId as string) || req.params?.partnerId || '';
            this.ok(res, await this.service.getCommissions(partnerId, req.query));
        } catch (e) { this.err(res, e); }
    }

    async getCommissionById(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getCommissionById(req.params.id)); } catch (e) { this.err(res, e); }
    }

    async getCommissionHistory(req: any, res: any): Promise<void> {
        try {
            const partnerId = (req.query.partnerId as string) || '';
            this.ok(res, await this.service.getCommissionHistory(partnerId, req.query));
        } catch (e) { this.err(res, e); }
    }

    async getCommissionStats(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getCommissionStats(req.params.partnerId)); } catch (e) { this.err(res, e); }
    }

    async getCommissionBreakdown(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getCommissionBreakdown(req.params.partnerId, req.query.period as string)); } catch (e) { this.err(res, e); }
    }

    async calculateCommission(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.calculateCommission(req.body), 201); } catch (e) { this.err(res, e); }
    }

    async requestCommissionPayout(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.requestCommissionPayout(req.body), 201); } catch (e) { this.err(res, e); }
    }

    async getPayoutHistory(req: any, res: any): Promise<void> {
        try {
            const partnerId = (req.query.partnerId as string) || '';
            this.ok(res, await this.service.getPayoutHistory(partnerId, req.query));
        } catch (e) { this.err(res, e); }
    }

    async getPayoutStatus(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getPayoutStatus(req.params.payoutId)); } catch (e) { this.err(res, e); }
    }

    async getCommissionRates(_req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getCommissionRates()); } catch (e) { this.err(res, e); }
    }

    async getCommissionTiers(_req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getCommissionTiers()); } catch (e) { this.err(res, e); }
    }

    async getCommissionForecasts(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getCommissionForecasts(req.params.partnerId, req.query.months ? parseInt(req.query.months as string) : undefined)); } catch (e) { this.err(res, e); }
    }

    async exportCommissionReport(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.exportCommissionReport(req.params.partnerId, req.query.format as string)); } catch (e) { this.err(res, e); }
    }

    async getCommissionComparison(req: any, res: any): Promise<void> {
        try { this.ok(res, await this.service.getCommissionComparison(req.params.partnerId, req.query.period as string)); } catch (e) { this.err(res, e); }
    }
}
