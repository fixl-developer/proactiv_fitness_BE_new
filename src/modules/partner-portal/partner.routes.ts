import { PartnerController } from './partner.controller';

export class PartnerRoutes {
    private controller: PartnerController;

    constructor() {
        this.controller = new PartnerController();
    }

    public getRoutes() {
        const c = this.controller;
        return [
            // Original routes
            { method: 'POST', path: '/api/partners/profile', handler: (req: any, res: any) => c.createPartnerProfile(req, res) },
            { method: 'POST', path: '/api/partners/bulk-import', handler: (req: any, res: any) => c.bulkImportStudents(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/dashboard', handler: (req: any, res: any) => c.getPartnerDashboard(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/revenue-share', handler: (req: any, res: any) => c.calculateRevenueShare(req, res) },
            { method: 'POST', path: '/api/partners/compliance-export', handler: (req: any, res: any) => c.generateComplianceExport(req, res) },
            { method: 'POST', path: '/api/partners/tender', handler: (req: any, res: any) => c.submitTenderDocumentation(req, res) },
            { method: 'POST', path: '/api/partners/municipal-report', handler: (req: any, res: any) => c.submitMunicipalReport(req, res) },
            { method: 'POST', path: '/api/partners/agreement', handler: (req: any, res: any) => c.createPartnerAgreement(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/performance', handler: (req: any, res: any) => c.getPartnerPerformance(req, res) },
            { method: 'POST', path: '/api/partners/communication', handler: (req: any, res: any) => c.sendPartnerCommunication(req, res) },
            { method: 'POST', path: '/api/partners/support', handler: (req: any, res: any) => c.createSupportTicket(req, res) },
            { method: 'PUT', path: '/api/partners/support/:supportId/resolve', handler: (req: any, res: any) => c.resolveSupportTicket(req, res) },

            // Partner profile & core data
            { method: 'GET', path: '/api/partners/:partnerId', handler: (req: any, res: any) => c.getPartnerProfile(req, res) },
            { method: 'PATCH', path: '/api/partners/:partnerId', handler: (req: any, res: any) => c.updatePartnerProfile(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/stats', handler: (req: any, res: any) => c.getPartnerStats(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/programs', handler: (req: any, res: any) => c.getPartnerPrograms(req, res) },
            { method: 'POST', path: '/api/partners/:partnerId/programs', handler: (req: any, res: any) => c.createPartnerProgram(req, res) },
            { method: 'PUT', path: '/api/partners/:partnerId/programs/:programId', handler: (req: any, res: any) => c.updatePartnerProgram(req, res) },
            { method: 'DELETE', path: '/api/partners/:partnerId/programs/:programId', handler: (req: any, res: any) => c.deletePartnerProgram(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/students', handler: (req: any, res: any) => c.getPartnerStudents(req, res) },
            { method: 'POST', path: '/api/partners/:partnerId/students', handler: (req: any, res: any) => c.createPartnerStudent(req, res) },
            { method: 'PUT', path: '/api/partners/:partnerId/students/:studentId', handler: (req: any, res: any) => c.updatePartnerStudent(req, res) },
            { method: 'DELETE', path: '/api/partners/:partnerId/students/:studentId', handler: (req: any, res: any) => c.deletePartnerStudent(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/bookings', handler: (req: any, res: any) => c.getPartnerBookings(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/revenue', handler: (req: any, res: any) => c.getPartnerRevenue(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/metrics', handler: (req: any, res: any) => c.getPartnerMetrics(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/notifications', handler: (req: any, res: any) => c.getPartnerNotifications(req, res) },
            { method: 'PATCH', path: '/api/partners/notifications/:notificationId/read', handler: (req: any, res: any) => c.markNotificationRead(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/documents', handler: (req: any, res: any) => c.getPartnerDocuments(req, res) },
            { method: 'POST', path: '/api/partners/:partnerId/documents', handler: (req: any, res: any) => c.uploadDocument(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/contacts', handler: (req: any, res: any) => c.getPartnerContacts(req, res) },
            { method: 'PATCH', path: '/api/partners/:partnerId/contacts', handler: (req: any, res: any) => c.updatePartnerContacts(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/agreements', handler: (req: any, res: any) => c.getPartnerAgreements(req, res) },

            // Analytics
            { method: 'GET', path: '/api/partners/:partnerId/analytics/performance', handler: (req: any, res: any) => c.getPerformanceMetrics(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/analytics/trends', handler: (req: any, res: any) => c.getPerformanceTrends(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/analytics/student-progress', handler: (req: any, res: any) => c.getStudentProgress(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/analytics/class-performance', handler: (req: any, res: any) => c.getClassPerformance(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/analytics/revenue', handler: (req: any, res: any) => c.getRevenueAnalytics(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/analytics/growth', handler: (req: any, res: any) => c.getGrowthAnalytics(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/analytics/compliance', handler: (req: any, res: any) => c.getComplianceAnalytics(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/analytics/quality', handler: (req: any, res: any) => c.getQualityMetrics(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/analytics/satisfaction', handler: (req: any, res: any) => c.getCustomerSatisfaction(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/analytics/market', handler: (req: any, res: any) => c.getMarketAnalytics(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/analytics/competitive', handler: (req: any, res: any) => c.getCompetitiveAnalysis(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/analytics/forecast', handler: (req: any, res: any) => c.getForecastAnalytics(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/analytics/benchmark', handler: (req: any, res: any) => c.getBenchmarkAnalytics(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/analytics/goals', handler: (req: any, res: any) => c.getGoalProgress(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/analytics/opportunities', handler: (req: any, res: any) => c.getOpportunityAnalysis(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/analytics/export', handler: (req: any, res: any) => c.exportAnalyticsReport(req, res) },

            // Marketing
            { method: 'GET', path: '/api/partners/:partnerId/marketing/campaigns', handler: (req: any, res: any) => c.getMarketingCampaigns(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/marketing/leads', handler: (req: any, res: any) => c.getMarketingLeads(req, res) },

            // Integrations
            { method: 'GET', path: '/api/partners/:partnerId/integrations', handler: (req: any, res: any) => c.getIntegrations(req, res) },
            { method: 'PATCH', path: '/api/partners/integrations/:integrationId/toggle', handler: (req: any, res: any) => c.toggleIntegration(req, res) },

            // Support Tickets
            { method: 'GET', path: '/api/partners/:partnerId/support/tickets', handler: (req: any, res: any) => c.getSupportTickets(req, res) },
            { method: 'POST', path: '/api/partners/:partnerId/support/tickets', handler: (req: any, res: any) => c.createSupportTicket(req, res) },
            { method: 'POST', path: '/api/partners/support/tickets/:ticketId/messages', handler: (req: any, res: any) => c.addTicketMessage(req, res) },

            // Messages & Communication
            { method: 'GET', path: '/api/partners/:partnerId/messages', handler: (req: any, res: any) => c.getMessagesHandler(req, res) },
            { method: 'POST', path: '/api/partners/:partnerId/messages', handler: (req: any, res: any) => c.sendMessageHandler(req, res) },
            { method: 'POST', path: '/api/partners/messages/:messageId/reply', handler: (req: any, res: any) => c.replyToMessage(req, res) },

            // Settings
            { method: 'GET', path: '/api/partners/:partnerId/settings', handler: (req: any, res: any) => c.getPartnerSettings(req, res) },
            { method: 'PATCH', path: '/api/partners/:partnerId/settings', handler: (req: any, res: any) => c.updatePartnerSettings(req, res) },

            // Partner Reports
            { method: 'GET', path: '/api/partners/:partnerId/reports', handler: (req: any, res: any) => c.getPartnerReports(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/reports/summary', handler: (req: any, res: any) => c.getPartnerReportsSummary(req, res) },
            { method: 'POST', path: '/api/partners/:partnerId/reports', handler: (req: any, res: any) => c.createPartnerReport(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/reports/:reportId', handler: (req: any, res: any) => c.getPartnerReportById(req, res) },
            { method: 'DELETE', path: '/api/partners/:partnerId/reports/:reportId', handler: (req: any, res: any) => c.deletePartnerReport(req, res) },
            { method: 'GET', path: '/api/partners/:partnerId/reports/:reportId/download', handler: (req: any, res: any) => c.downloadPartnerReport(req, res) },
        ];
    }
}
