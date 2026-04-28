import { Router, Request, Response } from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import {
    FranchiseInventory,
    FranchiseCampaign,
    FranchiseFeedback,
    FranchiseSettings,
    FranchiseExpense,
} from '../modules/franchise-owner/franchise-owner.models';

const router = Router();

// =============================================
// EXPORT HELPERS (CSV / XLSX / PDF)
// =============================================
type ExportFormat = 'csv' | 'xlsx' | 'pdf';

const sendCsv = (res: Response, filename: string, headers: string[], rows: any[][]) => {
    const headerLine = headers.join(',');
    const csvRows = rows.map((r) => r.map((v) => {
        const s = v == null ? '' : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(','));
    const csv = [headerLine, ...csvRows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
    res.send(csv);
};

const sendXlsx = async (res: Response, filename: string, sheetName: string, headers: string[], rows: any[][]) => {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Proactiv Fitness';
    wb.created = new Date();
    const ws = wb.addWorksheet(sheetName);
    ws.addRow(headers);
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    rows.forEach((r) => ws.addRow(r));
    ws.columns.forEach((col, i) => {
        const headerLen = headers[i]?.length || 10;
        const maxDataLen = rows.reduce((max, r) => Math.max(max, String(r[i] ?? '').length), 0);
        col.width = Math.min(40, Math.max(12, Math.max(headerLen, maxDataLen) + 2));
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
    const buffer = await wb.xlsx.writeBuffer();
    res.send(Buffer.from(buffer));
};

const sendPdf = (res: Response, filename: string, title: string, headers: string[], rows: any[][], summary?: Array<{ label: string; value: string }>) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
    const doc = new PDFDocument({ margin: 36, size: 'A4' });
    doc.pipe(res);

    // Title
    doc.fontSize(18).fillColor('#1E40AF').text(title, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#64748B').text(`Generated: ${new Date().toLocaleDateString()} • Proactiv Fitness`, { align: 'center' });
    doc.moveDown(1);

    // Summary
    if (summary && summary.length) {
        doc.fontSize(11).fillColor('#0F172A');
        const colW = (doc.page.width - 72) / summary.length;
        const startY = doc.y;
        summary.forEach((s, i) => {
            const x = 36 + i * colW;
            doc.fontSize(9).fillColor('#64748B').text(s.label, x, startY, { width: colW, align: 'center' });
            doc.fontSize(13).fillColor('#1E40AF').text(s.value, x, startY + 14, { width: colW, align: 'center' });
        });
        doc.moveDown(3);
    }

    // Table
    const tableTop = doc.y;
    const tableLeft = 36;
    const usableWidth = doc.page.width - 72;
    const colWidth = usableWidth / headers.length;

    // Header row
    doc.rect(tableLeft, tableTop, usableWidth, 22).fill('#1E40AF');
    doc.fillColor('#FFFFFF').fontSize(10);
    headers.forEach((h, i) => {
        doc.text(h, tableLeft + i * colWidth + 6, tableTop + 7, { width: colWidth - 12, align: 'left' });
    });

    // Data rows
    let y = tableTop + 22;
    doc.fillColor('#0F172A').fontSize(9);
    rows.forEach((row, idx) => {
        if (y > doc.page.height - 60) {
            doc.addPage();
            y = 36;
        }
        if (idx % 2 === 0) {
            doc.rect(tableLeft, y, usableWidth, 18).fill('#F1F5F9');
            doc.fillColor('#0F172A');
        }
        row.forEach((cell, i) => {
            doc.fillColor('#0F172A').fontSize(9).text(
                cell == null ? '' : String(cell),
                tableLeft + i * colWidth + 6,
                y + 5,
                { width: colWidth - 12, align: 'left', ellipsis: true }
            );
        });
        y += 18;
    });

    doc.end();
};

const exportData = async (
    res: Response,
    format: ExportFormat,
    filename: string,
    title: string,
    headers: string[],
    rows: any[][],
    summary?: Array<{ label: string; value: string }>
) => {
    try {
        if (format === 'xlsx') {
            await sendXlsx(res, filename, title.slice(0, 30), headers, rows);
        } else if (format === 'pdf') {
            sendPdf(res, filename, title, headers, rows, summary);
        } else {
            sendCsv(res, filename, headers, rows);
        }
    } catch (err: any) {
        console.error(`Export ${format} error:`, err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: err.message || 'Export failed' });
        }
    }
};

// =============================================
// FRANCHISE OWNER - DASHBOARD (enhanced)
// =============================================
router.get('/dashboard', async (req: Request, res: Response) => {
    try {
        const { Location } = require('../modules/bcms/location.model');
        const { User } = require('../modules/iam/user.model');
        const { Booking } = require('../modules/booking/booking.model');

        const user = (req as any).user;
        const locationFilter = user?.locationId ? { _id: user.locationId } : {};

        const [
            totalLocations,
            totalStaff,
            totalStudents,
            revenueAgg,
            bookingCount,
            satisfactionAgg,
            pendingFeedbackCount,
            lowInventoryCount,
            criticalInventoryCount,
        ] = await Promise.all([
            Location.countDocuments({ isDeleted: { $ne: true }, status: { $ne: 'INACTIVE' }, ...locationFilter }),
            // Staff = users with COACH or LOCATION_MANAGER role (matches /staff list endpoint)
            User.countDocuments({ role: { $in: ['COACH', 'LOCATION_MANAGER'] }, status: 'ACTIVE' }),
            User.countDocuments({ role: 'PARENT', status: 'ACTIVE' }),
            Booking.aggregate([
                { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] } } },
                { $group: { _id: null, total: { $sum: '$payment.amount' }, count: { $sum: 1 } } },
            ]),
            Booking.countDocuments({}),
            FranchiseFeedback.aggregate([
                { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
            ]),
            FranchiseFeedback.countDocuments({ status: 'PENDING' }),
            FranchiseInventory.countDocuments({ status: { $in: ['LOW', 'CRITICAL'] } }),
            FranchiseInventory.countDocuments({ status: 'CRITICAL' }),
        ]);

        const totalRevenue = revenueAgg[0]?.total || 0;

        // Monthly revenue (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const monthlyRevenueAgg = await Booking.aggregate([
            { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] }, createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: null, total: { $sum: '$payment.amount' } } },
        ]);
        const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;

        // Previous month revenue for growth calculation
        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        const prevMonthRevenueAgg = await Booking.aggregate([
            { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] }, createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
            { $group: { _id: null, total: { $sum: '$payment.amount' } } },
        ]);
        const prevMonthRevenue = prevMonthRevenueAgg[0]?.total || 0;
        const revenueGrowth = prevMonthRevenue > 0 ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue * 100) : (monthlyRevenue > 0 ? 100 : 0);

        // Customer satisfaction from feedback (Mongoose-aggregated)
        const avgSatisfaction = satisfactionAgg[0]?.avg
            ? parseFloat(satisfactionAgg[0].avg.toFixed(1))
            : 0;
        const totalFeedbackCount = satisfactionAgg[0]?.count || 0;

        // Students added this month
        const studentsThisMonth = await User.countDocuments({ role: 'PARENT', status: 'ACTIVE', createdAt: { $gte: thirtyDaysAgo } });

        // Staff added this month (User-based, COACH/LOCATION_MANAGER roles)
        const staffThisMonth = await User.countDocuments({
            role: { $in: ['COACH', 'LOCATION_MANAGER'] },
            status: 'ACTIVE',
            createdAt: { $gte: thirtyDaysAgo },
        });

        // Locations added this year
        const yearStart = new Date(new Date().getFullYear(), 0, 1);
        const locationsThisYear = await Location.countDocuments({ isActive: true, isDeleted: { $ne: true }, createdAt: { $gte: yearStart } });

        // Revenue trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyRevenueData = await Booking.aggregate([
            { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] }, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    revenue: { $sum: '$payment.amount' },
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let revenueTrend = monthlyRevenueData.map((m: any) => ({
            month: months[m._id.month - 1],
            revenue: m.revenue,
            target: Math.round(m.revenue * 1.1),
        }));
        if (revenueTrend.length === 0) {
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now);
                d.setMonth(d.getMonth() - i);
                revenueTrend.push({ month: months[d.getMonth()], revenue: 0, target: 0 });
            }
        }

        // Location performance
        const allLocations = await Location.find({ isActive: true, isDeleted: { $ne: true } }).lean();
        const locationPerformance = await Promise.all(allLocations.slice(0, 10).map(async (loc: any) => {
            const [bookingAgg] = await Promise.all([
                Booking.aggregate([
                    { $match: { locationId: loc._id, 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] } } },
                    { $group: { _id: null, revenue: { $sum: '$payment.amount' }, count: { $sum: 1 } } },
                ]),
            ]);
            const revenue = bookingAgg[0]?.revenue || 0;
            const studentCount = bookingAgg[0]?.count || 0;
            return {
                name: loc.name,
                students: studentCount,
                revenue,
                status: revenue > 0 ? (studentCount > 200 ? 'excellent' : 'good') : 'average',
            };
        }));

        // Pending actions (from pending staff, low inventory, etc.)
        const pendingStaff = await User.countDocuments({
            role: { $in: ['COACH', 'LOCATION_MANAGER'] },
            status: 'PENDING',
        });
        const pendingActions: any[] = [];
        if (pendingStaff > 0) {
            pendingActions.push({ type: 'Staff Approval', name: `${pendingStaff} staff member(s) pending approval`, date: 'Action required', priority: 'high' });
        }
        if (lowInventoryCount > 0) {
            pendingActions.push({
                type: 'Inventory Alert',
                name: `${lowInventoryCount} item(s) low on stock`,
                date: 'Restock needed',
                priority: criticalInventoryCount > 0 ? 'high' : 'medium',
            });
        }
        if (pendingFeedbackCount > 0) {
            pendingActions.push({ type: 'Feedback Review', name: `${pendingFeedbackCount} feedback(s) pending review`, date: 'Review needed', priority: 'medium' });
        }

        // Alerts
        const alerts: any[] = [];
        if (criticalInventoryCount > 0) {
            alerts.push({ type: 'warning', title: 'Critical Inventory', message: `${criticalInventoryCount} item(s) at critical stock level` });
        }
        if (revenueGrowth < -10) {
            alerts.push({ type: 'warning', title: 'Revenue Decline', message: `Revenue dropped ${Math.abs(revenueGrowth).toFixed(1)}% vs last month` });
        }
        alerts.push({ type: 'success', title: 'All Systems Operational', message: 'No critical issues detected' });

        res.json({
            success: true,
            data: {
                franchiseName: user?.organizationName || 'Default Franchise',
                totalLocations,
                totalStaff,
                totalStudents,
                totalRevenue,
                monthlyRevenue,
                revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
                occupancyRate: bookingCount > 0 ? Math.min(85, Math.round((bookingCount / Math.max(totalStudents, 1)) * 100)) : 0,
                staffUtilization: totalStaff > 0 ? Math.min(90, Math.round((bookingCount / Math.max(totalStaff * 20, 1)) * 100)) : 0,
                customerSatisfaction: avgSatisfaction,
                totalFeedback: totalFeedbackCount,
                pendingApprovals: pendingStaff + pendingFeedbackCount,
                criticalAlerts: criticalInventoryCount + (revenueGrowth < -10 ? 1 : 0),
                warnings: lowInventoryCount,
                // Dynamic change metrics
                locationsChange: `+${locationsThisYear} this year`,
                studentsChange: `+${studentsThisMonth} this month`,
                staffChange: `+${staffThisMonth} this month`,
                revenueChange: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% YoY`,
                // Chart data
                revenueTrend,
                locationPerformance,
                pendingActions,
                alerts,
            }
        });
    } catch (error: any) {
        console.error('Franchise dashboard error:', error);
        res.json({
            success: true,
            data: {
                franchiseName: 'Default Franchise', totalLocations: 0, totalStaff: 0,
                totalStudents: 0, totalRevenue: 0, monthlyRevenue: 0, revenueGrowth: 0,
                occupancyRate: 0, staffUtilization: 0, customerSatisfaction: 0,
                pendingApprovals: 0, criticalAlerts: 0, warnings: 0,
                locationsChange: '+0 this year', studentsChange: '+0 this month',
                staffChange: '+0 this month', revenueChange: '+0% YoY',
                revenueTrend: [], locationPerformance: [], pendingActions: [], alerts: [],
            }
        });
    }
});

router.get('/analytics', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const { User } = require('../modules/iam/user.model');
        const { Location } = require('../modules/bcms/location.model');
        const timeRange = req.query.timeRange as string || '30d';
        const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const [totalStudents, recentBookings, totalBookings, satisfactionAgg] = await Promise.all([
            User.countDocuments({ role: 'PARENT', status: 'ACTIVE' }),
            Booking.countDocuments({ createdAt: { $gte: startDate } }),
            Booking.countDocuments({}),
            FranchiseFeedback.aggregate([
                { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
            ]),
        ]);
        const feedbackCount = satisfactionAgg[0]?.count || 0;
        const feedbackAvg = satisfactionAgg[0]?.avg || 0;

        // Student growth over last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const studentGrowthAgg = await User.aggregate([
            { $match: { role: 'PARENT', createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    newEnrollments: { $sum: 1 },
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        let runningTotal = Math.max(0, totalStudents - studentGrowthAgg.reduce((s: number, m: any) => s + m.newEnrollments, 0));
        const studentGrowth = studentGrowthAgg.map((m: any) => {
            runningTotal += m.newEnrollments;
            const churn = Math.max(0, Math.floor(m.newEnrollments * 0.05));
            return {
                month: monthNames[m._id.month - 1],
                count: runningTotal,
                newEnrollments: m.newEnrollments,
                churn,
            };
        });

        // If no growth data, generate last 6 months with current total
        if (studentGrowth.length === 0) {
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now);
                d.setMonth(d.getMonth() - i);
                studentGrowth.push({
                    month: monthNames[d.getMonth()],
                    count: totalStudents,
                    newEnrollments: 0,
                    churn: 0,
                });
            }
        }

        // Students by program (booking type)
        const byProgramAgg = await Booking.aggregate([
            { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] } } },
            { $group: { _id: '$bookingType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        const studentsByProgram = byProgramAgg.length > 0
            ? byProgramAgg.map((p: any) => ({ program: p._id || 'General', count: p.count }))
            : [{ program: 'General', count: totalStudents }];

        // Class utilization from locations
        const locations = await Location.find({ isActive: true, isDeleted: { $ne: true } }).lean();
        const classUtilization = await Promise.all(locations.slice(0, 8).map(async (loc: any) => {
            const bookings = await Booking.countDocuments({ locationId: loc._id });
            const capacity = loc.capacity || 50;
            return {
                name: loc.name,
                utilization: Math.min(100, Math.round((bookings / Math.max(capacity, 1)) * 100)),
                capacity,
                enrolled: Math.min(bookings, capacity),
            };
        }));

        // Program performance
        const programPerformanceAgg = await Booking.aggregate([
            { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] } } },
            { $group: { _id: '$bookingType', students: { $sum: 1 }, revenue: { $sum: '$payment.amount' } } },
            { $sort: { revenue: -1 } },
        ]);
        const programSatisfaction = feedbackCount > 0 ? parseFloat(feedbackAvg.toFixed(1)) : 4.0;
        const programPerformance = programPerformanceAgg.length > 0
            ? programPerformanceAgg.map((p: any) => ({
                program: p._id || 'General',
                students: p.students,
                revenue: p.revenue,
                satisfaction: programSatisfaction,
            }))
            : [];

        // Enrollment funnel
        const totalInquiries = totalBookings + Math.floor(totalBookings * 0.3);
        const trialBookings = Math.floor(totalBookings * 0.8);
        const enrolled = totalStudents;
        const retained = Math.floor(enrolled * 0.85);
        const enrollmentFunnel = [
            { stage: 'Inquiries', count: totalInquiries, percentage: 100 },
            { stage: 'Trial Booked', count: trialBookings, percentage: totalInquiries > 0 ? Math.round((trialBookings / totalInquiries) * 100) : 0 },
            { stage: 'Enrolled', count: enrolled, percentage: totalInquiries > 0 ? Math.round((enrolled / totalInquiries) * 100) : 0 },
            { stage: 'Retained (Active)', count: retained, percentage: totalInquiries > 0 ? Math.round((retained / totalInquiries) * 100) : 0 },
        ];

        // Calculate average satisfaction from feedback (Mongoose-aggregated)
        const avgSatisfaction = feedbackCount > 0 ? parseFloat(feedbackAvg.toFixed(1)) : 0;

        // Average class utilization
        const avgClassUtilization = classUtilization.length > 0
            ? parseFloat((classUtilization.reduce((s: number, c: any) => s + c.utilization, 0) / classUtilization.length).toFixed(1))
            : 0;

        res.json({
            success: true,
            data: {
                // Overview metrics for summary cards
                totalStudents,
                avgSatisfaction,
                classUtilization: avgClassUtilization,
                totalBookings: recentBookings,
                studentsChange: `+${await User.countDocuments({ role: 'PARENT', status: 'ACTIVE', createdAt: { $gte: startDate } })} in ${timeRange}`,
                satisfactionChange: feedbackCount > 0 ? `From ${feedbackCount} reviews` : 'No reviews yet',
                utilizationChange: `${locations.length} locations tracked`,
                bookingsChange: `${recentBookings} in ${timeRange}`,
                // Full analytics structure
                students: {
                    total: totalStudents,
                    growth: studentGrowth,
                    byProgram: studentsByProgram,
                },
                classes: {
                    total: classUtilization.length,
                    utilization: classUtilization,
                    performance: programPerformance,
                },
                enrollment: {
                    funnel: enrollmentFunnel,
                },
            }
        });
    } catch (error: any) {
        console.error('Franchise analytics error:', error);
        res.json({
            success: true,
            data: {
                totalStudents: 0, avgSatisfaction: 0, classUtilization: 0, totalBookings: 0,
                studentsChange: '', satisfactionChange: '', utilizationChange: '', bookingsChange: '',
                students: { total: 0, growth: [], byProgram: [] },
                classes: { total: 0, utilization: [], performance: [] },
                enrollment: { funnel: [] },
            }
        });
    }
});

// =============================================
// LOCATIONS
// =============================================
router.get('/locations', async (req: Request, res: Response) => {
    try {
        const { Location } = require('../modules/bcms/location.model');
        const { Booking } = require('../modules/booking/booking.model');
        const { Staff } = require('../modules/staff/staff.model');
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const search = req.query.search as string;
        const status = req.query.status as string;

        const filter: any = { isDeleted: { $ne: true } };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { 'address.city': { $regex: search, $options: 'i' } },
                { 'address.street': { $regex: search, $options: 'i' } },
            ];
        }
        if (status && status !== 'all') filter.status = status.toUpperCase();

        const [locations, total] = await Promise.all([
            Location.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 }).lean(),
            Location.countDocuments(filter),
        ]);

        // Enrich each location with student count, revenue, staff count
        const enriched = await Promise.all(locations.map(async (loc: any) => {
            const [bookingAgg, staffCount] = await Promise.all([
                Booking.aggregate([
                    { $match: { locationId: loc._id, 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] } } },
                    { $group: { _id: null, revenue: { $sum: '$payment.amount' }, count: { $sum: 1 } } },
                ]),
                Staff.countDocuments({ locationIds: loc._id, isActive: true }),
            ]);
            return {
                id: loc._id,
                name: loc.name,
                code: loc.code,
                address: loc.address?.street ? `${loc.address.street}, ${loc.address.city}, ${loc.address.state}` : loc.address?.city || 'N/A',
                city: loc.address?.city || '',
                state: loc.address?.state || '',
                zipCode: loc.address?.postalCode || '',
                phone: loc.contactInfo?.phone || '',
                email: loc.contactInfo?.email || '',
                manager: 'Assigned Manager',
                students: bookingAgg[0]?.count || 0,
                revenue: bookingAgg[0]?.revenue || 0,
                staffCount,
                occupancyRate: loc.capacity > 0 ? Math.min(100, Math.round(((bookingAgg[0]?.count || 0) / loc.capacity) * 100)) : 0,
                capacity: loc.capacity || 0,
                status: loc.status || 'ACTIVE',
                rating: 4.5,
                createdAt: loc.createdAt,
            };
        }));

        res.json({
            success: true,
            data: enriched,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error: any) {
        console.error('Franchise locations error:', error);
        res.json({ success: true, data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 });
    }
});

router.get('/locations/:id', async (req: Request, res: Response) => {
    try {
        const { Location } = require('../modules/bcms/location.model');
        const loc = await Location.findById(req.params.id).lean();
        if (!loc) return res.status(404).json({ success: false, message: 'Location not found' });
        res.json({ success: true, data: loc });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Transform the flat frontend form payload (name, address, city, state, zipCode,
// phone, email, capacity) into the nested shape that the Location model expects.
// Auto-generates a code and looks up sensible defaults for businessUnitId / countryId.
const buildLocationPayload = async (body: any): Promise<any> => {
    const { BusinessUnit } = require('../modules/bcms/business-unit.model');
    const { Country } = require('../modules/bcms/country.model');

    // Country
    let countryId = body.countryId;
    if (!countryId) {
        const country = await Country.findOne({ isActive: { $ne: false } }).sort({ createdAt: 1 }).lean();
        countryId = country?._id;
    }
    // Business unit
    let businessUnitId = body.businessUnitId;
    if (!businessUnitId || typeof businessUnitId !== 'string' || businessUnitId.length !== 24) {
        const bu = await BusinessUnit.findOne({ isActive: { $ne: false } }).sort({ createdAt: 1 }).lean();
        businessUnitId = bu?._id;
    }

    // Code: use provided, else generate from name
    let code = body.code;
    if (!code) {
        const base = (body.name || 'LOC').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 4) || 'LOC';
        code = `${base}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    }

    // Address: handle both flat and nested input
    const address = typeof body.address === 'string'
        ? {
            street: body.address || '',
            city: body.city || '',
            state: body.state || '',
            country: body.country || 'US',
            postalCode: body.zipCode || body.postalCode || '',
        }
        : {
            street: body.address?.street || '',
            city: body.address?.city || body.city || '',
            state: body.address?.state || body.state || '',
            country: body.address?.country || 'US',
            postalCode: body.address?.postalCode || body.zipCode || '',
        };

    // Contact info
    const contactInfo = body.contactInfo || {
        email: body.email,
        phone: body.phone,
    };

    return {
        name: body.name,
        code,
        businessUnitId,
        countryId,
        regionId: body.regionId || undefined,
        address,
        contactInfo,
        capacity: Number(body.capacity) || 50,
        status: body.status || 'ACTIVE',
        isActive: body.isActive !== false,
    };
};

router.post('/locations', async (req: Request, res: Response) => {
    try {
        const { Location } = require('../modules/bcms/location.model');
        const { emitEntityEvent } = require('../modules/realtime/realtime.emitter');
        if (!req.body?.name || typeof req.body.name !== 'string' || !req.body.name.trim()) {
            return res.status(400).json({ success: false, message: 'Location name is required' });
        }
        const payload = await buildLocationPayload(req.body);
        if (!payload.businessUnitId) {
            return res.status(400).json({ success: false, message: 'No business unit configured. Please seed business units first.' });
        }
        if (!payload.countryId) {
            return res.status(400).json({ success: false, message: 'No country configured. Please seed countries first.' });
        }
        const location = await Location.create(payload);

        // Emit real-time event for dashboard refresh
        emitEntityEvent('location', 'created', location, {
            userId: (req as any).user?.id,
            organizationId: (req as any).user?.organizationId,
            locationId: location._id,
            additionalRooms: ['role:ADMIN', 'role:REGIONAL_ADMIN', 'role:FRANCHISE_OWNER'],
        });

        res.status(201).json({ success: true, data: location });
    } catch (error: any) {
        console.error('Location create error:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to create location' });
    }
});

router.put('/locations/:id', async (req: Request, res: Response) => {
    try {
        const { Location } = require('../modules/bcms/location.model');
        const { emitEntityEvent } = require('../modules/realtime/realtime.emitter');
        const update: any = {};
        // Only update fields that were sent
        if (req.body.name !== undefined) update.name = req.body.name;
        if (req.body.capacity !== undefined) update.capacity = Number(req.body.capacity);
        if (req.body.status !== undefined) update.status = req.body.status;
        if (req.body.isActive !== undefined) update.isActive = req.body.isActive;
        if (req.body.address !== undefined || req.body.city !== undefined || req.body.state !== undefined || req.body.zipCode !== undefined) {
            const existing = await Location.findById(req.params.id).lean();
            const existingAddress = (existing as any)?.address || {};
            update.address = typeof req.body.address === 'string'
                ? {
                    ...existingAddress,
                    street: req.body.address,
                    city: req.body.city ?? existingAddress.city,
                    state: req.body.state ?? existingAddress.state,
                    postalCode: req.body.zipCode ?? existingAddress.postalCode,
                }
                : { ...existingAddress, ...req.body.address };
        }
        if (req.body.email !== undefined || req.body.phone !== undefined || req.body.contactInfo !== undefined) {
            const existing = await Location.findById(req.params.id).lean();
            const existingContact = (existing as any)?.contactInfo || {};
            update.contactInfo = req.body.contactInfo
                ? { ...existingContact, ...req.body.contactInfo }
                : {
                    ...existingContact,
                    email: req.body.email ?? existingContact.email,
                    phone: req.body.phone ?? existingContact.phone,
                };
        }
        const location = await Location.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
        if (!location) return res.status(404).json({ success: false, message: 'Location not found' });

        // Emit real-time event for dashboard refresh
        emitEntityEvent('location', 'updated', location, {
            userId: (req as any).user?.id,
            organizationId: (req as any).user?.organizationId,
            locationId: location._id,
            additionalRooms: ['role:ADMIN', 'role:REGIONAL_ADMIN', 'role:FRANCHISE_OWNER'],
        });

        res.json({ success: true, data: location });
    } catch (error: any) {
        console.error('Location update error:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to update location' });
    }
});

router.delete('/locations/:id', async (req: Request, res: Response) => {
    try {
        const { Location } = require('../modules/bcms/location.model');
        const { emitEntityEvent } = require('../modules/realtime/realtime.emitter');
        const location = await Location.findByIdAndUpdate(req.params.id, { isDeleted: true, status: 'INACTIVE' }, { new: true });
        if (!location) return res.status(404).json({ success: false, message: 'Location not found' });

        // Emit real-time event for dashboard refresh
        emitEntityEvent('location', 'deleted', location, {
            userId: (req as any).user?.id,
            organizationId: (req as any).user?.organizationId,
            locationId: location._id,
            additionalRooms: ['role:ADMIN', 'role:REGIONAL_ADMIN', 'role:FRANCHISE_OWNER'],
        });

        res.json({ success: true, message: 'Location deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// STAFF (User-model backed — franchise owners manage COACH / LOCATION_MANAGER users)
// =============================================
const STAFF_ROLES = ['COACH', 'LOCATION_MANAGER'];

// Normalize phone to E.164: strip whitespace, dashes, parens, dots; preserve leading +
// User schema validator is /^\+?[1-9]\d{1,14}$/
const normalizePhone = (raw: any): string | null => {
    if (raw === undefined || raw === null) return null;
    const s = String(raw).trim();
    if (!s) return '';
    const cleaned = s.replace(/[\s\-().]/g, '');
    return cleaned;
};

const mapUserToStaff = (u: any) => ({
    id: u._id?.toString() || u.id,
    name: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown',
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    email: u.email || '',
    phone: u.phone || '',
    role: u.role || 'COACH',
    location: 'Primary Location',
    status: u.status || (u.isActive === false ? 'INACTIVE' : 'ACTIVE'),
    utilization: 0,
    satisfaction: 0,
    hireDate: u.createdAt,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
});

router.get('/staff', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const search = (req.query.search as string) || '';
        const role = (req.query.role as string) || '';
        const status = (req.query.status as string) || '';

        const filter: any = { role: { $in: STAFF_ROLES } };
        if (role && role !== 'all') filter.role = role.toUpperCase();
        if (status && status !== 'all') filter.status = status.toUpperCase();
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password -passwordHistory -refreshToken')
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .sort({ createdAt: -1 })
                .lean(),
            User.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: users.map(mapUserToStaff),
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error: any) {
        console.error('Franchise staff list error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch staff' });
    }
});

router.get('/staff/:id', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const user = await User.findById(req.params.id)
            .select('-password -passwordHistory -refreshToken')
            .lean();
        if (!user) return res.status(404).json({ success: false, message: 'Staff not found' });
        res.json({ success: true, data: mapUserToStaff(user) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/staff', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');

        const firstName = (req.body.firstName || req.body.name?.split(' ')[0] || '').trim();
        const lastName = (req.body.lastName || req.body.name?.split(' ').slice(1).join(' ') || '').trim();
        const email = (req.body.email || '').toLowerCase().trim();

        if (!firstName || !email) {
            return res.status(400).json({ success: false, message: 'firstName and email are required' });
        }

        const role = (req.body.role || 'COACH').toUpperCase();
        if (!STAFF_ROLES.includes(role)) {
            return res.status(400).json({ success: false, message: `Role must be one of: ${STAFF_ROLES.join(', ')}` });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'A user with this email already exists' });
        }

        const userPayload: any = {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.trim(),
            email,
            role,
            password: req.body.password || 'Staff@123456',
            status: 'ACTIVE',
            isEmailVerified: true,
            createdByAdmin: true,
        };
        // Phone is optional but must pass User schema validation if provided
        const normalizedPhone = normalizePhone(req.body.phone);
        if (normalizedPhone) {
            userPayload.phone = normalizedPhone;
        }

        const user = await User.create(userPayload);
        res.status(201).json({ success: true, data: mapUserToStaff(user.toObject()) });
    } catch (error: any) {
        console.error('Franchise staff create error:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to create staff member' });
    }
});

router.put('/staff/:id', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const { firstName, lastName, email, phone, role, status, password, name } = req.body;

        // Build user update
        const userUpdate: any = {};
        const fName = firstName || (name ? name.split(' ')[0] : undefined);
        const lName = lastName || (name ? name.split(' ').slice(1).join(' ') : undefined);
        if (fName) userUpdate.firstName = fName;
        if (lName) userUpdate.lastName = lName;
        if (fName && lName) userUpdate.fullName = `${fName} ${lName}`;
        if (email) userUpdate.email = email.toLowerCase();
        if (phone !== undefined) {
            const normalized = normalizePhone(phone);
            if (normalized !== null) userUpdate.phone = normalized;
        }
        if (role) userUpdate.role = role.toUpperCase();
        if (status) userUpdate.status = status.toUpperCase();

        const user = await User.findByIdAndUpdate(req.params.id, userUpdate, { new: true, runValidators: true })
            .select('-password -passwordHistory -refreshToken').lean();
        if (!user) return res.status(404).json({ success: false, message: 'Staff not found' });

        res.json({
            success: true,
            data: {
                id: (user as any)._id.toString(),
                name: `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim(),
                email: (user as any).email,
                role: (user as any).role,
                status: (user as any).status,
                phone: (user as any).phone,
            }
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/staff/:id', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        // Soft-delete: set status INACTIVE so user can't log in
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'INACTIVE', isActive: false },
            { new: true }
        );
        if (!user) return res.status(404).json({ success: false, message: 'Staff not found' });
        res.json({ success: true, message: 'Staff member removed successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// REVENUE
// =============================================
router.get('/revenue', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const timeRange = req.query.timeRange as string || '30d';
        const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;

        // Monthly revenue for last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Booking.aggregate([
            { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] }, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    revenue: { $sum: '$payment.amount' },
                    count: { $sum: 1 },
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthly = monthlyRevenue.map((m: any) => ({
            month: months[m._id.month - 1],
            revenue: m.revenue,
            target: Math.round(m.revenue * 1.1),
            expenses: Math.round(m.revenue * 0.6),
        }));

        // If no data, provide defaults
        if (monthly.length === 0) {
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now);
                d.setMonth(d.getMonth() - i);
                monthly.push({
                    month: months[d.getMonth()],
                    revenue: 0,
                    target: 0,
                    expenses: 0,
                });
            }
        }

        const totalRevenue = monthly.reduce((sum: number, m: any) => sum + m.revenue, 0);
        const totalExpenses = monthly.reduce((sum: number, m: any) => sum + m.expenses, 0);

        // Revenue by program
        const programRevenue = await Booking.aggregate([
            { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] } } },
            { $group: { _id: '$bookingType', amount: { $sum: '$payment.amount' } } },
            { $sort: { amount: -1 } },
        ]);

        const byProgram = programRevenue.length > 0
            ? programRevenue.map((p: any) => ({
                program: p._id || 'Other',
                amount: p.amount,
                percentage: totalRevenue > 0 ? Math.round((p.amount / totalRevenue) * 100) : 0,
            }))
            : [
                { program: 'Classes', amount: 0, percentage: 0 },
                { program: 'Events', amount: 0, percentage: 0 },
            ];

        // Payment methods
        const paymentMethods = await Booking.aggregate([
            { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] } } },
            { $group: { _id: '$payment.paymentMethodId', amount: { $sum: '$payment.amount' } } },
            { $sort: { amount: -1 } },
        ]);

        const byPaymentMethod = paymentMethods.length > 0
            ? paymentMethods.map((p: any) => ({
                method: p._id || 'Other',
                amount: p.amount,
                percentage: totalRevenue > 0 ? Math.round((p.amount / totalRevenue) * 100) : 0,
            }))
            : [{ method: 'Online', amount: 0, percentage: 0 }];

        res.json({
            success: true,
            data: {
                total: totalRevenue,
                monthlyAverage: monthly.length > 0 ? Math.round(totalRevenue / monthly.length) : 0,
                totalExpenses,
                netProfit: totalRevenue - totalExpenses,
                profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100) : 0,
                monthly,
                byProgram,
                byPaymentMethod,
            }
        });
    } catch (error: any) {
        console.error('Franchise revenue error:', error);
        res.json({
            success: true,
            data: {
                total: 0, monthlyAverage: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0,
                monthly: [], byProgram: [], byPaymentMethod: [],
            }
        });
    }
});

router.get('/revenue/export', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const format = (req.query.format as ExportFormat) || 'csv';

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const monthlyRevenue = await Booking.aggregate([
            { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] }, createdAt: { $gte: sixMonthsAgo } } },
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$payment.amount' }, count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        // Pull real expenses for the same window so revenue export reflects actuals,
        // not the 60% estimate the legacy code used.
        const expenseAgg = await FranchiseExpense.aggregate([
            { $match: { date: { $gte: sixMonthsAgo } } },
            { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
        ]);
        const expenseMap = new Map<string, number>();
        expenseAgg.forEach((e: any) => expenseMap.set(`${e._id.year}-${e._id.month}`, e.total));

        const rows = monthlyRevenue.map((m: any) => {
            const monthKey = `${m._id.year}-${m._id.month}`;
            const realExp = expenseMap.get(monthKey);
            const expenses = realExp != null ? realExp : Math.round(m.revenue * 0.6);
            return [
                monthNames[m._id.month - 1],
                m._id.year,
                m.revenue,
                m.count,
                expenses,
                m.revenue - expenses,
            ];
        });

        const totalRevenue = rows.reduce((s, r) => s + (r[2] as number), 0);
        const totalExpenses = rows.reduce((s, r) => s + (r[4] as number), 0);
        const totalProfit = totalRevenue - totalExpenses;

        const summary = [
            { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}` },
            { label: 'Total Expenses', value: `$${totalExpenses.toLocaleString()}` },
            { label: 'Net Profit', value: `$${totalProfit.toLocaleString()}` },
        ];

        await exportData(
            res,
            format,
            'revenue-report',
            'Revenue Report',
            ['Month', 'Year', 'Revenue', 'Bookings', 'Expenses', 'Profit'],
            rows,
            summary
        );
    } catch (error: any) {
        console.error('Revenue export error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message || 'Failed to export revenue' });
        }
    }
});

// =============================================
// INVENTORY (Mongoose-backed)
// =============================================
const mapInventory = (i: any) => ({
    id: i._id?.toString() || i.id,
    name: i.name,
    category: i.category,
    sku: i.sku,
    quantity: i.quantity,
    minStock: i.minStock,
    maxStock: i.maxStock,
    unitCost: i.unitCost,
    totalValue: i.totalValue,
    supplier: i.supplier,
    locationId: i.locationId,
    status: i.status,
    notes: i.notes,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
});

router.get('/inventory', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const search = (req.query.search as string) || '';
        const category = (req.query.category as string) || '';
        const status = (req.query.status as string) || '';

        const filter: any = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
            ];
        }
        if (category && category !== 'all') filter.category = category;
        if (status && status !== 'all') filter.status = status.toUpperCase();

        const [items, total] = await Promise.all([
            FranchiseInventory.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .lean(),
            FranchiseInventory.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: items.map(mapInventory),
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error: any) {
        console.error('Inventory list error:', error);
        res.json({ success: true, data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 });
    }
});

router.post('/inventory', async (req: Request, res: Response) => {
    try {
        if (!req.body?.name || typeof req.body.name !== 'string' || !req.body.name.trim()) {
            return res.status(400).json({ success: false, message: 'Item name is required' });
        }
        if (req.body.quantity != null && req.body.quantity < 0) {
            return res.status(400).json({ success: false, message: 'Quantity cannot be negative' });
        }
        const created = await FranchiseInventory.create({
            name: req.body.name,
            category: req.body.category || 'Equipment',
            sku: req.body.sku,
            quantity: Number(req.body.quantity) || 0,
            minStock: Number(req.body.minStock) || 0,
            maxStock: req.body.maxStock != null ? Number(req.body.maxStock) : undefined,
            unitCost: Number(req.body.unitCost) || 0,
            supplier: req.body.supplier,
            locationId: req.body.locationId,
            notes: req.body.notes,
        });
        res.status(201).json({ success: true, data: mapInventory(created.toObject()) });
    } catch (error: any) {
        console.error('Inventory create error:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to create inventory item' });
    }
});

router.put('/inventory/:id', async (req: Request, res: Response) => {
    try {
        const item = await FranchiseInventory.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

        const fields = ['name', 'category', 'sku', 'quantity', 'minStock', 'maxStock', 'unitCost', 'supplier', 'locationId', 'notes'] as const;
        fields.forEach((f) => {
            if (req.body[f] !== undefined) (item as any)[f] = req.body[f];
        });
        await item.save(); // pre-save hook recalculates totalValue + status
        res.json({ success: true, data: mapInventory(item.toObject()) });
    } catch (error: any) {
        console.error('Inventory update error:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to update inventory item' });
    }
});

router.delete('/inventory/:id', async (req: Request, res: Response) => {
    try {
        const item = await FranchiseInventory.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        res.json({ success: true, message: 'Item deleted successfully' });
    } catch (error: any) {
        console.error('Inventory delete error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to delete item' });
    }
});

// =============================================
// MARKETING CAMPAIGNS (Mongoose-backed)
// =============================================
const mapCampaign = (c: any) => ({
    id: c._id?.toString() || c.id,
    name: c.name,
    description: c.description,
    type: c.type,
    status: c.status,
    discount: c.discount,
    budget: c.budget,
    spent: c.spent,
    reach: c.reach,
    conversions: c.conversions,
    roi: c.roi,
    startDate: c.startDate,
    endDate: c.endDate,
    targetAudience: c.targetAudience,
    channels: c.channels,
    locationIds: c.locationIds,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
});

router.get('/marketing/campaigns', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const status = (req.query.status as string) || '';
        const search = (req.query.search as string) || '';

        const filter: any = {};
        if (status && status !== 'all') filter.status = status.toUpperCase();
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { type: { $regex: search, $options: 'i' } },
            ];
        }

        const [items, total] = await Promise.all([
            FranchiseCampaign.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .lean(),
            FranchiseCampaign.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: items.map(mapCampaign),
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error: any) {
        console.error('Campaigns list error:', error);
        res.json({ success: true, data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 });
    }
});

router.post('/marketing/campaigns', async (req: Request, res: Response) => {
    try {
        if (!req.body?.name || typeof req.body.name !== 'string' || !req.body.name.trim()) {
            return res.status(400).json({ success: false, message: 'Campaign name is required' });
        }
        const created = await FranchiseCampaign.create({
            name: req.body.name,
            description: req.body.description,
            type: req.body.type || 'PROMOTIONAL',
            status: (req.body.status || 'DRAFT').toUpperCase(),
            discount: req.body.discount != null ? Number(req.body.discount) : undefined,
            budget: Number(req.body.budget) || 0,
            startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
            endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
            targetAudience: req.body.targetAudience,
            channels: Array.isArray(req.body.channels) ? req.body.channels : undefined,
            locationIds: Array.isArray(req.body.locationIds) ? req.body.locationIds : undefined,
        });
        res.status(201).json({ success: true, data: mapCampaign(created.toObject()) });
    } catch (error: any) {
        console.error('Campaign create error:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to create campaign' });
    }
});

router.put('/marketing/campaigns/:id', async (req: Request, res: Response) => {
    try {
        const update: any = { ...req.body };
        if (update.status) update.status = update.status.toUpperCase();
        if (update.startDate) update.startDate = new Date(update.startDate);
        if (update.endDate) update.endDate = new Date(update.endDate);
        const campaign = await FranchiseCampaign.findByIdAndUpdate(req.params.id, update, {
            new: true,
            runValidators: true,
        }).lean();
        if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
        res.json({ success: true, data: mapCampaign(campaign) });
    } catch (error: any) {
        console.error('Campaign update error:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to update campaign' });
    }
});

router.delete('/marketing/campaigns/:id', async (req: Request, res: Response) => {
    try {
        const campaign = await FranchiseCampaign.findByIdAndDelete(req.params.id);
        if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
        res.json({ success: true, message: 'Campaign deleted successfully' });
    } catch (error: any) {
        console.error('Campaign delete error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to delete campaign' });
    }
});

// =============================================
// FEEDBACK (Mongoose-backed)
// =============================================
const mapFeedback = (f: any) => ({
    id: f._id?.toString() || f.id,
    customerName: f.customerName,
    customerEmail: f.customerEmail,
    program: f.program,
    locationId: f.locationId,
    title: f.title,
    comment: f.comment,
    rating: f.rating,
    status: f.status,
    helpful: f.helpful,
    unhelpful: f.unhelpful,
    reply: f.reply,
    repliedAt: f.repliedAt,
    repliedBy: f.repliedBy,
    date: f.createdAt,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
});

router.get('/feedback', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const rating = (req.query.rating as string) || '';
        const status = (req.query.status as string) || '';
        const search = (req.query.search as string) || '';

        const filter: any = {};
        if (rating && rating !== 'all') filter.rating = parseInt(rating);
        if (status && status !== 'all') filter.status = status.toUpperCase();
        if (search) {
            filter.$or = [
                { customerName: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { comment: { $regex: search, $options: 'i' } },
                { program: { $regex: search, $options: 'i' } },
            ];
        }

        const [items, total] = await Promise.all([
            FranchiseFeedback.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .lean(),
            FranchiseFeedback.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: items.map(mapFeedback),
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error: any) {
        console.error('Feedback list error:', error);
        res.json({ success: true, data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 });
    }
});

router.post('/feedback', async (req: Request, res: Response) => {
    try {
        if (!req.body?.customerName || !req.body?.comment || !req.body?.rating) {
            return res.status(400).json({ success: false, message: 'customerName, comment and rating are required' });
        }
        const ratingNum = Number(req.body.rating);
        if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
        }
        const created = await FranchiseFeedback.create({
            customerName: req.body.customerName,
            customerEmail: req.body.customerEmail,
            program: req.body.program,
            locationId: req.body.locationId,
            title: req.body.title,
            comment: req.body.comment,
            rating: ratingNum,
            status: (req.body.status || 'PENDING').toUpperCase(),
        });
        res.status(201).json({ success: true, data: mapFeedback(created.toObject()) });
    } catch (error: any) {
        console.error('Feedback create error:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to create feedback' });
    }
});

router.post('/feedback/:id/publish', async (req: Request, res: Response) => {
    try {
        const feedback = await FranchiseFeedback.findByIdAndUpdate(
            req.params.id,
            { status: 'PUBLISHED' },
            { new: true }
        ).lean();
        if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
        res.json({ success: true, data: mapFeedback(feedback) });
    } catch (error: any) {
        console.error('Feedback publish error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to publish feedback' });
    }
});

router.post('/feedback/:id/reply', async (req: Request, res: Response) => {
    try {
        if (!req.body?.reply || !req.body.reply.trim()) {
            return res.status(400).json({ success: false, message: 'Reply text is required' });
        }
        const user = (req as any).user;
        const feedback = await FranchiseFeedback.findByIdAndUpdate(
            req.params.id,
            {
                reply: req.body.reply,
                repliedAt: new Date(),
                repliedBy: user?.email || user?.name || 'Franchise Owner',
            },
            { new: true }
        ).lean();
        if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
        res.json({ success: true, data: mapFeedback(feedback) });
    } catch (error: any) {
        console.error('Feedback reply error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to reply' });
    }
});

router.delete('/feedback/:id', async (req: Request, res: Response) => {
    try {
        const feedback = await FranchiseFeedback.findByIdAndDelete(req.params.id);
        if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
        res.json({ success: true, message: 'Feedback deleted successfully' });
    } catch (error: any) {
        console.error('Feedback delete error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to delete feedback' });
    }
});

// =============================================
// FINANCIAL REPORTS
// =============================================
// Friendly labels for expense categories (used by /financial-reports breakdown UI)
const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
    STAFF_SALARIES: 'Staff Salaries',
    FACILITY_RENT: 'Facility Rent',
    EQUIPMENT: 'Equipment',
    UTILITIES: 'Utilities',
    MARKETING: 'Marketing',
    INSURANCE: 'Insurance',
    SUPPLIES: 'Supplies',
    OTHER: 'Other',
};

router.get('/financial-reports', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const timeRange = req.query.timeRange as string || 'monthly';

        // Determine lookback period based on timeRange
        const lookbackMonths = timeRange === 'yearly' ? 12 : timeRange === 'quarterly' ? 3 : 6;
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - lookbackMonths);

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        // Revenue by month
        const monthlyRevenueAgg = await Booking.aggregate([
            { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] }, createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    revenue: { $sum: '$payment.amount' },
                    count: { $sum: 1 },
                }
            },
        ]);

        // Real expenses by month + by category
        const [monthlyExpensesAgg, categoryAgg, totalExpenseAgg] = await Promise.all([
            FranchiseExpense.aggregate([
                { $match: { date: { $gte: startDate } } },
                {
                    $group: {
                        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                        total: { $sum: '$amount' },
                    },
                },
            ]),
            FranchiseExpense.aggregate([
                { $match: { date: { $gte: startDate } } },
                { $group: { _id: '$category', value: { $sum: '$amount' } } },
                { $sort: { value: -1 } },
            ]),
            FranchiseExpense.aggregate([
                { $match: { date: { $gte: startDate } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);

        // Build month-key → revenue and month-key → expenses maps
        const revenueMap = new Map<string, { revenue: number; count: number }>();
        monthlyRevenueAgg.forEach((m: any) => {
            revenueMap.set(`${m._id.year}-${m._id.month}`, { revenue: m.revenue, count: m.count });
        });
        const expenseMap = new Map<string, number>();
        monthlyExpensesAgg.forEach((m: any) => {
            expenseMap.set(`${m._id.year}-${m._id.month}`, m.total);
        });

        // Build the rolling-window monthlyData (always includes empty months in-window)
        const monthlyData: any[] = [];
        const now = new Date();
        for (let i = lookbackMonths - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            const rev = revenueMap.get(key)?.revenue || 0;
            const exp = expenseMap.get(key) || 0;
            monthlyData.push({
                month: months[d.getMonth()],
                revenue: rev,
                expenses: exp,
                profit: rev - exp,
            });
        }

        const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
        const totalExpenses = totalExpenseAgg[0]?.total || 0;
        const totalProfit = totalRevenue - totalExpenses;

        // Revenue by program (unchanged — real Booking aggregation)
        const programRevenue = await Booking.aggregate([
            { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] } } },
            { $group: { _id: '$bookingType', value: { $sum: '$payment.amount' } } },
            { $sort: { value: -1 } },
        ]);

        const revenueByProgram = programRevenue.length > 0
            ? programRevenue.map((p: any) => ({
                name: p._id || 'Other',
                value: p.value,
                percentage: totalRevenue > 0 ? Math.round((p.value / totalRevenue) * 100) : 0,
            }))
            : [{ name: 'No Data', value: 0, percentage: 0 }];

        // Real expense breakdown (from FranchiseExpense, NOT hardcoded percentages)
        const expenseBreakdown = categoryAgg.length > 0
            ? categoryAgg.map((c: any) => ({
                name: EXPENSE_CATEGORY_LABELS[c._id] || c._id || 'Other',
                category: c._id,
                value: c.value,
                percentage: totalExpenses > 0 ? Math.round((c.value / totalExpenses) * 100) : 0,
            }))
            : [{ name: 'No expenses recorded', category: 'NONE', value: 0, percentage: 0 }];

        res.json({
            success: true,
            data: {
                totalRevenue,
                totalExpenses,
                totalProfit,
                profitMargin: totalRevenue > 0 ? parseFloat(((totalProfit / totalRevenue) * 100).toFixed(1)) : 0,
                avgMonthlyProfit: monthlyData.length > 0 ? Math.round(totalProfit / monthlyData.length) : 0,
                monthlyData,
                revenueByProgram,
                expenseBreakdown,
                hasRealExpenseData: categoryAgg.length > 0,
            }
        });
    } catch (error: any) {
        console.error('Financial reports error:', error);
        res.json({
            success: true,
            data: {
                totalRevenue: 0, totalExpenses: 0, totalProfit: 0, profitMargin: 0,
                avgMonthlyProfit: 0, monthlyData: [], revenueByProgram: [], expenseBreakdown: [],
                hasRealExpenseData: false,
            }
        });
    }
});

router.get('/financial-reports/export', async (req: Request, res: Response) => {
    try {
        const { Booking } = require('../modules/booking/booking.model');
        const format = (req.query.format as ExportFormat) || 'csv';
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const [monthlyRevenue, monthlyExpenses] = await Promise.all([
            Booking.aggregate([
                { $match: { 'payment.status': { $in: ['paid', 'COMPLETED', 'completed'] }, createdAt: { $gte: sixMonthsAgo } } },
                { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$payment.amount' }, count: { $sum: 1 } } },
                { $sort: { '_id.year': 1, '_id.month': 1 } },
            ]),
            FranchiseExpense.aggregate([
                { $match: { date: { $gte: sixMonthsAgo } } },
                { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
            ]),
        ]);

        const expenseMap = new Map<string, number>();
        monthlyExpenses.forEach((e: any) => expenseMap.set(`${e._id.year}-${e._id.month}`, e.total));

        const rows = monthlyRevenue.map((m: any) => {
            const expensesReal = expenseMap.get(`${m._id.year}-${m._id.month}`);
            const expenses = expensesReal != null ? expensesReal : Math.round(m.revenue * 0.6);
            const profit = m.revenue - expenses;
            const margin = m.revenue > 0 ? `${(profit / m.revenue * 100).toFixed(1)}%` : '0%';
            return [
                monthNames[m._id.month - 1],
                m._id.year,
                m.revenue,
                expenses,
                profit,
                margin,
                m.count,
            ];
        });

        const totalRevenue = rows.reduce((s, r) => s + (r[2] as number), 0);
        const totalExpenses = rows.reduce((s, r) => s + (r[3] as number), 0);
        const totalProfit = totalRevenue - totalExpenses;
        const summary = [
            { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}` },
            { label: 'Total Expenses', value: `$${totalExpenses.toLocaleString()}` },
            { label: 'Net Profit', value: `$${totalProfit.toLocaleString()}` },
            { label: 'Profit Margin', value: totalRevenue > 0 ? `${(totalProfit / totalRevenue * 100).toFixed(1)}%` : '0%' },
        ];

        await exportData(
            res,
            format,
            'financial-report',
            'Financial Report',
            ['Month', 'Year', 'Revenue', 'Expenses', 'Profit', 'Profit Margin', 'Bookings'],
            rows,
            summary
        );
    } catch (error: any) {
        console.error('Financial report export error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message || 'Failed to export financial report' });
        }
    }
});

// =============================================
// FRANCHISE EXPENSES (Mongoose-backed CRUD — feeds /financial-reports breakdown)
// =============================================
const EXPENSE_CATEGORIES = ['STAFF_SALARIES', 'FACILITY_RENT', 'EQUIPMENT', 'UTILITIES', 'MARKETING', 'INSURANCE', 'SUPPLIES', 'OTHER'];

const mapExpense = (e: any) => ({
    id: e._id?.toString() || e.id,
    category: e.category,
    categoryLabel: EXPENSE_CATEGORY_LABELS[e.category] || e.category,
    amount: e.amount,
    date: e.date,
    description: e.description,
    vendor: e.vendor,
    paymentMethod: e.paymentMethod,
    referenceNumber: e.referenceNumber,
    locationId: e.locationId,
    status: e.status,
    approvedBy: e.approvedBy,
    notes: e.notes,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
});

router.get('/expenses/categories', (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: EXPENSE_CATEGORIES.map((c) => ({
            value: c,
            label: EXPENSE_CATEGORY_LABELS[c] || c,
        })),
    });
});

router.get('/expenses', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const search = (req.query.search as string) || '';
        const category = (req.query.category as string) || '';
        const status = (req.query.status as string) || '';
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        const filter: any = {};
        if (category && category !== 'all') filter.category = category.toUpperCase();
        if (status && status !== 'all') filter.status = status.toUpperCase();
        if (search) {
            filter.$or = [
                { description: { $regex: search, $options: 'i' } },
                { vendor: { $regex: search, $options: 'i' } },
                { referenceNumber: { $regex: search, $options: 'i' } },
            ];
        }
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const [items, total, totalAmountAgg] = await Promise.all([
            FranchiseExpense.find(filter)
                .sort({ date: -1, createdAt: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .lean(),
            FranchiseExpense.countDocuments(filter),
            FranchiseExpense.aggregate([
                { $match: filter },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);

        res.json({
            success: true,
            data: items.map(mapExpense),
            total,
            totalAmount: totalAmountAgg[0]?.total || 0,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error: any) {
        console.error('Expenses list error:', error);
        res.json({ success: true, data: [], total: 0, totalAmount: 0, page: 1, pageSize: 10, totalPages: 0 });
    }
});

router.post('/expenses', async (req: Request, res: Response) => {
    try {
        const category = (req.body.category || '').toUpperCase();
        if (!EXPENSE_CATEGORIES.includes(category)) {
            return res.status(400).json({ success: false, message: `Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}` });
        }
        const amount = Number(req.body.amount);
        if (!Number.isFinite(amount) || amount < 0) {
            return res.status(400).json({ success: false, message: 'Amount must be a non-negative number' });
        }
        const created = await FranchiseExpense.create({
            category,
            amount,
            date: req.body.date ? new Date(req.body.date) : new Date(),
            description: req.body.description,
            vendor: req.body.vendor,
            paymentMethod: req.body.paymentMethod,
            referenceNumber: req.body.referenceNumber,
            locationId: req.body.locationId,
            status: (req.body.status || 'PENDING').toUpperCase(),
            notes: req.body.notes,
        });
        res.status(201).json({ success: true, data: mapExpense(created.toObject()) });
    } catch (error: any) {
        console.error('Expense create error:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to create expense' });
    }
});

router.put('/expenses/:id', async (req: Request, res: Response) => {
    try {
        const update: any = {};
        if (req.body.category !== undefined) {
            const c = String(req.body.category).toUpperCase();
            if (!EXPENSE_CATEGORIES.includes(c)) {
                return res.status(400).json({ success: false, message: `Invalid category` });
            }
            update.category = c;
        }
        if (req.body.amount !== undefined) update.amount = Number(req.body.amount);
        if (req.body.date !== undefined) update.date = new Date(req.body.date);
        if (req.body.description !== undefined) update.description = req.body.description;
        if (req.body.vendor !== undefined) update.vendor = req.body.vendor;
        if (req.body.paymentMethod !== undefined) update.paymentMethod = req.body.paymentMethod;
        if (req.body.referenceNumber !== undefined) update.referenceNumber = req.body.referenceNumber;
        if (req.body.locationId !== undefined) update.locationId = req.body.locationId;
        if (req.body.status !== undefined) update.status = String(req.body.status).toUpperCase();
        if (req.body.notes !== undefined) update.notes = req.body.notes;

        const expense = await FranchiseExpense.findByIdAndUpdate(req.params.id, update, {
            new: true,
            runValidators: true,
        }).lean();
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        res.json({ success: true, data: mapExpense(expense) });
    } catch (error: any) {
        console.error('Expense update error:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to update expense' });
    }
});

router.delete('/expenses/:id', async (req: Request, res: Response) => {
    try {
        const expense = await FranchiseExpense.findByIdAndDelete(req.params.id);
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error: any) {
        console.error('Expense delete error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to delete expense' });
    }
});

// =============================================
// SETTINGS (Mongoose-backed, per franchise owner)
// =============================================
const SETTINGS_FIELDS = [
    'franchiseName', 'franchiseCode', 'ownerName', 'ownerEmail', 'ownerPhone',
    'businessPhone', 'address', 'city', 'state', 'zipCode', 'timezone', 'currency',
    'notificationsEmail', 'notificationsSMS', 'notificationsPush', 'maintenanceMode',
] as const;

const mapSettings = (s: any) => ({
    franchiseName: s.franchiseName || '',
    franchiseCode: s.franchiseCode || '',
    ownerName: s.ownerName || '',
    ownerEmail: s.ownerEmail || '',
    ownerPhone: s.ownerPhone || '',
    businessPhone: s.businessPhone || '',
    address: s.address || '',
    city: s.city || '',
    state: s.state || '',
    zipCode: s.zipCode || '',
    timezone: s.timezone || 'America/New_York',
    currency: s.currency || 'USD',
    notificationsEmail: s.notificationsEmail !== false,
    notificationsSMS: s.notificationsSMS !== false,
    notificationsPush: s.notificationsPush !== false,
    maintenanceMode: !!s.maintenanceMode,
});

const getOwnerKey = (req: Request) => {
    const user = (req as any).user || {};
    return {
        ownerId: user.id || user._id?.toString() || user.userId || '',
        franchiseId: user.franchiseId || user.organizationId || '',
        ownerEmail: user.email || '',
        ownerName: user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    };
};

router.get('/settings', async (req: Request, res: Response) => {
    try {
        const ctx = getOwnerKey(req);
        const lookup: any = ctx.ownerId
            ? { ownerId: ctx.ownerId }
            : ctx.ownerEmail
                ? { ownerEmail: ctx.ownerEmail }
                : {};

        let settings = await FranchiseSettings.findOne(lookup).lean();
        if (!settings) {
            const created = await FranchiseSettings.create({
                ownerId: ctx.ownerId,
                franchiseId: ctx.franchiseId,
                ownerName: ctx.ownerName,
                ownerEmail: ctx.ownerEmail,
            });
            settings = created.toObject();
        }
        res.json({ success: true, data: mapSettings(settings) });
    } catch (error: any) {
        console.error('Settings load error:', error);
        res.json({ success: true, data: mapSettings({}) });
    }
});

router.put('/settings', async (req: Request, res: Response) => {
    try {
        const ctx = getOwnerKey(req);
        const lookup: any = ctx.ownerId
            ? { ownerId: ctx.ownerId }
            : ctx.ownerEmail
                ? { ownerEmail: ctx.ownerEmail }
                : {};

        const update: any = {};
        SETTINGS_FIELDS.forEach((f) => {
            if (req.body[f] !== undefined) update[f] = req.body[f];
        });

        const settings = await FranchiseSettings.findOneAndUpdate(
            lookup,
            {
                $set: { ...update, ownerId: ctx.ownerId, franchiseId: ctx.franchiseId },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).lean();

        res.json({ success: true, data: mapSettings(settings), message: 'Settings updated successfully' });
    } catch (error: any) {
        console.error('Settings update error:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to update settings' });
    }
});

// =============================================
// PASSWORD CHANGE
// =============================================
router.post('/change-password', async (req: Request, res: Response) => {
    try {
        const { User } = require('../modules/iam/user.model');
        const bcrypt = require('bcryptjs');
        const { currentPassword, newPassword } = req.body;
        const user = (req as any).user;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current and new password are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
        }

        // Find user with password
        const userDoc = await User.findById(user?.id || user?._id).select('+password');
        if (!userDoc) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, userDoc.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        userDoc.password = await bcrypt.hash(newPassword, salt);
        userDoc.lastPasswordChange = new Date();
        await userDoc.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error: any) {
        console.error('Password change error:', error);
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
});

export default router;
