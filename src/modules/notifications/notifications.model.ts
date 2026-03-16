import { Schema, model, Document } from 'mongoose';

export interface INotificationDocument extends Document {
    userId: string;
    tenantId: string;
    type: 'email' | 'sms' | 'push' | 'in_app';
    category: 'booking' | 'payment' | 'alert' | 'reminder' | 'announcement';
    title: string;
    message: string;
    status: 'pending' | 'sent' | 'failed' | 'read';
    recipient: string;
    metadata: Record<string, any>;
    sentAt?: Date;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
    {
        userId: { type: String, required: true },
        tenantId: { type: String, required: true },
        type: { type: String, required: true },
        category: { type: String, required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        status: { type: String, default: 'pending' },
        recipient: { type: String, required: true },
        metadata: { type: Schema.Types.Mixed },
        sentAt: { type: Date },
        readAt: { type: Date },
    },
    { timestamps: true }
);

export const NotificationModel = model<INotificationDocument>('Notification', notificationSchema);
