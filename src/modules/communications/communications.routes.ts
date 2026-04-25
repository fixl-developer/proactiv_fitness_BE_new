import { Router, Request, Response } from 'express'
import { Schema, model } from 'mongoose'
import { authenticate, authorize } from '../iam/auth.middleware'
import { NotificationTemplate } from '../notifications/notification-template.model'

const router = Router()

const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'REGIONAL_ADMIN']

// =============================================
// CRMFamily — lightweight Mongoose model for the admin Communications CRM page.
// Stores admin-managed CRM family records (separate from the heavier crm.model
// which expects a full FamilyProfile with addresses + emergency contacts).
// =============================================
interface ICRMFamily {
    name: string
    email: string
    phone?: string
    address?: string
    status: 'active' | 'inactive' | 'lead'
    notes?: string
    tags: string[]
    lastContactedAt?: Date
    createdAt: Date
    updatedAt: Date
}

const crmFamilySchema = new Schema<ICRMFamily>({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: String,
    address: String,
    status: { type: String, enum: ['active', 'inactive', 'lead'], default: 'active' },
    notes: String,
    tags: { type: [String], default: [] },
    lastContactedAt: Date,
}, { timestamps: true })

const CRMFamily = model<ICRMFamily>('CRMFamily', crmFamilySchema)

function paginate(page: number, limit: number, total: number) {
    return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
}

// =============================================
// /communications/templates  → Mongoose-backed (NotificationTemplate)
// =============================================

// GET list
router.get('/templates', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
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
                { name: { $regex: term, $options: 'i' } },
                { subject: { $regex: term, $options: 'i' } },
                { body: { $regex: term, $options: 'i' } },
            ]
        }
        const [items, total] = await Promise.all([
            NotificationTemplate.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            NotificationTemplate.countDocuments(filter),
        ])
        res.json({ success: true, data: items, pagination: paginate(page, limit, total) })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

// GET single
router.get('/templates/:id', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const item = await NotificationTemplate.findById(req.params.id).lean()
        if (!item) return res.status(404).json({ success: false, error: 'Template not found' })
        res.json({ success: true, data: item })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

// POST create — accept frontend's `subject/content/variables` shape and map to the
// NotificationTemplate model (which uses `body` + has type/category fields).
router.post('/templates', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const { name, type, subject, content, body, category, variables, status, description } = req.body || {}
        if (!name || !type || (!content && !body)) {
            return res.status(400).json({ success: false, error: 'name, type, and content are required' })
        }
        const item = await NotificationTemplate.create({
            name,
            type,
            subject: subject || '',
            body: body || content,
            category: category || 'General',
            description: description || '',
            variables: Array.isArray(variables) ? variables
                : (typeof variables === 'string' ? variables.split(',').map((v: string) => v.trim()).filter(Boolean) : []),
            status: status || 'draft',
            createdBy: req.user?.id,
        })
        res.status(201).json({ success: true, data: item, message: 'Template created successfully' })
    } catch (error: any) {
        console.error('Template create error:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

// PUT update
router.put('/templates/:id', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const update: any = {}
        for (const k of ['name', 'type', 'subject', 'category', 'description', 'status']) {
            if (req.body[k] !== undefined) update[k] = req.body[k]
        }
        // body/content alias
        if (req.body.body !== undefined) update.body = req.body.body
        else if (req.body.content !== undefined) update.body = req.body.content
        if (req.body.variables !== undefined) {
            update.variables = Array.isArray(req.body.variables)
                ? req.body.variables
                : String(req.body.variables).split(',').map(v => v.trim()).filter(Boolean)
        }

        const item = await NotificationTemplate.findByIdAndUpdate(req.params.id, update, { new: true })
        if (!item) return res.status(404).json({ success: false, error: 'Template not found' })
        res.json({ success: true, data: item, message: 'Template updated successfully' })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

// DELETE
router.delete('/templates/:id', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const result = await NotificationTemplate.findByIdAndDelete(req.params.id)
        if (!result) return res.status(404).json({ success: false, error: 'Template not found' })
        res.json({ success: true, message: 'Template deleted successfully' })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

// =============================================
// /crm/families  → Mongoose-backed (CRMFamily)
// =============================================

// GET list
router.get('/families', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const page = parseInt((req.query.page as string) || '1')
        const limit = parseInt((req.query.limit as string) || '10')
        const filter: any = {}
        if (req.query.status) filter.status = req.query.status
        if (req.query.search) {
            const term = String(req.query.search)
            filter.$or = [
                { name: { $regex: term, $options: 'i' } },
                { email: { $regex: term, $options: 'i' } },
                { phone: { $regex: term, $options: 'i' } },
            ]
        }
        const [items, total] = await Promise.all([
            CRMFamily.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            CRMFamily.countDocuments(filter),
        ])
        res.json({ success: true, data: items, pagination: paginate(page, limit, total) })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

// GET single
router.get('/families/:id', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const item = await CRMFamily.findById(req.params.id).lean()
        if (!item) return res.status(404).json({ success: false, error: 'Family not found' })
        res.json({ success: true, data: item })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

// POST create
router.post('/families', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const { name, email, phone, address, status, notes, tags } = req.body || {}
        if (!name || !email) {
            return res.status(400).json({ success: false, error: 'name and email are required' })
        }
        const item = await CRMFamily.create({
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            phone: phone || '',
            address: address || '',
            status: status || 'active',
            notes: notes || '',
            tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
        })
        res.status(201).json({ success: true, data: item, message: 'Family record created' })
    } catch (error: any) {
        console.error('CRM family create error:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

// PUT update
router.put('/families/:id', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const allowed = ['name', 'email', 'phone', 'address', 'status', 'notes']
        const update: any = {}
        for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k]
        if (req.body.tags !== undefined) {
            update.tags = Array.isArray(req.body.tags)
                ? req.body.tags
                : String(req.body.tags).split(',').map(t => t.trim()).filter(Boolean)
        }
        if (req.body.lastContactedAt !== undefined) update.lastContactedAt = new Date(req.body.lastContactedAt)

        const item = await CRMFamily.findByIdAndUpdate(req.params.id, update, { new: true })
        if (!item) return res.status(404).json({ success: false, error: 'Family not found' })
        res.json({ success: true, data: item, message: 'Family record updated' })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

// DELETE
router.delete('/families/:id', authenticate, authorize(adminRoles), async (req: Request, res: Response) => {
    try {
        const result = await CRMFamily.findByIdAndDelete(req.params.id)
        if (!result) return res.status(404).json({ success: false, error: 'Family not found' })
        res.json({ success: true, message: 'Family record deleted' })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

export default router
