export interface GenerateProgressVideoDTO {
    childId: string;
    period: 'weekly' | 'monthly' | 'quarterly';
    includePhotos: boolean;
    includeMetrics: boolean;
}

export interface CreateMilestoneDTO {
    childId: string;
    parentId: string;
    title: string;
    description: string;
    category: string;
}

export interface CreateEducationContentDTO {
    title: string;
    description: string;
    content: string;
    category: string;
    videoUrl?: string;
    duration?: number;
}

export interface CreateProgressReportDTO {
    childId: string;
    childName: string;
    parentId: string;
    parentEmail: string;
    period: 'monthly' | 'quarterly' | 'annual';
    attendanceRate: number;
    skillsProgress: any[];
    engagementScore: number;
    recommendations: string[];
}

export interface ScheduleWorkshopDTO {
    title: string;
    description: string;
    scheduledDate: Date;
    duration: number;
    instructor: string;
    topic: string;
    maxCapacity: number;
}

export interface UpdateCommunicationPreferencesDTO {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
    weeklyDigest?: boolean;
    progressUpdates?: boolean;
    workshopInvitations?: boolean;
}

export interface CollectFeedbackDTO {
    parentId: string;
    childId: string;
    rating: number;
    comment: string;
    category: string;
}

export interface ShareVideoDTO {
    recipientEmails: string[];
    message: string;
}
