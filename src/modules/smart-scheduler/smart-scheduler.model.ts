import { Schema, model, Document } from 'mongoose';

export interface ISmartSchedulerDocument extends Document {
    predictionId: string;
    tenantId: string;
    type: string;
    targetEntityId: string;
    prediction: {
        noShowProbability: number;
        confidence: number;
        factors: string[];
    };
    scheduleOptimization: {
        suggestedSlots: Array<{
            dayOfWeek: string;
            timeSlot: string;
            expectedDemand: number;
            score: number;
        }>;
        reasoning: string;
    };
    peakHourAnalysis: {
        peakHours: Array<{
            hour: number;
            utilization: number;
        }>;
        recommendations: string[];
    };
    coachMatch: {
        coachId: string;
        matchScore: number;
        matchReasons: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}

const smartSchedulerSchema = new Schema<ISmartSchedulerDocument>(
    {
        predictionId: { type: String, required: true, unique: true },
        tenantId: { type: String, required: true },
        type: {
            type: String,
            required: true,
            enum: ['ATTENDANCE_PREDICTION', 'SCHEDULE_OPTIMIZATION', 'PEAK_ANALYSIS', 'COACH_MATCH', 'WAITLIST_FILL'],
        },
        targetEntityId: { type: String },
        prediction: {
            noShowProbability: Number,
            confidence: Number,
            factors: [String],
        },
        scheduleOptimization: {
            suggestedSlots: [
                {
                    dayOfWeek: String,
                    timeSlot: String,
                    expectedDemand: Number,
                    score: Number,
                },
            ],
            reasoning: String,
        },
        peakHourAnalysis: {
            peakHours: [
                {
                    hour: Number,
                    utilization: Number,
                },
            ],
            recommendations: [String],
        },
        coachMatch: {
            coachId: String,
            matchScore: Number,
            matchReasons: [String],
        },
    },
    { timestamps: true }
);

export const SmartSchedulerModel = model<ISmartSchedulerDocument>('SmartScheduler', smartSchedulerSchema);
