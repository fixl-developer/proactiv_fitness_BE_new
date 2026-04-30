import { Router, Request, Response } from 'express'
import { authenticate, authorize } from '../iam/auth.middleware'
import { NotificationModel } from './notifications.model'

const router = Router()

const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'REGIONAL_ADMIN']

/**
 * @route   GET /api/v1/admin/notifications
 * @desc    Paginated list. Mongoose-backed (NotificationModel) so data persists.
 * @access  Private/Admin
 */
router.get('/', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const page = parseInt((req.query.page as string) || '1')
        const limit = parseInt((req.query.limit as string) || '10')
        const filter: any = {}
        if (req.query.type) filter.type = req.query.type
        if (req.query.status) filter.status = req.query.status
        if (req.query.category) filter.category = req.query.category
        if (req.query.search) {
            const term = String(req.query.search)
            filter.$or = [
                { title: { $regex: term, $options: 'i' } },
                { message: { $regex: term, $options: 'i' } },
            ]
        }
        const [items, total] = await Promise.all([
            NotificationModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            NotificationModel.countDocuments(filter),
        ])
        res.json({
            success: true,
            data: items,
            pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
        })
    } catch (error: any) {
        console.error('Error fetching notifications:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   GET /api/v1/admin/notifications/:id
 */
router.get('/:id', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const item = await NotificationModel.findById(req.params.id).lean()
        if (!item) return res.status(404).json({ success: false, error: 'Notification not found' })
        res.json({ success: true, data: item })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   POST /api/v1/admin/notifications
 * Create a new notification record. Required: userId, type, category, title, message.
 */
router.post('/', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const { userId, type, category, title, message, status, scheduledTime, recipient } = req.body
        if (!userId || !type || !category || !title || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, type, category, title, message',
            })
        }
        const item = await NotificationModel.create({
            userId,
            tenantId: req.user?.tenantId || 'default',
            type,
            category,
            title,
            message,
            recipient: recipient || userId, // backend schema requires recipient
            status: status || 'draft',
            metadata: scheduledTime ? { scheduledTime } : undefined,
        })
        res.status(201).json({ success: true, data: item, message: 'Notification created successfully' })
    } catch (error: any) {
        console.error('Error creating notification:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   PUT /api/v1/admin/notifications/:id
 */
router.put('/:id', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const allowed = ['userId', 'type', 'category', 'title', 'message', 'status', 'recipient']
        const update: any = {}
        for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k]
        if (req.body.scheduledTime !== undefined) update.metadata = { scheduledTime: req.body.scheduledTime }

        const item = await NotificationModel.findByIdAndUpdate(req.params.id, update, { new: true })
        if (!item) return res.status(404).json({ success: false, error: 'Notification not found' })
        res.json({ success: true, data: item, message: 'Notification updated successfully' })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   DELETE /api/v1/admin/notifications/:id
 */
router.delete('/:id', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const result = await NotificationModel.findByIdAndDelete(req.params.id)
        if (!result) return res.status(404).json({ success: false, error: 'Notification not found' })
        res.json({ success: true, message: 'Notification deleted successfully' })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   POST /api/v1/admin/notifications/:id/send
 * Mark notification as sent (in production this would also dispatch via email/SMS provider).
 */
router.post('/:id/send', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const item = await NotificationModel.findByIdAndUpdate(
            req.params.id,
            { status: 'sent', sentAt: new Date() } as any,
            { new: true }
        )
        if (!item) return res.status(404).json({ success: false, error: 'Notification not found' })
        res.json({ success: true, data: item, message: 'Notification sent successfully' })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   POST /api/v1/admin/notifications/bulk/send
 */
router.post('/bulk/send', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const ids: string[] = Array.isArray(req.body?.notificationIds) ? req.body.notificationIds : []
        if (!ids.length) return res.status(400).json({ success: false, error: 'notificationIds array is required' })

        await NotificationModel.updateMany({ _id: { $in: ids } }, { status: 'sent', sentAt: new Date() } as any)
        const sent = await NotificationModel.find({ _id: { $in: ids } }).lean()
        res.json({ success: true, data: sent, message: `${sent.length} notification(s) sent successfully` })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

export default router
