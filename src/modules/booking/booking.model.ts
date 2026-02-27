import { Schema, model } from 'mongoose';
import {
    IBooking,
    BookingType,
    BookingStatus,
    PaymentStatus,
    WaitlistStatus,
    CancellationReason,
    RescheduleReason
} from './booking.interface';
import { baseSchemaOptions } from '../../shared/base/base.model';

// Booking Participant Schema
const bookingParticipantSchema = new Schema({
    childId: {
        type: Schema.Types.ObjectId,
        ref: 'ChildProfile',
        required: [true, 'Child ID is required']
    },
    skillLevel: {
        type: String,
        trim: true
    },
    medicalFlags: [String],
    specialRequirements: [String],
    isActive: {
        type: Boolean,
        default: true
    }
});

// Booking Preferences Schema
const bookingPreferencesSchema = new Schema({
    preferredDays: [String],
    preferredTimes: [String],
    preferredLocations: [{
        type: Schema.Types.ObjectId,
        ref: 'Location'
    }],
    preferredCoaches: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    avoidDays: [String],
    avoidTimes: [String],
    specialRequests: [String]
});

// Booking Payment Schema
const bookingPaymentSchema = new Schema({
    amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [0, 'Payment amount cannot be negative']
    },
    currency: {
        type: String,
        default: 'USD',
        uppercase: true
    },
    paymentMethodId: {
        type: Schema.Types.ObjectId,
        ref: 'PaymentMethod'
    },
    transactionId: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING
    },
    paidAt: Date,
    refundedAt: Date,
    refundAmount: {
        type: Number,
        min: [0, 'Refund amount cannot be negative']
    },
    fees: {
        registration: {
            type: Number,
            default: 0,
            min: [0, 'Registration fee cannot be negative']
        },
        processing: {
            type: Number,
            default: 0,
            min: [0, 'Processing fee cannot be negative']
        },
        late: {
            type: Number,
            default: 0,
            min: [0, 'Late fee cannot be negative']
        },
        cancellation: {
            type: Number,
            default: 0,
            min: [0, 'Cancellation fee cannot be negative']
        }
    }
});

// Booking Cancellation Schema
const bookingCancellationSchema = new Schema({
    reason: {
        type: String,
        enum: Object.values(CancellationReason),
        required: [true, 'Cancellation reason is required']
    },
    reasonDetails: {
        type: String,
        trim: true
    },
    cancelledAt: {
        type: Date,
        required: [true, 'Cancellation date is required']
    },
    cancelledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Cancelled by is required']
    },
    refundEligible: {
        type: Boolean,
        required: [true, 'Refund eligibility is required']
    },
    refundAmount: {
        type: Number,
        min: [0, 'Refund amount cannot be negative']
    },
    cancellationFee: {
        type: Number,
        default: 0,
        min: [0, 'Cancellation fee cannot be negative']
    },
    noShowFee: {
        type: Number,
        default: 0,
        min: [0, 'No show fee cannot be negative']
    }
});

// Booking Reschedule Schema
const bookingRescheduleSchema = new Schema({
    reason: {
        type: String,
        enum: Object.values(RescheduleReason),
        required: [true, 'Reschedule reason is required']
    },
    reasonDetails: {
        type: String,
        trim: true
    },
    originalSessionId: {
        type: Schema.Types.ObjectId,
        ref: 'Session',
        required: [true, 'Original session ID is required']
    },
    newSessionId: {
        type: Schema.Types.ObjectId,
        ref: 'Session',
        required: [true, 'New session ID is required']
    },
    rescheduledAt: {
        type: Date,
        required: [true, 'Reschedule date is required']
    },
    rescheduledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Rescheduled by is required']
    },
    rescheduleCount: {
        type: Number,
        default: 1,
        min: [1, 'Reschedule count must be at least 1']
    },
    rescheduleDeadline: Date
});

// Waitlist Entry Schema
const waitlistEntrySchema = new Schema({
    position: {
        type: Number,
        required: [true, 'Waitlist position is required'],
        min: [1, 'Waitlist position must be at least 1']
    },
    joinedAt: {
        type: Date,
        required: [true, 'Waitlist join date is required']
    },
    status: {
        type: String,
        enum: Object.values(WaitlistStatus),
        default: WaitlistStatus.ACTIVE
    },
    offeredAt: Date,
    responseDeadline: Date,
    respondedAt: Date,
    priority: {
        type: Number,
        default: 0,
        min: [0, 'Priority cannot be negative']
    },
    autoAccept: {
        type: Boolean,
        default: false
    },
    notificationsSent: {
        type: Number,
        default: 0,
        min: [0, 'Notifications sent cannot be negative']
    }
});

// Makeup Credit Schema
const makeupCreditSchema = new Schema({
    originalBookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Original booking ID is required']
    },
    reason: {
        type: String,
        required: [true, 'Makeup credit reason is required'],
        trim: true
    },
    creditAmount: {
        type: Number,
        required: [true, 'Credit amount is required'],
        min: [0, 'Credit amount cannot be negative']
    },
    expiresAt: {
        type: Date,
        required: [true, 'Expiration date is required']
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    usedAt: Date,
    usedForBookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking'
    }
});

// Main Booking Schema
const bookingSchema = new Schema<IBooking>({
    // Basic Information
    bookingId: {
        type: String,
        required: [true, 'Booking ID is required'],
        unique: true,
        trim: true,
        index: true
    },
    bookingType: {
        type: String,
        enum: Object.values(BookingType),
        required: [true, 'Booking type is required'],
        index: true
    },
    status: {
        type: String,
        enum: Object.values(BookingStatus),
        default: BookingStatus.PENDING,
        index: true
    },

    // Family and Participants
    familyId: {
        type: Schema.Types.ObjectId,
        ref: 'FamilyProfile',
        required: [true, 'Family ID is required'],
        index: true
    },
    bookedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Booked by is required']
    },
    participants: {
        type: [bookingParticipantSchema],
        validate: {
            validator: function (participants: any[]) {
                return participants && participants.length > 0;
            },
            message: 'At least one participant is required'
        }
    },

    // Program and Session Information
    programId: {
        type: Schema.Types.ObjectId,
        ref: 'Program',
        required: [true, 'Program ID is required'],
        index: true
    },
    sessionId: {
        type: Schema.Types.ObjectId,
        ref: 'Session',
        index: true
    },
    termId: {
        type: Schema.Types.ObjectId,
        ref: 'Term',
        index: true
    },

    // Location and Timing
    locationId: {
        type: Schema.Types.ObjectId,
        ref: 'Location',
        required: [true, 'Location ID is required'],
        index: true
    },
    roomId: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    sessionDate: {
        type: Date,
        index: true
    },
    sessionTime: {
        startTime: {
            type: String,
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid start time format (HH:MM)']
        },
        endTime: {
            type: String,
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid end time format (HH:MM)']
        }
    },

    // Booking Details
    preferences: bookingPreferencesSchema,
    specialRequests: [String],

    // Capacity and Waitlist
    isWaitlisted: {
        type: Boolean,
        default: false,
        index: true
    },
    waitlistEntry: waitlistEntrySchema,

    // Payment Information
    payment: {
        type: bookingPaymentSchema,
        required: [true, 'Payment information is required']
    },

    // Cancellation Information
    cancellation: bookingCancellationSchema,

    // Reschedule Information
    reschedule: bookingRescheduleSchema,

    // Makeup Credits
    makeupCredits: [makeupCreditSchema],

    // Attendance
    attendanceStatus: {
        type: String,
        enum: ['present', 'absent', 'late', 'left_early']
    },
    attendanceNotes: {
        type: String,
        trim: true
    },

    // Communication
    confirmationSent: {
        type: Boolean,
        default: false
    },
    remindersSent: {
        type: Number,
        default: 0,
        min: [0, 'Reminders sent cannot be negative']
    },
    lastReminderSent: Date,

    // Business Information
    businessUnitId: {
        type: Schema.Types.ObjectId,
        ref: 'BusinessUnit',
        required: [true, 'Business unit ID is required'],
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

// Indexes for performance
bookingSchema.index({ familyId: 1, status: 1 });
bookingSchema.index({ programId: 1, sessionDate: 1 });
bookingSchema.index({ locationId: 1, sessionDate: 1 });
bookingSchema.index({ businessUnitId: 1, bookingType: 1 });
bookingSchema.index({ sessionId: 1, status: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ isWaitlisted: 1, 'waitlistEntry.position': 1 });
bookingSchema.index({ createdAt: 1 });

// Text search index
bookingSchema.index({
    bookingId: 'text'
});

// Pre-save middleware
bookingSchema.pre('save', function (next) {
    if (this.isNew && !this.bookingId) {
        this.bookingId = `BK${Date.now().toString().slice(-8)}`;
    }

    // Validate session time
    if (this.sessionTime && this.sessionTime.startTime && this.sessionTime.endTime) {
        const startTime = new Date(`2000-01-01T${this.sessionTime.startTime}:00`);
        const endTime = new Date(`2000-01-01T${this.sessionTime.endTime}:00`);
        if (startTime >= endTime) {
            return next(new Error('Start time must be before end time'));
        }
    }

    next();
});

// Virtual fields
bookingSchema.virtual('totalAmount').get(function () {
    const payment = this.payment;
    return payment.amount + (payment.fees.registration || 0) +
        (payment.fees.processing || 0) + (payment.fees.late || 0);
});

bookingSchema.virtual('isActive').get(function () {
    return [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.WAITLISTED].includes(this.status);
});

bookingSchema.virtual('canCancel').get(function () {
    return [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.WAITLISTED].includes(this.status);
});

bookingSchema.virtual('canReschedule').get(function () {
    return [BookingStatus.CONFIRMED].includes(this.status);
});

// Export model
export const Booking = model<IBooking>('Booking', bookingSchema);