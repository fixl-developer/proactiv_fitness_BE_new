import { Router, Request, Response } from 'express';

const router = Router();

// Helper: parse startDate/endDate query params (YYYY-MM-DD); fall back to current month
function parseDateRange(req: Request): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
    const now = new Date();
    let start: Date;
    let end: Date;
    if (req.query.startDate && req.query.endDate) {
        start = new Date(String(req.query.startDate));
        end = new Date(String(req.query.endDate));
        // Make end inclusive of full day
        end.setHours(23, 59, 59, 999);
    } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    const rangeMs = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - rangeMs);
    return { start, end, prevStart, prevEnd };
}

// Helper: percent change
function pctChange(current: number, previous: number): number {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return Number(((current - previous) / previous * 100).toFixed(1));
}

// =========================================================================
// GET /admin/dashboard/metrics
// Returns the 10 KPI fields the admin Dashboard page consumes:
//   totalLocations, totalStudents, totalRevenue, staffMembers, activeClasses,
//   revenueGrowth, enrollmentTrend, attendanceRate, staffUtilization, customerSatisfaction
// Also keeps backward-compat fields for older callers.
// =========================================================================
router.get('/metrics', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const { Booking } = require('../modules/booking/booking.model');
        const { Location } = require('../modules/bcms/location.model');
        const { Schedule, Session } = require('../modules/scheduling/schedule.model');
        const { AttendanceRecord } = require('../modules/attendance/attendance.model');
        const { Staff } = require('../modules/staff/staff.model');
        const { FeedbackModel } = require('../modules/feedback/feedback.model');

        const { start, end, prevStart, prevEnd } = parseDateRange(req);
        const STUDENT_ROLES = ['STUDENT', 'USER', 'PARENT'];
        const STAFF_ROLES = ['COACH', 'SUPPORT_STAFF', 'LOCATION_MANAGER', 'REGIONAL_ADMIN', 'FRANCHISE_OWNER'];
        const PAID_STATUSES = ['paid', 'COMPLETED', 'completed'];

        const [
            totalLocations,
            totalStudents,
            staffMembersUsers,
            staffMembersDocs,
            activeSchedules,
            activeSessions,
            revenueAgg,
            prevRevenueAgg,
            newStudentsCurrent,
            newStudentsPrev,
            attendancePresent,
            attendanceTotal,
            satisfactionAgg,
            totalUsers,
            activeUsers,
            totalBookings,
            monthBookings,
            pendingBookings,
            newUsersInRange,
        ] = await Promise.all([
            // Location: schema uses `status: 'ACTIVE'` (LocationStatus enum), no `isActive` field
            Location.countDocuments({ status: { $in: ['ACTIVE', 'active'] }, isDeleted: { $ne: true } }),
            User.countDocuments({ role: { $in: STUDENT_ROLES }, status: 'ACTIVE', isDeleted: { $ne: true } }),
            User.countDocuments({ role: { $in: STAFF_ROLES }, status: 'ACTIVE', isDeleted: { $ne: true } }),
            Staff.countDocuments({ status: { $in: ['ACTIVE', 'active'] }, isDeleted: { $ne: true } }).catch(() => 0),
            // Schedule: ScheduleStatus enum stores lowercase ('active', 'published')
            Schedule.countDocuments({ status: { $in: ['active', 'published', 'ACTIVE', 'PUBLISHED'] }, isDeleted: { $ne: true } }).catch(() => 0),
            Session.countDocuments({ status: { $in: ['scheduled', 'in_progress', 'SCHEDULED', 'IN_PROGRESS'] }, date: { $gte: start, $lte: end }, isDeleted: { $ne: true } }).catch(() => 0),
            Booking.aggregate([
                { $match: { 'payment.status': { $in: PAID_STATUSES }, createdAt: { $gte: start, $lte: end } } },
                { $group: { _id: null, total: { $sum: '$payment.amount' } } },
            ]),
            Booking.aggregate([
                { $match: { 'payment.status': { $in: PAID_STATUSES }, createdAt: { $gte: prevStart, $lte: prevEnd } } },
                { $group: { _id: null, total: { $sum: '$payment.amount' } } },
            ]),
            User.countDocuments({ role: { $in: STUDENT_ROLES }, createdAt: { $gte: start, $lte: end }, isDeleted: { $ne: true } }),
            User.countDocuments({ role: { $in: STUDENT_ROLES }, createdAt: { $gte: prevStart, $lte: prevEnd }, isDeleted: { $ne: true } }),
            AttendanceRecord.countDocuments({ status: { $in: ['CHECKED_IN', 'PRESENT', 'present'] }, createdAt: { $gte: start, $lte: end } }).catch(() => 0),
            AttendanceRecord.countDocuments({ createdAt: { $gte: start, $lte: end } }).catch(() => 0),
            FeedbackModel.aggregate([
                { $match: { rating: { $gte: 1 }, createdAt: { $gte: start, $lte: end } } },
                { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
            ]).catch(() => []),
            User.countDocuments({ isDeleted: { $ne: true } }),
            User.countDocuments({ status: 'ACTIVE', isDeleted: { $ne: true } }),
            Booking.countDocuments({ isDeleted: { $ne: true } }),
            Booking.countDocuments({ createdAt: { $gte: start, $lte: end }, isDeleted: { $ne: true } }),
            // BookingStatus interface stores lowercase ('pending'); old enum used 'PENDING' — cover both
            Booking.countDocuments({ status: { $in: ['pending', 'PENDING'] }, isDeleted: { $ne: true } }),
            User.countDocuments({ createdAt: { $gte: start, $lte: end }, isDeleted: { $ne: true } }),
        ]);

        const totalRevenue = revenueAgg[0]?.total || 0;
        const prevRevenue = prevRevenueAgg[0]?.total || 0;
        const revenueGrowth = pctChange(totalRevenue, prevRevenue);
        const enrollmentTrend = pctChange(newStudentsCurrent, newStudentsPrev);
        const attendanceRate = attendanceTotal > 0
            ? Number((attendancePresent / attendanceTotal * 100).toFixed(1))
            : 0;
        // staffUtilization: scheduled sessions ratio per active staff.
        // Approximation: active sessions in range divided by (active staff * 30) capped at 100.
        const staffMembers = staffMembersDocs > 0 ? staffMembersDocs : staffMembersUsers;
        const staffUtilization = staffMembers > 0
            ? Math.min(100, Number((activeSessions / Math.max(staffMembers * 30, 1) * 100).toFixed(1)))
            : 0;
        const customerSatisfaction = satisfactionAgg[0]?.count > 0
            ? Number(satisfactionAgg[0].avg.toFixed(1))
            : 0;
        const activeClasses = activeSchedules + activeSessions;

        res.json({
            success: true,
            data: {
                // === Frontend Dashboard fields (canonical) ===
                totalLocations,
                totalStudents,
                totalRevenue,
                staffMembers,
                activeClasses,
                revenueGrowth,
                enrollmentTrend,
                attendanceRate,
                staffUtilization,
                customerSatisfaction,

                // === Backward-compat fields (older code paths) ===
                totalUsers,
                activeUsers,
                totalBookings,
                monthBookings,
                monthRevenue: totalRevenue,
                newUsersThisMonth: newUsersInRange,
                pendingBookings,
                bookingGrowth: revenueGrowth,
                activeStudents: totalStudents,
            }
        });
    } catch (error: any) {
        console.error('Error in /admin/dashboard/metrics:', error?.message);
        res.json({
            success: true,
            data: {
                totalLocations: 0, totalStudents: 0, totalRevenue: 0,
                staffMembers: 0, activeClasses: 0,
                revenueGrowth: 0, enrollmentTrend: 0,
                attendanceRate: 0, staffUtilization: 0, customerSatisfaction: 0,
                totalUsers: 0, activeUsers: 0, totalBookings: 0, monthBookings: 0,
                monthRevenue: 0, newUsersThisMonth: 0, pendingBookings: 0,
                bookingGrowth: 0, activeStudents: 0,
            }
        });
    }
});

// =========================================================================
// GET /admin/dashboard/business-metrics  (kept for backward-compat)
// =========================================================================
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
            Location.countDocuments({ status: { $in: ['ACTIVE', 'active'] }, isDeleted: { $ne: true } }),
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
                studentCoachRatio: totalCoaches > 0 ? Number((totalStudents / totalCoaches).toFixed(1)) : 0,
            }
        });
    } catch {
        res.json({ success: true, data: { totalStudents: 0, totalCoaches: 0, activeLocations: 0, monthlyRevenue: 0, totalRevenue: 0, studentCoachRatio: 0 } });
    }
});

// =========================================================================
// GET /admin/dashboard/revenue-trend
// Returns array of { month, revenue, target, bookingCount } — matches RevenueDataPoint
// Honors startDate/endDate when supplied; otherwise covers last `months` (default 6).
// =========================================================================
router.get('/revenue-trend', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const PAID_STATUSES = ['paid', 'COMPLETED', 'completed'];

        let start: Date;
        let end: Date;
        if (req.query.startDate && req.query.endDate) {
            start = new Date(String(req.query.startDate));
            end = new Date(String(req.query.endDate));
            end.setHours(23, 59, 59, 999);
        } else {
            const months = parseInt(req.query.months as string) || 6;
            end = new Date();
            start = new Date(end.getFullYear(), end.getMonth() - months + 1, 1);
        }

        const trend = await Booking.aggregate([
            { $match: { 'payment.status': { $in: PAID_STATUSES }, createdAt: { $gte: start, $lte: end } } },
            { $group: {
                _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                revenue: { $sum: '$payment.amount' },
                bookingCount: { $sum: 1 },
            }},
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formatted = trend.map((t: any) => ({
            month: `${monthNames[t._id.month - 1]} ${t._id.year}`,
            revenue: t.revenue || 0,
            // Target: 10% growth on actual. With no historical target store, this is the practical convention.
            target: Math.round((t.revenue || 0) * 1.1),
            bookingCount: t.bookingCount || 0,
        }));

        res.json({ success: true, data: formatted });
    } catch {
        res.json({ success: true, data: [] });
    }
});

// =========================================================================
// GET /admin/dashboard/student-growth
// Returns array of { month, students } — matches StudentDataPoint
// =========================================================================
router.get('/student-growth', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const STUDENT_ROLES = ['STUDENT', 'USER', 'PARENT'];

        let start: Date;
        let end: Date;
        if (req.query.startDate && req.query.endDate) {
            start = new Date(String(req.query.startDate));
            end = new Date(String(req.query.endDate));
            end.setHours(23, 59, 59, 999);
        } else {
            const months = parseInt(req.query.months as string) || 6;
            end = new Date();
            start = new Date(end.getFullYear(), end.getMonth() - months + 1, 1);
        }

        const growth = await User.aggregate([
            { $match: { role: { $in: STUDENT_ROLES }, createdAt: { $gte: start, $lte: end }, isDeleted: { $ne: true } } },
            { $group: {
                _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                count: { $sum: 1 },
            }},
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formatted = growth.map((g: any) => ({
            month: `${monthNames[g._id.month - 1]} ${g._id.year}`,
            students: g.count,
        }));

        res.json({ success: true, data: formatted });
    } catch {
        res.json({ success: true, data: [] });
    }
});

// =========================================================================
// GET /admin/dashboard/activities
// Returns array of { id, type, action, title, description, time, userId }
// — transforms AuditVault docs into the shape Dashboard's ActivityItem expects.
// =========================================================================
router.get('/activities', async (req: Request, res: Response) => {
    try {
        const { AuditVaultModel } = require('../modules/audit-vault/audit-vault.model');
        const limit = parseInt(req.query.limit as string) || 20;

        const filter: any = {};
        if (req.query.startDate && req.query.endDate) {
            const start = new Date(String(req.query.startDate));
            const end = new Date(String(req.query.endDate));
            end.setHours(23, 59, 59, 999);
            filter.createdAt = { $gte: start, $lte: end };
        }

        const docs = await AuditVaultModel.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const typeFor = (action: string, entityType: string): string => {
            const a = (action || '').toUpperCase();
            const e = (entityType || '').toLowerCase();
            if (a.startsWith('USER_') || e === 'user') return 'user';
            if (a.startsWith('BOOKING_') || e === 'booking') return 'booking';
            if (a.startsWith('STAFF_') || e === 'staff') return 'staff';
            if (a.startsWith('PAYMENT_') || e === 'payment') return 'payment';
            if (a.startsWith('ENROLL') || e === 'enrollment') return 'enrollment';
            return 'system';
        };

        const titleFor = (action: string, entityType: string): string => {
            const verb = (action || 'ACTIVITY').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
            const ent = entityType ? entityType.charAt(0).toUpperCase() + entityType.slice(1) : 'Record';
            return `${verb} ${ent}`.trim();
        };

        const transformed = docs.map((d: any) => ({
            id: String(d._id || d.auditId || ''),
            type: typeFor(d.action, d.entityType),
            action: d.action || 'ACTIVITY',
            title: titleFor(d.action, d.entityType),
            description: d.reason || `${d.entityType || 'record'} ${d.entityId ? `#${String(d.entityId).slice(-6)}` : ''}`.trim(),
            time: (d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt || new Date().toISOString())),
            userId: d.userId ? String(d.userId) : undefined,
        }));

        res.json({ success: true, data: transformed });
    } catch {
        res.json({ success: true, data: [] });
    }
});

// =========================================================================
// GET /admin/dashboard/alerts
// Returns array of { id, type, title, description, priority, createdAt }
// — transforms AuditVault security/error events into Dashboard's AlertItem shape.
// =========================================================================
router.get('/alerts', async (req: Request, res: Response) => {
    try {
        const { AuditVaultModel } = require('../modules/audit-vault/audit-vault.model');

        const ALERT_ACTIONS = ['LOGIN_FAILED', 'UNAUTHORIZED', 'ERROR', 'SECURITY', 'ALERT'];
        const filter: any = { action: { $in: ALERT_ACTIONS } };
        if (req.query.startDate && req.query.endDate) {
            const start = new Date(String(req.query.startDate));
            const end = new Date(String(req.query.endDate));
            end.setHours(23, 59, 59, 999);
            filter.createdAt = { $gte: start, $lte: end };
        } else {
            // default: last 24h
            filter.createdAt = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
        }

        const docs = await AuditVaultModel.find(filter).sort({ createdAt: -1 }).limit(50).lean();

        const typeFor = (action: string): 'warning' | 'info' | 'success' => {
            const a = (action || '').toUpperCase();
            if (a === 'SECURITY' || a === 'UNAUTHORIZED' || a === 'LOGIN_FAILED' || a === 'ERROR') return 'warning';
            if (a === 'ALERT') return 'info';
            return 'info';
        };
        const priorityFor = (action: string): 'high' | 'medium' | 'low' => {
            const a = (action || '').toUpperCase();
            if (a === 'SECURITY' || a === 'UNAUTHORIZED') return 'high';
            if (a === 'ERROR' || a === 'LOGIN_FAILED' || a === 'ALERT') return 'medium';
            return 'low';
        };
        const titleFor = (action: string): string => {
            const map: Record<string, string> = {
                LOGIN_FAILED: 'Failed login attempt',
                UNAUTHORIZED: 'Unauthorized access',
                ERROR: 'System error',
                SECURITY: 'Security event',
                ALERT: 'System alert',
            };
            return map[(action || '').toUpperCase()] || (action || 'Alert');
        };

        const transformed = docs.map((d: any) => ({
            id: String(d._id || d.auditId || ''),
            type: typeFor(d.action),
            title: titleFor(d.action),
            description: d.reason || `${d.entityType || 'system'} event`,
            priority: priorityFor(d.action),
            createdAt: (d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt || new Date().toISOString())),
        }));

        res.json({ success: true, data: transformed });
    } catch {
        res.json({ success: true, data: [] });
    }
});

// =========================================================================
// GET /admin/dashboard/sidebar-stats
// Returns counts for every sidebar section so the dashboard can show
// per-module live numbers (CMS, Users, BCMS, Programs, Operations, Finance,
// Reports, Communications, System, Support).
// All sub-queries are individually try/catch-guarded so a missing collection
// doesn't break the whole response.
// =========================================================================
router.get('/sidebar-stats', async (_req: Request, res: Response) => {
    const safe = async <T>(p: Promise<T>, fallback: T): Promise<T> => {
        try { return await p; } catch { return fallback; }
    };

    try {
        // ── CMS models ──
        const cms = require('../modules/cms/cms.model');
        // ── User / Staff ──
        const { User } = require('../modules/iam/user.model');
        const { Staff } = require('../modules/staff/staff.model');
        // ── BCMS ──
        const { Country } = require('../modules/bcms/country.model');
        const { BusinessUnit } = require('../modules/bcms/business-unit.model');
        const { Region } = require('../modules/bcms/region.model');
        const { Location } = require('../modules/bcms/location.model');
        const { Room } = require('../modules/bcms/room.model');
        const { Term } = require('../modules/bcms/term.model');
        const { HolidayCalendar } = require('../modules/bcms/holiday-calendar.model');
        const { PaymentGatewayModel } = require('../modules/payments/payment-gateway.model');
        // ── Programs / Scheduling ──
        const { Program } = require('../modules/programs/program.model');
        const { Schedule, Session } = require('../modules/scheduling/schedule.model');
        const { Rule } = require('../modules/rules/rule.model');
        // ── Operations ──
        const { AttendanceRecord } = require('../modules/attendance/attendance.model');
        const { Booking } = require('../modules/booking/booking.model');
        // ── Finance ──
        const { PaymentModel } = require('../modules/payments/payments.model');
        const { BillingModel } = require('../modules/billing/billing.model');
        const { FinancialLedgerModel } = require('../modules/financial-ledger/financial-ledger.model');
        // ── Communications ──
        const { NotificationModel } = require('../modules/notifications/notifications.model');
        const { NotificationTemplate } = require('../modules/notifications/notification-template.model');
        const { LeadManagement, Inquiry } = require('../modules/crm/crm.model');
        // ── System ──
        const { FeatureFlagsModel } = require('../modules/feature-flags/feature-flags.model');
        const { AuditVaultModel } = require('../modules/audit-vault/audit-vault.model');
        // ── Support ──
        const { SupportTicket, KnowledgeBaseArticle } = require('../modules/support/support.model');

        const notDeleted = { isDeleted: { $ne: true } };

        // Run all counts in parallel; each one independently guarded.
        const [
            // CMS counters (top-level content collections)
            cmsPages, cmsBlogPosts, cmsTestimonials, cmsFaqs, cmsHeroSlides,
            cmsServices, cmsTeam, cmsJobs, cmsPrograms,
            // User mgmt
            totalUsers, activeUsers, parentUsers, coachUsers, adminUsers,
            // BCMS
            countries, businessUnits, regions, locations, rooms, terms, holidays, paymentGateways,
            // Programs / Scheduling
            programs, schedules, publishedSchedules, sessions, rules,
            // Operations
            staffCount, attendanceTotal, manualBookings,
            // Finance
            paymentsCount, billingCount, ledgerEntries,
            // Communications
            notifications, notificationTemplates, crmLeads, crmInquiries,
            // System
            featureFlags, auditEntries,
            // Support
            openTickets, totalTickets, kbArticles,
        ] = await Promise.all([
            // CMS
            safe(cms.PageContent?.countDocuments(notDeleted) ?? Promise.resolve(0), 0),
            safe(cms.BlogPost?.countDocuments(notDeleted) ?? Promise.resolve(0), 0),
            safe(cms.Testimonial?.countDocuments(notDeleted) ?? Promise.resolve(0), 0),
            safe(cms.FAQItem?.countDocuments(notDeleted) ?? Promise.resolve(0), 0),
            safe(cms.HeroSlide?.countDocuments(notDeleted) ?? Promise.resolve(0), 0),
            safe(cms.ServiceCard?.countDocuments(notDeleted) ?? Promise.resolve(0), 0),
            safe(cms.TeamMember?.countDocuments(notDeleted) ?? Promise.resolve(0), 0),
            safe(cms.JobPosition?.countDocuments(notDeleted) ?? Promise.resolve(0), 0),
            safe(cms.ProgramLevel?.countDocuments(notDeleted) ?? Promise.resolve(0), 0),
            // Users
            safe(User.countDocuments(notDeleted), 0),
            safe(User.countDocuments({ status: 'ACTIVE', ...notDeleted }), 0),
            safe(User.countDocuments({ role: 'PARENT', ...notDeleted }), 0),
            safe(User.countDocuments({ role: 'COACH', ...notDeleted }), 0),
            safe(User.countDocuments({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] }, ...notDeleted }), 0),
            // BCMS
            safe(Country.countDocuments(notDeleted), 0),
            safe(BusinessUnit.countDocuments(notDeleted), 0),
            safe(Region.countDocuments(notDeleted), 0),
            safe(Location.countDocuments({ status: { $in: ['ACTIVE', 'active'] }, ...notDeleted }), 0),
            safe(Room.countDocuments(notDeleted), 0),
            safe(Term.countDocuments(notDeleted), 0),
            safe(HolidayCalendar.countDocuments(notDeleted), 0),
            safe(PaymentGatewayModel.countDocuments(notDeleted), 0),
            // Programs / Scheduling
            safe(Program.countDocuments(notDeleted), 0),
            safe(Schedule.countDocuments(notDeleted), 0),
            safe(Schedule.countDocuments({ status: { $in: ['active', 'published', 'ACTIVE', 'PUBLISHED'] }, ...notDeleted }), 0),
            safe(Session.countDocuments(notDeleted), 0),
            safe(Rule.countDocuments(notDeleted), 0),
            // Operations
            safe(Staff.countDocuments({ status: { $in: ['ACTIVE', 'active'] }, ...notDeleted }), 0),
            safe(AttendanceRecord.countDocuments({}), 0),
            safe(Booking.countDocuments(notDeleted), 0),
            // Finance
            safe(PaymentModel.countDocuments({}), 0),
            safe(BillingModel.countDocuments({}), 0),
            safe(FinancialLedgerModel.countDocuments({}), 0),
            // Communications
            safe(NotificationModel.countDocuments({}), 0),
            safe(NotificationTemplate.countDocuments({}), 0),
            safe(LeadManagement?.countDocuments(notDeleted) ?? Promise.resolve(0), 0),
            safe(Inquiry?.countDocuments(notDeleted) ?? Promise.resolve(0), 0),
            // System
            safe(FeatureFlagsModel.countDocuments({}), 0),
            safe(AuditVaultModel.countDocuments({}), 0),
            // Support
            safe(SupportTicket.countDocuments({ status: { $in: ['open', 'in-progress', 'pending'] } }), 0),
            safe(SupportTicket.countDocuments({}), 0),
            safe(KnowledgeBaseArticle.countDocuments({ status: 'published' }), 0),
        ]);

        const totalCmsItems =
            cmsPages + cmsBlogPosts + cmsTestimonials + cmsFaqs + cmsHeroSlides +
            cmsServices + cmsTeam + cmsJobs + cmsPrograms;

        res.json({
            success: true,
            data: {
                cms: {
                    total: totalCmsItems,
                    pages: cmsPages,
                    blogPosts: cmsBlogPosts,
                    testimonials: cmsTestimonials,
                    faqs: cmsFaqs,
                    heroSlides: cmsHeroSlides,
                    services: cmsServices,
                    teamMembers: cmsTeam,
                    jobPositions: cmsJobs,
                    programLevels: cmsPrograms,
                },
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    parents: parentUsers,
                    coaches: coachUsers,
                    admins: adminUsers,
                },
                bcms: {
                    countries,
                    businessUnits,
                    regions,
                    locations,
                    rooms,
                    terms,
                    holidays,
                    paymentGateways,
                },
                programs: {
                    programs,
                    schedules,
                    publishedSchedules,
                    sessions,
                    rules,
                },
                operations: {
                    activeStaff: staffCount,
                    attendanceRecords: attendanceTotal,
                    manualBookings,
                },
                finance: {
                    payments: paymentsCount,
                    billings: billingCount,
                    ledgerEntries,
                },
                communications: {
                    notifications,
                    templates: notificationTemplates,
                    crmLeads,
                    crmInquiries,
                },
                system: {
                    featureFlags,
                    auditEntries,
                },
                support: {
                    openTickets,
                    totalTickets,
                    knowledgeBaseArticles: kbArticles,
                },
            },
        });
    } catch (error: any) {
        console.error('Error in /admin/dashboard/sidebar-stats:', error?.message);
        res.json({ success: true, data: {} });
    }
});

export default router;
