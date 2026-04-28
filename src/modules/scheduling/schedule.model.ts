import { Schema, model } from 'mongoose';
import {
    ISession,
    ISchedule,
    ICoachAvailability,
    IRosterTemplate,
    ScheduleStatus,
    SessionStatus,
    ConflictType,
    SubstituteStatus
} from './schedule.interface';
import { baseSchemaOptions } from '../../shared/base/base.model';

// Time Slot Schema
const timeSlotSchema = new Schema({
    startTime: {
        type: String,
        required: [true, 'Start time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    endTime: {
        type: String,
        required: [true, 'End time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    dayOfWeek: {
        type: Number,
        required: [true, 'Day of week is required'],
        min: [0, 'Day of week must be between 0-6'],
        max: [6, 'Day of week must be between 0-6']
    }
});

// Coach Assignment Schema
const coachAssignmentSchema = new Schema({
    // @ts-ignore - Mongoose type issue
    coachId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Coach ID is required']
    },
    role: {
        type: String,
        enum: ['primary', 'assistant', 'substitute'],
        required: [true, 'Coach role is required']
    },
    confirmedAt: Date,
    notes: String
});

// Resource Requirement Schema
const resourceRequirementSchema = new Schema({
    resourceType: {
        type: String,
        enum: ['room', 'equipment', 'facility'],
        required: [true, 'Resource type is required']
    },
    // @ts-ignore - Mongoose type issue
    resourceId: {
        type: Schema.Types.ObjectId,
        required: [true, 'Resource ID is required']
    },
    quantity: {
        type: Number,
        min: [1, 'Quantity must be at least 1'],
        default: 1
    },
    isRequired: {
        type: Boolean,
        default: true
    },
    alternatives: [{
        type: Schema.Types.ObjectId
    }]
});
// Conflict Schema
const conflictSchema = new Schema({
    type: {
        type: String,
        enum: Object.values(ConflictType),
        required: [true, 'Conflict type is required']
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: [true, 'Conflict severity is required']
    },
    description: {
        type: String,
        required: [true, 'Conflict description is required']
    },
    affectedSessions: [{
        type: Schema.Types.ObjectId,
        ref: 'Session'
    }],
    suggestedResolution: String,
    resolvedAt: Date,
    resolvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Substitute Request Schema
const substituteRequestSchema = new Schema({
    // @ts-ignore - Mongoose type issue
    originalCoachId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Original coach ID is required']
    },
    // @ts-ignore - Mongoose type issue
    substituteCoachId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    requestedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Requested by is required']
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    reason: {
        type: String,
        required: [true, 'Reason is required']
    },
    status: {
        type: String,
        enum: Object.values(SubstituteStatus),
        default: SubstituteStatus.REQUESTED
    },
    respondedAt: Date,
    notes: String
});

// Session Schema
const sessionSchema = new Schema<ISession>({
    // @ts-ignore - Mongoose type issue
    sessionId: {
        type: String,
        required: [true, 'Session ID is required'],
        unique: true,
        index: true
    },
    programId: {
        type: Schema.Types.ObjectId,
        ref: 'Program',
        required: [true, 'Program ID is required'],
        index: true
    },
    // @ts-ignore - Mongoose type issue
    termId: {
        type: Schema.Types.ObjectId,
        ref: 'Term',
        required: [true, 'Term ID is required'],
        index: true
    },
    // @ts-ignore - Mongoose type issue
    scheduleId: {
        type: Schema.Types.ObjectId,
        ref: 'Schedule',
        required: [true, 'Schedule ID is required'],
        index: true
    },

    // Timing
    date: {
        type: Date,
        required: [true, 'Session date is required'],
        index: true
    },
    timeSlot: {
        type: timeSlotSchema,
        required: [true, 'Time slot is required']
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [15, 'Duration must be at least 15 minutes']
    },

    // Location and Resources
    // @ts-ignore - Mongoose type issue
    locationId: {
        type: Schema.Types.ObjectId,
        ref: 'Location',
        required: [true, 'Location ID is required'],
        index: true
    },
    // @ts-ignore - Mongoose type issue
    roomId: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    resourceRequirements: [resourceRequirementSchema],

    // Staff Assignment
    coachAssignments: {
        type: [coachAssignmentSchema],
        validate: {
            validator: function (assignments: any[]) {
                return assignments && assignments.length > 0;
            },
            message: 'At least one coach assignment is required'
        }
    },

    // Participants
    enrolledParticipants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    maxCapacity: {
        type: Number,
        required: [true, 'Max capacity is required'],
        min: [1, 'Max capacity must be at least 1']
    },
    waitlistParticipants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Status and Tracking
    status: {
        type: String,
        enum: Object.values(SessionStatus),
        default: SessionStatus.SCHEDULED,
        index: true
    },
    attendanceCount: {
        type: Number,
        min: [0, 'Attendance count cannot be negative']
    },
    completedAt: Date,

    // Conflicts and Issues
    conflicts: [conflictSchema],

    // Substitution
    substituteRequests: [substituteRequestSchema],

    // Notes and Instructions
    sessionNotes: String,
    coachInstructions: String,
    specialRequirements: [String],

    // Audit
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created by is required']
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Updated by is required']
    }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Schedule Schema
const scheduleSchema = new Schema<ISchedule>({
    name: {
        type: String,
        required: [true, 'Schedule name is required'],
        trim: true,
        maxlength: [100, 'Schedule name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    // @ts-ignore - Mongoose type issue
    termId: {
        type: Schema.Types.ObjectId,
        ref: 'Term',
        required: [true, 'Term ID is required'],
        index: true
    },
    // @ts-ignore - Mongoose type issue
    businessUnitId: {
        type: Schema.Types.ObjectId,
        ref: 'BusinessUnit',
        required: [true, 'Business unit ID is required'],
        index: true
    },
    locationIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Location',
        required: [true, 'At least one location is required']
    }],

    // Time Period
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
        index: true
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
        index: true
    },

    // Status
    status: {
        type: String,
        enum: Object.values(ScheduleStatus),
        default: ScheduleStatus.DRAFT,
        index: true
    },
    publishedAt: Date,
    publishedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    // Sessions
    sessions: [{
        type: Schema.Types.ObjectId,
        ref: 'Session'
    }],
    totalSessions: {
        type: Number,
        default: 0,
        min: [0, 'Total sessions cannot be negative']
    },

    // Generation Settings
    generationSettings: {
        autoAssignCoaches: {
            type: Boolean,
            default: true
        },
        autoResolveConflicts: {
            type: Boolean,
            default: false
        },
        allowOverbooking: {
            type: Boolean,
            default: false
        },
        bufferTimeMinutes: {
            type: Number,
            default: 15,
            min: [0, 'Buffer time cannot be negative']
        },
        maxTravelTimeMinutes: {
            type: Number,
            default: 30,
            min: [0, 'Max travel time cannot be negative']
        }
    },

    // Statistics
    statistics: {
        totalConflicts: {
            type: Number,
            default: 0
        },
        resolvedConflicts: {
            type: Number,
            default: 0
        },
        pendingConflicts: {
            type: Number,
            default: 0
        },
        utilizationRate: {
            type: Number,
            default: 0,
            min: [0, 'Utilization rate cannot be negative'],
            max: [100, 'Utilization rate cannot exceed 100%']
        },
        coachUtilization: {
            type: Map,
            of: Number,
            default: new Map()
        },
        roomUtilization: {
            type: Map,
            of: Number,
            default: new Map()
        }
    },

    // Audit
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created by is required']
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Updated by is required']
    },
    version: {
        type: Number,
        default: 1
    }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Coach Availability Schema
const availabilitySlotSchema = new Schema({
    dayOfWeek: {
        type: Number,
        required: [true, 'Day of week is required'],
        min: [0, 'Day of week must be between 0-6'],
        max: [6, 'Day of week must be between 0-6']
    },
    startTime: {
        type: String,
        required: [true, 'Start time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    endTime: {
        type: String,
        required: [true, 'End time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    isAvailable: {
        type: Boolean,
        required: [true, 'Availability status is required']
    },
    reason: String
});

const coachAvailabilitySchema = new Schema<ICoachAvailability>({
    // @ts-ignore - Mongoose type issue
    coachId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Coach ID is required'],
        index: true
    },
    // @ts-ignore - Mongoose type issue
    locationId: {
        type: Schema.Types.ObjectId,
        ref: 'Location',
        required: [true, 'Location ID is required'],
        index: true
    },

    // Regular Availability
    weeklyAvailability: [availabilitySlotSchema],

    // Exceptions
    unavailableDates: [{
        date: {
            type: Date,
            required: [true, 'Date is required']
        },
        reason: {
            type: String,
            required: [true, 'Reason is required']
        },
        isFullDay: {
            type: Boolean,
            default: true
        },
        timeSlots: [timeSlotSchema]
    }],

    // Preferences
    preferredTimeSlots: [timeSlotSchema],
    maxHoursPerDay: {
        type: Number,
        required: [true, 'Max hours per day is required'],
        min: [1, 'Max hours per day must be at least 1'],
        max: [24, 'Max hours per day cannot exceed 24']
    },
    maxHoursPerWeek: {
        type: Number,
        required: [true, 'Max hours per week is required'],
        min: [1, 'Max hours per week must be at least 1'],
        max: [168, 'Max hours per week cannot exceed 168']
    },
    minBreakBetweenSessions: {
        type: Number,
        default: 15,
        min: [0, 'Min break cannot be negative']
    },

    // Travel Constraints
    maxTravelTime: {
        type: Number,
        default: 30,
        min: [0, 'Max travel time cannot be negative']
    },
    canTravelBetweenLocations: {
        type: Boolean,
        default: true
    },

    // Effective Period
    effectiveFrom: {
        type: Date,
        required: [true, 'Effective from date is required'],
        index: true
    },
    effectiveTo: {
        type: Date,
        index: true
    },

    // Audit
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created by is required']
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Updated by is required']
    }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Roster Template Schema
const rosterTemplateSchema = new Schema<IRosterTemplate>({
    name: {
        type: String,
        required: [true, 'Template name is required'],
        trim: true,
        maxlength: [100, 'Template name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    // @ts-ignore - Mongoose type issue
    programId: {
        type: Schema.Types.ObjectId,
        ref: 'Program',
        required: [true, 'Program ID is required'],
        index: true
    },

    // Template Structure
    sessionsPerWeek: {
        type: Number,
        required: [true, 'Sessions per week is required'],
        min: [1, 'Must have at least 1 session per week'],
        max: [7, 'Cannot have more than 7 sessions per week']
    },
    sessionDuration: {
        type: Number,
        required: [true, 'Session duration is required'],
        min: [15, 'Session duration must be at least 15 minutes']
    },
    timeSlots: [timeSlotSchema],

    // Resource Requirements
    defaultResourceRequirements: [resourceRequirementSchema],

    // Coach Requirements
    coachRequirements: {
        minCoaches: {
            type: Number,
            required: [true, 'Minimum coaches is required'],
            min: [1, 'Must have at least 1 coach']
        },
        maxCoaches: {
            type: Number,
            required: [true, 'Maximum coaches is required'],
            min: [1, 'Must have at least 1 coach']
        },
        requiredSkills: [String],
        preferredCoaches: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    },

    // Rules
    rules: {
        allowBackToBackSessions: {
            type: Boolean,
            default: true
        },
        minBreakBetweenSessions: {
            type: Number,
            default: 15,
            min: [0, 'Min break cannot be negative']
        },
        maxSessionsPerDay: {
            type: Number,
            default: 8,
            min: [1, 'Max sessions per day must be at least 1']
        },
        requireSameCoachForTerm: {
            type: Boolean,
            default: false
        }
    },

    // Status
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },

    // Audit
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created by is required']
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Updated by is required']
    }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Indexes
sessionSchema.index({ date: 1, locationId: 1, status: 1 });
sessionSchema.index({ 'coachAssignments.coachId': 1, date: 1 });
sessionSchema.index({ programId: 1, termId: 1, date: 1 });
sessionSchema.index({ scheduleId: 1, status: 1 });

scheduleSchema.index({ termId: 1, businessUnitId: 1, status: 1 });
scheduleSchema.index({ startDate: 1, endDate: 1 });
scheduleSchema.index({ locationIds: 1, status: 1 });

coachAvailabilitySchema.index({ coachId: 1, locationId: 1, effectiveFrom: 1 });
coachAvailabilitySchema.index({ effectiveFrom: 1, effectiveTo: 1 });

rosterTemplateSchema.index({ programId: 1, isActive: 1 });

// Pre-save middleware
scheduleSchema.pre('save', function (next) {
    // @ts-ignore
    const schedule = this as any;

    if (schedule.startDate >= schedule.endDate) {
        return next(new Error('Start date must be before end date'));
    }

    if (this.isModified() && !this.isNew) {
        schedule.version += 1;
    }

    next();
});

sessionSchema.pre('save', function (next) {
    // @ts-ignore
    const session = this as any;

    // Validate time slot
    const startTime = new Date(`2000-01-01T${session.timeSlot.startTime}:00`);
    const endTime = new Date(`2000-01-01T${session.timeSlot.endTime}:00`);
    if (startTime >= endTime) {
        return next(new Error('Start time must be before end time'));
    }

    // Validate coach requirements (only if explicitly set — Session schema
    // doesn't declare this field, so it may legitimately be undefined for
    // ad-hoc sessions created without coach-requirement constraints).
    if (session.coachRequirements
        && typeof session.coachRequirements.minCoaches === 'number'
        && typeof session.coachRequirements.maxCoaches === 'number'
        && session.coachRequirements.minCoaches > session.coachRequirements.maxCoaches) {
        return next(new Error('Minimum coaches cannot be greater than maximum coaches'));
    }

    next();
});

// Export models
export const Session = model<ISession>('Session', sessionSchema);
export const Schedule = model<ISchedule>('Schedule', scheduleSchema);
export const CoachAvailability = model<ICoachAvailability>('CoachAvailability', coachAvailabilitySchema);
export const RosterTemplate = model<IRosterTemplate>('RosterTemplate', rosterTemplateSchema);