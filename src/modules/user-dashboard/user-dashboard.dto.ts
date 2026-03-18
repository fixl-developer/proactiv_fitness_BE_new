export interface DashboardStatsDto {
    totalClasses: number;
    upcomingClasses: number;
    totalSpent: number;
    accountBalance: number;
}

export interface DashboardDataDto {
    profile: {
        name: string;
        email: string;
        avatar?: string;
        memberSince: Date;
    };
    stats: DashboardStatsDto;
    progress: {
        classesAttended: number;
        classesCompleted: number;
        currentStreak: number;
        totalHours: number;
    };
    upcomingClasses: any[];
    recentPayments: any[];
    recentActivity: any[];
}
