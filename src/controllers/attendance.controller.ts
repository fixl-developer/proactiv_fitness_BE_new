import { Request, Response } from 'express';
import { AttendanceService, AttendanceSessionService, AttendanceDeviceService } from '../modules/attendance/attendance.service';
import { BaseController } from '../shared/base/base.controller';
import { asyncHandler } from '../shared/utils/async-handler.util';
import { AppError } from '../shared/utils/app-error.util';
import { HTTP_STATUS } from '../shared/constants';
import { successResponse } from '../shared/utils/response.util';

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
            status,
            startDate,
            endDate
        } = req.query;

        const filter: any = {
            attendanceType,
            personId,
            locationId,
            status
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
     * Generate QR code for check-in
     */
    generateCheckInQR = asyncHandler(async (req: Request, res: Response) => {
        const { locationId, roomId, sessionId } = req.body;

        const qrData = {
            type: 'check-in',
            locationId,
            roomId,
            sessionId,
            timestamp: new Date().toISOString(),
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
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
}