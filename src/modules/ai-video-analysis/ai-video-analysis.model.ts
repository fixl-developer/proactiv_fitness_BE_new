import { Schema, model, Document } from 'mongoose';

export interface IAIVideoAnalysisDocument extends Document {
    analysisId: string;
    tenantId: string;
    studentId: string;
    videoUrl: string;
    exerciseType: string;
    formScore: number;
    analysis: {
        posture: string;
        alignment: string;
        movement: string;
        issues: string[];
        overallAssessment: string;
        safetyRisk: string;
    };
    injuryRisk: {
        riskLevel: string;
        riskFactors: string[];
        recommendations: string[];
    };
    comparison: {
        previousAnalysisId: string;
        improvementAreas: string[];
        regressionAreas: string[];
        overallTrend: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const aiVideoAnalysisSchema = new Schema<IAIVideoAnalysisDocument>(
    {
        analysisId: { type: String, required: true, unique: true },
        tenantId: { type: String, required: true },
        studentId: { type: String, required: true },
        videoUrl: { type: String },
        exerciseType: { type: String },
        formScore: { type: Number, min: 0, max: 100 },
        analysis: {
            posture: String,
            alignment: String,
            movement: String,
            issues: [String],
            overallAssessment: String,
            safetyRisk: String,
        },
        injuryRisk: {
            riskLevel: String,
            riskFactors: [String],
            recommendations: [String],
        },
        comparison: {
            previousAnalysisId: String,
            improvementAreas: [String],
            regressionAreas: [String],
            overallTrend: String,
        },
    },
    { timestamps: true }
);

export const AIVideoAnalysisModel = model<IAIVideoAnalysisDocument>('AIVideoAnalysis', aiVideoAnalysisSchema);
