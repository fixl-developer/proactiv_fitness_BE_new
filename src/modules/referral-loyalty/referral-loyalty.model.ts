import mongoose, { Schema, Document } from 'mongoose';

export interface IReferralLink extends Document {
    parentId: string;
    referralCode: string;
    referralUrl: string;
    createdAt: Date;
    updatedAt: Date;
    totalReferrals: number;
    totalRewardsEarned: number;
    isActive: boolean;
}

export interface ILoyaltyReward extends Document {
    title: string;
    description: string;
    pointsRequired: number;
    category: string;
    value: number;
    redeemedAt?: Date;
    redeemedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ILoyaltyPoints extends Document {
    parentId: string;
    totalPoints: number;
    availablePoints: number;
    redeemedPoints: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IChallenge extends Document {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    objective: string;
    reward: number;
    participants: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ITierStatus {
    parentId: string;
    currentTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
    currentPoints: number;
    nextTierPoints: number;
    pointsToNextTier: number;
}

const ReferralLoyaltySchema = new Schema({
    type: { type: String, enum: ['referral', 'reward', 'points', 'challenge'] },
    parentId: String,
    referralCode: String,
    referralUrl: String,
    totalReferrals: Number,
    totalRewardsEarned: Number,
    isActive: Boolean,
    title: String,
    description: String,
    pointsRequired: Number,
    category: String,
    value: Number,
    redeemedAt: Date,
    redeemedBy: String,
    totalPoints: Number,
    availablePoints: Number,
    redeemedPoints: Number,
    startDate: Date,
    endDate: Date,
    objective: String,
    reward: Number,
    participants: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const ReferralLoyaltyModel = mongoose.model('ReferralLoyalty', ReferralLoyaltySchema);
