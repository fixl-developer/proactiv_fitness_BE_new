import { Document } from 'mongoose';

export enum BookingType {
    TRIAL = 'trial',
    DROP_IN = 'drop_in',
    TERM_ENROLLMENT = 'term_enrollment',
    PRIVATE_LESSON = 'private_lesson',
    CAMP = 'camp',
    EVENT = 'event',
    PARTY = 'party',
    ASSESSMENT = 'assessment',
    MAKEUP = 'makeup'
}

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    WAITLISTED = 'waitlisted',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
    NO_SHOW = 'no_show',
    RESCHEDULED = 'rescheduled'
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    PARTIAL = 'partial',
    REFUNDED = 'refunded',
    FAILED = 'failed'
}

export enum WaitlistStatus {
    ACTIVE = 'active',
    OFFERED = 'offered',
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
    EXPIRED = 'expired',
    REMOVED = 'removed'
}

export enum CancellationReason {
    CUSTOMER_REQUEST = 'customer_request',
    ILLNESS = 'illness',
    EMERGENCY = 'emergency',
    SCHEDULE_CONFLICT = 'schedule_conflict',
    DISSATISFACTION = 'dissatisfaction',
    FINANCIAL = 'financial',
    RELOCATION = 'relocation',
    OTHER = 'other'
}

export enum RescheduleReason {
    CUSTOMER_REQUEST = 'customer_request',
    ILLNESS = 'illness',
    EMERGENCY = 'emergency',
    WEATHER = 'weather',
    FACILITY_ISSUE = 'facility_issue',
    COACH_UNAVAILABLE = 'coach_unavailable',
    OTHER = 'other'
}

export interface IBookingPreferences {
    preferredDays: string[];
    preferredTimes: string[];
    preferredLocations: string[];
    preferredCoaches: string[];
    avoidDays: string[];
    avoidTimes: string[];
    specialRequests: string[];
}

export interface IBookingParticipant {
    childId: string;
    skillLevel?: string;
    medicalFlags: string[];
    specialRequirements: string[];
    isActive: boolean;
}

export interface IBookingPayment {
    amount: number;
    currency: string;
    paymentMethodId?: string;
    transactionId?: string;
    status: PaymentStatus;
    paidAt?: Date;
    refundedAt?: Date;
    refundAmount?: number;
    fees: {
        registration?: number;
        processing?: number;
        late?: number;
        cancellation?: number;
    };
}

export interface IBookingCancellation {
    reason: CancellationReason;
    reasonDetails?: string;
    cancelledAt: Date;
    cancelledBy: string;
    refundEligible: boolean;
    refundAmount?: number;
    cancellationFee?: number;
    noShowFee?: number;
}

export interface IBookingReschedule {
    reason: RescheduleReason;
    reasonDetails?: string;
    originalSessionId: string;
    newSessionId: string;
    rescheduledAt: Date;
    rescheduledBy: string;
    rescheduleCount: number;
    rescheduleDeadline?: Date;
}

export interface IWaitlistEntry {
    position: number;
    joinedAt: Date;
    status: WaitlistStatus;
    offeredAt?: Date;
    responseDeadline?: Date;
    respondedAt?: Date;
    priority: number;
    autoAccept: boolean;
    notificationsSent: number;
}

export interface IMakeupCredit {
    originalBookingId: string;
    reason: string;
    creditAmount: number;
    expiresAt: Date;
    isUsed: boolean;
    usedAt?: Date;
    usedForBookingId?: string;
}

export interface IBooking extends Document {
    // Basic Information
    bookingId: string;
    bookingType: BookingType;
    status: BookingStatus;

    // Family and Participants
    familyId: string;
    bookedBy: string; // User ID who made the booking
    participants: IBookingParticipant[];

    // Program and Session Information
    programId: string;
    sessionId?: string; // For specific session bookings
    termId?: string; // For term enrollments

    // Location and Timing
    locationId: string;
    roomId?: string;
    sessionDate?: Date;
    sessionTime?: {
        startTime: string;
        endTime: string;
    };

    // Booking Details
    preferences: IBookingPreferences;
    specialRequests: string[];

    // Capacity and Waitlist
    isWaitlisted: boolean;
    waitlistEntry?: IWaitlistEntry;

    // Payment Information
    payment: IBookingPayment;

    // Cancellation Information
    cancellation?: IBookingCancellation;

    // Reschedule Information
    reschedule?: IBookingReschedule;

    // Makeup Credits
    makeupCredits: IMakeupCredit[];

    // Attendance
    attendanceStatus?: 'present' | 'absent' | 'late' | 'left_early';
    attendanceNotes?: string;

    // Communication
    confirmationSent: boolean;
    remindersSent: number;
    lastReminderSent?: Date;

    // Business Information
    businessUnitId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBookingSearch {
    // Program filters
    programIds?: string[];
    programTypes?: string[];
    categories?: string[];
    skillLevels?: string[];

    // Location filters
    locationIds?: string[];
    businessUnitId?: string;

    // Time filters
    availableDays?: string[];
    timeSlots?: {
        startTime: string;
        endTime: string;
    }[];
    dateRange?: {
        startDate: Date;
        endDate: Date;
    };

    // Age filters
    ageRange?: {
        min: number;
        max: number;
        ageType: 'months' | 'years';
    };

    // Capacity filters
    hasAvailability?: boolean;
    minAvailableSpots?: number;

    // Price filters
    priceRange?: {
        min: number;
        max: number;
    };

    // Other filters
    coachIds?: string[];
    hasWaitlist?: boolean;
    isTrialAvailable?: boolean;
}

export interface IBookingAvailability {
    sessionId: string;
    programId: string;
    programName: string;
    date: Date;
    timeSlot: {
        startTime: string;
        endTime: string;
    };
    locationId: string;
    locationName: string;
    roomId?: string;
    roomName?: string;
    coachIds: string[];
    coachNames: string[];
    capacity: {
        total: number;
        booked: number;
        available: number;
        waitlist: number;
    };
    pricing: {
        basePrice: number;
        discountedPrice?: number;
        fees: Record<string, number>;
        totalPrice: number;
    };
    isAvailable: boolean;
    isWaitlistAvailable: boolean;
    restrictions: string[];
}

export interface IBookingRequest {
    bookingType: BookingType;
    familyId: string;
    participants: {
        childId: string;
        skillLevel?: string;
    }[];
    programId: string;
    sessionId?: string;
    termId?: string;
    locationId: string;
    preferences?: IBookingPreferences;
    specialRequests?: string[];
    paymentMethodId?: string;
    autoAcceptWaitlist?: boolean;
}

export interface IBookingConfirmation {
    bookingId: string;
    confirmationNumber: string;
    status: BookingStatus;
    isWaitlisted: boolean;
    waitlistPosition?: number;
    estimatedWaitTime?: string;
    payment: {
        amount: number;
        status: PaymentStatus;
        dueDate?: Date;
    };
    nextSteps: string[];
    importantInfo: string[];
    cancellationPolicy: string;
    reschedulePolicy: string;
}

export interface IBookingModification {
    bookingId: string;
    modificationType: 'reschedule' | 'cancel' | 'add_participant' | 'remove_participant';
    reason?: string;
    newSessionId?: string;
    newParticipants?: string[];
    removedParticipants?: string[];
    refundAmount?: number;
    additionalPayment?: number;
}

export interface IWaitlistOffer {
    bookingId: string;
    sessionId: string;
    offeredAt: Date;
    responseDeadline: Date;
    position: number;
    sessionDetails: {
        programName: string;
        date: Date;
        time: string;
        location: string;
        coach: string;
    };
    pricing: {
        amount: number;
        fees: Record<string, number>;
        total: number;
    };
}

export interface IBookingFilter {
    familyId?: string;
    childId?: string;
    bookingType?: BookingType;
    status?: BookingStatus;
    programId?: string;
    locationId?: string;
    businessUnitId?: string;
    dateRange?: {
        startDate: Date;
        endDate: Date;
    };
    paymentStatus?: PaymentStatus;
    isWaitlisted?: boolean;
    searchText?: string;
}

export interface IBookingStatistics {
    totalBookings: number;
    bookingsByType: Record<BookingType, number>;
    bookingsByStatus: Record<BookingStatus, number>;
    conversionRate: number; // waitlist to confirmed
    cancellationRate: number;
    noShowRate: number;
    averageBookingValue: number;
    totalRevenue: number;
    waitlistStatistics: {
        totalWaitlisted: number;
        averageWaitTime: number; // in hours
        conversionRate: number;
    };
    popularPrograms: {
        programId: string;
        programName: string;
        bookingCount: number;
        revenue: number;
    }[];
    peakTimes: {
        day: string;
        hour: number;
        bookingCount: number;
    }[];
}

// Validation interfaces
export interface IBookingValidation {
    isEligible: boolean;
    eligibilityReasons: string[];
    hasCapacity: boolean;
    canWaitlist: boolean;
    pricing: {
        basePrice: number;
        discounts: Record<string, number>;
        fees: Record<string, number>;
        totalPrice: number;
    };
    policies: {
        cancellationDeadline: Date;
        rescheduleDeadline: Date;
        refundPolicy: string;
    };
    requirements: string[];
    warnings: string[];
}

// Bulk booking interfaces
export interface IBulkBookingRequest {
    familyId: string;
    bookings: {
        programId: string;
        sessionIds: string[];
        participants: string[];
    }[];
    paymentMethodId?: string;
    applyFamilyDiscount?: boolean;
}

export interface IBulkBookingResult {
    successful: IBooking[];
    failed: {
        sessionId: string;
        reason: string;
        canWaitlist: boolean;
    }[];
    waitlisted: IBooking[];
    totalAmount: number;
    discountApplied: number;
    summary: {
        totalRequested: number;
        totalConfirmed: number;
        totalWaitlisted: number;
        totalFailed: number;
    };
}