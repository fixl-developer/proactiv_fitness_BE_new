import { Document } from 'mongoose';

export interface IFamilySchedule extends Document {
    scheduleId: string;
    familyId: string;
    children: {
        childId: string;
        childName: string;
        age: number;
        enrolledClasses: {
            classId: string;
            className: string;
            scheduleDay: string;
            scheduleTime: string;
            locationId: string;
        }[];
    }[];

    optimizationScore: number;
    travelTimeMinutes: number;
    carpoolOpportunities: number;

    suggestions: {
        suggestionId: string;
        type: 'schedule_alignment' | 'carpool_match' | 'sibling_bundle' | 'travel_optimization';
        description: string;
        estimatedSavings: {
            timeMinutes: number;
            costAmount: number;
        };
        priority: 'low' | 'medium' | 'high';
    }[];

    businessUnitId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IOptimizeScheduleRequest {
    familyId: string;
}
