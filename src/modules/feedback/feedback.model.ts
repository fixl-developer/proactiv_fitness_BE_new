import mongoose, { Schema, Document } from 'mongoose'

export interface IFeedback extends Document {
    userId: string
    type: 'bug' | 'feature' | 'improvement' | 'other'
    title: string
    description: string
    rating: number
    status: 'new' | 'reviewed' | 'in-progress' | 'completed'
    createdAt: Date
    updatedAt: Date
}

const feedbackSchema = new Schema<IFeedback>(
    {
        userId: { type: String, required: true, index: true },
        type: { type: String, enum: ['bug', 'feature', 'improvement', 'other'], required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        status: { type: String, enum: ['new', 'reviewed', 'in-progress', 'completed'], default: 'new' }
    },
    { timestamps: true }
)

export const FeedbackModel = mongoose.model<IFeedback>('Feedback', feedbackSchema)
