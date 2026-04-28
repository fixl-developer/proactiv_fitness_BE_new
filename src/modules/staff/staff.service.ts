import { FilterQuery } from 'mongoose';
import { Staff, StaffSchedule, StaffAttendance } from './staff.model';
import {
    IStaff,
    IStaffSchedule,
    IStaffAttendance,
    ICreateStaffRequest,
    IUpdateStaffRequest,
    IStaffFilter,
    IScheduleStaffRequest,
    IStaffAvailabilityRequest,
    ITimeOffRequestData,
    IStaffStatistics,
    IAttendanceStatistics,
    StaffStatus,
    AvailabilityStatus,
    LeaveStatus,
    CertificationStatus,
    BackgroundCheckStatus
} from './staff.interface';
import { BaseService, EntityContext } from '../../shared/base/base.service';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class StaffService extends BaseService<IStaff> {
    constructor() {
        super(Staff, 'staff');
    }

    protected getEntityContext(doc: any): EntityContext | null {
        return {
            organizationId: doc.businessUnitId?.toString(),
            locationId: doc.primaryLocationId?.toString(),
        };
    }

    /**
     * Create new staff member
     */
    async createStaff(staffRequest: ICreateStaffRequest, createdBy: string): Promise<IStaff> {
        try {
            // Check if email already exists
            const existingStaff = await Staff.findOne({
                'contactInfo.email': staffRequest.contactInfo.email,
                isActive: true
            });

            if (existingStaff) {
                throw new AppError('Staff member with this email already exists', HTTP_STATUS.CONFLICT);
            }

            const staffId = this.generateStaffId();

            const staff = new Staff({
                staffId,
                personalInfo: staffRequest.personalInfo,
                contactInfo: staffRequest.contactInfo,
                staffType: staffRequest.staffType,
                businessUnitId: staffRequest.businessUnitId,
                locationIds: staffRequest.locationIds,
                primaryLocationId: staffRequest.primaryLocationId,
                skills: staffRequest.skills || [],
                specializations: staffRequest.specializations || [],
                languages: staffRequest.languages || [],
                experienceYears: staffRequest.experienceYears || 0,
                maxHoursPerWeek: staffRequest.maxHoursPerWeek || 40,
                payrollInfo: staffRequest.payrollInfo,
                hireDate: new Date(),
                createdBy,
                updatedBy: createdBy
            });

            await staff.save();
            this.emitRealtimeEvent('created', staff);
            return staff;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create staff member',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update staff member
     */
    async updateStaff(staffId: string, updateRequest: IUpdateStaffRequest, updatedBy: string): Promise<IStaff> {
        try {
            const staff = await Staff.findOne({ staffId });
            if (!staff) {
                throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
            }

            // Update fields
            if (updateRequest.personalInfo) {
                Object.assign(staff.personalInfo, updateRequest.personalInfo);
            }
            if (updateRequest.contactInfo) {
                Object.assign(staff.contactInfo, updateRequest.contactInfo);
            }
            if (updateRequest.staffType) staff.staffType = updateRequest.staffType;
            if (updateRequest.status) staff.status = updateRequest.status;
            if (updateRequest.locationIds) staff.locationIds = updateRequest.locationIds;
            if (updateRequest.primaryLocationId) staff.primaryLocationId = updateRequest.primaryLocationId;
            if (updateRequest.skills) staff.skills = updateRequest.skills;
            if (updateRequest.specializations) staff.specializations = updateRequest.specializations;
            if (updateRequest.maxHoursPerWeek) staff.maxHoursPerWeek = updateRequest.maxHoursPerWeek;
            // Allow callers to soft-delete via isActive (the controller's
            // deleteStaff path uses this to deactivate without dropping the doc).
            if (typeof (updateRequest as any).isActive === 'boolean') {
                (staff as any).isActive = (updateRequest as any).isActive;
            }

            staff.updatedBy = updatedBy;
            await staff.save();
            this.emitRealtimeEvent('updated', staff);

            return staff;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update staff member',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get staff members with filtering
     */
    async getStaffMembers(filter: IStaffFilter, page: number = 1, limit: number = 10): Promise<any> {
        try {
            const query: FilterQuery<IStaff> = { isActive: true };

            if (filter.staffType) query.staffType = filter.staffType;
            if (filter.status) query.status = filter.status;
            if (filter.businessUnitId) query.businessUnitId = filter.businessUnitId;
            if (filter.locationId) query.locationIds = { $in: [filter.locationId] };
            if (filter.skills && filter.skills.length > 0) {
                query.skills = { $in: filter.skills };
            }
            if (filter.availabilityStatus) query.currentAvailabilityStatus = filter.availabilityStatus;
            if (filter.searchText) {
                query.$or = [
                    { 'personalInfo.firstName': { $regex: filter.searchText, $options: 'i' } },
                    { 'personalInfo.lastName': { $regex: filter.searchText, $options: 'i' } },
                    { 'contactInfo.email': { $regex: filter.searchText, $options: 'i' } },
                    { skills: { $regex: filter.searchText, $options: 'i' } }
                ];
            }

            return await this.findWithPagination(query, {
                page,
                limit,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            } as any);
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get staff members',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update staff availability
     */
    async updateStaffAvailability(availabilityRequest: IStaffAvailabilityRequest, updatedBy: string): Promise<IStaff> {
        try {
            const staff = await Staff.findOne({ staffId: availabilityRequest.staffId });
            if (!staff) {
                throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
            }

            staff.weeklyAvailability = availabilityRequest.weeklyAvailability;
            staff.currentAvailabilityStatus = availabilityRequest.availabilityStatus;
            staff.updatedBy = updatedBy;

            await staff.save();
            return staff;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update staff availability',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Create staff schedule
     */
    async createStaffSchedule(scheduleRequest: IScheduleStaffRequest, createdBy: string): Promise<IStaffSchedule> {
        try {
            // Check if staff exists and is available
            const staff = await Staff.findOne({
                staffId: scheduleRequest.staffId,
                isActive: true,
                status: StaffStatus.ACTIVE
            });

            if (!staff) {
                throw new AppError('Staff member not found or inactive', HTTP_STATUS.NOT_FOUND);
            }

            // Check for scheduling conflicts
            const existingSchedule = await StaffSchedule.findOne({
                staffId: scheduleRequest.staffId,
                date: scheduleRequest.date,
                status: { $in: ['scheduled', 'confirmed'] },
                $or: [
                    {
                        startTime: { $lt: scheduleRequest.endTime },
                        endTime: { $gt: scheduleRequest.startTime }
                    }
                ]
            });

            if (existingSchedule) {
                throw new AppError('Staff member already scheduled for this time slot', HTTP_STATUS.CONFLICT);
            }

            const scheduleId = this.generateScheduleId();

            const schedule = new StaffSchedule({
                scheduleId,
                staffId: scheduleRequest.staffId,
                locationId: scheduleRequest.locationId,
                date: scheduleRequest.date,
                shiftType: scheduleRequest.shiftType,
                startTime: scheduleRequest.startTime,
                endTime: scheduleRequest.endTime,
                assignedClasses: scheduleRequest.assignedClasses || [],
                createdBy,
                updatedBy: createdBy
            });

            await schedule.save();
            return schedule;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create staff schedule',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Submit time off request
     */
    async submitTimeOffRequest(requestData: ITimeOffRequestData, requestedBy: string): Promise<IStaff> {
        try {
            const staff = await Staff.findOne({ staffId: requestData.staffId });
            if (!staff) {
                throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
            }

            // Calculate total days
            const startDate = new Date(requestData.startDate);
            const endDate = new Date(requestData.endDate);
            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            // Check leave balance for annual leave
            if (requestData.type === 'annual') {
                const remainingLeave = staff.annualLeaveEntitlement - staff.annualLeaveUsed;
                if (totalDays > remainingLeave) {
                    throw new AppError('Insufficient annual leave balance', HTTP_STATUS.BAD_REQUEST);
                }
            }

            const requestId = this.generateTimeOffRequestId();

            const timeOffRequest = {
                requestId,
                type: requestData.type,
                startDate: requestData.startDate,
                endDate: requestData.endDate,
                totalDays,
                reason: requestData.reason,
                status: LeaveStatus.PENDING,
                isEmergency: requestData.isEmergency || false,
                documents: requestData.documents || []
            };

            staff.timeOffRequests.push(timeOffRequest);
            staff.updatedBy = requestedBy;
            await staff.save();

            return staff;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to submit time off request',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Approve/Reject time off request
     */
    async processTimeOffRequest(
        staffId: string,
        requestId: string,
        action: 'approve' | 'reject',
        rejectionReason: string | undefined,
        processedBy: string
    ): Promise<IStaff> {
        try {
            const staff = await Staff.findOne({ staffId });
            if (!staff) {
                throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
            }

            const request = staff.timeOffRequests.find(req => req.requestId === requestId);
            if (!request) {
                throw new AppError('Time off request not found', HTTP_STATUS.NOT_FOUND);
            }

            if (request.status !== LeaveStatus.PENDING) {
                throw new AppError('Request has already been processed', HTTP_STATUS.BAD_REQUEST);
            }

            if (action === 'approve') {
                request.status = LeaveStatus.APPROVED;
                request.approvedBy = processedBy;
                request.approvedAt = new Date();

                // Update leave balance
                if (request.type === 'annual') {
                    staff.annualLeaveUsed += request.totalDays;
                } else if (request.type === 'sick') {
                    staff.sickLeaveUsed += request.totalDays;
                }
            } else {
                request.status = LeaveStatus.REJECTED;
                request.rejectionReason = rejectionReason;
            }

            staff.updatedBy = processedBy;
            await staff.save();

            return staff;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to process time off request',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Record staff attendance
     */
    async recordAttendance(attendanceData: any, recordedBy: string): Promise<IStaffAttendance> {
        try {
            // Check if attendance already exists for this date
            const existingAttendance = await StaffAttendance.findOne({
                staffId: attendanceData.staffId,
                date: attendanceData.date
            });

            if (existingAttendance) {
                throw new AppError('Attendance already recorded for this date', HTTP_STATUS.CONFLICT);
            }

            const attendanceId = this.generateAttendanceId();

            const attendance = new StaffAttendance({
                attendanceId,
                ...attendanceData,
                createdBy: recordedBy,
                updatedBy: recordedBy
            });

            await attendance.save();
            return attendance;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to record attendance',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get staff statistics
     */
    async getStaffStatistics(businessUnitId?: string): Promise<IStaffStatistics> {
        try {
            const matchStage: any = { isActive: true };
            if (businessUnitId) {
                matchStage.businessUnitId = businessUnitId;
            }

            const stats = await Staff.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalStaff: { $sum: 1 },
                        activeStaff: { $sum: { $cond: [{ $eq: ['$status', StaffStatus.ACTIVE] }, 1, 0] } },
                        staffByType: { $push: '$staffType' },
                        staffByStatus: { $push: '$status' },
                        totalExperience: { $sum: '$experienceYears' },
                        expiringCertifications: {
                            $sum: {
                                $size: {
                                    $filter: {
                                        input: '$certifications',
                                        cond: {
                                            $and: [
                                                { $ne: ['$$this.expiryDate', null] },
                                                { $lt: ['$$this.expiryDate', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)] }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            ]);

            const result = stats[0] || {};
            const totalStaff = result.totalStaff || 0;

            return {
                totalStaff,
                activeStaff: result.activeStaff || 0,
                staffByType: this.countArrayItems(result.staffByType || []),
                staffByStatus: this.countArrayItems(result.staffByStatus || []),
                staffByLocation: [], // Would need additional aggregation
                averageExperience: totalStaff > 0 ? (result.totalExperience || 0) / totalStaff : 0,
                certificationExpiring: result.expiringCertifications || 0,
                backgroundChecksExpiring: 0, // Would need additional calculation
                attendanceRate: 0, // Would calculate from attendance records
                turnoverRate: 0 // Would calculate from termination data
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get staff statistics',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get attendance statistics
     */
    async getAttendanceStatistics(
        startDate: Date,
        endDate: Date,
        locationId?: string
    ): Promise<IAttendanceStatistics> {
        try {
            const matchStage: any = {
                date: { $gte: startDate, $lte: endDate }
            };
            if (locationId) {
                matchStage.locationId = locationId;
            }

            const stats = await StaffAttendance.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalRecords: { $sum: 1 },
                        presentCount: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
                        absentCount: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
                        lateCount: { $sum: { $cond: ['$isLate', 1, 0] } },
                        totalHours: { $sum: '$totalHours' },
                        overtimeHours: { $sum: { $cond: [{ $eq: ['$status', 'overtime'] }, '$totalHours', 0] } }
                    }
                }
            ]);

            const result = stats[0] || {};
            const totalRecords = result.totalRecords || 0;
            const presentCount = result.presentCount || 0;

            return {
                totalAttendanceRecords: totalRecords,
                presentCount,
                absentCount: result.absentCount || 0,
                lateCount: result.lateCount || 0,
                overtimeHours: result.overtimeHours || 0,
                averageHoursPerDay: presentCount > 0 ? (result.totalHours || 0) / presentCount : 0,
                attendanceRate: totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0,
                punctualityRate: presentCount > 0 ? ((presentCount - (result.lateCount || 0)) / presentCount) * 100 : 0,
                attendanceByLocation: [] // Would need additional aggregation
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get attendance statistics',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Private helper methods
    private generateStaffId(): string {
        return `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateScheduleId(): string {
        return `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateTimeOffRequestId(): string {
        return `leave_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateAttendanceId(): string {
        return `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private countArrayItems(items: any[]): Record<string, number> {
        return items.reduce((acc, item) => {
            acc[item] = (acc[item] || 0) + 1;
            return acc;
        }, {});
    }
}

export class StaffScheduleService extends BaseService<IStaffSchedule> {
    constructor() {
        super(StaffSchedule);
    }

    /**
     * Get staff schedules for a date range
     */
    async getSchedules(
        startDate: Date,
        endDate: Date,
        staffId?: string,
        locationId?: string
    ): Promise<IStaffSchedule[]> {
        try {
            const query: FilterQuery<IStaffSchedule> = {
                date: { $gte: startDate, $lte: endDate }
            };

            if (staffId) query.staffId = staffId;
            if (locationId) query.locationId = locationId;

            return await StaffSchedule.find(query)
                .populate('locationId', 'name address')
                .sort({ date: 1, startTime: 1 });
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get schedules',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update schedule status
     */
    async updateScheduleStatus(
        scheduleId: string,
        status: string,
        updatedBy: string
    ): Promise<IStaffSchedule> {
        try {
            const schedule = await StaffSchedule.findOneAndUpdate(
                { scheduleId },
                { status, updatedBy },
                { new: true }
            );

            if (!schedule) {
                throw new AppError('Schedule not found', HTTP_STATUS.NOT_FOUND);
            }

            return schedule;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update schedule status',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }
}

export class StaffAttendanceService extends BaseService<IStaffAttendance> {
    constructor() {
        super(StaffAttendance);
    }

    /**
     * Check in staff member
     */
    async checkIn(checkInData: any, recordedBy: string): Promise<IStaffAttendance> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Check if already checked in today
            const existingAttendance = await StaffAttendance.findOne({
                staffId: checkInData.staffId,
                date: today
            });

            if (existingAttendance) {
                throw new AppError('Staff member already checked in today', HTTP_STATUS.CONFLICT);
            }

            const attendanceId = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const attendance = new StaffAttendance({
                attendanceId,
                staffId: checkInData.staffId,
                locationId: checkInData.locationId,
                date: today,
                checkInTime: new Date(),
                checkInMethod: checkInData.checkInMethod || 'manual',
                checkInLocation: checkInData.location,
                status: 'present',
                createdBy: recordedBy,
                updatedBy: recordedBy
            });

            await attendance.save();
            return attendance;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to check in staff member',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Check out staff member
     */
    async checkOut(staffId: string, checkOutData: any, recordedBy: string): Promise<IStaffAttendance> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const attendance = await StaffAttendance.findOne({
                staffId,
                date: today,
                checkOutTime: { $exists: false }
            });

            if (!attendance) {
                throw new AppError('No active check-in found for today', HTTP_STATUS.NOT_FOUND);
            }

            attendance.checkOutTime = new Date();
            attendance.checkOutMethod = checkOutData.checkOutMethod || 'manual';
            attendance.checkOutLocation = checkOutData.location;
            attendance.updatedBy = recordedBy;

            // Calculate total hours
            if (attendance.checkInTime) {
                attendance.totalHours = (attendance.checkOutTime.getTime() - attendance.checkInTime.getTime()) / (1000 * 60 * 60);
            }

            await attendance.save();
            return attendance;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to check out staff member',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }
}