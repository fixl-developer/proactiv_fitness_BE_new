import { Schema, model, Document } from 'mongoose';

export interface ISmartSupportDocument extends Document {
    supportId: string;
    tenantId: string;
    originalTicketRef: string;
    classification: {
        category: string;
        priority: string;
        confidence: number;
    };
    routing: {
        assignedAgentId: string;
        routingReason: string;
        alternativeAgents: string[];
    };
    suggestedResponse: {
        response: string;
        tone: string;
        confidence: number;
    };
    sentiment: {
        score: number;
        label: string;
        keyPhrases: string[];
    };
    autoResolution: {
        resolved: boolean;
        resolution: string;
        confidence: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const smartSupportSchema = new Schema<ISmartSupportDocument>(
    {
        supportId: { type: String, required: true, unique: true },
        tenantId: { type: String, required: true },
        originalTicketRef: { type: String },
        classification: {
            category: {
                type: String,
                enum: ['BILLING', 'SCHEDULING', 'TECHNICAL', 'FEEDBACK', 'SAFETY', 'ENROLLMENT', 'GENERAL'],
            },
            priority: {
                type: String,
                enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
            },
            confidence: { type: Number },
        },
        routing: {
            assignedAgentId: { type: String },
            routingReason: { type: String },
            alternativeAgents: [{ type: String }],
        },
        suggestedResponse: {
            response: { type: String },
            tone: { type: String },
            confidence: { type: Number },
        },
        sentiment: {
            score: { type: Number },
            label: {
                type: String,
                enum: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive'],
            },
            keyPhrases: [{ type: String }],
        },
        autoResolution: {
            resolved: { type: Boolean },
            resolution: { type: String },
            confidence: { type: Number },
        },
    },
    { timestamps: true }
);

export const SmartSupportModel = model<ISmartSupportDocument>('SmartSupport', smartSupportSchema);
