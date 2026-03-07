import mongoose, { Schema } from 'mongoose';
import { IVirtualSession } from './virtual-training.interface';

const virtualSessionSchema = new Schema<IVirtualSession>({
    title: { type: String, required: true },
    type: { type: String, enum: ['live', 'recorded'], required: true },
    instructorId: { type: String, required: true, index: true },
    streamUrl: String,
    recordingUrl: String,
    scheduledAt: Date,
    duration: { type: Number, required: true },
    participants: [String],
    status: { type: String, enum: ['scheduled', 'live', 'completed'], default: 'scheduled' }
}, { timestamps: true });

export const VirtualSession = mongoose.model<IVirtualSession>('VirtualSession', virtualSessionSchema);
