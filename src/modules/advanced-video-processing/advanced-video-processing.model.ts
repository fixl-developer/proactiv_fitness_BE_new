import mongoose, { Schema, Document } from 'mongoose';

const AdvancedVideoProcessingSchema = new Schema({
    videoId: String,
    title: String,
    description: String,
    coachId: String,
    classId: String,
    status: { type: String, enum: ['uploaded', 'processing', 'completed', 'failed'] },
    format: String,
    transcodedUrl: String,
    uploadedAt: Date,
    views: Number,
    avgWatchTime: Number,
    engagementRate: Number,
    completionRate: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const AdvancedVideoProcessingModel = mongoose.model('AdvancedVideoProcessing', AdvancedVideoProcessingSchema);
