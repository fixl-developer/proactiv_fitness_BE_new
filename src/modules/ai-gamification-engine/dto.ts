// ─── Request DTOs ────────────────────────────────────────────────

export class GenerateChallengesRequest {
  studentId!: string;
  tenantId!: string;
}

export class AdjustDifficultyRequest {
  tenantId!: string;
  studentId!: string;
  currentLevel!: number;
  recentPerformance!: {
    completionRate: number;
    averageScore: number;
    streak: number;
  };
}

export class BalanceTeamsRequest {
  tenantId!: string;
  participants!: Array<{
    studentId: string;
    skillLevel: number;
    strengths: string[];
  }>;
  teamCount!: number;
  activityType?: string;
}

export class GetRewardTimingRequest {
  studentId!: string;
  tenantId!: string;
}

export class GetStreakRiskRequest {
  studentId!: string;
  tenantId!: string;
}

// ─── Response DTOs ───────────────────────────────────────────────

export class ChallengesResponse {
  success!: boolean;
  data!: {
    gamificationId: string;
    challenges: Array<{
      challengeId: string;
      title: string;
      description: string;
      type: string;
      difficulty: number;
      xpReward: number;
      criteria: any;
      expiresAt: string;
      status: string;
    }>;
    aiPowered: boolean;
  };
}

export class DifficultyAdjustmentResponse {
  success!: boolean;
  data!: {
    gamificationId: string;
    previousLevel: number;
    newLevel: number;
    reason: string;
    adjustmentType: string;
    aiPowered: boolean;
  };
}

export class TeamBalanceResponse {
  success!: boolean;
  data!: {
    gamificationId: string;
    teams: Array<{
      teamId: string;
      members: string[];
      strengthScore: number;
    }>;
    balanceScore: number;
    methodology: string;
    aiPowered: boolean;
  };
}

export class RewardTimingResponse {
  success!: boolean;
  data!: {
    gamificationId: string;
    nextRewardAt: string;
    rewardType: string;
    reason: string;
    motivationLevel: string;
    aiPowered: boolean;
  };
}

export class StreakRiskResponse {
  success!: boolean;
  data!: {
    gamificationId: string;
    streakLength: number;
    riskLevel: string;
    intervention: string;
    motivationalMessage: string;
    suggestedActions: string[];
    aiPowered: boolean;
  };
}
