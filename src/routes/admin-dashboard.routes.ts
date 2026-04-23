import { Router, Request, Response } from 'express';

const router = Router();

// GET /admin/dashboard/metrics
router.get('/metrics', async (_req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const { Booking } = require('../modules/booking/booking.model');
        const { Location } = require('../modules/bcms/location.model');

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const [
            totalUsers, activeUsers, totalLocations, totalBookings,
            monthBookings, lastMonthBookings, revenueAgg, monthRevenueAgg,
            newUsersThisMonth, pendingBookings
        ] = await Promise.all([
            User.countDocuments({ isDeleted: { $ne: true } }),
            User.countDocuments({ status: 'ACTIVE', isDeleted: { $ne: true } }),
            Location.countDocuments({ isActive: true, isDeleted: { $ne: true } }),
            Booking.countDocuments({ isDeleted: { $ne: true } }),
            Booking.countDocuments({ createdAt: { $gte: monthStart }, isDeleted: { $ne: true } }),
            Booking.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: monthStart }, isDeleted: { $ne: true } }),
            Booking.aggregate([
                { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] } } },
                { $group: { _id: null, total: { $sum: '$payment.amount' } } },
            ]),
            Booking.aggregate([
                { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] }, createdAt: { $gte: monthStart } } },
                { $group: { _id: null, total: { $sum: '$payment.amount' } } },
            ]),
            User.countDocuments({ createdAt: { $gte: monthStart }, isDeleted: { $ne: true } }),
            Booking.countDocuments({ status: 'PENDING', isDeleted: { $ne: true } }),
        ]);

        const totalRevenue = revenueAgg[0]?.total || 0;
        const monthRevenue = monthRevenueAgg[0]?.total || 0;
        const bookingGrowth = lastMonthBookings > 0
            ? ((monthBookings - lastMonthBookings) / lastMonthBookings * 100).toFixed(1)
            : 0;

        res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                totalLocations,
                totalBookings,
                monthBookings,
                totalRevenue,
                monthRevenue,
                newUsersThisMonth,
                pendingBookings,
                bookingGrowth: Number(bookingGrowth),
                activeStudents: await User.countDocuments({ role: { $in: ['STUDENT', 'USER', 'PARENT'] }, status: 'ACTIVE', isDeleted: { $ne: true } }),
            }
        });
    } catch (error: any) {
        res.json({
            success: true,
            data: {
                totalUsers: 0, activeUsers: 0, totalLocations: 0, totalBookings: 0,
                monthBookings: 0, totalRevenue: 0, monthRevenue: 0, newUsersThisMonth: 0,
                pendingBookings: 0, bookingGrowth: 0, activeStudents: 0,
            }
        });
    }
});

// GET /admin/dashboard/business-metrics
router.get('/business-metrics', async (_req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const { Booking } = require('../modules/booking/booking.model');
        const { Location } = require('../modules/bcms/location.model');

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalStudents, totalCoaches, activeLocations, monthRevAgg, totalRevAgg] = await Promise.all([
            User.countDocuments({ role: { $in: ['STUDENT', 'USER', 'PARENT'] }, status: 'ACTIVE', isDeleted: { $ne: true } }),
            User.countDocuments({ role: 'COACH', status: 'ACTIVE', isDeleted: { $ne: true } }),
            Location.countDocuments({ isActive: true, isDeleted: { $ne: true } }),
            Booking.aggregate([
                { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] }, createdAt: { $gte: monthStart } } },
                { $group: { _id: null, total: { $sum: '$payment.amount' } } },
            ]),
            Booking.aggregate([
                { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] } } },
                { $group: { _id: null, total: { $sum: '$payment.amount' } } },
            ]),
        ]);

        res.json({
            success: true,
            data: {
                totalStudents,
                totalCoaches,
                activeLocations,
                monthlyRevenue: monthRevAgg[0]?.total || 0,
                totalRevenue: totalRevAgg[0]?.total || 0,
                studentCoachRatio: totalCoaches > 0 ? (totalStudents / totalCoaches).toFixed(1) : 0,
            }
        });
    } catch (error: any) {
        res.json({ success: true, data: { totalStudents: 0, totalCoaches: 0, activeLocations: 0, monthlyRevenue: 0, totalRevenue: 0, studentCoachRatio: 0 } });
    }
});

// GET /admin/dashboard/revenue-trend
router.get('/revenue-trend', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const months = parseInt(req.query.months as string) || 6;
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

        const trend = await Booking.aggregate([
            { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] }, createdAt: { $gte: startDate } } },
            { $group: {
                _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                revenue: { $sum: '$payment.amount' },
                bookings: { $sum: 1 },
            }},
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        const formattedTrend = trend.map((t: any) => ({
            month: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
            revenue: t.revenue,
            bookings: t.bookings,
        }));

        res.json({ success: true, data: formattedTrend });
    } catch (error: any) {
        res.json({ success: true, data: [] });
    }
});

// GET /admin/dashboard/student-growth
router.get('/student-growth', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const months = parseInt(req.query.months as string) || 6;
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

        const growth = await User.aggregate([
            { $match: { role: { $in: ['STUDENT', 'USER', 'PARENT'] }, createdAt: { $gte: startDate }, isDeleted: { $ne: true } } },
            { $group: {
                _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                count: { $sum: 1 },
            }},
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        const formatted = growth.map((g: any) => ({
            month: `${g._id.year}-${String(g._id.month).padStart(2, '0')}`,
            newStudents: g.count,
        }));

        res.json({ success: true, data: formatted });
    } catch (error: any) {
        res.json({ success: true, data: [] });
    }
});

// GET /admin/dashboard/activities (recent activities)
router.get('/activities', async (req: Request, res: Response) => {
    try {
        const { AuditVaultModel } = require('../modules/audit-vault/audit-vault.model');
        const limit = parseInt(req.query.limit as string) || 20;
        const activities = await AuditVaultModel.find({})
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        res.json({ success: true, data: activities });
    } catch (error: any) {
        res.json({ success: true, data: [] });
    }
});

// GET /admin/dashboard/alerts
router.get('/alerts', async (_req: Request, res: Response) => {
    try {
        const { AuditVaultModel } = require('../modules/audit-vault/audit-vault.model');
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const alerts = await AuditVaultModel.find({
            action: { $in: ['LOGIN_FAILED', 'UNAUTHORIZED', 'ERROR', 'SECURITY', 'ALERT'] },
            createdAt: { $gte: oneDayAgo },
        }).sort({ createdAt: -1 }).limit(50).lean();
        res.json({ success: true, data: alerts });
    } catch (error: any) {
        res.json({ success: true, data: [] });
    }
});

export default router;
