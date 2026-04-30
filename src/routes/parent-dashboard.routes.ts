import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../modules/iam/auth.middleware';
import { UserRole } from '../shared/enums';

const router = Router();

// Helper to get parent user ID from request
const getParentId = (req: Request): string => {
    return (req as any).user?.id || (req as any).user?._id || '';
};

// =============================================
// SHARED HANDLER: list bookable items (Sessions + admin Programs)
// Exported so it can be mounted at both /parent/browse-classes (PARENT/ADMIN auth)
// and /bookings/browse (any authed user) without duplicating the merge/format logic.
// =============================================
export const browseClassesHandler = async (req: Request, res: Response) => {
    try {
        const { Session, Schedule } = require('../modules/scheduling/schedule.model');
        const { Program } = require('../modules/programs/program.model');
        const { location, program, level, date, sessionId } = req.query;
        const isMongoId = (s: any) => typeof s === 'string' && /^[a-f\d]{24}$/i.test(s);

        // ---- Sessions: only those whose parent Schedule is PUBLISHED ----
        // Customers must never see draft schedules.
        const publishedSchedules = await Schedule.find({ status: 'published' })
            .select('_id')
            .lean()
            .catch(() => []);
        const publishedScheduleIds = publishedSchedules.map((s: any) => s._id);

        const sessionFilter: any = {
            status: { $in: ['scheduled', 'confirmed', 'active', 'ACTIVE'] },
            scheduleId: { $in: publishedScheduleIds },
        };
        if (date) {
            const d = new Date(date as string);
            sessionFilter.date = { $gte: d, $lt: new Date(d.getTime() + 24 * 60 * 60 * 1000) };
        }
        // Direct fetch by sessionId — used by /parent/book-class/[sessionId]
        // to load a single class without scanning the full session list.
        if (isMongoId(sessionId)) {
            sessionFilter._id = sessionId;
        }

        // Populate refs so frontend cards have real names, not blank strings.
        const sessions = await Session.find(sessionFilter)
            .populate({ path: 'programId', select: 'name description shortDescription category skillLevels pricingModel' })
            .populate({ path: 'locationId', select: 'name address' })
            .populate({ path: 'coachAssignments.coachId', select: 'firstName lastName name' })
            .sort({ date: 1 })
            .limit(100)
            .lean()
            .catch((e: any) => { console.error('[browseClasses] session query failed:', e?.message); return []; });

        // ---- Admin Programs (catalog entries — for programs without a published schedule yet) ----
        const programFilter: any = { isActive: true, isPublic: true, isDeleted: { $ne: true } };
        if (program) programFilter.name = { $regex: new RegExp(program as string, 'i') };
        if (level) programFilter.skillLevels = { $in: [String(level).toLowerCase()] };

        const programs = await Program.find(programFilter)
            .select('name description shortDescription category programType skillLevels ageGroups pricingModel locationIds')
            .sort({ name: 1 })
            .limit(50)
            .lean()
            .catch(() => []);

        // Normalize sessions: pull human-readable values from populated refs.
        const locStr = location ? String(location).toLowerCase() : '';
        const progStr = program ? String(program).toLowerCase() : '';
        const lvlStr = level ? String(level).toLowerCase() : '';

        const sessionItems = sessions
            .map((s: any) => {
                const prog = s.programId || {};
                const loc = s.locationId || {};
                // Primary coach = first assignment marked 'primary', else the first assignment.
                const assignments = Array.isArray(s.coachAssignments) ? s.coachAssignments : [];
                const primary = assignments.find((a: any) => a?.role === 'primary') || assignments[0] || {};
                const c = primary.coachId || {};
                const coachName = (c.firstName || c.lastName)
                    ? `${c.firstName || ''} ${c.lastName || ''}`.trim()
                    : (c.name || '');

                const enrolledCount = Array.isArray(s.enrolledParticipants) ? s.enrolledParticipants.length : 0;
                const maxCap = typeof s.maxCapacity === 'number' ? s.maxCapacity : 10;

                // Skill level — sessions don't carry one; surface the program's first level.
                const sessionLevel = (Array.isArray(prog.skillLevels) && prog.skillLevels[0]) || 'All Levels';

                return {
                    id: s._id,
                    source: 'session' as const,
                    program: prog.name || 'Class',
                    coach: coachName,
                    level: sessionLevel,
                    location: loc.name || '',
                    locationAddress: loc.address?.street || loc.address || '',
                    date: s.date || '',
                    time: s.timeSlot?.startTime || '',
                    endTime: s.timeSlot?.endTime || '',
                    duration: s.duration ? `${s.duration} min` : '1 hour',
                    capacity: maxCap,
                    enrolled: enrolledCount,
                    availableSpots: Math.max(0, maxCap - enrolledCount),
                    price: prog.pricingModel?.basePrice ?? 0,
                    currency: prog.pricingModel?.currency || 'HKD',
                    ageGroup: prog.category || '',
                    description: prog.shortDescription || prog.description || '',
                };
            })
            // Apply human-readable filters AFTER populate (since refs aren't string-searchable in mongo).
            .filter((it: any) => {
                if (locStr && !String(it.location).toLowerCase().includes(locStr)) return false;
                if (progStr && !String(it.program).toLowerCase().includes(progStr)) return false;
                if (lvlStr && !String(it.level).toLowerCase().includes(lvlStr)) return false;
                return true;
            });

        const programItems = programs.map((p: any) => {
            const ag = (Array.isArray(p.ageGroups) && p.ageGroups[0]) || {};
            const ageDesc = ag.description ||
                (ag.minAge !== undefined && ag.maxAge !== undefined
                    ? `Ages ${ag.minAge}-${ag.maxAge}${ag.ageType ? ' ' + ag.ageType : ''}`
                    : '');
            return {
                id: p._id,
                source: 'program' as const,
                program: p.name || 'Program',
                coach: '',
                level: (Array.isArray(p.skillLevels) && p.skillLevels[0]) || 'All Levels',
                location: ageDesc, // surface age group in the location slot for now
                date: '',           // schedule TBA
                time: 'Flexible',
                duration: '',
                availableSpots: 10,
                price: p.pricingModel?.basePrice ?? 0,
                description: p.shortDescription || p.description || '',
                category: p.category || p.programType || '',
            };
        });

        res.json({
            success: true,
            data: [...sessionItems, ...programItems],
        });
    } catch (error: any) {
        console.error('Browse classes error:', error);
        res.json({ success: true, data: [] });
    }
};

// Apply authentication to all parent dashboard routes
router.use(authenticate);
router.use(authorize(UserRole.PARENT, UserRole.ADMIN));

// =============================================
// PARENT DASHBOARD
// =============================================
router.get('/dashboard', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const { Booking } = require('../modules/booking/booking.model');
        const { AttendanceRecord } = require('../modules/attendance/attendance.model');
        const { Session } = require('../modules/scheduling/schedule.model');
        const parentId = getParentId(req);

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const yearStart = new Date(now.getFullYear(), 0, 1);

        // Date-range scope for "filtered" stats/lists. `today` / `7d` / `30d`.
        const timeRange = (req.query.timeRange as string) || 'today';
        const rangeStart = new Date(now);
        if (timeRange === '7d') {
            rangeStart.setDate(rangeStart.getDate() - 7);
            rangeStart.setHours(0, 0, 0, 0);
        } else if (timeRange === '30d') {
            rangeStart.setDate(rangeStart.getDate() - 30);
            rangeStart.setHours(0, 0, 0, 0);
        } else {
            rangeStart.setHours(0, 0, 0, 0);
        }

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
            // Total bookings — match any of the parent-id fields the booking
            // service may have used (bookedBy/familyId from the simplified
            // /bookings/* flow, userId/parentId from older flows).
            Booking.find({
                $or: [
                    { bookedBy: parentId },
                    { familyId: parentId },
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
                            { bookedBy: parentId },
                            { familyId: parentId },
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
            // Upcoming bookings — sessionDate is the canonical field set by the
            // simplified booking service.
            Booking.find({
                $or: [
                    { bookedBy: parentId },
                    { familyId: parentId },
                    { userId: parentId },
                    { parentId: parentId }
                ],
                status: { $in: ['confirmed', 'pending', 'CONFIRMED', 'PENDING'] },
                $and: [{ $or: [{ sessionDate: { $gte: now } }, { 'session.date': { $gte: now } }] }],
            }).sort({ sessionDate: 1 }).limit(5).lean(),
            // Recent payments
            Booking.find({
                $or: [
                    { bookedBy: parentId },
                    { familyId: parentId },
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

        // Total Spent reflects the cost of every class the parent has booked
        // and not cancelled — that matches user expectation ("I booked it,
        // therefore I owe/spent that amount"). The previous behaviour summed
        // only `paid` bookings, which was always 0 because /parent/book-class
        // creates bookings with `payment.status: 'pending'` until a real
        // payment is recorded. Pending-only amount is still surfaced
        // separately via `pendingPayments`.
        const isCancelled = (b: any) => ['cancelled', 'CANCELLED'].includes(b.status);
        const totalSpent = bookings
            .filter((b: any) => !isCancelled(b))
            .reduce((sum: number, b: any) => sum + (b.payment?.amount || 0), 0);
        const completedBookings = bookings.filter((b: any) =>
            ['completed', 'COMPLETED'].includes(b.status)
        ).length;
        const upcomingBookings = bookings.filter((b: any) =>
            ['confirmed', 'pending', 'CONFIRMED', 'PENDING'].includes(b.status)
        ).length;

        // Monthly spending — same "non-cancelled bookings made this month" basis.
        const monthlyBookings = bookings.filter((b: any) => {
            const d = new Date(b.createdAt);
            return d >= monthStart && !isCancelled(b);
        });
        const monthlySpent = monthlyBookings.reduce((sum: number, b: any) => sum + (b.payment?.amount || 0), 0);

        // Pending payments — bookings whose payment.status is still pending.
        // (totalSpent already includes these; this is the "still owed" subset.)
        const pendingBookings = bookings.filter((b: any) =>
            ['pending', 'PENDING'].includes(b.payment?.status)
        );
        const pendingAmount = pendingBookings.reduce((sum: number, b: any) => sum + (b.payment?.amount || 0), 0);

        // Range-scoped stats (driven by timeRange query param)
        const rangeBookings = bookings.filter((b: any) => new Date(b.createdAt) >= rangeStart);
        const rangeSpent = rangeBookings
            .filter((b: any) => !isCancelled(b))
            .reduce((sum: number, b: any) => sum + (b.payment?.amount || 0), 0);
        const rangeAttendance = attendance.filter((a: any) => new Date(a.checkInTime || a.createdAt || now) >= rangeStart);
        const rangeCompleted = rangeBookings.filter((b: any) => ['completed', 'COMPLETED'].includes(b.status)).length;
        const rangeUpcoming = rangeBookings.filter((b: any) => ['confirmed', 'pending', 'CONFIRMED', 'PENDING'].includes(b.status)).length;

        // Alerts derived from real data: recent attendance + pending payments + upcoming classes
        const alerts: any[] = [];
        const latestAttendance = attendance[0];
        if (latestAttendance && ['checked_in', 'checked_out', 'present'].includes(latestAttendance.status)) {
            alerts.push({
                type: 'success',
                title: 'Class Attended',
                message: `Your child checked in on ${new Date(latestAttendance.checkInTime || latestAttendance.createdAt).toLocaleDateString()}`,
                time: new Date(latestAttendance.checkInTime || latestAttendance.createdAt).toISOString(),
                priority: 'low',
            });
        }
        if (pendingAmount > 0) {
            alerts.push({
                type: 'warning',
                title: 'Pending Payment',
                message: `You have HK$${pendingAmount.toLocaleString()} pending across ${pendingBookings.length} booking${pendingBookings.length === 1 ? '' : 's'}`,
                time: new Date().toISOString(),
                priority: 'high',
            });
        }
        if (upcoming.length > 0) {
            const next = upcoming[0];
            alerts.push({
                type: 'info',
                title: 'Upcoming Class',
                message: `${next.programName || next.session?.className || 'Class'} on ${next.session?.date || next.date || 'soon'}`,
                time: new Date().toISOString(),
                priority: 'low',
            });
        }

        // ---- Per-child enrichment ----
        // The child User doc carries no live program/coach/progress fields, so
        // derive them from each child's actual bookings + attendance. This is
        // what makes the dashboard cards reflect real activity instead of the
        // placeholder "Enrolled" / random-progress values that were here before.
        const childIds: string[] = (children as any[]).map((c: any) => String(c._id));

        // Bookings already include all parent's bookings; group them by childId
        // via the participants array (canonical for parent-flow bookings).
        const bookingsByChild = new Map<string, any[]>();
        for (const b of bookings as any[]) {
            const ps: any[] = Array.isArray(b.participants) ? b.participants : [];
            for (const p of ps) {
                const cid = String(p?.childId || '');
                if (!cid) continue;
                if (!bookingsByChild.has(cid)) bookingsByChild.set(cid, []);
                bookingsByChild.get(cid)!.push(b);
            }
        }

        // Pull session docs for the unique sessionIds across these bookings so
        // we can resolve the assigned coach (Session.coachAssignments[].coachId).
        const sessionIds = Array.from(new Set(
            (bookings as any[]).map((b: any) => String(b.sessionId || '')).filter(Boolean)
        ));
        let sessionMap = new Map<string, any>();
        if (sessionIds.length > 0) {
            try {
                const sessionDocs = await Session.find({ _id: { $in: sessionIds } })
                    .populate({ path: 'coachAssignments.coachId', select: 'firstName lastName name' })
                    .lean();
                sessionMap = new Map(sessionDocs.map((s: any) => [String(s._id), s]));
            } catch (e: any) {
                console.error('[parent/dashboard] session populate failed:', e?.message);
            }
        }

        // Per-child attendance — the parent-scoped `attendance` query above only
        // matches userId/parentId === parentId, which never includes child rows.
        const childAttendanceByChild = new Map<string, any[]>();
        if (childIds.length > 0) {
            try {
                const childAttendance = await AttendanceRecord.find({
                    $or: [
                        { userId: { $in: childIds } },
                        { studentId: { $in: childIds } },
                    ],
                }).lean();
                for (const a of childAttendance as any[]) {
                    const cid = String(a?.studentId || a?.userId || '');
                    if (!cid) continue;
                    if (!childAttendanceByChild.has(cid)) childAttendanceByChild.set(cid, []);
                    childAttendanceByChild.get(cid)!.push(a);
                }
            } catch (e: any) {
                console.error('[parent/dashboard] child attendance fetch failed:', e?.message);
            }
        }

        // Active programs = unique program IDs across confirmed bookings
        // (was: count of confirmed bookings, which inflated when one program
        // had multiple sessions booked for the same child).
        const activeProgramIds = new Set(
            (bookings as any[])
                .filter((b: any) => ['confirmed', 'CONFIRMED', 'active'].includes(b.status))
                .map((b: any) => String(b.programId || ''))
                .filter(Boolean)
        );

        const parseSpecial = (b: any): Record<string, string> => {
            const out: Record<string, string> = {};
            (b?.specialRequests || []).forEach((r: string) => {
                const [k, ...v] = r.split(':');
                if (k) out[k] = v.join(':');
            });
            return out;
        };

        const buildChildCard = (c: any) => {
            const cid = String(c._id);
            const cBookings: any[] = bookingsByChild.get(cid) || [];
            const cAttendance: any[] = childAttendanceByChild.get(cid) || [];

            const sortedByCreated = [...cBookings].sort((a: any, b: any) =>
                new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );

            // Most recent active booking drives "current program" + coach.
            const activeBookings = cBookings.filter((b: any) =>
                ['confirmed', 'pending', 'CONFIRMED', 'PENDING', 'active'].includes(b.status)
            );
            const latestActive = activeBookings[0] || sortedByCreated[0];

            let programName = 'Not Enrolled';
            let coachName = '';

            if (latestActive) {
                const sp = parseSpecial(latestActive);
                programName = sp.program
                    || latestActive.programName
                    || latestActive.session?.className
                    || 'Class';

                const sessionDoc = sessionMap.get(String(latestActive.sessionId || ''));
                const assigns = Array.isArray(sessionDoc?.coachAssignments) ? sessionDoc.coachAssignments : [];
                const primary = assigns.find((a: any) => a?.role === 'primary') || assigns[0];
                const coach = primary?.coachId;
                if (coach) {
                    coachName = `${coach.firstName || ''} ${coach.lastName || ''}`.trim() || coach.name || '';
                }
                if (!coachName) {
                    coachName = latestActive.coachName || latestActive.session?.coach || '';
                }
            }

            // Progress = attended / total bookings (0 if no bookings yet).
            const totalClasses = cBookings.length;
            const attendedClasses = cAttendance.filter((a: any) =>
                ['checked_in', 'checked_out', 'present'].includes(a.status)
            ).length;
            const progress = totalClasses > 0
                ? Math.round((attendedClasses / totalClasses) * 100)
                : 0;

            // Next upcoming class — first active booking sorted by sessionDate.
            const upcomingForChild = activeBookings
                .filter((b: any) => {
                    const d = new Date(b.sessionDate || b.session?.date || 0);
                    return d.getTime() >= now.getTime();
                })
                .sort((a: any, b: any) =>
                    new Date(a.sessionDate || a.session?.date || 0).getTime() -
                    new Date(b.sessionDate || b.session?.date || 0).getTime()
                );
            let nextClass = '';
            if (upcomingForChild[0]) {
                const next = upcomingForChild[0];
                const d = new Date(next.sessionDate || next.session?.date || 0);
                const dateStr = isNaN(d.getTime()) ? '' : d.toLocaleDateString();
                const timeStr = next.sessionTime?.startTime || next.session?.startTime || '';
                nextClass = [dateStr, timeStr].filter(Boolean).join(' at ');
            }

            return {
                id: c._id,
                name: c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Child',
                age: c.dateOfBirth
                    ? Math.floor((Date.now() - new Date(c.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                    : 0,
                program: programName,
                level: c.level || 'Beginner',
                coach: coachName || 'Not Assigned',
                classes: totalClasses,
                attendedClasses,
                rating: c.rating || null,
                status: c.status || 'ACTIVE',
                progress,
                nextClass,
            };
        };

        res.json({
            success: true,
            data: {
                timeRange,
                stats: {
                    totalChildren: children.length,
                    activePrograms: activeProgramIds.size,
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
                    // Range-scoped metrics — change when timeRange changes
                    rangeSpent,
                    rangeBookings: rangeBookings.length,
                    rangeCompleted,
                    rangeUpcoming,
                    rangeAttendance: rangeAttendance.length,
                },
                alerts,
                children: (children as any[]).map(buildChildCard),
                upcomingClasses: upcoming.map((b: any) => {
                    const sp: Record<string, string> = {};
                    (b.specialRequests || []).forEach((r: string) => {
                        const [k, ...v] = r.split(':');
                        if (k) sp[k] = v.join(':');
                    });
                    return {
                        id: b._id,
                        child: sp.childName || b.childName || b.customer?.name || 'Student',
                        program: sp.program || sp.className || b.programName || b.session?.className || 'Class',
                        coach: b.coachName || b.session?.coach || '',
                        date: b.sessionDate || b.session?.date || b.date || '',
                        time: b.sessionTime?.startTime || b.session?.startTime || sp.timeSlot || b.time || '',
                        location: sp.location || b.session?.location || b.location || '',
                        status: (b.status || 'pending').toLowerCase(),
                        duration: b.bookingType === 'assessment'
                            ? '30 min'
                            : b.bookingType === 'trial'
                                ? '1 hour'
                                : (b.session?.duration || '1 hour'),
                    };
                }),
                recentPayments: recentPay.map((b: any) => {
                    const sp: Record<string, string> = {};
                    (b.specialRequests || []).forEach((r: string) => {
                        const [k, ...v] = r.split(':');
                        if (k) sp[k] = v.join(':');
                    });
                    return {
                        id: b._id,
                        child: sp.childName || b.childName || b.customer?.name || 'Student',
                        program: sp.program || sp.className || b.programName || b.session?.className || 'Program',
                        amount: b.payment?.amount || 0,
                        date: b.createdAt,
                        status: (b.payment?.status || 'pending').toLowerCase(),
                        method: b.payment?.method || 'Card',
                    };
                }),
            }
        });
    } catch (error: any) {
        console.error('Parent dashboard error:', error);
        res.json({
            success: true,
            data: {
                timeRange: (req.query.timeRange as string) || 'today',
                stats: {
                    totalChildren: 0, activePrograms: 0, totalSpent: 0, monthlySpent: 0,
                    pendingPayments: 0, accountBalance: 0, upcomingClasses: 0,
                    completedClasses: 0, totalBookings: 0, attendanceRate: 0,
                    rangeSpent: 0, rangeBookings: 0, rangeCompleted: 0, rangeUpcoming: 0, rangeAttendance: 0,
                },
                alerts: [],
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
                firstName: child.firstName || '',
                lastName: child.lastName || '',
                name: child.fullName || `${child.firstName || ''} ${child.lastName || ''}`.trim(),
                age: child.dateOfBirth ? Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
                dateOfBirth: child.dateOfBirth || '',
                gender: child.gender || '',
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

        // Match bookings created by the parent regardless of which field the
        // creating endpoint used. Bookings made through /bookings/class and
        // /bookings/assessment store `bookedBy` and `familyId`; admin shim
        // sets `familyId` + `participants.childId`; older flows used `userId`
        // or `parentId`.
        const filter: any = {
            $or: [
                { bookedBy: parentId },
                { familyId: parentId },
                { userId: parentId },
                { parentId: parentId },
                { 'participants.childId': parentId },
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

        // Helper: extract values stuffed into specialRequests by the simplified
        // booking service (e.g. "childName:Test Kid"). Keeps the dashboard rich
        // until we move these into proper structured fields.
        const parseSpecial = (b: any): Record<string, string> => {
            const out: Record<string, string> = {};
            (b.specialRequests || []).forEach((r: string) => {
                const [k, ...v] = r.split(':');
                if (k) out[k] = v.join(':');
            });
            return out;
        };

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
                bookings: bookings.map((b: any) => {
                    const sp = parseSpecial(b);
                    const mainParticipant = Array.isArray(b.participants) ? b.participants[0] : null;
                    return {
                        id: b._id || b.bookingId,
                        bookingId: b.bookingId,
                        childId: mainParticipant?.childId || b.childId || null,
                        child: mainParticipant?.name || sp.childName || b.childName || b.customer?.name || 'Student',
                        program: sp.program || sp.className || b.programName || b.session?.className
                            || (b.bookingType === 'assessment'
                                ? 'Assessment'
                                : b.bookingType === 'trial'
                                    ? 'Trial Class'
                                    : 'Class'),
                        coach: b.coachName || b.session?.coach || '',
                        date: b.sessionDate || b.session?.date || b.date || b.createdAt,
                        time: b.sessionTime?.startTime || b.session?.startTime || sp.timeSlot || b.time || '',
                        duration: b.bookingType === 'assessment'
                            ? '30 min'
                            : b.bookingType === 'trial'
                                ? '1 hour'
                                : (b.session?.duration || '1 hour'),
                        location: sp.location || b.session?.location || b.location || '',
                        status: (b.status || 'pending').toLowerCase(),
                        price: b.payment?.amount || 0,
                        currency: b.payment?.currency || 'HKD',
                        type: b.bookingType || b.type || 'regular',
                        sessionId: b.sessionId || null,
                    };
                }),
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
// PAY FOR BOOKING (record payment)
// =============================================
router.post('/payments', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const parentId = getParentId(req);
        const { bookingId, amount, method, notes } = req.body || {};

        if (!bookingId) return res.status(400).json({ success: false, message: 'bookingId is required' });
        if (amount === undefined || amount === null || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'amount must be a positive number' });
        }
        if (!method) return res.status(400).json({ success: false, message: 'Payment method is required' });

        const booking = await Booking.findOne({
            _id: bookingId,
            $or: [{ userId: parentId }, { parentId: parentId }],
        });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        booking.payment = {
            ...(booking.payment || {}),
            amount: Number(amount),
            method,
            status: 'paid',
            paidAt: new Date(),
            notes: notes || '',
        };
        await booking.save();

        res.json({ success: true, data: booking, message: 'Payment recorded successfully' });
    } catch (error: any) {
        console.error('Create payment error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to record payment' });
    }
});

// Get pending bookings that can be paid (helper for Make Payment drawer)
router.get('/payments/pending', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const parentId = getParentId(req);
        const pending = await Booking.find({
            $or: [{ userId: parentId }, { parentId: parentId }],
            'payment.status': { $in: ['pending', 'PENDING', 'unpaid', 'UNPAID'] },
            'payment.amount': { $gt: 0 },
        }).sort({ createdAt: -1 }).limit(50).lean();
        res.json({
            success: true,
            data: pending.map((b: any) => ({
                id: b._id,
                child: b.childName || b.customer?.name || 'Student',
                program: b.programName || b.session?.className || 'Program',
                amount: b.payment?.amount || 0,
                dueDate: b.payment?.dueDate || b.session?.date || b.createdAt,
            })),
        });
    } catch (error: any) {
        console.error('Pending payments error:', error);
        res.json({ success: true, data: [] });
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

// =============================================
// ADD CHILD
// =============================================
router.post('/children', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const parentId = getParentId(req);
        const { firstName, lastName, dateOfBirth, gender, medicalInfo } = req.body;

        if (!firstName || !lastName) {
            return res.status(400).json({ success: false, message: 'First name and last name are required' });
        }

        // Strip whitespace/punctuation from name parts before composing the
        // generated email — the User schema's email regex (^\S+@\S+\.\S+$)
        // rejects spaces, so a name like "Mary Jane" would otherwise fail.
        const sanitize = (s: string) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const localPart = `${sanitize(firstName) || 'child'}.${sanitize(lastName) || 'user'}.${Date.now()}${Math.floor(Math.random() * 1000)}`;

        const child = await User.create({
            firstName,
            lastName,
            dateOfBirth: dateOfBirth || undefined,
            gender: gender ? String(gender).toUpperCase() : undefined,
            role: 'STUDENT',
            status: 'ACTIVE',
            parentId: parentId,
            createdBy: parentId,
            createdByAdmin: true,
            isEmailVerified: true,
            medicalInfo: medicalInfo || {},
            email: `${localPart}@student.local`,
            password: `student-placeholder-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        });

        res.json({
            success: true,
            data: {
                id: child._id,
                firstName: child.firstName || '',
                lastName: child.lastName || '',
                name: `${firstName} ${lastName}`,
                age: dateOfBirth ? Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
                dateOfBirth: child.dateOfBirth || '',
                gender: child.gender || '',
                program: 'Not Enrolled',
                level: 'Beginner',
                status: 'ACTIVE',
                medicalInfo: child.medicalInfo || { allergies: [], medications: [], emergencyContact: '' },
            },
            message: 'Child added successfully'
        });
    } catch (error: any) {
        console.error('Add child error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to add child' });
    }
});

// Update child
router.put('/children/:childId', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const { childId } = req.params;
        const updates = req.body;

        const allowedFields: any = {};
        if (updates.firstName) allowedFields.firstName = updates.firstName;
        if (updates.lastName) allowedFields.lastName = updates.lastName;
        if (updates.dateOfBirth) allowedFields.dateOfBirth = updates.dateOfBirth;
        if (updates.gender) allowedFields.gender = updates.gender;
        if (updates.medicalInfo) allowedFields.medicalInfo = updates.medicalInfo;

        const updated = await User.findByIdAndUpdate(childId, { $set: allowedFields }, { new: true }).lean();
        res.json({ success: true, data: updated });
    } catch (error: any) {
        console.error('Update child error:', error);
        res.status(500).json({ success: false, message: 'Failed to update child' });
    }
});

// =============================================
// RESCHEDULE BOOKING
// =============================================
router.put('/bookings/:bookingId/reschedule', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const { bookingId } = req.params;
        const { newDate, newTime, reason } = req.body;

        if (!newDate || !newTime) {
            return res.status(400).json({ success: false, message: 'newDate and newTime are required' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        const previous = {
            date: booking.session?.date || booking.date,
            time: booking.session?.startTime || booking.time,
        };

        if (booking.session) {
            booking.session.date = newDate;
            booking.session.startTime = newTime;
        } else {
            booking.date = newDate;
            booking.time = newTime;
        }
        booking.rescheduledAt = new Date();
        booking.rescheduleReason = reason || '';
        booking.reschedulePrevious = previous;
        await booking.save();

        res.json({ success: true, data: booking, message: 'Booking rescheduled successfully' });
    } catch (error: any) {
        console.error('Reschedule booking error:', error);
        res.status(500).json({ success: false, message: 'Failed to reschedule booking' });
    }
});

// =============================================
// EDIT BOOKING (notes / special requests / participants)
// =============================================
router.put('/bookings/:bookingId', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const { bookingId } = req.params;
        const updates = req.body || {};
        const allowed: any = {};
        if (typeof updates.childName === 'string') allowed.childName = updates.childName;
        if (typeof updates.specialRequests === 'string') allowed.specialRequests = updates.specialRequests;
        if (typeof updates.notes === 'string') allowed.notes = updates.notes;
        if (Array.isArray(updates.participants)) allowed.participants = updates.participants;

        const updated = await Booking.findByIdAndUpdate(bookingId, { $set: allowed }, { new: true }).lean();
        if (!updated) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, data: updated, message: 'Booking updated successfully' });
    } catch (error: any) {
        console.error('Edit booking error:', error);
        res.status(500).json({ success: false, message: 'Failed to update booking' });
    }
});

// =============================================
// CANCEL BOOKING
// =============================================
router.put('/bookings/:bookingId/cancel', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const { bookingId } = req.params;

        const updated = await Booking.findByIdAndUpdate(
            bookingId,
            { $set: { status: 'cancelled', cancelledAt: new Date(), cancelReason: req.body.reason || 'Cancelled by parent' } },
            { new: true }
        ).lean();

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({ success: true, data: updated, message: 'Booking cancelled successfully' });
    } catch (error: any) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ success: false, message: 'Failed to cancel booking' });
    }
});

// Get single booking
router.get('/bookings/:bookingId', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId).lean();
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({
            success: true,
            data: {
                id: (booking as any)._id,
                child: (booking as any).childName || (booking as any).customer?.name || 'Student',
                program: (booking as any).programName || (booking as any).session?.className || 'Class',
                coach: (booking as any).coachName || (booking as any).session?.coach || '',
                date: (booking as any).session?.date || (booking as any).date || (booking as any).createdAt,
                time: (booking as any).session?.startTime || (booking as any).time || '',
                duration: (booking as any).session?.duration || '1 hour',
                location: (booking as any).session?.location || (booking as any).location || '',
                status: ((booking as any).status || 'pending').toLowerCase(),
                price: (booking as any).payment?.amount || 0,
                paymentStatus: ((booking as any).payment?.status || 'pending').toLowerCase(),
                type: (booking as any).type || 'regular',
                participants: (booking as any).participants || [],
                specialRequests: (booking as any).specialRequests || '',
                cancelReason: (booking as any).cancelReason || '',
            }
        });
    } catch (error: any) {
        console.error('Get booking error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch booking' });
    }
});

// =============================================
// BROWSE CLASSES (parent route — same handler exposed at /bookings/browse for users)
// Returns both real bookable Sessions (admin schedules) AND admin-created Programs
// (catalog entries with isPublic+isActive). Each item carries a `source` field so
// the UI can route the booking flow appropriately:
//   - source: 'session'  -> book via /parent/book-class/<sessionId> (or /bookings/class)
//   - source: 'program'  -> book via /bookings/class with classId=<programId>
// =============================================
router.get('/browse-classes', browseClassesHandler);

// =============================================
// BOOK A CLASS
// =============================================
// POST /api/v1/parent/book-class
// Body: { sessionId, childId, paymentMethod? }
// Resolves the published Session (programId, locationId, date, timeSlot, price)
// and the parent's child (must be a User doc owned by this parent), then writes
// a canonical Booking with all schema-required fields. The matching GET
// /parent/bookings endpoint already $or's bookedBy/familyId/userId/parentId,
// so the booking is visible immediately on the parent's bookings page.
router.post('/book-class', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const { Session } = require('../modules/scheduling/schedule.model');
        const { Program } = require('../modules/programs/program.model');
        const { Location } = require('../modules/bcms/location.model');
        const { User } = require('../modules/iam/user.model');

        const parentId = getParentId(req);
        const { sessionId, childId, paymentMethod } = req.body || {};
        const isMongoId = (s: any) => typeof s === 'string' && /^[a-f\d]{24}$/i.test(s);

        if (!isMongoId(sessionId)) {
            return res.status(400).json({ success: false, message: 'Valid sessionId is required' });
        }
        if (!isMongoId(childId)) {
            return res.status(400).json({ success: false, message: 'Valid childId is required' });
        }

        // 1) Validate child belongs to this parent (registered children are
        //    User docs with role=STUDENT and parentId pointing at the parent).
        const child = await User.findOne({
            _id: childId,
            $or: [{ parentId }, { 'family.parentId': parentId }, { createdBy: parentId }],
            isDeleted: { $ne: true },
        }).select('firstName lastName fullName').lean();
        if (!child) {
            return res.status(403).json({
                success: false,
                message: 'This child is not registered under your account',
            });
        }

        // 2) Resolve the session — must exist, must not be cancelled, must have
        //    capacity, must be published (browse endpoint already filters to
        //    published schedules; we re-check here so direct-URL bookings are
        //    safe too).
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

        // 3) Prevent duplicate booking — if this child is already booked into
        //    this session (active status), don't double-book.
        const existing = await Booking.findOne({
            sessionId,
            'participants.childId': childId,
            status: { $in: ['confirmed', 'pending', 'CONFIRMED', 'PENDING'] },
            isDeleted: { $ne: true },
        }).lean();
        if (existing) {
            return res.status(409).json({
                success: false,
                message: `${child.firstName} is already booked for this class`,
            });
        }

        // 4) Resolve businessUnitId — required by schema. Prefer program's,
        //    fall back to location's.
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

        // 5) Build canonical Booking doc.
        const now = new Date();
        const bookingId = `BK-${now.getTime().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const childFullName = (child.fullName || `${child.firstName || ''} ${child.lastName || ''}`.trim() || 'Student');
        const price = program?.pricingModel?.basePrice ?? 0;
        const currency = program?.pricingModel?.currency || 'HKD';

        const booking = await Booking.create({
            bookingId,
            bookingType: 'drop_in',
            status: 'confirmed',
            familyId: parentId,
            bookedBy: parentId,
            participants: [{
                childId,
                name: childFullName,
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
                `childName:${childFullName}`,
                `program:${program.name || 'Class'}`,
                `location:${location.name || ''}`,
            ],
            createdBy: parentId,
            updatedBy: parentId,
        });

        // 6) Add child to session.enrolledParticipants so the capacity counter
        //    reflects the new booking immediately.
        await Session.updateOne(
            { _id: sessionId },
            { $addToSet: { enrolledParticipants: childId } },
        ).catch((e: any) => console.error('[parent/book-class] enrol update failed', e?.message));

        return res.status(201).json({
            success: true,
            message: 'Class booked successfully',
            data: {
                id: booking._id,
                bookingId: booking.bookingId,
                status: booking.status,
                childId,
                childName: childFullName,
                program: program.name || 'Class',
                location: location.name || '',
                sessionDate: booking.sessionDate,
                sessionTime: booking.sessionTime,
                price,
                currency,
            },
        });
    } catch (error: any) {
        console.error('Book class error:', error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Failed to book class',
        });
    }
});

// =============================================
// WAITLIST
// =============================================
router.get('/waitlist', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const parentId = getParentId(req);

        const waitlistBookings = await Booking.find({
            $or: [{ userId: parentId }, { parentId: parentId }],
            status: { $in: ['waitlisted', 'WAITLISTED', 'waitlist'] }
        }).sort({ createdAt: -1 }).lean();

        res.json({
            success: true,
            data: waitlistBookings.map((b: any, idx: number) => ({
                id: b._id,
                program: b.programName || b.session?.className || 'Class',
                bookingId: b.bookingId || b._id?.toString().slice(-8).toUpperCase(),
                date: b.session?.date || b.date || '',
                time: b.session?.startTime || b.time || '',
                location: b.session?.location || b.location || '',
                participants: b.participants || [{ name: b.childName || 'Student' }],
                position: b.waitlistPosition || idx + 1,
            }))
        });
    } catch (error: any) {
        console.error('Waitlist error:', error);
        res.json({ success: true, data: [] });
    }
});

router.delete('/waitlist/:id', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        await Booking.findByIdAndUpdate(req.params.id, { $set: { status: 'cancelled' } });
        res.json({ success: true, message: 'Removed from waitlist' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to remove from waitlist' });
    }
});

// Join a waitlist (creates a waitlisted Booking)
router.post('/waitlist', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const { Session } = require('../modules/scheduling/schedule.model');
        const parentId = getParentId(req);
        const { sessionId, childId, childName, notes } = req.body || {};

        if (!sessionId) return res.status(400).json({ success: false, message: 'sessionId is required' });
        if (!childName || !String(childName).trim()) return res.status(400).json({ success: false, message: 'childName is required' });

        let sessionDetails: any = null;
        try { sessionDetails = await Session.findById(sessionId).lean(); } catch { sessionDetails = null; }

        const existingWaiting = await Booking.countDocuments({
            sessionId,
            status: { $in: ['waitlisted', 'WAITLISTED'] },
        });

        const entry = await Booking.create({
            userId: parentId,
            parentId: parentId,
            childId: childId || undefined,
            childName,
            sessionId,
            programName: sessionDetails?.className || sessionDetails?.programName || 'Class',
            status: 'waitlisted',
            type: 'waitlist',
            waitlistPosition: existingWaiting + 1,
            specialRequests: notes ? [notes] : [],
            session: sessionDetails ? {
                className: sessionDetails.className,
                date: sessionDetails.date,
                startTime: sessionDetails.startTime,
                location: sessionDetails.location,
                coach: sessionDetails.coach,
            } : undefined,
            payment: { amount: sessionDetails?.price || 0, status: 'pending', method: 'pending' },
            createdAt: new Date(),
        });

        res.json({ success: true, data: { id: entry._id, position: entry.waitlistPosition }, message: 'Added to waitlist' });
    } catch (error: any) {
        console.error('Join waitlist error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to join waitlist' });
    }
});

// =============================================
// MAKEUP CREDITS
// =============================================
router.get('/makeup-credits', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const parentId = getParentId(req);

        // Credits come from cancelled bookings that were paid
        const cancelledPaid = await Booking.find({
            $or: [{ userId: parentId }, { parentId: parentId }],
            status: { $in: ['cancelled', 'CANCELLED'] },
            'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] }
        }).lean();

        const now = new Date();
        const credits = cancelledPaid.map((b: any) => {
            const cancelDate = new Date(b.cancelledAt || b.updatedAt || b.createdAt);
            const expiryDate = new Date(cancelDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days expiry
            const isExpired = expiryDate < now;
            const isUsed = b.creditUsed === true;

            return {
                id: b._id,
                amount: b.payment?.amount || 0,
                originalBooking: b.programName || b.session?.className || 'Class',
                cancelDate: cancelDate.toISOString(),
                expiryDate: expiryDate.toISOString(),
                status: isUsed ? 'used' : isExpired ? 'expired' : 'available',
            };
        });

        const available = credits.filter(c => c.status === 'available');
        const used = credits.filter(c => c.status === 'used');
        const expired = credits.filter(c => c.status === 'expired');

        res.json({
            success: true,
            data: {
                summary: {
                    available: available.reduce((s, c) => s + c.amount, 0),
                    used: used.reduce((s, c) => s + c.amount, 0),
                    expired: expired.reduce((s, c) => s + c.amount, 0),
                },
                credits: { available, used, expired },
            }
        });
    } catch (error: any) {
        console.error('Makeup credits error:', error);
        res.json({
            success: true,
            data: { summary: { available: 0, used: 0, expired: 0 }, credits: { available: [], used: [], expired: [] } }
        });
    }
});

// =============================================
// NUTRITION
// =============================================
router.get('/nutrition', async (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            mealPlans: [],
            recommendations: [
                { id: '1', title: 'Stay Hydrated', description: 'Ensure your child drinks at least 8 glasses of water daily, especially before and after swimming.', priority: 'high' },
                { id: '2', title: 'Protein Rich Meals', description: 'Include lean protein in every meal to support muscle recovery after training sessions.', priority: 'medium' },
                { id: '3', title: 'Pre-Training Snack', description: 'A banana or energy bar 30 minutes before class helps maintain energy levels.', priority: 'medium' },
            ],
        }
    });
});

export default router;
