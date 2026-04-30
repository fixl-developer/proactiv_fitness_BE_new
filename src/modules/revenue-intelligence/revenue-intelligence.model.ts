import { Schema, model, Document } from 'mongoose';

export interface IRevenueIntelligenceDocument extends Document {
    analysisId: string;
    tenantId: string;
    type: string;
    entityId: string;
    churnPrediction: {
        riskScore: number;
        riskLevel: string;
        factors: Array<{
            factor: string;
            impact: number;
            description: string;
        }>;
        retentionActions: string[];
    };
    retentionCampaign: {
        campaignName: string;
        targetSegment: string;
        channels: string[];
        messageTemplate: string;
        expectedImpact: {
            retentionImprovement: number;
            revenueProtected: number;
        };
    };
    upsellOpportunity: {
        studentId: string;
        suggestedPrograms: string[];
        estimatedRevenue: number;
        confidence: number;
        reasoning: string;
    };
    ltv: {
        predictedLtv: number;
        currentSpend: number;
        projectedMonths: number;
        confidence: number;
        factors: string[];
    };
    optimizationSuggestions: {
        suggestions: Array<{
            area: string;
            suggestion: string;
            expectedImpact: number;
            priority: number;
        }>;
    };
    createdAt: Date;
    updatedAt: Date;
}

const revenueIntelligenceSchema = new Schema<IRevenueIntelligenceDocument>(
    {
        analysisId: { type: String, required: true, unique: true },
        tenantId: { type: String, required: true },
        type: {
            type: String,
            required: true,
            enum: ['CHURN_PREDICTION', 'RETENTION_CAMPAIGN', 'UPSELL', 'LTV', 'OPTIMIZATION'],
        },
        entityId: { type: String },
        churnPrediction: {
            riskScore: Number,
            riskLevel: String,
            factors: [
                {
                    factor: String,
                    impact: Number,
                    description: String,
                },
            ],
            retentionActions: [String],
        },
        retentionCampaign: {
            campaignName: String,
            targetSegment: String,
            channels: [String],
            messageTemplate: String,
            expectedImpact: {
                retentionImprovement: Number,
                revenueProtected: Number,
            },
        },
        upsellOpportunity: {
            studentId: String,
            suggestedPrograms: [String],
            estimatedRevenue: Number,
            confidence: Number,
            reasoning: String,
        },
        ltv: {
            predictedLtv: Number,
            currentSpend: Number,
            projectedMonths: Number,
            confidence: Number,
            factors: [String],
        },
        optimizationSuggestions: {
            suggestions: [
                {
                    area: String,
                    suggestion: String,
                    expectedImpact: Number,
                    priority: Number,
                },
            ],
        },
    },
    { timestamps: true }
);

export const RevenueIntelligenceModel = model<IRevenueIntelligenceDocument>('RevenueIntelligence', revenueIntelligenceSchema);
