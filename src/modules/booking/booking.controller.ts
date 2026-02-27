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
        const { page, limit, skip } = PaginationUtil.getPaginationParams(req.query);
        const filters = this.buildBookingFilters(req.query);

        const { data, total } = await this.bookingService.getAll(filters, {
            page,
            limit,
            skip,
            sort: { createdAt: -1 },
            populate: [
                { path: 'familyId', select: 'familyName familyCode' },
                { path: 'programId', select: 'name category' },
                { path: 'locationId', select: 'name' },
                { path: 'participants.childId', select: 'firstName lastName' }
            ]
        });

        const meta = PaginationUtil.buildMeta(total, page, limit);
        ResponseUtil.success(res, data, 'Bookings retrieved successfully', HTTP_STATUS.OK, meta);
    });

    /**
     * Get booking by ID
     */
    getBookingById = asyncHandler(async (req: Request, res: Response) => {
        const booking = await this.bookingService.getById(req.params.id, {
            populate: [
                { path: 'familyId' },
                { path: 'programId' },
                { path: 'sessionId' },
                { path: 'locationId' },
                { path: 'participants.childId' }
            ]
        });

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