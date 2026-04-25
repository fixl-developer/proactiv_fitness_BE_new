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
 * @route   POST /api/v1/bookings/assessment
 * @desc    Create assessment booking (simplified website flow)
 * @access  Private
 */
router.post('/assessment',
    authenticate,
    bookingController.createAssessmentBooking
);

/**
 * @route   POST /api/v1/bookings/class
 * @desc    Create class booking (simplified website flow)
 * @access  Private
 */
router.post('/class',
    authenticate,
    bookingController.createClassBooking
);

/**
 * @route   GET /api/v1/bookings/my-bookings
 * @desc    Get logged-in user's bookings
 * @access  Private
 */
router.get('/my-bookings',
    authenticate,
    bookingController.getMyBookings
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
 * @desc    Create new booking. Two flavors:
 *          1) Customer/end-user flow — supplies full schema (bookingType, familyId,
 *             participants, programId, locationId, payment, ...) and goes through
 *             the strict controller path.
 *          2) Admin flow — supplies the simplified payload the admin Bookings page
 *             uses (customerId, programId, sessionId, date, status, paymentStatus,
 *             notes). The shim below auto-builds the strict schema from those
 *             fields so the admin form works without forcing the admin to specify
 *             family/participants/payment manually.
 * @access  Private
 */
router.post('/',
    authenticate,
    async (req: any, res: any, next: any) => {
        try {
            const body = req.body || {};
            const isMongoId = (s: any) => typeof s === 'string' && /^[a-f\d]{24}$/i.test(s);

            // If full schema supplied, defer to the strict controller (backward compatible).
            const hasFullSchema =
                body.bookingType && isMongoId(body.familyId) &&
                Array.isArray(body.participants) && body.participants.length > 0 &&
                isMongoId(body.programId) && isMongoId(body.locationId);
            if (hasFullSchema) {
                return bookingController.createBooking(req, res, next);
            }

            // Otherwise treat as admin-shim flow. Require admin role.
            const role = String(req.user?.role || '').toUpperCase();
            const adminRoles = ['ADMIN', 'REGIONAL_ADMIN', 'FRANCHISE_OWNER', 'LOCATION_MANAGER'];
            if (!adminRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking requires bookingType, familyId, participants[], programId, locationId',
                });
            }

            const { Booking } = require('./booking.model');
            const { Program } = require('../programs/program.model');
            const { User } = require('../iam/user.model');

            const customerId = body.customerId || body.userId;
            if (!customerId) {
                return res.status(400).json({ success: false, message: 'customerId is required' });
            }
            if (!isMongoId(body.programId)) {
                return res.status(400).json({ success: false, message: 'Valid programId is required' });
            }

            // Resolve customer for participant name + locationId fallback
            const customer = await User.findById(customerId).select('firstName lastName name email locationId').lean().catch(() => null);
            const customerName = customer ? (customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email || 'Customer') : 'Customer';

            // Resolve locationId — prefer body, then customer's, then any usable
            // location (active first, then any non-deleted; inactive locations are
            // acceptable here because admin is creating on the customer's behalf).
            let locationId: any = isMongoId(body.locationId) ? body.locationId : (isMongoId(customer?.locationId) ? customer.locationId : null);
            if (!locationId) {
                const { Location } = require('../bcms/location.model');
                const anyLoc =
                    (await Location.findOne({ isActive: true, isDeleted: { $ne: true } }).select('_id').lean()) ||
                    (await Location.findOne({ isDeleted: { $ne: true } }).select('_id').lean()) ||
                    (await Location.findOne({}).select('_id').lean());
                locationId = anyLoc?._id;
            }
            if (!locationId) {
                return res.status(400).json({ success: false, message: 'No location found; create one in Locations and retry, or specify locationId in payload' });
            }

            // Resolve program (for businessUnitId + price defaults)
            const program = await Program.findById(body.programId).select('businessUnitId pricing locationIds').lean().catch(() => null);

            // Build booking doc
            const now = new Date();
            const bookingId = `BK-${now.getTime().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
            const sessionDate = body.date ? new Date(body.date) : now;

            // Resolve businessUnitId: prefer program's, else fallback to any location's, else any BU.
            let businessUnitId: any = program?.businessUnitId;
            if (!businessUnitId) {
                const { Location } = require('../bcms/location.model');
                const loc = await Location.findById(locationId).select('businessUnitId').lean().catch(() => null);
                businessUnitId = loc?.businessUnitId;
            }
            if (!businessUnitId) {
                const { BusinessUnit } = require('../bcms/business-unit.model');
                const anyBu = await BusinessUnit.findOne({ isDeleted: { $ne: true } }).select('_id').lean().catch(() => null);
                businessUnitId = anyBu?._id;
            }

            // Map UI status values to canonical enum values (lowercase).
            const statusMap: Record<string, string> = {
                pending: 'pending', confirmed: 'confirmed', cancelled: 'cancelled',
                completed: 'completed', waitlisted: 'waitlisted', no_show: 'no_show',
            };
            const rawStatus = String(body.status || 'pending').toLowerCase();
            const status = statusMap[rawStatus] || 'pending';

            // Map UI booking-type values to canonical enum values.
            const typeMap: Record<string, string> = {
                trial: 'trial', drop_in: 'drop_in', term_enrollment: 'term_enrollment',
                private_lesson: 'private_lesson', camp: 'camp', event: 'event',
                party: 'party', assessment: 'assessment', makeup: 'makeup',
                class: 'drop_in', // UI "CLASS" → drop_in
            };
            const rawType = String(body.bookingType || 'drop_in').toLowerCase();
            const bookingType = typeMap[rawType] || 'drop_in';

            const doc: any = {
                bookingId,
                bookingType,
                status,
                familyId: customerId, // admin shim: treat customer as their own family
                bookedBy: req.user.id,
                createdBy: req.user.id,
                updatedBy: req.user.id,
                participants: [{
                    childId: customerId,
                    name: customerName,
                    isMainParticipant: true,
                }],
                programId: body.programId,
                locationId,
                businessUnitId,
                sessionDate,
                payment: {
                    amount: typeof body.amount === 'number' ? body.amount : (program?.pricing?.basePrice || 0),
                    currency: body.currency || program?.pricing?.currency || 'HKD',
                    status: String(body.paymentStatus || 'pending').toLowerCase(),
                },
                specialRequests: body.notes ? [body.notes] : [],
            };
            if (isMongoId(body.sessionId)) doc.sessionId = body.sessionId;
            if (isMongoId(body.termId)) doc.termId = body.termId;

            const created = await Booking.create(doc);
            res.status(201).json({ success: true, message: 'Booking created', data: created });
        } catch (error: any) {
            console.error('Booking admin-shim create error:', error?.message);
            res.status(500).json({ success: false, message: error?.message || 'Failed to create booking' });
        }
    }
);

/**
 * @route   PATCH /api/v1/bookings/:id/cancel
 * @desc    Cancel booking
 * @access  Private
 */
router.patch('/:id/cancel',
    authenticate,
    param('id').isMongoId().withMessage('Valid booking ID is required'),
    validate,
    async (req: any, res: any, next: any) => {
        // Allow cancel without explicit reason from admin UI; default it
        if (!req.body) req.body = {};
        if (!req.body.reason) req.body.reason = 'Cancelled by admin';
        return bookingController.cancelBooking(req, res, next);
    }
);

/**
 * @route   PUT /api/v1/bookings/:id
 * @desc    Update booking (admin) — supports partial flat payload
 * @access  Private
 */
router.put('/:id',
    authenticate,
    param('id').isMongoId().withMessage('Valid booking ID is required'),
    validate,
    async (req: any, res: any) => {
        try {
            const { Booking } = require('./booking.model');
            const update: any = {};
            const { status, paymentStatus, notes, date, sessionId, programId } = req.body || {};
            if (status) update.status = status;
            if (paymentStatus) update['payment.status'] = paymentStatus;
            if (notes !== undefined) update.specialRequests = [notes];
            if (date) update.sessionDate = new Date(date);
            // Only set ObjectId-typed fields if they look like Mongo IDs
            const isMongoId = (s: any) => typeof s === 'string' && /^[a-f\d]{24}$/i.test(s);
            if (isMongoId(sessionId)) update.sessionId = sessionId;
            if (isMongoId(programId)) update.programId = programId;

            const updated = await Booking.findByIdAndUpdate(req.params.id, update, { new: true });
            if (!updated) return res.status(404).json({ success: false, message: 'Booking not found' });
            res.json({ success: true, message: 'Booking updated', data: updated });
        } catch (error: any) {
            console.error('Booking update error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   DELETE /api/v1/bookings/:id
 * @desc    Delete booking (admin, soft delete)
 * @access  Private
 */
router.delete('/:id',
    authenticate,
    param('id').isMongoId().withMessage('Valid booking ID is required'),
    validate,
    async (req: any, res: any) => {
        try {
            const { Booking } = require('./booking.model');
            const result = await Booking.findByIdAndUpdate(
                req.params.id,
                { isDeleted: true, deletedAt: new Date() },
                { new: true }
            );
            if (!result) return res.status(404).json({ success: false, message: 'Booking not found' });
            res.json({ success: true, message: 'Booking deleted' });
        } catch (error: any) {
            console.error('Booking delete error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   PATCH /api/v1/bookings/:id/status
 * @desc    Update booking status (admin)
 * @access  Private
 */
router.patch('/:id/status',
    authenticate,
    param('id').isMongoId().withMessage('Valid booking ID is required'),
    body('status').isString().withMessage('Status is required'),
    validate,
    async (req: any, res: any) => {
        try {
            const { Booking } = require('./booking.model');
            const updated = await Booking.findByIdAndUpdate(
                req.params.id,
                { status: req.body.status },
                { new: true }
            );
            if (!updated) return res.status(404).json({ success: false, message: 'Booking not found' });
            res.json({ success: true, message: 'Status updated', data: updated });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

export default router;
