import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WaitlistStatus, WaitlistPriority } from './waitlist.interface';

@Schema({ timestamps: true })
export class WaitlistEntry extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
    classId: Types.ObjectId;

    @Prop({ required: true, min: 1 })
    position: number;

    @Prop({
        type: String,
        enum: Object.values(WaitlistStatus),
        default: WaitlistStatus.ACTIVE
    })
    status: WaitlistStatus;

    @Prop({
        type: String,
        enum: Object.values(WaitlistPriority),
        default: WaitlistPriority.MEDIUM
    })
    priority: WaitlistPriority;

    @Prop({ required: true })
    joinedDate: Date;

    @Prop()
    offerDate?: Date;

    @Prop()
    offerExpiryDate?: Date;

    @Prop()
    enrolledDate?: Date;

    @Prop({ trim: true })
    notes?: string;

    @Prop({ required: true })
    businessUnitId: string;

    @Prop({ required: true })
    createdBy: string;

    @Prop({ required: true })
    updatedBy: string;
}

export const WaitlistEntrySchema = SchemaFactory.createForClass(WaitlistEntry);

// Indexes
WaitlistEntrySchema.index({ classId: 1, position: 1 });
WaitlistEntrySchema.index({ businessUnitId: 1, status: 1 });
WaitlistEntrySchema.index({ studentId: 1 });
