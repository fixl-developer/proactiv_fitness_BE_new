import { Request, Response } from 'express';
import { BookingService } from './booking.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';
import { ResponseUtil } from '../../shared/utils/response.util';
import { PaginationUtil } from '../../shared/utils/pagination.util';

export class BookingController {
    private bookingService: BookingService;

    constructor() {
        this.bookingService = new BookingService();
    }

    /**
     * Search available sessions
     */
    searchAvailability = asyncHandler(async (req: Request, res: Response) => {
        const availability = await this.bookingService.searchAvailability(req.body);
        ResponseUtil.success(res, availability, 'Availability retrieved successfully');
    });

    /**
     * Validate booking
     */
    validateBooking = asyncHandler(async (req: Request, res: Response) => {
        const validation = await this.bookingService.validateBooking(req.body);
        ResponseUtil.success(res, validation, 'Booking validated successfully');
    });

    /**
     * Create booking
     */
    createBooking = asyncHandler(async (req: Request, res: Response) => {
        const confirmation = await this.bookingService.createBooking(req.body, req.user.id);
        ResponseUtil.success(res, confirmation, 'Booking created successfully', HTTP_STATUS.CREATED);
    });

    /**
     * Get all bookings
     */
    getBookings = asyncHandler(async (req: Request, res: Response) => {
        const filters = this.buildBookingFilters(req.query);

        const result = await this.bookingService.findWithPagination(filters, req.query);

        ResponseUtil.success(res, result, 'Bookings retrieved successfully');
    });

    /**
     * Get booking by ID
     */
    getBookingById = asyncHandler(async (req: Request, res: Response) => {
        const booking = await this.bookingService.findById(req.params.id);

        if (!booking) {
            throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);
        }

        ResponseUtil.success(res, booking, 'Booking retrieved successfully');
    });

    /**
     * Cancel booking
     */
    cancelBooking = asyncHandler(async (req: Request, res: Response) => {
        const { reason } = req.body;
        const booking = await this.bookingService.cancelBooking(
            req.params.id,
            reason,
            req.user.id
        );

        ResponseUtil.success(res, booking, 'Booking cancelled successfully');
    });

    /**
     * Get booking statistics
     */
    getBookingStatistics = asyncHandler(async (req: Request, res: Response) => {
        const { businessUnitId } = req.query;
        const statistics = await this.bookingService.getBookingStatistics(
            businessUnitId as string
        );

        ResponseUtil.success(res, statistics, 'Booking statistics retrieved successfully');
    });

    /**
     * Create assessment booking (simplified website flow)
     */
    createAssessmentBooking = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.bookingService.createAssessmentBooking(req.body, req.user!.id);
        ResponseUtil.success(res, result, 'Assessment booking created successfully', HTTP_STATUS.CREATED);
    });

    /**
     * Create class booking (simplified website flow)
     */
    createClassBooking = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.bookingService.createClassBooking(req.body, req.user!.id);
        ResponseUtil.success(res, result, 'Class booking created successfully', HTTP_STATUS.CREATED);
    });

    /**
     * Get my bookings (logged-in user)
     */
    getMyBookings = asyncHandler(async (req: Request, res: Response) => {
        const { status, bookingType } = req.query;
        const bookings = await this.bookingService.getMyBookings(
            req.user!.id,
            { status: status as string, bookingType: bookingType as string }
        );
        ResponseUtil.success(res, bookings, 'User bookings retrieved successfully');
    });

    private buildBookingFilters(query: any) {
        const filters: any = {};

        if (query.familyId) filters.familyId = query.familyId;
        if (query.bookingType) filters.bookingType = query.bookingType;
        if (query.status) filters.status = query.status;
        if (query.programId) filters.programId = query.programId;
        if (query.locationId) filters.locationId = query.locationId;
        if (query.businessUnitId) filters.businessUnitId = query.businessUnitId;
        if (query.isWaitlisted !== undefined) filters.isWaitlisted = query.isWaitlisted === 'true';

        if (query.dateFrom || query.dateTo) {
            filters.sessionDate = {};
            if (query.dateFrom) filters.sessionDate.$gte = new Date(query.dateFrom);
            if (query.dateTo) filters.sessionDate.$lte = new Date(query.dateTo);
        }

        if (query.paymentStatus) filters['payment.status'] = query.paymentStatus;

        if (query.searchText) {
            filters.$text = { $search: query.searchText };
        }

        return filters;
    }
}

