import { MarketingController } from './marketing.controller';

export class MarketingRoutes {
    private controller: MarketingController;

    constructor() {
        this.controller = new MarketingController();
    }

    public getRoutes() {
        return [
            // SEO Pages
            { method: 'POST', path: '/api/marketing/seo-pages', handler: (req: any, res: any) => this.controller.createSEOPage(req, res) },
            { method: 'PUT', path: '/api/marketing/seo-pages/:pageId/publish', handler: (req: any, res: any) => this.controller.publishSEOPage(req, res) },
            { method: 'PUT', path: '/api/marketing/seo-pages/:pageId', handler: (req: any, res: any) => this.controller.updateSEOPage(req, res) },
            { method: 'POST', path: '/api/marketing/seo-pages/:pageId/view', handler: (req: any, res: any) => this.controller.trackPageView(req, res) },
            { method: 'GET', path: '/api/marketing/seo-pages/:pageId/analytics', handler: (req: any, res: any) => this.controller.getSEOPageAnalytics(req, res) },

            // Referral Program
            { method: 'POST', path: '/api/marketing/referral/code', handler: (req: any, res: any) => this.controller.createReferralCode(req, res) },
            { method: 'POST', path: '/api/marketing/referral/track', handler: (req: any, res: any) => this.controller.trackReferral(req, res) },
            { method: 'PUT', path: '/api/marketing/referral/:referralId/complete', handler: (req: any, res: any) => this.controller.completeReferral(req, res) },
            { method: 'GET', path: '/api/marketing/referral/stats', handler: (req: any, res: any) => this.controller.getReferralStats(req, res) },

            // Promo Codes
            { method: 'POST', path: '/api/marketing/promo-codes', handler: (req: any, res: any) => this.controller.createPromoCode(req, res) },
            { method: 'POST', path: '/api/marketing/promo-codes/validate', handler: (req: any, res: any) => this.controller.validatePromoCode(req, res) },
            { method: 'POST', path: '/api/marketing/promo-codes/apply', handler: (req: any, res: any) => this.controller.applyPromoCode(req, res) },
            { method: 'PUT', path: '/api/marketing/promo-codes/:promoId/deactivate', handler: (req: any, res: any) => this.controller.deactivatePromoCode(req, res) },

            // Campaigns
            { method: 'POST', path: '/api/marketing/campaigns', handler: (req: any, res: any) => this.controller.createCampaign(req, res) },
            { method: 'PUT', path: '/api/marketing/campaigns/:campaignId/metrics', handler: (req: any, res: any) => this.controller.updateCampaignMetrics(req, res) },
            { method: 'GET', path: '/api/marketing/campaigns/:campaignId/roi', handler: (req: any, res: any) => this.controller.getCampaignROI(req, res) },
            { method: 'GET', path: '/api/marketing/campaigns/compare', handler: (req: any, res: any) => this.controller.compareCampaigns(req, res) },

            // Affiliates
            { method: 'POST', path: '/api/marketing/affiliates', handler: (req: any, res: any) => this.controller.registerAffiliate(req, res) },
            { method: 'POST', path: '/api/marketing/affiliates/track', handler: (req: any, res: any) => this.controller.trackAffiliateReferral(req, res) },
            { method: 'GET', path: '/api/marketing/affiliates/:affiliateId/earnings', handler: (req: any, res: any) => this.controller.calculateAffiliateEarnings(req, res) },
            { method: 'POST', path: '/api/marketing/affiliates/:affiliateId/payout', handler: (req: any, res: any) => this.controller.payoutAffiliate(req, res) },

            // Events
            { method: 'POST', path: '/api/marketing/events', handler: (req: any, res: any) => this.controller.createEvent(req, res) },
            { method: 'PUT', path: '/api/marketing/events/:eventId/publish', handler: (req: any, res: any) => this.controller.publishEvent(req, res) },
            { method: 'POST', path: '/api/marketing/events/:eventId/register', handler: (req: any, res: any) => this.controller.registerForEvent(req, res) },
            { method: 'GET', path: '/api/marketing/events/:eventId/attendees', handler: (req: any, res: any) => this.controller.getEventAttendees(req, res) },

            // Email Sequences
            { method: 'POST', path: '/api/marketing/email-sequences', handler: (req: any, res: any) => this.controller.createEmailSequence(req, res) },
            { method: 'PUT', path: '/api/marketing/email-sequences/:sequenceId/activate', handler: (req: any, res: any) => this.controller.activateEmailSequence(req, res) },
            { method: 'POST', path: '/api/marketing/email-sequences/send', handler: (req: any, res: any) => this.controller.sendEmailSequence(req, res) },
            { method: 'GET', path: '/api/marketing/email-sequences/:sequenceId/metrics', handler: (req: any, res: any) => this.controller.getEmailSequenceMetrics(req, res) },

            // SMS Sequences
            { method: 'POST', path: '/api/marketing/sms-sequences', handler: (req: any, res: any) => this.controller.createSMSSequence(req, res) },
            { method: 'PUT', path: '/api/marketing/sms-sequences/:sequenceId/activate', handler: (req: any, res: any) => this.controller.activateSMSSequence(req, res) },
            { method: 'POST', path: '/api/marketing/sms-sequences/send', handler: (req: any, res: any) => this.controller.sendSMSSequence(req, res) },

            // Loyalty
            { method: 'POST', path: '/api/marketing/loyalty-programs', handler: (req: any, res: any) => this.controller.createLoyaltyProgram(req, res) },
            { method: 'POST', path: '/api/marketing/loyalty/points/add', handler: (req: any, res: any) => this.controller.addLoyaltyPoints(req, res) },
            { method: 'POST', path: '/api/marketing/loyalty/points/redeem', handler: (req: any, res: any) => this.controller.redeemLoyaltyPoints(req, res) },
            { method: 'GET', path: '/api/marketing/loyalty/:userId/balance', handler: (req: any, res: any) => this.controller.getUserLoyaltyBalance(req, res) },

            // Rewards
            { method: 'POST', path: '/api/marketing/rewards', handler: (req: any, res: any) => this.controller.createReward(req, res) },
            { method: 'POST', path: '/api/marketing/rewards/:rewardId/redeem', handler: (req: any, res: any) => this.controller.redeemReward(req, res) },
            { method: 'GET', path: '/api/marketing/rewards/available', handler: (req: any, res: any) => this.controller.getAvailableRewards(req, res) },

            // Analytics
            { method: 'POST', path: '/api/marketing/analytics/campaigns', handler: (req: any, res: any) => this.controller.generateCampaignAnalytics(req, res) },
            { method: 'GET', path: '/api/marketing/analytics/performance', handler: (req: any, res: any) => this.controller.getCampaignPerformance(req, res) },

            // Offers
            { method: 'POST', path: '/api/marketing/offers', handler: (req: any, res: any) => this.controller.createOffer(req, res) },
            { method: 'PUT', path: '/api/marketing/offers/:offerId/activate', handler: (req: any, res: any) => this.controller.activateOffer(req, res) },
            { method: 'GET', path: '/api/marketing/offers/active', handler: (req: any, res: any) => this.controller.getActiveOffers(req, res) },

            // Segments
            { method: 'POST', path: '/api/marketing/segments', handler: (req: any, res: any) => this.controller.createSegment(req, res) },
            { method: 'GET', path: '/api/marketing/segments/:segmentId/members', handler: (req: any, res: any) => this.controller.getSegmentMembers(req, res) },
            { method: 'POST', path: '/api/marketing/segments/target', handler: (req: any, res: any) => this.controller.targetSegmentWithCampaign(req, res) },

            // Growth Metrics
            { method: 'POST', path: '/api/marketing/metrics', handler: (req: any, res: any) => this.controller.trackGrowthMetric(req, res) },
            { method: 'GET', path: '/api/marketing/dashboard', handler: (req: any, res: any) => this.controller.getGrowthDashboard(req, res) },
            { method: 'GET', path: '/api/marketing/forecast', handler: (req: any, res: any) => this.controller.forecastGrowth(req, res) }
        ];
    }
}
