import { Router, Request, Response } from 'express';
import { authenticate } from '../iam/auth.middleware';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory storage for demo
const feedbackList: any[] = [];

/**
 * @route   POST /feedback
 * @desc    Submit user feedback
 * @access  Private
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { type, rating, message, category } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        if (!type || !message) {
            res.status(400).json({ success: false, message: 'Type and message are required' });
            return;
        }

        const feedback = {
            id: uuidv4(),
            userId,
            type,
            rating: rating || 5,
            message,
            category: category || 'general',
            status: 'new',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        feedbackList.push(feedback);
        res.status(201).json({ success: true, data: feedback, message: 'Feedback submitted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /feedback
 * @desc    Get user's feedback
 * @access  Private
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userFeedback = feedbackList.filter(f => f.userId === userId);
        res.json({ success: true, data: userFeedback });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /feedback/:feedbackId
 * @desc    Get feedback details
 * @access  Private
 */
router.get('/:feedbackId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { feedbackId } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const feedback = feedbackList.find(f => f.id === feedbackId && f.userId === userId);
        if (!feedback) {
            res.status(404).json({ success: false, message: 'Feedback not found' });
            return;
        }

        res.json({ success: true, data: feedback });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   DELETE /feedback/:feedbackId
 * @desc    Delete feedback
 * @access  Private
 */
router.delete('/:feedbackId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { feedbackId } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const index = feedbackList.findIndex(f => f.id === feedbackId && f.userId === userId);
        if (index === -1) {
            res.status(404).json({ success: false, message: 'Feedback not found' });
            return;
        }

        feedbackList.splice(index, 1);
        res.json({ success: true, message: 'Feedback deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
