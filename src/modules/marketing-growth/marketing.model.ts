import { Schema, model, Document } from 'mongoose';
import { baseSchemaOptions } from '../../shared/base/base.model';

// ==================== INTERFACES ====================

// PageView Model (for tracking individual page views)
export interface IPageView extends Document {
    url: string;
    pageId: string;
    userId?: string;
    sessionId: string;
    referrer?: string;
    userAgent?: string;
    timestamp: Date;
}

// SEO Program Page Model
export interface ISEOProgramPage extends Document {
    pageId: string;
    centerId: string;
    programId: string;
    programName: string;
    slug: string;
    title: string;
    metaDescription: string;
    metaKeywords: string[];
    content: string;
    images: string[];
    videoUrl?: string;
    ageGroup: string;
    skillLevel: string;
    duration: string;
    pricing: number;
    isPublished: boolean;
    viewCount: number;
    conversionRate: number;
    createdAt: Date;
    updatedAt: Date;
}

// Referral Program Model
export interface IReferralProgram extends Document {
    referralId: string;
    centerId: string;
    referrerId: string;
    referrerName: string;
    referrerEmail: string;
    refereeId?: string;
    refereeName?: string;
    refereeEmail?: string;
    referralCode: string;
    status: 'pending' | 'completed' | 'expired' | 'cancelled';
    rewardType: 'discount' | 'credit' | 'free_class' | 'merchandise';
    rewardValue: number;
    rewardCurrency: string;
    referralDate: Date;
    completionDate?: Date;
    expiryDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Promo Code Model
export interface IPromoCode extends Document {
    promoId: string;
    centerId: string;
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed' | 'free_class';
    discountValue: number;
    maxUses: number;
    currentUses: number;
    minPurchaseAmount?: number;
    applicablePrograms: string[];
    applicableUserTypes: string[];
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Campaign ROI Model
export interface ICampaignROI extends Document {
    campaignId: string;
    centerId: string;
    campaignName: string;
    campaignType: 'email' | 'sms' | 'social' | 'referral' | 'promo' | 'event';
    startDate: Date;
    endDate: Date;
    budget: number;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roi: number;
    status: 'planning' | 'active' | 'completed' | 'paused';
    createdAt: Date;
    updatedAt: Date;
}

// Affiliate Tracking Model
export interface IAffiliateTracking extends Document {
    affiliateId: string;
    centerId: string;
    affiliateName: string;
    affiliateEmail: string;
    affiliateType: 'influencer' | 'partner' | 'agency' | 'individual';
    commissionRate: number;
    commissionType: 'percentage' | 'fixed';
    totalReferrals: number;
    totalConversions: number;
    totalEarnings: number;
    status: 'active' | 'inactive' | 'suspended';
    trackingCode: string;
    createdAt: Date;
    updatedAt: Date;
}

// Community Event Model
export interface ICommunityEvent extends Document {
    eventId: string;
    centerId: string;
    eventName: string;
    eventType: 'workshop' | 'competition' | 'social' | 'fundraiser' | 'demo';
    description: string;
    eventDate: Date;
    eventTime: string;
    location: string;
    capacity: number;
    registeredCount: number;
    attendees: string[];
    images: string[];
    videoUrl?: string;
    status: 'planning' | 'published' | 'ongoing' | 'completed' | 'cancelled';
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Email Sequence Model
export interface IEmailSequence extends Document {
    sequenceId: string;
    centerId: string;
    sequenceName: string;
    sequenceType: 'welcome' | 'onboarding' | 'engagement' | 'retention' | 'win_back';
    triggerEvent: string;
    emails: EmailTemplate[];
    status: 'active' | 'inactive' | 'draft';
    totalSent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface EmailTemplate {
    templateId: string;
    subject: string;
    content: string;
    delayDays: number;
    order: number;
}

// SMS Sequence Model
export interface ISMSSequence extends Document {
    sequenceId: string;
    centerId: string;
    sequenceName: string;
    sequenceType: 'welcome' | 'reminder' | 'promotion' | 'engagement' | 'retention';
    triggerEvent: string;
    messages: SMSTemplate[];
    status: 'active' | 'inactive' | 'draft';
    totalSent: number;
    deliveryRate: number;
    clickRate: number;
    conversionRate: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface SMSTemplate {
    templateId: string;
    content: string;
    delayDays: number;
    order: number;
}

// Loyalty Program Model
export interface ILoyaltyProgram extends Document {
    loyaltyId: string;
    centerId: string;
    programName: string;
    pointsPerDollar: number;
    redeemRate: number;
    tiers: LoyaltyTier[];
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

export interface LoyaltyTier {
    tierId: string;
    tierName: string;
    minPoints: number;
    maxPoints: number;
    benefits: string[];
    discountPercentage: number;
}

// Loyalty Member Model (tracks per-user loyalty balances and history)
export interface ILoyaltyMember extends Document {
    userId: string;
    centerId: string;
    loyaltyId: string;
    points: number;
    tier: string;
    history: LoyaltyHistoryEntry[];
    createdAt: Date;
    updatedAt: Date;
}

export interface LoyaltyHistoryEntry {
    action: 'earn' | 'redeem';
    points: number;
    description: string;
    date: Date;
}

// Rewards Catalog Model
export interface IRewardsCatalog extends Document {
    rewardId: string;
    centerId: string;
    rewardName: string;
    rewardType: 'discount' | 'free_class' | 'merchandise' | 'experience' | 'credit';
    pointsRequired: number;
    quantity: number;
    description: string;
    image: string;
    status: 'available' | 'unavailable' | 'discontinued';
    createdAt: Date;
    updatedAt: Date;
}

// Campaign Analytics Model
export interface ICampaignAnalytics extends Document {
    analyticsId: string;
    centerId: string;
    campaignId: string;
    campaignName: string;
    period: 'daily' | 'weekly' | 'monthly';
    date: Date;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    cost: number;
    roi: number;
    ctr: number;
    conversionRate: number;
    createdAt: Date;
}

// Promotional Offer Model
export interface IPromotionalOffer extends Document {
    offerId: string;
    centerId: string;
    offerName: string;
    offerType: 'discount' | 'bundle' | 'seasonal' | 'flash' | 'loyalty';
    description: string;
    discountType: 'percentage' | 'fixed' | 'free_item';
    discountValue: number;
    applicablePrograms: string[];
    startDate: Date;
    endDate: Date;
    maxRedemptions: number;
    currentRedemptions: number;
    status: 'active' | 'inactive' | 'scheduled' | 'expired';
    createdAt: Date;
    updatedAt: Date;
}

// Customer Segment Model
export interface ICustomerSegment extends Document {
    segmentId: string;
    centerId: string;
    segmentName: string;
    segmentType: 'demographic' | 'behavioral' | 'geographic' | 'psychographic' | 'custom';
    criteria: SegmentCriteria;
    memberCount: number;
    members: string[];
    targetedCampaigns: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface SegmentCriteria {
    ageRange?: { min: number; max: number };
    location?: string[];
    purchaseHistory?: string;
    engagementLevel?: 'high' | 'medium' | 'low';
    customFilters?: any[];
}

// Growth Metric Model
export interface IGrowthMetric extends Document {
    metricId: string;
    centerId: string;
    metricType: 'acquisition' | 'retention' | 'engagement' | 'revenue' | 'churn';
    period: 'daily' | 'weekly' | 'monthly';
    date: Date;
    value: number;
    target: number;
    variance: number;
    trend: 'up' | 'down' | 'stable';
    createdAt: Date;
}

// ==================== SCHEMAS ====================

const pageViewSchema = new Schema<IPageView>({
    url: { type: String, required: true, index: true },
    pageId: { type: String, required: true, index: true },
    userId: { type: String, index: true },
    sessionId: { type: String, required: true, index: true },
    referrer: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
}, baseSchemaOptions);

const seoPageSchema = new Schema<ISEOProgramPage>({
    pageId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    programId: { type: String, required: true, index: true },
    programName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    metaDescription: { type: String, trim: true },
    metaKeywords: [{ type: String }],
    content: { type: String },
    images: [{ type: String }],
    videoUrl: { type: String, trim: true },
    ageGroup: { type: String, trim: true },
    skillLevel: { type: String, trim: true },
    duration: { type: String, trim: true },
    pricing: { type: Number, default: 0, min: 0 },
    isPublished: { type: Boolean, default: false, index: true },
    viewCount: { type: Number, default: 0, min: 0 },
    conversionRate: { type: Number, default: 0, min: 0 },
}, baseSchemaOptions);

const referralProgramSchema = new Schema<IReferralProgram>({
    referralId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    referrerId: { type: String, required: true, index: true },
    referrerName: { type: String, required: true, trim: true },
    referrerEmail: { type: String, required: true, trim: true },
    refereeId: { type: String, index: true },
    refereeName: { type: String, trim: true },
    refereeEmail: { type: String, trim: true },
    referralCode: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ['pending', 'completed', 'expired', 'cancelled'], default: 'pending', index: true },
    rewardType: { type: String, enum: ['discount', 'credit', 'free_class', 'merchandise'], required: true },
    rewardValue: { type: Number, default: 0, min: 0 },
    rewardCurrency: { type: String, default: 'USD' },
    referralDate: { type: Date, required: true },
    completionDate: { type: Date },
    expiryDate: { type: Date, required: true },
}, baseSchemaOptions);

const promoCodeSchema = new Schema<IPromoCode>({
    promoId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    code: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed', 'free_class'], required: true },
    discountValue: { type: Number, default: 0, min: 0 },
    maxUses: { type: Number, default: 100, min: 0 },
    currentUses: { type: Number, default: 0, min: 0 },
    minPurchaseAmount: { type: Number, min: 0 },
    applicablePrograms: [{ type: String }],
    applicableUserTypes: [{ type: String }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: String },
}, baseSchemaOptions);

const campaignROISchema = new Schema<ICampaignROI>({
    campaignId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    campaignName: { type: String, required: true, trim: true },
    campaignType: { type: String, enum: ['email', 'sms', 'social', 'referral', 'promo', 'event'], required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number, default: 0, min: 0 },
    spend: { type: Number, default: 0, min: 0 },
    impressions: { type: Number, default: 0, min: 0 },
    clicks: { type: Number, default: 0, min: 0 },
    conversions: { type: Number, default: 0, min: 0 },
    revenue: { type: Number, default: 0, min: 0 },
    roi: { type: Number, default: 0 },
    status: { type: String, enum: ['planning', 'active', 'completed', 'paused'], default: 'planning', index: true },
}, baseSchemaOptions);

const affiliateTrackingSchema = new Schema<IAffiliateTracking>({
    affiliateId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    affiliateName: { type: String, required: true, trim: true },
    affiliateEmail: { type: String, required: true, trim: true },
    affiliateType: { type: String, enum: ['influencer', 'partner', 'agency', 'individual'], required: true },
    commissionRate: { type: Number, default: 0, min: 0 },
    commissionType: { type: String, enum: ['percentage', 'fixed'], required: true },
    totalReferrals: { type: Number, default: 0, min: 0 },
    totalConversions: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active', index: true },
    trackingCode: { type: String, required: true, unique: true, index: true },
}, baseSchemaOptions);

const communityEventSchema = new Schema<ICommunityEvent>({
    eventId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    eventName: { type: String, required: true, trim: true },
    eventType: { type: String, enum: ['workshop', 'competition', 'social', 'fundraiser', 'demo'], required: true, index: true },
    description: { type: String, trim: true },
    eventDate: { type: Date, required: true, index: true },
    eventTime: { type: String, trim: true },
    location: { type: String, trim: true },
    capacity: { type: Number, default: 0, min: 0 },
    registeredCount: { type: Number, default: 0, min: 0 },
    attendees: [{ type: String }],
    images: [{ type: String }],
    videoUrl: { type: String, trim: true },
    status: { type: String, enum: ['planning', 'published', 'ongoing', 'completed', 'cancelled'], default: 'planning', index: true },
    createdBy: { type: String },
}, baseSchemaOptions);

const emailTemplateSubSchema = new Schema({
    templateId: { type: String, required: true },
    subject: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    delayDays: { type: Number, default: 0, min: 0 },
    order: { type: Number, required: true, min: 0 },
}, { _id: false });

const emailSequenceSchema = new Schema<IEmailSequence>({
    sequenceId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    sequenceName: { type: String, required: true, trim: true },
    sequenceType: { type: String, enum: ['welcome', 'onboarding', 'engagement', 'retention', 'win_back'], required: true, index: true },
    triggerEvent: { type: String, trim: true },
    emails: [emailTemplateSubSchema],
    status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'draft', index: true },
    totalSent: { type: Number, default: 0, min: 0 },
    openRate: { type: Number, default: 0, min: 0 },
    clickRate: { type: Number, default: 0, min: 0 },
    conversionRate: { type: Number, default: 0, min: 0 },
}, baseSchemaOptions);

const smsTemplateSubSchema = new Schema({
    templateId: { type: String, required: true },
    content: { type: String, required: true },
    delayDays: { type: Number, default: 0, min: 0 },
    order: { type: Number, required: true, min: 0 },
}, { _id: false });

const smsSequenceSchema = new Schema<ISMSSequence>({
    sequenceId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    sequenceName: { type: String, required: true, trim: true },
    sequenceType: { type: String, enum: ['welcome', 'reminder', 'promotion', 'engagement', 'retention'], required: true, index: true },
    triggerEvent: { type: String, trim: true },
    messages: [smsTemplateSubSchema],
    status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'draft', index: true },
    totalSent: { type: Number, default: 0, min: 0 },
    deliveryRate: { type: Number, default: 0, min: 0 },
    clickRate: { type: Number, default: 0, min: 0 },
    conversionRate: { type: Number, default: 0, min: 0 },
}, baseSchemaOptions);

const loyaltyTierSubSchema = new Schema({
    tierId: { type: String, required: true },
    tierName: { type: String, required: true, trim: true },
    minPoints: { type: Number, required: true, min: 0 },
    maxPoints: { type: Number, required: true, min: 0 },
    benefits: [{ type: String }],
    discountPercentage: { type: Number, default: 0, min: 0 },
}, { _id: false });

const loyaltyProgramSchema = new Schema<ILoyaltyProgram>({
    loyaltyId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    programName: { type: String, required: true, trim: true },
    pointsPerDollar: { type: Number, default: 1, min: 0 },
    redeemRate: { type: Number, default: 100, min: 0 },
    tiers: [loyaltyTierSubSchema],
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
}, baseSchemaOptions);

const loyaltyHistorySubSchema = new Schema({
    action: { type: String, enum: ['earn', 'redeem'], required: true },
    points: { type: Number, required: true },
    description: { type: String, trim: true },
    date: { type: Date, default: Date.now },
}, { _id: false });

const loyaltyMemberSchema = new Schema<ILoyaltyMember>({
    userId: { type: String, required: true, index: true },
    centerId: { type: String, required: true, index: true },
    loyaltyId: { type: String, required: true, index: true },
    points: { type: Number, default: 0, min: 0 },
    tier: { type: String, default: '' },
    history: [loyaltyHistorySubSchema],
}, baseSchemaOptions);

const rewardsCatalogSchema = new Schema<IRewardsCatalog>({
    rewardId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    rewardName: { type: String, required: true, trim: true },
    rewardType: { type: String, enum: ['discount', 'free_class', 'merchandise', 'experience', 'credit'], required: true, index: true },
    pointsRequired: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, default: 0, min: 0 },
    description: { type: String, trim: true },
    image: { type: String, trim: true },
    status: { type: String, enum: ['available', 'unavailable', 'discontinued'], default: 'available', index: true },
}, baseSchemaOptions);

const campaignAnalyticsSchema = new Schema<ICampaignAnalytics>({
    analyticsId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    campaignId: { type: String, required: true, index: true },
    campaignName: { type: String, trim: true },
    period: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true, index: true },
    date: { type: Date, required: true, index: true },
    impressions: { type: Number, default: 0, min: 0 },
    clicks: { type: Number, default: 0, min: 0 },
    conversions: { type: Number, default: 0, min: 0 },
    revenue: { type: Number, default: 0, min: 0 },
    cost: { type: Number, default: 0, min: 0 },
    roi: { type: Number, default: 0 },
    ctr: { type: Number, default: 0, min: 0 },
    conversionRate: { type: Number, default: 0, min: 0 },
}, baseSchemaOptions);

const promotionalOfferSchema = new Schema<IPromotionalOffer>({
    offerId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    offerName: { type: String, required: true, trim: true },
    offerType: { type: String, enum: ['discount', 'bundle', 'seasonal', 'flash', 'loyalty'], required: true, index: true },
    description: { type: String, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed', 'free_item'], required: true },
    discountValue: { type: Number, default: 0, min: 0 },
    applicablePrograms: [{ type: String }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    maxRedemptions: { type: Number, default: 0, min: 0 },
    currentRedemptions: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['active', 'inactive', 'scheduled', 'expired'], default: 'active', index: true },
}, baseSchemaOptions);

const segmentCriteriaSubSchema = new Schema({
    ageRange: {
        min: { type: Number },
        max: { type: Number },
    },
    location: [{ type: String }],
    purchaseHistory: { type: String },
    engagementLevel: { type: String, enum: ['high', 'medium', 'low'] },
    customFilters: [{ type: Schema.Types.Mixed }],
}, { _id: false });

const customerSegmentSchema = new Schema<ICustomerSegment>({
    segmentId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    segmentName: { type: String, required: true, trim: true },
    segmentType: { type: String, enum: ['demographic', 'behavioral', 'geographic', 'psychographic', 'custom'], required: true, index: true },
    criteria: { type: segmentCriteriaSubSchema, default: {} },
    memberCount: { type: Number, default: 0, min: 0 },
    members: [{ type: String }],
    targetedCampaigns: [{ type: String }],
}, baseSchemaOptions);

const growthMetricSchema = new Schema<IGrowthMetric>({
    metricId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    metricType: { type: String, enum: ['acquisition', 'retention', 'engagement', 'revenue', 'churn'], required: true, index: true },
    period: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true, index: true },
    date: { type: Date, required: true, index: true },
    value: { type: Number, default: 0 },
    target: { type: Number, default: 0 },
    variance: { type: Number, default: 0 },
    trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
}, baseSchemaOptions);

// ==================== COMPOUND INDEXES ====================

pageViewSchema.index({ pageId: 1, timestamp: -1 });
pageViewSchema.index({ userId: 1, timestamp: -1 });
seoPageSchema.index({ centerId: 1, isPublished: 1 });
referralProgramSchema.index({ centerId: 1, status: 1 });
referralProgramSchema.index({ referrerId: 1, status: 1 });
promoCodeSchema.index({ centerId: 1, isActive: 1 });
campaignROISchema.index({ centerId: 1, status: 1 });
affiliateTrackingSchema.index({ centerId: 1, status: 1 });
communityEventSchema.index({ centerId: 1, status: 1, eventDate: -1 });
loyaltyMemberSchema.index({ userId: 1, centerId: 1 }, { unique: true });
campaignAnalyticsSchema.index({ campaignId: 1, date: -1 });
growthMetricSchema.index({ centerId: 1, metricType: 1, date: -1 });

// ==================== EXPORT MODELS ====================

export const PageView = model<IPageView>('PageView', pageViewSchema);
export const SEOPage = model<ISEOProgramPage>('SEOPage', seoPageSchema);
export const ReferralProgram = model<IReferralProgram>('ReferralProgram', referralProgramSchema);
export const PromoCode = model<IPromoCode>('PromoCode', promoCodeSchema);
export const CampaignROI = model<ICampaignROI>('CampaignROI', campaignROISchema);
export const AffiliateTracking = model<IAffiliateTracking>('AffiliateTracking', affiliateTrackingSchema);
export const CommunityEvent = model<ICommunityEvent>('CommunityEvent', communityEventSchema);
export const EmailSequence = model<IEmailSequence>('EmailSequence', emailSequenceSchema);
export const SMSSequence = model<ISMSSequence>('SMSSequence', smsSequenceSchema);
export const LoyaltyProgram = model<ILoyaltyProgram>('LoyaltyProgram', loyaltyProgramSchema);
export const LoyaltyMember = model<ILoyaltyMember>('LoyaltyMember', loyaltyMemberSchema);
export const RewardsCatalog = model<IRewardsCatalog>('RewardsCatalog', rewardsCatalogSchema);
export const CampaignAnalytics = model<ICampaignAnalytics>('CampaignAnalytics', campaignAnalyticsSchema);
export const PromotionalOffer = model<IPromotionalOffer>('PromotionalOffer', promotionalOfferSchema);
export const CustomerSegment = model<ICustomerSegment>('CustomerSegment', customerSegmentSchema);
export const GrowthMetric = model<IGrowthMetric>('GrowthMetric', growthMetricSchema);
