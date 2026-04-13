import { PartnerService } from './partner.service';

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
            const ticket = await this.service.createSupportTicketLegacy(req.body);
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

    // ===== New endpoints for full portal integration =====

    async getPartnerProfile(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getPartnerProfile(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async updatePartnerProfile(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.updatePartnerProfile(partnerId, req.body) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getPartnerStats(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getPartnerStats(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getPartnerPrograms(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getPartnerPrograms(partnerId, req.query) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async createPartnerProgram(req: any, res: any): Promise<void> {
        try {
            const { partnerId } = req.params;
            const program = await this.service.createPartnerProgram(partnerId, req.body);
            res.status(201).json({ success: true, data: program });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async updatePartnerProgram(req: any, res: any): Promise<void> {
        try {
            const { partnerId, programId } = req.params;
            const program = await this.service.updatePartnerProgram(partnerId, programId, req.body);
            res.status(200).json({ success: true, data: program });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async deletePartnerProgram(req: any, res: any): Promise<void> {
        try {
            const { partnerId, programId } = req.params;
            const result = await this.service.deletePartnerProgram(partnerId, programId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getPartnerStudents(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getPartnerStudents(partnerId, req.query) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async createPartnerStudent(req: any, res: any): Promise<void> {
        try {
            const { partnerId } = req.params;
            const student = await this.service.createPartnerStudent(partnerId, req.body);
            res.status(201).json({ success: true, data: student });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async updatePartnerStudent(req: any, res: any): Promise<void> {
        try {
            const { partnerId, studentId } = req.params;
            const student = await this.service.updatePartnerStudent(partnerId, studentId, req.body);
            res.status(200).json({ success: true, data: student });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async deletePartnerStudent(req: any, res: any): Promise<void> {
        try {
            const { partnerId, studentId } = req.params;
            const result = await this.service.deletePartnerStudent(partnerId, studentId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getPartnerBookings(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getPartnerBookings(partnerId, req.query) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getPartnerRevenue(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getPartnerRevenue(partnerId, req.query) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getPartnerMetrics(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getPartnerMetrics(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getPartnerNotifications(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getPartnerNotifications(partnerId, req.query) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async markNotificationRead(req: any, res: any): Promise<void> {
        try { const { notificationId } = req.params; res.status(200).json({ success: true, data: await this.service.markNotificationRead(notificationId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getPartnerDocuments(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getPartnerDocuments(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async uploadDocument(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(201).json({ success: true, data: await this.service.uploadDocument(partnerId, req.body) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getPartnerContacts(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getPartnerContacts(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async updatePartnerContacts(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.updatePartnerContacts(partnerId, req.body.contacts) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getPartnerAgreements(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getPartnerAgreements(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    // Analytics
    async getPerformanceMetrics(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getPerformanceMetrics(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getPerformanceTrends(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getPerformanceTrends(partnerId, req.query) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getStudentProgress(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getStudentProgress(partnerId, req.query) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getClassPerformance(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getClassPerformance(partnerId, req.query) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getRevenueAnalytics(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getRevenueAnalytics(partnerId, req.query) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getGrowthAnalytics(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getGrowthAnalytics(partnerId, req.query?.period) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getComplianceAnalytics(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getComplianceMetrics(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getQualityMetrics(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getQualityMetrics(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getCustomerSatisfaction(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getCustomerSatisfaction(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getMarketAnalytics(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getMarketAnalytics(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getCompetitiveAnalysis(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getCompetitiveAnalysis(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getForecastAnalytics(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getForecastAnalytics(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getBenchmarkAnalytics(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getBenchmarkAnalytics(partnerId, req.query?.metric) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getGoalProgress(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getGoalProgress(partnerId, req.query) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getOpportunityAnalysis(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getOpportunityAnalysis(partnerId, req.query) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async exportAnalyticsReport(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.exportAnalyticsReport(partnerId, req.query?.format) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    // Commissions
    async getCommissions(req: any, res: any): Promise<void> {
        try { const partnerId = req.query?.partnerId || req.params?.partnerId; res.status(200).json({ success: true, data: await this.service.getCommissions(partnerId, req.query) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getCommissionById(req: any, res: any): Promise<void> {
        try { res.status(200).json({ success: true, data: await this.service.getCommissionById(req.params.id) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async calculateCommission(req: any, res: any): Promise<void> {
        try { res.status(200).json({ success: true, data: await this.service.calculateCommission(req.body) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getCommissionHistory(req: any, res: any): Promise<void> {
        try { const partnerId = req.query?.partnerId; res.status(200).json({ success: true, data: await this.service.getCommissionHistory(partnerId, req.query) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getCommissionStats(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getCommissionStats(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getCommissionBreakdown(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getCommissionBreakdown(partnerId, req.query?.period) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async requestCommissionPayout(req: any, res: any): Promise<void> {
        try { res.status(201).json({ success: true, data: await this.service.requestCommissionPayout(req.body) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getPayoutHistory(req: any, res: any): Promise<void> {
        try { const partnerId = req.query?.partnerId; res.status(200).json({ success: true, data: await this.service.getPayoutHistory(partnerId, req.query) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getPayoutStatus(req: any, res: any): Promise<void> {
        try { res.status(200).json({ success: true, data: await this.service.getPayoutStatus(req.params.payoutId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getCommissionRates(req: any, res: any): Promise<void> {
        try { res.status(200).json({ success: true, data: await this.service.getCommissionRates() }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getCommissionTiers(req: any, res: any): Promise<void> {
        try { res.status(200).json({ success: true, data: await this.service.getCommissionTiers() }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getCommissionForecasts(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getCommissionForecasts(partnerId, req.query?.months) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async exportCommissionReport(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.exportCommissionReport(partnerId, req.query?.format) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getCommissionComparison(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getCommissionComparison(partnerId, req.query?.period) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    // Marketing
    async getMarketingCampaigns(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getMarketingCampaigns(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async getMarketingLeads(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getMarketingLeads(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    // Integrations
    async getIntegrations(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getIntegrations(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async toggleIntegration(req: any, res: any): Promise<void> {
        try { const { integrationId } = req.params; res.status(200).json({ success: true, data: await this.service.toggleIntegration(integrationId, req.body.enabled) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    // Support Tickets
    async getSupportTickets(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getSupportTickets(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async createSupportTicket(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(201).json({ success: true, data: await this.service.createSupportTicket(partnerId, req.body) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async addTicketMessage(req: any, res: any): Promise<void> {
        try { const { ticketId } = req.params; res.status(201).json({ success: true, data: await this.service.addTicketMessage(ticketId, req.body) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    // Messages
    async getMessagesHandler(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getMessages(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async sendMessageHandler(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(201).json({ success: true, data: await this.service.sendMessage(partnerId, req.body) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async replyToMessage(req: any, res: any): Promise<void> {
        try { const { messageId } = req.params; res.status(201).json({ success: true, data: await this.service.replyToMessage(messageId, req.body) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    // Settings
    async getPartnerSettings(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.getPartnerSettings(partnerId) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    async updatePartnerSettings(req: any, res: any): Promise<void> {
        try { const { partnerId } = req.params; res.status(200).json({ success: true, data: await this.service.updatePartnerSettings(partnerId, req.body) }); }
        catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
    }

    // ===== Partner Reports =====

    async getPartnerReports(req: any, res: any): Promise<void> {
        try {
            const { partnerId } = req.params;
            const { period, status, reportType } = req.query;
            const reports = await this.service.getPartnerReports(partnerId, { period, status, reportType });
            res.status(200).json({ success: true, data: reports });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getPartnerReportsSummary(req: any, res: any): Promise<void> {
        try {
            const { partnerId } = req.params;
            const { period } = req.query;
            const summary = await this.service.getPartnerReportsSummary(partnerId, period as string);
            res.status(200).json({ success: true, data: summary });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async createPartnerReport(req: any, res: any): Promise<void> {
        try {
            const { partnerId } = req.params;
            const userId = req.user?.userId || req.body.createdBy || 'system';
            const report = await this.service.createPartnerReport(partnerId, req.body, userId);
            res.status(201).json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getPartnerReportById(req: any, res: any): Promise<void> {
        try {
            const { partnerId, reportId } = req.params;
            const report = await this.service.getPartnerReportById(partnerId, reportId);
            res.status(200).json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async deletePartnerReport(req: any, res: any): Promise<void> {
        try {
            const { partnerId, reportId } = req.params;
            await this.service.deletePartnerReport(partnerId, reportId);
            res.status(200).json({ success: true, message: 'Report deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async downloadPartnerReport(req: any, res: any): Promise<void> {
        try {
            const { partnerId, reportId } = req.params;
            const result = await this.service.downloadPartnerReport(partnerId, reportId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }
}
