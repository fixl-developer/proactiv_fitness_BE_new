import { Schema, model, Document } from 'mongoose';
import { IUserClass } from './user-classes.interface';

const UserClassSchema = new Schema<IUserClass & Document>(
    {
        userId: { type: String, required: true, index: true },
        classId: { type: String, required: true },
        className: { type: String, required: true },
        programId: { type: String, required: true },
        programName: { type: String, required: true },
        coachId: { type: String, required: true },
        coachName: { type: String, required: true },
        schedule: {
            dayOfWeek: String,
            startTime: String,
            endTime: String,
            location: String
        },
        enrollmentDate: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ['active', 'completed', 'cancelled', 'on-hold'],
            default: 'active'
        },
        attendance: {
            total: { type: Number, default: 0 },
            attended: { type: Number, default: 0 },
            missed: { type: Number, default: 0 },
            percentage: { type: Number, default: 0 }
        },
        performance: {
            rating: { type: Number, default: 0 },
            feedback: [String],
            lastFeedbackDate: Date
        },
        materials: [{
            id: String,
            name: String,
            type: String,
            url: String,
            uploadedAt: Date
        }],
        nextClass: Date,
        lastClass: Date
    },
    { timestamps: true, collection: 'user_classes' }
);

UserClassSchema.index({ userId: 1, classId: 1 });
UserClassSchema.index({ userId: 1, status: 1 });

export const UserClassModel = model<IUserClass & Document>('UserClass', UserClassSchema);
