import { Router, Request, Response } from 'express';
import { authenticate } from '../iam/auth.middleware';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory storage
const referrals: any[] = [];

/**
 * @route   GET /referrals
 * @desc    Get user's referrals
 * @access  Private
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userReferrals = referrals.filter(r => r.referrerId === userId);
        res.json({ success: true, data: userReferrals });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /referrals/generate-code
 * @desc    Generate referral code
 * @access  Private
 */
router.post('/generate-code', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const code = `REF${uuidv4().substring(0, 8).toUpperCase()}`;
        const referralCode = {
            id: uuidv4(),
            userId,
            code,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            uses: 0,
            maxUses: null,
            reward: 500 // points
        };

        referrals.push(referralCode);
        res.json({ success: true, data: referralCode, message: 'Referral code generated' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /referrals/stats
 * @desc    Get referral statistics
 * @access  Private
 */
router.get('/stats', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userReferrals = referrals.filter(r => r.referrerId === userId);
        const totalRewards = userReferrals.reduce((sum, r) => sum + (r.reward || 0), 0);

        res.json({
            success: true,
            data: {
                totalReferrals: userReferrals.length,
                totalRewards,
                activeReferrals: userReferrals.filter(r => new Date(r.expiresAt) > new Date()).length,
                pendingRewards: totalRewards
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
