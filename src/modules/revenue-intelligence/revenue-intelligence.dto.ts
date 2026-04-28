export class GetChurnRiskDTO {
    tenantId: string;
    entityId: string;
}

export class TriggerRetentionCampaignDTO {
    tenantId: string;
    targetSegment: string;
    budget: number;
    goals: string[];
}

export class PredictLTVDTO {
    tenantId: string;
    studentId: string;
}

export class ChurnRiskResponseDTO {
    analysisId: string;
    entityId: string;
    riskScore: number;
    riskLevel: string;
    factors: Array<{
        factor: string;
        impact: number;
        description: string;
    }>;
    retentionActions: string[];
    urgency: string;
    estimatedChurnDate: string;
    aiPowered: boolean;
}

export class RetentionCampaignResponseDTO {
    analysisId: string;
    campaignName: string;
    targetSegment: string;
    channels: string[];
    messageTemplate: string;
    expectedImpact: {
        retentionImprovement: number;
        revenueProtected: number;
    };
    timeline: string;
    kpis: string[];
    abTestVariants: Array<{
        variant: string;
        description: string;
    }>;
    aiPowered: boolean;
}

export class UpsellOpportunitiesResponseDTO {
    tenantId: string;
    opportunities: Array<{
        studentId: string;
        suggestedPrograms: string[];
        estimatedRevenue: number;
        confidence: number;
        reasoning: string;
        approach: string;
    }>;
    totalEstimatedRevenue: number;
    topOpportunities: number;
    insights: string;
    aiPowered: boolean;
}

export class LTVResponseDTO {
    analysisId: string;
    studentId: string;
    predictedLtv: number;
    currentSpend: number;
    projectedMonths: number;
    confidence: number;
    factors: string[];
    segment: string;
    growthPotential: string;
    recommendedActions: string[];
    aiPowered: boolean;
}

export class OptimizationSuggestionsResponseDTO {
    analysisId: string;
    tenantId: string;
    suggestions: Array<{
        area: string;
        suggestion: string;
        expectedImpact: number;
        priority: number;
        effort: string;
        timeframe: string;
    }>;
    overallHealthScore: number;
    topPriority: string;
    quickWins: string[];
    longTermStrategies: string[];
    aiPowered: boolean;
}
