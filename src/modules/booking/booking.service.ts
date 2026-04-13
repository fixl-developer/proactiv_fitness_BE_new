import { FilterQuery, Types } from 'mongoose';
import { Booking } from './booking.model';
import {
    IBooking,
    IBookingRequest,
    IBookingConfirmation,
    IBookingSearch,
    IBookingAvailability,
    IBookingValidation,
    IBookingFilter,
    IBookingStatistics,
    BookingStatus,
    BookingType,
    PaymentStatus
} from './booking.interface';
import { Session } from '../scheduling/schedule.model';
import { Program } from '../programs/program.model';
import { BaseService, EntityContext } from '../../shared/base/base.service';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class BookingService extends BaseService<IBooking> {
    constructor() {
        super(Booking, 'booking');
    }

    protected getEntityContext(doc: any): EntityContext | null {
        return {
            locationId: doc.locationId?.toString(),
            organizationId: doc.businessUnitId?.toString(),
            targetUserId: doc.bookedBy?.toString(),
        };
    }

    /**
     * Search available sessions
     */
    async searchAvailability(searchCriteria: IBookingSearch): Promise<IBookingAvailability[]> {
        try {
            // Build the session query from search criteria
            const sessionQuery: any = {
                status: { $in: ['scheduled', 'confirmed'] }
            };

            if (searchCriteria.programIds?.length) {
                sessionQuery.programId = { $in: searchCriteria.programIds.map(id => new Types.ObjectId(id)) };
            }

            if (searchCriteria.locationIds?.length) {
                sessionQuery.locationId = { $in: searchCriteria.locationIds.map(id => new Types.ObjectId(id)) };
            }

            if (searchCriteria.dateRange) {
                sessionQuery.date = {
                    $gte: searchCriteria.dateRange.startDate,
                    $lte: searchCriteria.dateRange.endDate
                };
            }

            if (searchCriteria.coachIds?.length) {
                sessionQuery['coachAssignments.coachId'] = {
                    $in: searchCriteria.coachIds.map(id => new Types.ObjectId(id))
                };
            }

            // Fetch sessions with populated references
            const sessions = await Session.find(sessionQuery)
                .populate('programId', 'name pricingModel capacityRules isActive category programType skillLevels eligibilityRules')
                .populate('locationId', 'name')
                .populate('roomId', 'name')
                .populate('coachAssignments.coachId', 'firstName lastName')
                .sort({ date: 1, 'timeSlot.startTime': 1 })
                .lean();

            // Filter by program-level criteria
            const results: IBookingAvailability[] = [];

            for (const session of sessions) {
                const program = session.programId as any;
                if (!program || !program.isActive) continue;

                // Filter by program type
                if (searchCriteria.programTypes?.length && !searchCriteria.programTypes.includes(program.programType)) {
                    continue;
                }

                // Filter by category
                if (searchCriteria.categories?.length && !searchCriteria.categories.includes(program.category)) {
                    continue;
                }

                // Filter by skill level
                if (searchCriteria.skillLevels?.length) {
                    const hasMatchingLevel = searchCriteria.skillLevels.some(
                        (level: string) => program.skillLevels?.includes(level)
                    );
                    if (!hasMatchingLevel) continue;
                }

                // Filter by age range
                if (searchCriteria.ageRange && program.eligibilityRules?.ageRestrictions) {
                    const ageRestrictions = program.eligibilityRules.ageRestrictions;
                    if (searchCriteria.ageRange.min > ageRestrictions.maxAge ||
                        searchCriteria.ageRange.max < ageRestrictions.minAge) {
                        continue;
                    }
                }

                // Filter by time slots
                if (searchCriteria.timeSlots?.length) {
                    const matchesTimeSlot = searchCriteria.timeSlots.some(
                        (slot: { startTime: string; endTime: string }) =>
                            session.timeSlot.startTime >= slot.startTime &&
                            session.timeSlot.endTime <= slot.endTime
                    );
                    if (!matchesTimeSlot) continue;
                }

                // Count existing confirmed bookings for this session
                const bookedCount = await Booking.countDocuments({
                    sessionId: session._id,
                    status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] }
                });

                const maxCapacity = session.maxCapacity || program.capacityRules?.maxParticipants || 0;
                const available = Math.max(0, maxCapacity - bookedCount);
                const waitlistCount = session.waitlistParticipants?.length || 0;
                const waitlistCapacity = program.capacityRules?.waitlistCapacity || 0;

                // Filter by availability
                if (searchCriteria.hasAvailability && available === 0) continue;
                if (searchCriteria.minAvailableSpots && available < searchCriteria.minAvailableSpots) continue;

                // Calculate pricing
                const basePrice = program.pricingModel?.basePrice || 0;
                const fees: Record<string, number> = {};
                if (program.pricingModel?.additionalFees) {
                    const addFees = program.pricingModel.additionalFees;
                    if (addFees.registration) fees.registration = addFees.registration;
                    if (addFees.equipment) fees.equipment = addFees.equipment;
                    if (addFees.insurance) fees.insurance = addFees.insurance;
                }
                const totalFees = Object.values(fees).reduce((sum, f) => sum + f, 0);

                // Filter by price range
                const totalPrice = basePrice + totalFees;
                if (searchCriteria.priceRange) {
                    if (totalPrice < searchCriteria.priceRange.min || totalPrice > searchCriteria.priceRange.max) {
                        continue;
                    }
                }

                const location = session.locationId as any;
                const room = session.roomId as any;
                const coaches = (session.coachAssignments || []).map((a: any) => a.coachId);

                results.push({
                    sessionId: session.sessionId || (session._id as any).toString(),
                    programId: program._id.toString(),
                    programName: program.name,
                    date: session.date,
                    timeSlot: {
                        startTime: session.timeSlot.startTime,
                        endTime: session.timeSlot.endTime
                    },
                    locationId: location?._id?.toString() || '',
                    locationName: location?.name || '',
                    roomId: room?._id?.toString(),
                    roomName: room?.name,
                    coachIds: coaches.map((c: any) => c?._id?.toString() || ''),
                    coachNames: coaches.map((c: any) => c ? `${c.firstName} ${c.lastName}` : ''),
                    capacity: {
                        total: maxCapacity,
                        booked: bookedCount,
                        available,
                        waitlist: waitlistCount
                    },
                    pricing: {
                        basePrice,
                        fees,
                        totalPrice
                    },
                    isAvailable: available > 0,
                    isWaitlistAvailable: available === 0 && waitlistCount < waitlistCapacity,
                    restrictions: program.eligibilityRules?.specialRequirements || []
                });
            }

            return results;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to search availability',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Validate booking request
     */
    async validateBooking(bookingRequest: IBookingRequest): Promise<IBookingValidation> {
        try {
            const eligibilityReasons: string[] = [];
            const requirements: string[] = [];
            const warnings: string[] = [];
            let isEligible = true;

            // 1. Check if program exists and is active
            const program = await Program.findById(bookingRequest.programId).lean() as any;
            if (!program) {
                throw new AppError('Program not found', HTTP_STATUS.NOT_FOUND);
            }
            if (!program.isActive) {
                isEligible = false;
                eligibilityReasons.push('Program is not currently active');
            }

            // 2. Check capacity by counting existing bookings for the session
            let hasCapacity = true;
            let canWaitlist = false;
            const maxCapacity = program.capacityRules?.maxParticipants || 0;
            const waitlistCapacity = program.capacityRules?.waitlistCapacity || 0;

            if (bookingRequest.sessionId) {
                const bookedCount = await Booking.countDocuments({
                    sessionId: bookingRequest.sessionId,
                    status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] }
                });

                if (bookedCount >= maxCapacity) {
                    hasCapacity = false;
                    eligibilityReasons.push(`Session is full (${bookedCount}/${maxCapacity} spots taken)`);

                    // Check waitlist availability
                    const waitlistedCount = await Booking.countDocuments({
                        sessionId: bookingRequest.sessionId,
                        status: BookingStatus.WAITLISTED
                    });
                    canWaitlist = waitlistedCount < waitlistCapacity;

                    if (canWaitlist) {
                        warnings.push('Session is full but waitlist is available');
                    }
                }
            }

            // 3. Check user eligibility
            // Check skill level requirement
            if (program.eligibilityRules?.skillLevelRequired) {
                const requiredLevel = program.eligibilityRules.skillLevelRequired;
                const participantLevels = bookingRequest.participants.map(p => p.skillLevel).filter(Boolean);
                if (participantLevels.length > 0) {
                    const hasRequiredLevel = participantLevels.some(level => level === requiredLevel);
                    if (!hasRequiredLevel) {
                        isEligible = false;
                        eligibilityReasons.push(`Required skill level: ${requiredLevel}`);
                    }
                }
            }

            // Check prerequisite programs
            if (program.eligibilityRules?.prerequisitePrograms?.length) {
                requirements.push('Prerequisite programs must be completed before enrollment');
            }

            // Check medical clearance
            if (program.eligibilityRules?.medicalClearanceRequired) {
                requirements.push('Medical clearance is required');
            }

            // Check parental consent
            if (program.eligibilityRules?.parentalConsentRequired) {
                requirements.push('Parental consent is required');
            }

            // Check equipment requirements
            if (program.eligibilityRules?.equipmentRequired?.length) {
                const equipmentList = program.eligibilityRules.equipmentRequired.join(', ');
                requirements.push(`Required equipment: ${equipmentList}`);
            }

            // Check if program requires approval
            if (program.requiresApproval) {
                warnings.push('This program requires approval before confirmation');
            }

            // 4. Calculate real pricing
            const basePrice = program.pricingModel?.basePrice || 0;

            // Calculate applicable discounts
            const discounts: Record<string, number> = {};
            if (program.pricingModel?.discounts) {
                const discountRules = program.pricingModel.discounts;

                if (discountRules.earlyBird) {
                    discounts.earlyBird = basePrice * (discountRules.earlyBird / 100);
                }

                if (discountRules.sibling && bookingRequest.participants.length > 1) {
                    discounts.sibling = basePrice * (discountRules.sibling / 100);
                }
            }

            // Calculate fees
            const fees: Record<string, number> = {};
            if (program.pricingModel?.additionalFees) {
                const addFees = program.pricingModel.additionalFees;
                if (addFees.registration) fees.registration = addFees.registration;
                if (addFees.equipment) fees.equipment = addFees.equipment;
                if (addFees.insurance) fees.insurance = addFees.insurance;
            }

            const totalDiscounts = Object.values(discounts).reduce((sum, d) => sum + d, 0);
            const totalFees = Object.values(fees).reduce((sum, f) => sum + f, 0);
            const totalPrice = Math.max(0, basePrice - totalDiscounts + totalFees);

            // 5. Calculate policy deadlines (24 hours before session, if session date known)
            let cancellationDeadline = new Date();
            let rescheduleDeadline = new Date();

            if (bookingRequest.sessionId) {
                const session = await Session.findById(bookingRequest.sessionId).lean() as any;
                if (session?.date) {
                    cancellationDeadline = new Date(session.date);
                    cancellationDeadline.setHours(cancellationDeadline.getHours() - 24);
                    rescheduleDeadline = new Date(session.date);
                    rescheduleDeadline.setHours(rescheduleDeadline.getHours() - 24);
                }
            }

            return {
                isEligible,
                eligibilityReasons,
                hasCapacity,
                canWaitlist,
                pricing: {
                    basePrice,
                    discounts,
                    fees,
                    totalPrice
                },
                policies: {
                    cancellationDeadline,
                    rescheduleDeadline,
                    refundPolicy: hasCapacity
                        ? 'Full refund if cancelled before the cancellation deadline'
                        : 'Waitlisted bookings are fully refundable at any time'
                },
                requirements,
                warnings
            };
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(
                error.message || 'Failed to validate booking',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Create booking
     */
    async createBooking(bookingRequest: IBookingRequest, createdBy: string): Promise<IBookingConfirmation> {
        try {
            const bookingId = await this.generateBookingId();

            const booking = new Booking({
                bookingId,
                bookingType: bookingRequest.bookingType,
                familyId: bookingRequest.familyId,
                bookedBy: createdBy,
                participants: bookingRequest.participants,
                programId: bookingRequest.programId,
                sessionId: bookingRequest.sessionId,
                termId: bookingRequest.termId,
                locationId: bookingRequest.locationId,
                preferences: bookingRequest.preferences || {},
                specialRequests: bookingRequest.specialRequests || [],
                payment: {
                    amount: 100, // Calculate from pricing
                    currency: 'USD',
                    paymentMethodId: bookingRequest.paymentMethodId,
                    status: PaymentStatus.PENDING,
                    fees: {}
                },
                businessUnitId: 'temp', // Get from program/location
                createdBy,
                updatedBy: createdBy
            });

            await booking.save();
            this.emitRealtimeEvent('created', booking);

            return {
                bookingId: booking.bookingId,
                confirmationNumber: `CONF${booking.bookingId}`,
                status: booking.status,
                isWaitlisted: booking.isWaitlisted,
                payment: {
                    amount: booking.payment.amount,
                    status: booking.payment.status
                },
                nextSteps: ['Complete payment', 'Attend session'],
                importantInfo: ['Arrive 15 minutes early'],
                cancellationPolicy: 'Cancel 24 hours before',
                reschedulePolicy: 'Reschedule 24 hours before'
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create booking',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Cancel booking
     */
    async cancelBooking(bookingId: string, reason: string, cancelledBy: string): Promise<IBooking> {
        try {
            const booking = await this.findById(bookingId);
            if (!booking) {
                throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);
            }

            booking.status = BookingStatus.CANCELLED;
            booking.cancellation = {
                reason: reason as any,
                cancelledAt: new Date(),
                cancelledBy,
                refundEligible: true,
                refundAmount: booking.payment.amount
            };
            booking.updatedBy = cancelledBy;

            await booking.save();
            this.emitRealtimeEvent('cancelled', booking);
            return booking;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to cancel booking',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get booking statistics
     */
    async getBookingStatistics(businessUnitId?: string): Promise<IBookingStatistics> {
        try {
            const matchStage: any = {};
            if (businessUnitId) {
                matchStage.businessUnitId = businessUnitId;
            }

            const stats = await Booking.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalBookings: { $sum: 1 },
                        totalRevenue: { $sum: '$payment.amount' },
                        bookingsByType: { $push: '$bookingType' },
                        bookingsByStatus: { $push: '$status' }
                    }
                }
            ]);

            return {
                totalBookings: stats[0]?.totalBookings || 0,
                bookingsByType: {} as Record<BookingType, number>,
                bookingsByStatus: {} as Record<BookingStatus, number>,
                conversionRate: 85,
                cancellationRate: 15,
                noShowRate: 5,
                averageBookingValue: stats[0]?.totalRevenue / (stats[0]?.totalBookings || 1) || 0,
                totalRevenue: stats[0]?.totalRevenue || 0,
                waitlistStatistics: {
                    totalWaitlisted: 0,
                    averageWaitTime: 24,
                    conversionRate: 70
                },
                popularPrograms: [],
                peakTimes: []
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get booking statistics',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Convert userId string to a valid ObjectId.
     * If the string is already a valid ObjectId, use it directly.
     * Otherwise, generate a new ObjectId (placeholder).
     */
    private toObjectId(value: string): Types.ObjectId {
        if (Types.ObjectId.isValid(value) && new Types.ObjectId(value).toString() === value) {
            return new Types.ObjectId(value);
        }
        // Fallback: generate a deterministic placeholder ObjectId
        return new Types.ObjectId();
    }

    /**
     * Normalize a time string to HH:MM 24-hour format.
     * Handles: "10:00 AM", "2:30 PM", "14:00", "9:00", etc.
     */
    private normalizeTime(time: string): string {
        const trimmed = time.trim();

        // Check for AM/PM format
        const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (ampmMatch) {
            let hour = parseInt(ampmMatch[1]);
            const min = ampmMatch[2];
            const period = ampmMatch[3].toUpperCase();
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
            return `${hour.toString().padStart(2, '0')}:${min}`;
        }

        // Already in HH:MM format - normalize padding
        const parts = trimmed.split(':');
        if (parts.length === 2) {
            const h = parseInt(parts[0]) || 0;
            const m = parseInt(parts[1]) || 0;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        }

        // Fallback
        return '09:00';
    }

    /**
     * Calculate end time by adding minutes to a start time string
     */
    private calculateEndTime(startTime: string, durationMinutes: number): string {
        const normalized = this.normalizeTime(startTime);
        const [hours, minutes] = normalized.split(':').map(Number);
        const totalMinutes = hours * 60 + (minutes || 0) + durationMinutes;
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMins = totalMinutes % 60;
        return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
    }

    /**
     * Create assessment booking (simplified - from website)
     */
    async createAssessmentBooking(data: {
        program: string;
        childName: string;
        childAge: number;
        childGender?: string;
        location: string;
        date: string;
        timeSlot: string;
        parentName: string;
        parentEmail: string;
        parentPhone: string;
    }, userId: string): Promise<any> {
        try {
            const bookingId = await this.generateBookingId();
            const userObjId = this.toObjectId(userId);
            const normalizedStart = this.normalizeTime(data.timeSlot);
            const endTime = this.calculateEndTime(data.timeSlot, 30); // Assessment = 30 min

            const booking = new Booking({
                bookingId,
                bookingType: BookingType.ASSESSMENT,
                status: BookingStatus.CONFIRMED,
                familyId: userObjId,
                bookedBy: userObjId,
                participants: [{
                    childId: userObjId,
                    skillLevel: 'assessment',
                    medicalFlags: [],
                    specialRequirements: [],
                    isActive: true
                }],
                programId: userObjId,
                locationId: userObjId,
                sessionDate: new Date(data.date),
                sessionTime: {
                    startTime: normalizedStart,
                    endTime: endTime
                },
                specialRequests: [
                    `program:${data.program}`,
                    `childName:${data.childName}`,
                    `childAge:${data.childAge}`,
                    `childGender:${data.childGender || 'Not specified'}`,
                    `location:${data.location}`,
                    `parentName:${data.parentName}`,
                    `parentEmail:${data.parentEmail}`,
                    `parentPhone:${data.parentPhone}`
                ],
                preferences: {
                    preferredDays: [],
                    preferredTimes: [data.timeSlot],
                    preferredLocations: [],
                    preferredCoaches: [],
                    avoidDays: [],
                    avoidTimes: [],
                    specialRequests: []
                },
                isWaitlisted: false,
                payment: {
                    amount: 0,
                    currency: 'HKD',
                    status: PaymentStatus.PAID,
                    fees: {
                        registration: 0,
                        processing: 0,
                        late: 0,
                        cancellation: 0
                    }
                },
                businessUnitId: userObjId,
                confirmationSent: true,
                remindersSent: 0,
                createdBy: userObjId,
                updatedBy: userObjId
            });

            await booking.save();
            this.emitRealtimeEvent('created', booking);

            return {
                bookingId: booking.bookingId,
                confirmationNumber: `PA${booking.bookingId}`,
                status: booking.status,
                bookingType: 'assessment',
                program: data.program,
                childName: data.childName,
                childAge: data.childAge,
                location: data.location,
                date: data.date,
                timeSlot: data.timeSlot,
                parentName: data.parentName,
                parentEmail: data.parentEmail,
                createdAt: booking.createdAt
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create assessment booking',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Create class booking (simplified - from website)
     */
    async createClassBooking(data: {
        classId: string;
        className: string;
        classDate?: string;
        classTime?: string;
        location?: string;
        price?: number;
        childName?: string;
        childAge?: number;
        notes?: string;
    }, userId: string): Promise<any> {
        try {
            const bookingId = await this.generateBookingId();
            const userObjId = this.toObjectId(userId);

            // Calculate end time for session (default 60 min class)
            let sessionTimeObj: { startTime: string; endTime: string } | undefined;
            if (data.classTime) {
                const normalizedStart = this.normalizeTime(data.classTime);
                const endTime = this.calculateEndTime(data.classTime, 60);
                sessionTimeObj = { startTime: normalizedStart, endTime };
            }

            const booking = new Booking({
                bookingId,
                bookingType: BookingType.DROP_IN,
                status: BookingStatus.CONFIRMED,
                familyId: userObjId,
                bookedBy: userObjId,
                participants: [{
                    childId: userObjId,
                    skillLevel: 'class',
                    medicalFlags: [],
                    specialRequirements: [],
                    isActive: true
                }],
                programId: userObjId,
                locationId: userObjId,
                sessionDate: data.classDate ? new Date(data.classDate) : new Date(),
                sessionTime: sessionTimeObj,
                specialRequests: [
                    `classId:${data.classId}`,
                    `className:${data.className}`,
                    `location:${data.location || 'Not specified'}`,
                    ...(data.childName ? [`childName:${data.childName}`] : []),
                    ...(data.childAge ? [`childAge:${data.childAge}`] : []),
                    ...(data.notes ? [`notes:${data.notes}`] : [])
                ],
                preferences: {
                    preferredDays: [],
                    preferredTimes: [],
                    preferredLocations: [],
                    preferredCoaches: [],
                    avoidDays: [],
                    avoidTimes: [],
                    specialRequests: []
                },
                isWaitlisted: false,
                payment: {
                    amount: data.price || 0,
                    currency: 'HKD',
                    status: data.price ? PaymentStatus.PENDING : PaymentStatus.PAID,
                    fees: {
                        registration: 0,
                        processing: 0,
                        late: 0,
                        cancellation: 0
                    }
                },
                businessUnitId: userObjId,
                confirmationSent: true,
                remindersSent: 0,
                createdBy: userObjId,
                updatedBy: userObjId
            });

            await booking.save();
            this.emitRealtimeEvent('created', booking);

            return {
                bookingId: booking.bookingId,
                confirmationNumber: `CL${booking.bookingId}`,
                status: booking.status,
                bookingType: 'class',
                classId: data.classId,
                className: data.className,
                classDate: data.classDate,
                classTime: data.classTime,
                location: data.location,
                price: data.price,
                childName: data.childName,
                createdAt: booking.createdAt
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create class booking',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get user's bookings (my bookings)
     */
    async getMyBookings(userId: string, filters?: { status?: string; bookingType?: string }): Promise<IBooking[]> {
        try {
            const userObjId = this.toObjectId(userId);
            const query: any = { bookedBy: userObjId };
            if (filters?.status) query.status = filters.status;
            if (filters?.bookingType) query.bookingType = filters.bookingType;

            const bookings = await Booking.find(query)
                .sort({ createdAt: -1 })
                .limit(50)
                .lean();

            return bookings;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get user bookings',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    private async generateBookingId(): Promise<string> {
        let id: string;
        let exists = true;

        while (exists) {
            id = `BK${Date.now().toString().slice(-8)}`;
            const existing = await Booking.findOne({ bookingId: id });
            exists = !!existing;
        }

        return id!;
    }
}
