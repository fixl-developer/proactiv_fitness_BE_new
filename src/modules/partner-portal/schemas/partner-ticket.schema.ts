import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

interface ITicketMessage {
    sender: string;
    senderType: string;
    message: string;
    createdAt: Date;
}

export interface IPartnerTicketDoc extends Document {
    partnerId: string;
    subject: string;
    description?: string;
    status: string;
    priority: string;
    category?: string;
    assignedTo: string;
    messages: ITicketMessage[];
    resolvedAt?: Date;
}

const partnerTicketSchema = new Schema<IPartnerTicketDoc>(
    {
        partnerId: { type: String, required: true, index: true },
        subject: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
        priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
        category: { type: String, trim: true },
        assignedTo: { type: String, default: 'Support Team' },
        messages: [
            {
                sender: { type: String },
                senderType: { type: String, enum: ['partner', 'support'] },
                message: { type: String },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        resolvedAt: { type: Date },
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_tickets' }
);

partnerTicketSchema.index({ partnerId: 1, status: 1 });
partnerTicketSchema.index({ createdAt: -1 });

export const PartnerTicket = model<IPartnerTicketDoc>('PartnerTicket', partnerTicketSchema);
