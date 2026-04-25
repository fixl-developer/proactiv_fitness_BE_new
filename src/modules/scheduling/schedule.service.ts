import { FilterQuery, Types } from 'mongoose';
import {
    Schedule,
    Session,
    CoachAvailability,
    RosterTemplate
} from './schedule.model';
import {
    ISchedule,
    ISession,
    ICoachAvailability,
    IRosterTemplate,
    IScheduleFilter,
    ISessionFilter,
    IScheduleGenerationRequest,
    IScheduleGenerationResult,
    IConflictResolution,
    ISubstituteSearchCriteria,
    ScheduleStatus,
    SessionStatus,
    ConflictType,
    ITimeSlot,
    IConflict
} from './schedule.interface';
import { BaseService, EntityContext } from '../../shared/base/base.service';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class ScheduleService extends BaseService<ISchedule> {
    constructor() {
        super(Schedule, 'schedule');
    }

    protected getEntityContext(doc: any): EntityContext | null {
        return {
            organizationId: doc.businessUnitId?.toString(),
            locationId: doc.locationIds?.[0]?.toString(),
        };
    }

    /**
     * Get available sessions for public booking
     */
    async getAvailableSessions(filters: any): Promise<any[]> {
        try {
            // Find published or active schedules
            const activeSchedules = await Schedule.find({
                status: { $in: [ScheduleStatus.PUBLISHED, ScheduleStatus.ACTIVE] }
            }).select('_id');

            const scheduleIds = activeSchedules.map(s => s._id);

            if (scheduleIds.length === 0) {
                return [];
            }

            // Build session query
            const sessionQuery: FilterQuery<ISession> = {
                scheduleId: { $in: scheduleIds },
                status: { $in: [SessionStatus.SCHEDULED, SessionStatus.CONFIRMED] },
                date: { $gte: new Date() }
            };

            if (filters.startDate) {
                sessionQuery.date = { ...sessionQuery.date as any, $gte: filters.startDate };
            }
            if (filters.endDate) {
                sessionQuery.date = { ...sessionQuery.date as any, $lte: filters.endDate };
            }

            // Fetch sessions with populated references
            const sessions = await Session.find(sessionQuery)
                .populate('programId', 'name category type ageGroup')
                .populate('locationId', 'name address')
                .populate('coachAssignments.coachId', 'firstName lastName name')
                .sort({ date: 1, 'timeSlot.startTime': 1 })
                .limit(100);

            // Transform to frontend TimeSlot format
            return sessions.map(session => {
                const program: any = session.programId || {};
                const location: any = session.locationId || {};
                const primaryCoach = session.coachAssignments.find(ca => ca.role === 'primary');
                const coach: any = primaryCoach?.coachId || {};

                const booked = session.enrolledParticipants?.length || 0;
                const capacity = session.maxCapacity || 10;
                const waitlist = session.waitlistParticipants?.length || 0;

                let status: string = 'available';
                if (session.status === SessionStatus.CANCELLED) {
                    status = 'cancelled';
                } else if (booked >= capacity && waitlist > 0) {
                    status = 'waitlist';
                } else if (booked >= capacity) {
                    status = 'full';
                }

                return {
                    id: session._id.toString(),
                    startTime: session.timeSlot?.startTime || '',
                    endTime: session.timeSlot?.endTime || '',
                    programType: program.type || program.category || 'class',
                    programName: program.name || 'Session',
                    coach: coach.name || `${coach.firstName || ''} ${coach.lastName || ''}`.trim() || 'TBA',
                    location: location.name || 'TBA',
                    ageGroup: program.ageGroup || 'All ages',
                    capacity,
                    booked,
                    waitlist,
                    price: 0,
                    level: program.level || 'All levels',
                    status,
                    date: session.date?.toISOString().split('T')[0] || ''
                };
            }).filter(slot => {
                // Apply frontend filters
                if (filters.location && slot.location !== filters.location) return false;
                if (filters.programType && slot.programType !== filters.programType) return false;
                if (filters.ageGroup && slot.ageGroup !== filters.ageGroup) return false;
                if (filters.coach && slot.coach !== filters.coach) return false;
                return true;
            });
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get available sessions',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Generate schedule from programs and templates
     */
    async generateSchedule(request: IScheduleGenerationRequest, createdBy: string): Promise<IScheduleGenerationResult> {
        try {
            // Resolve businessUnitId from the first program (was a bug: code used
            // programIds[0] AS the businessUnitId, which fails the ObjectId cast).
            const { Program } = require('../programs/program.model');
            const firstProgramId = (request.programIds || [])[0];
            const firstProgram = firstProgramId
                ? await Program.findById(firstProgramId).select('businessUnitId').lean().catch(() => null)
                : null;
            let businessUnitId: any = firstProgram?.businessUnitId;
            if (!businessUnitId) {
                // Fallback: derive from first location, then any active business unit.
                const { Location } = require('../bcms/location.model');
                const firstLocId = (request.locationIds || [])[0];
                const loc = firstLocId
                    ? await Location.findById(firstLocId).select('businessUnitId').lean().catch(() => null)
                    : null;
                businessUnitId = loc?.businessUnitId;
            }
            if (!businessUnitId) {
                const { BusinessUnit } = require('../bcms/business-unit.model');
                const anyBu = await BusinessUnit.findOne({ isDeleted: { $ne: true } }).select('_id').lean().catch(() => null);
                businessUnitId = anyBu?._id;
            }
            if (!businessUnitId) {
                throw new AppError(
                    'Cannot resolve businessUnitId — no program/location/business-unit found',
                    HTTP_STATUS.BAD_REQUEST
                );
            }

            // Resolve termId. The Schedule model requires it. If the caller didn't
            // supply one (e.g. admin "Generate Schedule" UI without a term picker),
            // either reuse an existing term that overlaps the requested dates, or
            // auto-create a lightweight ad-hoc Term so the schedule can be saved.
            let termId: any = request.termId;
            if (!termId) {
                const { Term } = require('../bcms/term.model');
                const existingTerm = await Term.findOne({
                    businessUnitId,
                    isDeleted: { $ne: true },
                    startDate: { $lte: request.endDate },
                    endDate: { $gte: request.startDate },
                }).select('_id').lean().catch(() => null);
                if (existingTerm?._id) {
                    termId = existingTerm._id;
                } else {
                    // Compute weeks (Term schema requires it; pre-save middleware
                    // runs after validation so we must set weeks ourselves).
                    const start = new Date(request.startDate);
                    const end = new Date(request.endDate);
                    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                    const weeks = Math.max(1, Math.ceil(days / 7));

                    const adHocTerm = await Term.create({
                        name: `Ad-hoc Term ${new Date().toISOString().slice(0, 10)}`,
                        code: `ADHOC${Date.now().toString(36).toUpperCase()}`,
                        businessUnitId,
                        startDate: start,
                        endDate: end,
                        weeks,
                        isActive: true,
                        allowEnrollment: false,
                        createdBy,
                        updatedBy: createdBy,
                    }).catch((e: any) => {
                        console.error('Auto term create failed:', e?.message, e?.errors);
                        return null;
                    });
                    termId = adHocTerm?._id;
                }
            }
            if (!termId) {
                throw new AppError(
                    'termId required and could not be auto-created (provide termId in payload)',
                    HTTP_STATUS.BAD_REQUEST
                );
            }

            // Create new schedule
            const scheduleDoc: any = {
                name: `Schedule ${new Date().toISOString().slice(0, 10)}`,
                termId,
                businessUnitId,
                locationIds: request.locationIds,
                startDate: request.startDate,
                endDate: request.endDate,
                status: ScheduleStatus.DRAFT,
                generationSettings: request.settings,
                createdBy,
                updatedBy: createdBy
            };
            const schedule = new Schedule(scheduleDoc);

            await schedule.save();

            // Generate sessions for each program
            const sessions: ISession[] = [];
            const conflicts: IConflict[] = [];
            let successfulSessions = 0;
            let failedSessions = 0;

            for (const programId of request.programIds) {
                const programSessions = await this.generateSessionsForProgram(
                    programId,
                    schedule._id.toString(),
                    request,
                    createdBy
                );

                sessions.push(...programSessions.sessions);
                conflicts.push(...programSessions.conflicts);
                successfulSessions += programSessions.successful;
                failedSessions += programSessions.failed;
            }

            // Update schedule with sessions
            schedule.sessions = sessions.map(s => s._id);
            schedule.totalSessions = sessions.length;
            schedule.statistics.totalConflicts = conflicts.length;
            schedule.statistics.pendingConflicts = conflicts.length;

            await schedule.save();
            this.emitRealtimeEvent('generated', schedule);

            // Calculate statistics
            const statistics = await this.calculateScheduleStatistics(schedule._id.toString());

            return {
                scheduleId: schedule._id.toString(),
                totalSessions: sessions.length,
                successfulSessions,
                failedSessions,
                conflicts,
                warnings: [],
                statistics
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to generate schedule',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Publish schedule
     */
    async publishSchedule(scheduleId: string, publishedBy: string): Promise<ISchedule> {
        try {
            const schedule = await this.findById(scheduleId);
            if (!schedule) {
                throw new AppError('Schedule not found', HTTP_STATUS.NOT_FOUND);
            }

            if (schedule.status !== ScheduleStatus.DRAFT) {
                throw new AppError('Only draft schedules can be published', HTTP_STATUS.BAD_REQUEST);
            }

            // Check for critical conflicts
            const criticalConflicts = await this.getCriticalConflicts(scheduleId);
            if (criticalConflicts.length > 0) {
                throw new AppError(
                    'Cannot publish schedule with critical conflicts',
                    HTTP_STATUS.BAD_REQUEST
                );
            }

            schedule.status = ScheduleStatus.PUBLISHED;
            schedule.publishedAt = new Date();
            schedule.publishedBy = publishedBy;
            schedule.updatedBy = publishedBy;

            await schedule.save();
            this.emitRealtimeEvent('published', schedule);

            // Update all sessions to confirmed status
            await Session.updateMany(
                { scheduleId: schedule._id, status: SessionStatus.SCHEDULED },
                { status: SessionStatus.CONFIRMED }
            );

            return schedule;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to publish schedule',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Detect conflicts in schedule
     */
    async detectConflicts(scheduleId: string): Promise<IConflict[]> {
        try {
            const sessions = await Session.find({ scheduleId }).populate('coachAssignments.coachId');
            const conflicts: IConflict[] = [];

            // Check for coach double booking
            const coachConflicts = await this.detectCoachConflicts(sessions);
            conflicts.push(...coachConflicts);

            // Check for room double booking
            const roomConflicts = await this.detectRoomConflicts(sessions);
            conflicts.push(...roomConflicts);

            // Check for travel time violations
            const travelConflicts = await this.detectTravelTimeConflicts(sessions);
            conflicts.push(...travelConflicts);

            // Check for capacity issues
            const capacityConflicts = await this.detectCapacityConflicts(sessions);
            conflicts.push(...capacityConflicts);

            return conflicts;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to detect conflicts',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Resolve conflict
     */
    async resolveConflict(
        conflictId: string,
        resolution: IConflictResolution,
        resolvedBy: string
    ): Promise<void> {
        try {
            const session = await Session.findOne({ 'conflicts._id': conflictId });
            if (!session) {
                throw new AppError('Conflict not found', HTTP_STATUS.NOT_FOUND);
            }

            // @ts-ignore
            const conflict = session.conflicts.id(conflictId);
            if (!conflict) {
                throw new AppError('Conflict not found', HTTP_STATUS.NOT_FOUND);
            }

            // Apply resolution based on type
            switch (resolution.resolutionType) {
                case 'reschedule':
                    if (resolution.newTimeSlot) {
                        session.timeSlot = resolution.newTimeSlot;
                    }
                    break;
                case 'reassign_coach':
                    if (resolution.newCoachId) {
                        const primaryCoach = session.coachAssignments.find(ca => ca.role === 'primary');
                        if (primaryCoach) {
                            primaryCoach.coachId = resolution.newCoachId;
                        }
                    }
                    break;
                case 'change_room':
                    if (resolution.newRoomId) {
                        session.roomId = resolution.newRoomId;
                    }
                    break;
                case 'cancel':
                    session.status = SessionStatus.CANCELLED;
                    break;
            }

            // Mark conflict as resolved
            conflict.resolvedAt = new Date();
            conflict.resolvedBy = resolvedBy;

            await session.save();

            // Update schedule statistics
            await this.updateScheduleStatistics(session.scheduleId);
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to resolve conflict',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Find substitute coaches
     */
    async findSubstituteCoaches(criteria: ISubstituteSearchCriteria): Promise<any[]> {
        try {
            const session = await Session.findById(criteria.sessionId);
            if (!session) {
                throw new AppError('Session not found', HTTP_STATUS.NOT_FOUND);
            }

            // Find available coaches
            const availableCoaches = await CoachAvailability.find({
                locationId: criteria.locationId,
                effectiveFrom: { $lte: session.date },
                $or: [
                    { effectiveTo: { $exists: false } },
                    { effectiveTo: { $gte: session.date } }
                ],
                coachId: { $nin: criteria.excludeCoaches || [] }
            }).populate('coachId');

            const substitutes = [];

            for (const availability of availableCoaches) {
                // Check if coach is available at the time slot
                const isAvailable = await this.isCoachAvailable(
                    availability.coachId.toString(),
                    session.date,
                    criteria.timeSlot
                );

                if (isAvailable) {
                    // @ts-ignore - coachId is populated
                    const coach: any = availability.coachId;
                    substitutes.push({
                        coachId: coach._id,
                        coachName: coach.name,
                        skills: coach.skills || [],
                        rating: coach.rating || 0,
                        distance: 0 // Would calculate actual distance
                    });
                }
            }

            return substitutes.sort((a, b) => b.rating - a.rating);
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to find substitute coaches',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get coach schedule
     */
    async getCoachSchedule(
        coachId: string,
        startDate: Date,
        endDate: Date
    ): Promise<ISession[]> {
        try {
            return await Session.find({
                'coachAssignments.coachId': coachId,
                date: { $gte: startDate, $lte: endDate },
                status: { $nin: [SessionStatus.CANCELLED] }
            })
                .populate('programId', 'name category')
                .populate('locationId', 'name address')
                .populate('roomId', 'name')
                .sort({ date: 1, 'timeSlot.startTime': 1 });
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get coach schedule',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get room schedule
     */
    async getRoomSchedule(
        roomId: string,
        startDate: Date,
        endDate: Date
    ): Promise<ISession[]> {
        try {
            return await Session.find({
                roomId,
                date: { $gte: startDate, $lte: endDate },
                status: { $nin: [SessionStatus.CANCELLED] }
            })
                .populate('programId', 'name category')
                .populate('coachAssignments.coachId', 'firstName lastName')
                .sort({ date: 1, 'timeSlot.startTime': 1 });
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get room schedule',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Private helper methods

    private async generateSessionsForProgram(
        programId: string,
        scheduleId: string,
        request: IScheduleGenerationRequest,
        createdBy: string
    ): Promise<{
        sessions: ISession[];
        conflicts: IConflict[];
        successful: number;
        failed: number;
    }> {
        const sessions: ISession[] = [];
        const conflicts: IConflict[] = [];
        let successful = 0;
        let failed = 0;

        // Get program details and roster template
        const program = await this.getProgram(programId);
        const template = await this.getRosterTemplate(programId);

        if (!program || !template) {
            return { sessions, conflicts, successful, failed };
        }

        // Generate sessions based on template
        const currentDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);

        while (currentDate <= endDate) {
            for (const timeSlot of template.timeSlots) {
                if (currentDate.getDay() === timeSlot.dayOfWeek) {
                    try {
                        const session = await this.createSession({
                            programId,
                            scheduleId,
                            date: new Date(currentDate),
                            timeSlot,
                            template,
                            createdBy
                        });

                        sessions.push(session);
                        successful++;
                    } catch (error) {
                        failed++;
                        conflicts.push({
                            type: ConflictType.TIME_OVERLAP,
                            severity: 'medium',
                            description: `Failed to create session: ${error.message}`,
                            affectedSessions: []
                        });
                    }
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return { sessions, conflicts, successful, failed };
    }

    private async createSession(params: {
        programId: string;
        scheduleId: string;
        date: Date;
        timeSlot: ITimeSlot;
        template: IRosterTemplate;
        createdBy: string;
    }): Promise<ISession> {
        const sessionId = `${params.programId}-${params.date.toISOString().split('T')[0]}-${params.timeSlot.startTime}`;

        const session = new Session({
            sessionId,
            programId: params.programId,
            termId: params.scheduleId, // This should be actual term ID
            scheduleId: params.scheduleId,
            date: params.date,
            timeSlot: params.timeSlot,
            duration: params.template.sessionDuration,
            locationId: params.template.programId, // This should be actual location ID
            resourceRequirements: params.template.defaultResourceRequirements,
            coachAssignments: [], // Would be assigned by coach assignment logic
            enrolledParticipants: [],
            maxCapacity: 10, // Would come from program
            waitlistParticipants: [],
            createdBy: params.createdBy,
            updatedBy: params.createdBy
        });

        await session.save();
        return session;
    }

    private async detectCoachConflicts(sessions: ISession[]): Promise<IConflict[]> {
        const conflicts: IConflict[] = [];
        const coachSessions = new Map<string, ISession[]>();

        // Group sessions by coach
        for (const session of sessions) {
            for (const assignment of session.coachAssignments) {
                const coachId = assignment.coachId.toString();
                if (!coachSessions.has(coachId)) {
                    coachSessions.set(coachId, []);
                }
                coachSessions.get(coachId)!.push(session);
            }
        }

        // Check for overlapping sessions
        for (const [coachId, coachSessionList] of coachSessions) {
            for (let i = 0; i < coachSessionList.length; i++) {
                for (let j = i + 1; j < coachSessionList.length; j++) {
                    const session1 = coachSessionList[i];
                    const session2 = coachSessionList[j];

                    if (this.sessionsOverlap(session1, session2)) {
                        conflicts.push({
                            type: ConflictType.COACH_DOUBLE_BOOKING,
                            severity: 'high',
                            description: `Coach ${coachId} is double booked`,
                            affectedSessions: [session1._id.toString(), session2._id.toString()]
                        });
                    }
                }
            }
        }

        return conflicts;
    }

    private async detectRoomConflicts(sessions: ISession[]): Promise<IConflict[]> {
        const conflicts: IConflict[] = [];
        const roomSessions = new Map<string, ISession[]>();

        // Group sessions by room
        for (const session of sessions) {
            if (session.roomId) {
                const roomId = session.roomId.toString();
                if (!roomSessions.has(roomId)) {
                    roomSessions.set(roomId, []);
                }
                roomSessions.get(roomId)!.push(session);
            }
        }

        // Check for overlapping sessions
        for (const [roomId, roomSessionList] of roomSessions) {
            for (let i = 0; i < roomSessionList.length; i++) {
                for (let j = i + 1; j < roomSessionList.length; j++) {
                    const session1 = roomSessionList[i];
                    const session2 = roomSessionList[j];

                    if (this.sessionsOverlap(session1, session2)) {
                        conflicts.push({
                            type: ConflictType.ROOM_DOUBLE_BOOKING,
                            severity: 'high',
                            description: `Room ${roomId} is double booked`,
                            affectedSessions: [session1._id.toString(), session2._id.toString()]
                        });
                    }
                }
            }
        }

        return conflicts;
    }

    private async detectTravelTimeConflicts(sessions: ISession[]): Promise<IConflict[]> {
        // Implementation for travel time conflict detection
        return [];
    }

    private async detectCapacityConflicts(sessions: ISession[]): Promise<IConflict[]> {
        const conflicts: IConflict[] = [];

        for (const session of sessions) {
            if (session.enrolledParticipants.length > session.maxCapacity) {
                conflicts.push({
                    type: ConflictType.CAPACITY_EXCEEDED,
                    severity: 'medium',
                    description: `Session capacity exceeded: ${session.enrolledParticipants.length}/${session.maxCapacity}`,
                    affectedSessions: [session._id.toString()]
                });
            }
        }

        return conflicts;
    }

    private sessionsOverlap(session1: ISession, session2: ISession): boolean {
        if (session1.date.toDateString() !== session2.date.toDateString()) {
            return false;
        }

        const start1 = this.timeToMinutes(session1.timeSlot.startTime);
        const end1 = this.timeToMinutes(session1.timeSlot.endTime);
        const start2 = this.timeToMinutes(session2.timeSlot.startTime);
        const end2 = this.timeToMinutes(session2.timeSlot.endTime);

        return start1 < end2 && start2 < end1;
    }

    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    private async isCoachAvailable(
        coachId: string,
        date: Date,
        timeSlot: ITimeSlot
    ): Promise<boolean> {
        // Check coach availability
        const availability = await CoachAvailability.findOne({
            coachId,
            effectiveFrom: { $lte: date },
            $or: [
                { effectiveTo: { $exists: false } },
                { effectiveTo: { $gte: date } }
            ]
        });

        if (!availability) {
            return false;
        }

        // Check if coach is available on this day and time
        const dayOfWeek = date.getDay();
        const availableSlot = availability.weeklyAvailability.find(slot =>
            slot.dayOfWeek === dayOfWeek &&
            slot.isAvailable &&
            this.timeToMinutes(slot.startTime) <= this.timeToMinutes(timeSlot.startTime) &&
            this.timeToMinutes(slot.endTime) >= this.timeToMinutes(timeSlot.endTime)
        );

        return !!availableSlot;
    }

    private async getCriticalConflicts(scheduleId: string): Promise<IConflict[]> {
        const sessions = await Session.find({ scheduleId });
        const allConflicts: IConflict[] = [];

        for (const session of sessions) {
            const criticalConflicts = session.conflicts.filter(c => c.severity === 'critical');
            allConflicts.push(...criticalConflicts);
        }

        return allConflicts;
    }

    private async calculateScheduleStatistics(scheduleId: string): Promise<any> {
        // Implementation for calculating schedule statistics
        return {
            coachUtilization: {},
            roomUtilization: {},
            timeSlotDistribution: {}
        };
    }

    private async updateScheduleStatistics(scheduleId: string): Promise<void> {
        // Implementation for updating schedule statistics
    }

    private async getProgram(programId: string): Promise<any> {
        // This would fetch from Program model
        return { id: programId };
    }

    private async getRosterTemplate(programId: string): Promise<IRosterTemplate | null> {
        return await RosterTemplate.findOne({ programId, isActive: true });
    }
}
