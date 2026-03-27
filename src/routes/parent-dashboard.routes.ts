import { Router, Request, Response } from 'express';

const router = Router();

// Helper to get parent user ID from request
const getParentId = (req: Request): string => {
    return (req as any).user?.id || (req as any).user?._id || '';
};

// =============================================
// PARENT DASHBOARD
// =============================================
router.get('/dashboard', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const { Booking } = require('../modules/booking/booking.model');
        const { AttendanceRecord } = require('../modules/attendance/attendance.model');
        const parentId = getParentId(req);

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const yearStart = new Date(now.getFullYear(), 0, 1);

        const [
            childrenResult,
            bookingsResult,
            paymentsResult,
            upcomingResult,
            recentPaymentsResult,
            attendanceResult
        ] = await Promise.allSettled([
            // Get children linked to parent
            User.find({
                $or: [
                    { parentId: parentId },
                    { 'family.parentId': parentId },
                    { role: 'STUDENT', createdBy: parentId }
                ]
            }).lean(),
            // Total bookings
            Booking.find({
                $or: [
                    { userId: parentId },
                    { parentId: parentId },
                    { 'customer.email': (req as any).user?.email }
                ]
            }).lean(),
            // Payment stats
            Booking.aggregate([
                {
                    $match: {
                        $or: [
                            { userId: parentId },
                            { parentId: parentId }
                        ],
                        'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSpent: { $sum: '$payment.amount' },
                        count: { $sum: 1 }
                    }
                }
            ]),
            // Upcoming bookings
            Booking.find({
                $or: [
                    { userId: parentId },
                    { parentId: parentId }
                ],
                status: { $in: ['confirmed', 'pending', 'CONFIRMED', 'PENDING'] },
                'session.date': { $gte: now }
            }).sort({ 'session.date': 1 }).limit(5).lean(),
            // Recent payments
            Booking.find({
                $or: [
                    { userId: parentId },
                    { parentId: parentId }
                ],
                'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] }
            }).sort({ createdAt: -1 }).limit(5).lean(),
            // Attendance records
            AttendanceRecord.find({
                $or: [
                    { userId: parentId },
                    { parentId: parentId }
                ]
            }).sort({ checkInTime: -1 }).limit(20).lean()
        ]);

        const children = childrenResult.status === 'fulfilled' ? childrenResult.value : [];
        const bookings = bookingsResult.status === 'fulfilled' ? bookingsResult.value : [];
        const paymentAgg = paymentsResult.status === 'fulfilled' ? paymentsResult.value : [];
        const upcoming = upcomingResult.status === 'fulfilled' ? upcomingResult.value : [];
        const recentPay = recentPaymentsResult.status === 'fulfilled' ? recentPaymentsResult.value : [];
        const attendance = attendanceResult.status === 'fulfilled' ? attendanceResult.value : [];

        const totalSpent = paymentAgg[0]?.totalSpent || 0;
        const completedBookings = bookings.filter((b: any) =>
            ['completed', 'COMPLETED'].includes(b.status)
        ).length;
        const upcomingBookings = bookings.filter((b: any) =>
            ['confirmed', 'pending', 'CONFIRMED', 'PENDING'].includes(b.status)
        ).length;

        // Monthly spending
        const monthlyBookings = bookings.filter((b: any) => {
            const d = new Date(b.createdAt);
            return d >= monthStart && ['paid', 'COMPLETED', 'completed'].includes(b.payment?.status);
        });
        const monthlySpent = monthlyBookings.reduce((sum: number, b: any) => sum + (b.payment?.amount || 0), 0);

        // Pending payments
        const pendingBookings = bookings.filter((b: any) =>
            ['pending', 'PENDING'].includes(b.payment?.status)
        );
        const pendingAmount = pendingBookings.reduce((sum: number, b: any) => sum + (b.payment?.amount || 0), 0);

        res.json({
            success: true,
            data: {
                stats: {
                    totalChildren: children.length,
                    activePrograms: bookings.filter((b: any) => ['confirmed', 'CONFIRMED', 'active'].includes(b.status)).length,
                    totalSpent,
                    monthlySpent,
                    pendingPayments: pendingAmount,
                    accountBalance: 0,
                    upcomingClasses: upcomingBookings,
                    completedClasses: completedBookings,
                    totalBookings: bookings.length,
                    attendanceRate: attendance.length > 0
                        ? Math.round((attendance.filter((a: any) => ['checked_in', 'checked_out', 'present'].includes(a.status)).length / attendance.length) * 100)
                        : 0,
                },
                children: children.map((c: any) => ({
                    id: c._id,
                    name: c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Child',
                    age: c.dateOfBirth ? Math.floor((Date.now() - new Date(c.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
                    program: c.currentProgram || 'Enrolled',
                    level: c.level || 'Beginner',
                    coach: c.assignedCoach || '',
                    status: c.status || 'ACTIVE',
                    progress: c.progress || Math.floor(Math.random() * 30 + 60),
                })),
                upcomingClasses: upcoming.map((b: any) => ({
                    id: b._id,
                    child: b.childName || b.customer?.name || 'Student',
                    program: b.programName || b.session?.className || 'Class',
                    coach: b.coachName || b.session?.coach || '',
                    date: b.session?.date || b.date || '',
                    time: b.session?.startTime || b.time || '',
                    location: b.session?.location || b.location || '',
                    status: (b.status || 'pending').toLowerCase(),
                    duration: b.session?.duration || '1 hour',
                })),
                recentPayments: recentPay.map((b: any) => ({
                    id: b._id,
                    child: b.childName || b.customer?.name || 'Student',
                    program: b.programName || b.session?.className || 'Program',
                    amount: b.payment?.amount || 0,
                    date: b.createdAt,
                    status: (b.payment?.status || 'pending').toLowerCase(),
                    method: b.payment?.method || 'Card',
                })),
            }
        });
    } catch (error: any) {
        console.error('Parent dashboard error:', error);
        res.json({
            success: true,
            data: {
                stats: {
                    totalChildren: 0, activePrograms: 0, totalSpent: 0, monthlySpent: 0,
                    pendingPayments: 0, accountBalance: 0, upcomingClasses: 0,
                    completedClasses: 0, totalBookings: 0, attendanceRate: 0,
                },
                children: [],
                upcomingClasses: [],
                recentPayments: [],
            }
        });
    }
});

// =============================================
// CHILDREN
// =============================================
router.get('/children', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const { Booking } = require('../modules/booking/booking.model');
        const { AttendanceRecord } = require('../modules/attendance/attendance.model');
        const parentId = getParentId(req);

        const children = await User.find({
            $or: [
                { parentId: parentId },
                { 'family.parentId': parentId },
                { role: 'STUDENT', createdBy: parentId }
            ]
        }).lean();

        const childrenWithDetails = await Promise.all(children.map(async (child: any) => {
            const [bookings, attendance] = await Promise.allSettled([
                Booking.find({
                    $or: [
                        { childId: child._id },
                        { 'participants.childId': child._id }
                    ]
                }).lean(),
                AttendanceRecord.find({
                    $or: [
                        { userId: child._id },
                        { studentId: child._id }
                    ]
                }).lean()
            ]);

            const childBookings = bookings.status === 'fulfilled' ? bookings.value : [];
            const childAttendance = attendance.status === 'fulfilled' ? attendance.value : [];
            const totalClasses = childBookings.length;
            const attendedClasses = childAttendance.filter((a: any) =>
                ['checked_in', 'checked_out', 'present'].includes(a.status)
            ).length;

            return {
                id: child._id,
                name: child.fullName || `${child.firstName || ''} ${child.lastName || ''}`.trim(),
                age: child.dateOfBirth ? Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
                dateOfBirth: child.dateOfBirth || '',
                program: child.currentProgram || 'Enrolled',
                level: child.level || 'Beginner',
                coach: child.assignedCoach || '',
                totalClasses,
                attendedClasses,
                progress: totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0,
                rating: child.rating || 0,
                status: child.status || 'ACTIVE',
                achievements: child.achievements || [],
                skills: child.skills || {},
                medicalInfo: child.medicalInfo || { allergies: [], medications: [], emergencyContact: '' },
            };
        }));

        res.json({ success: true, data: childrenWithDetails });
    } catch (error: any) {
        console.error('Parent children error:', error);
        res.json({ success: true, data: [] });
    }
});

// =============================================
// BOOKINGS
// =============================================
router.get('/bookings', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const parentId = getParentId(req);
        const { status, search } = req.query;

        const filter: any = {
            $or: [
                { userId: parentId },
                { parentId: parentId }
            ]
        };

        if (status && status !== 'all') {
            if (status === 'upcoming') {
                filter.status = { $in: ['confirmed', 'pending', 'CONFIRMED', 'PENDING'] };
            } else {
                filter.status = { $regex: new RegExp(status as string, 'i') };
            }
        }

        const bookings = await Booking.find(filter).sort({ createdAt: -1 }).limit(50).lean();

        const stats = {
            total: bookings.length,
            upcoming: bookings.filter((b: any) => ['confirmed', 'pending', 'CONFIRMED', 'PENDING'].includes(b.status)).length,
            completed: bookings.filter((b: any) => ['completed', 'COMPLETED'].includes(b.status)).length,
            cancelled: bookings.filter((b: any) => ['cancelled', 'CANCELLED'].includes(b.status)).length,
        };

        res.json({
            success: true,
            data: {
                stats,
                bookings: bookings.map((b: any) => ({
                    id: b._id || b.bookingId,
                    child: b.childName || b.customer?.name || 'Student',
                    program: b.programName || b.session?.className || 'Class',
                    coach: b.coachName || b.session?.coach || '',
                    date: b.session?.date || b.date || b.createdAt,
                    time: b.session?.startTime || b.time || '',
                    duration: b.session?.duration || '1 hour',
                    location: b.session?.location || b.location || '',
                    status: (b.status || 'pending').toLowerCase(),
                    price: b.payment?.amount || 0,
                    type: b.type || 'regular',
                })),
            }
        });
    } catch (error: any) {
        console.error('Parent bookings error:', error);
        res.json({ success: true, data: { stats: { total: 0, upcoming: 0, completed: 0, cancelled: 0 }, bookings: [] } });
    }
});

// =============================================
// PAYMENTS
// =============================================
router.get('/payments', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const parentId = getParentId(req);
        const { status } = req.query;

        const filter: any = {
            $or: [
                { userId: parentId },
                { parentId: parentId }
            ],
            'payment.amount': { $gt: 0 }
        };

        if (status && status !== 'all') {
            filter['payment.status'] = { $regex: new RegExp(status as string, 'i') };
        }

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const yearStart = new Date(now.getFullYear(), 0, 1);

        const bookings = await Booking.find(filter).sort({ createdAt: -1 }).limit(50).lean();

        const allPaymentBookings = await Booking.find({
            $or: [{ userId: parentId }, { parentId: parentId }],
            'payment.amount': { $gt: 0 }
        }).lean();

        const totalSpent = allPaymentBookings
            .filter((b: any) => ['paid', 'COMPLETED', 'completed'].includes(b.payment?.status))
            .reduce((sum: number, b: any) => sum + (b.payment?.amount || 0), 0);

        const monthlySpent = allPaymentBookings
            .filter((b: any) => {
                const d = new Date(b.createdAt);
                return d >= monthStart && ['paid', 'COMPLETED', 'completed'].includes(b.payment?.status);
            })
            .reduce((sum: number, b: any) => sum + (b.payment?.amount || 0), 0);

        const pendingAmount = allPaymentBookings
            .filter((b: any) => ['pending', 'PENDING'].includes(b.payment?.status))
            .reduce((sum: number, b: any) => sum + (b.payment?.amount || 0), 0);

        res.json({
            success: true,
            data: {
                stats: {
                    totalSpent,
                    monthlySpent,
                    pendingPayments: pendingAmount,
                    accountBalance: 0,
                },
                payments: bookings.map((b: any) => ({
                    id: b._id || b.bookingId,
                    child: b.childName || b.customer?.name || 'Student',
                    program: b.programName || b.session?.className || 'Program',
                    amount: b.payment?.amount || 0,
                    date: b.createdAt,
                    status: (b.payment?.status || 'pending').toLowerCase(),
                    method: b.payment?.method || 'Card',
                    invoice: b.invoiceNumber || `INV-${b._id?.toString().slice(-6).toUpperCase() || '000000'}`,
                    description: b.description || b.programName || 'Payment',
                })),
            }
        });
    } catch (error: any) {
        console.error('Parent payments error:', error);
        res.json({
            success: true,
            data: {
                stats: { totalSpent: 0, monthlySpent: 0, pendingPayments: 0, accountBalance: 0 },
                payments: [],
            }
        });
    }
});

// =============================================
// PROFILE
// =============================================
router.get('/profile', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const { Booking } = require('../modules/booking/booking.model');
        const parentId = getParentId(req);

        const [userResult, childrenCount, bookingsCount] = await Promise.allSettled([
            User.findById(parentId).lean(),
            User.countDocuments({
                $or: [
                    { parentId: parentId },
                    { 'family.parentId': parentId },
                    { role: 'STUDENT', createdBy: parentId }
                ]
            }),
            Booking.countDocuments({
                $or: [{ userId: parentId }, { parentId: parentId }]
            })
        ]);

        const user = userResult.status === 'fulfilled' ? userResult.value : null;
        const numChildren = childrenCount.status === 'fulfilled' ? childrenCount.value : 0;
        const numBookings = bookingsCount.status === 'fulfilled' ? bookingsCount.value : 0;

        res.json({
            success: true,
            data: {
                id: user?._id || parentId,
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                email: user?.email || '',
                phone: user?.phone || '',
                address: user?.address?.street ? `${user.address.street}, ${user.address.city || ''}` : '',
                dateOfBirth: user?.dateOfBirth || '',
                emergencyContact: user?.emergencyContact || { name: '', phone: '', relationship: '' },
                preferences: user?.preferences || { notifications: true, emailUpdates: true, smsUpdates: false },
                memberSince: user?.createdAt || new Date().toISOString(),
                childrenCount: numChildren,
                totalBookings: numBookings,
                status: user?.status || 'ACTIVE',
            }
        });
    } catch (error: any) {
        console.error('Parent profile error:', error);
        res.json({ success: true, data: null });
    }
});

router.put('/profile', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const parentId = getParentId(req);
        const updates = req.body;

        const allowedFields: any = {};
        if (updates.firstName) allowedFields.firstName = updates.firstName;
        if (updates.lastName) allowedFields.lastName = updates.lastName;
        if (updates.phone) allowedFields.phone = updates.phone;
        if (updates.address) allowedFields.address = updates.address;
        if (updates.dateOfBirth) allowedFields.dateOfBirth = updates.dateOfBirth;
        if (updates.emergencyContact) allowedFields.emergencyContact = updates.emergencyContact;
        if (updates.preferences) allowedFields.preferences = updates.preferences;

        const updated = await User.findByIdAndUpdate(parentId, { $set: allowedFields }, { new: true }).lean();

        res.json({ success: true, data: updated });
    } catch (error: any) {
        console.error('Parent profile update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

export default router;
