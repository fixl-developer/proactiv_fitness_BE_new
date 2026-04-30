import mongoose, { Schema, Document } from 'mongoose';

// Badge Model
export interface IBadge extends Document {
    childId: string;
    name: string;
    description: string;
    icon: string;
    level: 'bronze' | 'silver' | 'gold' | 'platinum';
    skillId: string;
    earnedDate: Date;
    expiryDate?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const BadgeSchema = new Schema<IBadge>(
    {
        childId: { type: String, required: true, index: true },
        name: { type: String, required: true },
        description: { type: String },
        icon: { type: String },
        level: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
        skillId: { type: String, required: true },
        earnedDate: { type: Date, default: Date.now },
        expiryDate: { type: Date },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Streak Model
export interface IStreak extends Document {
    childId: string;
    type: 'attendance' | 'behavior' | 'engagement';
    currentCount: number;
    maxCount: number;
    startDate: Date;
    lastActivityDate: Date;
    rewards: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const StreakSchema = new Schema<IStreak>(
    {
        childId: { type: String, required: true, index: true },
        type: { type: String, enum: ['attendance', 'behavior', 'engagement'], required: true },
        currentCount: { type: Number, default: 0 },
        maxCount: { type: Number, default: 0 },
        startDate: { type: Date, default: Date.now },
        lastActivityDate: { type: Date, default: Date.now },
        rewards: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Challenge Model
export interface IChallenge extends Document {
    childId: string;
    title: string;
    description: string;
    icon: string;
    progress: number;
    target: number;
    reward: number;
    dueDate: Date;
    status: 'active' | 'completed' | 'expired';
    coachId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ChallengeSchema = new Schema<IChallenge>(
    {
        childId: { type: String, required: true, index: true },
        title: { type: String, required: true },
        description: { type: String },
        icon: { type: String },
        progress: { type: Number, default: 0 },
        target: { type: Number, required: true },
        reward: { type: Number, required: true },
        dueDate: { type: Date, required: true },
        status: { type: String, enum: ['active', 'completed', 'expired'], default: 'active' },
        coachId: { type: String },
    },
    { timestamps: true }
);

// Leaderboard Model
export interface ILeaderboard extends Document {
    childId: string;
    childName: string;
    programId: string;
    centerId: string;
    points: number;
    rank: number;
    period: 'daily' | 'weekly' | 'monthly' | 'all-time';
    badges: number;
    streaks: number;
    createdAt: Date;
    updatedAt: Date;
}

const LeaderboardSchema = new Schema<ILeaderboard>(
    {
        childId: { type: String, required: true, index: true },
        childName: { type: String, required: true },
        programId: { type: String, required: true },
        centerId: { type: String, required: true },
        points: { type: Number, default: 0 },
        rank: { type: Number },
        period: { type: String, enum: ['daily', 'weekly', 'monthly', 'all-time'], required: true },
        badges: { type: Number, default: 0 },
        streaks: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Gamification Profile Model
export interface IGamificationProfile extends Document {
    childId: string;
    totalPoints: number;
    totalBadges: number;
    totalChallengesCompleted: number;
    currentLevel: number;
    experiencePoints: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    achievements: string[];
    createdAt: Date;
    updatedAt: Date;
}

const GamificationProfileSchema = new Schema<IGamificationProfile>(
    {
        childId: { type: String, required: true, unique: true, index: true },
        totalPoints: { type: Number, default: 0 },
        totalBadges: { type: Number, default: 0 },
        totalChallengesCompleted: { type: Number, default: 0 },
        currentLevel: { type: Number, default: 1 },
        experiencePoints: { type: Number, default: 0 },
        tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], default: 'bronze' },
        achievements: [{ type: String }],
    },
    { timestamps: true }
);

// Reward Model
export interface IReward extends Document {
    childId: string;
    type: 'points' | 'badge' | 'discount' | 'credit';
    amount: number;
    description: string;
    expiryDate?: Date;
    isRedeemed: boolean;
    redeemedDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const RewardSchema = new Schema<IReward>(
    {
        childId: { type: String, required: true, index: true },
        type: { type: String, enum: ['points', 'badge', 'discount', 'credit'], required: true },
        amount: { type: Number, required: true },
        description: { type: String },
        expiryDate: { type: Date },
        isRedeemed: { type: Boolean, default: false },
        redeemedDate: { type: Date },
    },
    { timestamps: true }
);

// Export Models
export const Badge = mongoose.model<IBadge>('Badge', BadgeSchema);
export const Streak = mongoose.model<IStreak>('Streak', StreakSchema);
export const Challenge = mongoose.model<IChallenge>('Challenge', ChallengeSchema);
export const Leaderboard = mongoose.model<ILeaderboard>('Leaderboard', LeaderboardSchema);
export const GamificationProfile = mongoose.model<IGamificationProfile>('GamificationProfile', GamificationProfileSchema);
export const Reward = mongoose.model<IReward>('Reward', RewardSchema);
