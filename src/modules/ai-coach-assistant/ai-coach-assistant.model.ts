import { Schema, model, Document } from 'mongoose';

export interface IAICoachAssistantDocument extends Document {
    assistantId: string;
    tenantId: string;
    studentId: string;
    videoUrl: string;
    exerciseType: string;
    formAnalysis: {
        posture: string;
        alignment: string;
        movement: string;
        issues: string[];
    };
    corrections: Array<{
        issue: string;
        correction: string;
        priority: string;
        videoTimestamp?: number;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const aiCoachAssistantSchema = new Schema<IAICoachAssistantDocument>(
    {
        assistantId: { type: String, required: true, unique: true },
        tenantId: { type: String, required: true },
        studentId: { type: String, required: true },
        videoUrl: { type: String, required: true },
        exerciseType: { type: String, required: true },
        formAnalysis: {
            posture: String,
            alignment: String,
            movement: String,
            issues: [String],
        },
        corrections: [
            {
                issue: String,
                correction: String,
                priority: String,
                videoTimestamp: Number,
            },
        ],
    },
    { timestamps: true }
);

export const AICoachAssistantModel = model<IAICoachAssistantDocument>('AICoachAssistant', aiCoachAssistantSchema);
