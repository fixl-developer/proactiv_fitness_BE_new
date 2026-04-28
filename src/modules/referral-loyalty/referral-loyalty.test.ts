import { ReferralLoyaltyService } from './referral-loyalty.service';

describe('ReferralLoyaltyService', () => {
    let service: ReferralLoyaltyService;

    beforeEach(() => {
        service = new ReferralLoyaltyService();
    });

    describe('createReferralLink', () => {
        it('should create a referral link', async () => {
            const link = await service.createReferralLink('parent123');
            expect(link).toBeDefined();
            expect(link.parentId).toBe('parent123');
            expect(link.referralCode).toBeDefined();
        });
    });

    describe('trackReferral', () => {
        it('should track a referral', async () => {
            const link = await service.createReferralLink('parent123');
            const result = await service.trackReferral(link.referralCode, 'newparent123');
            expect(result.success).toBe(true);
            expect(result.pointsAwarded).toBe(500);
        });
    });

    describe('getLoyaltyPoints', () => {
        it('should get loyalty points', async () => {
            const points = await service.getLoyaltyPoints('parent123');
            expect(points).toBeDefined();
            expect(points.parentId).toBe('parent123');
        });
    });

    describe('addLoyaltyPoints', () => {
        it('should add loyalty points', async () => {
            const result = await service.addLoyaltyPoints('parent123', 100, 'test');
            expect(result).toBeDefined();
            expect(result.totalPoints).toBeGreaterThanOrEqual(100);
        });
    });

    describe('getTierStatus', () => {
        it('should get tier status', async () => {
            const tier = await service.getTierStatus('parent123');
            expect(tier).toBeDefined();
            expect(tier.currentTier).toBeDefined();
        });
    });

    describe('createChallenge', () => {
        it('should create a challenge', async () => {
            const challenge = await service.createChallenge({
                title: 'Attendance Challenge',
                description: 'Attend 10 classes',
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                objective: 'Attend 10 classes',
                reward: 500
            });
            expect(challenge).toBeDefined();
            expect(challenge.title).toBe('Attendance Challenge');
        });
    });
});
