import { Request, Response } from 'express'
import feedbackService from './feedback.service'

export class FeedbackController {
    async getFeedback(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' })
            }

            const feedback = await feedbackService.getFeedback(userId)
            res.json({ success: true, data: feedback })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async submitFeedback(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' })
            }

            const feedback = await feedbackService.submitFeedback(userId, req.body)
            res.status(201).json({ success: true, data: feedback })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async getFeedbackById(req: Request, res: Response) {
        try {
            const { id } = req.params
            const feedback = await feedbackService.getFeedbackById(id)
            if (!feedback) {
                return res.status(404).json({ success: false, error: 'Feedback not found' })
            }
            res.json({ success: true, data: feedback })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async updateFeedback(req: Request, res: Response) {
        try {
            const { id } = req.params
            const feedback = await feedbackService.updateFeedback(id, req.body)
            res.json({ success: true, data: feedback })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async deleteFeedback(req: Request, res: Response) {
        try {
            const { id } = req.params
            await feedbackService.deleteFeedback(id)
            res.json({ success: true, data: { message: 'Feedback deleted' } })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async getFeedbackStats(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' })
            }

            const stats = await feedbackService.getFeedbackStats(userId)
            res.json({ success: true, data: stats })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }
}

export default new FeedbackController()
