import { Schema, model, Document } from 'mongoose';

export interface ISupportSchedule extends Document {
    scheduleId: string;
    staffName: string;
    staffId?: string;
    date: string;            // YYYY-MM-DD
    startTime: string;       // HH:mm
    endTime: string;         // HH:mm
    shiftType: 'morning' | 'evening' | 'night' | 'full-day';
    status: 'confirmed' | 'pending' | 'cancelled';
    location: string;
    notes?: string;
    createdBy: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SupportScheduleSchema = new Schema<ISupportSchedule>({
    scheduleId: { type: String, required: true, unique: true, index: true },
    staffName: { type: String, required: true, trim: true },
    staffId: String,
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    shiftType: { type: String, enum: ['morning', 'evening', 'night', 'full-day'], default: 'morning' },
    status: { type: String, enum: ['confirmed', 'pending', 'cancelled'], default: 'pending', index: true },
    location: { type: String, required: true, trim: true },
    notes: String,
    createdBy: { type: String, required: true },
    updatedBy: String,
}, { timestamps: true });

export const SupportSchedule = model<ISupportSchedule>('SupportSchedule', SupportScheduleSchema);
