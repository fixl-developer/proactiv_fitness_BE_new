import mongoose, { Schema, Document } from 'mongoose';

// ─── Interface ───────────────────────────────────────────────────
export interface OptimizedVersion {
  channel: string;
  content: string;
  subject: string;
  reasoning: string;
}

export interface SendTime {
  dayOfWeek: string;
  hour: number;
  openRate: number;
}

export interface ABVariant {
  name: string;
  content: string;
  predictedPerformance: number;
}

export interface EngagementBreakdown {
  emailEngagement: number;
  smsEngagement: number;
  pushEngagement: number;
  appUsage: number;
}

export interface IAICommunication extends Document {
  communicationId: string;
  tenantId: string;
  type: 'MESSAGE_OPTIMIZATION' | 'TIMING' | 'AB_TEST' | 'ENGAGEMENT_SCORE' | 'CAMPAIGN_PREDICTION';
  userId: string;
  messageOptimization: {
    originalMessage: string;
    optimizedVersions: OptimizedVersion[];
    recommendedChannel: string;
  };
  timingAnalysis: {
    bestSendTimes: SendTime[];
    reasoning: string;
  };
  abTest: {
    variants: ABVariant[];
    recommendedVariant: string;
    duration: string;
  };
  engagementScore: {
    score: number;
    breakdown: EngagementBreakdown;
    trend: string;
    recommendations: string[];
  };
  campaignPrediction: {
    expectedOpenRate: number;
    expectedClickRate: number;
    expectedConversion: number;
    confidence: number;
    recommendations: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────────
const AICommunicationSchema = new Schema<IAICommunication>(
  {
    communicationId: { type: String, required: true, unique: true },
    tenantId: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['MESSAGE_OPTIMIZATION', 'TIMING', 'AB_TEST', 'ENGAGEMENT_SCORE', 'CAMPAIGN_PREDICTION'],
    },
    userId: { type: String },
    messageOptimization: {
      originalMessage: { type: String },
      optimizedVersions: [
        {
          channel: { type: String },
          content: { type: String },
          subject: { type: String },
          reasoning: { type: String },
        },
      ],
      recommendedChannel: { type: String },
    },
    timingAnalysis: {
      bestSendTimes: [
        {
          dayOfWeek: { type: String },
          hour: { type: Number },
          openRate: { type: Number },
        },
      ],
      reasoning: { type: String },
    },
    abTest: {
      variants: [
        {
          name: { type: String },
          content: { type: String },
          predictedPerformance: { type: Number },
        },
      ],
      recommendedVariant: { type: String },
      duration: { type: String },
    },
    engagementScore: {
      score: { type: Number },
      breakdown: {
        emailEngagement: { type: Number },
        smsEngagement: { type: Number },
        pushEngagement: { type: Number },
        appUsage: { type: Number },
      },
      trend: { type: String },
      recommendations: [{ type: String }],
    },
    campaignPrediction: {
      expectedOpenRate: { type: Number },
      expectedClickRate: { type: Number },
      expectedConversion: { type: Number },
      confidence: { type: Number },
      recommendations: [{ type: String }],
    },
  },
  { timestamps: true }
);

AICommunicationSchema.index({ tenantId: 1, type: 1 });
AICommunicationSchema.index({ tenantId: 1, userId: 1 });

export const AICommunicationModel = mongoose.model<IAICommunication>(
  'AICommunication',
  AICommunicationSchema
);

export default AICommunicationModel;
