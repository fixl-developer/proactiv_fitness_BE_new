import { Router } from 'express';

const router = Router();

// Placeholder routes for event bus
router.post('/publish', (req, res) => {
    res.json({ success: true, message: 'Event published', data: {} });
});

router.get('/history', (req, res) => {
    res.json({ success: true, message: 'Event history', data: [] });
});

export default router;
