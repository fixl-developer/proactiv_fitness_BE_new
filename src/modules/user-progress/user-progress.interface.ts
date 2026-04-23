export interface IUserProgress {
    userId: string;
    classesAttended: number;
    classesCompleted: number;
    totalHours: number;
    currentStreak: number;
    longestStreak: number;
    skillLevels: {
        skillName: string;
        level: number;
        progress: number;
        lastUpdated: Date;
    }[];
    milestones: {
        id: string;
        name: string;
        description: string;
        achievedAt: Date;
        category: string;
    }[];
    performanceMetrics: {
        attendance: number;
        punctuality: number;
        participation: number;
        improvement: number;
    };
    timeline: {
        date: Date;
        event: string;
        description: string;
        type: 'class' | 'achievement' | 'milestone' | 'skill';
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IUpdateProgressDto {
    classesAttended?: number;
    classesCompleted?: number;
    totalHours?: number;
    currentStreak?: number;
    skillLevels?: Array<{
        skillName: string;
        level: number;
        progress: number;
    }>;
}
