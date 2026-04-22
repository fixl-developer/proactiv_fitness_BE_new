import { Router, Request, Response } from 'express';
import { authenticate } from '../iam/auth.middleware';

const router = Router();

/**
 * @route   GET /api/v1/schedule
 * @desc    Get user's schedule (upcoming classes)
 * @access  Private
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id || (req as any).user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
                error: null,
                timestamp: new Date().toISOString()
            });
        }

        // Get user's bookings/classes
        const { Booking } = require('../booking/booking.model');

        const bookings = await Booking.find({
            userId: userId,
            status: { $in: ['confirmed', 'pending', 'CONFIRMED', 'PENDING'] }
        })
            .sort({ 'schedule.date': 1 })
            .lean();

        const scheduleItems = bookings.map((booking: any) => ({
            _id: booking._id,
            name: booking.className || booking.programName || 'Class',
            date: booking.schedule?.date || booking.date,
            time: booking.schedule?.time || booking.time,
            duration: booking.schedule?.duration || booking.duration || 60,
            location: booking.location,
            coach: booking.coach,
            status: booking.status
        }));

        return res.status(200).json({
            success: true,
            data: scheduleItems,
            message: 'Schedule fetched successfully',
            error: null,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Error fetching schedule:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch schedule',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route   GET /api/v1/schedule/calendar/:month/:year
 * @desc    Get calendar view for specific month
 * @access  Private
 */
router.get('/calendar/:month/:year', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id || (req as any).user?._id;
        const { month, year } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
                error: null,
                timestamp: new Date().toISOString()
            });
        }

        const { Booking } = require('../booking/booking.model');

        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);

        const bookings = await Booking.find({
            userId: userId,
            'schedule.date': {
                $gte: startDate.toISOString().split('T')[0],
                $lte: endDate.toISOString().split('T')[0]
            }
        }).lean();

        return res.status(200).json({
            success: true,
            data: bookings,
            message: 'Calendar data fetched successfully',
            error: null,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Error fetching calendar:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch calendar',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route   GET /api/v1/schedule/upcoming
 * @desc    Get upcoming classes
 * @access  Private
 */
router.get('/upcoming', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id || (req as any).user?._id;
        const limit = parseInt(req.query.limit as string) || 10;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
                error: null,
                timestamp: new Date().toISOString()
            });
        }

        const { Booking } = require('../booking/booking.model');

        const today = new Date().toISOString().split('T')[0];

        const bookings = await Booking.find({
            userId: userId,
            'schedule.date': { $gte: today },
            status: { $in: ['confirmed', 'pending', 'CONFIRMED', 'PENDING'] }
        })
            .sort({ 'schedule.date': 1 })
            .limit(limit)
            .lean();

        return res.status(200).json({
            success: true,
            data: bookings,
            message: 'Upcoming classes fetched successfully',
            error: null,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Error fetching upcoming:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch upcoming classes',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route   POST /api/v1/schedule/add-reminder
 * @desc    Add reminder for a class
 * @access  Private
 */
router.post('/add-reminder', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id || (req as any).user?._id;
        const { classId } = req.body;

        if (!userId || !classId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                error: null,
                timestamp: new Date().toISOString()
            });
        }

        // TODO: Implement reminder logic
        return res.status(200).json({
            success: true,
            data: { classId, reminder: true },
            message: 'Reminder added successfully',
            error: null,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Error adding reminder:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add reminder',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route   DELETE /api/v1/schedule/remove-reminder/:id
 * @desc    Remove reminder for a class
 * @access  Private
 */
router.delete('/remove-reminder/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id || (req as any).user?._id;
        const { id } = req.params;

        if (!userId || !id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                error: null,
                timestamp: new Date().toISOString()
            });
        }

        // TODO: Implement reminder removal logic
        return res.status(200).json({
            success: true,
            data: { id, reminder: false },
            message: 'Reminder removed successfully',
            error: null,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Error removing reminder:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to remove reminder',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
