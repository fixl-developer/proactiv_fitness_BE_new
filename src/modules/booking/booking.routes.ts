import { Router } from 'express';
import { BookingController } from './booking.controller';
import { authMiddleware } from '../iam/auth.middleware';
import { validateRequest } from '../../shared/utils/validation.util';
import { body, param } from 'express-validator';

const router = Router();
const bookingController = new BookingController();

/**
 * @route   POST /api/v1/bookings/search
 * @desc    Search available sessions
 * @access  Public
 */
router.post('/search',
    bookingController.searchAvailability
);

/**
 * @route   POST /api/v1/bookings/validate
 * @desc    Validate booking request
 * @access  Private
 */
router.post('/validate',
    authMiddleware,
    bookingController.validateBooking
);

/**
 * @route   GET /api/v1/bookings
 * @desc    Get all bookings
 * @access  Private
 */
router.get('/',
    authMiddleware,
    bookingController.getBookings
);

/**
 * @route   GET /api/v1/bookings/statistics
 * @desc    Get booking statistics
 * @access  Private (Admin, Manager)
 */
router.get('/statistics',
    authMiddleware,
    bookingController.getBookingStatistics
);

/**
 * @route   GET /api/v1/bookings/:id
 * @desc    Get booking by ID
 * @access  Private
 */
router.get('/:id',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid booking ID is required'),
    validateRequest,
    bookingController.getBookingById
);

/**
 * @route   POST /api/v1/bookings
 * @desc    Create new booking
 * @access  Private
 */
router.post('/',
    authMiddleware,
    body('bookingType').isString().withMessage('Booking type is required'),
    body('familyId').isMongoId().withMessage('Valid family ID is required'),
    body('participants').isArray({ min: 1 }).withMessage('At least one participant is required'),
    body('programId').isMongoId().withMessage('Valid program ID is required'),
    body('locationId').isMongoId().withMessage('Valid location ID is required'),
    validateRequest,
    bookingController.createBooking
);

/**
 * @route   PATCH /api/v1/bookings/:id/cancel
 * @desc    Cancel booking
 * @access  Private
 */
router.patch('/:id/cancel',
    authMiddleware,
    param('id').isMongoId().withMessage('Valid booking ID is required'),
    body('reason').isString().withMessage('Cancellation reason is required'),
    validateRequest,
    bookingController.cancelBooking
);

export default router;