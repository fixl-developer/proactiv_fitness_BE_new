import mongoose, { Schema } from 'mongoose';
import { IFamilySchedule } from './scheduler.interface';

const FamilyScheduleSchema = new Schema<IFamilySchedule>(
    {
        scheduleId: { type: String, required: true, unique: true },
        familyId: { type: String, required: true, index: true },
        children: [{
            childId: String,
            childName: String,
            age: Number,
            enrolledClasses: [{
                classId: String,
                className: String,
                scheduleDay: String,
                scheduleTime: String,
                locationId: String
            }]
        }],
        optimizationScore: { type: Number, default: 0 },
        travelTimeMinutes: { type: Number, default: 0 },
        carpoolOpportunities: { type: Number, default: 0 },
        suggestions: [{
            suggestionId: String,
            type: { type: String, enum: ['schedule_alignment', 'carpool_match', 'sibling_bundle', 'travel_optimization'] },
            description: String,
            estimatedSavings: {
                timeMinutes: Number,
                costAmount: Number
            },
            priority: { type: String, enum: ['low', 'medium', 'high'] }
        }],
        businessUnitId: { type: String, required: true },
        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'family_schedules' }
);

export const FamilySchedule = mongoose.model<IFamilySchedule>('FamilySchedule', FamilyScheduleSchema);
