// ─── Request DTOs ────────────────────────────────────────────────

export class OptimizeMessageRequest {
  tenantId!: string;
  userId!: string;
  originalMessage!: string;
  targetAudience?: string;
  channels?: string[];
  tone?: string;
}

export class GetBestTimeRequest {
  userId!: string;
  tenantId!: string;
}

export class CreateABTestRequest {
  tenantId!: string;
  userId?: string;
  campaignName!: string;
  baseMessage!: string;
  goal!: string;
  variantCount?: number;
}

export class GetEngagementScoreRequest {
  userId!: string;
  tenantId!: string;
}

export class PredictCampaignRequest {
  tenantId!: string;
  campaignType!: string;
  targetAudience!: string;
  channel!: string;
  messagePreview!: string;
  scheduledTime?: string;
}

// ─── Response DTOs ───────────────────────────────────────────────

export class OptimizeMessageResponse {
  success!: boolean;
  data!: {
    communicationId: string;
    originalMessage: string;
    optimizedVersions: Array<{
      channel: string;
      content: string;
      subject: string;
      reasoning: string;
    }>;
    recommendedChannel: string;
    aiPowered: boolean;
  };
}

export class BestTimeResponse {
  success!: boolean;
  data!: {
    communicationId: string;
    bestSendTimes: Array<{
      dayOfWeek: string;
      hour: number;
      openRate: number;
    }>;
    reasoning: string;
    aiPowered: boolean;
  };
}

export class ABTestResponse {
  success!: boolean;
  data!: {
    communicationId: string;
    variants: Array<{
      name: string;
      content: string;
      predictedPerformance: number;
    }>;
    recommendedVariant: string;
    duration: string;
    aiPowered: boolean;
  };
}

export class EngagementScoreResponse {
  success!: boolean;
  data!: {
    communicationId: string;
    score: number;
    breakdown: {
      emailEngagement: number;
      smsEngagement: number;
      pushEngagement: number;
      appUsage: number;
    };
    trend: string;
    recommendations: string[];
    aiPowered: boolean;
  };
}

export class CampaignPredictionResponse {
  success!: boolean;
  data!: {
    communicationId: string;
    expectedOpenRate: number;
    expectedClickRate: number;
    expectedConversion: number;
    confidence: number;
    recommendations: string[];
    aiPowered: boolean;
  };
}
