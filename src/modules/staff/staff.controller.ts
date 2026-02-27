import { Request, Response } from 'express';
import { StaffService, StaffScheduleService, StaffAttendanceService } from './staff.service';
import { BaseController } from '../../shared/base/base.controller';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';
import { successResponse } from '../../shared/utils/response.util';

export class StaffController extends BaseController {
    private staffService: StaffService;
    private scheduleService: StaffScheduleService;
    private attendanceService: StaffAttendanceService;

    constructor() {
        super();
        this.staffService = new StaffService();
        this.scheduleService = new StaffScheduleService();
        this.attendanceService = new StaffAttendanceService();
    }

    /**
     * Create staff member
     */
    createStaff = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.createStaff(req.body, userId);

        return successResponse(res, {
            message: 'Staff member created successfully',
            data: staff
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Get all staff members
     */
    getStaffMembers = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            staffType,
            status,
            businessUnitId,
            locationId,
            skills,
            availabilityStatus,
            searchText
        } = req.query;

        const filter = {
            staffType,
            status,
            businessUnitId,
            locationId,
            skills: skills ? (Array.isArray(skills) ? skills : [skills]) : undefined,
            availabilityStatus,
            searchText
        };

        const staffMembers = await this.staffService.getStaffMembers(
            filter,
            Number(page),
            Number(limit)
        );

        return successResponse(res, {
            message: 'Staff members retrieved successfully',
            data: staffMembers
        });
    });

    /**
     * Get staff member by ID
     */
    getStaffById = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;

        const staff = await this.staffService.findOne({ staffId });
        if (!staff) {
            throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(res, {
            message: 'Staff member retrieved successfully',
            data: staff
        });
    });

    /**
     * Update staff member
     */
    updateStaff = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.updateStaff(staffId, req.body, userId);

        return successResponse(res, {
            message: 'Staff member updated successfully',
            data: staff
        });
    });

    /**
     * Delete staff member
     */
    deleteStaff = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.findOneAndUpdate(
            { staffId },
            { isActive: false, updatedBy: userId },
            { new: true }
        );

        if (!staff) {
            throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(res, {
            message: 'Staff member deleted successfully'
        });
    });

    /**
     * Update staff availability
     */
    updateStaffAvailability = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.updateStaffAvailability(req.body, userId);

        return successResponse(res, {
            message: 'Staff availability updated successfully',
            data: staff
        });
    });

    /**
     * Create staff schedule
     */
    createStaffSchedule = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const schedule = await this.staffService.createStaffSchedule(req.body, userId);

        return successResponse(res, {
            message: 'Staff schedule created successfully',
            data: schedule
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Get staff schedules
     */
    getStaffSchedules = asyncHandler(async (req: Request, res: Response) => {
        const {
            startDate,
            endDate,
            staffId,
            locationId
        } = req.query;

        if (!startDate || !endDate) {
            throw new AppError('Start date and end date are required', HTTP_STATUS.BAD_REQUEST);
        }

        const schedules = await this.scheduleService.getSchedules(
            new Date(startDate as string),
            new Date(endDate as string),
            staffId as string,
            locationId as string
        );

        return successResponse(res, {
            message: 'Staff schedules retrieved successfully',
            data: schedules
        });
    });

    /**
     * Update schedule status
     */
    updateScheduleStatus = asyncHandler(async (req: Request, res: Response) => {
        const { scheduleId } = req.params;
        const { status } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const schedule = await this.scheduleService.updateScheduleStatus(scheduleId, status, userId);

        return successResponse(res, {
            message: 'Schedule status updated successfully',
            data: schedule
        });
    });

    /**
     * Submit time off request
     */
    submitTimeOffRequest = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.submitTimeOffRequest(req.body, userId);

        return successResponse(res, {
            message: 'Time off request submitted successfully',
            data: staff
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Process time off request
     */
    processTimeOffRequest = asyncHandler(async (req: Request, res: Response) => {
        const { staffId, requestId } = req.params;
        const { action, rejectionReason } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        if (!['approve', 'reject'].includes(action)) {
            throw new AppError('Invalid action. Must be approve or reject', HTTP_STATUS.BAD_REQUEST);
        }

        const staff = await this.staffService.processTimeOffRequest(
            staffId,
            requestId,
            action,
            rejectionReason,
            userId
        );

        return successResponse(res, {
            message: `Time off request ${action}d successfully`,
            data: staff
        });
    });

    /**
     * Check in staff member
     */
    checkInStaff = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const attendance = await this.attendanceService.checkIn(req.body, userId);

        return successResponse(res, {
            message: 'Staff member checked in successfully',
            data: attendance
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Check out staff member
     */
    checkOutStaff = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const attendance = await this.attendanceService.checkOut(staffId, req.body, userId);

        return successResponse(res, {
            message: 'Staff member checked out successfully',
            data: attendance
        });
    });

    /**
     * Get staff attendance records
     */
    getStaffAttendance = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            staffId,
            locationId,
            startDate,
            endDate,
            status
        } = req.query;

        const filter: any = {};

        if (staffId) filter.staffId = staffId;
        if (locationId) filter.locationId = locationId;
        if (status) filter.status = status;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate as string);
            if (endDate) filter.date.$lte = new Date(endDate as string);
        }

        const attendance = await this.attendanceService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { date: -1 },
                populate: [
                    { path: 'locationId', select: 'name address' }
                ]
            }
        );

        return successResponse(res, {
            message: 'Staff attendance retrieved successfully',
            data: attendance
        });
    });

    /**
     * Get staff statistics
     */
    getStaffStatistics = asyncHandler(async (req: Request, res: Response) => {
        const { businessUnitId } = req.query;

        const statistics = await this.staffService.getStaffStatistics(businessUnitId as string);

        return successResponse(res, {
            message: 'Staff statistics retrieved successfully',
            data: statistics
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

        const statistics = await this.staffService.getAttendanceStatistics(
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
     * Add staff certification
     */
    addStaffCertification = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.findOne({ staffId });
        if (!staff) {
            throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
        }

        const certificationId = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const certification = {
            certificationId,
            ...req.body
        };

        staff.certifications.push(certification);
        staff.updatedBy = userId;
        await staff.save();

        return successResponse(res, {
            message: 'Certification added successfully',
            data: staff
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Update staff certification
     */
    updateStaffCertification = asyncHandler(async (req: Request, res: Response) => {
        const { staffId, certificationId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.findOne({ staffId });
        if (!staff) {
            throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
        }

        const certification = staff.certifications.find(cert => cert.certificationId === certificationId);
        if (!certification) {
            throw new AppError('Certification not found', HTTP_STATUS.NOT_FOUND);
        }

        Object.assign(certification, req.body);
        staff.updatedBy = userId;
        await staff.save();

        return successResponse(res, {
            message: 'Certification updated successfully',
            data: staff
        });
    });

    /**
     * Add background check
     */
    addBackgroundCheck = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.findOne({ staffId });
        if (!staff) {
            throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
        }

        const checkId = `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const backgroundCheck = {
            checkId,
            ...req.body,
            requestDate: new Date()
        };

        staff.backgroundChecks.push(backgroundCheck);
        staff.updatedBy = userId;
        await staff.save();

        return successResponse(res, {
            message: 'Background check added successfully',
            data: staff
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Get staff performance metrics
     */
    getStaffPerformance = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const { period } = req.query;

        const staff = await this.staffService.findOne({ staffId });
        if (!staff) {
            throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
        }

        let performanceMetrics = staff.performanceMetrics;

        if (period) {
            performanceMetrics = performanceMetrics.filter(metric => metric.period === period);
        }

        return successResponse(res, {
            message: 'Staff performance retrieved successfully',
            data: {
                staffId,
                staffName: `${staff.personalInfo.firstName} ${staff.personalInfo.lastName}`,
                performanceMetrics
            }
        });
    });

    /**
     * Update staff performance metrics
     */
    updateStaffPerformance = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.findOne({ staffId });
        if (!staff) {
            throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
        }

        const { period } = req.body;
        const existingMetricIndex = staff.performanceMetrics.findIndex(metric => metric.period === period);

        if (existingMetricIndex >= 0) {
            // Update existing metrics
            Object.assign(staff.performanceMetrics[existingMetricIndex], req.body);
        } else {
            // Add new metrics
            staff.performanceMetrics.push(req.body);
        }

        staff.updatedBy = userId;
        await staff.save();

        return successResponse(res, {
            message: 'Staff performance updated successfully',
            data: staff
        });
    });
}