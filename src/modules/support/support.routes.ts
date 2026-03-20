import { Router, Request, Response } from 'express';
import { authenticate } from '../iam/auth.middleware';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { ResponseUtil } from '../../shared/utils/response.util';
import { SupportService, KnowledgeBaseService } from './support.service';

const router = Router();
const supportService = new SupportService();
const kbService = new KnowledgeBaseService();

router.use(authenticate);

// =============================================
// SUPPORT TICKETS
// =============================================

// GET /support/tickets - List tickets
router.get('/tickets', asyncHandler(async (req: Request, res: Response) => {
    const { status, priority, search, page, limit } = req.query;
    const result = await supportService.getTickets(
        { status, priority, search },
        parseInt(page as string) || 1,
        parseInt(limit as string) || 25
    );
    ResponseUtil.success(res, result);
}));

// GET /support/tickets/:id - Get single ticket
router.get('/tickets/:id', asyncHandler(async (req: Request, res: Response) => {
    const ticket = await supportService.findOne({ ticketId: req.params.id } as any);
    if (!ticket) {
        return ResponseUtil.notFound(res, 'Ticket not found');
    }
    ResponseUtil.success(res, ticket);
}));

// POST /support/tickets - Create ticket
router.post('/tickets', asyncHandler(async (req: Request, res: Response) => {
    const { subject, description, priority, requester, category } = req.body;
    const ticket = await supportService.createTicket(
        {
            subject: subject || 'Untitled',
            description: description || '',
            priority: priority?.toLowerCase() || 'medium',
            category: category || 'General',
            customer: {
                name: requester || req.user?.email || 'Unknown',
                email: req.user?.email || 'unknown@email.com',
            },
            tags: [],
            attachments: [],
            comments: [],
            escalated: false,
        },
        req.user?.id || 'system'
    );
    ResponseUtil.created(res, ticket, 'Ticket created successfully');
}));

// PATCH /support/tickets/:id - Update ticket (status, assignee, etc.)
router.patch('/tickets/:id', asyncHandler(async (req: Request, res: Response) => {
    const { status, assignedTo, priority, resolution } = req.body;
    const updates: any = {};

    if (status) {
        // Map frontend status to backend enum
        const statusMap: Record<string, string> = {
            'Open': 'open',
            'In Progress': 'in-progress',
            'Resolved': 'resolved',
            'Closed': 'closed',
            'Pending': 'pending',
        };
        updates.status = statusMap[status] || status.toLowerCase();

        if (updates.status === 'resolved') {
            updates.resolvedAt = new Date();
        }
        if (updates.status === 'closed') {
            updates.closedAt = new Date();
        }
    }
    if (assignedTo) {
        updates.assignedTo = assignedTo;
        updates.assignedAt = new Date();
    }
    if (priority) updates.priority = priority.toLowerCase();
    if (resolution) updates.resolution = resolution;

    const ticket = await supportService.updateTicket(
        req.params.id,
        updates,
        req.user?.id || 'system'
    );
    ResponseUtil.success(res, ticket, 'Ticket updated');
}));

// POST /support/tickets/:id/comments - Add comment
router.post('/tickets/:id/comments', asyncHandler(async (req: Request, res: Response) => {
    const { message, isInternal } = req.body;
    const ticket = await supportService.addTicketComment(
        req.params.id,
        message,
        req.user?.id || 'system',
        'staff',
        isInternal || false
    );
    ResponseUtil.success(res, ticket, 'Comment added');
}));

// GET /support/dashboard - Dashboard stats
router.get('/dashboard', asyncHandler(async (req: Request, res: Response) => {
    const data = await supportService.getDashboardData();
    ResponseUtil.success(res, data);
}));

// =============================================
// KNOWLEDGE BASE
// =============================================

// GET /support/knowledge-base - List articles
router.get('/knowledge-base', asyncHandler(async (req: Request, res: Response) => {
    const { status, category, search, page, limit } = req.query;
    const result = await kbService.getArticles(
        { status, category, search },
        parseInt(page as string) || 1,
        parseInt(limit as string) || 50
    );
    ResponseUtil.success(res, result);
}));

// GET /support/knowledge-base/:id - Get single article
router.get('/knowledge-base/:id', asyncHandler(async (req: Request, res: Response) => {
    const article = await kbService.findOne({ articleId: req.params.id } as any);
    if (!article) {
        return ResponseUtil.notFound(res, 'Article not found');
    }
    // Increment views
    await kbService.incrementViews(req.params.id);
    ResponseUtil.success(res, article);
}));

// POST /support/knowledge-base - Create article
router.post('/knowledge-base', asyncHandler(async (req: Request, res: Response) => {
    const { title, content, category, tags, status, author } = req.body;
    const article = await kbService.createArticle(
        {
            title: title || 'Untitled',
            content: content || '',
            category: category || 'General',
            tags: tags || [],
            status: status?.toLowerCase() || 'draft',
            author: author || req.user?.email || 'Admin',
            featured: false,
            views: 0,
            helpful: 0,
            notHelpful: 0,
            version: 1,
            relatedArticles: [],
            attachments: [],
        },
        req.user?.id || 'system'
    );
    ResponseUtil.created(res, article, 'Article created');
}));

// PUT /support/knowledge-base/:id - Update article
router.put('/knowledge-base/:id', asyncHandler(async (req: Request, res: Response) => {
    const article = await kbService.updateArticle(
        req.params.id,
        req.body,
        req.user?.id || 'system'
    );
    ResponseUtil.success(res, article, 'Article updated');
}));

// DELETE /support/knowledge-base/:id - Delete article
router.delete('/knowledge-base/:id', asyncHandler(async (req: Request, res: Response) => {
    await kbService.deleteArticle(req.params.id);
    ResponseUtil.success(res, null, 'Article deleted');
}));

// POST /support/knowledge-base/:id/rate - Rate article
router.post('/knowledge-base/:id/rate', asyncHandler(async (req: Request, res: Response) => {
    const { helpful } = req.body;
    const article = await kbService.rateArticle(req.params.id, helpful);
    ResponseUtil.success(res, article);
}));

export default router;
