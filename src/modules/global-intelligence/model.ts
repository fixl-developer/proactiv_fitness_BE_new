import mongoose, { Schema, Document } from 'mongoose';

// ─── Interface ───────────────────────────────────────────────────
export interface LocationMetrics {
  revenue: number;
  retention: number;
  enrollment: number;
  satisfaction: number;
}

export interface LocationBenchmark {
  locationId: string;
  locationName: string;
  metrics: LocationMetrics;
  rank: number;
}

export interface BestPractice {
  sourceLocationId: string;
  practice: string;
  category: string;
  impact: string;
  applicability: number;
  implementationSteps: string[];
}

export interface RegionForecast {
  region: string;
  revenue: number;
  growth: number;
}

export interface ResourceSuggestion {
  locationId: string;
  resource: string;
  currentAllocation: number;
  suggestedAllocation: number;
  reasoning: string;
}

export interface ExpansionOpportunity {
  market: string;
  demandScore: number;
  competitionLevel: string;
  estimatedRevenue: number;
  roi: number;
  risks: string[];
}

export interface IGlobalIntelligence extends Document {
  intelligenceId: string;
  tenantId: string;
  type: 'BENCHMARK' | 'BEST_PRACTICE' | 'GLOBAL_FORECAST' | 'RESOURCE_OPTIMIZATION' | 'EXPANSION';
  benchmarks: {
    locations: LocationBenchmark[];
    topPerformers: string[];
    underPerformers: string[];
    insights: string;
  };
  bestPractices: BestPractice[];
  globalForecast: {
    totalRevenueProjection: number;
    enrollmentProjection: number;
    growthRate: number;
    byRegion: RegionForecast[];
    risks: string[];
    opportunities: string[];
  };
  resourceOptimization: {
    suggestions: ResourceSuggestion[];
    totalSavings: number;
  };
  expansionIntelligence: {
    opportunities: ExpansionOpportunity[];
    recommendations: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────────
const GlobalIntelligenceSchema = new Schema<IGlobalIntelligence>(
  {
    intelligenceId: { type: String, required: true, unique: true },
    tenantId: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['BENCHMARK', 'BEST_PRACTICE', 'GLOBAL_FORECAST', 'RESOURCE_OPTIMIZATION', 'EXPANSION'],
    },
    benchmarks: {
      locations: [
        {
          locationId: { type: String },
          locationName: { type: String },
          metrics: {
            revenue: { type: Number },
            retention: { type: Number },
            enrollment: { type: Number },
            satisfaction: { type: Number },
          },
          rank: { type: Number },
        },
      ],
      topPerformers: [{ type: String }],
      underPerformers: [{ type: String }],
      insights: { type: String },
    },
    bestPractices: [
      {
        sourceLocationId: { type: String },
        practice: { type: String },
        category: { type: String },
        impact: { type: String },
        applicability: { type: Number },
        implementationSteps: [{ type: String }],
      },
    ],
    globalForecast: {
      totalRevenueProjection: { type: Number },
      enrollmentProjection: { type: Number },
      growthRate: { type: Number },
      byRegion: [
        {
          region: { type: String },
          revenue: { type: Number },
          growth: { type: Number },
        },
      ],
      risks: [{ type: String }],
      opportunities: [{ type: String }],
    },
    resourceOptimization: {
      suggestions: [
        {
          locationId: { type: String },
          resource: { type: String },
          currentAllocation: { type: Number },
          suggestedAllocation: { type: Number },
          reasoning: { type: String },
        },
      ],
      totalSavings: { type: Number },
    },
    expansionIntelligence: {
      opportunities: [
        {
          market: { type: String },
          demandScore: { type: Number },
          competitionLevel: { type: String },
          estimatedRevenue: { type: Number },
          roi: { type: Number },
          risks: [{ type: String }],
        },
      ],
      recommendations: [{ type: String }],
    },
  },
  { timestamps: true }
);

GlobalIntelligenceSchema.index({ tenantId: 1, type: 1 });

export const GlobalIntelligenceModel = mongoose.model<IGlobalIntelligence>(
  'GlobalIntelligence',
  GlobalIntelligenceSchema
);

export default GlobalIntelligenceModel;
