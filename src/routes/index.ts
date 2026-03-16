
import { Router, Request, Response } from 'express';

import authRoutes from '../modules/iam/auth.routes';
import userRoutes from '../modules/iam/user.routes';
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
import { superAdminRoutes as superadminRoutes } from '../modules/superadmin/superadmin.routes';

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

// Core
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Operations
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
router.use('/superadmin', superadminRoutes);

// Observability
router.use('/observability', observabilityRoutes);

// Audit stub
router.post('/audit/logs', (_req: Request, res: Response) => {
    res.status(200).json({ success: true });
});

// Superadmin dashboard stubs
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

export default router;
