import { Router, Request, Response } from 'express';
import { Schema, model } from 'mongoose';
import { authenticate } from '../modules/iam/auth.middleware';

const router = Router();

router.use(authenticate);

const adminOrCoach = (req: Request) => {
    const role = String(req.user?.role || '').toUpperCase();
    return ['ADMIN', 'REGIONAL_ADMIN', 'COACH', 'LOCATION_MANAGER'].includes(role);
};

// =============================================
// Helpers
// =============================================
function paginate(page: number, limit: number, total: number) {
    return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

async function findStaffForUser(userId: string): Promise<any | null> {
    try {
        const { Staff } = require('../modules/staff/staff.model');
        // Try to find by userId, or by personalInfo email match
        const { User } = require('../modules/iam/user.model');
        const user = await User.findById(userId).lean().catch(() => null);
        if (!user) return null;
        const staff = await Staff.findOne({
            $or: [
                { 'contactInfo.email': user.email },
                { userId: userId },
            ],
            isDeleted: { $ne: true },
        }).lean().catch(() => null);
        return staff;
    } catch {
        return null;
    }
}

// =============================================
// 1. DASHBOARD — KPI overview
// =============================================
router.get('/dashboard', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const staff = await findStaffForUser(userId);

        const { Session, Schedule } = require('../modules/scheduling/schedule.model');
        const { Program } = require('../modules/programs/program.model');
        const { AttendanceRecord } = require('../modules/attendance/attendance.model');
        const { Booking } = require('../modules/booking/booking.model');

        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        // Coach-filtered queries (filter by either userId or staff._id when available)
        const coachIds = [userId, staff?._id].filter(Boolean);

        const [
            todaySchedules,
            allSchedules,
            programs,
            attendancePresent,
            attendanceTotal,
            studentCount,
        ] = await Promise.all([
            Session.find({
                date: { $gte: todayStart, $lt: todayEnd },
                $or: [
                    { 'coachAssignments.coachId': { $in: coachIds } },
                    { coachId: { $in: coachIds } },
                ],
                isDeleted: { $ne: true },
            }).limit(20).lean().catch(() => []),
            Session.countDocuments({
                $or: [
                    { 'coachAssignments.coachId': { $in: coachIds } },
                    { coachId: { $in: coachIds } },
                ],
                isDeleted: { $ne: true },
            }).catch(() => 0),
            Program.find({ status: 'active', isDeleted: { $ne: true } }).limit(10).lean().catch(() => []),
            AttendanceRecord.countDocuments({ status: { $in: ['CHECKED_IN', 'PRESENT', 'present'] } }).catch(() => 0),
            AttendanceRecord.countDocuments({}).catch(() => 0),
            Booking.distinct('familyId', { isDeleted: { $ne: true } }).catch(() => []).then((arr: any[]) => arr.length),
        ]);

        const attendanceRate = attendanceTotal > 0
            ? Math.round((attendancePresent / attendanceTotal) * 100)
            : 0;

        const performance = staff?.performanceMetrics?.[0] || {};
        const studentSatisfaction = Number(performance.studentSatisfactionRating) || 0;
        const classCompletion = performance.classesAssigned > 0
            ? Math.round((performance.classesCompleted / performance.classesAssigned) * 100)
            : 0;

        res.json({
            success: true,
            data: {
                todayClasses: todaySchedules.length,
                totalStudents: studentCount,
                attendanceRate,
                activePrograms: programs.length,
                todaySchedule: todaySchedules.map((s: any) => ({
                    id: String(s._id),
                    className: s.sessionNotes || s.name || s.className || 'Class',
                    date: s.date ? s.date.toISOString().split('T')[0] : '',
                    time: s.timeSlot ? `${s.timeSlot.startTime} - ${s.timeSlot.endTime}` : '',
                    startTime: s.timeSlot?.startTime || '',
                    endTime: s.timeSlot?.endTime || '',
                    location: s.locationId ? String(s.locationId) : 'TBD',
                    level: s.level || 'beginner',
                    enrolledStudents: s.enrolledCount || 0,
                    capacity: s.capacity || 0,
                    duration: s.duration || 60,
                    status: s.status || 'scheduled',
                })),
                programs: programs.slice(0, 5).map((p: any) => ({
                    name: p.name || '',
                    level: (p.skillLevels?.[0] || 'beginner'),
                    currentEnrollment: p.enrollmentCount || 0,
                    capacity: p.capacityRules?.maxParticipants || 0,
                    duration: p.termDuration || 0,
                })),
                performanceMetrics: {
                    studentSatisfaction,
                    classCompletion,
                    skillImprovement: Number(performance.skillAssessmentScore) || 0,
                    attendanceConsistency: attendanceRate,
                },
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// 2. SCHEDULE — coach's class sessions
// =============================================
router.get('/schedule', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const staff = await findStaffForUser(userId);
        const { Session } = require('../modules/scheduling/schedule.model');

        const coachIds = [userId, staff?._id].filter(Boolean);
        const filter: any = {
            $or: [
                { 'coachAssignments.coachId': { $in: coachIds } },
                { coachId: { $in: coachIds } },
            ],
            isDeleted: { $ne: true },
        };

        if (req.query.dateFrom || req.query.dateTo) {
            filter.date = {};
            if (req.query.dateFrom) filter.date.$gte = new Date(String(req.query.dateFrom));
            if (req.query.dateTo) filter.date.$lte = new Date(String(req.query.dateTo));
        }

        const sessions = await Session.find(filter).sort({ date: 1 }).limit(50).lean();
        res.json({
            success: true,
            data: sessions.map((s: any) => ({
                id: String(s._id),
                className: s.sessionNotes || s.name || s.className || 'Class',
                date: s.date ? s.date.toISOString().split('T')[0] : '',
                time: s.timeSlot ? `${s.timeSlot.startTime} - ${s.timeSlot.endTime}` : '',
                startTime: s.timeSlot?.startTime || '',
                endTime: s.timeSlot?.endTime || '',
                location: s.locationId ? String(s.locationId) : 'TBD',
                level: s.level || 'beginner',
                enrolledStudents: s.enrolledCount || 0,
                capacity: s.capacity || 0,
                duration: s.duration || 60,
                status: s.status || 'scheduled',
            })),
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/schedule', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { Session, Schedule } = require('../modules/scheduling/schedule.model');
        const { Location } = require('../modules/bcms/location.model');
        const { Program } = require('../modules/programs/program.model');
        const { Term } = require('../modules/bcms/term.model');

        const body = req.body || {};
        if (!body.className && !body.name) {
            return res.status(400).json({ success: false, message: 'className is required' });
        }

        // Compute date once (used both for Schedule auto-create and Session)
        const sessionDate = body.date ? new Date(body.date) : new Date();

        // Resolve foreign keys with sensible defaults so the coach doesn't
        // have to hand-pick term/program/schedule when ad-hoc creating a class.
        let locationId: any = body.locationId;
        if (!locationId) {
            const loc = await Location.findOne({ isDeleted: { $ne: true } }).select('_id businessUnitId').lean().catch(() => null);
            locationId = loc?._id;
        }
        let programId: any = body.programId;
        if (!programId) {
            const prog = await Program.findOne({ isDeleted: { $ne: true } }).select('_id').lean().catch(() => null);
            programId = prog?._id;
        }
        let termId: any = body.termId;
        if (!termId) {
            const term = await Term.findOne({ isActive: true, isDeleted: { $ne: true } }).select('_id').lean().catch(() => null);
            termId = term?._id;
        }
        let scheduleId: any = body.scheduleId;
        if (!scheduleId) {
            // Match ANY non-deleted schedule (status filter was too narrow).
            const sch = await Schedule.findOne({ isDeleted: { $ne: true } }).select('_id').lean().catch(() => null);
            scheduleId = sch?._id;
        }
        // Auto-create a Schedule container if none exists yet — coaches shouldn't
        // be blocked from adding a class just because admin hasn't created a
        // Schedule scaffold first.
        if (!scheduleId && termId && locationId) {
            const loc = await Location.findById(locationId).select('businessUnitId').lean().catch(() => null);
            if (loc?.businessUnitId) {
                const newSch = await Schedule.create({
                    name: `Coach Ad-hoc Schedule ${new Date().toISOString().slice(0, 10)}`,
                    termId,
                    businessUnitId: loc.businessUnitId,
                    locationIds: [locationId],
                    startDate: sessionDate,
                    endDate: sessionDate,
                    status: 'DRAFT',
                    createdBy: userId,
                    updatedBy: userId,
                }).catch((e: any) => {
                    console.error('Auto Schedule create failed:', e?.message);
                    return null;
                });
                scheduleId = newSch?._id;
            }
        }
        if (!locationId || !programId || !termId || !scheduleId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot create coach session: missing prerequisite',
                debug: {
                    locationId: locationId ? String(locationId) : null,
                    programId: programId ? String(programId) : null,
                    termId: termId ? String(termId) : null,
                    scheduleId: scheduleId ? String(scheduleId) : null,
                },
            });
        }

        // dayOfWeek is stored as a Number (0=Sun, 6=Sat) in the Session schema.
        const dayOfWeekIndex = sessionDate.getDay();

        // Store className inside sessionNotes (Session schema has no `name`/
        // `className` field; sessionNotes is the only schema-declared free-text
        // field the className can survive a save round-trip in).
        const className = body.className || body.name;
        const session = await Session.create({
            sessionId: `SES-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            scheduleId,
            programId,
            termId,
            locationId,
            sessionNotes: className,
            date: sessionDate,
            timeSlot: {
                dayOfWeek: dayOfWeekIndex,
                startTime: body.startTime || '09:00',
                endTime: body.endTime || '10:00',
            },
            duration: Number(body.duration) || 60,
            maxCapacity: Number(body.capacity) || 10,
            currentCapacity: 0,
            coachAssignments: [{ coachId: userId, role: 'primary' }],
            // The Session pre-save hook reads coachRequirements.minCoaches/maxCoaches
            // even though those fields aren't formally declared on the Session schema.
            // Provide them so the hook doesn't throw.
            coachRequirements: { minCoaches: 1, maxCoaches: 1, requiredSkills: [], preferredCoaches: [] },
            status: body.status || 'scheduled',
            createdBy: userId,
            updatedBy: userId,
        });

        res.status(201).json({ success: true, data: session });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/schedule/:id', async (req: Request, res: Response) => {
    try {
        const { Session } = require('../modules/scheduling/schedule.model');
        const update: any = {};
        if (req.body.className) update.name = req.body.className;
        if (req.body.date) update.date = new Date(req.body.date);
        if (req.body.startTime || req.body.endTime) {
            update.timeSlot = {
                startTime: req.body.startTime,
                endTime: req.body.endTime,
            };
        }
        ['duration', 'capacity', 'level', 'status', 'locationId'].forEach(k => {
            if (req.body[k] !== undefined) update[k] = req.body[k];
        });
        update.updatedBy = req.user!.id;

        const session = await Session.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!session) return res.status(404).json({ success: false, message: 'Schedule not found' });
        res.json({ success: true, data: session });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/schedule/:id', async (req: Request, res: Response) => {
    try {
        const { Session } = require('../modules/scheduling/schedule.model');
        const result = await Session.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );
        if (!result) return res.status(404).json({ success: false, message: 'Schedule not found' });
        res.json({ success: true, message: 'Schedule deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// 3. STUDENTS — students enrolled in coach's classes
// =============================================
router.get('/students', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const staff = await findStaffForUser(userId);
        const { Booking } = require('../modules/booking/booking.model');
        const { User } = require('../modules/iam/user.model');
        const { AttendanceRecord } = require('../modules/attendance/attendance.model');

        // Find sessions assigned to this coach, then bookings on those sessions
        const { Session } = require('../modules/scheduling/schedule.model');
        const coachIds = [userId, staff?._id].filter(Boolean);
        const sessions = await Session.find({
            $or: [
                { 'coachAssignments.coachId': { $in: coachIds } },
                { coachId: { $in: coachIds } },
            ],
            isDeleted: { $ne: true },
        }).select('_id programId').lean();

        const sessionIds = sessions.map((s: any) => s._id);
        const programIds = Array.from(new Set(sessions.map((s: any) => String(s.programId)).filter(Boolean)));

        const bookings = await Booking.find({
            $or: [
                { sessionId: { $in: sessionIds } },
                { programId: { $in: programIds } },
            ],
            isDeleted: { $ne: true },
        }).limit(100).lean();

        // Collect unique student family IDs
        const studentMap = new Map<string, any>();
        for (const b of bookings) {
            const familyId = String(b.familyId);
            if (!studentMap.has(familyId)) {
                const u = await User.findById(b.familyId).select('firstName lastName name email phone').lean().catch(() => null);
                if (u) {
                    studentMap.set(familyId, {
                        id: familyId,
                        name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
                        email: u.email || '',
                        phone: u.phone || '',
                        level: 'beginner',
                        joinDate: u.createdAt || new Date().toISOString(),
                        classes: 0,
                        attendance: 0,
                        progress: 0,
                        skills: [],
                        rating: 0,
                    });
                }
            }
            const student = studentMap.get(familyId);
            if (student) student.classes += 1;
        }

        // Augment with attendance counts
        const familyIds = Array.from(studentMap.keys());
        if (familyIds.length > 0) {
            const records = await AttendanceRecord.find({
                $or: [
                    { studentId: { $in: familyIds } },
                    { userId: { $in: familyIds } },
                ],
            }).lean().catch(() => []);
            for (const r of records) {
                const sid = String(r.studentId || r.userId);
                const student = studentMap.get(sid);
                if (student) {
                    student.attendance += (r.status === 'present' || r.status === 'CHECKED_IN' ? 1 : 0);
                }
            }
        }

        res.json({ success: true, data: Array.from(studentMap.values()) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// 4. REPORTS — class reports
// =============================================
router.get('/reports', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const staff = await findStaffForUser(userId);
        const { Session } = require('../modules/scheduling/schedule.model');
        const { AttendanceRecord } = require('../modules/attendance/attendance.model');

        const coachIds = [userId, staff?._id].filter(Boolean);
        const sessions = await Session.find({
            $or: [
                { 'coachAssignments.coachId': { $in: coachIds } },
                { coachId: { $in: coachIds } },
            ],
            isDeleted: { $ne: true },
        }).limit(100).lean();

        const totalClasses = sessions.length;
        const levelCounts: Record<string, number> = {};
        sessions.forEach((s: any) => {
            const level = s.level || 'unknown';
            levelCounts[level] = (levelCounts[level] || 0) + 1;
        });

        const classDistribution = Object.entries(levelCounts).map(([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            count,
            percentage: totalClasses > 0 ? Math.round((count / totalClasses) * 100) : 0,
        }));

        const [presentCount, totalCount] = await Promise.all([
            AttendanceRecord.countDocuments({ status: { $in: ['CHECKED_IN', 'PRESENT', 'present'] } }),
            AttendanceRecord.countDocuments({}),
        ]);
        const avgAttendance = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

        const performance = staff?.performanceMetrics?.[0] || {};
        const avgRating = Number(performance.studentSatisfactionRating) || 0;

        // Attendance by day-of-week
        const dayCounts: Record<string, { attended: number; total: number }> = {};
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        days.forEach(d => { dayCounts[d] = { attended: 0, total: 0 }; });
        const allRecords = await AttendanceRecord.find({}).select('createdAt status').limit(1000).lean();
        allRecords.forEach((r: any) => {
            const day = days[new Date(r.createdAt).getDay()];
            dayCounts[day].total += 1;
            if (r.status === 'present' || r.status === 'CHECKED_IN') dayCounts[day].attended += 1;
        });
        const attendanceByDay = days.map(day => ({
            day,
            attended: dayCounts[day].attended,
            total: dayCounts[day].total,
            percentage: dayCounts[day].total > 0 ? Math.round((dayCounts[day].attended / dayCounts[day].total) * 100) : 0,
        }));

        res.json({
            success: true,
            data: {
                totalClasses,
                totalStudents: 0,
                avgAttendance,
                avgRating,
                classDistribution,
                studentProgress: [],
                attendanceByDay,
                performanceMetrics: [
                    { metric: 'Student Satisfaction', value: avgRating },
                    {
                        metric: 'Class Completion Rate',
                        value: performance.classesAssigned > 0
                            ? Math.round((performance.classesCompleted / performance.classesAssigned) * 100)
                            : 0,
                    },
                    { metric: 'Skill Improvement', value: Number(performance.skillAssessmentScore) || 0 },
                    { metric: 'Attendance Consistency', value: avgAttendance },
                ],
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// 5. AVAILABILITY — coach's weekly schedule
// =============================================
router.get('/availability', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const staff = await findStaffForUser(userId);
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const result: Record<string, any> = {};

        // Prefer Staff.weeklyAvailability; fall back to User.metadata.coachAvailability for
        // seeded coaches without a Staff record (set by PUT /coach/availability below).
        let slots: any[] = staff?.weeklyAvailability || [];
        if (!slots.length) {
            const { User } = require('../modules/iam/user.model');
            const u = await User.findById(userId).select('metadata').lean().catch(() => null);
            if (u?.metadata?.coachAvailability) {
                return res.json({ success: true, data: u.metadata.coachAvailability });
            }
            if (Array.isArray(u?.metadata?.weeklyAvailability)) {
                slots = u.metadata.weeklyAvailability;
            }
        }

        const dayMap: Record<number, string> = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
        slots.forEach((slot: any) => {
            const dayName = dayMap[slot.dayOfWeek] || 'monday';
            result[dayName] = {
                start: slot.startTime || '09:00',
                end: slot.endTime || '17:00',
                available: slot.isAvailable !== false,
            };
        });

        days.forEach(day => {
            if (!result[day]) {
                result[day] = {
                    start: day === 'sunday' ? '' : '09:00',
                    end: day === 'sunday' ? '' : '17:00',
                    available: day !== 'sunday',
                };
            }
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/availability', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayIndex: Record<string, number> = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0 };
        const availability = req.body || {};

        const weeklyAvailability = days
            .filter(day => availability[day])
            .map(day => ({
                dayOfWeek: dayIndex[day],
                startTime: availability[day].start || '',
                endTime: availability[day].end || '',
                isAvailable: availability[day].available !== false,
            }));

        // Try to update Staff record first; if no Staff doc exists for this user
        // (e.g. seeded coach without a Staff record), persist on the User doc as
        // metadata so the coach can still set availability without a manual Staff
        // record creation step.
        const staff = await findStaffForUser(userId);
        if (staff) {
            const { Staff } = require('../modules/staff/staff.model');
            await Staff.findByIdAndUpdate(staff._id, { weeklyAvailability, updatedBy: userId });
        } else {
            const { User } = require('../modules/iam/user.model');
            await User.findByIdAndUpdate(userId, {
                $set: { 'metadata.coachAvailability': availability, 'metadata.weeklyAvailability': weeklyAvailability },
            });
        }

        res.json({ success: true, data: availability, message: 'Availability updated' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// 6. FEEDBACK — coach gives feedback to students
// =============================================
const feedbackSchema = new Schema({
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, default: '' },
    coachId: { type: String, required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: { type: String, required: true },
    type: { type: String, enum: ['positive', 'constructive'], default: 'positive' },
}, { timestamps: true });
const CoachFeedback = model('CoachFeedback', feedbackSchema);

router.get('/feedback', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const filter: any = { coachId: userId };
        if (req.query.studentId) filter.studentId = req.query.studentId;
        const items = await CoachFeedback.find(filter).sort({ createdAt: -1 }).limit(100).lean();
        res.json({
            success: true,
            data: items.map((f: any) => ({
                id: String(f._id),
                studentId: f.studentId,
                studentName: f.studentName,
                coachId: f.coachId,
                date: f.createdAt,
                rating: f.rating,
                text: f.text,
                type: f.type,
            })),
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/feedback', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { studentId, studentName, rating, text, type } = req.body || {};
        if (!studentId || !rating || !text) {
            return res.status(400).json({ success: false, message: 'studentId, rating, text are required' });
        }
        const f = await CoachFeedback.create({
            studentId,
            studentName: studentName || '',
            coachId: userId,
            rating: Number(rating),
            text,
            type: type || (Number(rating) >= 4 ? 'positive' : 'constructive'),
        });
        res.status(201).json({ success: true, data: f });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/feedback/:id', async (req: Request, res: Response) => {
    try {
        const result = await CoachFeedback.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: 'Feedback not found' });
        res.json({ success: true, message: 'Feedback deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// 7. PROFILE — coach's own profile
// =============================================
router.get('/profile', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const staff = await findStaffForUser(userId);
        const { User } = require('../modules/iam/user.model');
        const user = await User.findById(userId).lean();
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const performance = staff?.performanceMetrics?.[0] || {};
        // For seeded coaches without a Staff record, profile fields fall back to
        // User.metadata.coachProfile (where PUT /coach/profile mirrors them).
        const metaProfile = user.metadata?.coachProfile || {};

        res.json({
            success: true,
            data: {
                id: userId,
                staffId: staff ? String(staff._id) : '',
                name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                firstName: user.firstName || staff?.personalInfo?.firstName || '',
                lastName: user.lastName || staff?.personalInfo?.lastName || '',
                email: user.email,
                phone: user.phone || staff?.contactInfo?.phone || '',
                location: staff?.contactInfo?.address
                    ? `${staff.contactInfo.address.city || ''}, ${staff.contactInfo.address.country || ''}`.trim()
                    : '',
                bio: staff?.notes || metaProfile.bio || '',
                specializations: staff?.specializations || metaProfile.specializations || [],
                certifications: (staff?.certifications || []).map((c: any) => ({
                    name: c.name || '',
                    status: c.status || 'valid',
                    issuingOrganization: c.issuingOrganization || '',
                    expiryDate: c.expiryDate || '',
                })),
                skills: staff?.skills || metaProfile.skills || [],
                experienceYears: staff?.experienceYears || 0,
                rating: Number(performance.studentSatisfactionRating) || 0,
                totalStudents: performance.classesAssigned || 0,
                totalClasses: performance.classesCompleted || 0,
                status: user.status || 'ACTIVE',
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/profile', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { User } = require('../modules/iam/user.model');
        const { Staff } = require('../modules/staff/staff.model');
        const body = req.body || {};

        // User fields
        const userUpdate: any = {};
        if (body.firstName !== undefined) userUpdate.firstName = body.firstName;
        if (body.lastName !== undefined) userUpdate.lastName = body.lastName;
        if (body.phone !== undefined) userUpdate.phone = body.phone;
        if (Object.keys(userUpdate).length > 0) {
            await User.findByIdAndUpdate(userId, userUpdate);
        }

        // Staff-managed fields (bio/specializations/skills). Update Staff doc when
        // it exists; otherwise mirror the same fields onto User.metadata.coachProfile
        // so the profile still round-trips for seeded coaches without a Staff record.
        const staff = await findStaffForUser(userId);
        if (staff) {
            const staffUpdate: any = {};
            if (body.bio !== undefined) staffUpdate.notes = body.bio;
            if (body.specializations !== undefined) staffUpdate.specializations = body.specializations;
            if (body.skills !== undefined) staffUpdate.skills = body.skills;
            if (Object.keys(staffUpdate).length > 0) {
                await Staff.findByIdAndUpdate(staff._id, staffUpdate);
            }
        } else {
            const metaUpdate: any = {};
            if (body.bio !== undefined) metaUpdate['metadata.coachProfile.bio'] = body.bio;
            if (body.specializations !== undefined) metaUpdate['metadata.coachProfile.specializations'] = body.specializations;
            if (body.skills !== undefined) metaUpdate['metadata.coachProfile.skills'] = body.skills;
            if (Object.keys(metaUpdate).length > 0) {
                await User.findByIdAndUpdate(userId, { $set: metaUpdate });
            }
        }

        res.json({ success: true, message: 'Profile updated' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// 8. ATTENDANCE — quick mark attendance
// =============================================
router.post('/attendance', async (req: Request, res: Response) => {
    try {
        const { AttendanceRecord } = require('../modules/attendance/attendance.model');
        const { User } = require('../modules/iam/user.model');
        const body = req.body || {};
        if (!body.studentId || !body.classId || !body.date || !body.status) {
            return res.status(400).json({ success: false, message: 'studentId, classId, date, status required' });
        }

        // Resolve student name (required by Mongoose schema)
        let personName = body.studentName;
        if (!personName) {
            const u = await User.findById(body.studentId).select('firstName lastName name email').lean().catch(() => null);
            personName = u
                ? (u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email)
                : `Student ${String(body.studentId).slice(-4)}`;
        }

        const now = new Date();
        const userId = req.user!.id;

        const rec = await AttendanceRecord.create({
            attendanceId: `ATT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            personId: body.studentId,
            personName,
            personType: body.personType || 'student',
            // attendanceType is who is attending (student|staff|visitor|parent), NOT the session type.
            attendanceType: body.attendanceType || 'student',
            sessionId: body.classId,
            date: new Date(body.date),
            checkInTime: body.checkInTime ? new Date(body.checkInTime) : now,
            checkInMethod: 'manual',
            checkInDeviceInfo: {
                // Schema requires deviceType (enum: tablet|smartphone|kiosk|...),
                // deviceName, operatingSystem. Use sensible defaults for the
                // coach dashboard's manual marking flow.
                deviceType: 'kiosk',
                deviceName: 'Coach Dashboard (web)',
                deviceId: 'coach-dashboard',
                operatingSystem: 'web-browser',
                appVersion: '1.0.0',
            },
            status: body.status,
            locationId: body.locationId || 'admin-default',
            businessUnitId: body.businessUnitId || 'admin-default',
            notes: body.notes || '',
            recordedBy: userId,
            createdBy: userId,
            updatedBy: userId,
        });
        res.status(201).json({ success: true, data: rec });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// NEW: Inline Mongoose models for the 6 additional Coach pages
// (Attendance list/history, Messages, LessonPlan, StudentProgress,
// Equipment, Goal). These keep all coach data co-located in one file
// so backend routing is obvious and there's no module-mounting risk.
// =============================================

// ---------- ChatMessage (Messages page) ----------
const chatMessageSchema = new Schema({
    fromUserId: { type: String, required: true, index: true },
    fromName: { type: String, required: true },
    toUserId: { type: String, required: true, index: true },
    toName: { type: String, required: true },
    body: { type: String, required: true, maxlength: 5000 },
    attachments: { type: [String], default: [] },
    read: { type: Boolean, default: false, index: true },
    conversationId: { type: String, required: true, index: true },
}, { timestamps: true });
const ChatMessage = model('ChatMessage', chatMessageSchema);

// ---------- LessonPlan (Curriculum page) ----------
const lessonPlanSchema = new Schema({
    coachId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    week: { type: Number, required: true, min: 1, max: 52 },
    programId: { type: String, default: '' },
    programName: { type: String, default: '' },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'beginner' },
    skills: { type: [String], default: [] },
    drills: { type: [String], default: [] },
    duration: { type: Number, default: 60, min: 15 },
    objectives: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published', 'completed', 'archived'], default: 'draft' },
}, { timestamps: true });
const LessonPlan = model('LessonPlan', lessonPlanSchema);

// ---------- StudentProgress (Progress page) ----------
const studentProgressSchema = new Schema({
    coachId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    skillName: { type: String, required: true, trim: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'beginner' },
    masteryPercent: { type: Number, default: 0, min: 0, max: 100 },
    notes: { type: String, default: '' },
    sessionDate: { type: Date, default: Date.now },
}, { timestamps: true });
const StudentProgress = model('StudentProgress', studentProgressSchema);

// ---------- CoachEquipment (Equipment page) ----------
const coachEquipmentSchema = new Schema({
    coachId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, default: 'general', trim: true },
    quantity: { type: Number, default: 1, min: 0 },
    status: { type: String, enum: ['available', 'in_use', 'maintenance', 'broken', 'lost'], default: 'available' },
    location: { type: String, default: '' },
    purchaseDate: Date,
    lastMaintenanceDate: Date,
    notes: { type: String, default: '' },
}, { timestamps: true });
const CoachEquipment = model('CoachEquipment', coachEquipmentSchema);

// ---------- CoachGoal (Goals page) ----------
const coachGoalSchema = new Schema({
    coachId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '' },
    metric: { type: String, required: true, trim: true },
    targetValue: { type: Number, required: true, min: 0 },
    currentValue: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: '' },
    deadline: { type: Date, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['active', 'achieved', 'missed', 'archived'], default: 'active' },
}, { timestamps: true });
const CoachGoal = model('CoachGoal', coachGoalSchema);

// =============================================
// Validation helpers
// =============================================
function isMongoId(s: any) { return typeof s === 'string' && /^[a-f\d]{24}$/i.test(s); }

// =============================================
// 1) ATTENDANCE — list (today's roster) + history
// (POST /coach/attendance already exists earlier in this file)
// =============================================

// GET /coach/attendance/today — return students enrolled in today's coach sessions, with their attendance status
router.get('/attendance/today', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { Session } = require('../modules/scheduling/schedule.model');
        const { AttendanceRecord } = require('../modules/attendance/attendance.model');
        const { Booking } = require('../modules/booking/booking.model');
        const { User } = require('../modules/iam/user.model');

        // Today range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const sessions = await Session.find({
            'coachAssignments.coachId': userId,
            date: { $gte: today, $lt: tomorrow },
            isDeleted: { $ne: true },
        }).lean().catch(() => []);

        if (sessions.length === 0) {
            return res.json({ success: true, data: { sessions: [], roster: [] } });
        }

        const sessionIds = sessions.map((s: any) => s._id);
        const bookings = await Booking.find({
            sessionId: { $in: sessionIds },
            isDeleted: { $ne: true },
        }).lean().catch(() => []);

        const studentIds = Array.from(new Set(bookings.flatMap((b: any) =>
            (b.participants || []).map((p: any) => p.childId)
        )));
        const students = studentIds.length
            ? await User.find({ _id: { $in: studentIds } }).select('firstName lastName name email').lean().catch(() => [])
            : [];

        // Existing attendance records for today's sessions
        const existing = await AttendanceRecord.find({
            sessionId: { $in: sessionIds },
            createdAt: { $gte: today, $lt: tomorrow },
        }).lean().catch(() => []);
        const existingMap = new Map<string, any>();
        existing.forEach((r: any) => existingMap.set(`${r.sessionId}|${r.personId}`, r));

        const roster: any[] = [];
        sessions.forEach((sess: any) => {
            const sessionBookings = bookings.filter((b: any) => String(b.sessionId) === String(sess._id));
            sessionBookings.forEach((booking: any) => {
                (booking.participants || []).forEach((p: any) => {
                    const stu = students.find((u: any) => String(u._id) === String(p.childId));
                    const exist = existingMap.get(`${sess._id}|${p.childId}`);
                    roster.push({
                        sessionId: String(sess._id),
                        sessionTime: sess.timeSlot ? `${sess.timeSlot.startTime}-${sess.timeSlot.endTime}` : '',
                        studentId: String(p.childId),
                        studentName: stu ? (stu.name || `${stu.firstName || ''} ${stu.lastName || ''}`.trim()) : (p.name || 'Student'),
                        status: exist?.status || 'pending',
                        attendanceId: exist ? String(exist._id) : null,
                    });
                });
            });
        });

        res.json({
            success: true,
            data: {
                sessions: sessions.map((s: any) => ({ id: String(s._id), name: s.sessionNotes || 'Class', time: s.timeSlot ? `${s.timeSlot.startTime}-${s.timeSlot.endTime}` : '' })),
                roster,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /coach/attendance/history?days=30 — recent attendance records by this coach
router.get('/attendance/history', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { AttendanceRecord } = require('../modules/attendance/attendance.model');
        const days = parseInt((req.query.days as string) || '30');
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const records = await AttendanceRecord.find({
            recordedBy: userId,
            createdAt: { $gte: since },
        }).sort({ createdAt: -1 }).limit(200).lean().catch(() => []);

        res.json({
            success: true,
            data: records.map((r: any) => ({
                id: String(r._id),
                studentId: r.personId,
                studentName: r.personName,
                date: r.createdAt,
                status: r.status,
                notes: r.notes,
                sessionId: r.sessionId ? String(r.sessionId) : null,
            })),
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// 2) MESSAGES — Coach ↔ Parent chat
// =============================================

// GET /coach/messages — list conversations (grouped by other-party userId)
router.get('/messages', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const messages = await ChatMessage.find({
            $or: [{ fromUserId: userId }, { toUserId: userId }],
        }).sort({ createdAt: -1 }).limit(500).lean();

        // Group by conversationId
        const convoMap = new Map<string, any>();
        for (const m of messages) {
            const otherUserId = m.fromUserId === userId ? m.toUserId : m.fromUserId;
            const otherName = m.fromUserId === userId ? m.toName : m.fromName;
            if (!convoMap.has(m.conversationId)) {
                convoMap.set(m.conversationId, {
                    conversationId: m.conversationId,
                    otherUserId,
                    otherName,
                    lastMessage: m.body,
                    lastMessageAt: m.createdAt,
                    unreadCount: 0,
                    messages: [] as any[],
                });
            }
            const c = convoMap.get(m.conversationId);
            c.messages.push({
                id: String(m._id),
                from: m.fromUserId === userId ? 'me' : 'other',
                fromName: m.fromName,
                body: m.body,
                read: m.read,
                createdAt: m.createdAt,
            });
            if (m.toUserId === userId && !m.read) c.unreadCount++;
        }

        const conversations = Array.from(convoMap.values()).sort(
            (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );

        res.json({ success: true, data: conversations });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /coach/messages — send a message to a parent/student
router.post('/messages', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { User } = require('../modules/iam/user.model');
        const me = await User.findById(userId).select('firstName lastName name').lean().catch(() => null);
        const myName = me ? (me.name || `${me.firstName || ''} ${me.lastName || ''}`.trim()) : 'Coach';

        const { toUserId, body, conversationId } = req.body || {};
        if (!toUserId || !body) {
            return res.status(400).json({ success: false, message: 'toUserId and body are required' });
        }

        const toUser = await User.findById(toUserId).select('firstName lastName name').lean().catch(() => null);
        const toName = toUser ? (toUser.name || `${toUser.firstName || ''} ${toUser.lastName || ''}`.trim()) : 'User';

        // Conversation ID = sorted pair so both directions land in same convo
        const convoId = conversationId || [userId, toUserId].sort().join('::');

        const msg = await ChatMessage.create({
            fromUserId: userId,
            fromName: myName,
            toUserId,
            toName,
            body: String(body).slice(0, 5000),
            conversationId: convoId,
        });
        res.status(201).json({ success: true, data: msg });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /coach/messages/:conversationId/read — mark conversation as read
router.patch('/messages/:conversationId/read', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const result = await ChatMessage.updateMany(
            { conversationId: req.params.conversationId, toUserId: userId, read: false },
            { read: true }
        );
        res.json({ success: true, data: { updated: result.modifiedCount } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /coach/messages/:id — delete a single message (sender only)
router.delete('/messages/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        if (!isMongoId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid message id' });
        const result = await ChatMessage.findOneAndDelete({ _id: req.params.id, fromUserId: userId });
        if (!result) return res.status(404).json({ success: false, message: 'Message not found' });
        res.json({ success: true, message: 'Message deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// 3) LESSON PLANS / CURRICULUM
// =============================================

router.get('/curriculum', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '20');
        const filter: any = { coachId: userId };
        if (req.query.status) filter.status = req.query.status;
        if (req.query.level) filter.level = req.query.level;
        if (req.query.search) {
            const term = String(req.query.search);
            filter.$or = [
                { title: { $regex: term, $options: 'i' } },
                { programName: { $regex: term, $options: 'i' } },
                { objectives: { $regex: term, $options: 'i' } },
            ];
        }
        const [items, total] = await Promise.all([
            LessonPlan.find(filter).sort({ week: 1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            LessonPlan.countDocuments(filter),
        ]);
        res.json({ success: true, data: items, pagination: paginate(page, limit, total) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/curriculum/:id', async (req: Request, res: Response) => {
    try {
        if (!isMongoId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
        const item = await LessonPlan.findById(req.params.id).lean();
        if (!item || String(item.coachId) !== req.user!.id) {
            return res.status(404).json({ success: false, message: 'Lesson plan not found' });
        }
        res.json({ success: true, data: item });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/curriculum', async (req: Request, res: Response) => {
    try {
        const { title, week, programId, programName, level, skills, drills, duration, objectives, notes, status } = req.body || {};
        if (!title || !week) {
            return res.status(400).json({ success: false, message: 'title and week are required' });
        }
        const item = await LessonPlan.create({
            coachId: req.user!.id,
            title: String(title).trim(),
            week: Number(week),
            programId: programId || '',
            programName: programName || '',
            level: level || 'beginner',
            skills: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
            drills: Array.isArray(drills) ? drills : (typeof drills === 'string' ? drills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
            duration: duration ? Number(duration) : 60,
            objectives: objectives || '',
            notes: notes || '',
            status: status || 'draft',
        });
        res.status(201).json({ success: true, data: item, message: 'Lesson plan created' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/curriculum/:id', async (req: Request, res: Response) => {
    try {
        if (!isMongoId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
        const update: any = {};
        for (const k of ['title', 'week', 'programId', 'programName', 'level', 'duration', 'objectives', 'notes', 'status']) {
            if (req.body[k] !== undefined) update[k] = k === 'week' || k === 'duration' ? Number(req.body[k]) : req.body[k];
        }
        if (req.body.skills !== undefined) {
            update.skills = Array.isArray(req.body.skills) ? req.body.skills : String(req.body.skills).split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        if (req.body.drills !== undefined) {
            update.drills = Array.isArray(req.body.drills) ? req.body.drills : String(req.body.drills).split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        const item = await LessonPlan.findOneAndUpdate({ _id: req.params.id, coachId: req.user!.id }, update, { new: true });
        if (!item) return res.status(404).json({ success: false, message: 'Lesson plan not found' });
        res.json({ success: true, data: item, message: 'Lesson plan updated' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/curriculum/:id', async (req: Request, res: Response) => {
    try {
        if (!isMongoId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
        const result = await LessonPlan.findOneAndDelete({ _id: req.params.id, coachId: req.user!.id });
        if (!result) return res.status(404).json({ success: false, message: 'Lesson plan not found' });
        res.json({ success: true, message: 'Lesson plan deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// 4) STUDENT PROGRESS
// =============================================

router.get('/progress', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '20');
        const filter: any = { coachId: userId };
        if (req.query.studentId) filter.studentId = req.query.studentId;
        if (req.query.skillName) filter.skillName = { $regex: String(req.query.skillName), $options: 'i' };
        if (req.query.search) {
            const term = String(req.query.search);
            filter.$or = [
                { studentName: { $regex: term, $options: 'i' } },
                { skillName: { $regex: term, $options: 'i' } },
            ];
        }
        const [items, total] = await Promise.all([
            StudentProgress.find(filter).sort({ sessionDate: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            StudentProgress.countDocuments(filter),
        ]);
        res.json({ success: true, data: items, pagination: paginate(page, limit, total) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/progress', async (req: Request, res: Response) => {
    try {
        const { studentId, studentName, skillName, level, masteryPercent, notes, sessionDate } = req.body || {};
        if (!studentId || !skillName) {
            return res.status(400).json({ success: false, message: 'studentId and skillName are required' });
        }
        // Resolve student name from User if not given
        let resolvedName = studentName;
        if (!resolvedName) {
            try {
                const { User } = require('../modules/iam/user.model');
                const u = await User.findById(studentId).select('firstName lastName name').lean();
                resolvedName = u ? (u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim()) : 'Student';
            } catch { resolvedName = 'Student'; }
        }
        const item = await StudentProgress.create({
            coachId: req.user!.id,
            studentId,
            studentName: resolvedName,
            skillName: String(skillName).trim(),
            level: level || 'beginner',
            masteryPercent: typeof masteryPercent === 'number' ? Math.max(0, Math.min(100, masteryPercent)) : 0,
            notes: notes || '',
            sessionDate: sessionDate ? new Date(sessionDate) : new Date(),
        });
        res.status(201).json({ success: true, data: item, message: 'Progress recorded' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/progress/:id', async (req: Request, res: Response) => {
    try {
        if (!isMongoId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
        const update: any = {};
        for (const k of ['skillName', 'level', 'notes', 'studentName']) {
            if (req.body[k] !== undefined) update[k] = req.body[k];
        }
        if (req.body.masteryPercent !== undefined) {
            update.masteryPercent = Math.max(0, Math.min(100, Number(req.body.masteryPercent)));
        }
        if (req.body.sessionDate !== undefined) update.sessionDate = new Date(req.body.sessionDate);

        const item = await StudentProgress.findOneAndUpdate({ _id: req.params.id, coachId: req.user!.id }, update, { new: true });
        if (!item) return res.status(404).json({ success: false, message: 'Progress entry not found' });
        res.json({ success: true, data: item, message: 'Progress updated' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/progress/:id', async (req: Request, res: Response) => {
    try {
        if (!isMongoId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
        const result = await StudentProgress.findOneAndDelete({ _id: req.params.id, coachId: req.user!.id });
        if (!result) return res.status(404).json({ success: false, message: 'Progress entry not found' });
        res.json({ success: true, message: 'Progress entry deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// 5) EQUIPMENT
// =============================================

router.get('/equipment', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '20');
        const filter: any = { coachId: userId };
        if (req.query.status) filter.status = req.query.status;
        if (req.query.category) filter.category = req.query.category;
        if (req.query.search) {
            const term = String(req.query.search);
            filter.$or = [
                { name: { $regex: term, $options: 'i' } },
                { category: { $regex: term, $options: 'i' } },
                { location: { $regex: term, $options: 'i' } },
            ];
        }
        const [items, total] = await Promise.all([
            CoachEquipment.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            CoachEquipment.countDocuments(filter),
        ]);
        res.json({ success: true, data: items, pagination: paginate(page, limit, total) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/equipment', async (req: Request, res: Response) => {
    try {
        const { name, category, quantity, status, location, purchaseDate, lastMaintenanceDate, notes } = req.body || {};
        if (!name) return res.status(400).json({ success: false, message: 'name is required' });
        const item = await CoachEquipment.create({
            coachId: req.user!.id,
            name: String(name).trim(),
            category: category || 'general',
            quantity: typeof quantity === 'number' ? quantity : (quantity ? Number(quantity) : 1),
            status: status || 'available',
            location: location || '',
            purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
            lastMaintenanceDate: lastMaintenanceDate ? new Date(lastMaintenanceDate) : undefined,
            notes: notes || '',
        });
        res.status(201).json({ success: true, data: item, message: 'Equipment added' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/equipment/:id', async (req: Request, res: Response) => {
    try {
        if (!isMongoId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
        const update: any = {};
        for (const k of ['name', 'category', 'status', 'location', 'notes']) {
            if (req.body[k] !== undefined) update[k] = req.body[k];
        }
        if (req.body.quantity !== undefined) update.quantity = Number(req.body.quantity);
        if (req.body.purchaseDate !== undefined) update.purchaseDate = new Date(req.body.purchaseDate);
        if (req.body.lastMaintenanceDate !== undefined) update.lastMaintenanceDate = new Date(req.body.lastMaintenanceDate);

        const item = await CoachEquipment.findOneAndUpdate({ _id: req.params.id, coachId: req.user!.id }, update, { new: true });
        if (!item) return res.status(404).json({ success: false, message: 'Equipment not found' });
        res.json({ success: true, data: item, message: 'Equipment updated' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/equipment/:id', async (req: Request, res: Response) => {
    try {
        if (!isMongoId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
        const result = await CoachEquipment.findOneAndDelete({ _id: req.params.id, coachId: req.user!.id });
        if (!result) return res.status(404).json({ success: false, message: 'Equipment not found' });
        res.json({ success: true, message: 'Equipment deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// 6) GOALS
// =============================================

router.get('/goals', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '20');
        const filter: any = { coachId: userId };
        if (req.query.status) filter.status = req.query.status;
        if (req.query.priority) filter.priority = req.query.priority;
        if (req.query.search) {
            const term = String(req.query.search);
            filter.$or = [
                { title: { $regex: term, $options: 'i' } },
                { metric: { $regex: term, $options: 'i' } },
            ];
        }
        const [items, total] = await Promise.all([
            CoachGoal.find(filter).sort({ deadline: 1 }).skip((page - 1) * limit).limit(limit).lean(),
            CoachGoal.countDocuments(filter),
        ]);
        res.json({ success: true, data: items, pagination: paginate(page, limit, total) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/goals', async (req: Request, res: Response) => {
    try {
        const { title, description, metric, targetValue, currentValue, unit, deadline, priority, status } = req.body || {};
        if (!title || !metric || targetValue === undefined || !deadline) {
            return res.status(400).json({ success: false, message: 'title, metric, targetValue, and deadline are required' });
        }
        const item = await CoachGoal.create({
            coachId: req.user!.id,
            title: String(title).trim(),
            description: description || '',
            metric: String(metric).trim(),
            targetValue: Number(targetValue),
            currentValue: typeof currentValue === 'number' ? currentValue : 0,
            unit: unit || '',
            deadline: new Date(deadline),
            priority: priority || 'medium',
            status: status || 'active',
        });
        res.status(201).json({ success: true, data: item, message: 'Goal created' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/goals/:id', async (req: Request, res: Response) => {
    try {
        if (!isMongoId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
        const update: any = {};
        for (const k of ['title', 'description', 'metric', 'unit', 'priority', 'status']) {
            if (req.body[k] !== undefined) update[k] = req.body[k];
        }
        if (req.body.targetValue !== undefined) update.targetValue = Number(req.body.targetValue);
        if (req.body.currentValue !== undefined) update.currentValue = Number(req.body.currentValue);
        if (req.body.deadline !== undefined) update.deadline = new Date(req.body.deadline);

        // Auto-mark achieved if currentValue >= targetValue
        if (update.currentValue !== undefined || update.targetValue !== undefined) {
            const existing = await CoachGoal.findOne({ _id: req.params.id, coachId: req.user!.id }).lean();
            if (existing) {
                const cur = update.currentValue !== undefined ? update.currentValue : existing.currentValue;
                const tgt = update.targetValue !== undefined ? update.targetValue : existing.targetValue;
                if (cur >= tgt && existing.status === 'active') update.status = 'achieved';
            }
        }

        const item = await CoachGoal.findOneAndUpdate({ _id: req.params.id, coachId: req.user!.id }, update, { new: true });
        if (!item) return res.status(404).json({ success: false, message: 'Goal not found' });
        res.json({ success: true, data: item, message: 'Goal updated' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/goals/:id', async (req: Request, res: Response) => {
    try {
        if (!isMongoId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
        const result = await CoachGoal.findOneAndDelete({ _id: req.params.id, coachId: req.user!.id });
        if (!result) return res.status(404).json({ success: false, message: 'Goal not found' });
        res.json({ success: true, message: 'Goal deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
