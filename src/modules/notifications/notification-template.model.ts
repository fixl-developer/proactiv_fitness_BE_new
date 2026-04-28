import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationTemplate extends Document {
    name: string;
    type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
    category: string;
    subject: string;
    body: string;
    variables: string[];
    status: 'published' | 'draft';
    usageCount: number;
    createdBy: mongoose.Types.ObjectId;
    tenantId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationTemplateSchema = new Schema(
    {
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ['EMAIL', 'SMS', 'PUSH', 'IN_APP'],
            required: true,
        },
        category: { type: String, required: true, default: 'General' },
        subject: { type: String, default: '' },
        body: { type: String, required: true },
        variables: [{ type: String }],
        status: {
            type: String,
            enum: ['published', 'draft'],
            default: 'draft',
        },
        usageCount: { type: Number, default: 0 },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        tenantId: { type: String },
    },
    { timestamps: true }
);

export const NotificationTemplate = mongoose.model<INotificationTemplate>(
    'NotificationTemplate',
    NotificationTemplateSchema
);
