import { Router, Request, Response } from 'express';
import { SmartSchedulerService } from './smart-scheduler.service';
import { authenticate } from '@modules/iam/auth.middleware';

const router = Router();
const smartSchedulerService = new SmartSchedulerService();

// Predict attendance / no-shows
router.post('/predict-attendance', authenticate, async (req: Request, res: Response) => {
    try {
        const { classId, studentIds, historicalData } = req.body;
        const tenantId = req.user?.tenantId;

        const result = await smartSchedulerService.predictAttendance({
            tenantId,
            classId,
            studentIds,
            historicalData,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Optimize schedule
router.post('/optimize-schedule', authenticate, async (req: Request, res: Response) => {
    try {
        const { locationId, currentSchedule, constraints } = req.body;
        const tenantId = req.user?.tenantId;

        const result = await smartSchedulerService.optimizeSchedule({
            tenantId,
            locationId,
            currentSchedule,
            constraints,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Analyze peak hours
router.get('/peak-hours/:locationId', authenticate, async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const tenantId = req.user?.tenantId;

        const result = await smartSchedulerService.analyzePeakHours(locationId, tenantId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Match coach to student
router.post('/match-coach', authenticate, async (req: Request, res: Response) => {
    try {
        const { studentId, requirements, availableCoaches } = req.body;
        const tenantId = req.user?.tenantId;

        const result = await smartSchedulerService.matchCoach({
            tenantId,
            studentId,
            requirements,
            availableCoaches,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Auto-fill waitlist
router.post('/auto-fill-waitlist', authenticate, async (req: Request, res: Response) => {
    try {
        const { classId, waitlistedStudents, currentEnrolled, maxCapacity } = req.body;
        const tenantId = req.user?.tenantId;

        const result = await smartSchedulerService.autoFillWaitlist({
            tenantId,
            classId,
            waitlistedStudents,
            currentEnrolled,
            maxCapacity,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
