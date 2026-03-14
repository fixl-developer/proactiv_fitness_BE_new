import { Schema, model, Document } from 'mongoose';

export interface IAICoachDocument extends Document {
    coachingId: string;
    tenantId: string;
    studentId: string;
    recommendations: Array<{
        skill: string;
        level: string;
        suggestion: string;
        priority: number;
    }>;
    performanceAnalysis: Record<string, any>;
    coachingPlan: {
        goals: string[];
        exercises: string[];
        timeline: string;
        progressMetrics: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}

const aiCoachSchema = new Schema<IAICoachDocument>(
    {
        coachingId: { type: String, required: true, unique: true },
        tenantId: { type: String, required: true },
        studentId: { type: String, required: true },
        recommendations: [
            {
                skill: String,
                level: String,
                suggestion: String,
                priority: Number,
            },
        ],
        performanceAnalysis: { type: Schema.Types.Mixed },
        coachingPlan: {
            goals: [String],
            exercises: [String],
            timeline: String,
            progressMetrics: [String],
        },
    },
    { timestamps: true }
);

export const AICoachModel = model<IAICoachDocument>('AICoach', aiCoachSchema);
