import { Router, Request, Response } from 'express';
import { authenticate } from '../iam/auth.middleware';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory storage
const healthMetrics: any[] = [];

/**
 * @route   GET /health-metrics
 * @desc    Get user's health metrics
 * @access  Private
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userMetrics = healthMetrics.filter(m => m.userId === userId);
        res.json({ success: true, data: userMetrics });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /health-metrics
 * @desc    Add health metric
 * @access  Private
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { type, value, unit, notes } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        if (!type || value === undefined) {
            res.status(400).json({ success: false, message: 'Type and value are required' });
            return;
        }

        const metric = {
            id: uuidv4(),
            userId,
            type, // weight, height, bmi, heartRate, bloodPressure, etc.
            value,
            unit: unit || 'kg',
            notes: notes || '',
            recordedAt: new Date(),
            createdAt: new Date()
        };

        healthMetrics.push(metric);
        res.status(201).json({ success: true, data: metric, message: 'Metric recorded successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /health-metrics/:metricType
 * @desc    Get metrics by type
 * @access  Private
 */
router.get('/:metricType', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { metricType } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userMetrics = healthMetrics.filter(m => m.userId === userId && m.type === metricType);
        res.json({ success: true, data: userMetrics });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   DELETE /health-metrics/:metricId
 * @desc    Delete health metric
 * @access  Private
 */
router.delete('/:metricId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { metricId } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const index = healthMetrics.findIndex(m => m.id === metricId && m.userId === userId);
        if (index === -1) {
            res.status(404).json({ success: false, message: 'Metric not found' });
            return;
        }

        healthMetrics.splice(index, 1);
        res.json({ success: true, message: 'Metric deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /health-metrics/summary
 * @desc    Get health metrics summary
 * @access  Private
 */
router.get('/summary', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userMetrics = healthMetrics.filter(m => m.userId === userId);
        const summary = {
            totalMetrics: userMetrics.length,
            metricTypes: [...new Set(userMetrics.map(m => m.type))],
            lastRecorded: userMetrics.length > 0 ? userMetrics[userMetrics.length - 1].recordedAt : null,
            metrics: userMetrics
        };

        res.json({ success: true, data: summary });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
