import { Router } from 'express';
import { StaffController } from './staff.controller';
import { authenticate } from '../iam/auth.middleware';

const router = Router();
const staffController = new StaffController();

// Apply authentication middleware to all routes
router.use(authenticate);

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
router.post('/live-chat/sessions', staffController.createChatSession);
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
router.get('/quality/reviews', staffController.getQualityReviews);

// Communication
router.get('/communication/announcements', staffController.getAnnouncements);

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

export { router as staffRoutes };
