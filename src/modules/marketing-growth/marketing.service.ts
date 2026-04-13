import {
    ISEOProgramPage, IReferralProgram, IPromoCode, ICampaignROI,
    IAffiliateTracking, ICommunityEvent, IEmailSequence, ISMSSequence,
    ILoyaltyProgram, IRewardsCatalog, ICampaignAnalytics, IPromotionalOffer,
    ICustomerSegment, IGrowthMetric, ILoyaltyMember,
    PageView, SEOPage, ReferralProgram, PromoCode, CampaignROI,
    AffiliateTracking, CommunityEvent, EmailSequence, SMSSequence,
    LoyaltyProgram, LoyaltyMember, RewardsCatalog, CampaignAnalytics,
    PromotionalOffer, CustomerSegment, GrowthMetric
} from './marketing.model';

export class MarketingService {
    // ==================== SEO PROGRAM PAGES ====================

    async createSEOPage(pageData: Partial<ISEOProgramPage>): Promise<ISEOProgramPage> {
        try {
            const page = new SEOPage({
                pageId: `PAGE-${Date.now()}`,
                ...pageData,
                isPublished: false,
                viewCount: 0,
                conversionRate: 0,
            });
            return await page.save();
        } catch (error) {
            throw new Error(`Failed to create SEO page: ${(error as Error).message}`);
        }
    }

    async publishSEOPage(pageId: string): Promise<ISEOProgramPage> {
        try {
            const page = await SEOPage.findOneAndUpdate(
                { pageId },
                { isPublished: true, updatedAt: new Date() },
                { new: true }
            );
            if (!page) {
                throw new Error(`SEO page not found: ${pageId}`);
            }
            return page;
        } catch (error) {
            throw new Error(`Failed to publish SEO page: ${(error as Error).message}`);
        }
    }

    async updateSEOPage(pageId: string, updates: Partial<ISEOProgramPage>): Promise<ISEOProgramPage> {
        try {
            const page = await SEOPage.findOneAndUpdate(
                { pageId },
                { ...updates, updatedAt: new Date() },
                { new: true }
            );
            if (!page) {
                throw new Error(`SEO page not found: ${pageId}`);
            }
            return page;
        } catch (error) {
            throw new Error(`Failed to update SEO page: ${(error as Error).message}`);
        }
    }

    async trackPageView(pageId: string, url?: string, userId?: string, sessionId?: string, referrer?: string, userAgent?: string): Promise<void> {
        try {
            const pageView = new PageView({
                url: url || '',
                pageId,
                userId,
                sessionId: sessionId || `SESSION-${Date.now()}`,
                referrer,
                userAgent,
                timestamp: new Date(),
            });
            await pageView.save();

            await SEOPage.findOneAndUpdate(
                { pageId },
                { $inc: { viewCount: 1 } }
            );
        } catch (error) {
            throw new Error(`Failed to track page view: ${(error as Error).message}`);
        }
    }

    async getSEOPageAnalytics(pageId: string): Promise<any> {
        try {
            const page = await SEOPage.findOne({ pageId });
            if (!page) {
                throw new Error(`SEO page not found: ${pageId}`);
            }

            const totalViews = await PageView.countDocuments({ pageId });

            return {
                views: totalViews,
                conversions: Math.floor(totalViews * (page.conversionRate / 100)),
                conversionRate: page.conversionRate,
            };
        } catch (error) {
            throw new Error(`Failed to get SEO page analytics: ${(error as Error).message}`);
        }
    }

    // ==================== REFERRAL PROGRAM ====================

    async createReferralCode(referrerId: string, referrerName: string, referrerEmail: string): Promise<IReferralProgram> {
        try {
            const referral = new ReferralProgram({
                referralId: `REF-${Date.now()}`,
                referrerId,
                referrerName,
                referrerEmail,
                referralCode: `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                status: 'pending',
                rewardType: 'discount',
                rewardValue: 0,
                rewardCurrency: 'USD',
                referralDate: new Date(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            });
            return await referral.save();
        } catch (error) {
            throw new Error(`Failed to create referral code: ${(error as Error).message}`);
        }
    }

    async trackReferral(referralCode: string, refereeName: string, refereeEmail: string): Promise<IReferralProgram> {
        try {
            const referral = await ReferralProgram.findOneAndUpdate(
                { referralCode, status: 'pending' },
                {
                    refereeName,
                    refereeEmail,
                    updatedAt: new Date(),
                },
                { new: true }
            );
            if (!referral) {
                throw new Error(`Referral not found or already used: ${referralCode}`);
            }
            return referral;
        } catch (error) {
            throw new Error(`Failed to track referral: ${(error as Error).message}`);
        }
    }

    async completeReferral(referralId: string): Promise<IReferralProgram> {
        try {
            const referral = await ReferralProgram.findOneAndUpdate(
                { referralId },
                {
                    status: 'completed',
                    completionDate: new Date(),
                    updatedAt: new Date(),
                },
                { new: true }
            );
            if (!referral) {
                throw new Error(`Referral not found: ${referralId}`);
            }
            return referral;
        } catch (error) {
            throw new Error(`Failed to complete referral: ${(error as Error).message}`);
        }
    }

    async getReferralStats(centerId: string): Promise<any> {
        try {
            const totalReferrals = await ReferralProgram.countDocuments({ centerId });
            const completedReferrals = await ReferralProgram.countDocuments({ centerId, status: 'completed' });
            const conversionRate = totalReferrals > 0 ? (completedReferrals / totalReferrals) * 100 : 0;

            return {
                totalReferrals,
                completedReferrals,
                conversionRate: Math.round(conversionRate * 100) / 100,
            };
        } catch (error) {
            throw new Error(`Failed to get referral stats: ${(error as Error).message}`);
        }
    }

    // ==================== PROMO CODES ====================

    async createPromoCode(codeData: Partial<IPromoCode>): Promise<IPromoCode> {
        try {
            const code = new PromoCode({
                promoId: `PROMO-${Date.now()}`,
                ...codeData,
                code: codeData.code || `PROMO${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                currentUses: 0,
                isActive: true,
                startDate: codeData.startDate || new Date(),
                endDate: codeData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });
            return await code.save();
        } catch (error) {
            throw new Error(`Failed to create promo code: ${(error as Error).message}`);
        }
    }

    async validatePromoCode(code: string, centerId: string): Promise<boolean> {
        try {
            const now = new Date();
            const promo = await PromoCode.findOne({
                code,
                centerId,
                isActive: true,
                startDate: { $lte: now },
                endDate: { $gte: now },
                $expr: { $lt: ['$currentUses', '$maxUses'] },
            });
            return !!promo;
        } catch (error) {
            throw new Error(`Failed to validate promo code: ${(error as Error).message}`);
        }
    }

    async applyPromoCode(code: string, amount: number): Promise<number> {
        try {
            const promo = await PromoCode.findOne({ code, isActive: true });
            if (!promo) {
                throw new Error(`Promo code not found or inactive: ${code}`);
            }

            if (promo.minPurchaseAmount && amount < promo.minPurchaseAmount) {
                throw new Error(`Minimum purchase amount not met: ${promo.minPurchaseAmount}`);
            }

            let discountedAmount = amount;
            if (promo.discountType === 'percentage') {
                discountedAmount = amount - (amount * promo.discountValue / 100);
            } else if (promo.discountType === 'fixed') {
                discountedAmount = Math.max(0, amount - promo.discountValue);
            } else if (promo.discountType === 'free_class') {
                discountedAmount = 0;
            }

            await PromoCode.findOneAndUpdate(
                { code },
                { $inc: { currentUses: 1 } }
            );

            return Math.round(discountedAmount * 100) / 100;
        } catch (error) {
            throw new Error(`Failed to apply promo code: ${(error as Error).message}`);
        }
    }

    async deactivatePromoCode(promoId: string): Promise<IPromoCode> {
        try {
            const code = await PromoCode.findOneAndUpdate(
                { promoId },
                { isActive: false, updatedAt: new Date() },
                { new: true }
            );
            if (!code) {
                throw new Error(`Promo code not found: ${promoId}`);
            }
            return code;
        } catch (error) {
            throw new Error(`Failed to deactivate promo code: ${(error as Error).message}`);
        }
    }

    // ==================== CAMPAIGN ROI ====================

    async createCampaign(campaignData: Partial<ICampaignROI>): Promise<ICampaignROI> {
        try {
            const campaign = new CampaignROI({
                campaignId: `CAMP-${Date.now()}`,
                ...campaignData,
                spend: 0,
                impressions: 0,
                clicks: 0,
                conversions: 0,
                revenue: 0,
                roi: 0,
                status: 'planning',
            });
            return await campaign.save();
        } catch (error) {
            throw new Error(`Failed to create campaign: ${(error as Error).message}`);
        }
    }

    async updateCampaignMetrics(campaignId: string, metrics: any): Promise<ICampaignROI> {
        try {
            const spend = metrics.spend || 0;
            const revenue = metrics.revenue || 0;
            const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;

            const campaign = await CampaignROI.findOneAndUpdate(
                { campaignId },
                {
                    spend,
                    impressions: metrics.impressions || 0,
                    clicks: metrics.clicks || 0,
                    conversions: metrics.conversions || 0,
                    revenue,
                    roi: Math.round(roi * 100) / 100,
                    status: 'active',
                    updatedAt: new Date(),
                },
                { new: true }
            );
            if (!campaign) {
                throw new Error(`Campaign not found: ${campaignId}`);
            }
            return campaign;
        } catch (error) {
            throw new Error(`Failed to update campaign metrics: ${(error as Error).message}`);
        }
    }

    async getCampaignROI(campaignId: string): Promise<number> {
        try {
            const campaign = await CampaignROI.findOne({ campaignId });
            if (!campaign) {
                throw new Error(`Campaign not found: ${campaignId}`);
            }
            return campaign.roi;
        } catch (error) {
            throw new Error(`Failed to get campaign ROI: ${(error as Error).message}`);
        }
    }

    async compareCampaigns(centerId: string): Promise<any[]> {
        try {
            const campaigns = await CampaignROI.find({ centerId })
                .sort({ roi: -1 })
                .lean();
            return campaigns;
        } catch (error) {
            throw new Error(`Failed to compare campaigns: ${(error as Error).message}`);
        }
    }

    // ==================== AFFILIATE TRACKING ====================

    async registerAffiliate(affiliateData: Partial<IAffiliateTracking>): Promise<IAffiliateTracking> {
        try {
            const affiliate = new AffiliateTracking({
                affiliateId: `AFF-${Date.now()}`,
                ...affiliateData,
                totalReferrals: 0,
                totalConversions: 0,
                totalEarnings: 0,
                status: 'active',
                trackingCode: `TRACK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            });
            return await affiliate.save();
        } catch (error) {
            throw new Error(`Failed to register affiliate: ${(error as Error).message}`);
        }
    }

    async trackAffiliateReferral(trackingCode: string): Promise<void> {
        try {
            const affiliate = await AffiliateTracking.findOneAndUpdate(
                { trackingCode, status: 'active' },
                { $inc: { totalReferrals: 1 }, updatedAt: new Date() }
            );
            if (!affiliate) {
                throw new Error(`Affiliate not found or inactive: ${trackingCode}`);
            }
        } catch (error) {
            throw new Error(`Failed to track affiliate referral: ${(error as Error).message}`);
        }
    }

    async calculateAffiliateEarnings(affiliateId: string): Promise<number> {
        try {
            const affiliate = await AffiliateTracking.findOne({ affiliateId });
            if (!affiliate) {
                throw new Error(`Affiliate not found: ${affiliateId}`);
            }

            let earnings = 0;
            if (affiliate.commissionType === 'percentage') {
                earnings = affiliate.totalConversions * affiliate.commissionRate;
            } else {
                earnings = affiliate.totalConversions * affiliate.commissionRate;
            }

            await AffiliateTracking.findOneAndUpdate(
                { affiliateId },
                { totalEarnings: earnings, updatedAt: new Date() }
            );

            return earnings;
        } catch (error) {
            throw new Error(`Failed to calculate affiliate earnings: ${(error as Error).message}`);
        }
    }

    async payoutAffiliate(affiliateId: string): Promise<any> {
        try {
            const affiliate = await AffiliateTracking.findOne({ affiliateId });
            if (!affiliate) {
                throw new Error(`Affiliate not found: ${affiliateId}`);
            }

            const payoutAmount = affiliate.totalEarnings;

            await AffiliateTracking.findOneAndUpdate(
                { affiliateId },
                { totalEarnings: 0, updatedAt: new Date() }
            );

            return {
                affiliateId,
                amount: payoutAmount,
                status: 'completed',
                paidAt: new Date(),
            };
        } catch (error) {
            throw new Error(`Failed to payout affiliate: ${(error as Error).message}`);
        }
    }

    // ==================== COMMUNITY EVENTS ====================

    async createEvent(eventData: Partial<ICommunityEvent>): Promise<ICommunityEvent> {
        try {
            const event = new CommunityEvent({
                eventId: `EVENT-${Date.now()}`,
                ...eventData,
                registeredCount: 0,
                attendees: [],
                status: 'planning',
            });
            return await event.save();
        } catch (error) {
            throw new Error(`Failed to create event: ${(error as Error).message}`);
        }
    }

    async publishEvent(eventId: string): Promise<ICommunityEvent> {
        try {
            const event = await CommunityEvent.findOneAndUpdate(
                { eventId },
                { status: 'published', updatedAt: new Date() },
                { new: true }
            );
            if (!event) {
                throw new Error(`Event not found: ${eventId}`);
            }
            return event;
        } catch (error) {
            throw new Error(`Failed to publish event: ${(error as Error).message}`);
        }
    }

    async registerForEvent(eventId: string, userId: string): Promise<any> {
        try {
            const event = await CommunityEvent.findOne({ eventId });
            if (!event) {
                throw new Error(`Event not found: ${eventId}`);
            }
            if (event.registeredCount >= event.capacity && event.capacity > 0) {
                throw new Error(`Event is at full capacity: ${eventId}`);
            }

            const updatedEvent = await CommunityEvent.findOneAndUpdate(
                { eventId },
                {
                    $addToSet: { attendees: userId },
                    $inc: { registeredCount: 1 },
                    updatedAt: new Date(),
                },
                { new: true }
            );

            return {
                eventId,
                userId,
                status: 'registered',
                registeredAt: new Date(),
            };
        } catch (error) {
            throw new Error(`Failed to register for event: ${(error as Error).message}`);
        }
    }

    async getEventAttendees(eventId: string): Promise<any[]> {
        try {
            const event = await CommunityEvent.findOne({ eventId });
            if (!event) {
                throw new Error(`Event not found: ${eventId}`);
            }
            return (event.attendees || []).map(userId => ({ userId, eventId }));
        } catch (error) {
            throw new Error(`Failed to get event attendees: ${(error as Error).message}`);
        }
    }

    // ==================== EMAIL SEQUENCES ====================

    async createEmailSequence(sequenceData: Partial<IEmailSequence>): Promise<IEmailSequence> {
        try {
            const sequence = new EmailSequence({
                sequenceId: `ESEQ-${Date.now()}`,
                ...sequenceData,
                status: 'draft',
                totalSent: 0,
                openRate: 0,
                clickRate: 0,
                conversionRate: 0,
            });
            return await sequence.save();
        } catch (error) {
            throw new Error(`Failed to create email sequence: ${(error as Error).message}`);
        }
    }

    async activateEmailSequence(sequenceId: string): Promise<IEmailSequence> {
        try {
            const sequence = await EmailSequence.findOneAndUpdate(
                { sequenceId },
                { status: 'active', updatedAt: new Date() },
                { new: true }
            );
            if (!sequence) {
                throw new Error(`Email sequence not found: ${sequenceId}`);
            }
            return sequence;
        } catch (error) {
            throw new Error(`Failed to activate email sequence: ${(error as Error).message}`);
        }
    }

    async sendEmailSequence(sequenceId: string, userId: string): Promise<void> {
        try {
            const sequence = await EmailSequence.findOne({ sequenceId, status: 'active' });
            if (!sequence) {
                throw new Error(`Active email sequence not found: ${sequenceId}`);
            }

            await EmailSequence.findOneAndUpdate(
                { sequenceId },
                { $inc: { totalSent: 1 }, updatedAt: new Date() }
            );
        } catch (error) {
            throw new Error(`Failed to send email sequence: ${(error as Error).message}`);
        }
    }

    async getEmailSequenceMetrics(sequenceId: string): Promise<any> {
        try {
            const sequence = await EmailSequence.findOne({ sequenceId });
            if (!sequence) {
                throw new Error(`Email sequence not found: ${sequenceId}`);
            }
            return {
                totalSent: sequence.totalSent,
                openRate: sequence.openRate,
                clickRate: sequence.clickRate,
                conversionRate: sequence.conversionRate,
            };
        } catch (error) {
            throw new Error(`Failed to get email sequence metrics: ${(error as Error).message}`);
        }
    }

    // ==================== SMS SEQUENCES ====================

    async createSMSSequence(sequenceData: Partial<ISMSSequence>): Promise<ISMSSequence> {
        try {
            const sequence = new SMSSequence({
                sequenceId: `SSEQ-${Date.now()}`,
                ...sequenceData,
                status: 'draft',
                totalSent: 0,
                deliveryRate: 0,
                clickRate: 0,
                conversionRate: 0,
            });
            return await sequence.save();
        } catch (error) {
            throw new Error(`Failed to create SMS sequence: ${(error as Error).message}`);
        }
    }

    async activateSMSSequence(sequenceId: string): Promise<ISMSSequence> {
        try {
            const sequence = await SMSSequence.findOneAndUpdate(
                { sequenceId },
                { status: 'active', updatedAt: new Date() },
                { new: true }
            );
            if (!sequence) {
                throw new Error(`SMS sequence not found: ${sequenceId}`);
            }
            return sequence;
        } catch (error) {
            throw new Error(`Failed to activate SMS sequence: ${(error as Error).message}`);
        }
    }

    async sendSMSSequence(sequenceId: string, userId: string): Promise<void> {
        try {
            const sequence = await SMSSequence.findOne({ sequenceId, status: 'active' });
            if (!sequence) {
                throw new Error(`Active SMS sequence not found: ${sequenceId}`);
            }

            await SMSSequence.findOneAndUpdate(
                { sequenceId },
                { $inc: { totalSent: 1 }, updatedAt: new Date() }
            );
        } catch (error) {
            throw new Error(`Failed to send SMS sequence: ${(error as Error).message}`);
        }
    }

    // ==================== LOYALTY PROGRAM ====================

    async createLoyaltyProgram(programData: Partial<ILoyaltyProgram>): Promise<ILoyaltyProgram> {
        try {
            const program = new LoyaltyProgram({
                loyaltyId: `LOYAL-${Date.now()}`,
                ...programData,
                status: 'active',
            });
            return await program.save();
        } catch (error) {
            throw new Error(`Failed to create loyalty program: ${(error as Error).message}`);
        }
    }

    async addLoyaltyPoints(userId: string, points: number, centerId?: string): Promise<number> {
        try {
            const member = await LoyaltyMember.findOneAndUpdate(
                { userId, ...(centerId ? { centerId } : {}) },
                {
                    $inc: { points },
                    $push: {
                        history: {
                            action: 'earn',
                            points,
                            description: `Earned ${points} points`,
                            date: new Date(),
                        },
                    },
                    updatedAt: new Date(),
                },
                { new: true, upsert: true }
            );
            return member.points;
        } catch (error) {
            throw new Error(`Failed to add loyalty points: ${(error as Error).message}`);
        }
    }

    async redeemLoyaltyPoints(userId: string, points: number): Promise<any> {
        try {
            const member = await LoyaltyMember.findOne({ userId });
            if (!member) {
                throw new Error(`Loyalty member not found: ${userId}`);
            }
            if (member.points < points) {
                throw new Error(`Insufficient points. Available: ${member.points}, Requested: ${points}`);
            }

            const updatedMember = await LoyaltyMember.findOneAndUpdate(
                { userId },
                {
                    $inc: { points: -points },
                    $push: {
                        history: {
                            action: 'redeem',
                            points,
                            description: `Redeemed ${points} points`,
                            date: new Date(),
                        },
                    },
                    updatedAt: new Date(),
                },
                { new: true }
            );

            return {
                userId,
                pointsRedeemed: points,
                remainingPoints: updatedMember!.points,
                status: 'completed',
            };
        } catch (error) {
            throw new Error(`Failed to redeem loyalty points: ${(error as Error).message}`);
        }
    }

    async getUserLoyaltyBalance(userId: string): Promise<number> {
        try {
            const member = await LoyaltyMember.findOne({ userId });
            return member ? member.points : 0;
        } catch (error) {
            throw new Error(`Failed to get user loyalty balance: ${(error as Error).message}`);
        }
    }

    // ==================== REWARDS CATALOG ====================

    async createReward(rewardData: Partial<IRewardsCatalog>): Promise<IRewardsCatalog> {
        try {
            const reward = new RewardsCatalog({
                rewardId: `REWARD-${Date.now()}`,
                ...rewardData,
                status: 'available',
            });
            return await reward.save();
        } catch (error) {
            throw new Error(`Failed to create reward: ${(error as Error).message}`);
        }
    }

    async redeemReward(rewardId: string, userId: string): Promise<any> {
        try {
            const reward = await RewardsCatalog.findOne({ rewardId, status: 'available' });
            if (!reward) {
                throw new Error(`Reward not found or unavailable: ${rewardId}`);
            }
            if (reward.quantity <= 0) {
                throw new Error(`Reward out of stock: ${rewardId}`);
            }

            const member = await LoyaltyMember.findOne({ userId });
            if (!member || member.points < reward.pointsRequired) {
                throw new Error(`Insufficient loyalty points for reward: ${rewardId}`);
            }

            await LoyaltyMember.findOneAndUpdate(
                { userId },
                {
                    $inc: { points: -reward.pointsRequired },
                    $push: {
                        history: {
                            action: 'redeem',
                            points: reward.pointsRequired,
                            description: `Redeemed reward: ${reward.rewardName}`,
                            date: new Date(),
                        },
                    },
                    updatedAt: new Date(),
                }
            );

            await RewardsCatalog.findOneAndUpdate(
                { rewardId },
                { $inc: { quantity: -1 }, updatedAt: new Date() }
            );

            return {
                rewardId,
                userId,
                rewardName: reward.rewardName,
                pointsSpent: reward.pointsRequired,
                status: 'redeemed',
                redeemedAt: new Date(),
            };
        } catch (error) {
            throw new Error(`Failed to redeem reward: ${(error as Error).message}`);
        }
    }

    async getAvailableRewards(centerId: string): Promise<IRewardsCatalog[]> {
        try {
            return await RewardsCatalog.find({
                centerId,
                status: 'available',
                quantity: { $gt: 0 },
            }).sort({ pointsRequired: 1 });
        } catch (error) {
            throw new Error(`Failed to get available rewards: ${(error as Error).message}`);
        }
    }

    // ==================== CAMPAIGN ANALYTICS ====================

    async generateCampaignAnalytics(campaignId: string, period: string): Promise<ICampaignAnalytics> {
        try {
            const campaign = await CampaignROI.findOne({ campaignId });
            if (!campaign) {
                throw new Error(`Campaign not found: ${campaignId}`);
            }

            const clicks = campaign.clicks || 0;
            const impressions = campaign.impressions || 0;
            const conversions = campaign.conversions || 0;
            const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
            const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;

            const analytics = new CampaignAnalytics({
                analyticsId: `CANALYTICS-${Date.now()}`,
                centerId: campaign.centerId,
                campaignId,
                campaignName: campaign.campaignName,
                period,
                date: new Date(),
                impressions,
                clicks,
                conversions,
                revenue: campaign.revenue,
                cost: campaign.spend,
                roi: campaign.roi,
                ctr: Math.round(ctr * 100) / 100,
                conversionRate: Math.round(conversionRate * 100) / 100,
            });
            return await analytics.save();
        } catch (error) {
            throw new Error(`Failed to generate campaign analytics: ${(error as Error).message}`);
        }
    }

    async getCampaignPerformance(centerId: string): Promise<any> {
        try {
            const campaigns = await CampaignROI.find({ centerId });
            const totalCampaigns = campaigns.length;

            if (totalCampaigns === 0) {
                return { totalCampaigns: 0, avgROI: 0, totalRevenue: 0 };
            }

            const totalROI = campaigns.reduce((sum, c) => sum + c.roi, 0);
            const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);

            return {
                totalCampaigns,
                avgROI: Math.round((totalROI / totalCampaigns) * 100) / 100,
                totalRevenue,
            };
        } catch (error) {
            throw new Error(`Failed to get campaign performance: ${(error as Error).message}`);
        }
    }

    // ==================== PROMOTIONAL OFFERS ====================

    async createOffer(offerData: Partial<IPromotionalOffer>): Promise<IPromotionalOffer> {
        try {
            const offer = new PromotionalOffer({
                offerId: `OFFER-${Date.now()}`,
                ...offerData,
                currentRedemptions: 0,
                status: 'active',
            });
            return await offer.save();
        } catch (error) {
            throw new Error(`Failed to create offer: ${(error as Error).message}`);
        }
    }

    async activateOffer(offerId: string): Promise<IPromotionalOffer> {
        try {
            const offer = await PromotionalOffer.findOneAndUpdate(
                { offerId },
                { status: 'active', updatedAt: new Date() },
                { new: true }
            );
            if (!offer) {
                throw new Error(`Offer not found: ${offerId}`);
            }
            return offer;
        } catch (error) {
            throw new Error(`Failed to activate offer: ${(error as Error).message}`);
        }
    }

    async getActiveOffers(centerId: string): Promise<IPromotionalOffer[]> {
        try {
            const now = new Date();
            return await PromotionalOffer.find({
                centerId,
                status: 'active',
                startDate: { $lte: now },
                endDate: { $gte: now },
            }).sort({ endDate: 1 });
        } catch (error) {
            throw new Error(`Failed to get active offers: ${(error as Error).message}`);
        }
    }

    // ==================== CUSTOMER SEGMENTS ====================

    async createSegment(segmentData: Partial<ICustomerSegment>): Promise<ICustomerSegment> {
        try {
            const segment = new CustomerSegment({
                segmentId: `SEG-${Date.now()}`,
                ...segmentData,
                memberCount: 0,
                members: [],
                targetedCampaigns: [],
            });
            return await segment.save();
        } catch (error) {
            throw new Error(`Failed to create segment: ${(error as Error).message}`);
        }
    }

    async getSegmentMembers(segmentId: string): Promise<any[]> {
        try {
            const segment = await CustomerSegment.findOne({ segmentId });
            if (!segment) {
                throw new Error(`Segment not found: ${segmentId}`);
            }
            return (segment.members || []).map(userId => ({ userId, segmentId }));
        } catch (error) {
            throw new Error(`Failed to get segment members: ${(error as Error).message}`);
        }
    }

    async targetSegmentWithCampaign(segmentId: string, campaignId: string): Promise<void> {
        try {
            const segment = await CustomerSegment.findOneAndUpdate(
                { segmentId },
                {
                    $addToSet: { targetedCampaigns: campaignId },
                    updatedAt: new Date(),
                }
            );
            if (!segment) {
                throw new Error(`Segment not found: ${segmentId}`);
            }
        } catch (error) {
            throw new Error(`Failed to target segment with campaign: ${(error as Error).message}`);
        }
    }

    // ==================== GROWTH METRICS ====================

    async trackGrowthMetric(metricData: Partial<IGrowthMetric>): Promise<IGrowthMetric> {
        try {
            const value = metricData.value || 0;
            const target = metricData.target || 0;
            const variance = value - target;

            let trend: 'up' | 'down' | 'stable' = 'stable';
            const previousMetric = await GrowthMetric.findOne({
                centerId: metricData.centerId,
                metricType: metricData.metricType,
            }).sort({ date: -1 });

            if (previousMetric) {
                if (value > previousMetric.value) trend = 'up';
                else if (value < previousMetric.value) trend = 'down';
            }

            const metric = new GrowthMetric({
                metricId: `METRIC-${Date.now()}`,
                ...metricData,
                variance,
                trend,
            });
            return await metric.save();
        } catch (error) {
            throw new Error(`Failed to track growth metric: ${(error as Error).message}`);
        }
    }

    async getGrowthDashboard(centerId: string): Promise<any> {
        try {
            const metricTypes = ['acquisition', 'retention', 'engagement', 'revenue', 'churn'] as const;
            const dashboard: any = {};

            for (const metricType of metricTypes) {
                const latestMetric = await GrowthMetric.findOne({
                    centerId,
                    metricType,
                }).sort({ date: -1 });

                dashboard[metricType] = latestMetric ? latestMetric.value : 0;
            }

            return dashboard;
        } catch (error) {
            throw new Error(`Failed to get growth dashboard: ${(error as Error).message}`);
        }
    }

    async forecastGrowth(centerId: string, months: number): Promise<any[]> {
        try {
            const metrics = await GrowthMetric.find({
                centerId,
                metricType: 'revenue',
                period: 'monthly',
            }).sort({ date: -1 }).limit(12);

            if (metrics.length === 0) {
                return [];
            }

            const avgGrowthRate = metrics.length > 1
                ? metrics.slice(0, -1).reduce((sum, m, i) => {
                    const prev = metrics[i + 1].value;
                    return sum + (prev > 0 ? (m.value - prev) / prev : 0);
                }, 0) / (metrics.length - 1)
                : 0;

            const lastValue = metrics[0].value;
            const forecast: any[] = [];

            for (let i = 1; i <= months; i++) {
                const forecastDate = new Date();
                forecastDate.setMonth(forecastDate.getMonth() + i);
                forecast.push({
                    month: forecastDate.toISOString().slice(0, 7),
                    projectedValue: Math.round(lastValue * Math.pow(1 + avgGrowthRate, i) * 100) / 100,
                    growthRate: Math.round(avgGrowthRate * 100 * 100) / 100,
                });
            }

            return forecast;
        } catch (error) {
            throw new Error(`Failed to forecast growth: ${(error as Error).message}`);
        }
    }
}
