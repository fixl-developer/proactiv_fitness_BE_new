import { Request, Response } from 'express';
import { StaffService, StaffScheduleService, StaffAttendanceService } from '../modules/staff/staff.service';
import { BaseController } from '../shared/base/base.controller';
import { asyncHandler } from '../shared/utils/async-handler.util';
import { AppError } from '../shared/utils/app-error.util';
import { HTTP_STATUS } from '../shared/constants';
import { successResponse } from '../shared/utils/response.util';

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
            filter as any,
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
}