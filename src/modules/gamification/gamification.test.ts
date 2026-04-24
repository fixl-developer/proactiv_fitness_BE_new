import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';
import { Request, Response } from 'express';

describe('Gamification Module', () => {
    let service: GamificationService;
    let controller: GamificationController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        service = new GamificationService();
        controller = new GamificationController();

        mockRequest = {
            user: { id: 'test-user-123' },
            params: {},
            body: {}
        };

        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Points Management', () => {
        it('should award points to a user', async () => {
            const pointsData = {
                userId: 'test-user-123',
                points: 100,
                reason: 'Skill certification',
                transactionType: 'skill_unlock' as const
            };

            const result = await service.awardPoints(pointsData, 'test-user-123');

            expect(result).toBeDefined();
            expect(result.userId).toBe('test-user-123');
            expect(result.pointsAwarded).toBe(100);
        });

        it('should retrieve points balance', async () => {
            const balance = await service.getPointsBalance('test-user-123');

            expect(balance).toBeDefined();
            expect(balance.userId).toBe('test-user-123');
            expect(balance.totalPoints).toBeGreaterThanOrEqual(0);
        });

        it('should handle invalid user for points', async () => {
            expect(async () => {
                await service.getPointsBalance('');
            }).rejects.toThrow();
        });
    });

    describe('Streak Management', () => {
        it('should create a new streak', async () => {
            const streak = await service.createStreak('test-user-123', 'attendance');

            expect(streak).toBeDefined();
            expect(streak.userId).toBe('test-user-123');
            expect(streak.streakType).toBe('attendance');
            expect(streak.currentCount).toBe(1);
        });

        it('should retrieve user streaks', async () => {
            await service.createStreak('test-user-123', 'attendance');
            const streaks = await service.getStreaks('test-user-123');

            expect(Array.isArray(streaks)).toBe(true);
            expect(streaks.length).toBeGreaterThan(0);
        });

        it('should reset a streak', async () => {
            const streak = await service.createStreak('test-user-123', 'behavior');
            const reset = await service.resetStreak(streak.streakId);

            expect(reset.currentCount).toBe(0);
        });

        it('should track streak milestones', async () => {
            const streak = await service.createStreak('test-user-123', 'engagement');

            expect(streak.milestone).toBeDefined();
            expect(streak.milestone.count).toBeGreaterThan(0);
        });
    });

    describe('Achievement Management', () => {
        it('should unlock an achievement', async () => {
            const achievementData = {
                userId: 'test-user-123',
                achievementId: 'skill-cert-001',
                category: 'skill' as const,
                description: 'Certified in Basic Skills',
                points: 50
            };

            const result = await service.unlockAchievement(achievementData, 'test-user-123');

            expect(result).toBeDefined();
            expect(result.userId).toBe('test-user-123');
            expect(result.points).toBe(50);
        });

        it('should retrieve user achievements', async () => {
            const achievements = await service.getAchievements('test-user-123');

            expect(Array.isArray(achievements)).toBe(true);
        });

        it('should prevent duplicate achievement unlock', async () => {
            const achievementData = {
                userId: 'test-user-123',
                achievementId: 'skill-cert-001',
                category: 'skill' as const,
                description: 'Certified in Basic Skills',
                points: 50
            };

            await service.unlockAchievement(achievementData, 'test-user-123');

            expect(async () => {
                await service.unlockAchievement(achievementData, 'test-user-123');
            }).rejects.toThrow();
        });
    });

    describe('Challenge Management', () => {
        it('should create a challenge', async () => {
            const challengeData = {
                userId: 'test-user-123',
                challengeName: 'Weekly Attendance Challenge',
                difficulty: 'medium' as const,
                description: 'Attend all classes this week',
                targetProgress: 5
            };

            const result = await service.createChallenge('test-user-123', challengeData);

            expect(result).toBeDefined();
            expect(result.userId).toBe('test-user-123');
            expect(result.status).toBe('active');
        });

        it('should update challenge progress', async () => {
            const challengeData = {
                userId: 'test-user-123',
                challengeName: 'Weekly Attendance Challenge',
                difficulty: 'medium' as const,
                description: 'Attend all classes this week',
                targetProgress: 5
            };

            const challenge = await service.createChallenge('test-user-123', challengeData);
            const updated = await service.updateChallengeProgress(challenge.challengeId, 3);

            expect(updated.progress).toBe(3);
        });

        it('should complete challenge when target reached', async () => {
            const challengeData = {
                userId: 'test-user-123',
                challengeName: 'Weekly Attendance Challenge',
                difficulty: 'medium' as const,
                description: 'Attend all classes this week',
                targetProgress: 5
            };

            const challenge = await service.createChallenge('test-user-123', challengeData);
            const completed = await service.updateChallengeProgress(challenge.challengeId, 5);

            expect(completed.status).toBe('completed');
        });

        it('should retrieve active challenges', async () => {
            const challenges = await service.getActiveChallenges();

            expect(Array.isArray(challenges)).toBe(true);
        });
    });

    describe('Leaderboard Management', () => {
        it('should update leaderboard', async () => {
            const result = await service.updateLeaderboard(
                'test-user-123',
                'Test User',
                'program-001',
                'center-001',
                150
            );

            expect(result).toBeDefined();
            expect(result.userId).toBe('test-user-123');
        });

        it('should retrieve leaderboard', async () => {
            await service.updateLeaderboard(
                'test-user-123',
                'Test User',
                'program-001',
                'center-001',
                150
            );

            const leaderboard = await service.getLeaderboard('program-001', 'center-001', 'weekly', 10);

            expect(leaderboard).toBeDefined();
            expect(Array.isArray(leaderboard.entries)).toBe(true);
        });

        it('should rank users correctly', async () => {
            await service.updateLeaderboard('user-1', 'User 1', 'program-001', 'center-001', 300);
            await service.updateLeaderboard('user-2', 'User 2', 'program-001', 'center-001', 200);
            await service.updateLeaderboard('user-3', 'User 3', 'program-001', 'center-001', 100);

            const leaderboard = await service.getLeaderboard('program-001', 'center-001', 'all-time', 10);

            expect(leaderboard.entries[0].points).toBe(300);
            expect(leaderboard.entries[1].points).toBe(200);
            expect(leaderboard.entries[2].points).toBe(100);
        });
    });

    describe('Reward Management', () => {
        it('should award a reward', async () => {
            const result = await service.awardReward(
                'test-user-123',
                'badge',
                50,
                'Attendance Badge'
            );

            expect(result).toBeDefined();
            expect(result.userId).toBe('test-user-123');
            expect(result.rewardType).toBe('badge');
        });

        it('should redeem a reward', async () => {
            const reward = await service.awardReward(
                'test-user-123',
                'discount',
                100,
                '10% Discount'
            );

            const redeemed = await service.redeemReward(reward.rewardId);

            expect(redeemed.status).toBe('redeemed');
        });

        it('should retrieve available rewards', async () => {
            const rewards = await service.getRewards('test-user-123', false);

            expect(Array.isArray(rewards)).toBe(true);
        });

        it('should filter redeemed rewards', async () => {
            const reward = await service.awardReward(
                'test-user-123',
                'badge',
                50,
                'Attendance Badge'
            );
            await service.redeemReward(reward.rewardId);

            const redeemed = await service.getRewards('test-user-123', true);

            expect(redeemed.length).toBeGreaterThan(0);
            expect(redeemed[0].status).toBe('redeemed');
        });
    });

    describe('Gamification Profile', () => {
        it('should create or retrieve profile', async () => {
            const profile = await service.getOrCreateProfile('test-user-123');

            expect(profile).toBeDefined();
            expect(profile.userId).toBe('test-user-123');
        });

        it('should update profile badge count', async () => {
            await service.getOrCreateProfile('test-user-123');
            const updated = await service.updateProfileBadgeCount('test-user-123');

            expect(updated.badgesCount).toBeGreaterThanOrEqual(0);
        });

        it('should update profile points', async () => {
            await service.getOrCreateProfile('test-user-123');
            const updated = await service.updateProfilePoints('test-user-123', 100);

            expect(updated.totalPoints).toBeGreaterThanOrEqual(100);
        });

        it('should calculate tier correctly', async () => {
            const profile = await service.getOrCreateProfile('test-user-123');
            await service.updateProfilePoints('test-user-123', 500);

            const updated = await service.getProfile('test-user-123');
            expect(['bronze', 'silver', 'gold', 'platinum', 'diamond']).toContain(updated.currentTier);
        });

        it('should retrieve full profile', async () => {
            const profile = await service.getProfile('test-user-123');

            expect(profile).toBeDefined();
            expect(profile.userId).toBe('test-user-123');
            expect(profile.totalPoints).toBeDefined();
            expect(profile.currentTier).toBeDefined();
        });
    });

    describe('Gamification Dashboard', () => {
        it('should retrieve complete dashboard', async () => {
            const dashboard = await service.getGamificationDashboard('test-user-123');

            expect(dashboard).toBeDefined();
            expect(dashboard.userId).toBe('test-user-123');
            expect(dashboard.currentPoints).toBeDefined();
            expect(dashboard.currentTier).toBeDefined();
            expect(dashboard.recentBadges).toBeDefined();
            expect(dashboard.activeStreaks).toBeDefined();
            expect(dashboard.activeChallenges).toBeDefined();
            expect(dashboard.availableRewards).toBeDefined();
        });

        it('should include leaderboard rank in dashboard', async () => {
            const dashboard = await service.getGamificationDashboard('test-user-123');

            expect(dashboard.leaderboardRank).toBeGreaterThan(0);
            expect(dashboard.leaderboardTotal).toBeGreaterThan(0);
        });

        it('should show next milestone', async () => {
            const dashboard = await service.getGamificationDashboard('test-user-123');

            if (dashboard.nextMilestone) {
                expect(dashboard.nextMilestone.points).toBeGreaterThan(0);
                expect(dashboard.nextMilestone.reward).toBeDefined();
            }
        });
    });

    describe('Controller Integration', () => {
        it('should handle award points request', async () => {
            mockRequest.body = {
                userId: 'test-user-123',
                points: 100,
                reason: 'Skill certification',
                transactionType: 'skill_unlock'
            };

            await controller.awardPoints(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalled();
        });

        it('should handle get points balance request', async () => {
            mockRequest.params = { userId: 'test-user-123' };

            await controller.getPointsBalance(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalled();
        });

        it('should handle get profile request', async () => {
            mockRequest.params = { userId: 'test-user-123' };

            await controller.getGamificationProfile(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid user ID', async () => {
            expect(async () => {
                await service.getProfile('');
            }).rejects.toThrow();
        });

        it('should handle invalid challenge ID', async () => {
            expect(async () => {
                await service.updateChallengeProgress('', 5);
            }).rejects.toThrow();
        });

        it('should handle invalid reward ID', async () => {
            expect(async () => {
                await service.redeemReward('');
            }).rejects.toThrow();
        });

        it('should handle insufficient points for reward', async () => {
            expect(async () => {
                await service.redeemReward('invalid-reward-id');
            }).rejects.toThrow();
        });
    });

    describe('Data Validation', () => {
        it('should validate points amount', async () => {
            expect(async () => {
                await service.awardPoints({
                    userId: 'test-user-123',
                    points: -100,
                    reason: 'Invalid',
                    transactionType: 'manual'
                }, 'test-user-123');
            }).rejects.toThrow();
        });

        it('should validate challenge difficulty', async () => {
            expect(async () => {
                await service.createChallenge('test-user-123', {
                    userId: 'test-user-123',
                    challengeName: 'Test',
                    difficulty: 'invalid' as any,
                    description: 'Test',
                    targetProgress: 5
                });
            }).rejects.toThrow();
        });

        it('should validate tier calculation', async () => {
            const tier = (service as any).calculateTier(1000);
            expect(['bronze', 'silver', 'gold', 'platinum', 'diamond']).toContain(tier);
        });
    });
});
