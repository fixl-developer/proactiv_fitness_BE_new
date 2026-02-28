import { Document } from 'mongoose';

export enum ClassStatus {
    SCHEDULED = 'scheduled',
    UNDERBOOKED = 'underbooked',
    OPTIMAL = 'optimal',
    FULL = 'full',
    OVERBOOKED = 'overbooked',
    CANCELLED = 'cancelled'
}

export enum RebalanceAction {
    MERGE_CLASSES = 'merge_classes',
    SPLIT_CLASS = 'split_class',
    MOVE_STUDENTS = 'move_students',
    CANCEL_CLASS = 'cancel_class',
    ADD_CLASS = 'add_class'
}

export interface ICapacityMonitor extends Document {
    monitorId: string;
    classId: string;
    className: string;
    scheduleDate: Date;
    scheduleTime: string;

    capacity: {
        total: number;
        booked: number;
        available: number;
        waitlist: number;
        utilizationRate: number;
    };

    status: ClassStatus;

    thresholds: {
        minUtilization: number;
        optimalUtilization: number;
        maxUtilization: number;
    };

    rebalanceRecommendations: {
        recommendationId: string;
        action: RebalanceAction;
        priority: 'low' | 'medium' | 'high' | 'critical';
        reason: string;
        estimatedImpact: {
            utilizationImprovement: number;
            revenueImpact: number;
            customerSatisfaction: number;
        };
        suggestedActions: string[];
        affectedStudents: number;
    }[];

    lastChecked: Date;
    nextCheckDue: Date;

    businessUnitId: string;
    locationId: string;

    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IRebalanceExecution extends Document {
    executionId: string;
    recommendationId: string;
    action: RebalanceAction;

    sourceClass: {
        classId: string;
        className: string;
        scheduleDate: Date;
        studentsAffected: number;
    };

    targetClass?: {
        classId: string;
        className: string;
        scheduleDate: Date;
    };

    executionStatus: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
    executionDate: Date;
    completedDate?: Date;

    notifications: {
        notificationId: string;
        recipientType: 'parent' | 'staff' | 'admin';
        recipientId: string;
        sentDate: Date;
        status: 'sent' | 'delivered' | 'read';
    }[];

    results: {
        studentsNotified: number;
        studentsAccepted: number;
        studentsDeclined: number;
        utilizationBefore: number;
        utilizationAfter: number;
        revenueImpact: number;
    };

    businessUnitId: string;

    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMonitorCapacityRequest {
    classId: string;
    scheduleDate: Date;
}

export interface IExecuteRebalanceRequest {
    recommendationId: string;
    action: RebalanceAction;
    sourceClassId: string;
    targetClassId?: string;
    notifyParents: boolean;
}

export interface ICapacitySummary {
    totalClasses: number;
    underbookedClasses: number;
    optimalClasses: number;
    fullClasses: number;
    overbookedClasses: number;
    averageUtilization: number;
    rebalanceOpportunities: number;
    potentialRevenueGain: number;
}
