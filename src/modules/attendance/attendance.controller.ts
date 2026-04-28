import { Request, Response } from 'express';
import { AttendanceService, AttendanceSessionService, AttendanceDeviceService } from './attendance.service';
import { BaseController } from '../../shared/base/base.controller';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';
import { successResponse } from '../../shared/utils/response.util';

export class AttendanceController extends BaseController {
    private attendanceService: AttendanceService;
    private sessionService: AttendanceSessionService;
    private deviceService: AttendanceDeviceService;

    constructor() {
        super();
        this.attendanceService = new AttendanceService();
        this.sessionService = new AttendanceSessionService();
        this.deviceService = new AttendanceDeviceService();
    }

    /**
     * Check in person
     */
    checkIn = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const attendanceRecord = await this.attendanceService.checkIn(req.body, userId);

        return successResponse(res, {
            message: 'Check-in successful',
            data: attendanceRecord
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Check out person
     */
    checkOut = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const attendanceRecord = await this.attendanceService.checkOut(req.body, userId);

        return successResponse(res, {
            message: 'Check-out successful',
            data: attendanceRecord
        });
    });

    /**
     * Get attendance records
     */
    getAttendanceRecords = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            attendanceType,
            personId,
            locationId,
            roomId,
            sessionId,
            status,
            checkInMethod,
            isLate,
            syncStatus,
            startDate,
            endDate
        } = req.query;

        const filter: any = {
            attendanceType,
            personId,
            locationId,
            roomId,
            sessionId,
            status,
            checkInMethod,
            isLate: isLate !== undefined ? isLate === 'true' : undefined,
            syncStatus
        };

        if (startDate || endDate) {
            filter.dateRange = {};
            if (startDate) filter.dateRange.startDate = new Date(startDate as string);
            if (endDate) filter.dateRange.endDate = new Date(endDate as string);
        }

        const records = await this.attendanceService.getAttendanceRecords(
            filter,
            Number(page),
            Number(limit)
        );

        return successResponse(res, {
            message: 'Attendance records retrieved successfully',
            data: records
        });
    });

    /**
     * Get attendance record by ID
     */
    getAttendanceById = asyncHandler(async (req: Request, res: Response) => {
        const { attendanceId } = req.params;

        const record = await this.attendanceService.findOne({ attendanceId });
        if (!record) {
            throw new AppError('Attendance record not found', HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(res, {
            message: 'Attendance record retrieved successfully',
            data: record
        });
    });

    /**
     * Update attendance record
     */
    updateAttendanceRecord = asyncHandler(async (req: Request, res: Response) => {
        const { attendanceId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const record = await this.attendanceService.findOneAndUpdate(
            { attendanceId },
            { ...req.body, updatedBy: userId },
            { new: true }
        );

        if (!record) {
            throw new AppError('Attendance record not found', HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(res, {
            message: 'Attendance record updated successfully',
            data: record
        });
    });

    /**
     * Get attendance statistics
     */
    getAttendanceStatistics = asyncHandler(async (req: Request, res: Response) => {
        const { startDate, endDate, locationId } = req.query;

        if (!startDate || !endDate) {
            throw new AppError('Start date and end date are required', HTTP_STATUS.BAD_REQUEST);
        }

        const statistics = await this.attendanceService.getAttendanceStatistics(
            new Date(startDate as string),
            new Date(endDate as string),
            locationId as string
        );

        return successResponse(res, {
            message: 'Attendance statistics retrieved successfully',
            data: statistics
        });
    });

    /**
     * Sync offline records
     */
    syncOfflineRecords = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const syncResults = await this.attendanceService.syncOfflineRecords(req.body, userId);

        return successResponse(res, {
            message: 'Offline records synced successfully',
            data: syncResults
        });
    });

    /**
     * Create attendance session
     */
    createAttendanceSession = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const session = await this.sessionService.createSession(req.body, userId);

        return successResponse(res, {
            message: 'Attendance session created successfully',
            data: session
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Get attendance sessions
     */
    getAttendanceSessions = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            sessionType,
            locationId,
            status,
            startDate,
            endDate
        } = req.query;

        const filter: any = {};

        if (sessionType) filter.sessionType = sessionType;
        if (locationId) filter.locationId = locationId;
        if (status) filter.status = status;
        if (startDate || endDate) {
            filter.scheduledStartTime = {};
            if (startDate) filter.scheduledStartTime.$gte = new Date(startDate as string);
            if (endDate) filter.scheduledStartTime.$lte = new Date(endDate as string);
        }

        const sessions = await this.sessionService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { scheduledStartTime: -1 },
                populate: [
                    { path: 'locationId', select: 'name address' },
                    { path: 'roomId', select: 'name capacity' }
                ]
            }
        );

        return successResponse(res, {
            message: 'Attendance sessions retrieved successfully',
            data: sessions
        });
    });

    /**
     * Get session attendance report
     */
    getSessionReport = asyncHandler(async (req: Request, res: Response) => {
        const { sessionId } = req.params;

        const report = await this.sessionService.getSessionReport(sessionId);

        return successResponse(res, {
            message: 'Session attendance report retrieved successfully',
            data: report
        });
    });

    /**
     * Update session status
     */
    updateSessionStatus = asyncHandler(async (req: Request, res: Response) => {
        const { sessionId } = req.params;
        const { status } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const session = await this.sessionService.findOneAndUpdate(
            { sessionId },
            { status, updatedBy: userId },
            { new: true }
        );

        if (!session) {
            throw new AppError('Session not found', HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(res, {
            message: 'Session status updated successfully',
            data: session
        });
    });

    /**
     * Register attendance device
     */
    registerDevice = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const device = await this.deviceService.registerDevice(req.body, userId);

        return successResponse(res, {
            message: 'Attendance device registered successfully',
            data: device
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Get attendance devices
     */
    getAttendanceDevices = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            deviceType,
            locationId,
            isActive,
            isOnline
        } = req.query;

        const filter: any = {};

        if (deviceType) filter.deviceType = deviceType;
        if (locationId) filter.locationId = locationId;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (isOnline !== undefined) filter.isOnline = isOnline === 'true';

        const devices = await this.deviceService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { createdAt: -1 },
                populate: [
                    { path: 'locationId', select: 'name address' },
                    { path: 'roomId', select: 'name capacity' }
                ]
            }
        );

        return successResponse(res, {
            message: 'Attendance devices retrieved successfully',
            data: devices
        });
    });

    /**
     * Update device heartbeat
     */
    updateDeviceHeartbeat = asyncHandler(async (req: Request, res: Response) => {
        const { deviceId } = req.params;

        await this.deviceService.updateHeartbeat(deviceId, req.body);

        return successResponse(res, {
            message: 'Device heartbeat updated successfully'
        });
    });

    /**
     * Update device settings
     */
    updateDeviceSettings = asyncHandler(async (req: Request, res: Response) => {
        const { deviceId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const device = await this.deviceService.findOneAndUpdate(
            { deviceId },
            { settings: req.body, updatedBy: userId },
            { new: true }
        );

        if (!device) {
            throw new AppError('Device not found', HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(res, {
            message: 'Device settings updated successfully',
            data: device
        });
    });

    /**
     * Get device statistics
     */
    getDeviceStatistics = asyncHandler(async (req: Request, res: Response) => {
        const { deviceId } = req.params;

        const device = await this.deviceService.findOne({ deviceId });
        if (!device) {
            throw new AppError('Device not found', HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(res, {
            message: 'Device statistics retrieved successfully',
            data: {
                deviceId: device.deviceId,
                deviceName: device.deviceName,
                statistics: device.statistics,
                isOnline: device.isOnline,
                lastHeartbeat: device.lastHeartbeat,
                batteryLevel: device.batteryLevel
            }
        });
    });

    /**
     * Generate QR code for check-in
     */
    generateCheckInQR = asyncHandler(async (req: Request, res: Response) => {
        const { locationId, roomId, sessionId } = req.body;

        // Generate QR code data
        const qrData = {
            type: 'check-in',
            locationId,
            roomId,
            sessionId,
            timestamp: new Date().toISOString(),
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };

        const qrCode = Buffer.from(JSON.stringify(qrData)).toString('base64');

        return successResponse(res, {
            message: 'QR code generated successfully',
            data: {
                qrCode,
                qrData,
                expiresAt: qrData.expires
            }
        });
    });

    /**
     * Validate QR code
     */
    validateQRCode = asyncHandler(async (req: Request, res: Response) => {
        const { qrCode } = req.body;

        try {
            const qrData = JSON.parse(Buffer.from(qrCode, 'base64').toString());

            // Check if QR code is expired
            if (new Date() > new Date(qrData.expires)) {
                throw new AppError('QR code has expired', HTTP_STATUS.BAD_REQUEST);
            }

            // Validate QR code data
            if (qrData.type !== 'check-in') {
                throw new AppError('Invalid QR code type', HTTP_STATUS.BAD_REQUEST);
            }

            return successResponse(res, {
                message: 'QR code is valid',
                data: qrData
            });
        } catch (error) {
            throw new AppError('Invalid QR code', HTTP_STATUS.BAD_REQUEST);
        }
    });

    /**
     * Get person's current attendance status
     */
    getPersonAttendanceStatus = asyncHandler(async (req: Request, res: Response) => {
        const { personId } = req.params;

        // Get today's attendance records
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayRecords = await this.attendanceService.find({
            personId,
            checkInTime: { $gte: today, $lt: tomorrow }
        });

        const currentStatus = {
            personId,
            isCheckedIn: false,
            currentLocation: null,
            checkInTime: null,
            sessionInfo: null,
            todayRecords: todayRecords.length
        };

        // Find active check-in
        const activeRecord = todayRecords.find(record =>
            record.status === 'checked_in' || record.status === 'present'
        );

        if (activeRecord) {
            currentStatus.isCheckedIn = true;
            currentStatus.currentLocation = activeRecord.locationId;
            currentStatus.checkInTime = activeRecord.checkInTime;
            currentStatus.sessionInfo = {
                sessionId: activeRecord.sessionId,
                sessionName: activeRecord.sessionName,
                sessionType: activeRecord.sessionType
            };
        }

        return successResponse(res, {
            message: 'Person attendance status retrieved successfully',
            data: currentStatus
        });
    });

    /**
     * Bulk check-in for sessions
     */
    bulkCheckIn = asyncHandler(async (req: Request, res: Response) => {
        const { sessionId, attendees } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const results = {
            successful: 0,
            failed: 0,
            errors: [] as any[]
        };

        for (let i = 0; i < attendees.length; i++) {
            const attendee = attendees[i];

            try {
                const checkInRequest = {
                    personId: attendee.personId,
                    personType: attendee.personType,
                    locationId: attendee.locationId,
                    sessionId,
                    checkInMethod: 'manual',
                    deviceInfo: {
                        deviceId: 'bulk-checkin',
                        deviceType: 'kiosk',
                        deviceName: 'Bulk Check-in System',
                        operatingSystem: 'Web',
                        appVersion: '1.0.0',
                        isOnline: true
                    }
                };

                await this.attendanceService.checkIn(checkInRequest as any, userId);
                results.successful++;
            } catch (error: any) {
                results.failed++;
                results.errors.push({
                    attendeeIndex: i,
                    personId: attendee.personId,
                    error: error.message
                });
            }
        }

        return successResponse(res, {
            message: 'Bulk check-in completed',
            data: results
        });
    });
}