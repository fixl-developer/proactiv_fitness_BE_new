import { FilterQuery } from 'mongoose';
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
import { BaseService } from '../../shared/base/base.service';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class BookingService extends BaseService<IBooking> {
    constructor() {
        super(Booking);
    }

    /**
     * Search available sessions
     */
    async searchAvailability(searchCriteria: IBookingSearch): Promise<IBookingAvailability[]> {
        try {
            // This would integrate with the scheduling service to find available sessions
            // For now, returning mock data structure
            return [];
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
            // Implement booking validation logic
            return {
                isEligible: true,
                eligibilityReasons: [],
                hasCapacity: true,
                canWaitlist: true,
                pricing: {
                    basePrice: 100,
                    discounts: {},
                    fees: {},
                    totalPrice: 100
                },
                policies: {
                    cancellationDeadline: new Date(),
                    rescheduleDeadline: new Date(),
                    refundPolicy: 'Standard refund policy'
                },
                requirements: [],
                warnings: []
            };
        } catch (error: any) {
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
