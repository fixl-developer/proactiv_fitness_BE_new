export interface IUserClass {
    userId: string;
    classId: string;
    className: string;
    programId: string;
    programName: string;
    coachId: string;
    coachName: string;
    schedule: {
        dayOfWeek: string;
        startTime: string;
        endTime: string;
        location: string;
    };
    enrollmentDate: Date;
    status: 'active' | 'completed' | 'cancelled' | 'on-hold';
    attendance: {
        total: number;
        attended: number;
        missed: number;
        percentage: number;
    };
    performance: {
        rating: number;
        feedback: string[];
        lastFeedbackDate?: Date;
    };
    materials: {
        id: string;
        name: string;
        type: string;
        url: string;
        uploadedAt: Date;
    }[];
    nextClass?: Date;
    lastClass?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IEnrollClassDto {
    classId: string;
    programId: string;
}

export interface IClassFeedbackDto {
    rating: number;
    feedback: string;
}
