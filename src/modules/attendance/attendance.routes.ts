import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { authMiddleware } from '../iam/auth.middleware';

const router = Router();
const attendanceController = new AttendanceController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Check-in/Check-out routes
router.post('/attendance/check-in', attendanceController.checkIn);
router.post('/attendance/check-out', attendanceController.checkOut);
router.post('/attendance/bulk-check-in', attendanceController.bulkCheckIn);

// Attendance record routes
router.get('/attendance/records', attendanceController.getAttendanceRecords);
router.get('/attendance/records/:attendanceId', attendanceController.getAttendanceById);
router.put('/attendance/records/:attendanceId', attendanceController.updateAttendanceRecord);

// Person attendance status
router.get('/attendance/person/:personId/status', attendanceController.getPersonAttendanceStatus);

// Statistics routes
router.get('/attendance/statistics', attendanceController.getAttendanceStatistics);

// Offline sync routes
router.post('/attendance/sync', attendanceController.syncOfflineRecords);

// Session management routes
router.post('/attendance/sessions', attendanceController.createAttendanceSession);
router.get('/attendance/sessions', attendanceController.getAttendanceSessions);
router.get('/attendance/sessions/:sessionId/report', attendanceController.getSessionReport);
router.patch('/attendance/sessions/:sessionId/status', attendanceController.updateSessionStatus);

// Device management routes
router.post('/attendance/devices', attendanceController.registerDevice);
router.get('/attendance/devices', attendanceController.getAttendanceDevices);
router.post('/attendance/devices/:deviceId/heartbeat', attendanceController.updateDeviceHeartbeat);
router.put('/attendance/devices/:deviceId/settings', attendanceController.updateDeviceSettings);
router.get('/attendance/devices/:deviceId/statistics', attendanceController.getDeviceStatistics);

// QR Code routes
router.post('/attendance/qr/generate', attendanceController.generateCheckInQR);
router.post('/attendance/qr/validate', attendanceController.validateQRCode);

export { router as attendanceRoutes };