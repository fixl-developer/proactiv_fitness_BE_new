import { Schema, model, Document } from 'mongoose';
import { IUserProgress } from './user-progress.interface';

const UserProgressSchema = new Schema<IUserProgress & Document>(
    {
        userId: { type: String, required: true, unique: true, index: true },
        classesAttended: { type: Number, default: 0 },
        classesCompleted: { type: Number, default: 0 },
        totalHours: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        skillLevels: [{
            skillName: String,
            level: Number,
            progress: Number,
            lastUpdated: Date
        }],
        milestones: [{
            id: String,
            name: String,
            description: String,
            achievedAt: Date,
            category: String
        }],
        performanceMetrics: {
            attendance: { type: Number, default: 0 },
            punctuality: { type: Number, default: 0 },
            participation: { type: Number, default: 0 },
            improvement: { type: Number, default: 0 }
        },
        timeline: [{
            date: Date,
            event: String,
            description: String,
            type: { type: String, enum: ['class', 'achievement', 'milestone', 'skill'] }
        }]
    },
    { timestamps: true, collection: 'user_progress' }
);

UserProgressSchema.index({ userId: 1 });

export const UserProgressModel = model<IUserProgress & Document>('UserProgress', UserProgressSchema);
