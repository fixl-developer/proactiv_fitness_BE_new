import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

export interface IPartnerNotificationDoc extends Document {
    partnerId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    actionUrl?: string;
}

const partnerNotificationSchema = new Schema<IPartnerNotificationDoc>(
    {
        partnerId: { type: String, required: true, index: true },
        type: { type: String, enum: ['alert', 'update', 'reminder', 'announcement'], default: 'update' },
        title: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        isRead: { type: Boolean, default: false },
        actionUrl: { type: String },
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_notifications' }
);

partnerNotificationSchema.index({ partnerId: 1, isRead: 1 });
partnerNotificationSchema.index({ createdAt: -1 });

export const PartnerNotification = model<IPartnerNotificationDoc>('PartnerNotification', partnerNotificationSchema);
