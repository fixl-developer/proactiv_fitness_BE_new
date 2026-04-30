import { Router, Request, Response } from 'express';
import { userClassesController } from './user-classes.controller';
import { authMiddleware } from '../iam/auth.middleware';
import { browseClassesHandler } from '../../routes/parent-dashboard.routes';

const router = Router();

// Browse + self-book endpoints for the USER role (self-registered adult users
// who book classes for themselves, not for children). PARENT users have a
// parallel pair under /api/v1/parent/{browse-classes,book-class}.
//
// /browse delegates to the same handler the parent dashboard uses, so the
// PUBLISHED-schedule filter and session/program merge logic stay in sync.
router.get('/browse', authMiddleware, browseClassesHandler);

// POST /api/v1/user/classes/book
// Body: { sessionId, paymentMethod? }
// Self-books the authenticated user as the participant. Mirrors the parent
// /book-class endpoint but treats the user themselves as the child/participant.
router.post('/book', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../booking/booking.model');
        const { Session } = require('../scheduling/schedule.model');
        const { Location } = require('../bcms/location.model');
        const { User } = require('../iam/user.model');

        const userId = (req as any).user?.id || (req as any).user?._id;
        const { sessionId, paymentMethod } = req.body || {};
        const isMongoId = (s: any) => typeof s === 'string' && /^[a-f\d]{24}$/i.test(s);

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        if (!isMongoId(sessionId)) {
            return res.status(400).json({ success: false, message: 'Valid sessionId is required' });
        }

        // Resolve session
        const session = await Session.findById(sessionId)
            .populate({ path: 'programId', select: 'name pricingModel businessUnitId' })
            .populate({ path: 'locationId', select: 'name businessUnitId' })
            .lean();
        if (!session) {
            return res.status(404).json({ success: false, message: 'Class session not found' });
        }
        if (['cancelled', 'CANCELLED'].includes(String(session.status || ''))) {
            return res.status(409).json({ success: false, message: 'This session has been cancelled' });
        }
        const enrolledCount = Array.isArray(session.enrolledParticipants) ? session.enrolledParticipants.length : 0;
        const maxCap = typeof session.maxCapacity === 'number' ? session.maxCapacity : 0;
        if (maxCap > 0 && enrolledCount >= maxCap) {
            return res.status(409).json({ success: false, message: 'This class is fully booked' });
        }

        const program: any = session.programId || {};
        const location: any = session.locationId || {};

        // Prevent duplicate booking — same session + same user already booked
        const existing = await Booking.findOne({
            sessionId,
            'participants.childId': userId,
            status: { $in: ['confirmed', 'pending', 'CONFIRMED', 'PENDING'] },
            isDeleted: { $ne: true },
        }).lean();
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'You are already booked for this class',
            });
        }

        // Resolve businessUnitId
        let businessUnitId: any = program.businessUnitId || location.businessUnitId;
        if (!businessUnitId && isMongoId(session.locationId)) {
            const loc = await Location.findById(session.locationId).select('businessUnitId').lean();
            businessUnitId = loc?.businessUnitId;
        }
        if (!businessUnitId) {
            return res.status(500).json({
                success: false,
                message: 'Could not resolve business unit for this session',
            });
        }

        // Pull display name for participant entry
        const userDoc = await User.findById(userId).select('firstName lastName fullName').lean();
        const displayName = userDoc
            ? (userDoc.fullName || `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim() || 'Member')
            : 'Member';

        // Build canonical Booking
        const now = new Date();
        const bookingId = `BK-${now.getTime().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const price = program?.pricingModel?.basePrice ?? 0;
        const currency = program?.pricingModel?.currency || 'HKD';

        const booking = await Booking.create({
            bookingId,
            bookingType: 'drop_in',
            status: 'confirmed',
            familyId: userId,
            bookedBy: userId,
            participants: [{
                childId: userId,
                name: displayName,
                isMainParticipant: true,
            }],
            programId: program._id || session.programId,
            locationId: location._id || session.locationId,
            businessUnitId,
            sessionId,
            sessionDate: session.date || now,
            sessionTime: session.timeSlot
                ? { startTime: session.timeSlot.startTime, endTime: session.timeSlot.endTime }
                : undefined,
            payment: {
                amount: price,
                currency,
                status: 'pending',
                method: paymentMethod || 'card',
            },
            specialRequests: [
                `program:${program.name || 'Class'}`,
                `location:${location.name || ''}`,
            ],
            createdBy: userId,
            updatedBy: userId,
        });

        await Session.updateOne(
            { _id: sessionId },
            { $addToSet: { enrolledParticipants: userId } },
        ).catch((e: any) => console.error('[user/classes/book] enrol update failed', e?.message));

        return res.status(201).json({
            success: true,
            message: 'Class booked successfully',
            data: {
                id: booking._id,
                bookingId: booking.bookingId,
                status: booking.status,
                program: program.name || 'Class',
                location: location.name || '',
                sessionDate: booking.sessionDate,
                sessionTime: booking.sessionTime,
                price,
                currency,
            },
        });
    } catch (error: any) {
        console.error('User self-book error:', error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Failed to book class',
        });
    }
});

router.get('/', authMiddleware, (req, res) => userClassesController.getMyClasses(req, res));
router.get('/active', authMiddleware, (req, res) => userClassesController.getActiveClasses(req, res));
router.get('/completed', authMiddleware, (req, res) => userClassesController.getCompletedClasses(req, res));
router.get('/upcoming', authMiddleware, (req, res) => userClassesController.getUpcomingClasses(req, res));
router.get('/:classId', authMiddleware, (req, res) => userClassesController.getClassDetails(req, res));
router.get('/:classId/attendance', authMiddleware, (req, res) => userClassesController.getClassAttendance(req, res));
router.post('/:classId/feedback', authMiddleware, (req, res) => userClassesController.submitFeedback(req, res));

export default router;
