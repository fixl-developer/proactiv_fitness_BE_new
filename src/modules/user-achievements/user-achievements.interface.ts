export interface IUserAchievement {
    userId: string;
    achievementId: string;
    name: string;
    description: string;
    category: 'attendance' | 'performance' | 'milestone' | 'special';
    icon: string;
    points: number;
    earnedAt: Date;
    progress: number;
    isCompleted: boolean;
    reward?: {
        type: 'points' | 'badge' | 'discount' | 'free-class';
        value: string | number;
        claimed: boolean;
        claimedAt?: Date;
    };
    requirements: {
        type: string;
        target: number;
        current: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IClaimRewardDto {
    achievementId: string;
}
