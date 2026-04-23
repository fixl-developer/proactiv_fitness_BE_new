import { Schema, model, Document } from 'mongoose';

export interface INotificationDocument extends Document {
    userId: string;
    tenantId: string;
    type: 'email' | 'sms' | 'push' | 'in_app';
    category: 'booking' | 'payment' | 'alert' | 'reminder' | 'announcement' | 'achievement' | 'attendance' | 'schedule' | 'staff' | 'program' | 'ticket' | 'feedback';
    title: string;
    message: string;
    status: 'pending' | 'sent' | 'failed' | 'read';
    recipient: string;
    metadata: Record<string, any>;
    eventType?: string;    // Socket event name, e.g. 'booking:created'
    entityId?: string;     // ID of the related entity
    entityType?: string;   // e.g. 'booking', 'program', 'attendance'
    sentAt?: Date;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
    {
        userId: { type: String, required: true, index: true },
        tenantId: { type: String, required: true },
        type: { type: String, required: true },
        category: { type: String, required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        status: { type: String, default: 'pending', index: true },
        recipient: { type: String, required: true },
        metadata: { type: Schema.Types.Mixed },
        eventType: { type: String },
        entityId: { type: String },
        entityType: { type: String },
        sentAt: { type: Date },
        readAt: { type: Date },
    },
    { timestamps: true }
);

// Compound index for fast pending notification queries
notificationSchema.index({ userId: 1, status: 1, type: 1, createdAt: -1 });

export const NotificationModel = model<INotificationDocument>('Notification', notificationSchema);
