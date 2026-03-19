
import { Router, Request, Response } from 'express';

// === Core ===
import authRoutes from '../modules/iam/auth.routes';
import userRoutes from '../modules/iam/user.routes';

// === User Modules ===
import { userProfileRoutes } from '../modules/user-profile';
import { userProgressRoutes } from '../modules/user-progress';
import { userDashboardRoutes } from '../modules/user-dashboard';
import { userClassesRoutes } from '../modules/user-classes';
import { userAchievementsRoutes } from '../modules/user-achievements';

// === Already mounted modules ===
import aiChatbotRoutes from '../modules/ai-chatbot/ai-chatbot.routes';
import observabilityRoutes from '../modules/observability/observability.routes';
import bookingRoutes from '../modules/booking/booking.routes';
import schedulingRoutes from '../modules/scheduling/schedule.routes';
import { staffRoutes } from '../modules/staff/staff.routes';
import attendanceRoutes from '../modules/attendance/attendance.routes';
import paymentsRoutes from '../modules/payments/payments.routes';
import billingRoutes from '../modules/billing/billing.routes';
import programRoutes from '../modules/programs/program.routes';
import reportingRoutes from '../modules/reporting/reporting.routes';
import franchiseRoutes from '../modules/franchise/franchise.routes';
import crmRoutes from '../modules/crm/crm.routes';
import notificationsRoutes from '../modules/notifications/notifications.routes';
import gamificationRoutes from '../modules/gamification/gamification.routes';
import walletRoutes from '../modules/wallet/wallet.routes';
import familySchedulerRoutes from '../modules/family-scheduler/scheduler.routes';
import parentEngagementRoutes from '../modules/parent-engagement/parent-engagement.routes';
import parentRoiRoutes from '../modules/parent-roi/parent-roi.routes';
import financialLedgerRoutes from '../modules/financial-ledger/financial-ledger.routes';
import integrationsRoutes from '../modules/integrations/integrations.routes';

// === Newly mounted modules (default exports) ===
import advancedAnalyticsRoutes from '../modules/advanced-analytics/advanced-analytics.routes';
import auditVaultRoutes from '../modules/audit-vault/audit-vault.routes';
import capacityRoutes from '../modules/capacity-optimizer/capacity.routes';
import featureFlagsRoutes from '../modules/feature-flags/feature-flags.routes';
import automationRoutes from '../modules/automation/automation.routes';
import dataExportRoutes from '../modules/data-export/export.routes';
import dataDeletionRoutes from '../modules/data-deletion/deletion.routes';
import exitProtocolRoutes from '../modules/exit-protocol/exit-protocol.routes';
import workforceRoutes from '../modules/workforce-management/workforce.routes';
import communityRoutes from '../modules/community/community.routes';
import marketplaceRoutes from '../modules/marketplace/marketplace.routes';
import referralLoyaltyRoutes from '../modules/referral-loyalty/referral-loyalty.routes';
import dynamicPricingRoutes from '../modules/dynamic-pricing/pricing.routes';
import aiCoachRoutes from '../modules/ai-coach/ai-coach.routes';
import smartNutritionRoutes from '../modules/smart-nutrition/smart-nutrition.routes';
import integrationGatewayRoutes from '../modules/integration-gateway/integration.routes';
import offlineSyncRoutes from '../modules/offline-sync/offline-sync.routes';
import advancedSearchRoutes from '../modules/advanced-search/search.routes';
import forecastRoutes from '../modules/forecast-simulator/forecast.routes';
import eventBusRoutes from '../modules/event-bus/event-bus.routes';
import apiDeveloperPlatformRoutes from '../modules/api-developer-platform/api-developer-platform.routes';
import advancedVideoRoutes from '../modules/advanced-video-processing/advanced-video-processing.routes';
import aiCoachAssistantRoutes from '../modules/ai-coach-assistant/ai-coach-assistant.routes';
import franchiseManagementRoutes from '../modules/franchise-management/franchise.routes';
import apiPlatformAdvancedRoutes from '../modules/api-platform-advanced/api-platform-advanced.routes';
import whiteLabelPlatformRoutes from '../modules/white-label-platform/white-label-platform.routes';
import whiteLabelSaasRoutes from '../modules/white-label-saas/white-label-saas.routes';
import wearablesRoutes from '../modules/wearables/wearables.routes';
import virtualTrainingRoutes from '../modules/virtual-training/virtual-training.routes';
import nutritionRoutes from '../modules/nutrition/nutrition.routes';
import localizationRoutes from '../modules/localization/localization.routes';

// === Named exports ===
import { microCredentialRoutes } from '../modules/micro-credentials/micro-credentials.routes';
import { athletePassportRoutes } from '../modules/athlete-passport/athlete-passport.routes';
import { safetyRoutes } from '../modules/safety/safety.routes';

// === Class-based exports (need router wrapper) ===
import { MarketingRoutes } from '../modules/marketing-growth/marketing.routes';
import { PartnerRoutes } from '../modules/partner-portal/partner.routes';
import { FacilityRoutes } from '../modules/facility-management/facility.routes';
import { ObservationRoutes } from '../modules/observation-assessment/observation.routes';

// Helper to convert class-based routes to Express router
function classToRouter(routeClass: any): Router {
    const classRouter = Router();
    const instance = new routeClass();
    const routes = instance.getRoutes();
    for (const route of routes) {
        const method = route.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
        // Strip /api/xxx prefix from path since it's mounted under a prefix already
        let path = route.path;
        // Remove /api/marketing, /api/partners, /api/facilities, /api/observations prefix
        path = path.replace(/^\/api\/[^/]+/, '') || '/';
        classRouter[method](path, route.handler);
    }
    return classRouter;
}

const router = Router();

// API Info
router.get('/', (_req: Request, res: Response) => {
    res.json({
        message: 'Proactiv Fitness Platform API',
        version: '1.0.0',
        status: 'Running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

router.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// =============================================
// CORE
// =============================================
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// =============================================
// USER MODULES
// =============================================
router.use('/user/profile', userProfileRoutes);
router.use('/user/progress', userProgressRoutes);
router.use('/user/dashboard', userDashboardRoutes);
router.use('/user/classes', userClassesRoutes);
router.use('/user/achievements', userAchievementsRoutes);

// =============================================
// OPERATIONS (existing)
// =============================================
router.use('/bookings', bookingRoutes);
router.use('/scheduling', schedulingRoutes);
router.use('/staff', staffRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/payments', paymentsRoutes);
router.use('/billing', billingRoutes);
router.use('/programs', programRoutes);
router.use('/reports', reportingRoutes);
router.use('/franchise', franchiseRoutes);
router.use('/crm', crmRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/wallet', walletRoutes);
router.use('/family-scheduler', familySchedulerRoutes);
router.use('/parent-engagement', parentEngagementRoutes);
router.use('/parent-roi', parentRoiRoutes);
router.use('/financial-ledger', financialLedgerRoutes);
router.use('/integrations', integrationsRoutes);

// =============================================
// NEWLY MOUNTED MODULES
// =============================================

// Analytics & Reporting (these have internal prefix, mount at /)
router.use('/', advancedAnalyticsRoutes);   // internal: /advanced-analytics
router.use('/', auditVaultRoutes);          // internal: /audit-vault
router.use('/capacity', capacityRoutes);
router.use('/forecast', forecastRoutes);

// Automation & Workflows
router.use('/automation', automationRoutes);
router.use('/workflows', automationRoutes); // alias for frontend compatibility
router.use('/', featureFlagsRoutes);        // internal: /feature-flags
router.use('/event-bus', eventBusRoutes);

// Data Management
router.use('/data', dataExportRoutes);
router.use('/data/delete', dataDeletionRoutes);

// Engagement & Community
router.use('/community', communityRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/', referralLoyaltyRoutes);     // internal: /referral-loyalty
router.use('/micro-credentials', microCredentialRoutes);
router.use('/', exitProtocolRoutes);        // internal: /exit-protocol

// Staff & Workforce
router.use('/workforce', workforceRoutes);
router.use('/safety', safetyRoutes);

// Pricing & Commerce
router.use('/dynamic-pricing', dynamicPricingRoutes);

// AI & Coaching (these have internal prefix, mount at /)
router.use('/', aiCoachRoutes);             // internal: /ai-coach
router.use('/', aiCoachAssistantRoutes);    // internal: /ai-coach-assistant
router.use('/', smartNutritionRoutes);      // internal: /nutrition

// Health & Fitness
router.use('/wearables', wearablesRoutes);
router.use('/virtual-training', virtualTrainingRoutes);
router.use('/nutrition', nutritionRoutes);
router.use('/athlete-passport', athletePassportRoutes);

// Platform & Infrastructure (these have internal prefix, mount at /)
router.use('/integration-gateway', integrationGatewayRoutes);
router.use('/offline-sync', offlineSyncRoutes);
router.use('/search', advancedSearchRoutes);
router.use('/', apiDeveloperPlatformRoutes);   // internal: /api-developer-platform
router.use('/', apiPlatformAdvancedRoutes);    // internal: /api-platform
router.use('/', advancedVideoRoutes);          // internal: /videos
router.use('/', whiteLabelPlatformRoutes);     // internal: /white-label
router.use('/white-label-saas', whiteLabelSaasRoutes);
router.use('/franchise-management', franchiseManagementRoutes);
router.use('/localization', localizationRoutes);

// Class-based routes (converted to Express routers)
router.use('/marketing', classToRouter(MarketingRoutes));
router.use('/partners', classToRouter(PartnerRoutes));
router.use('/facilities', classToRouter(FacilityRoutes));
router.use('/observations', classToRouter(ObservationRoutes));

// =============================================
// OBSERVABILITY
// =============================================
router.use('/observability', observabilityRoutes);

// Health & system stubs
router.get('/observability/health', (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            services: { api: 'up', database: 'up', cache: 'up' },
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        }
    });
});

router.get('/observability/alerts', (_req: Request, res: Response) => {
    res.json({ success: true, data: [] });
});

router.get('/system/analytics', (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: { totalUsers: 0, activeUsers: 0, totalLocations: 0, totalBookings: 0, revenue: 0 }
    });
});

// AI Chatbot
router.use('/', aiChatbotRoutes);

// =============================================
// DASHBOARD & ANALYTICS STUBS
// =============================================

// Analytics dashboard endpoint (used by admin dashboard)
router.get('/analytics/dashboard', (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            totalStudents: 0,
            activeClasses: 0,
            totalRevenue: 0,
            attendanceRate: 0,
            enrollmentTrend: 0,
            revenueGrowth: 0,
            totalLocations: 0,
            customerSatisfaction: 0
        }
    });
});

router.get('/analytics/students', (_req: Request, res: Response) => {
    res.json({ success: true, data: { labels: [], datasets: [] } });
});

router.get('/analytics/revenue', (_req: Request, res: Response) => {
    res.json({ success: true, data: { labels: [], datasets: [] } });
});

router.get('/analytics/attendance', (_req: Request, res: Response) => {
    res.json({ success: true, data: { labels: [], datasets: [] } });
});

router.get('/analytics/enrollment-trends', (_req: Request, res: Response) => {
    res.json({ success: true, data: { labels: [], datasets: [] } });
});

// IAM endpoints (used by users page)
router.get('/iam/users', (_req: Request, res: Response) => {
    res.json({ success: true, data: [] });
});

router.get('/iam/roles', (_req: Request, res: Response) => {
    res.json({ success: true, data: [] });
});

router.get('/iam/permissions', (_req: Request, res: Response) => {
    res.json({ success: true, data: [] });
});

// Audit logs endpoint
router.get('/audit/logs', (_req: Request, res: Response) => {
    res.json({ success: true, data: [] });
});

router.post('/audit/logs', (_req: Request, res: Response) => {
    res.json({ success: true, data: { id: 'stub' } });
});

// HQ dashboard overview
router.get('/admin/hq/dashboard', (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            totalLocations: 0, totalFranchises: 0, totalUsers: 0,
            totalRevenue: 0, monthlyRevenue: 0, revenueGrowth: 0,
            activeStudents: 0, conversionRate: 0, pendingApprovals: 0,
            criticalAlerts: 0, warnings: 0
        }
    });
});

router.get('/admin/hq/health', (_req: Request, res: Response) => {
    res.json({ success: true, data: { uptime: 99.9, status: 'healthy' } });
});

// Regional dashboard overview
router.get('/admin/regional/dashboard', (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            regionName: 'Default Region', totalLocations: 0, totalStaff: 0,
            totalStudents: 0, totalRevenue: 0, monthlyRevenue: 0, revenueGrowth: 0,
            occupancyRate: 0, staffUtilization: 0, customerSatisfaction: 0,
            pendingApprovals: 0, criticalAlerts: 0, warnings: 0
        }
    });
});

router.get('/admin/regional/analytics', (_req: Request, res: Response) => {
    res.json({ success: true, data: {} });
});

// Franchise dashboard overview
router.get('/admin/franchise/dashboard', (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            franchiseName: 'Default Franchise', totalLocations: 0, totalStaff: 0,
            totalStudents: 0, totalRevenue: 0, monthlyRevenue: 0, revenueGrowth: 0,
            occupancyRate: 0, staffUtilization: 0, customerSatisfaction: 0,
            pendingApprovals: 0, criticalAlerts: 0, warnings: 0
        }
    });
});

router.get('/admin/franchise/analytics', (_req: Request, res: Response) => {
    res.json({ success: true, data: {} });
});

// Location dashboard overview
router.get('/admin/location/dashboard', (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            locationName: 'Default Location', totalClasses: 0, totalStaff: 0,
            totalStudents: 0, monthlyRevenue: 0, revenueGrowth: 0, occupancyRate: 0,
            staffUtilization: 0, customerSatisfaction: 0, todayClasses: 0,
            todayAttendance: 0, pendingApprovals: 0, criticalAlerts: 0, warnings: 0
        }
    });
});

router.get('/admin/location/analytics', (_req: Request, res: Response) => {
    res.json({ success: true, data: {} });
});

// Payments stats endpoint
router.get('/payments/stats', (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: { totalPayments: 0, totalAmount: 0, pendingPayments: 0, completedPayments: 0 }
    });
});

export default router;
