import { Router } from 'express';
import { StaffController } from './staff.controller';
import { authMiddleware } from '../iam/auth.middleware';

const router = Router();
const staffController = new StaffController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

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

export { router as staffRoutes };