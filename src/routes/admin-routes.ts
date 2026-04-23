import { Router } from 'express';

// Import existing route modules
import { staffRoutes } from '../modules/staff/staff.routes';
import attendanceRoutes from '../modules/attendance/attendance.routes';
import bookingRoutes from '../modules/booking/booking.routes';
import paymentsRoutes from '../modules/payments/payments.routes';
import billingRoutes from '../modules/billing/billing.routes';
import financialLedgerRoutes from '../modules/financial-ledger/financial-ledger.routes';
import programRoutes from '../modules/programs/program.routes';
import rulesRoutes from '../modules/rules/rule.routes';
import schedulingRoutes from '../modules/scheduling/schedule.routes';
import notificationsRoutes from '../modules/notifications/notifications.routes';
import { notificationTemplateRoutes } from '../modules/notifications/notification-template.routes';
import crmRoutes from '../modules/crm/crm.routes';
import reportingRoutes from '../modules/reporting/reporting.routes';
import supportRoutes from '../modules/support/support.routes';
import userRoutes from '../modules/iam/user.routes';
import advancedSearchRoutes from '../modules/advanced-search/search.routes';
import aiChatbotRoutes from '../modules/ai-chatbot/ai-chatbot.routes';

const router = Router();

// =============================================
// ADMIN OPERATIONS ALIASES
// Frontend calls /admin/operations/staff, /admin/operations/attendance, /admin/operations/bookings
// Backend has /staff, /attendance, /bookings
// =============================================
router.use('/admin/operations/staff', staffRoutes);
router.use('/admin/operations/attendance', attendanceRoutes);
router.use('/admin/operations/bookings', bookingRoutes);

// =============================================
// ADMIN FINANCE ALIASES
// Frontend calls /admin/finance/payments, /admin/finance/ledger, /admin/finance/revenue
// Backend has /payments, /billing, /financial-ledger
// =============================================
router.use('/admin/finance/payments', paymentsRoutes);
router.use('/admin/finance/billing', billingRoutes);
router.use('/admin/finance/ledger', financialLedgerRoutes);

// =============================================
// ADMIN PROGRAMS ALIASES
// Frontend calls /admin/programs/catalog, /admin/programs/rules, /admin/programs/schedule
// =============================================
router.use('/admin/programs', programRoutes);
router.use('/admin/programs/rules', rulesRoutes);
router.use('/admin/programs/schedule', schedulingRoutes);

// =============================================
// ADMIN COMMUNICATIONS ALIASES
// Frontend calls /admin/communications/notifications, /admin/communications/templates, /admin/communications/crm
// =============================================
router.use('/admin/communications/notifications', notificationsRoutes);
router.use('/admin/communications/templates', notificationTemplateRoutes);
router.use('/admin/communications/crm', crmRoutes);

// =============================================
// ADMIN REPORTS ALIASES
// Frontend calls /admin/reports/*
// =============================================
router.use('/admin/reports', reportingRoutes);

// =============================================
// ADMIN SUPPORT ALIASES
// Frontend calls /admin/support/knowledge, /admin/support/tickets
// =============================================
router.use('/admin/support', supportRoutes);

// =============================================
// ADMIN USERS ALIASES
// Frontend calls /admin/users
// =============================================
router.use('/admin/users', userRoutes);

// =============================================
// ADMIN ANALYTICS ALIASES
// Frontend calls /admin/analytics/*
// =============================================
router.use('/admin/analytics', reportingRoutes);

// =============================================
// ADMIN AI ALIASES
// Frontend calls /admin/ai/*
// =============================================
router.use('/admin/ai', aiChatbotRoutes);

// =============================================
// ADMIN SEARCH
// =============================================
router.use('/admin/search', advancedSearchRoutes);

export default router;
