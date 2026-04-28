export interface IUserProfile {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    avatar?: string;
    bio?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
    };
    preferences?: {
        language?: string;
        timezone?: string;
        notifications?: {
            email: boolean;
            sms: boolean;
            push: boolean;
        };
    };
    stats?: {
        totalClasses: number;
        totalSpent: number;
        memberSince: Date;
        lastActive: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface IUpdateProfileDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    bio?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
    };
    preferences?: {
        language?: string;
        timezone?: string;
        notifications?: {
            email: boolean;
            sms: boolean;
            push: boolean;
        };
    };
}
