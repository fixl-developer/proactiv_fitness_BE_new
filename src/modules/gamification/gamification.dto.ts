// Request DTOs
export class AwardPointsDTO {
    userId: string;
    points: number;
    reason: string;
    transactionType: 'attendance' | 'skill_unlock' | 'challenge_complete' | 'streak_bonus' | 'manual';
}

export class UpdateStreakDTO {
    userId: string;
    streakType: 'attendance' | 'behavior' | 'engagement';
    action: 'increment' | 'reset';
    reason?: string;
}

export class UnlockAchievementDTO {
    userId: string;
    achievementId: string;
    category: 'skill' | 'attendance' | 'behavior' | 'milestone';
    description: string;
    points: number;
}

export class RedeemRewardDTO {
    userId: string;
    rewardId: string;
    rewardType: 'badge' | 'discount' | 'credit' | 'certificate';
}

export class JoinChallengeDTO {
    userId: string;
    challengeId: string;
    challengeName: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export class GetLeaderboardDTO {
    programId: string;
    centerId: string;
    period: 'daily' | 'weekly' | 'monthly' | 'all-time';
    limit?: number;
}

// Response DTOs
export class PointsBalanceResponseDTO {
    userId: string;
    totalPoints: number;
    currentTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    pointsToNextTier: number;
    lastUpdated: Date;
}

export class StreakResponseDTO {
    streakId: string;
    userId: string;
    streakType: 'attendance' | 'behavior' | 'engagement';
    currentCount: number;
    bestCount: number;
    startDate: Date;
    lastUpdated: Date;
    milestone?: {
        count: number;
        reward: string;
    };
}

export class AchievementResponseDTO {
    achievementId: string;
    userId: string;
    category: 'skill' | 'attendance' | 'behavior' | 'milestone';
    title: string;
    description: string;
    points: number;
    unlockedDate: Date;
    icon?: string;
}

export class RewardResponseDTO {
    rewardId: string;
    userId: string;
    rewardType: 'badge' | 'discount' | 'credit' | 'certificate';
    title: string;
    description: string;
    pointsRequired: number;
    status: 'available' | 'redeemed' | 'expired';
    expiryDate?: Date;
    redeemedDate?: Date;
}

export class ChallengeResponseDTO {
    challengeId: string;
    userId: string;
    challengeName: string;
    difficulty: 'easy' | 'medium' | 'hard';
    description: string;
    progress: number;
    targetProgress: number;
    status: 'active' | 'completed' | 'abandoned';
    startDate: Date;
    endDate?: Date;
    reward?: {
        points: number;
        badge?: string;
    };
}

export class LeaderboardResponseDTO {
    leaderboardId: string;
    period: 'daily' | 'weekly' | 'monthly' | 'all-time';
    programId: string;
    centerId: string;
    entries: LeaderboardEntryDTO[];
    generatedAt: Date;
}

export class LeaderboardEntryDTO {
    rank: number;
    userId: string;
    userName: string;
    points: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    badges: number;
    streaks: number;
}

export class GamificationProfileResponseDTO {
    userId: string;
    userName: string;
    totalPoints: number;
    currentTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    badgesCount: number;
    achievementsCount: number;
    activeStreaks: number;
    activeChallenges: number;
    totalRewards: number;
    joinedDate: Date;
    lastActivityDate: Date;
    profileStats: {
        totalPointsEarned: number;
        totalBadgesEarned: number;
        totalAchievementsUnlocked: number;
        longestStreak: number;
        challengesCompleted: number;
        rewardsRedeemed: number;
    };
}

export class GamificationDashboardDTO {
    userId: string;
    userName: string;
    currentPoints: number;
    currentTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    pointsToNextTier: number;
    recentBadges: AchievementResponseDTO[];
    activeStreaks: StreakResponseDTO[];
    activeChallenges: ChallengeResponseDTO[];
    availableRewards: RewardResponseDTO[];
    leaderboardRank: number;
    leaderboardTotal: number;
    nextMilestone?: {
        points: number;
        reward: string;
    };
}
