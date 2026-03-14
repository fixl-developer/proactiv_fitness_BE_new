import mongoose, { Schema, Document } from 'mongoose';

export interface IProgressVideo extends Document {
    childId: string;
    period: 'weekly' | 'monthly' | 'quarterly';
    generatedAt: Date;
    includePhotos: boolean;
    includeMetrics: boolean;
    videoUrl: string;
    duration: number;
    highlights: string[];
    metrics?: {
        attendanceRate: number;
        skillsLearned: number;
        progressScore: number;
        engagementLevel: number;
    };
    status: 'processing' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

export interface IMilestone extends Document {
    childId: string;
    parentId: string;
    title: string;
    description: string;
    category: string;
    achievedAt: Date;
    celebrationSent: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IEducationContent extends Document {
    title: string;
    description: string;
    content: string;
    category: string;
    videoUrl?: string;
    duration?: number;
    views: number;
    likes: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IProgressReport extends Document {
    childId: string;
    childName: string;
    parentId: string;
    parentEmail: string;
    period: 'monthly' | 'quarterly' | 'annual';
    generatedAt: Date;
    attendanceRate: number;
    skillsProgress: any[];
    engagementScore: number;
    recommendations: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IWorkshop extends Document {
    title: string;
    description: string;
    scheduledDate: Date;
    duration: number;
    instructor: string;
    topic: string;
    registeredParents: string[];
    maxCapacity: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICommunicationPreferences extends Document {
    parentId: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    weeklyDigest: boolean;
    progressUpdates: boolean;
    workshopInvitations: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IFeedback extends Document {
    parentId: string;
    childId: string;
    rating: number;
    comment: string;
    category: string;
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISatisfactionSurvey extends Document {
    parentId: string;
    overallSatisfaction: number;
    coachQuality: number;
    facilityQuality: number;
    communicationQuality: number;
    valueForMoney: number;
    recommendations: string;
    createdAt: Date;
    updatedAt: Date;
}

const ParentEngagementSchema = new Schema({
    type: { type: String, enum: ['video', 'milestone', 'education', 'report', 'workshop', 'preferences', 'feedback', 'survey'] },
    childId: String,
    parentId: String,
    title: String,
    description: String,
    content: String,
    videoUrl: String,
    duration: Number,
    highlights: [String],
    metrics: {
        attendanceRate: Number,
        skillsLearned: Number,
        progressScore: Number,
        engagementLevel: Number
    },
    status: String,
    category: String,
    achievedAt: Date,
    celebrationSent: Boolean,
    views: Number,
    likes: Number,
    period: String,
    generatedAt: Date,
    attendanceRate: Number,
    skillsProgress: [Schema.Types.Mixed],
    engagementScore: Number,
    recommendations: [String],
    scheduledDate: Date,
    instructor: String,
    topic: String,
    registeredParents: [String],
    maxCapacity: Number,
    emailNotifications: Boolean,
    smsNotifications: Boolean,
    pushNotifications: Boolean,
    weeklyDigest: Boolean,
    progressUpdates: Boolean,
    workshopInvitations: Boolean,
    rating: Number,
    comment: String,
    overallSatisfaction: Number,
    coachQuality: Number,
    facilityQuality: Number,
    communicationQuality: Number,
    valueForMoney: Number,
    submittedAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const ParentEngagementModel = mongoose.model('ParentEngagement', ParentEngagementSchema);
