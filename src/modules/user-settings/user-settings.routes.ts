import { Router } from 'express'
import userSettingsController from './user-settings.controller'
import { authenticate } from '../iam/auth.middleware'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Get user settings
router.get('/', (req, res) => userSettingsController.getSettings(req, res))

// Update user settings
router.put('/', (req, res) => userSettingsController.updateSettings(req, res))

// Update notification preferences
router.put('/notifications', (req, res) => userSettingsController.updateNotificationPreferences(req, res))

// Update privacy settings
router.put('/privacy', (req, res) => userSettingsController.updatePrivacySettings(req, res))

// Change password
router.post('/change-password', (req, res) => userSettingsController.changePassword(req, res))

export default router
