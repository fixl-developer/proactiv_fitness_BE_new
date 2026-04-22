import { Router, Request, Response } from 'express'
import { authenticate, authorize } from '../iam/auth.middleware'

const router = Router()

// In-memory storage for admin notifications (in production, use database)
const adminNotificationsStore: any[] = []

/**
 * @route   GET /api/v1/admin/notifications
 * @desc    Get all notifications (admin)
 * @access  Private/Admin
 */
router.get('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, search = '', type = '', status = '' } = req.query

        let filtered = [...adminNotificationsStore]

        // Apply filters
        if (search) {
            filtered = filtered.filter(
                (n) =>
                    n.title.toLowerCase().includes(search.toString().toLowerCase()) ||
                    n.message.toLowerCase().includes(search.toString().toLowerCase())
            )
        }

        if (type) {
            filtered = filtered.filter((n) => n.type === type)
        }

        if (status) {
            filtered = filtered.filter((n) => n.status === status)
        }

        // Pagination
        const pageNum = parseInt(page.toString()) || 1
        const limitNum = parseInt(limit.toString()) || 10
        const startIndex = (pageNum - 1) * limitNum
        const endIndex = startIndex + limitNum

        const paginatedData = filtered.slice(startIndex, endIndex)
        const totalPages = Math.ceil(filtered.length / limitNum)

        res.json({
            success: true,
            data: paginatedData,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: filtered.length,
                totalPages,
            },
        })
    } catch (error: any) {
        console.error('Error fetching notifications:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   GET /api/v1/admin/notifications/:id
 * @desc    Get notification by ID
 * @access  Private/Admin
 */
router.get('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const notification = adminNotificationsStore.find((n) => n.id === id)

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' })
        }

        res.json({ success: true, data: notification })
    } catch (error: any) {
        console.error('Error fetching notification:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   POST /api/v1/admin/notifications
 * @desc    Create new notification
 * @access  Private/Admin
 */
router.post('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
        const { userId, type, category, title, message, status, scheduledTime } = req.body

        // Validation
        if (!userId || !type || !category || !title || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, type, category, title, message',
            })
        }

        const newNotification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            type,
            category,
            title,
            message,
            status: status || 'draft',
            scheduledTime: scheduledTime || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: req.user?.id,
        }

        adminNotificationsStore.push(newNotification)

        res.status(201).json({
            success: true,
            data: newNotification,
            message: 'Notification created successfully',
        })
    } catch (error: any) {
        console.error('Error creating notification:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   PUT /api/v1/admin/notifications/:id
 * @desc    Update notification
 * @access  Private/Admin
 */
router.put('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { userId, type, category, title, message, status, scheduledTime } = req.body

        const notification = adminNotificationsStore.find((n) => n.id === id)

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' })
        }

        // Update fields
        if (userId) notification.userId = userId
        if (type) notification.type = type
        if (category) notification.category = category
        if (title) notification.title = title
        if (message) notification.message = message
        if (status) notification.status = status
        if (scheduledTime !== undefined) notification.scheduledTime = scheduledTime

        notification.updatedAt = new Date()
        notification.updatedBy = req.user?.id

        res.json({
            success: true,
            data: notification,
            message: 'Notification updated successfully',
        })
    } catch (error: any) {
        console.error('Error updating notification:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   DELETE /api/v1/admin/notifications/:id
 * @desc    Delete notification
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const index = adminNotificationsStore.findIndex((n) => n.id === id)

        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Notification not found' })
        }

        adminNotificationsStore.splice(index, 1)

        res.json({
            success: true,
            message: 'Notification deleted successfully',
        })
    } catch (error: any) {
        console.error('Error deleting notification:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   POST /api/v1/admin/notifications/:id/send
 * @desc    Send notification
 * @access  Private/Admin
 */
router.post('/:id/send', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const notification = adminNotificationsStore.find((n) => n.id === id)

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' })
        }

        // Update status to sent
        notification.status = 'sent'
        notification.sentAt = new Date()
        notification.updatedAt = new Date()

        res.json({
            success: true,
            data: notification,
            message: 'Notification sent successfully',
        })
    } catch (error: any) {
        console.error('Error sending notification:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   POST /api/v1/admin/notifications/bulk/send
 * @desc    Send bulk notifications
 * @access  Private/Admin
 */
router.post('/bulk/send', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
        const { notificationIds } = req.body

        if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
            return res.status(400).json({ success: false, error: 'notificationIds array is required' })
        }

        const sentNotifications = []

        for (const id of notificationIds) {
            const notification = adminNotificationsStore.find((n) => n.id === id)
            if (notification) {
                notification.status = 'sent'
                notification.sentAt = new Date()
                notification.updatedAt = new Date()
                sentNotifications.push(notification)
            }
        }

        res.json({
            success: true,
            data: sentNotifications,
            message: `${sentNotifications.length} notification(s) sent successfully`,
        })
    } catch (error: any) {
        console.error('Error sending bulk notifications:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

export default router
