import { FeedbackModel, IFeedback } from './feedback.model'

export class FeedbackService {
    async getFeedback(userId: string): Promise<IFeedback[]> {
        try {
            const feedback = await FeedbackModel.find({ userId }).sort({ createdAt: -1 })
            return feedback
        } catch (error) {
            console.error('Error fetching feedback:', error)
            throw error
        }
    }

    async submitFeedback(userId: string, data: any): Promise<IFeedback> {
        try {
            const feedback = await FeedbackModel.create({
                userId,
                ...data
            })
            return feedback
        } catch (error) {
            console.error('Error submitting feedback:', error)
            throw error
        }
    }

    async getFeedbackById(id: string): Promise<IFeedback | null> {
        try {
            const feedback = await FeedbackModel.findById(id)
            return feedback
        } catch (error) {
            console.error('Error fetching feedback:', error)
            throw error
        }
    }

    async updateFeedback(id: string, data: Partial<IFeedback>): Promise<IFeedback | null> {
        try {
            const feedback = await FeedbackModel.findByIdAndUpdate(id, data, { new: true })
            return feedback
        } catch (error) {
            console.error('Error updating feedback:', error)
            throw error
        }
    }

    async deleteFeedback(id: string): Promise<void> {
        try {
            await FeedbackModel.findByIdAndDelete(id)
        } catch (error) {
            console.error('Error deleting feedback:', error)
            throw error
        }
    }

    async getFeedbackStats(userId: string): Promise<any> {
        try {
            const total = await FeedbackModel.countDocuments({ userId })
            const byType = await FeedbackModel.aggregate([
                { $match: { userId } },
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ])
            const avgRating = await FeedbackModel.aggregate([
                { $match: { userId } },
                { $group: { _id: null, avg: { $avg: '$rating' } } }
            ])

            return {
                total,
                byType: Object.fromEntries(byType.map(b => [b._id, b.count])),
                averageRating: avgRating[0]?.avg || 0
            }
        } catch (error) {
            console.error('Error fetching feedback stats:', error)
            throw error
        }
    }
}

export default new FeedbackService()
