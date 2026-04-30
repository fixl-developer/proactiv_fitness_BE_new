import { Request, Response } from 'express';
import { NotificationTemplate } from './notification-template.model';

function extractVariables(text: string): string[] {
    const matches = text.match(/\{(\w+)\}/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.replace(/[{}]/g, '')))];
}

class NotificationTemplateController {
    /**
     * GET / - List templates with filters and pagination
     */
    async getAll(req: Request, res: Response) {
        try {
            const {
                type,
                category,
                status,
                search,
                page = '1',
                limit = '50',
            } = req.query;

            const filter: Record<string, any> = {};

            if (type && type !== 'All') filter.type = type;
            if (category && category !== 'All') filter.category = category;
            if (status && status !== 'All') filter.status = status;
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { subject: { $regex: search, $options: 'i' } },
                    { body: { $regex: search, $options: 'i' } },
                ];
            }

            // Scope by tenant if user is not a global admin
            if (req.user?.tenantId) {
                filter.$or = filter.$or || [];
                // Show templates belonging to the tenant or global templates (no tenantId)
                const tenantFilter = {
                    $or: [
                        { tenantId: req.user.tenantId },
                        { tenantId: { $exists: false } },
                        { tenantId: null },
                    ],
                };
                // Merge tenant filter with existing filter
                if (filter.$or.length > 0) {
                    const searchOr = filter.$or;
                    delete filter.$or;
                    filter.$and = [{ $or: searchOr }, tenantFilter];
                } else {
                    delete filter.$or;
                    Object.assign(filter, tenantFilter);
                }
            }

            const pageNum = Math.max(1, parseInt(page as string));
            const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
            const skip = (pageNum - 1) * limitNum;

            const [templates, total] = await Promise.all([
                NotificationTemplate.find(filter)
                    .sort({ updatedAt: -1 })
                    .skip(skip)
                    .limit(limitNum)
                    .lean(),
                NotificationTemplate.countDocuments(filter),
            ]);

            res.status(200).json({
                success: true,
                data: {
                    templates,
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                },
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * GET /:id - Get a single template by ID
     */
    async getById(req: Request, res: Response) {
        try {
            const template = await NotificationTemplate.findById(req.params.id).lean();
            if (!template) {
                return res.status(404).json({ success: false, message: 'Template not found' });
            }
            res.status(200).json({ success: true, data: template });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * POST / - Create a new template
     */
    async create(req: Request, res: Response) {
        try {
            const { name, type, category, subject, body, status } = req.body;

            if (!name || !type || !body) {
                return res.status(400).json({
                    success: false,
                    message: 'name, type, and body are required',
                });
            }

            const variables = extractVariables(body);

            const template = await NotificationTemplate.create({
                name,
                type,
                category: category || 'General',
                subject: subject || '',
                body,
                variables,
                status: status || 'draft',
                usageCount: 0,
                createdBy: req.user?.id,
                tenantId: req.user?.tenantId,
            });

            res.status(201).json({ success: true, data: template });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * PUT /:id - Update an existing template
     */
    async update(req: Request, res: Response) {
        try {
            const { name, type, category, subject, body, status } = req.body;

            const updateData: Record<string, any> = {};
            if (name !== undefined) updateData.name = name;
            if (type !== undefined) updateData.type = type;
            if (category !== undefined) updateData.category = category;
            if (subject !== undefined) updateData.subject = subject;
            if (body !== undefined) {
                updateData.body = body;
                updateData.variables = extractVariables(body);
            }
            if (status !== undefined) updateData.status = status;

            const template = await NotificationTemplate.findByIdAndUpdate(
                req.params.id,
                { $set: updateData },
                { new: true, runValidators: true }
            ).lean();

            if (!template) {
                return res.status(404).json({ success: false, message: 'Template not found' });
            }

            res.status(200).json({ success: true, data: template });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * DELETE /:id - Delete a template
     */
    async delete(req: Request, res: Response) {
        try {
            const template = await NotificationTemplate.findByIdAndDelete(req.params.id);
            if (!template) {
                return res.status(404).json({ success: false, message: 'Template not found' });
            }
            res.status(200).json({ success: true, data: { message: 'Template deleted successfully' } });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * POST /:id/duplicate - Duplicate a template with "(Copy)" suffix
     */
    async duplicate(req: Request, res: Response) {
        try {
            const original = await NotificationTemplate.findById(req.params.id).lean();
            if (!original) {
                return res.status(404).json({ success: false, message: 'Template not found' });
            }

            const duplicate = await NotificationTemplate.create({
                name: `${original.name} (Copy)`,
                type: original.type,
                category: original.category,
                subject: original.subject,
                body: original.body,
                variables: original.variables,
                status: 'draft',
                usageCount: 0,
                createdBy: req.user?.id,
                tenantId: req.user?.tenantId || original.tenantId,
            });

            res.status(201).json({ success: true, data: duplicate });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * GET /stats - Return counts by type and status
     */
    async getStats(req: Request, res: Response) {
        try {
            const [
                total,
                emailCount,
                smsCount,
                pushCount,
                inAppCount,
                publishedCount,
                draftCount,
            ] = await Promise.all([
                NotificationTemplate.countDocuments({}),
                NotificationTemplate.countDocuments({ type: 'EMAIL' }),
                NotificationTemplate.countDocuments({ type: 'SMS' }),
                NotificationTemplate.countDocuments({ type: 'PUSH' }),
                NotificationTemplate.countDocuments({ type: 'IN_APP' }),
                NotificationTemplate.countDocuments({ status: 'published' }),
                NotificationTemplate.countDocuments({ status: 'draft' }),
            ]);

            res.status(200).json({
                success: true,
                data: {
                    total,
                    byType: {
                        EMAIL: emailCount,
                        SMS: smsCount,
                        PUSH: pushCount,
                        IN_APP: inAppCount,
                    },
                    byStatus: {
                        published: publishedCount,
                        draft: draftCount,
                    },
                },
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export const notificationTemplateController = new NotificationTemplateController();
