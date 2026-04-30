import { Schema, model, Document } from 'mongoose';

export interface IParentAIAssistantDocument extends Document {
    reportId: string;
    tenantId: string;
    parentId: string;
    studentId: string;
    type: string;
    report: {
        summary: string;
        highlights: string[];
        areasOfProgress: Array<{
            area: string;
            progress: string;
            trend: string;
        }>;
        recommendations: string[];
    };
    reportCard: {
        termName: string;
        overallGrade: string;
        categories: Array<{
            name: string;
            grade: string;
            comments: string;
        }>;
        coachComments: string;
    };
    milestone: {
        title: string;
        description: string;
        achievedAt: Date;
        category: string;
    };
    qaConversation: {
        question: string;
        answer: string;
        followUpSuggestions: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}

const parentAIAssistantSchema = new Schema<IParentAIAssistantDocument>(
    {
        reportId: { type: String, required: true, unique: true },
        tenantId: { type: String, required: true },
        parentId: { type: String, required: true },
        studentId: { type: String, required: true },
        type: {
            type: String,
            required: true,
            enum: ['WEEKLY_REPORT', 'MONTHLY_REPORT', 'REPORT_CARD', 'MILESTONE', 'QA_RESPONSE'],
        },
        report: {
            summary: String,
            highlights: [String],
            areasOfProgress: [
                {
                    area: String,
                    progress: String,
                    trend: String,
                },
            ],
            recommendations: [String],
        },
        reportCard: {
            termName: String,
            overallGrade: String,
            categories: [
                {
                    name: String,
                    grade: String,
                    comments: String,
                },
            ],
            coachComments: String,
        },
        milestone: {
            title: String,
            description: String,
            achievedAt: Date,
            category: String,
        },
        qaConversation: {
            question: String,
            answer: String,
            followUpSuggestions: [String],
        },
    },
    { timestamps: true }
);

export const ParentAIAssistantModel = model<IParentAIAssistantDocument>('ParentAIAssistant', parentAIAssistantSchema);
