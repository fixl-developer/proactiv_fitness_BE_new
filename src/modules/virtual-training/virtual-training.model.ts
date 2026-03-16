import { Schema, model } from 'mongoose';

const virtualClassSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    instructorName: String,
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: Number,
    maxParticipants: Number,
    currentParticipants: { type: Number, default: 0 },
    status: { type: String, enum: ['scheduled', 'live', 'completed', 'cancelled'], default: 'scheduled' },
    streamUrl: String,
    recordingUrl: String,
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

virtualClassSchema.index({ instructorId: 1 });
virtualClassSchema.index({ status: 1 });
virtualClassSchema.index({ startTime: 1 });

export default model('VirtualClass', virtualClassSchema);
