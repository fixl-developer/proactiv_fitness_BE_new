import mongoose, { Schema } from 'mongoose';
import { ICapacityMonitor, IRebalanceExecution, ClassStatus, RebalanceAction } from './capacity.interface';

const CapacityMonitorSchema = new Schema<ICapacityMonitor>(
    {
        monitorId: { type: String, required: true, unique: true },
        classId: { type: String, required: true, index: true },
        className: { type: String, required: true },
        scheduleDate: { type: Date, required: true, index: true },
        scheduleTime: { type: String, required: true },

        capacity: {
            total: { type: Number, required: true },
            booked: { type: Number, required: true },
            available: { type: Number, required: true },
            waitlist: { type: Number, default: 0 },
            utilizationRate: { type: Number, required: true }
        },

        status: { type: String, enum: Object.values(ClassStatus), required: true },

        thresholds: {
            minUtilization: { type: Number, default: 50 },
            optimalUtilization: { type: Number, default: 80 },
            maxUtilization: { type: Number, default: 100 }
        },

        rebalanceRecommendations: [{
            recommendationId: String,
            action: { type: String, enum: Object.values(RebalanceAction) },
            priority: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
            reason: String,
            estimatedImpact: {
                utilizationImprovement: Number,
                revenueImpact: Number,
                customerSatisfaction: Number
            },
            suggestedActions: [String],
            affectedStudents: Number
        }],

        lastChecked: { type: Date, default: Date.now },
        nextCheckDue: { type: Date, required: true },

        businessUnitId: { type: String, required: true, index: true },
        locationId: { type: String, required: true, index: true },

        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'capacity_monitors' }
);

const RebalanceExecutionSchema = new Schema<IRebalanceExecution>(
    {
        executionId: { type: String, required: true, unique: true },
        recommendationId: { type: String, required: true },
        action: { type: String, enum: Object.values(RebalanceAction), required: true },

        sourceClass: {
            classId: String,
            className: String,
            scheduleDate: Date,
            studentsAffected: Number
        },

        targetClass: {
            classId: String,
            className: String,
            scheduleDate: Date
        },

        executionStatus: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed', 'rolled_back'], default: 'pending' },
        executionDate: { type: Date, default: Date.now },
        completedDate: Date,

        notifications: [{
            notificationId: String,
            recipientType: { type: String, enum: ['parent', 'staff', 'admin'] },
            recipientId: String,
            sentDate: Date,
            status: { type: String, enum: ['sent', 'delivered', 'read'] }
        }],

        results: {
            studentsNotified: { type: Number, default: 0 },
            studentsAccepted: { type: Number, default: 0 },
            studentsDeclined: { type: Number, default: 0 },
            utilizationBefore: Number,
            utilizationAfter: Number,
            revenueImpact: Number
        },

        businessUnitId: { type: String, required: true, index: true },

        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'rebalance_executions' }
);

CapacityMonitorSchema.index({ classId: 1, scheduleDate: 1 });
CapacityMonitorSchema.index({ status: 1, scheduleDate: 1 });

export const CapacityMonitor = mongoose.model<ICapacityMonitor>('CapacityMonitor', CapacityMonitorSchema);
export const RebalanceExecution = mongoose.model<IRebalanceExecution>('RebalanceExecution', RebalanceExecutionSchema);
