import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

export interface IPartnerBookingDoc extends Document {
    partnerId: string;
    studentName: string;
    programName: string;
    date: Date;
    time: string;
    status: string;
}

const partnerBookingSchema = new Schema<IPartnerBookingDoc>(
    {
        partnerId: { type: String, required: true, index: true },
        studentName: { type: String, required: true, trim: true },
        programName: { type: String, required: true, trim: true },
        date: { type: Date, required: true },
        time: { type: String, required: true },
        status: { type: String, enum: ['confirmed', 'pending', 'cancelled', 'completed'], default: 'pending' },
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_bookings' }
);

partnerBookingSchema.index({ partnerId: 1, date: -1 });
partnerBookingSchema.index({ status: 1 });

export const PartnerBooking = model<IPartnerBookingDoc>('PartnerBooking', partnerBookingSchema);
