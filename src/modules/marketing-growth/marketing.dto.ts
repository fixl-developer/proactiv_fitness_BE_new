// SEO Page DTOs
export class CreateSEOPageDTO {
    centerId: string;
    programId: string;
    programName: string;
    slug: string;
    title: string;
    metaDescription: string;
    metaKeywords: string[];
    content: string;
    images: string[];
    ageGroup: string;
    skillLevel: string;
    duration: string;
    pricing: number;
}

export class UpdateSEOPageDTO {
    title?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    content?: string;
    images?: string[];
}

// Referral DTOs
export class CreateReferralCodeDTO {
    referrerId: string;
    referrerName: string;
    referrerEmail: string;
}

export class TrackReferralDTO {
    referralCode: string;
    refereeName: string;
    refereeEmail: string;
}

// Promo Code DTOs
export class CreatePromoCodeDTO {
    centerId: string;
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed' | 'free_class';
    discountValue: number;
    maxUses: number;
    applicablePrograms: string[];
    applicableUserTypes: string[];
    startDate: Date;
    endDate: Date;
}

export class ValidatePromoCodeDTO {
    code: string;
    centerId: string;
}

export class ApplyPromoCodeDTO {
    code: string;
    amount: number;
}

// Campaign DTOs
export class CreateCampaignDTO {
    centerId: string;
    campaignName: string;
    campaignType: 'email' | 'sms' | 'social' | 'referral' | 'promo' | 'event';
    startDate: Date;
    endDate: Date;
    budget: number;
}

export class UpdateCampaignMetricsDTO {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
}

// Affiliate DTOs
export class RegisterAffiliateDTO {
    centerId: string;
    affiliateName: string;
    affiliateEmail: string;
    affiliateType: 'influencer' | 'partner' | 'agency' | 'individual';
    commissionRate: number;
    commissionType: 'percentage' | 'fixed';
}

export class TrackAffiliateReferralDTO {
    trackingCode: string;
}

// Event DTOs
export class CreateEventDTO {
    centerId: string;
    eventName: string;
    eventType: 'workshop' | 'competition' | 'social' | 'fundraiser' | 'demo';
    description: string;
    eventDate: Date;
    eventTime: string;
    location: string;
    capacity: number;
    images: string[];
}

export class RegisterForEventDTO {
    userId: string;
}

// Email Sequence DTOs
export class CreateEmailSequenceDTO {
    centerId: string;
    sequenceName: string;
    sequenceType: 'welcome' | 'onboarding' | 'engagement' | 'retention' | 'win_back';
    triggerEvent: string;
    emails: any[];
}

export class SendEmailSequenceDTO {
    sequenceId: string;
    userId: string;
}

// SMS Sequence DTOs
export class CreateSMSSequenceDTO {
    centerId: string;
    sequenceName: string;
    sequenceType: 'welcome' | 'reminder' | 'promotion' | 'engagement' | 'retention';
    triggerEvent: string;
    messages: any[];
}

export class SendSMSSequenceDTO {
    sequenceId: string;
    userId: string;
}

// Loyalty DTOs
export class CreateLoyaltyProgramDTO {
    centerId: string;
    programName: string;
    pointsPerDollar: number;
    redeemRate: number;
    tiers: any[];
}

export class AddLoyaltyPointsDTO {
    userId: string;
    points: number;
}

export class RedeemLoyaltyPointsDTO {
    userId: string;
    points: number;
}

// Reward DTOs
export class CreateRewardDTO {
    centerId: string;
    rewardName: string;
    rewardType: 'discount' | 'free_class' | 'merchandise' | 'experience' | 'credit';
    pointsRequired: number;
    quantity: number;
    description: string;
    image: string;
}

export class RedeemRewardDTO {
    userId: string;
}

// Campaign Analytics DTOs
export class GenerateCampaignAnalyticsDTO {
    campaignId: string;
    period: 'daily' | 'weekly' | 'monthly';
}

// Offer DTOs
export class CreateOfferDTO {
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
}

// Segment DTOs
export class CreateSegmentDTO {
    centerId: string;
    segmentName: string;
    segmentType: 'demographic' | 'behavioral' | 'geographic' | 'psychographic' | 'custom';
    criteria: any;
}

export class TargetSegmentDTO {
    segmentId: string;
    campaignId: string;
}

// Growth Metric DTOs
export class TrackGrowthMetricDTO {
    centerId: string;
    metricType: 'acquisition' | 'retention' | 'engagement' | 'revenue' | 'churn';
    period: 'daily' | 'weekly' | 'monthly';
    value: number;
    target: number;
}

// Response DTOs
export class SEOPageResponseDTO {
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

export class ReferralProgramResponseDTO {
    referralId: string;
    centerId: string;
    referrerId: string;
    referrerName: string;
    referrerEmail: string;
    refereeName?: string;
    refereeEmail?: string;
    referralCode: string;
    status: string;
    rewardType: string;
    rewardValue: number;
    rewardCurrency: string;
    referralDate: Date;
    completionDate?: Date;
    expiryDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class PromoCodeResponseDTO {
    promoId: string;
    centerId: string;
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
    maxUses: number;
    currentUses: number;
    applicablePrograms: string[];
    applicableUserTypes: string[];
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export class CampaignROIResponseDTO {
    campaignId: string;
    centerId: string;
    campaignName: string;
    campaignType: string;
    startDate: Date;
    endDate: Date;
    budget: number;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roi: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export class AffiliateTrackingResponseDTO {
    affiliateId: string;
    centerId: string;
    affiliateName: string;
    affiliateEmail: string;
    affiliateType: string;
    commissionRate: number;
    commissionType: string;
    totalReferrals: number;
    totalConversions: number;
    totalEarnings: number;
    status: string;
    trackingCode: string;
    createdAt: Date;
    updatedAt: Date;
}

export class CommunityEventResponseDTO {
    eventId: string;
    centerId: string;
    eventName: string;
    eventType: string;
    description: string;
    eventDate: Date;
    eventTime: string;
    location: string;
    capacity: number;
    registeredCount: number;
    images: string[];
    status: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export class EmailSequenceResponseDTO {
    sequenceId: string;
    centerId: string;
    sequenceName: string;
    sequenceType: string;
    triggerEvent: string;
    emails: any[];
    status: string;
    totalSent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    createdAt: Date;
    updatedAt: Date;
}

export class SMSSequenceResponseDTO {
    sequenceId: string;
    centerId: string;
    sequenceName: string;
    sequenceType: string;
    triggerEvent: string;
    messages: any[];
    status: string;
    totalSent: number;
    deliveryRate: number;
    clickRate: number;
    conversionRate: number;
    createdAt: Date;
    updatedAt: Date;
}

export class LoyaltyProgramResponseDTO {
    loyaltyId: string;
    centerId: string;
    programName: string;
    pointsPerDollar: number;
    redeemRate: number;
    tiers: any[];
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export class RewardsCatalogResponseDTO {
    rewardId: string;
    centerId: string;
    rewardName: string;
    rewardType: string;
    pointsRequired: number;
    quantity: number;
    description: string;
    image: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export class CampaignAnalyticsResponseDTO {
    analyticsId: string;
    centerId: string;
    campaignId: string;
    campaignName: string;
    period: string;
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

export class PromotionalOfferResponseDTO {
    offerId: string;
    centerId: string;
    offerName: string;
    offerType: string;
    description: string;
    discountType: string;
    discountValue: number;
    applicablePrograms: string[];
    startDate: Date;
    endDate: Date;
    maxRedemptions: number;
    currentRedemptions: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export class CustomerSegmentResponseDTO {
    segmentId: string;
    centerId: string;
    segmentName: string;
    segmentType: string;
    criteria: any;
    memberCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export class GrowthMetricResponseDTO {
    metricId: string;
    centerId: string;
    metricType: string;
    period: string;
    date: Date;
    value: number;
    target: number;
    variance: number;
    trend: string;
    createdAt: Date;
}
