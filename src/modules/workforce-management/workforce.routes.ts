// Workforce Management Routes

import { Router } from 'express';
import { WorkforceController } from './workforce.controller';

const router = Router();
const controller = new WorkforceController();

// ==================== Staff Profile Management ====================
router.post('/staff', controller.createStaffProfile);
router.get('/staff', controller.listStaffProfiles);
router.get('/staff/:staffId', controller.getStaffProfile);
router.put('/staff/:staffId', controller.updateStaffProfile);

// ==================== Certification Management ====================
router.post('/staff/:staffId/certifications', controller.addCertification);
router.get('/staff/:staffId/certifications', controller.getCertifications);
router.get('/certifications/expiring', controller.getExpiringCertifications);

// ==================== Leave Management ====================
router.post('/staff/:staffId/leave-requests', controller.requestLeave);
router.put('/leave-requests/:leaveRequestId/approve', controller.approveLeaveRequest);
router.put('/leave-requests/:leaveRequestId/reject', controller.rejectLeaveRequest);
router.get('/staff/:staffId/leave-requests', controller.getLeaveRequests);
router.get('/staff/:staffId/leave-balance', controller.getLeaveBalance);

// ==================== Time Tracking ====================
router.post('/staff/:staffId/time-tracking', controller.logTimeTracking);
router.get('/staff/:staffId/time-tracking', controller.getTimeTracking);
router.post('/staff/:staffId/timesheet', controller.createTimesheet);

// ==================== Performance Management ====================
router.post('/staff/:staffId/performance-kpi', controller.createPerformanceKPI);
router.get('/staff/:staffId/performance-kpi', controller.getPerformanceKPIs);

// ==================== Payroll Management ====================
router.post('/staff/:staffId/payroll', controller.createPayroll);
router.get('/staff/:staffId/payroll', controller.getPayrolls);
router.post('/payroll/export', controller.exportPayroll);

// ==================== Training & Development ====================
router.post('/staff/:staffId/training', controller.addTrainingRecord);
router.get('/staff/:staffId/training', controller.getTrainingRecords);
router.post('/staff/:staffId/development-plan', controller.createDevelopmentPlan);

// ==================== Location Assignment ====================
router.post('/staff/:staffId/location-assignment', controller.assignLocation);
router.get('/staff/:staffId/location-assignment', controller.getLocationAssignments);

// ==================== Notifications ====================
router.post('/staff/:staffId/notifications', controller.sendNotification);
router.get('/staff/:staffId/notifications', controller.getNotifications);

export default router;
