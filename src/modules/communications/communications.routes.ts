import { Router, Request, Response } from 'express'
import { authenticate, authorize } from '../iam/auth.middleware'

const router = Router()

// In-memory storage
const templatesStore: any[] = []
const crmFamiliesStore: any[] = []

// =============================================
// TEMPLATES ROUTES
// =============================================

/**
 * @route   GET /api/v1/communications/templates
 * @desc    Get all templates
 * @access  Private/Admin
 */
router.get('/templates', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, search = '', type = '' } = req.query

        let filtered = [...templatesStore]

        if (search) {
            filtered = filtered.filter((t) =>
                t.name.toLowerCase().includes(search.toString().toLowerCase())
            )
        }

        if (type) {
            filtered = filtered.filter((t) => t.type === type)
        }

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
        console.error('Error fetching templates:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   GET /api/v1/communications/templates/:id
 * @desc    Get template by ID
 * @access  Private/Admin
 */
router.get('/templates/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const template = templatesStore.find((t) => t.id === id)

        if (!template) {
            return res.status(404).json({ success: false, error: 'Template not found' })
        }

        res.json({ success: true, data: template })
    } catch (error: any) {
        console.error('Error fetching template:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   POST /api/v1/communications/templates
 * @desc    Create new template
 * @access  Private/Admin
 */
router.post('/templates', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
        const { name, type, subject, content, variables } = req.body

        if (!name || !type || !content) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, type, content',
            })
        }

        const newTemplate = {
            id: `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            type,
            subject: subject || '',
            content,
            variables: variables || [],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: req.user?.id,
        }

        templatesStore.push(newTemplate)

        res.status(201).json({
            success: true,
            data: newTemplate,
            message: 'Template created successfully',
        })
    } catch (error: any) {
        console.error('Error creating template:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   PUT /api/v1/communications/templates/:id
 * @desc    Update template
 * @access  Private/Admin
 */
router.put('/templates/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { name, type, subject, content, variables } = req.body

        const template = templatesStore.find((t) => t.id === id)

        if (!template) {
            return res.status(404).json({ success: false, error: 'Template not found' })
        }

        if (name) template.name = name
        if (type) template.type = type
        if (subject !== undefined) template.subject = subject
        if (content) template.content = content
        if (variables) template.variables = variables

        template.updatedAt = new Date()
        template.updatedBy = req.user?.id

        res.json({
            success: true,
            data: template,
            message: 'Template updated successfully',
        })
    } catch (error: any) {
        console.error('Error updating template:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   DELETE /api/v1/communications/templates/:id
 * @desc    Delete template
 * @access  Private/Admin
 */
router.delete('/templates/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const index = templatesStore.findIndex((t) => t.id === id)

        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Template not found' })
        }

        templatesStore.splice(index, 1)

        res.json({
            success: true,
            message: 'Template deleted successfully',
        })
    } catch (error: any) {
        console.error('Error deleting template:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

// =============================================
// CRM FAMILIES ROUTES
// =============================================

/**
 * @route   GET /api/v1/crm/families
 * @desc    Get all CRM families
 * @access  Private/Admin
 */
router.get('/families', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, search = '', status = '' } = req.query

        let filtered = [...crmFamiliesStore]

        if (search) {
            filtered = filtered.filter(
                (f) =>
                    f.name.toLowerCase().includes(search.toString().toLowerCase()) ||
                    f.email.toLowerCase().includes(search.toString().toLowerCase())
            )
        }

        if (status) {
            filtered = filtered.filter((f) => f.status === status)
        }

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
        console.error('Error fetching CRM families:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   GET /api/v1/crm/families/:id
 * @desc    Get CRM family by ID
 * @access  Private/Admin
 */
router.get('/families/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const family = crmFamiliesStore.find((f) => f.id === id)

        if (!family) {
            return res.status(404).json({ success: false, error: 'Family not found' })
        }

        res.json({ success: true, data: family })
    } catch (error: any) {
        console.error('Error fetching CRM family:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   POST /api/v1/crm/families
 * @desc    Create new CRM family
 * @access  Private/Admin
 */
router.post('/families', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
        const { name, email, phone, address, status, notes } = req.body

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, email',
            })
        }

        const newFamily = {
            id: `crm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            email,
            phone: phone || '',
            address: address || '',
            status: status || 'active',
            notes: notes || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: req.user?.id,
        }

        crmFamiliesStore.push(newFamily)

        res.status(201).json({
            success: true,
            data: newFamily,
            message: 'CRM family created successfully',
        })
    } catch (error: any) {
        console.error('Error creating CRM family:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   PUT /api/v1/crm/families/:id
 * @desc    Update CRM family
 * @access  Private/Admin
 */
router.put('/families/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { name, email, phone, address, status, notes } = req.body

        const family = crmFamiliesStore.find((f) => f.id === id)

        if (!family) {
            return res.status(404).json({ success: false, error: 'Family not found' })
        }

        if (name) family.name = name
        if (email) family.email = email
        if (phone !== undefined) family.phone = phone
        if (address !== undefined) family.address = address
        if (status) family.status = status
        if (notes !== undefined) family.notes = notes

        family.updatedAt = new Date()
        family.updatedBy = req.user?.id

        res.json({
            success: true,
            data: family,
            message: 'CRM family updated successfully',
        })
    } catch (error: any) {
        console.error('Error updating CRM family:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * @route   DELETE /api/v1/crm/families/:id
 * @desc    Delete CRM family
 * @access  Private/Admin
 */
router.delete('/families/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const index = crmFamiliesStore.findIndex((f) => f.id === id)

        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Family not found' })
        }

        crmFamiliesStore.splice(index, 1)

        res.json({
            success: true,
            message: 'CRM family deleted successfully',
        })
    } catch (error: any) {
        console.error('Error deleting CRM family:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

export default router
