import { Schema, model, Document } from 'mongoose';
import { IUserAchievement } from './user-achievements.interface';

const UserAchievementSchema = new Schema<IUserAchievement & Document>(
    {
        userId: { type: String, required: true, index: true },
        achievementId: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        category: {
            type: String,
            enum: ['attendance', 'performance', 'milestone', 'special'],
            required: true
        },
        icon: { type: String },
        points: { type: Number, default: 0 },
        earnedAt: { type: Date },
        progress: { type: Number, default: 0 },
        isCompleted: { type: Boolean, default: false },
        reward: {
            type: { type: String, enum: ['points', 'badge', 'discount', 'free-class'] },
            value: Schema.Types.Mixed,
            claimed: { type: Boolean, default: false },
            claimedAt: Date
        },
        requirements: [{
            type: String,
            target: Number,
            current: Number
        }]
    },
    { timestamps: true, collection: 'user_achievements' }
);

UserAchievementSchema.index({ userId: 1, achievementId: 1 });
UserAchievementSchema.index({ userId: 1, isCompleted: 1 });

export const UserAchievementModel = model<IUserAchievement & Document>('UserAchievement', UserAchievementSchema);
