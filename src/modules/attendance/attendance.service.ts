import { FilterQuery } from 'mongoose';
import { AttendanceRecord, AttendanceSession, AttendanceDevice, AttendanceRule } from './attendance.model';
import {
    IAttendanceRecord,
    IAttendanceSession,
    IAttendanceDevice,
    IAttendanceRule,
    ICheckInRequest,
    ICheckOutRequest,
    IAttendanceFilter,
    IAttendanceStatistics,
    ISessionAttendanceReport,
    IOfflineSync,
    AttendanceStatus,
    SyncStatus,
    CheckInMethod
} from './attendance.interface';
import { BaseService, EntityContext } from '../../shared/base/base.service';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class AttendanceService extends BaseService<IAttendanceRecord> {
    constructor() {
        super(AttendanceRecord, 'attendance');
    }

    protected getEntityContext(doc: any): EntityContext | null {
        return {
            locationId: doc.locationId?.toString(),
            targetUserId: doc.personId?.toString(),
        };
    }

    /**
     * Check in person
     */
    async checkIn(checkInRequest: ICheckInRequest, recordedBy: string): Promise<IAttendanceRecord> {
        try {
            // Check if person is already checked in today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const existingRecord = await AttendanceRecord.findOne({
                personId: checkInRequest.personId,
                checkInTime: { $gte: today, $lt: tomorrow },
                status: { $in: [AttendanceStatus.CHECKED_IN, AttendanceStatus.PRESENT] }
            });

            if (existingRecord) {
                throw new AppError('Person is already checked in today', HTTP_STATUS.CONFLICT);
            }

            // Get applicable rules
            const rules = await this.getApplicableRules(
                checkInRequest.personType,
                checkInRequest.locationId,
                checkInRequest.sessionId
            );

            // Validate check-in against rules
            await this.validateCheckIn(checkInRequest, rules);

            // Determine if check-in is late
            const { isLate, lateMinutes } = await this.calculateLateStatus(checkInRequest);

            const attendanceId = this.generateAttendanceId();

            const attendanceRecord = new AttendanceRecord({
                attendanceId,
                attendanceType: checkInRequest.personType,
                personId: checkInRequest.personId,
                personName: await this.getPersonName(checkInRequest.personId, checkInRequest.personType),
                personType: checkInRequest.personType,
                sessionId: checkInRequest.sessionId,
                locationId: checkInRequest.locationId,
                roomId: checkInRequest.roomId,
                checkInTime: new Date(),
                checkInMethod: checkInRequest.checkInMethod,
                checkInLocation: checkInRequest.location,
                checkInDeviceInfo: checkInRequest.deviceInfo,
                checkInPhoto: checkInRequest.photo,
                checkInNotes: checkInRequest.notes,
                status: AttendanceStatus.CHECKED_IN,
                isLate,
                lateMinutes,
                temperatureCheck: checkInRequest.temperatureCheck ? {
                    ...checkInRequest.temperatureCheck,
                    recordedAt: new Date(),
                    recordedBy: recordedBy
                } : undefined,
                healthScreening: checkInRequest.healthScreening ? {
                    ...checkInRequest.healthScreening,
                    recordedAt: new Date()
                } : undefined,
                businessUnitId: await this.getBusinessUnitId(checkInRequest.locationId),
                createdBy: recordedBy,
                updatedBy: recordedBy
            });

            await attendanceRecord.save();

            // Update session attendance if applicable
            if (checkInRequest.sessionId) {
                await this.updateSessionAttendance(checkInRequest.sessionId, attendanceRecord);
            }

            // Update device statistics
            await this.updateDeviceStatistics(checkInRequest.deviceInfo.deviceId, 'checkIn');

            // Send notifications if required
            await this.sendCheckInNotifications(attendanceRecord, rules);

            this.emitRealtimeEvent('checkedIn', attendanceRecord);
            return attendanceRecord;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to check in person',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Check out person
     */
    async checkOut(checkOutRequest: ICheckOutRequest, recordedBy: string): Promise<IAttendanceRecord> {
        try {
            const attendanceRecord = await AttendanceRecord.findOne({
                attendanceId: checkOutRequest.attendanceId,
                status: { $in: [AttendanceStatus.CHECKED_IN, AttendanceStatus.PRESENT] }
            });

            if (!attendanceRecord) {
                throw new AppError('Active attendance record not found', HTTP_STATUS.NOT_FOUND);
            }

            // Get applicable rules
            const rules = await this.getApplicableRules(
                attendanceRecord.personType,
                attendanceRecord.locationId.toString(),
                attendanceRecord.sessionId
            );

            // Validate check-out against rules
            await this.validateCheckOut(checkOutRequest, attendanceRecord, rules);

            // Determine if check-out is early
            const { isEarlyDeparture, earlyDepartureMinutes } = await this.calculateEarlyDepartureStatus(
                attendanceRecord,
                new Date()
            );

            // Update attendance record
            attendanceRecord.checkOutTime = new Date();
            attendanceRecord.checkOutMethod = checkOutRequest.checkOutMethod;
            attendanceRecord.checkOutLocation = checkOutRequest.location;
            attendanceRecord.checkOutDeviceInfo = checkOutRequest.deviceInfo;
            attendanceRecord.checkOutPhoto = checkOutRequest.photo;
            attendanceRecord.checkOutNotes = checkOutRequest.notes;
            attendanceRecord.status = AttendanceStatus.CHECKED_OUT;
            attendanceRecord.isEarlyDeparture = isEarlyDeparture;
            attendanceRecord.earlyDepartureMinutes = earlyDepartureMinutes;
            attendanceRecord.updatedBy = recordedBy;

            // Calculate actual duration
            if (attendanceRecord.checkInTime) {
                attendanceRecord.actualDuration = Math.round(
                    (attendanceRecord.checkOutTime.getTime() - attendanceRecord.checkInTime.getTime()) / (1000 * 60)
                );
            }

            await attendanceRecord.save();

            // Update session attendance if applicable
            if (attendanceRecord.sessionId) {
                await this.updateSessionCheckOut(attendanceRecord.sessionId, attendanceRecord);
            }

            // Update device statistics
            await this.updateDeviceStatistics(checkOutRequest.deviceInfo.deviceId, 'checkOut');

            // Send notifications if required
            await this.sendCheckOutNotifications(attendanceRecord, rules);

            this.emitRealtimeEvent('checkedOut', attendanceRecord);
            return attendanceRecord;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to check out person',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get attendance records with filtering
     */
    async getAttendanceRecords(filter: IAttendanceFilter, page: number = 1, limit: number = 10): Promise<any> {
        try {
            const query: FilterQuery<IAttendanceRecord> = {};

            if (filter.attendanceType) query.attendanceType = filter.attendanceType;
            if (filter.personId) query.personId = filter.personId;
            if (filter.locationId) query.locationId = filter.locationId;
            if (filter.roomId) query.roomId = filter.roomId;
            if (filter.sessionId) query.sessionId = filter.sessionId;
            if (filter.status) query.status = filter.status;
            if (filter.checkInMethod) query.checkInMethod = filter.checkInMethod;
            if (filter.isLate !== undefined) query.isLate = filter.isLate;
            if (filter.syncStatus) query.syncStatus = filter.syncStatus;

            if (filter.dateRange) {
                query.checkInTime = {
                    $gte: filter.dateRange.startDate,
                    $lte: filter.dateRange.endDate
                };
            }

            return await this.findWithPagination(query, {
                page,
                limit,
                sort: { checkInTime: -1 },
                populate: [
                    { path: 'locationId', select: 'name address' },
                    { path: 'roomId', select: 'name capacity' }
                ]
            });
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get attendance records',
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
                checkInTime: { $gte: startDate, $lte: endDate }
            };
            if (locationId) {
                matchStage.locationId = locationId;
            }

            const stats = await AttendanceRecord.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalRecords: { $sum: 1 },
                        checkInCount: { $sum: { $cond: [{ $ne: ['$checkInTime', null] }, 1, 0] } },
                        checkOutCount: { $sum: { $cond: [{ $ne: ['$checkOutTime', null] }, 1, 0] } },
                        presentCount: { $sum: { $cond: [{ $eq: ['$status', AttendanceStatus.PRESENT] }, 1, 0] } },
                        absentCount: { $sum: { $cond: [{ $eq: ['$status', AttendanceStatus.ABSENT] }, 1, 0] } },
                        lateCount: { $sum: { $cond: ['$isLate', 1, 0] } },
                        noShowCount: { $sum: { $cond: [{ $eq: ['$status', AttendanceStatus.NO_SHOW] }, 1, 0] } },
                        totalDuration: { $sum: '$actualDuration' },
                        attendanceByType: { $push: '$attendanceType' },
                        attendanceByMethod: { $push: '$checkInMethod' }
                    }
                }
            ]);

            const result = stats[0] || {};
            const totalRecords = result.totalRecords || 0;
            const presentCount = result.presentCount || 0;
            const checkInCount = result.checkInCount || 0;
            const lateCount = result.lateCount || 0;

            return {
                totalRecords,
                checkInCount,
                checkOutCount: result.checkOutCount || 0,
                presentCount,
                absentCount: result.absentCount || 0,
                lateCount,
                noShowCount: result.noShowCount || 0,
                averageSessionDuration: presentCount > 0 ? (result.totalDuration || 0) / presentCount : 0,
                attendanceRate: totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0,
                punctualityRate: checkInCount > 0 ? ((checkInCount - lateCount) / checkInCount) * 100 : 0,
                attendanceByType: this.countArrayItems(result.attendanceByType || []),
                attendanceByMethod: this.countArrayItems(result.attendanceByMethod || []),
                attendanceByLocation: [], // Would need additional aggregation
                dailyTrends: [], // Would need additional aggregation
                peakHours: [] // Would need additional aggregation
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get attendance statistics',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Sync offline attendance records
     */
    async syncOfflineRecords(syncData: IOfflineSync, syncedBy: string): Promise<any> {
        try {
            const results = {
                successful: 0,
                failed: 0,
                errors: [] as any[]
            };

            for (let i = 0; i < syncData.syncBatch.records.length; i++) {
                const record = syncData.syncBatch.records[i];

                try {
                    // Validate and create attendance record
                    const attendanceRecord = new AttendanceRecord({
                        ...record,
                        syncStatus: SyncStatus.SYNCED,
                        syncedAt: new Date(),
                        createdBy: syncedBy,
                        updatedBy: syncedBy
                    });

                    await attendanceRecord.save();
                    results.successful++;
                } catch (error: any) {
                    results.failed++;
                    results.errors.push({
                        recordIndex: i,
                        error: error.message
                    });
                }
            }

            // Update device sync status
            await this.updateDeviceSyncStatus(syncData.deviceId, results);

            return results;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to sync offline records',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Private helper methods

    private async getApplicableRules(
        personType: string,
        locationId: string,
        sessionId?: string
    ): Promise<IAttendanceRule[]> {
        const query: FilterQuery<IAttendanceRule> = {
            isActive: true,
            applicableTypes: { $in: [personType] },
            locationIds: { $in: [locationId] }
        };

        if (sessionId) {
            // Would need to get session type and add to query
        }

        return await AttendanceRule.find(query).sort({ priority: -1 });
    }

    private async validateCheckIn(checkInRequest: ICheckInRequest, rules: IAttendanceRule[]): Promise<void> {
        for (const rule of rules) {
            // Validate health screening if required
            if (rule.requireHealthScreening && !checkInRequest.healthScreening) {
                throw new AppError('Health screening is required', HTTP_STATUS.BAD_REQUEST);
            }

            // Validate photo if required
            if (rule.requirePhoto && !checkInRequest.photo) {
                throw new AppError('Photo is required for check-in', HTTP_STATUS.BAD_REQUEST);
            }

            // Validate location if required
            if (rule.requireLocation && !checkInRequest.location) {
                throw new AppError('Location coordinates are required', HTTP_STATUS.BAD_REQUEST);
            }

            // Check early check-in rules
            if (!rule.allowEarlyCheckIn) {
                // Would implement early check-in validation logic
            }
        }
    }

    private async validateCheckOut(
        checkOutRequest: ICheckOutRequest,
        attendanceRecord: IAttendanceRecord,
        rules: IAttendanceRule[]
    ): Promise<void> {
        for (const rule of rules) {
            // Validate authorized pickup if required
            if (rule.requireAuthorizedPickup && attendanceRecord.personType === 'student') {
                if (!checkOutRequest.pickupPersonId) {
                    throw new AppError('Authorized pickup person is required', HTTP_STATUS.BAD_REQUEST);
                }
                // Would validate against authorized pickup persons list
            }

            // Validate ID verification if required
            if (rule.requireIdVerification && !checkOutRequest.idVerified) {
                throw new AppError('ID verification is required for check-out', HTTP_STATUS.BAD_REQUEST);
            }
        }
    }

    private async calculateLateStatus(checkInRequest: ICheckInRequest): Promise<{ isLate: boolean; lateMinutes?: number }> {
        if (!checkInRequest.sessionId) {
            return { isLate: false };
        }

        const session = await AttendanceSession.findOne({ sessionId: checkInRequest.sessionId });
        if (!session) {
            return { isLate: false };
        }

        const checkInTime = new Date();
        const scheduledStartTime = session.scheduledStartTime;

        if (checkInTime > scheduledStartTime) {
            const lateMinutes = Math.round((checkInTime.getTime() - scheduledStartTime.getTime()) / (1000 * 60));
            return { isLate: true, lateMinutes };
        }

        return { isLate: false };
    }

    private async calculateEarlyDepartureStatus(
        attendanceRecord: IAttendanceRecord,
        checkOutTime: Date
    ): Promise<{ isEarlyDeparture: boolean; earlyDepartureMinutes?: number }> {
        if (!attendanceRecord.sessionId) {
            return { isEarlyDeparture: false };
        }

        const session = await AttendanceSession.findOne({ sessionId: attendanceRecord.sessionId });
        if (!session) {
            return { isEarlyDeparture: false };
        }

        const scheduledEndTime = session.scheduledEndTime;

        if (checkOutTime < scheduledEndTime) {
            const earlyMinutes = Math.round((scheduledEndTime.getTime() - checkOutTime.getTime()) / (1000 * 60));
            return { isEarlyDeparture: true, earlyDepartureMinutes: earlyMinutes };
        }

        return { isEarlyDeparture: false };
    }

    private async updateSessionAttendance(sessionId: string, attendanceRecord: IAttendanceRecord): Promise<void> {
        const session = await AttendanceSession.findOne({ sessionId });
        if (!session) return;

        // Add to actual attendees
        session.actualAttendees.push({
            personId: attendanceRecord.personId,
            personName: attendanceRecord.personName,
            personType: attendanceRecord.personType,
            checkInTime: attendanceRecord.checkInTime,
            status: attendanceRecord.status
        });

        await session.save();
    }

    private async updateSessionCheckOut(sessionId: string, attendanceRecord: IAttendanceRecord): Promise<void> {
        const session = await AttendanceSession.findOne({ sessionId });
        if (!session) return;

        // Update attendee check-out time
        const attendee = session.actualAttendees.find(a => a.personId === attendanceRecord.personId);
        if (attendee) {
            attendee.checkOutTime = attendanceRecord.checkOutTime;
            attendee.status = attendanceRecord.status;
            await session.save();
        }
    }

    private async updateDeviceStatistics(deviceId: string, operation: 'checkIn' | 'checkOut'): Promise<void> {
        const device = await AttendanceDevice.findOne({ deviceId });
        if (!device) return;

        if (operation === 'checkIn') {
            device.statistics.totalCheckIns++;
        } else {
            device.statistics.totalCheckOuts++;
        }

        device.statistics.lastUsedAt = new Date();
        await device.save();
    }

    private async updateDeviceSyncStatus(deviceId: string, syncResults: any): Promise<void> {
        const device = await AttendanceDevice.findOne({ deviceId });
        if (!device) return;

        device.statistics.lastUsedAt = new Date();
        if (syncResults.failed > 0) {
            device.statistics.errorCount += syncResults.failed;
        }

        await device.save();
    }

    private async sendCheckInNotifications(
        attendanceRecord: IAttendanceRecord,
        rules: IAttendanceRule[]
    ): Promise<void> {
        // Implementation for sending notifications
        // Would integrate with notification service
    }

    private async sendCheckOutNotifications(
        attendanceRecord: IAttendanceRecord,
        rules: IAttendanceRule[]
    ): Promise<void> {
        // Implementation for sending notifications
        // Would integrate with notification service
    }

    private async getPersonName(personId: string, personType: string): Promise<string> {
        // Implementation to get person name from respective service
        return `Person ${personId}`;
    }

    private async getBusinessUnitId(locationId: string): Promise<string> {
        // Implementation to get business unit ID from location
        return locationId; // Placeholder
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

export class AttendanceSessionService extends BaseService<IAttendanceSession> {
    constructor() {
        super(AttendanceSession);
    }

    /**
     * Create attendance session
     */
    async createSession(sessionData: any, createdBy: string): Promise<IAttendanceSession> {
        try {
            const sessionId = this.generateSessionId();

            const session = new AttendanceSession({
                sessionId,
                ...sessionData,
                createdBy,
                updatedBy: createdBy
            });

            await session.save();
            return session;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create attendance session',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get session attendance report
     */
    async getSessionReport(sessionId: string): Promise<ISessionAttendanceReport> {
        try {
            const session = await AttendanceSession.findOne({ sessionId });
            if (!session) {
                throw new AppError('Session not found', HTTP_STATUS.NOT_FOUND);
            }

            const attendanceRecords = await AttendanceRecord.find({ sessionId });

            const presentCount = attendanceRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
            const absentCount = session.expectedAttendees.length - presentCount;
            const lateCount = attendanceRecords.filter(r => r.isLate).length;
            const earlyDepartureCount = attendanceRecords.filter(r => r.isEarlyDeparture).length;

            return {
                sessionId: session.sessionId,
                sessionName: session.sessionName,
                sessionType: session.sessionType,
                scheduledStartTime: session.scheduledStartTime,
                scheduledEndTime: session.scheduledEndTime,
                maxCapacity: session.maxCapacity,
                expectedAttendees: session.expectedAttendees.length,
                actualAttendees: session.actualAttendees.length,
                attendanceRate: session.expectedAttendees.length > 0
                    ? (session.actualAttendees.length / session.expectedAttendees.length) * 100
                    : 0,
                presentCount,
                absentCount,
                lateCount,
                earlyDepartureCount,
                attendanceRecords: attendanceRecords.map(record => ({
                    personId: record.personId,
                    personName: record.personName,
                    personType: record.personType,
                    status: record.status,
                    checkInTime: record.checkInTime,
                    checkOutTime: record.checkOutTime,
                    isLate: record.isLate,
                    lateMinutes: record.lateMinutes
                }))
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get session report',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    private generateSessionId(): string {
        return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

export class AttendanceDeviceService extends BaseService<IAttendanceDevice> {
    constructor() {
        super(AttendanceDevice);
    }

    /**
     * Register attendance device
     */
    async registerDevice(deviceData: any, registeredBy: string): Promise<IAttendanceDevice> {
        try {
            const deviceId = this.generateDeviceId();

            const device = new AttendanceDevice({
                deviceId,
                ...deviceData,
                createdBy: registeredBy,
                updatedBy: registeredBy
            });

            await device.save();
            return device;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to register device',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update device heartbeat
     */
    async updateHeartbeat(deviceId: string, heartbeatData: any): Promise<void> {
        try {
            await AttendanceDevice.findOneAndUpdate(
                { deviceId },
                {
                    isOnline: true,
                    lastHeartbeat: new Date(),
                    batteryLevel: heartbeatData.batteryLevel,
                    ...heartbeatData
                }
            );
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update device heartbeat',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    private generateDeviceId(): string {
        return `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}