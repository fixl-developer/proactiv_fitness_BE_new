// ─── Request DTOs ────────────────────────────────────────────────

export class GetBenchmarksRequest {
  tenantId!: string;
}

export class GetBestPracticesRequest {
  tenantId!: string;
}

export class GetGlobalForecastRequest {
  tenantId!: string;
}

export class OptimizeResourcesRequest {
  tenantId!: string;
  locations!: Array<{
    locationId: string;
    locationName: string;
    currentResources: Record<string, number>;
    utilization: number;
  }>;
  budget?: number;
}

export class GetExpansionOpportunitiesRequest {
  tenantId!: string;
}

// ─── Response DTOs ───────────────────────────────────────────────

export class BenchmarksResponse {
  success!: boolean;
  data!: {
    intelligenceId: string;
    locations: Array<{
      locationId: string;
      locationName: string;
      metrics: { revenue: number; retention: number; enrollment: number; satisfaction: number };
      rank: number;
    }>;
    topPerformers: string[];
    underPerformers: string[];
    insights: string;
    aiPowered: boolean;
  };
}

export class BestPracticesResponse {
  success!: boolean;
  data!: {
    intelligenceId: string;
    bestPractices: Array<{
      sourceLocationId: string;
      practice: string;
      category: string;
      impact: string;
      applicability: number;
      implementationSteps: string[];
    }>;
    aiPowered: boolean;
  };
}

export class GlobalForecastResponse {
  success!: boolean;
  data!: {
    intelligenceId: string;
    totalRevenueProjection: number;
    enrollmentProjection: number;
    growthRate: number;
    byRegion: Array<{ region: string; revenue: number; growth: number }>;
    risks: string[];
    opportunities: string[];
    aiPowered: boolean;
  };
}

export class ResourceOptimizationResponse {
  success!: boolean;
  data!: {
    intelligenceId: string;
    suggestions: Array<{
      locationId: string;
      resource: string;
      currentAllocation: number;
      suggestedAllocation: number;
      reasoning: string;
    }>;
    totalSavings: number;
    aiPowered: boolean;
  };
}

export class ExpansionOpportunitiesResponse {
  success!: boolean;
  data!: {
    intelligenceId: string;
    opportunities: Array<{
      market: string;
      demandScore: number;
      competitionLevel: string;
      estimatedRevenue: number;
      roi: number;
      risks: string[];
    }>;
    recommendations: string[];
    aiPowered: boolean;
  };
}
