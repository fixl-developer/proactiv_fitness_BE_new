import { Router } from 'express';
import { userProfileController } from './user-profile.controller';
import { authMiddleware } from '../iam/auth.middleware';

const router = Router();

// Profile routes
router.get('/profile', authMiddleware, (req, res) => userProfileController.getProfile(req, res));
router.put('/profile', authMiddleware, (req, res) => userProfileController.updateProfile(req, res));
router.get('/profile/stats', authMiddleware, (req, res) => userProfileController.getProfileStats(req, res));

// Avatar routes
router.post('/profile/avatar', authMiddleware, (req, res) => userProfileController.uploadAvatar(req, res));
router.delete('/profile/avatar', authMiddleware, (req, res) => userProfileController.deleteAvatar(req, res));

export default router;
