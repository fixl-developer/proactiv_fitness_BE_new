export class GenerateReportDTO {
    tenantId: string;
    parentId: string;
    studentId: string;
    period: string;
}

export class AskQuestionDTO {
    tenantId: string;
    parentId: string;
    studentId: string;
    question: string;
}

export class GenerateReportCardDTO {
    tenantId: string;
    parentId: string;
    studentId: string;
    termId: string;
}

export class ProgressReportResponseDTO {
    reportId: string;
    studentId: string;
    period: string;
    summary: string;
    highlights: string[];
    areasOfProgress: Array<{
        area: string;
        progress: string;
        trend: string;
    }>;
    recommendations: string[];
    parentActionItems: string[];
    aiPowered: boolean;
}

export class QAResponseDTO {
    reportId: string;
    question: string;
    answer: string;
    followUpSuggestions: string[];
    shouldEscalateToCoach: boolean;
    aiPowered: boolean;
}

export class MilestonesResponseDTO {
    studentId: string;
    existingMilestones: Array<{
        title: string;
        description: string;
        achievedAt: Date;
        category: string;
    }>;
    newMilestones: Array<{
        title: string;
        description: string;
        category: string;
        significance: string;
        reportId: string;
    }>;
    upcomingMilestones: Array<{
        title: string;
        description: string;
        estimatedDate: string;
        category: string;
    }>;
    aiPowered: boolean;
}

export class ReportCardResponseDTO {
    reportId: string;
    studentId: string;
    termId: string;
    termName: string;
    overallGrade: string;
    categories: Array<{
        name: string;
        grade: string;
        comments: string;
    }>;
    coachComments: string;
    parentSummary: string;
    nextTermGoals: string[];
    aiPowered: boolean;
}

export class NotificationsResponseDTO {
    parentId: string;
    notifications: Array<{
        title: string;
        message: string;
        priority: string;
        category: string;
        relatedReportId: string;
    }>;
    unreadCount: number;
    summary: string;
    aiPowered: boolean;
}
