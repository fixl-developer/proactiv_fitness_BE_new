import { Badge, Streak, Challenge, Leaderboard, GamificationProfile, Reward } from './gamification.model';

class EventBus {
    async publish(event: string, data: any): Promise<void> {
        // no-op stub
    }
}

export class GamificationService {
    private eventBus: EventBus;

    constructor() {
        this.eventBus = new EventBus();
    }

    // Badge Management
    async issueBadge(childId: string, skillId: string, badgeData: any) {
        try {
            const badge = new Badge({
                childId,
                skillId,
                ...badgeData,
                earnedDate: new Date(),
            });

            await badge.save();

            // Update gamification profile
            await this.updateProfileBadgeCount(childId);

            // Emit event for notification
            await this.eventBus.publish('badge.earned', {
                childId,
                badgeId: badge._id,
                badgeName: badge.name,
            });

            return badge;
        } catch (error) {
            throw new Error(`Failed to issue badge: ${error.message}`);
        }
    }

    async getBadges(childId: string) {
        try {
            return await Badge.find({ childId, isActive: true }).sort({ earnedDate: -1 });
        } catch (error) {
            throw new Error(`Failed to get badges: ${error.message}`);
        }
    }

    async revokeBadge(badgeId: string) {
        try {
            const badge = await Badge.findByIdAndUpdate(badgeId, { isActive: false }, { new: true });
            return badge;
        } catch (error) {
            throw new Error(`Failed to revoke badge: ${error.message}`);
        }
    }

    // Streak Management
    async createStreak(childId: string, type: 'attendance' | 'behavior' | 'engagement') {
        try {
            const existingStreak = await Streak.findOne({ childId, type, isActive: true });

            if (existingStreak) {
                existingStreak.currentCount += 1;
                existingStreak.lastActivityDate = new Date();
                existingStreak.rewards = existingStreak.currentCount * 10; // 10 points per streak
                await existingStreak.save();
                return existingStreak;
            }

            const streak = new Streak({
                childId,
                type,
                currentCount: 1,
                startDate: new Date(),
                lastActivityDate: new Date(),
                rewards: 10,
            });

            await streak.save();
            return streak;
        } catch (error) {
            throw new Error(`Failed to create streak: ${error.message}`);
        }
    }

    async getStreaks(childId: string) {
        try {
            return await Streak.find({ childId, isActive: true });
        } catch (error) {
            throw new Error(`Failed to get streaks: ${error.message}`);
        }
    }

    async resetStreak(streakId: string) {
        try {
            const streak = await Streak.findByIdAndUpdate(
                streakId,
                { currentCount: 0, isActive: false },
                { new: true }
            );
            return streak;
        } catch (error) {
            throw new Error(`Failed to reset streak: ${error.message}`);
        }
    }

    // Challenge Management
    async createChallenge(childId: string, challengeData: any) {
        try {
            const challenge = new Challenge({
                childId,
                ...challengeData,
                status: 'active',
            });

            await challenge.save();

            // Emit event
            await this.eventBus.publish('challenge.created', {
                childId,
                challengeId: challenge._id,
                challengeName: challenge.title,
            });

            return challenge;
        } catch (error) {
            throw new Error(`Failed to create challenge: ${error.message}`);
        }
    }

    async updateChallengeProgress(challengeId: string, progress: number) {
        try {
            const challenge = await Challenge.findById(challengeId);

            if (!challenge) {
                throw new Error('Challenge not found');
            }

            challenge.progress = Math.min(progress, challenge.target);

            if (challenge.progress >= challenge.target) {
                challenge.status = 'completed';

                // Award reward
                await this.awardReward(challenge.childId, 'points', challenge.reward, `Challenge completed: ${challenge.title}`);

                // Emit event
                await this.eventBus.publish('challenge.completed', {
                    childId: challenge.childId,
                    challengeId: challenge._id,
                    reward: challenge.reward,
                });
            }

            await challenge.save();
            return challenge;
        } catch (error) {
            throw new Error(`Failed to update challenge progress: ${error.message}`);
        }
    }

    async getChallenges(childId: string, status?: string) {
        try {
            const query: any = { childId };
            if (status) {
                query.status = status;
            }
            return await Challenge.find(query).sort({ dueDate: 1 });
        } catch (error) {
            throw new Error(`Failed to get challenges: ${error.message}`);
        }
    }

    // Leaderboard Management
    async updateLeaderboard(childId: string, childName: string, programId: string, centerId: string, points: number) {
        try {
            const periods = ['daily', 'weekly', 'monthly', 'all-time'];

            for (const period of periods) {
                let leaderboardEntry = await Leaderboard.findOne({
                    childId,
                    programId,
                    centerId,
                    period,
                });

                if (!leaderboardEntry) {
                    leaderboardEntry = new Leaderboard({
                        childId,
                        childName,
                        programId,
                        centerId,
                        period,
                        points: 0,
                    });
                }

                leaderboardEntry.points += points;
                await leaderboardEntry.save();
            }

            // Recalculate ranks
            await this.recalculateRanks(programId, centerId);

            return true;
        } catch (error) {
            throw new Error(`Failed to update leaderboard: ${error.message}`);
        }
    }

    async getLeaderboard(programId: string, centerId: string, period: string, limit: number = 10) {
        try {
            return await Leaderboard.find({ programId, centerId, period })
                .sort({ points: -1 })
                .limit(limit);
        } catch (error) {
            throw new Error(`Failed to get leaderboard: ${error.message}`);
        }
    }

    private async recalculateRanks(programId: string, centerId: string) {
        try {
            const periods = ['daily', 'weekly', 'monthly', 'all-time'];

            for (const period of periods) {
                const entries = await Leaderboard.find({ programId, centerId, period })
                    .sort({ points: -1 });

                for (let i = 0; i < entries.length; i++) {
                    entries[i].rank = i + 1;
                    await entries[i].save();
                }
            }
        } catch (error) {
            throw new Error(`Failed to recalculate ranks: ${error.message}`);
        }
    }

    // Gamification Profile Management
    async getOrCreateProfile(childId: string) {
        try {
            let profile = await GamificationProfile.findOne({ childId });

            if (!profile) {
                profile = new GamificationProfile({ childId });
                await profile.save();
            }

            return profile;
        } catch (error) {
            throw new Error(`Failed to get or create profile: ${error.message}`);
        }
    }

    async updateProfileBadgeCount(childId: string) {
        try {
            const profile = await this.getOrCreateProfile(childId);
            const badgeCount = await Badge.countDocuments({ childId, isActive: true });

            profile.totalBadges = badgeCount;
            await profile.save();

            return profile;
        } catch (error) {
            throw new Error(`Failed to update profile badge count: ${error.message}`);
        }
    }

    async updateProfilePoints(childId: string, points: number) {
        try {
            const profile = await this.getOrCreateProfile(childId);

            profile.totalPoints += points;
            profile.experiencePoints += points;

            // Check for level up
            const levelThreshold = 1000;
            const newLevel = Math.floor(profile.experiencePoints / levelThreshold) + 1;

            if (newLevel > profile.currentLevel) {
                profile.currentLevel = newLevel;

                // Emit level up event
                await this.eventBus.publish('level.up', {
                    childId,
                    newLevel,
                    totalPoints: profile.totalPoints,
                });
            }

            // Update tier
            profile.tier = this.calculateTier(profile.totalPoints);

            await profile.save();
            return profile;
        } catch (error) {
            throw new Error(`Failed to update profile points: ${error.message}`);
        }
    }

    private calculateTier(points: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' {
        if (points >= 10000) return 'diamond';
        if (points >= 7500) return 'platinum';
        if (points >= 5000) return 'gold';
        if (points >= 2500) return 'silver';
        return 'bronze';
    }

    async getProfile(childId: string) {
        try {
            return await this.getOrCreateProfile(childId);
        } catch (error) {
            throw new Error(`Failed to get profile: ${error.message}`);
        }
    }

    // Reward Management
    async awardReward(childId: string, type: string, amount: number, description: string) {
        try {
            const reward = new Reward({
                childId,
                type,
                amount,
                description,
            });

            await reward.save();

            // Update profile points if it's a points reward
            if (type === 'points') {
                await this.updateProfilePoints(childId, amount);
            }

            // Emit event
            await this.eventBus.publish('reward.awarded', {
                childId,
                rewardId: reward._id,
                type,
                amount,
            });

            return reward;
        } catch (error) {
            throw new Error(`Failed to award reward: ${error.message}`);
        }
    }

    async redeemReward(rewardId: string) {
        try {
            const reward = await Reward.findByIdAndUpdate(
                rewardId,
                { isRedeemed: true, redeemedDate: new Date() },
                { new: true }
            );

            // Emit event
            await this.eventBus.publish('reward.redeemed', {
                childId: reward.childId,
                rewardId: reward._id,
                type: reward.type,
            });

            return reward;
        } catch (error) {
            throw new Error(`Failed to redeem reward: ${error.message}`);
        }
    }

    async getRewards(childId: string, redeemed?: boolean) {
        try {
            const query: any = { childId };
            if (redeemed !== undefined) {
                query.isRedeemed = redeemed;
            }
            return await Reward.find(query).sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Failed to get rewards: ${error.message}`);
        }
    }

    // Dashboard
    async getGamificationDashboard(childId: string) {
        try {
            const profile = await this.getProfile(childId);
            const badges = await this.getBadges(childId);
            const streaks = await this.getStreaks(childId);
            const activeChallenges = await this.getChallenges(childId, 'active');
            const rewards = await this.getRewards(childId, false);

            return {
                profile,
                badges,
                streaks,
                activeChallenges,
                rewards,
                summary: {
                    totalBadges: badges.length,
                    totalStreaks: streaks.length,
                    activeChallenges: activeChallenges.length,
                    pendingRewards: rewards.length,
                },
            };
        } catch (error) {
            throw new Error(`Failed to get gamification dashboard: ${error.message}`);
        }
    }
}

export default new GamificationService();
