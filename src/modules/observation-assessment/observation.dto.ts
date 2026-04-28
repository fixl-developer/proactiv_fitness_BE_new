export class CreateSkillAssessmentDTO {
    centerId: string;
    studentId: string;
    skillId: string;
    skillName: string;
    assessor: string;
    score: number;
    maxScore: number;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    notes?: string;
}

export class CreateProgressTrackingDTO {
    centerId: string;
    studentId: string;
    programId: string;
    startDate: Date;
    currentLevel: string;
    targetLevel: string;
}

export class GeneratePerformanceAnalyticsDTO {
    centerId: string;
    studentId: string;
    period: 'weekly' | 'monthly' | 'quarterly';
}

export class RecordBehaviorDTO {
    centerId: string;
    studentId: string;
    behavior: 'positive' | 'neutral' | 'negative';
    category: 'cooperation' | 'focus' | 'effort' | 'attitude' | 'safety';
    description: string;
    recordedBy: string;
}

export class GenerateReportDTO {
    centerId: string;
    studentId: string;
    reportType: 'progress' | 'assessment' | 'behavioral' | 'comprehensive';
    period: 'monthly' | 'quarterly' | 'annual';
    content: string;
}

export class CreateAssessmentTemplateDTO {
    centerId: string;
    templateName: string;
    programId: string;
    skills: any[];
    maxScore: number;
    description: string;
}

export class CreateStudentPortfolioDTO {
    centerId: string;
    studentId: string;
}

export class SendParentNotificationDTO {
    centerId: string;
    parentId: string;
    studentId: string;
    type: 'progress' | 'assessment' | 'behavior' | 'achievement';
    title: string;
    message: string;
    data?: any;
}

export class ScheduleAssessmentDTO {
    centerId: string;
    programId: string;
    assessmentType: string;
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual';
    nextScheduledDate: Date;
}
