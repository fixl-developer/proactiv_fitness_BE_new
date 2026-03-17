import { Router, Request, Response } from 'express';
import { ReferralLoyaltyService } from './referral-loyalty.service';
import { authenticate, authorize } from '@modules/iam/auth.middleware';

const router = Router();
const service = new ReferralLoyaltyService();

// Create referral link
router.post('/referrals/create', authenticate, authorize(['PARENT']), async (req: Request, res: Response) => {
    try {
        const referral = await service.createReferralLink(req.body.parentId);
        res.json({ success: true, data: referral });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get referral link
router.get('/referrals/:parentId', authenticate, async (req: Request, res: Response) => {
    try {
        const referral = await service.getReferralLink(req.params.parentId);
        res.json({ success: true, data: referral });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Track referral
router.post('/referrals/track', async (req: Request, res: Response) => {
    try {
        const result = await service.trackReferral(req.body.referralCode, req.body.newParentId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get referral rewards
router.get('/rewards/:parentId', authenticate, async (req: Request, res: Response) => {
    try {
        const rewards = await service.getReferralRewards(req.params.parentId);
        res.json({ success: true, data: rewards });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Redeem reward
router.post('/rewards/redeem', authenticate, authorize(['PARENT']), async (req: Request, res: Response) => {
    try {
        const result = await service.redeemReward(req.body.parentId, req.body.rewardId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get loyalty points
router.get('/points/:parentId', authenticate, async (req: Request, res: Response) => {
    try {
        const points = await service.getLoyaltyPoints(req.params.parentId);
        res.json({ success: true, data: points });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add loyalty points
router.post('/points/add', authenticate, authorize(['ADMIN', 'COACH']), async (req: Request, res: Response) => {
    try {
        const result = await service.addLoyaltyPoints(req.body.parentId, req.body.points, req.body.reason);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get leaderboard
router.get('/leaderboard', authenticate, async (req: Request, res: Response) => {
    try {
        const leaderboard = await service.getLeaderboard(req.query.period as string);
        res.json({ success: true, data: leaderboard });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create challenge
router.post('/challenges', authenticate, authorize(['ADMIN', 'COACH']), async (req: Request, res: Response) => {
    try {
        const challenge = await service.createChallenge(req.body);
        res.json({ success: true, data: challenge });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get challenges
router.get('/challenges', authenticate, async (req: Request, res: Response) => {
    try {
        const challenges = await service.getChallenges();
        res.json({ success: true, data: challenges });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Join challenge
router.post('/challenges/:challengeId/join', authenticate, authorize(['PARENT']), async (req: Request, res: Response) => {
    try {
        const result = await service.joinChallenge(req.params.challengeId, req.body.parentId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get tier status
router.get('/tier/:parentId', authenticate, async (req: Request, res: Response) => {
    try {
        const tier = await service.getTierStatus(req.params.parentId);
        res.json({ success: true, data: tier });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get exclusive perks
router.get('/perks/:parentId', authenticate, async (req: Request, res: Response) => {
    try {
        const perks = await service.getExclusivePerks(req.params.parentId);
        res.json({ success: true, data: perks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
