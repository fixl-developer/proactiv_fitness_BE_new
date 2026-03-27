// ─── Request DTOs ────────────────────────────────────────────────

export class GetProfileRequest {
  studentId!: string;
  tenantId!: string;
}

export class GenerateLearningPathRequest {
  studentId!: string;
  tenantId!: string;
}

export class GetSkillGapsRequest {
  studentId!: string;
  tenantId!: string;
}

export class GetCompetitionReadinessRequest {
  studentId!: string;
  tenantId!: string;
}

export class GenerateDevelopmentRoadmapRequest {
  studentId!: string;
  tenantId!: string;
  horizon!: string; // '1yr' | '3yr' | '5yr'
}

// ─── Response DTOs ───────────────────────────────────────────────

export class ProfileResponse {
  success!: boolean;
  data!: {
    twinId: string;
    aggregatedSkills: Array<{ skill: string; level: number; trend: string }>;
    strengthAreas: string[];
    developmentAreas: string[];
    learningStyle: string;
    fitnessAge: number;
    totalSessionsCompleted: number;
    totalHoursTrained: number;
    aiPowered: boolean;
  };
}

export class LearningPathResponse {
  success!: boolean;
  data!: {
    twinId: string;
    currentPhase: string;
    phases: Array<{
      name: string;
      duration: string;
      goals: string[];
      exercises: string[];
      milestones: string[];
    }>;
    progressPercentage: number;
    estimatedCompletionDate: string;
    aiPowered: boolean;
  };
}

export class SkillGapsResponse {
  success!: boolean;
  data!: {
    twinId: string;
    skillGaps: Array<{
      skill: string;
      currentLevel: number;
      targetLevel: number;
      gap: number;
      priority: string;
      closingStrategy: string;
      estimatedWeeksToClose: number;
    }>;
    aiPowered: boolean;
  };
}

export class CompetitionReadinessResponse {
  success!: boolean;
  data!: {
    twinId: string;
    overallScore: number;
    categories: Array<{ name: string; score: number; status: string }>;
    readyForLevel: string;
    recommendedCompetitions: string[];
    areasToImprove: string[];
    aiPowered: boolean;
  };
}

export class DevelopmentRoadmapResponse {
  success!: boolean;
  data!: {
    twinId: string;
    horizon: string;
    milestones: Array<{
      timeframe: string;
      goal: string;
      requirements: string[];
      likelihood: number;
    }>;
    pathways: Array<{ name: string; description: string; suitability: number }>;
    recommendations: string[];
    aiPowered: boolean;
  };
}
