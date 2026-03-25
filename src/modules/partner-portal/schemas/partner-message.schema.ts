import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

interface IMessageReply {
    sender: string;
    message: string;
    createdAt: Date;
}

export interface IPartnerMessageDoc extends Document {
    partnerId: string;
    from: string;
    fromType: string;
    subject: string;
    body: string;
    isRead: boolean;
    isArchived: boolean;
    starred: boolean;
    priority: string;
    replies: IMessageReply[];
}

const partnerMessageSchema = new Schema<IPartnerMessageDoc>(
    {
        partnerId: { type: String, required: true, index: true },
        from: { type: String, required: true, trim: true },
        fromType: { type: String, enum: ['partner', 'support', 'system'], default: 'support' },
        subject: { type: String, required: true, trim: true },
        body: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        isArchived: { type: Boolean, default: false },
        starred: { type: Boolean, default: false },
        priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
        replies: [
            {
                sender: { type: String },
                message: { type: String },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_messages' }
);

partnerMessageSchema.index({ partnerId: 1, isRead: 1 });
partnerMessageSchema.index({ createdAt: -1 });

export const PartnerMessage = model<IPartnerMessageDoc>('PartnerMessage', partnerMessageSchema);
