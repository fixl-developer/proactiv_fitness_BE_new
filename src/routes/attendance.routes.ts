import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { authMiddleware } from '../modules/iam/auth.middleware';

const router = Router();
const attendanceController = new AttendanceController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Check-in/Check-out routes
router.post('/attendance/check-in', attendanceController.checkIn);
router.post('/attendance/check-out', attendanceController.checkOut);

// Attendance record routes
router.get('/attendance/records', attendanceController.getAttendanceRecords);

// Statistics routes
router.get('/attendance/statistics', attendanceController.getAttendanceStatistics);

// QR Code routes
router.post('/attendance/qr/generate', attendanceController.generateCheckInQR);

export default router;