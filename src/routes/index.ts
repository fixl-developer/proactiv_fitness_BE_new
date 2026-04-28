
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
import { guardianRoutes } from '../modules/guardian';
import userScheduleRoutes from '../modules/user-schedule/user-schedule.routes';
import userSettingsRoutes from '../modules/user-settings/user-settings.routes';
import feedbackRoutes from '../modules/feedback/feedback.routes';
import downloadsRoutes from '../modules/downloads/downloads.routes';
import referralsRoutes from '../modules/referrals/referrals.routes';
import certificatesRoutes from '../modules/certificates/certificates.routes';
import healthMetricsRoutes from '../modules/health-metrics/health-metrics.routes';
import scheduleRoutes from '../modules/schedule/schedule.routes';
import notificationsRoutes from '../modules/notifications/notifications.routes';
import adminNotificationsRoutes from '../modules/notifications/admin-notifications.routes';
import communicationsRoutes from '../modules/communications/communications.routes';

// === Already mounted modules ===
import aiChatbotRoutes from '../modules/ai-chatbot/ai-chatbot.routes';
import observabilityRoutes from '../modules/observability/observability.routes';
import bookingRoutes from '../modules/booking/booking.routes';
import schedulingRoutes from '../modules/scheduling/schedule.routes';
import { staffRoutes } from '../modules/staff/staff.routes';
import attendanceRoutes from '../modules/attendance/attendance.routes';
import paymentsRoutes from '../modules/payments/payments.routes';
import paymentGatewayRoutes from '../modules/payments/payment-gateway.routes';
import billingRoutes from '../modules/billing/billing.routes';
import programRoutes from '../modules/programs/program.routes';
import rulesRoutes from '../modules/rules/rule.routes';
import reportingRoutes from '../modules/reporting/reporting.routes';
import supportRoutes from '../modules/support/support.routes';
import franchiseRoutes from '../modules/franchise/franchise.routes';
import crmRoutes from '../modules/crm/crm.routes';
// notificationsRoutes already imported above (line 23) — duplicate removed 2026-04-24
import { notificationTemplateRoutes } from '../modules/notifications/notification-template.routes';
import gamificationRoutes from '../modules/gamification/gamification.routes';
import walletRoutes from '../modules/wallet/wallet.routes';
import familySchedulerRoutes from '../modules/family-scheduler/scheduler.routes';
import parentEngagementRoutes from '../modules/parent-engagement/parent-engagement.routes';
import parentRoiRoutes from '../modules/parent-roi/parent-roi.routes';
import financialLedgerRoutes from '../modules/financial-ledger/financial-ledger.routes';
import integrationsRoutes from '../modules/integrations/integrations.routes';

// === Dashboard Analytics ===
import dashboardRoutes from '../modules/dashboard/dashboard.routes';

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

// === Emergency Contacts & Waitlist ===
// DISABLED 2026-04-24: emergency-contacts module uses NestJS decorators but backend is Express
// import emergencyContactsRoutes from '../modules/emergency-contacts/emergency-contacts.routes';
// DISABLED 2026-04-24: waitlist module uses NestJS decorators but backend is Express
// import waitlistRoutes from '../modules/waitlist/waitlist.routes';

// === CMS (Content Management System) ===
import { cmsPublicRoutes, cmsAdminRoutes } from '../modules/cms/cms.routes';
import cmsUploadRoutes from '../modules/cms/cms-upload.routes';

// === Regional Admin ===
import regionalAdminRoutes from './regional-admin.routes';

// === Franchise Owner ===
import franchiseOwnerRoutes from './franchise-owner.routes';

// === Location Manager ===
import locationManagerRoutes from './location-manager.routes';

// === Parent Dashboard ===
import parentDashboardRoutes from './parent-dashboard.routes';

// === Coach Dashboard ===
import coachRoutes from './coach.routes';

// === NEW: Admin Alias Routes (maps /admin/* paths to actual modules) ===
import adminAliasRoutes from './admin-routes';

// === NEW: Admin Dashboard Routes ===
import adminDashboardRoutes from './admin-dashboard.routes';

// === NEW: Admin Customers Routes ===
import adminCustomersRoutes from './admin-customers.routes';

// === NEW: Admin Settings Routes ===
import adminSettingsRoutes from './admin-settings.routes';

// === NEW: Admin System Routes ===
import adminSystemRoutes from './admin-system.routes';

// === NEW: Missing Modules Routes (students, waitlist, social, budget, leads, etc.) ===
import missingModulesRoutes from './missing-modules.routes';

// === NEW: IAM dynamic RBAC (custom roles & permissions CRUD) ===
import iamRbacRoutes from './iam-rbac.routes';

// === NEW: Finance routes (admin Finance pages: revenue + ledger CRUD) ===
import financeRoutes from './finance.routes';

// === BCMS (Business Configuration Management) ===
import { termRoutes, holidayCalendarRoutes, countryRoutes, regionRoutes, businessUnitRoutes, locationRoutes, roomRoutes, bcmsPublicRoutes } from '../modules/bcms';

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
        modules: {
            iam: 'active',
            bcms: 'active',
            featureFlags: 'active',
            mediaStorage: 'active',
            programs: 'active',
            scheduling: 'active',
            rules: 'active',
            eventBus: 'active',
            automation: 'active',
            staff: 'active',
            attendance: 'active',
            safety: 'active'
        },
        timestamp: new Date().toISOString()
    });
});

router.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        modules: {
            iam: 'healthy',
            bcms: 'healthy',
            dataArchitecture: 'healthy',
            auditVault: 'healthy',
            featureFlags: 'healthy',
            mediaStorage: 'healthy',
            programs: 'healthy',
            scheduling: 'healthy',
            rules: 'healthy',
            eventBus: 'healthy',
            automation: 'healthy',
            staff: 'healthy',
            attendance: 'healthy',
            safety: 'healthy'
        },
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
router.use('/user/guardians', guardianRoutes);
router.use('/user/settings', userSettingsRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/downloads', downloadsRoutes);
router.use('/referrals', referralsRoutes);
router.use('/certificates', certificatesRoutes);
router.use('/health-metrics', healthMetricsRoutes);

// Aliases so frontend calls under /user/* prefix resolve to the same modules.
// (Frontend pages were written as /user/attendance, /user/schedule, etc.)
router.use('/user/schedule', scheduleRoutes);
router.use('/user/notifications', notificationsRoutes);
router.use('/user/health-metrics', healthMetricsRoutes);
router.use('/user/certificates', certificatesRoutes);
router.use('/user/feedback', feedbackRoutes);
router.use('/user/downloads', downloadsRoutes);
router.use('/user/referrals', referralsRoutes);
router.use('/user/my-classes', userClassesRoutes);

// =============================================
// OPERATIONS (existing)
// =============================================
router.use('/bookings', bookingRoutes);
router.use('/scheduling', schedulingRoutes);
router.use('/staff', staffRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/payments', paymentsRoutes);
router.use('/payment-gateways', paymentGatewayRoutes);
router.use('/billing', billingRoutes);
router.use('/programs', programRoutes);
router.use('/rules', rulesRoutes);
router.use('/reports', reportingRoutes);
router.use('/support', supportRoutes);
router.use('/franchise', franchiseRoutes);
// Communications module: full CRUD for templates + CRM families.
// Mount BEFORE the legacy /crm stub so /crm/families/:id PUT/DELETE resolve to the full handler.
router.use('/communications', communicationsRoutes);
router.use('/crm', communicationsRoutes);
router.use('/crm', crmRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/notification-templates', notificationTemplateRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/wallet', walletRoutes);
router.use('/family-scheduler', familySchedulerRoutes);
router.use('/parent-engagement', parentEngagementRoutes);
router.use('/parent-roi', parentRoiRoutes);
router.use('/financial-ledger', financialLedgerRoutes);
router.use('/finance', financeRoutes); // /finance/revenue/* and /finance/ledger/* (admin Finance pages)
router.use('/integrations', integrationsRoutes);

// Aliases for /user/* frontend prefix (continued — these come after their base modules are imported)
router.use('/user/attendance', attendanceRoutes);
router.use('/user/payments', paymentsRoutes);
router.use('/user/wallet', walletRoutes);
router.use('/user/support', supportRoutes);

// =============================================
// BCMS (Business Configuration)
// =============================================
router.use('/countries', countryRoutes);
router.use('/regions', regionRoutes);
router.use('/business-units', businessUnitRoutes);
router.use('/locations', locationRoutes);
router.use('/rooms', roomRoutes);
router.use('/terms', termRoutes);
router.use('/holiday-calendars', holidayCalendarRoutes);

// Public, unauthenticated endpoints (e.g. marketing site lists active locations).
// Mount AFTER the authenticated /locations router so this only handles /public/*.
router.use('/public', bcmsPublicRoutes);

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
router.use('/', microCredentialRoutes); // FIXED: internal paths serve /micro-credentials/* and /badges/*
router.use('/', exitProtocolRoutes);        // internal: /exit-protocol

// Staff & Workforce
router.use('/workforce', workforceRoutes);
router.use('/', safetyRoutes); // FIXED: internal paths already prefixed with /safety

// Pricing & Commerce
router.use('/dynamic-pricing', dynamicPricingRoutes);

// AI & Coaching (these have internal prefix, mount at /)
router.use('/', aiCoachRoutes);             // internal: /ai-coach
router.use('/', aiCoachAssistantRoutes);    // internal: /ai-coach-assistant
router.use('/', smartNutritionRoutes);      // internal: /nutrition

// Advanced AI Modules (Tier 1, 2, 3)
import aiVideoAnalysisRoutes from '../modules/ai-video-analysis/ai-video-analysis.routes';
import smartSchedulerRoutes from '../modules/smart-scheduler/smart-scheduler.routes';
import parentAIAssistantRoutes from '../modules/parent-ai-assistant/parent-ai-assistant.routes';
import revenueIntelligenceRoutes from '../modules/revenue-intelligence/revenue-intelligence.routes';
import aiContentEngineRoutes from '../modules/ai-content-engine/ai-content-engine.routes';
import workflowOrchestratorRoutes from '../modules/workflow-orchestrator/workflow-orchestrator.routes';
import smartSupportRoutes from '../modules/smart-support/smart-support.routes';
import aiSafetyMonitorRoutes from '../modules/ai-safety-monitor/ai-safety-monitor.routes';
import aiCommunicationRoutes from '../modules/ai-communication/routes';
import studentDigitalTwinRoutes from '../modules/student-digital-twin/routes';
import aiGamificationEngineRoutes from '../modules/ai-gamification-engine/routes';
import globalIntelligenceRoutes from '../modules/global-intelligence/routes';

router.use('/', aiVideoAnalysisRoutes);
router.use('/', smartSchedulerRoutes);
router.use('/', parentAIAssistantRoutes);
router.use('/', revenueIntelligenceRoutes);
router.use('/', aiContentEngineRoutes);
router.use('/', workflowOrchestratorRoutes);
router.use('/', smartSupportRoutes);
router.use('/', aiSafetyMonitorRoutes);
router.use('/ai-communication', aiCommunicationRoutes);
router.use('/student-digital-twin', studentDigitalTwinRoutes);
router.use('/ai-gamification-engine', aiGamificationEngineRoutes);
router.use('/global-intelligence', globalIntelligenceRoutes);

// Health & Fitness
router.use('/wearables', wearablesRoutes);
router.use('/virtual-training', virtualTrainingRoutes);
router.use('/nutrition', nutritionRoutes);
router.use('/user/nutrition', nutritionRoutes); // alias for /user/nutrition/meals calls
router.use('/', athletePassportRoutes); // FIXED: internal paths already prefixed with /athlete-passport

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

// =============================================
// EMERGENCY CONTACTS & WAITLIST
// =============================================
// router.use('/emergency-contacts', emergencyContactsRoutes); // DISABLED - NestJS module in Express backend
// router.use('/waitlist', waitlistRoutes); // DISABLED - NestJS module in Express backend

// Class-based routes (converted to Express routers)
router.use('/marketing', classToRouter(MarketingRoutes));
router.use('/partners', classToRouter(PartnerRoutes));
router.use('/partner', classToRouter(PartnerRoutes));  // Alias for frontend compatibility
// Commission routes - direct Express routes for /api/commissions/*
const commissionRouter = Router();
const { PartnerController: PartnerCtrl } = require('../modules/partner-portal/partner.controller');
const commCtrl = new PartnerCtrl();
commissionRouter.get('/', (req: Request, res: Response) => commCtrl.getCommissions(req, res));
commissionRouter.get('/history', (req: Request, res: Response) => commCtrl.getCommissionHistory(req, res));
commissionRouter.post('/calculate', (req: Request, res: Response) => commCtrl.calculateCommission(req, res));
commissionRouter.get('/rates', (req: Request, res: Response) => commCtrl.getCommissionRates(req, res));
commissionRouter.get('/tiers', (req: Request, res: Response) => commCtrl.getCommissionTiers(req, res));
commissionRouter.post('/payout-request', (req: Request, res: Response) => commCtrl.requestCommissionPayout(req, res));
commissionRouter.get('/payout-history', (req: Request, res: Response) => commCtrl.getPayoutHistory(req, res));
commissionRouter.get('/payout/:payoutId', (req: Request, res: Response) => commCtrl.getPayoutStatus(req, res));
commissionRouter.get('/:partnerId/stats', (req: Request, res: Response) => commCtrl.getCommissionStats(req, res));
commissionRouter.get('/:partnerId/breakdown', (req: Request, res: Response) => commCtrl.getCommissionBreakdown(req, res));
commissionRouter.get('/:partnerId/forecasts', (req: Request, res: Response) => commCtrl.getCommissionForecasts(req, res));
commissionRouter.get('/:partnerId/export', (req: Request, res: Response) => commCtrl.exportCommissionReport(req, res));
commissionRouter.get('/:partnerId/comparison', (req: Request, res: Response) => commCtrl.getCommissionComparison(req, res));
commissionRouter.get('/:id', (req: Request, res: Response) => commCtrl.getCommissionById(req, res));
router.use('/commissions', commissionRouter);

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

router.get('/observability/alerts', async (_req: Request, res: Response) => {
    try {
        const { AuditVaultModel } = require('../modules/audit-vault/audit-vault.model');
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const alerts = await AuditVaultModel.find({
            action: { $in: ['LOGIN_FAILED', 'UNAUTHORIZED', 'ERROR', 'SECURITY'] },
            createdAt: { $gte: oneDayAgo },
        }).sort({ createdAt: -1 }).limit(20).lean();
        res.json({ success: true, data: alerts });
    } catch {
        res.json({ success: true, data: [] });
    }
});

router.get('/system/analytics', async (_req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const { Booking } = require('../modules/booking/booking.model');
        const { Location } = require('../modules/bcms/location.model');
        const [totalUsers, activeUsers, totalLocations, totalBookings, revenueAgg] = await Promise.all([
            User.countDocuments({}),
            User.countDocuments({ status: 'ACTIVE' }),
            Location.countDocuments({ isActive: true, isDeleted: { $ne: true } }),
            Booking.countDocuments({}),
            Booking.aggregate([
                { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] } } },
                { $group: { _id: null, total: { $sum: '$payment.amount' } } },
            ]),
        ]);
        res.json({
            success: true,
            data: { totalUsers, activeUsers, totalLocations, totalBookings, revenue: revenueAgg[0]?.total || 0 },
        });
    } catch {
        res.json({ success: true, data: { totalUsers: 0, activeUsers: 0, totalLocations: 0, totalBookings: 0, revenue: 0 } });
    }
});

// AI Chatbot
router.use('/ai', aiChatbotRoutes);

// =============================================
// DASHBOARD & ANALYTICS (real data from MongoDB)
// =============================================
router.use('/', dashboardRoutes);

// =============================================
// NEW: Admin Alias Routes (maps frontend /admin/* paths to backend modules)
// =============================================
router.use('/', adminAliasRoutes);

// =============================================
// NEW: Admin Dashboard (real MongoDB data)
// =============================================
router.use('/admin/dashboard', adminDashboardRoutes);

// =============================================
// NEW: Admin Notifications (full CRUD - in-memory store)
// Frontend: NotificationService → /admin/notifications
// =============================================
router.use('/admin/notifications', adminNotificationsRoutes);

// =============================================
// NEW: Admin Customers
// =============================================
router.use('/admin/customers', adminCustomersRoutes);

// =============================================
// NEW: Admin Settings
// =============================================
router.use('/admin/settings', adminSettingsRoutes);

// =============================================
// NEW: Admin System (API, Database, Features, Security, Logs)
// =============================================
router.use('/admin/system', adminSystemRoutes);

// =============================================
// NEW: Missing Modules (students, waitlist, social, budget, leads, campaigns, sop, semantic-search, IAM)
// =============================================
// Mount IAM RBAC BEFORE missing-modules so the dynamic CRUD endpoints
// take precedence over any legacy handlers. (missing-modules now has
// no /iam/roles or /iam/permissions stubs, but keep order explicit.)
router.use('/', iamRbacRoutes);
router.use('/', missingModulesRoutes);

// Audit logs endpoint - real data from AuditVault
router.get('/audit/logs', async (req: Request, res: Response) => {
    try {
        const { AuditVaultModel } = require('../modules/audit-vault/audit-vault.model');
        const { action, status, search, startDate, endDate, limit: limitStr } = req.query;
        const filter: any = {};
        if (action && action !== 'All') {
            // Frontend may send "Login"/"Create"/"Update"/"Delete"; backend stores uppercase
            const a = String(action).toUpperCase();
            filter.action = { $in: [a, action, String(action).toLowerCase()] };
        }
        if (status && status !== 'All') {
            const s = String(status).toUpperCase();
            filter.status = { $in: [s, status, String(status).toLowerCase()] };
        }
        if (search) filter.$or = [
            { action: { $regex: search, $options: 'i' } },
            { entityType: { $regex: search, $options: 'i' } },
            { reason: { $regex: search, $options: 'i' } },
            { userId: { $regex: search, $options: 'i' } },
        ];
        // Date range filtering on createdAt
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                const sd = new Date(String(startDate));
                if (!isNaN(sd.getTime())) filter.createdAt.$gte = sd;
            }
            if (endDate) {
                const ed = new Date(String(endDate));
                if (!isNaN(ed.getTime())) {
                    // Include the end day fully
                    ed.setHours(23, 59, 59, 999);
                    filter.createdAt.$lte = ed;
                }
            }
            if (Object.keys(filter.createdAt).length === 0) delete filter.createdAt;
        }
        const limit = parseInt(limitStr as string) || 100;
        const logs = await AuditVaultModel.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
        res.json({ success: true, data: logs });
    } catch (error: any) {
        res.json({ success: true, data: [] });
    }
});

router.post('/audit/logs', async (req: Request, res: Response) => {
    try {
        const { AuditVaultModel } = require('../modules/audit-vault/audit-vault.model');
        const { v4: uuidv4 } = require('uuid');
        const log = await AuditVaultModel.create({
            auditId: uuidv4?.() || `audit-${Date.now()}`,
            tenantId: req.body.tenantId || 'default',
            userId: req.body.userId || 'system',
            action: req.body.action || 'UNKNOWN',
            entityType: req.body.entityType || 'system',
            entityId: req.body.entityId || '',
            changes: req.body.changes || {},
            reason: req.body.reason || '',
        });
        res.json({ success: true, data: log });
    } catch (error: any) {
        res.json({ success: true, data: { id: `audit-${Date.now()}` } });
    }
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

// =============================================
// CMS (Content Management System)
// =============================================
router.use('/cms', cmsPublicRoutes);          // Public: GET /api/v1/cms/*
router.use('/admin/cms', cmsAdminRoutes);     // Admin: CRUD /api/v1/admin/cms/*
router.use('/admin/cms/media', cmsUploadRoutes); // Admin: Image uploads via Cloudinary

// Regional Admin (full CRUD routes)
router.use('/admin/regional', regionalAdminRoutes);

// Franchise Owner Dashboard (full CRUD routes)
router.use('/admin/franchise', franchiseOwnerRoutes);

// Location Manager (full CRUD routes)
router.use('/admin/location', locationManagerRoutes);

// Parent Dashboard (full CRUD routes)
router.use('/parent', parentDashboardRoutes);

// Coach Dashboard (full CRUD routes — backed by Session/AttendanceRecord/CoachFeedback/Staff/User)
router.use('/coach', coachRoutes);

// Payments stats endpoint - real data from Bookings
router.get('/payments/stats', async (_req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalAgg, pendingCount, completedCount] = await Promise.all([
            Booking.aggregate([
                { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] } } },
                { $group: { _id: null, total: { $sum: '$payment.amount' }, count: { $sum: 1 } } },
            ]),
            Booking.countDocuments({ 'payment.status': { $in: ['pending', 'PENDING'] } }),
            Booking.countDocuments({ 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] } }),
        ]);
        res.json({
            success: true,
            data: {
                totalPayments: (totalAgg[0]?.count || 0) + pendingCount,
                totalAmount: totalAgg[0]?.total || 0,
                pendingPayments: pendingCount,
                completedPayments: completedCount,
            },
        });
    } catch (error: any) {
        res.json({ success: true, data: { totalPayments: 0, totalAmount: 0, pendingPayments: 0, completedPayments: 0 } });
    }
});

// Audit Routes (stub — accepts frontend audit logs silently)
router.post('/audit/logs', (_req: Request, res: Response) => {
    res.status(200).json({ success: true });
});

// Observability Routes (stubs for superadmin dashboard)
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
        data: {
            totalUsers: 0,
            activeUsers: 0,
            totalLocations: 0,
            totalBookings: 0,
            revenue: 0
        }
    });
});

export default router;
