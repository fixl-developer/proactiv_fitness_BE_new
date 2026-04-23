import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';

describe('Marketing & Growth Engine', () => {
    let service: MarketingService;
    let controller: MarketingController;

    beforeEach(() => {
        service = new MarketingService();
        controller = new MarketingController();
    });

    it('should create SEO page', async () => {
        const result = await service.createSEOPage({
            centerId: 'center-1',
            programId: 'prog-1',
            programName: 'Gymnastics',
            slug: 'gymnastics',
            title: 'Learn Gymnastics',
            metaDescription: 'Best gymnastics program',
            metaKeywords: ['gymnastics', 'fitness'],
            content: 'Content here',
            images: [],
            ageGroup: '5-10',
            skillLevel: 'beginner',
            duration: '8 weeks',
            pricing: 99
        });
        expect(result.pageId).toBeDefined();
    });

    it('should create campaign', async () => {
        const result = await service.createCampaign({
            centerId: 'center-1',
            campaignName: 'Summer Campaign',
            campaignType: 'email',
            startDate: new Date(),
            endDate: new Date(),
            budget: 1000
        });
        expect(result.campaignId).toBeDefined();
    });

    it('should create referral code', async () => {
        const result = await service.createReferralCode('user-1', 'John', 'john@example.com');
        expect(result.referralCode).toBeDefined();
    });

    it('should create promo code', async () => {
        const result = await service.createPromoCode({
            centerId: 'center-1',
            code: 'SAVE20',
            description: '20% off',
            discountType: 'percentage',
            discountValue: 20,
            maxUses: 100,
            applicablePrograms: [],
            applicableUserTypes: [],
            startDate: new Date(),
            endDate: new Date()
        });
        expect(result.promoId).toBeDefined();
    });

    it('should register affiliate', async () => {
        const result = await service.registerAffiliate({
            centerId: 'center-1',
            affiliateName: 'John Influencer',
            affiliateEmail: 'john@influencer.com',
            affiliateType: 'influencer',
            commissionRate: 10,
            commissionType: 'percentage'
        });
        expect(result.affiliateId).toBeDefined();
    });

    it('should create event', async () => {
        const result = await service.createEvent({
            centerId: 'center-1',
            eventName: 'Summer Workshop',
            eventType: 'workshop',
            description: 'Learn gymnastics',
            eventDate: new Date(),
            eventTime: '10:00 AM',
            location: 'Center 1',
            capacity: 50,
            images: []
        });
        expect(result.eventId).toBeDefined();
    });

    it('should create email sequence', async () => {
        const result = await service.createEmailSequence({
            centerId: 'center-1',
            sequenceName: 'Welcome Series',
            sequenceType: 'welcome',
            triggerEvent: 'signup',
            emails: []
        });
        expect(result.sequenceId).toBeDefined();
    });

    it('should create SMS sequence', async () => {
        const result = await service.createSMSSequence({
            centerId: 'center-1',
            sequenceName: 'Reminder Series',
            sequenceType: 'reminder',
            triggerEvent: 'booking',
            messages: []
        });
        expect(result.sequenceId).toBeDefined();
    });

    it('should create loyalty program', async () => {
        const result = await service.createLoyaltyProgram({
            centerId: 'center-1',
            programName: 'Gold Rewards',
            pointsPerDollar: 1,
            redeemRate: 100,
            tiers: []
        });
        expect(result.loyaltyId).toBeDefined();
    });

    it('should create reward', async () => {
        const result = await service.createReward({
            centerId: 'center-1',
            rewardName: 'Free Class',
            rewardType: 'free_class',
            pointsRequired: 100,
            quantity: 50,
            description: 'One free class',
            image: 'image.jpg'
        });
        expect(result.rewardId).toBeDefined();
    });

    it('should create offer', async () => {
        const result = await service.createOffer({
            centerId: 'center-1',
            offerName: 'Summer Sale',
            offerType: 'discount',
            description: '30% off',
            discountType: 'percentage',
            discountValue: 30,
            applicablePrograms: [],
            startDate: new Date(),
            endDate: new Date(),
            maxRedemptions: 100
        });
        expect(result.offerId).toBeDefined();
    });

    it('should create segment', async () => {
        const result = await service.createSegment({
            centerId: 'center-1',
            segmentName: 'High Value',
            segmentType: 'behavioral',
            criteria: {}
        });
        expect(result.segmentId).toBeDefined();
    });

    it('should track growth metric', async () => {
        const result = await service.trackGrowthMetric({
            centerId: 'center-1',
            metricType: 'acquisition',
            period: 'daily',
            value: 50,
            target: 100
        });
        expect(result.metricId).toBeDefined();
    });

    it('should handle controller requests', async () => {
        const req = { body: { centerId: 'center-1' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        await controller.createCampaign(req, res);
        expect(res.status).toHaveBeenCalled();
    });
});
