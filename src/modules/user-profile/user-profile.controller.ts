import { Request, Response } from 'express';
import { userProfileService } from './user-profile.service';

export class UserProfileController {
    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id || req.params.userId;

            if (!userId) {
                res.status(400).json({ success: false, message: 'User ID required' });
                return;
            }

            const profile = await userProfileService.getProfile(userId);

            if (!profile) {
                res.status(404).json({ success: false, message: 'Profile not found' });
                return;
            }

            res.status(200).json({ success: true, data: profile });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const updateData = req.body;

            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const updatedProfile = await userProfileService.updateProfile(userId, updateData);

            if (!updatedProfile) {
                res.status(404).json({ success: false, message: 'Profile not found' });
                return;
            }

            res.status(200).json({
                success: true,
                data: updatedProfile,
                message: 'Profile updated successfully'
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async uploadAvatar(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const avatarUrl = req.body.avatarUrl || req.file?.path;

            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            if (!avatarUrl) {
                res.status(400).json({ success: false, message: 'Avatar URL required' });
                return;
            }

            const updatedProfile = await userProfileService.updateAvatar(userId, avatarUrl);

            res.status(200).json({
                success: true,
                data: updatedProfile,
                message: 'Avatar uploaded successfully'
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteAvatar(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const updatedProfile = await userProfileService.deleteAvatar(userId);

            res.status(200).json({
                success: true,
                data: updatedProfile,
                message: 'Avatar deleted successfully'
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getProfileStats(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const stats = await userProfileService.getProfileStats(userId);

            res.status(200).json({ success: true, data: stats });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export const userProfileController = new UserProfileController();
