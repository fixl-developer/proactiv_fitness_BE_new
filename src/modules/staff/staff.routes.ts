import { Router } from 'express';
import { StaffController } from './staff.controller';
import { authenticate } from '../iam/auth.middleware';

const router = Router();
const staffController = new StaffController();

// Apply authentication middleware to all routes
router.use(authenticate);

// Staff CRUD routes
router.post('/staff', staffController.createStaff);
router.get('/staff', staffController.getStaffMembers);
router.get('/staff/:staffId', staffController.getStaffById);
router.put('/staff/:staffId', staffController.updateStaff);
router.delete('/staff/:staffId', staffController.deleteStaff);

// Staff availability routes
router.put('/staff/availability', staffController.updateStaffAvailability);

// Staff scheduling routes
router.post('/staff/schedules', staffController.createStaffSchedule);
router.get('/staff/schedules', staffController.getStaffSchedules);
router.patch('/staff/schedules/:scheduleId/status', staffController.updateScheduleStatus);

// Time off management routes
router.post('/staff/time-off-requests', staffController.submitTimeOffRequest);
router.patch('/staff/:staffId/time-off-requests/:requestId', staffController.processTimeOffRequest);

// Attendance routes
router.post('/staff/check-in', staffController.checkInStaff);
router.patch('/staff/:staffId/check-out', staffController.checkOutStaff);
router.get('/staff/attendance', staffController.getStaffAttendance);

// Certification routes
router.post('/staff/:staffId/certifications', staffController.addStaffCertification);
router.put('/staff/:staffId/certifications/:certificationId', staffController.updateStaffCertification);

// Background check routes
router.post('/staff/:staffId/background-checks', staffController.addBackgroundCheck);

// Performance routes
router.get('/staff/:staffId/performance', staffController.getStaffPerformance);
router.put('/staff/:staffId/performance', staffController.updateStaffPerformance);

// Statistics routes
router.get('/staff/statistics/overview', staffController.getStaffStatistics);
router.get('/staff/statistics/attendance', staffController.getAttendanceStatistics);

// Support Staff Dashboard routes
router.get('/staff/dashboard', staffController.getSupportDashboard);
router.get('/staff/tickets', staffController.getSupportTickets);
router.post('/staff/tickets', staffController.createSupportTicket);
router.put('/staff/tickets/:ticketId', staffController.updateSupportTicket);
router.get('/staff/inquiries', staffController.getCustomerInquiries);
router.post('/staff/inquiries/:inquiryId/respond', staffController.respondToInquiry);
router.get('/staff/knowledge-base', staffController.getKnowledgeBaseArticles);
router.post('/staff/knowledge-base', staffController.createKnowledgeBaseArticle);
router.put('/staff/knowledge-base/:articleId', staffController.updateKnowledgeBaseArticle);
router.delete('/staff/knowledge-base/:articleId', staffController.deleteKnowledgeBaseArticle);
router.get('/staff/analytics', staffController.getSupportAnalytics);
router.get('/staff/settings', staffController.getStaffSettings);
router.put('/staff/settings', staffController.updateStaffSettings);

// Live Chat routes
router.get('/staff/live-chat/sessions', staffController.getLiveChatSessions);
router.get('/staff/live-chat/:chatId/messages', staffController.getChatMessages);
router.post('/staff/live-chat/:chatId/messages', staffController.sendChatMessage);

// Advanced Features routes
// Live Chat
router.get('/staff/live-chat/sessions', staffController.getLiveChatSessions);
router.get('/staff/live-chat/:chatId/messages', staffController.getChatMessages);
router.post('/staff/live-chat/:chatId/messages', staffController.sendChatMessage);

// Escalations
router.get('/staff/escalations', staffController.getEscalations);
router.post('/staff/escalations', staffController.createEscalation);

// Schedules (Advanced)
router.get('/staff/schedules-advanced', staffController.getStaffSchedulesAdvanced);

// Training
router.get('/staff/training/modules', staffController.getTrainingModules);
router.get('/staff/training/paths', staffController.getTrainingPaths);
router.get('/staff/training/progress', staffController.getUserTrainingProgress);

// Reports
router.get('/staff/reports/:type', staffController.getReports);

// Automation
router.get('/staff/automation/rules', staffController.getAutomationRules);

// Quality Assurance
router.get('/staff/quality/metrics', staffController.getQualityMetrics);

// Communication
router.get('/staff/communication/announcements', staffController.getAnnouncements);

export { router as staffRoutes };
