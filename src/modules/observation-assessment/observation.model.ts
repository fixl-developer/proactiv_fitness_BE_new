import { Schema, model, Document } from 'mongoose';
import { baseSchemaOptions } from '../../shared/base/base.model';

// ==================== SKILL ASSESSMENT ====================

export interface ISkillAssessment extends Document {
    assessmentId: string;
    centerId: string;
    studentId: string;
    skillId: string;
    skillName: string;
    assessmentDate: Date;
    assessor: string;
    score: number;
    maxScore: number;
    percentage: number;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    notes: string;
    status: 'pending' | 'completed' | 'reviewed';
    createdAt: Date;
    updatedAt: Date;
}

const SkillAssessmentSchema = new Schema<ISkillAssessment>(
    {
        assessmentId: { type: String, required: true, unique: true, index: true },
        centerId: { type: String, required: true, index: true },
        studentId: { type: String, required: true, index: true },
        skillId: { type: String, required: true, index: true },
        skillName: { type: String, required: true },
        assessmentDate: { type: Date, default: Date.now },
        assessor: { type: String, required: true },
        score: { type: Number, required: true, default: 0 },
        maxScore: { type: Number, required: true, default: 100 },
        percentage: { type: Number, default: 0 },
        level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'beginner' },
        notes: { type: String, default: '' },
        status: { type: String, enum: ['pending', 'completed', 'reviewed'], default: 'pending' },
    },
    baseSchemaOptions
);

// ==================== PROGRESS TRACKING ====================

export interface Milestone {
    milestoneId: string;
    name: string;
    targetDate: Date;
    completionDate?: Date;
    status: 'pending' | 'completed';
}

const MilestoneSchema = new Schema<Milestone>(
    {
        milestoneId: { type: String, required: true },
        name: { type: String, required: true },
        targetDate: { type: Date, required: true },
        completionDate: { type: Date },
        status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    },
    { _id: false }
);

export interface IProgressTracking extends Document {
    progressId: string;
    centerId: string;
    studentId: string;
    programId: string;
    startDate: Date;
    currentLevel: string;
    targetLevel: string;
    completionPercentage: number;
    assessments: string[];
    milestones: Milestone[];
    status: 'active' | 'completed' | 'paused';
    createdAt: Date;
    updatedAt: Date;
}

const ProgressTrackingSchema = new Schema<IProgressTracking>(
    {
        progressId: { type: String, required: true, unique: true, index: true },
        centerId: { type: String, required: true, index: true },
        studentId: { type: String, required: true, index: true },
        programId: { type: String, required: true, index: true },
        startDate: { type: Date, default: Date.now },
        currentLevel: { type: String, default: 'beginner' },
        targetLevel: { type: String, default: 'intermediate' },
        completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
        assessments: [{ type: String }],
        milestones: [MilestoneSchema],
        status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
    },
    baseSchemaOptions
);

// ==================== PERFORMANCE ANALYTICS ====================

export interface IPerformanceAnalytics extends Document {
    analyticsId: string;
    centerId: string;
    studentId: string;
    period: 'weekly' | 'monthly' | 'quarterly';
    date: Date;
    averageScore: number;
    improvementRate: number;
    skillsImproved: number;
    skillsRegressed: number;
    attendanceRate: number;
    engagementScore: number;
    createdAt: Date;
}

const PerformanceAnalyticsSchema = new Schema<IPerformanceAnalytics>(
    {
        analyticsId: { type: String, required: true, unique: true, index: true },
        centerId: { type: String, required: true, index: true },
        studentId: { type: String, required: true, index: true },
        period: { type: String, enum: ['weekly', 'monthly', 'quarterly'], required: true },
        date: { type: Date, default: Date.now },
        averageScore: { type: Number, default: 0 },
        improvementRate: { type: Number, default: 0 },
        skillsImproved: { type: Number, default: 0 },
        skillsRegressed: { type: Number, default: 0 },
        attendanceRate: { type: Number, default: 0 },
        engagementScore: { type: Number, default: 0 },
    },
    baseSchemaOptions
);

// ==================== BEHAVIORAL TRACKING ====================

export interface IBehavioralTracking extends Document {
    behaviorId: string;
    centerId: string;
    studentId: string;
    date: Date;
    behavior: 'positive' | 'neutral' | 'negative';
    category: 'cooperation' | 'focus' | 'effort' | 'attitude' | 'safety';
    description: string;
    recordedBy: string;
    createdAt: Date;
}

const BehavioralTrackingSchema = new Schema<IBehavioralTracking>(
    {
        behaviorId: { type: String, required: true, unique: true, index: true },
        centerId: { type: String, required: true, index: true },
        studentId: { type: String, required: true, index: true },
        date: { type: Date, default: Date.now },
        behavior: { type: String, enum: ['positive', 'neutral', 'negative'], required: true },
        category: { type: String, enum: ['cooperation', 'focus', 'effort', 'attitude', 'safety'], required: true },
        description: { type: String, default: '' },
        recordedBy: { type: String, required: true },
    },
    baseSchemaOptions
);

// ==================== REPORT GENERATION ====================

export interface IReportGeneration extends Document {
    reportId: string;
    centerId: string;
    studentId: string;
    reportType: 'progress' | 'assessment' | 'behavioral' | 'comprehensive';
    period: 'monthly' | 'quarterly' | 'annual';
    generatedDate: Date;
    content: string;
    metrics: any;
    status: 'draft' | 'finalized' | 'sent';
    sentDate?: Date;
    createdAt: Date;
}

const ReportGenerationSchema = new Schema<IReportGeneration>(
    {
        reportId: { type: String, required: true, unique: true, index: true },
        centerId: { type: String, required: true, index: true },
        studentId: { type: String, required: true, index: true },
        reportType: { type: String, enum: ['progress', 'assessment', 'behavioral', 'comprehensive'], default: 'progress' },
        period: { type: String, enum: ['monthly', 'quarterly', 'annual'], default: 'monthly' },
        generatedDate: { type: Date, default: Date.now },
        content: { type: String, default: '' },
        metrics: { type: Schema.Types.Mixed, default: {} },
        status: { type: String, enum: ['draft', 'finalized', 'sent'], default: 'draft' },
        sentDate: { type: Date },
    },
    baseSchemaOptions
);

// ==================== ASSESSMENT TEMPLATES ====================

export interface SkillItem {
    skillId: string;
    skillName: string;
    description: string;
    maxScore: number;
    rubric: string;
}

const SkillItemSchema = new Schema<SkillItem>(
    {
        skillId: { type: String, required: true },
        skillName: { type: String, required: true },
        description: { type: String, default: '' },
        maxScore: { type: Number, default: 100 },
        rubric: { type: String, default: '' },
    },
    { _id: false }
);

export interface IAssessmentTemplate extends Document {
    templateId: string;
    centerId: string;
    templateName: string;
    programId: string;
    skills: SkillItem[];
    maxScore: number;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AssessmentTemplateSchema = new Schema<IAssessmentTemplate>(
    {
        templateId: { type: String, required: true, unique: true, index: true },
        centerId: { type: String, required: true, index: true },
        templateName: { type: String, required: true },
        programId: { type: String, required: true, index: true },
        skills: [SkillItemSchema],
        maxScore: { type: Number, default: 100 },
        description: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
    },
    baseSchemaOptions
);

// ==================== STUDENT PORTFOLIO ====================

export interface Achievement {
    achievementId: string;
    name: string;
    date: Date;
    description: string;
    badge: string;
}

const AchievementSchema = new Schema<Achievement>(
    {
        achievementId: { type: String, required: true },
        name: { type: String, required: true },
        date: { type: Date, default: Date.now },
        description: { type: String, default: '' },
        badge: { type: String, default: '' },
    },
    { _id: false }
);

export interface Certificate {
    certificateId: string;
    name: string;
    issuedDate: Date;
    expiryDate?: Date;
    certificateUrl: string;
}

const CertificateSchema = new Schema<Certificate>(
    {
        certificateId: { type: String, required: true },
        name: { type: String, required: true },
        issuedDate: { type: Date, default: Date.now },
        expiryDate: { type: Date },
        certificateUrl: { type: String, default: '' },
    },
    { _id: false }
);

export interface MediaItem {
    mediaId: string;
    type: 'photo' | 'video' | 'document';
    url: string;
    uploadDate: Date;
    description: string;
}

const MediaItemSchema = new Schema<MediaItem>(
    {
        mediaId: { type: String, required: true },
        type: { type: String, enum: ['photo', 'video', 'document'], required: true },
        url: { type: String, required: true },
        uploadDate: { type: Date, default: Date.now },
        description: { type: String, default: '' },
    },
    { _id: false }
);

export interface IStudentPortfolio extends Document {
    portfolioId: string;
    centerId: string;
    studentId: string;
    achievements: Achievement[];
    certificates: Certificate[];
    assessments: string[];
    media: MediaItem[];
    createdAt: Date;
    updatedAt: Date;
}

const StudentPortfolioSchema = new Schema<IStudentPortfolio>(
    {
        portfolioId: { type: String, required: true, unique: true, index: true },
        centerId: { type: String, required: true, index: true },
        studentId: { type: String, required: true, unique: true, index: true },
        achievements: [AchievementSchema],
        certificates: [CertificateSchema],
        assessments: [{ type: String }],
        media: [MediaItemSchema],
    },
    baseSchemaOptions
);

// ==================== PARENT NOTIFICATIONS ====================

export interface IParentNotification extends Document {
    notificationId: string;
    centerId: string;
    parentId: string;
    studentId: string;
    type: 'progress' | 'assessment' | 'behavior' | 'achievement';
    title: string;
    message: string;
    data: any;
    isRead: boolean;
    sentDate: Date;
    createdAt: Date;
}

const ParentNotificationSchema = new Schema<IParentNotification>(
    {
        notificationId: { type: String, required: true, unique: true, index: true },
        centerId: { type: String, required: true, index: true },
        parentId: { type: String, required: true, index: true },
        studentId: { type: String, required: true, index: true },
        type: { type: String, enum: ['progress', 'assessment', 'behavior', 'achievement'], default: 'progress' },
        title: { type: String, required: true },
        message: { type: String, required: true },
        data: { type: Schema.Types.Mixed, default: {} },
        isRead: { type: Boolean, default: false },
        sentDate: { type: Date, default: Date.now },
    },
    baseSchemaOptions
);

// ==================== ASSESSMENT SCHEDULING ====================

export interface IAssessmentSchedule extends Document {
    scheduleId: string;
    centerId: string;
    programId: string;
    assessmentType: string;
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual';
    nextScheduledDate: Date;
    lastAssessmentDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AssessmentScheduleSchema = new Schema<IAssessmentSchedule>(
    {
        scheduleId: { type: String, required: true, unique: true, index: true },
        centerId: { type: String, required: true, index: true },
        programId: { type: String, required: true, index: true },
        assessmentType: { type: String, required: true },
        frequency: { type: String, enum: ['weekly', 'monthly', 'quarterly', 'annual'], default: 'monthly' },
        nextScheduledDate: { type: Date, required: true },
        lastAssessmentDate: { type: Date },
    },
    baseSchemaOptions
);

// ==================== MODEL EXPORTS ====================

export const SkillAssessment = model<ISkillAssessment>('SkillAssessment', SkillAssessmentSchema);
export const ProgressTracking = model<IProgressTracking>('ProgressTracking', ProgressTrackingSchema);
export const PerformanceAnalytics = model<IPerformanceAnalytics>('PerformanceAnalytics', PerformanceAnalyticsSchema);
export const BehavioralTracking = model<IBehavioralTracking>('BehavioralTracking', BehavioralTrackingSchema);
export const ReportGeneration = model<IReportGeneration>('ReportGeneration', ReportGenerationSchema);
export const AssessmentTemplate = model<IAssessmentTemplate>('AssessmentTemplate', AssessmentTemplateSchema);
export const StudentPortfolio = model<IStudentPortfolio>('StudentPortfolio', StudentPortfolioSchema);
export const ParentNotification = model<IParentNotification>('ParentNotification', ParentNotificationSchema);
export const AssessmentSchedule = model<IAssessmentSchedule>('AssessmentSchedule', AssessmentScheduleSchema);
