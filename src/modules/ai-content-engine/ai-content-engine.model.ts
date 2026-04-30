import { Schema, model, Document } from 'mongoose';

export interface IAIContentEngineDocument extends Document {
    contentId: string;
    tenantId: string;
    type: string;
    topic: string;
    targetAudience: string;
    tone: string;
    content: {
        title: string;
        body: string;
        hashtags: string[];
        callToAction: string;
        mediaSuggestions: string[];
    };
    seoData: {
        keywords: string[];
        metaDescription: string;
        headings: string[];
        suggestions: string[];
    };
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const aiContentEngineSchema = new Schema<IAIContentEngineDocument>(
    {
        contentId: { type: String, required: true, unique: true },
        tenantId: { type: String, required: true },
        type: {
            type: String,
            enum: ['SOCIAL_POST', 'EMAIL', 'ARTICLE', 'AD_COPY', 'SEO'],
            required: true,
        },
        topic: { type: String },
        targetAudience: { type: String },
        tone: { type: String },
        content: {
            title: { type: String },
            body: { type: String },
            hashtags: [{ type: String }],
            callToAction: { type: String },
            mediaSuggestions: [{ type: String }],
        },
        seoData: {
            keywords: [{ type: String }],
            metaDescription: { type: String },
            headings: [{ type: String }],
            suggestions: [{ type: String }],
        },
        status: {
            type: String,
            enum: ['DRAFT', 'PUBLISHED', 'SCHEDULED'],
            default: 'DRAFT',
        },
    },
    { timestamps: true }
);

export const AIContentEngineModel = model<IAIContentEngineDocument>('AIContentEngine', aiContentEngineSchema);
