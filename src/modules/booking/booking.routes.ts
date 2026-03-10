import { Router } from 'express';
import { BookingController } from './booking.controller';
import { authenticate } from '../iam/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
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
    authenticate,
    bookingController.validateBooking
);

/**
 * @route   GET /api/v1/bookings
 * @desc    Get all bookings
 * @access  Private
 */
router.get('/',
    authenticate,
    bookingController.getBookings
);

/**
 * @route   GET /api/v1/bookings/statistics
 * @desc    Get booking statistics
 * @access  Private (Admin, Manager)
 */
router.get('/statistics',
    authenticate,
    bookingController.getBookingStatistics
);

/**
 * @route   GET /api/v1/bookings/:id
 * @desc    Get booking by ID
 * @access  Private
 */
router.get('/:id',
    authenticate,
    param('id').isMongoId().withMessage('Valid booking ID is required'),
    validate,
    bookingController.getBookingById
);

/**
 * @route   POST /api/v1/bookings
 * @desc    Create new booking
 * @access  Private
 */
router.post('/',
    authenticate,
    body('bookingType').isString().withMessage('Booking type is required'),
    body('familyId').isMongoId().withMessage('Valid family ID is required'),
    body('participants').isArray({ min: 1 }).withMessage('At least one participant is required'),
    body('programId').isMongoId().withMessage('Valid program ID is required'),
    body('locationId').isMongoId().withMessage('Valid location ID is required'),
    validate,
    bookingController.createBooking
);

/**
 * @route   PATCH /api/v1/bookings/:id/cancel
 * @desc    Cancel booking
 * @access  Private
 */
router.patch('/:id/cancel',
    authenticate,
    param('id').isMongoId().withMessage('Valid booking ID is required'),
    body('reason').isString().withMessage('Cancellation reason is required'),
    validate,
    bookingController.cancelBooking
);

export default router;
