import { Document } from 'mongoose';

export enum ScheduleStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export enum SessionStatus {
    SCHEDULED = 'scheduled',
    CONFIRMED = 'confirmed',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    RESCHEDULED = 'rescheduled'
}

export enum ConflictType {
    COACH_DOUBLE_BOOKING = 'coach_double_booking',
    ROOM_DOUBLE_BOOKING = 'room_double_booking',
    EQUIPMENT_CONFLICT = 'equipment_conflict',
    CAPACITY_EXCEEDED = 'capacity_exceeded',
    TIME_OVERLAP = 'time_overlap',
    TRAVEL_TIME_VIOLATION = 'travel_time_violation'
}

export enum SubstituteStatus {
    REQUESTED = 'requested',
    CONFIRMED = 'confirmed',
    DECLINED = 'declined',
    COMPLETED = 'completed'
}

export interface ITimeSlot {
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
}

export interface ICoachAssignment {
    coachId: string;
    role: 'primary' | 'assistant' | 'substitute';
    confirmedAt?: Date;
    notes?: string;
}

export interface IResourceRequirement {
    resourceType: 'room' | 'equipment' | 'facility';
    resourceId: string;
    quantity?: number;
    isRequired: boolean;
    alternatives?: string[];
}

export interface IConflict {
    type: ConflictType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedSessions: string[];
    suggestedResolution?: string;
    resolvedAt?: Date;
    resolvedBy?: string;
}

export interface IAvailabilitySlot {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    reason?: string; // if not available
}

export interface ISubstituteRequest {
    originalCoachId: string;
    substituteCoachId?: string;
    requestedBy: string;
    requestedAt: Date;
    reason: string;
    status: SubstituteStatus;
    respondedAt?: Date;
    notes?: string;
}

export interface ITravelTime {
    fromLocationId: string;
    toLocationId: string;
    estimatedMinutes: number;
    transportMode: 'walking' | 'driving' | 'public_transport';
}

export interface ISession extends Document {
    // Basic Information
    sessionId: string; // Unique identifier
    programId: any;
    termId: string;
    scheduleId: string;

    // Timing
    date: Date;
    timeSlot: ITimeSlot;
    duration: number; // in minutes

    // Location and Resources
    locationId: string;
    roomId?: string;
    resourceRequirements: IResourceRequirement[];

    // Staff Assignment
    coachAssignments: ICoachAssignment[];

    // Participants
    enrolledParticipants: string[];
    maxCapacity: number;
    waitlistParticipants: string[];

    // Status and Tracking
    status: SessionStatus;
    attendanceCount?: number;
    completedAt?: Date;

    // Conflicts and Issues
    conflicts: IConflict[];

    // Substitution
    substituteRequests: ISubstituteRequest[];

    // Notes and Instructions
    sessionNotes?: string;
    coachInstructions?: string;
    specialRequirements?: string[];

    // Audit
    createdBy: any;
    updatedBy: any;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISchedule extends Document {
    // Basic Information
    name: string;
    description?: string;
    termId: string;
    businessUnitId: string;
    locationIds: string[];

    // Time Period
    startDate: Date;
    endDate: Date;

    // Status
    status: ScheduleStatus;
    publishedAt?: Date;
    publishedBy?: any;

    // Sessions
    sessions: string[]; // Session IDs
    totalSessions: number;

    // Generation Settings
    generationSettings: {
        autoAssignCoaches: boolean;
        autoResolveConflicts: boolean;
        allowOverbooking: boolean;
        bufferTimeMinutes: number;
        maxTravelTimeMinutes: number;
    };

    // Statistics
    statistics: {
        totalConflicts: number;
        resolvedConflicts: number;
        pendingConflicts: number;
        utilizationRate: number; // percentage
        coachUtilization: Record<string, number>;
        roomUtilization: Record<string, number>;
    };

    // Audit
    createdBy: any;
    updatedBy: any;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}

export interface ICoachAvailability extends Document {
    coachId: string;
    locationId: string;

    // Regular Availability
    weeklyAvailability: IAvailabilitySlot[];

    // Exceptions
    unavailableDates: {
        date: Date;
        reason: string;
        isFullDay: boolean;
        timeSlots?: ITimeSlot[];
    }[];

    // Preferences
    preferredTimeSlots: ITimeSlot[];
    maxHoursPerDay: number;
    maxHoursPerWeek: number;
    minBreakBetweenSessions: number; // in minutes

    // Travel Constraints
    maxTravelTime: number; // in minutes
    canTravelBetweenLocations: boolean;

    // Effective Period
    effectiveFrom: Date;
    effectiveTo?: Date;

    // Audit
    createdBy: any;
    updatedBy: any;
    createdAt: Date;
    updatedAt: Date;
}

export interface IRosterTemplate extends Document {
    name: string;
    description?: string;
    programId: any;

    // Template Structure
    sessionsPerWeek: number;
    sessionDuration: number;
    timeSlots: ITimeSlot[];

    // Resource Requirements
    defaultResourceRequirements: IResourceRequirement[];

    // Coach Requirements
    coachRequirements: {
        minCoaches: number;
        maxCoaches: number;
        requiredSkills: string[];
        preferredCoaches: string[];
    };

    // Rules
    rules: {
        allowBackToBackSessions: boolean;
        minBreakBetweenSessions: number;
        maxSessionsPerDay: number;
        requireSameCoachForTerm: boolean;
    };

    // Status
    isActive: boolean;

    // Audit
    createdBy: any;
    updatedBy: any;
    createdAt: Date;
    updatedAt: Date;
}

export interface IScheduleFilter {
    termId?: string;
    businessUnitId?: string;
    locationId?: string;
    coachId?: string;
    programId?: string;
    status?: ScheduleStatus;
    dateRange?: {
        startDate: Date;
        endDate: Date;
    };
    hasConflicts?: boolean;
}

export interface ISessionFilter {
    scheduleId?: string;
    programId?: string;
    coachId?: string;
    locationId?: string;
    roomId?: string;
    status?: SessionStatus;
    date?: Date;
    dateRange?: {
        startDate: Date;
        endDate: Date;
    };
    hasConflicts?: boolean;
}

export interface IScheduleGenerationRequest {
    termId: string;
    programIds: string[];
    locationIds: string[];
    // Coach User._ids selected by admin in the Generate Schedule form. Optional —
    // when omitted (or empty), the service falls back to assigning any active
    // coach automatically. When provided, these are distributed round-robin
    // across generated sessions so a multi-coach roster gets fair coverage.
    coachIds?: string[];
    startDate: Date;
    endDate: Date;
    settings: {
        autoAssignCoaches: boolean;
        autoResolveConflicts: boolean;
        allowOverbooking: boolean;
        bufferTimeMinutes: number;
        maxTravelTimeMinutes: number;
        preferredTimeSlots?: ITimeSlot[];
        excludedDates?: Date[];
    };
}

export interface IScheduleGenerationResult {
    scheduleId: string;
    totalSessions: number;
    successfulSessions: number;
    failedSessions: number;
    conflicts: IConflict[];
    warnings: string[];
    statistics: {
        coachUtilization: Record<string, number>;
        roomUtilization: Record<string, number>;
        timeSlotDistribution: Record<string, number>;
    };
}

export interface IConflictResolution {
    conflictId: string;
    resolutionType: 'reschedule' | 'reassign_coach' | 'change_room' | 'split_session' | 'cancel';
    newTimeSlot?: ITimeSlot;
    newCoachId?: string;
    newRoomId?: string;
    reason: string;
}

export interface ISubstituteSearchCriteria {
    sessionId: string;
    requiredSkills: string[];
    timeSlot: ITimeSlot;
    locationId: string;
    maxTravelTime?: number;
    excludeCoaches?: string[];
}

