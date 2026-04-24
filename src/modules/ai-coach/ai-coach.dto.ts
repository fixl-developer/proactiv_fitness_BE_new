export class GetRecommendationsDTO {
    tenantId: string;
    studentId: string;
    performanceData: Record<string, any>;
    skillLevel: string;
}

export class AnalyzePerformanceDTO {
    tenantId: string;
    studentId: string;
    performanceMetrics: Record<string, any>;
}

export class AICoachResponseDTO {
    coachingId: string;
    recommendations: Array<{
        skill: string;
        suggestion: string;
        priority: number;
    }>;
    coachingPlan: {
        goals: string[];
        exercises: string[];
        timeline: string;
    };
}
