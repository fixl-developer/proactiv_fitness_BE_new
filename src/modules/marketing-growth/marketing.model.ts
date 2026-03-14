// Marketing & Growth Engine Data Models

// SEO Program Page Model
export interface ISEOProgramPage {
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
export interface IReferralProgram {
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
export interface IPromoCode {
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
export interface ICampaignROI {
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
export interface IAffiliateTracking {
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
export interface ICommunityEvent {
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
    images: string[];
    videoUrl?: string;
    status: 'planning' | 'published' | 'ongoing' | 'completed' | 'cancelled';
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Email Sequence Model
export interface IEmailSequence {
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
export interface ISMSSequence {
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
export interface ILoyaltyProgram {
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

// Rewards Catalog Model
export interface IRewardsCatalog {
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
export interface ICampaignAnalytics {
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
export interface IPromotionalOffer {
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
export interface ICustomerSegment {
    segmentId: string;
    centerId: string;
    segmentName: string;
    segmentType: 'demographic' | 'behavioral' | 'geographic' | 'psychographic' | 'custom';
    criteria: SegmentCriteria;
    memberCount: number;
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
export interface IGrowthMetric {
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
