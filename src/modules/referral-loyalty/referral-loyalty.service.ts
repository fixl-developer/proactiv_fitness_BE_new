import { ReferralLoyaltyModel, IReferralLink, ILoyaltyReward, ILoyaltyPoints, IChallenge, ITierStatus } from './referral-loyalty.model';
import { NotificationService } from '../notifications/notifications.service';

export class ReferralLoyaltyService {
    private notificationService = new NotificationService();

    async createReferralLink(parentId: string): Promise<IReferralLink> {
        try {
            const referralCode = `REF${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
            const referralLink: IReferralLink = {
                parentId,
                referralCode,
                referralUrl: `https://proactiv.com/join?ref=${referralCode}`,
                createdAt: new Date(),
                updatedAt: new Date(),
                totalReferrals: 0,
                totalRewardsEarned: 0,
                isActive: true
            } as any;

            await ReferralLoyaltyModel.create(referralLink);
            return referralLink;
        } catch (error) {
            throw new Error(`Failed to create referral link: ${error.message}`);
        }
    }

    async getReferralLink(parentId: string): Promise<IReferralLink> {
        try {
            const link = await ReferralLoyaltyModel.findOne({ parentId, type: 'referral' });
            if (!link) {
                return await this.createReferralLink(parentId);
            }
            return link as IReferralLink;
        } catch (error) {
            throw new Error(`Failed to get referral link: ${error.message}`);
        }
    }

    async trackReferral(referralCode: string, newParentId: string): Promise<any> {
        try {
            const referralLink = await ReferralLoyaltyModel.findOne({ referralCode, type: 'referral' });
            if (!referralLink) {
                throw new Error('Invalid referral code');
            }

            // Update referral count
            await ReferralLoyaltyModel.updateOne(
                { referralCode },
                { $inc: { totalReferrals: 1 } }
            );

            // Award points to referrer
            const rewardPoints = 500; // 500 points per referral
            await this.addLoyaltyPoints(referralLink.parentId, rewardPoints, 'Referral reward');

            // Send notification
            await this.notificationService.sendNotification({
                userId: referralLink.parentId,
                type: 'referral',
                title: '🎉 New Referral!',
                message: `You earned ${rewardPoints} points for referring a new family!`,
                data: { referralCode }
            });

            return { success: true, pointsAwarded: rewardPoints };
        } catch (error) {
            throw new Error(`Failed to track referral: ${error.message}`);
        }
    }

    async getReferralRewards(parentId: string): Promise<ILoyaltyReward[]> {
        try {
            return await ReferralLoyaltyModel.find({ parentId, type: 'reward' });
        } catch (error) {
            throw new Error(`Failed to get referral rewards: ${error.message}`);
        }
    }

    async redeemReward(parentId: string, rewardId: string): Promise<any> {
        try {
            const reward = await ReferralLoyaltyModel.findById(rewardId);
            if (!reward) {
                throw new Error('Reward not found');
            }

            // Deduct points
            await this.addLoyaltyPoints(parentId, -reward.pointsRequired, 'Reward redemption');

            // Mark reward as redeemed
            await ReferralLoyaltyModel.updateOne(
                { _id: rewardId },
                { redeemedAt: new Date(), redeemedBy: parentId }
            );

            return { success: true, reward: reward.title };
        } catch (error) {
            throw new Error(`Failed to redeem reward: ${error.message}`);
        }
    }

    async getLoyaltyPoints(parentId: string): Promise<ILoyaltyPoints> {
        try {
            let points = await ReferralLoyaltyModel.findOne({ parentId, type: 'points' });
            if (!points) {
                const newPoints: ILoyaltyPoints = {
                    parentId,
                    totalPoints: 0,
                    availablePoints: 0,
                    redeemedPoints: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                } as any;
                await ReferralLoyaltyModel.create(newPoints);
                points = newPoints as any;
            }
            return points as ILoyaltyPoints;
        } catch (error) {
            throw new Error(`Failed to get loyalty points: ${error.message}`);
        }
    }

    async addLoyaltyPoints(parentId: string, points: number, reason: string): Promise<ILoyaltyPoints> {
        try {
            let loyaltyPoints = await ReferralLoyaltyModel.findOne({ parentId, type: 'points' });
            if (!loyaltyPoints) {
                loyaltyPoints = await ReferralLoyaltyModel.create({
                    parentId,
                    type: 'points',
                    totalPoints: points,
                    availablePoints: points,
                    redeemedPoints: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            } else {
                loyaltyPoints.totalPoints += points;
                loyaltyPoints.availablePoints += points;
                loyaltyPoints.updatedAt = new Date();
                await loyaltyPoints.save();
            }

            return loyaltyPoints as ILoyaltyPoints;
        } catch (error) {
            throw new Error(`Failed to add loyalty points: ${error.message}`);
        }
    }

    async getLeaderboard(period: string = 'monthly'): Promise<any[]> {
        try {
            const leaderboard = await ReferralLoyaltyModel.find({ type: 'points' })
                .sort({ totalPoints: -1 })
                .limit(100);
            return leaderboard;
        } catch (error) {
            throw new Error(`Failed to get leaderboard: ${error.message}`);
        }
    }

    async createChallenge(challengeData: Partial<IChallenge>): Promise<IChallenge> {
        try {
            const challenge: IChallenge = {
                ...challengeData,
                participants: [],
                createdAt: new Date(),
                updatedAt: new Date()
            } as IChallenge;

            await ReferralLoyaltyModel.create(challenge);
            return challenge;
        } catch (error) {
            throw new Error(`Failed to create challenge: ${error.message}`);
        }
    }

    async getChallenges(): Promise<IChallenge[]> {
        try {
            return await ReferralLoyaltyModel.find({ type: 'challenge' });
        } catch (error) {
            throw new Error(`Failed to get challenges: ${error.message}`);
        }
    }

    async joinChallenge(challengeId: string, parentId: string): Promise<any> {
        try {
            await ReferralLoyaltyModel.updateOne(
                { _id: challengeId },
                { $push: { participants: parentId } }
            );
            return { success: true, message: 'Joined challenge' };
        } catch (error) {
            throw new Error(`Failed to join challenge: ${error.message}`);
        }
    }

    async getTierStatus(parentId: string): Promise<ITierStatus> {
        try {
            const points = await this.getLoyaltyPoints(parentId);
            let tier = 'Bronze';
            let nextTierPoints = 1000;

            if (points.totalPoints >= 5000) {
                tier = 'Diamond';
                nextTierPoints = 0;
            } else if (points.totalPoints >= 3000) {
                tier = 'Platinum';
                nextTierPoints = 5000;
            } else if (points.totalPoints >= 1000) {
                tier = 'Gold';
                nextTierPoints = 3000;
            } else if (points.totalPoints >= 500) {
                tier = 'Silver';
                nextTierPoints = 1000;
            }

            return {
                parentId,
                currentTier: tier as any,
                currentPoints: points.totalPoints,
                nextTierPoints,
                pointsToNextTier: Math.max(0, nextTierPoints - points.totalPoints)
            };
        } catch (error) {
            throw new Error(`Failed to get tier status: ${error.message}`);
        }
    }

    async getExclusivePerks(parentId: string): Promise<any[]> {
        try {
            const tier = await this.getTierStatus(parentId);
            const perks = [];

            if (tier.currentTier === 'Silver' || tier.currentTier === 'Gold' || tier.currentTier === 'Platinum' || tier.currentTier === 'Diamond') {
                perks.push({ name: '5% discount on classes', value: 5 });
            }
            if (tier.currentTier === 'Gold' || tier.currentTier === 'Platinum' || tier.currentTier === 'Diamond') {
                perks.push({ name: '10% discount on classes', value: 10 });
                perks.push({ name: 'Free trial class', value: 'free' });
            }
            if (tier.currentTier === 'Platinum' || tier.currentTier === 'Diamond') {
                perks.push({ name: '15% discount on classes', value: 15 });
                perks.push({ name: 'Priority booking', value: 'priority' });
            }
            if (tier.currentTier === 'Diamond') {
                perks.push({ name: '20% discount on classes', value: 20 });
                perks.push({ name: 'VIP support', value: 'vip' });
            }

            return perks;
        } catch (error) {
            throw new Error(`Failed to get exclusive perks: ${error.message}`);
        }
    }
}
