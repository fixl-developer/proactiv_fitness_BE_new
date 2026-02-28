import { Document } from 'mongoose';

export enum PointTransactionType {
    EARNED = 'earned',
    SPENT = 'spent',
    BONUS = 'bonus',
    PENALTY = 'penalty',
    EXPIRED = 'expired',
    REFUNDED = 'refunded'
}

export enum AchievementCategory {
    SKILL = 'skill',
    ATTENDANCE = 'attendance',
    BEHAVIOR = 'behavior',
    SOCIAL = 'social',
    MILESTONE = 'milestone',
    SPECIAL = 'special'
}

export enum RewardType {
    PHYSICAL = 'physical',
    DIGITAL = 'digital',
    EXPERIENCE = 'experience',
    PRIVILEGE = 'privilege',
    DISCOUNT = 'discount'
}

export enum RewardStatus {
    AVAILABLE = 'available',
    REDEEMED = 'redeemed',
    EXPIRED = 'expired',
    OUT_OF_STOCK = 'out_of_stock'
}

export interface ILoyaltyPoints extends Document {
    // User Information
    userId: string;
    userName: string;

    // Points Balance
    totalPointsEarned: number;
    totalPointsSpent: number;
    currentBalance: number;
    lifetimePoints: number;

    // Points Breakdown
    pointsByCategory: {
        category: string;
        points: number;
    }[];

    // Transaction History
    transactions: {
        transactionId: string;
        type: PointTransactionType;
        points: number;
        balance: number;
        reason: string;
        relatedEntity?: string;
        relatedEntityType?: string;
        date: Date;
        expiryDate?: Date;
    }[];

    // Tier System
    currentTier: string;
    tierProgress: number;
    nextTier?: string;
    pointsToNextTier?: number;

    // Business Context
    businessUnitId: string;
    locationId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IStreak extends Document {
    // User Information
    userId: string;
    userName: string;

    // Streak Type
    streakType: 'attendance' | 'skill_practice' | 'behavior' | 'engagement';
    streakName: string;

    // Current Streak
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date;

    // Streak History
    streakHistory: {
        startDate: Date;
        endDate: Date;
        streakLength: number;
        reason?: string;
    }[];

    // Rewards & Milestones
    milestones: {
        streakLength: number;
        achieved: boolean;
        achievedDate?: Date;
        reward?: string;
    }[];

    // Status
    isActive: boolean;

    // Business Context
    businessUnitId: string;
    locationId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAchievement extends Document {
    // Achievement Information
    achievementId: string;
    name: string;
    description: string;
    category: AchievementCategory;

    // Visual Design
    iconUrl: string;
    badgeUrl: string;
    colorScheme: {
        primary: string;
        secondary: string;
    };

    // Unlock Criteria
    unlockCriteria: {
        criteriaType: string;
        target: number;
        unit: string;
        description: string;
    }[];

    // Rewards
    pointsReward: number;
    badgeReward?: string;
    specialReward?: string;

    // Rarity & Difficulty
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    difficulty: number; // 1-10

    // Statistics
    totalUnlocked: number;
    unlockRate: number; // percentage

    // Status
    isActive: boolean;
    isHidden: boolean;

    // Business Context
    businessUnitId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUnlockedAchievement extends Document {
    // Basic Information
    unlockedAchievementId: string;
    achievementId: string;
    achievementName: string;
    userId: string;
    userName: string;

    // Unlock Details
    unlockedDate: Date;
    progress: number;
    isCompleted: boolean;
    completedDate?: Date;

    // Context
    unlockContext: {
        triggerEvent: string;
        relatedEntities: string[];
        evidenceUrls: string[];
    };

    // Rewards Claimed
    pointsClaimed: number;
    rewardsClaimed: string[];

    // Display
    isPinned: boolean;
    isVisible: boolean;

    // Business Context
    businessUnitId: string;
    locationId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ILeaderboard extends Document {
    // Leaderboard Information
    leaderboardId: string;
    name: string;
    description: string;
    category: string;

    // Leaderboard Type
    leaderboardType: 'points' | 'skills' | 'attendance' | 'achievements' | 'custom';
    metric: string;

    // Time Period
    periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all_time';
    periodStart: Date;
    periodEnd: Date;

    // Rankings
    rankings: {
        rank: number;
        userId: string;
        userName: string;
        score: number;
        change?: number; // position change from previous period
        badge?: string;
    }[];

    // Filters
    filters: {
        ageGroup?: string;
        program?: string;
        location?: string;
    };

    // Status
    isActive: boolean;
    isPublic: boolean;

    // Business Context
    businessUnitId: string;
    locationId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IReward extends Document {
    // Reward Information
    rewardId: string;
    name: string;
    description: string;
    category: string;
    rewardType: RewardType;

    // Visual
    imageUrl: string;

    // Cost & Value
    pointsCost: number;
    monetaryValue?: number;

    // Availability
    totalQuantity?: number;
    remainingQuantity?: number;
    isUnlimited: boolean;

    // Eligibility
    eligibilityCriteria: {
        minimumTier?: string;
        minimumAge?: number;
        maximumAge?: number;
        requiredAchievements?: string[];
        programRestrictions?: string[];
    };

    // Redemption Rules
    redemptionRules: {
        maxRedemptionsPerUser?: number;
        cooldownPeriod?: number; // in days
        expiryPeriod?: number; // in days after redemption
        requiresApproval: boolean;
    };

    // Status
    status: RewardStatus;
    isActive: boolean;

    // Statistics
    totalRedemptions: number;
    popularityScore: number;

    // Business Context
    businessUnitId: string;
    locationId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IRedemption extends Document {
    // Redemption Information
    redemptionId: string;
    rewardId: string;
    rewardName: string;
    userId: string;
    userName: string;

    // Redemption Details
    redemptionDate: Date;
    pointsSpent: number;
    status: 'pending' | 'approved' | 'fulfilled' | 'rejected' | 'cancelled';

    // Fulfillment
    fulfillmentDate?: Date;
    fulfillmentNotes?: string;
    fulfillmentBy?: string;

    // Expiry
    expiryDate?: Date;
    isExpired: boolean;

    // Approval
    requiresApproval: boolean;
    approvedBy?: string;
    approvedDate?: Date;
    rejectionReason?: string;

    // Business Context
    businessUnitId: string;
    locationId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IChallenge extends Document {
    // Challenge Information
    challengeId: string;
    name: string;
    description: string;
    category: string;

    // Challenge Type
    challengeType: 'individual' | 'team' | 'location' | 'global';

    // Duration
    startDate: Date;
    endDate: Date;
    isActive: boolean;

    // Goals
    goals: {
        goalType: string;
        target: number;
        unit: string;
        description: string;
    }[];

    // Rewards
    rewards: {
        rank: number;
        points: number;
        badge?: string;
        specialReward?: string;
    }[];

    // Participants
    participants: {
        userId: string;
        userName: string;
        progress: number;
        rank?: number;
        joinedDate: Date;
    }[];

    // Status
    status: 'upcoming' | 'active' | 'completed' | 'cancelled';

    // Business Context
    businessUnitId: string;
    locationId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Request/Response Interfaces

export interface IAwardPointsRequest {
    userId: string;
    points: number;
    reason: string;
    category?: string;
    relatedEntity?: string;
    relatedEntityType?: string;
}

export interface IUpdateStreakRequest {
    userId: string;
    streakType: string;
    activityDate: Date;
}

export interface IUnlockAchievementRequest {
    userId: string;
    achievementId: string;
    progress: number;
    context: any;
}

export interface IRedeemRewardRequest {
    userId: string;
    rewardId: string;
}

export interface IJoinChallengeRequest {
    userId: string;
    challengeId: string;
}

export interface IGamificationProfile {
    userId: string;
    userName: string;
    points: {
        current: number;
        lifetime: number;
        rank: number;
    };
    streaks: {
        attendance: number;
        longest: number;
    };
    achievements: {
        total: number;
        byCategory: any[];
        recent: any[];
    };
    tier: {
        current: string;
        progress: number;
        nextTier: string;
    };
    leaderboards: any[];
}
