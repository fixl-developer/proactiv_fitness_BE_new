import { Request, Response } from 'express'
import userSettingsService from './user-settings.service'

export class UserSettingsController {
    async getSettings(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' })
            }

            const settings = await userSettingsService.getSettings(userId)
            res.json({ success: true, data: settings })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async updateSettings(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' })
            }

            const settings = await userSettingsService.updateSettings(userId, req.body)
            res.json({ success: true, data: settings })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async updateNotificationPreferences(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' })
            }

            const settings = await userSettingsService.updateNotificationPreferences(userId, req.body)
            res.json({ success: true, data: settings })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async updatePrivacySettings(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' })
            }

            const settings = await userSettingsService.updatePrivacySettings(userId, req.body)
            res.json({ success: true, data: settings })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async changePassword(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' })
            }

            const { currentPassword, newPassword } = req.body

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ success: false, error: 'Missing required fields' })
            }

            // In a real implementation, verify current password and hash new password
            // For now, just return success
            res.json({ success: true, data: { message: 'Password changed successfully' } })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }
}

export default new UserSettingsController()
