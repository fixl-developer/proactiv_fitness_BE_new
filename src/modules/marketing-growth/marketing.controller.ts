import { MarketingService } from './marketing.service';

export class MarketingController {
    private marketingService: MarketingService;

    constructor() {
        this.marketingService = new MarketingService();
    }

    // SEO Pages
    async createSEOPage(req: any, res: any): Promise<void> {
        try {
            const page = await this.marketingService.createSEOPage(req.body);
            res.status(201).json({ success: true, data: page });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async publishSEOPage(req: any, res: any): Promise<void> {
        try {
            const { pageId } = req.params;
            const page = await this.marketingService.publishSEOPage(pageId);
            res.status(200).json({ success: true, data: page });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async updateSEOPage(req: any, res: any): Promise<void> {
        try {
            const { pageId } = req.params;
            const page = await this.marketingService.updateSEOPage(pageId, req.body);
            res.status(200).json({ success: true, data: page });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async trackPageView(req: any, res: any): Promise<void> {
        try {
            const { pageId } = req.params;
            await this.marketingService.trackPageView(pageId);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getSEOPageAnalytics(req: any, res: any): Promise<void> {
        try {
            const { pageId } = req.params;
            const analytics = await this.marketingService.getSEOPageAnalytics(pageId);
            res.status(200).json({ success: true, data: analytics });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // Referral Program
    async createReferralCode(req: any, res: any): Promise<void> {
        try {
            const { referrerId, referrerName, referrerEmail } = req.body;
            const referral = await this.marketingService.createReferralCode(referrerId, referrerName, referrerEmail);
            res.status(201).json({ success: true, data: referral });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async trackReferral(req: any, res: any): Promise<void> {
        try {
            const { referralCode, refereeName, refereeEmail } = req.body;
            const referral = await this.marketingService.trackReferral(referralCode, refereeName, refereeEmail);
            res.status(201).json({ success: true, data: referral });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async completeReferral(req: any, res: any): Promise<void> {
        try {
            const { referralId } = req.params;
            const referral = await this.marketingService.completeReferral(referralId);
            res.status(200).json({ success: true, data: referral });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getReferralStats(req: any, res: any): Promise<void> {
        try {
            const { centerId } = req.query;
            const stats = await this.marketingService.getReferralStats(centerId as string);
            res.status(200).json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // Promo Codes
    async createPromoCode(req: any, res: any): Promise<void> {
        try {
            const code = await this.marketingService.createPromoCode(req.body);
            res.status(201).json({ success: true, data: code });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async validatePromoCode(req: any, res: any): Promise<void> {
        try {
            const { code, centerId } = req.body;
            const isValid = await this.marketingService.validatePromoCode(code, centerId);
            res.status(200).json({ success: true, data: { isValid } });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async applyPromoCode(req: any, res: any): Promise<void> {
        try {
            const { code, amount } = req.body;
            const discountedAmount = await this.marketingService.applyPromoCode(code, amount);
            res.status(200).json({ success: true, data: { discountedAmount } });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async deactivatePromoCode(req: any, res: any): Promise<void> {
        try {
            const { promoId } = req.params;
            const code = await this.marketingService.deactivatePromoCode(promoId);
            res.status(200).json({ success: true, data: code });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // Campaigns
    async createCampaign(req: any, res: any): Promise<void> {
        try {
            const campaign = await this.marketingService.createCampaign(req.body);
            res.status(201).json({ success: true, data: campaign });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async updateCampaignMetrics(req: any, res: any): Promise<void> {
        try {
            const { campaignId } = req.params;
            const campaign = await this.marketingService.updateCampaignMetrics(campaignId, req.body);
            res.status(200).json({ success: true, data: campaign });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getCampaignROI(req: any, res: any): Promise<void> {
        try {
            const { campaignId } = req.params;
            const roi = await this.marketingService.getCampaignROI(campaignId);
            res.status(200).json({ success: true, data: { roi } });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async compareCampaigns(req: any, res: any): Promise<void> {
        try {
            const { centerId } = req.query;
            const campaigns = await this.marketingService.compareCampaigns(centerId as string);
            res.status(200).json({ success: true, data: campaigns });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // Affiliates
    async registerAffiliate(req: any, res: any): Promise<void> {
        try {
            const affiliate = await this.marketingService.registerAffiliate(req.body);
            res.status(201).json({ success: true, data: affiliate });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async trackAffiliateReferral(req: any, res: any): Promise<void> {
        try {
            const { trackingCode } = req.body;
            await this.marketingService.trackAffiliateReferral(trackingCode);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async calculateAffiliateEarnings(req: any, res: any): Promise<void> {
        try {
            const { affiliateId } = req.params;
            const earnings = await this.marketingService.calculateAffiliateEarnings(affiliateId);
            res.status(200).json({ success: true, data: { earnings } });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async payoutAffiliate(req: any, res: any): Promise<void> {
        try {
            const { affiliateId } = req.params;
            const payout = await this.marketingService.payoutAffiliate(affiliateId);
            res.status(200).json({ success: true, data: payout });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // Events
    async createEvent(req: any, res: any): Promise<void> {
        try {
            const event = await this.marketingService.createEvent(req.body);
            res.status(201).json({ success: true, data: event });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async publishEvent(req: any, res: any): Promise<void> {
        try {
            const { eventId } = req.params;
            const event = await this.marketingService.publishEvent(eventId);
            res.status(200).json({ success: true, data: event });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async registerForEvent(req: any, res: any): Promise<void> {
        try {
            const { eventId } = req.params;
            const { userId } = req.body;
            const registration = await this.marketingService.registerForEvent(eventId, userId);
            res.status(201).json({ success: true, data: registration });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getEventAttendees(req: any, res: any): Promise<void> {
        try {
            const { eventId } = req.params;
            const attendees = await this.marketingService.getEventAttendees(eventId);
            res.status(200).json({ success: true, data: attendees });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // Email Sequences
    async createEmailSequence(req: any, res: any): Promise<void> {
        try {
            const sequence = await this.marketingService.createEmailSequence(req.body);
            res.status(201).json({ success: true, data: sequence });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async activateEmailSequence(req: any, res: any): Promise<void> {
        try {
            const { sequenceId } = req.params;
            const sequence = await this.marketingService.activateEmailSequence(sequenceId);
            res.status(200).json({ success: true, data: sequence });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async sendEmailSequence(req: any, res: any): Promise<void> {
        try {
            const { sequenceId, userId } = req.body;
            await this.marketingService.sendEmailSequence(sequenceId, userId);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getEmailSequenceMetrics(req: any, res: any): Promise<void> {
        try {
            const { sequenceId } = req.params;
            const metrics = await this.marketingService.getEmailSequenceMetrics(sequenceId);
            res.status(200).json({ success: true, data: metrics });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // SMS Sequences
    async createSMSSequence(req: any, res: any): Promise<void> {
        try {
            const sequence = await this.marketingService.createSMSSequence(req.body);
            res.status(201).json({ success: true, data: sequence });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async activateSMSSequence(req: any, res: any): Promise<void> {
        try {
            const { sequenceId } = req.params;
            const sequence = await this.marketingService.activateSMSSequence(sequenceId);
            res.status(200).json({ success: true, data: sequence });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async sendSMSSequence(req: any, res: any): Promise<void> {
        try {
            const { sequenceId, userId } = req.body;
            await this.marketingService.sendSMSSequence(sequenceId, userId);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // Loyalty
    async createLoyaltyProgram(req: any, res: any): Promise<void> {
        try {
            const program = await this.marketingService.createLoyaltyProgram(req.body);
            res.status(201).json({ success: true, data: program });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async addLoyaltyPoints(req: any, res: any): Promise<void> {
        try {
            const { userId, points } = req.body;
            const balance = await this.marketingService.addLoyaltyPoints(userId, points);
            res.status(200).json({ success: true, data: { balance } });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async redeemLoyaltyPoints(req: any, res: any): Promise<void> {
        try {
            const { userId, points } = req.body;
            const result = await this.marketingService.redeemLoyaltyPoints(userId, points);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getUserLoyaltyBalance(req: any, res: any): Promise<void> {
        try {
            const { userId } = req.params;
            const balance = await this.marketingService.getUserLoyaltyBalance(userId);
            res.status(200).json({ success: true, data: { balance } });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // Rewards
    async createReward(req: any, res: any): Promise<void> {
        try {
            const reward = await this.marketingService.createReward(req.body);
            res.status(201).json({ success: true, data: reward });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async redeemReward(req: any, res: any): Promise<void> {
        try {
            const { rewardId } = req.params;
            const { userId } = req.body;
            const result = await this.marketingService.redeemReward(rewardId, userId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getAvailableRewards(req: any, res: any): Promise<void> {
        try {
            const { centerId } = req.query;
            const rewards = await this.marketingService.getAvailableRewards(centerId as string);
            res.status(200).json({ success: true, data: rewards });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // Analytics
    async generateCampaignAnalytics(req: any, res: any): Promise<void> {
        try {
            const { campaignId, period } = req.body;
            const analytics = await this.marketingService.generateCampaignAnalytics(campaignId, period);
            res.status(201).json({ success: true, data: analytics });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getCampaignPerformance(req: any, res: any): Promise<void> {
        try {
            const { centerId } = req.query;
            const performance = await this.marketingService.getCampaignPerformance(centerId as string);
            res.status(200).json({ success: true, data: performance });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // Offers
    async createOffer(req: any, res: any): Promise<void> {
        try {
            const offer = await this.marketingService.createOffer(req.body);
            res.status(201).json({ success: true, data: offer });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async activateOffer(req: any, res: any): Promise<void> {
        try {
            const { offerId } = req.params;
            const offer = await this.marketingService.activateOffer(offerId);
            res.status(200).json({ success: true, data: offer });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getActiveOffers(req: any, res: any): Promise<void> {
        try {
            const { centerId } = req.query;
            const offers = await this.marketingService.getActiveOffers(centerId as string);
            res.status(200).json({ success: true, data: offers });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // Segments
    async createSegment(req: any, res: any): Promise<void> {
        try {
            const segment = await this.marketingService.createSegment(req.body);
            res.status(201).json({ success: true, data: segment });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getSegmentMembers(req: any, res: any): Promise<void> {
        try {
            const { segmentId } = req.params;
            const members = await this.marketingService.getSegmentMembers(segmentId);
            res.status(200).json({ success: true, data: members });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async targetSegmentWithCampaign(req: any, res: any): Promise<void> {
        try {
            const { segmentId, campaignId } = req.body;
            await this.marketingService.targetSegmentWithCampaign(segmentId, campaignId);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // Growth Metrics
    async trackGrowthMetric(req: any, res: any): Promise<void> {
        try {
            const metric = await this.marketingService.trackGrowthMetric(req.body);
            res.status(201).json({ success: true, data: metric });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getGrowthDashboard(req: any, res: any): Promise<void> {
        try {
            const { centerId } = req.query;
            const dashboard = await this.marketingService.getGrowthDashboard(centerId as string);
            res.status(200).json({ success: true, data: dashboard });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async forecastGrowth(req: any, res: any): Promise<void> {
        try {
            const { centerId, months } = req.query;
            const forecast = await this.marketingService.forecastGrowth(centerId as string, parseInt(months as string));
            res.status(200).json({ success: true, data: forecast });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }
}
