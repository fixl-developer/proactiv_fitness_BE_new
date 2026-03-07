import mongoose, { Schema, Document } from 'mongoose';

const VirtualSessionSchema = new Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['live', 'on-demand', 'one-on-one'], required: true },
    programId: String,
    coachId: { type: String, required: true, index: true },
    scheduledStart: { type: Date, required: true },
    scheduledEnd: { type: Date, required: true },
    actualStart: Date,
    actualEnd: Date,
    status: { type: String, enum: ['scheduled', 'live', 'completed', 'cancelled'], default: 'scheduled' },
    maxParticipants: { type: Number, default: 50 },
    participants: [{
        userId: String,
        role: { type: String, enum: ['coach', 'student', 'observer'] },
        joinedAt: Date,
        leftAt: Date,
        duration: Number,
        cameraEnabled: Boolean,
        micEnabled: Boolean,
        screenSharing: Boolean
    }],
    streamUrl: String,
    recordingUrl: String,
    chatEnabled: { type: Boolean, default: true },
    screenShareEnabled: { type: Boolean, default: true },
    multiCamera: { type: Boolean, default: false },
    settings: {
        quality: { type: String, enum: ['low', 'medium', 'high', 'hd'], default: 'high' },
        recordSession: { type: Boolean, default: true },
        allowChat: { type: Boolean, default: true },
        allowQuestions: { type: Boolean, default: true },
        waitingRoom: { type: Boolean, default: false },
        autoRecord: { type: Boolean, default: true }
    }
}, { timestamps: true });

VirtualSessionSchema.index({ scheduledStart: 1, status: 1 });
VirtualSessionSchema.index({ coachId: 1, scheduledStart: -1 });

const VirtualRecordingSchema = new Schema({
    id: { type: String, required: true, unique: true },
    sessionId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    duration: { type: Number, required: true },
    fileUrl: { type: String, required: true },
    thumbnailUrl: String,
    size: Number,
    format: { type: String, default: 'mp4' },
    quality: String,
    views: { type: Number, default: 0 },
    status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' }
}, { timestamps: true });

const VirtualLibrarySchema = new Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    category: [String],
    tags: [String],
    videoUrl: { type: String, required: true },
    thumbnailUrl: String,
    duration: Number,
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    coachId: { type: String, required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false }
}, { timestamps: true });

VirtualLibrarySchema.index({ title: 'text', description: 'text', tags: 'text' });

const VirtualAttendanceSchema = new Schema({
    id: { type: String, required: true, unique: true },
    sessionId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    joinedAt: { type: Date, required: true },
    leftAt: Date,
    duration: Number,
    engagement: { type: Number, min: 0, max: 100 },
    completed: { type: Boolean, default: false }
}, { timestamps: true });

export const VirtualSession = mongoose.model('VirtualSession', VirtualSessionSchema);
export const VirtualRecording = mongoose.model('VirtualRecording', VirtualRecordingSchema);
export const VirtualLibrary = mongoose.model('VirtualLibrary', VirtualLibrarySchema);
export const VirtualAttendance = mongoose.model('VirtualAttendance', VirtualAttendanceSchema);
