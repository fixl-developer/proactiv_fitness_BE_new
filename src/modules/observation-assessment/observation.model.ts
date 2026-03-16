// Observation & Assessment System Data Models

export interface ISkillAssessment {
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

export interface IProgressTracking {
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

export interface Milestone {
    milestoneId: string;
    name: string;
    targetDate: Date;
    completionDate?: Date;
    status: 'pending' | 'completed';
}

export interface IPerformanceAnalytics {
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

export interface IBehavioralTracking {
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

export interface IReportGeneration {
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

export interface IAssessmentTemplate {
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

export interface SkillItem {
    skillId: string;
    skillName: string;
    description: string;
    maxScore: number;
    rubric: string;
}

export interface IStudentPortfolio {
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

export interface Achievement {
    achievementId: string;
    name: string;
    date: Date;
    description: string;
    badge: string;
}

export interface Certificate {
    certificateId: string;
    name: string;
    issuedDate: Date;
    expiryDate?: Date;
    certificateUrl: string;
}

export interface MediaItem {
    mediaId: string;
    type: 'photo' | 'video' | 'document';
    url: string;
    uploadDate: Date;
    description: string;
}

export interface IParentNotification {
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

export interface IAssessmentSchedule {
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
