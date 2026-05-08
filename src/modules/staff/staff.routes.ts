import { Router } from 'express';
import { StaffController } from './staff.controller';
import { authenticate, authorize } from '../iam/auth.middleware';
import { validateLocationScope } from '../iam/rbac.middleware';
import { UserRole } from '../../shared/enums';

const router = Router();
const staffController = new StaffController();

// Apply authentication middleware to all routes
router.use(authenticate);

// ==================== COACH MANAGEMENT ROUTES ====================
// These must come before /:staffId to avoid route conflicts
router.get('/coaches', staffController.getCoaches);
router.post('/coaches', authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN, UserRole.FRANCHISE_OWNER, UserRole.LOCATION_MANAGER), validateLocationScope(), staffController.createCoachWithUser);
router.get('/coaches/statistics', staffController.getCoachStatistics);

// Staff CRUD routes (non-parameterized first)
router.post('/', staffController.createStaff);
router.get('/', staffController.getStaffMembers);

// Staff availability routes
router.put('/availability', staffController.updateStaffAvailability);

// Staff scheduling routes
router.post('/schedules', staffController.createStaffSchedule);
router.get('/schedules', staffController.getStaffSchedules);
router.patch('/schedules/:scheduleId/status', staffController.updateScheduleStatus);

// Time off management routes
router.post('/time-off-requests', staffController.submitTimeOffRequest);

// Attendance routes
router.post('/check-in', staffController.checkInStaff);
router.get('/attendance', staffController.getStaffAttendance);

// Statistics routes
router.get('/statistics/overview', staffController.getStaffStatistics);
router.get('/statistics/attendance', staffController.getAttendanceStatistics);

// Support Staff Dashboard routes
router.get('/dashboard', staffController.getSupportDashboard);
router.get('/tickets', staffController.getSupportTickets);
router.post('/tickets', staffController.createSupportTicket);
router.put('/tickets/:ticketId', staffController.updateSupportTicket);
router.delete('/tickets/:ticketId', staffController.deleteSupportTicket);
router.get('/inquiries', staffController.getCustomerInquiries);
router.put('/inquiries/:inquiryId', staffController.updateInquiry);
router.post('/inquiries/:inquiryId/respond', staffController.respondToInquiry);
router.get('/knowledge-base', staffController.getKnowledgeBaseArticles);
router.post('/knowledge-base', staffController.createKnowledgeBaseArticle);
router.put('/knowledge-base/:articleId', staffController.updateKnowledgeBaseArticle);
router.delete('/knowledge-base/:articleId', staffController.deleteKnowledgeBaseArticle);
router.get('/analytics', staffController.getSupportAnalytics);
router.get('/settings', staffController.getStaffSettings);
router.put('/settings', staffController.updateStaffSettings);

// Live Chat routes
router.get('/live-chat/sessions', staffController.getLiveChatSessions);
router.post('/live-chat/sessions', staffController.createChatSession);
router.get('/live-chat/:chatId/messages', staffController.getChatMessages);
router.post('/live-chat/:chatId/messages', staffController.sendChatMessage);

// Escalations
router.get('/escalations', staffController.getEscalations);
router.post('/escalations', staffController.createEscalation);
router.put('/escalations/:escalationId', staffController.updateEscalation);
router.delete('/escalations/:escalationId', staffController.deleteEscalation);

// Schedules (Advanced) - Support Staff Schedules
router.get('/schedules-advanced', staffController.getStaffSchedulesAdvanced);
router.post('/schedules-advanced', staffController.createSupportSchedule);
router.put('/schedules-advanced/:scheduleId', staffController.updateSupportSchedule);
router.delete('/schedules-advanced/:scheduleId', staffController.deleteSupportSchedule);

// Training
router.get('/training/modules', staffController.getTrainingModules);
router.get('/training/paths', staffController.getTrainingPaths);
router.get('/training/progress', staffController.getUserTrainingProgress);

// Reports
router.post('/reports/generate', staffController.generateReport);
router.delete('/reports/:reportId', staffController.deleteReport);
router.get('/reports/:type', staffController.getReports);

// Automation
router.get('/automation/rules', staffController.getAutomationRules);
router.post('/automation/rules', staffController.createAutomationRule);
router.put('/automation/rules/:ruleId', staffController.updateAutomationRule);
router.delete('/automation/rules/:ruleId', staffController.deleteAutomationRule);

// Quality Assurance
router.get('/quality/metrics', staffController.getQualityMetrics);
router.get('/quality/reviews', staffController.getQualityReviews);

// Communication
router.get('/communication/announcements', staffController.getAnnouncements);
router.post('/communication/announcements', staffController.createAnnouncement);
router.delete('/communication/announcements/:announcementId', staffController.deleteAnnouncement);
router.get('/communication/messages', staffController.getTeamMessages);
router.post('/communication/messages', staffController.sendTeamMessage);
router.delete('/communication/messages/:messageId', staffController.deleteTeamMessage);

// Parameterized staff routes MUST come last (/:staffId catches everything)
router.get('/:staffId', staffController.getStaffById);
router.put('/:staffId', staffController.updateStaff);
router.delete('/:staffId', staffController.deleteStaff);
router.patch('/:staffId/time-off-requests/:requestId', staffController.processTimeOffRequest);
router.patch('/:staffId/check-out', staffController.checkOutStaff);
router.post('/:staffId/certifications', staffController.addStaffCertification);
router.put('/:staffId/certifications/:certificationId', staffController.updateStaffCertification);
router.post('/:staffId/background-checks', staffController.addBackgroundCheck);
router.get('/:staffId/performance', staffController.getStaffPerformance);
router.put('/:staffId/performance', staffController.updateStaffPerformance);

// Support Staff Dashboard routes
router.get('/dashboard', staffController.getSupportDashboard);
router.get('/tickets', staffController.getSupportTickets);
router.post('/tickets', staffController.createSupportTicket);
router.put('/tickets/:ticketId', staffController.updateSupportTicket);
router.get('/inquiries', staffController.getCustomerInquiries);
router.post('/inquiries/:inquiryId/respond', staffController.respondToInquiry);
router.get('/knowledge-base', staffController.getKnowledgeBaseArticles);
router.post('/knowledge-base', staffController.createKnowledgeBaseArticle);
router.put('/knowledge-base/:articleId', staffController.updateKnowledgeBaseArticle);
router.delete('/knowledge-base/:articleId', staffController.deleteKnowledgeBaseArticle);
router.get('/analytics', staffController.getSupportAnalytics);
router.get('/settings', staffController.getStaffSettings);
router.put('/settings', staffController.updateStaffSettings);

// Live Chat routes
router.get('/live-chat/sessions', staffController.getLiveChatSessions);
router.get('/live-chat/:chatId/messages', staffController.getChatMessages);
router.post('/live-chat/:chatId/messages', staffController.sendChatMessage);

// Advanced Features routes
// Live Chat
router.get('/live-chat/sessions', staffController.getLiveChatSessions);
router.get('/live-chat/:chatId/messages', staffController.getChatMessages);
router.post('/live-chat/:chatId/messages', staffController.sendChatMessage);

// Escalations
router.get('/escalations', staffController.getEscalations);
router.post('/escalations', staffController.createEscalation);

// Schedules (Advanced)
router.get('/schedules-advanced', staffController.getStaffSchedulesAdvanced);

// Training
router.get('/training/modules', staffController.getTrainingModules);
router.get('/training/paths', staffController.getTrainingPaths);
router.get('/training/progress', staffController.getUserTrainingProgress);

// Reports
router.get('/reports/:type', staffController.getReports);

// Automation
router.get('/automation/rules', staffController.getAutomationRules);

// Quality Assurance
router.get('/quality/metrics', staffController.getQualityMetrics);

// Communication
router.get('/communication/announcements', staffController.getAnnouncements);

export { router as staffRoutes };
