import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EmergencyContactStatus } from './emergency-contacts.interface';

@Schema({ timestamps: true })
export class EmergencyContact extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    @Prop({ required: true, trim: true })
    contactName: string;

    @Prop({ required: true, trim: true })
    relationship: string;

    @Prop({ required: true, trim: true })
    primaryPhone: string;

    @Prop({ trim: true })
    alternatePhone?: string;

    @Prop({ required: true, trim: true, lowercase: true })
    email: string;

    @Prop({ required: true, trim: true })
    address: string;

    @Prop({ default: false })
    isAuthorizedPickup: boolean;

    @Prop({ trim: true })
    medicalInfo?: string;

    @Prop({
        type: String,
        enum: Object.values(EmergencyContactStatus),
        default: EmergencyContactStatus.PENDING
    })
    status: EmergencyContactStatus;

    @Prop()
    verifiedDate?: Date;

    @Prop()
    verifiedBy?: string;

    @Prop({ trim: true })
    notes?: string;

    @Prop({ required: true })
    businessUnitId: string;

    @Prop({ required: true })
    createdBy: string;

    @Prop({ required: true })
    updatedBy: string;
}

export const EmergencyContactSchema = SchemaFactory.createForClass(EmergencyContact);

// Indexes
EmergencyContactSchema.index({ studentId: 1 });
EmergencyContactSchema.index({ businessUnitId: 1, status: 1 });
EmergencyContactSchema.index({ primaryPhone: 1 });
EmergencyContactSchema.index({ email: 1 });