import mongoose, { Schema } from 'mongoose';
import {
    ILoyaltyPoints,
    IStreak,
    IAchievement,
    IUnlockedAchievement,
    ILeaderboard,
    IReward,
    IRedemption,
    IChallenge,
    PointTransactionType,
    AchievementCategory,
    RewardType,
    RewardStatus
} from './gamification.interface';

const LoyaltyPointsSchema = new Schema<ILoyaltyPoints>(
    {
        userId: { type: String, required: true, unique: true, index: true },
        userName: { type: String, required: true },
        totalPointsEarned: { type: Number, default: 0 },
        totalPointsSpent: { type: Number, default: 0 },
        currentBalance: { type: Number, default: 0 },
        lifetimePoints: { type: Number, default: 0 },
        pointsByCategory: [{
            category: String,
            points: Number
        }],
        transactions: [{
            transactionId: String,
            type: { type: String, enum: Object.values(PointTransactionType) },
            points: Number,
            balance: Number,
            reason: String,
            relatedEntity: String,
            relatedEntityType: String,
            date: { type: Date, default: Date.now },
            expiryDate: Date
        }],
        currentTier: { type: String, default: 'bronze' },
        tierProgress: { type: Number, default: 0 },
        nextTier: String,
        pointsToNextTier: Number,
        businessUnitId: { type: String, required: true, index: true },
        locationId: { type: String, required: true, index: true },
        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'loyalty_points' }
);

const StreakSchema = new Schema<IStreak>(
    {
        userId: { type: String, required: true, index: true },
        userName: { type: String, required: true },
        streakType: { type: String, enum: ['attendance', 'skill_practice', 'behavior', 'engagement'], required: true },
        streakName: { type: String, required: true },
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        lastActivityDate: { type: Date },
        streakHistory: [{
            startDate: Date,
            endDate: Date,
            streakLength: Number,
            reason: String
        }],
        milestones: [{
            streakLength: Number,
            achieved: Boolean,
            achievedDate: Date,
            reward: String
        }],
        isActive: { type: Boolean, default: true },
        businessUnitId: { type: String, required: true, index: true },
        locationId: { type: String, required: true, index: true },
        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'streaks' }
);

const AchievementSchema = new Schema<IAchievement>(
    {
        achievementId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, enum: Object.values(AchievementCategory), required: true },
        iconUrl: { type: String },
        badgeUrl: { type: String },
        colorScheme: {
            primary: String,
            secondary: String
        },
        unlockCriteria: [{
            criteriaType: String,
            target: Number,
            unit: String,
            description: String
        }],
        pointsReward: { type: Number, default: 0 },
        badgeReward: String,
        specialReward: String,
        rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
        difficulty: { type: Number, min: 1, max: 10, default: 1 },
        totalUnlocked: { type: Number, default: 0 },
        unlockRate: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        isHidden: { type: Boolean, default: false },
        businessUnitId: { type: String, required: true, index: true },
        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'achievements' }
);

const UnlockedAchievementSchema = new Schema<IUnlockedAchievement>(
    {
        unlockedAchievementId: { type: String, required: true, unique: true },
        achievementId: { type: String, required: true, index: true },
        achievementName: { type: String, required: true },
        userId: { type: String, required: true, index: true },
        userName: { type: String, required: true },
        unlockedDate: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 },
        isCompleted: { type: Boolean, default: false },
        completedDate: Date,
        unlockContext: {
            triggerEvent: String,
            relatedEntities: [String],
            evidenceUrls: [String]
        },
        pointsClaimed: { type: Number, default: 0 },
        rewardsClaimed: [String],
        isPinned: { type: Boolean, default: false },
        isVisible: { type: Boolean, default: true },
        businessUnitId: { type: String, required: true, index: true },
        locationId: { type: String, required: true, index: true },
        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'unlocked_achievements' }
);

const LeaderboardSchema = new Schema<ILeaderboard>(
    {
        leaderboardId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        description: { type: String },
        category: { type: String, required: true },
        leaderboardType: { type: String, enum: ['points', 'skills', 'attendance', 'achievements', 'custom'], required: true },
        metric: { type: String, required: true },
        periodType: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'all_time'], required: true },
        periodStart: { type: Date, required: true },
        periodEnd: { type: Date, required: true },
        rankings: [{
            rank: Number,
            userId: String,
            userName: String,
            score: Number,
            change: Number,
            badge: String
        }],
        filters: {
            ageGroup: String,
            program: String,
            location: String
        },
        isActive: { type: Boolean, default: true },
        isPublic: { type: Boolean, default: true },
        businessUnitId: { type: String, required: true, index: true },
        locationId: { type: String, required: true, index: true },
        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'leaderboards' }
);

const RewardSchema = new Schema<IReward>(
    {
        rewardId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, required: true },
        rewardType: { type: String, enum: Object.values(RewardType), required: true },
        imageUrl: { type: String },
        pointsCost: { type: Number, required: true },
        monetaryValue: Number,
        totalQuantity: Number,
        remainingQuantity: Number,
        isUnlimited: { type: Boolean, default: false },
        eligibilityCriteria: {
            minimumTier: String,
            minimumAge: Number,
            maximumAge: Number,
            requiredAchievements: [String],
            programRestrictions: [String]
        },
        redemptionRules: {
            maxRedemptionsPerUser: Number,
            cooldownPeriod: Number,
            expiryPeriod: Number,
            requiresApproval: { type: Boolean, default: false }
        },
        status: { type: String, enum: Object.values(RewardStatus), default: RewardStatus.AVAILABLE },
        isActive: { type: Boolean, default: true },
        totalRedemptions: { type: Number, default: 0 },
        popularityScore: { type: Number, default: 0 },
        businessUnitId: { type: String, required: true, index: true },
        locationId: { type: String, required: true, index: true },
        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'rewards' }
);

const RedemptionSchema = new Schema<IRedemption>(
    {
        redemptionId: { type: String, required: true, unique: true },
        rewardId: { type: String, required: true, index: true },
        rewardName: { type: String, required: true },
        userId: { type: String, required: true, index: true },
        userName: { type: String, required: true },
        redemptionDate: { type: Date, default: Date.now },
        pointsSpent: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'approved', 'fulfilled', 'rejected', 'cancelled'], default: 'pending' },
        fulfillmentDate: Date,
        fulfillmentNotes: String,
        fulfillmentBy: String,
        expiryDate: Date,
        isExpired: { type: Boolean, default: false },
        requiresApproval: { type: Boolean, default: false },
        approvedBy: String,
        approvedDate: Date,
        rejectionReason: String,
        businessUnitId: { type: String, required: true, index: true },
        locationId: { type: String, required: true, index: true },
        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'redemptions' }
);

const ChallengeSchema = new Schema<IChallenge>(
    {
        challengeId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, required: true },
        challengeType: { type: String, enum: ['individual', 'team', 'location', 'global'], required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        isActive: { type: Boolean, default: false },
        goals: [{
            goalType: String,
            target: Number,
            unit: String,
            description: String
        }],
        rewards: [{
            rank: Number,
            points: Number,
            badge: String,
            specialReward: String
        }],
        participants: [{
            userId: String,
            userName: String,
            progress: Number,
            rank: Number,
            joinedDate: Date
        }],
        status: { type: String, enum: ['upcoming', 'active', 'completed', 'cancelled'], default: 'upcoming' },
        businessUnitId: { type: String, required: true, index: true },
        locationId: { type: String, required: true, index: true },
        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'challenges' }
);

// Indexes
LoyaltyPointsSchema.index({ userId: 1, businessUnitId: 1 });
StreakSchema.index({ userId: 1, streakType: 1 });
UnlockedAchievementSchema.index({ userId: 1, achievementId: 1 });
LeaderboardSchema.index({ periodType: 1, periodStart: 1, periodEnd: 1 });

export const LoyaltyPoints = mongoose.model<ILoyaltyPoints>('LoyaltyPoints', LoyaltyPointsSchema);
export const Streak = mongoose.model<IStreak>('Streak', StreakSchema);
export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);
export const UnlockedAchievement = mongoose.model<IUnlockedAchievement>('UnlockedAchievement', UnlockedAchievementSchema);
export const Leaderboard = mongoose.model<ILeaderboard>('Leaderboard', LeaderboardSchema);
export const Reward = mongoose.model<IReward>('Reward', RewardSchema);
export const Redemption = mongoose.model<IRedemption>('Redemption', RedemptionSchema);
export const Challenge = mongoose.model<IChallenge>('Challenge', ChallengeSchema);
