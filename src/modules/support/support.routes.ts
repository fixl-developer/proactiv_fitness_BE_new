import { Router, Request, Response } from 'express';
import { authenticate } from '../iam/auth.middleware';
import { SupportTicket, KnowledgeBaseArticle, TicketComment, TicketHistory } from './support.model';
import { ticketCommentService } from './ticket-comment.service';
import { ticketHistoryService } from './ticket-history.service';
import { ticketAssignmentService } from './ticket-assignment.service';
import { emailNotificationService } from './email-notification.service';

const router = Router();

// =============================================
// Static FAQ list (kept for legacy /support/faq endpoint)
// =============================================
const faqs = [
    { id: '1', question: 'How do I book a class?', answer: 'You can book a class by going to My Classes section and selecting the class you want to attend. Click the Book button and confirm your booking.', category: 'Booking' },
    { id: '2', question: 'Can I cancel my booking?', answer: 'Yes, you can cancel your booking up to 24 hours before the class starts. Go to My Classes and click Cancel.', category: 'Booking' },
    { id: '3', question: 'How do I track my progress?', answer: 'Visit the Progress section in your dashboard to see your fitness metrics, achievements, and performance trends.', category: 'Progress' },
    { id: '4', question: 'What payment methods do you accept?', answer: 'We accept credit cards, debit cards, bank transfers, and digital wallets. You can manage your payment methods in Settings.', category: 'Payment' },
    { id: '5', question: 'How do I get a refund?', answer: 'Refunds are processed within 5-7 business days. Contact our support team with your booking details for assistance.', category: 'Payment' },
];

// Helpers
const isAdmin = (req: Request) => {
    const role = String(req.user?.role || '').toUpperCase();
    return ['ADMIN', 'REGIONAL_ADMIN', 'FRANCHISE_OWNER', 'LOCATION_MANAGER', 'SUPPORT_STAFF'].includes(role);
};

const isStaff = (req: Request) => {
    const role = String(req.user?.role || '').toUpperCase();
    return ['ADMIN', 'REGIONAL_ADMIN', 'SUPPORT_STAFF', 'LOCATION_MANAGER'].includes(role);
};

function buildPagination(page: number, limit: number, total: number) {
    return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

// =============================================
// SUPPORT TICKETS — Mongoose-backed CRUD
// =============================================

/**
 * GET /support/tickets
 * Admins see all tickets. Other authenticated users see only their own.
 * Query params: page, limit, search, status, priority, category
 */
router.get('/tickets', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '20');
        const filter: any = {};

        if (!isAdmin(req)) {
            filter['customer.userId'] = userId;
        }
        if (req.query.status) filter.status = req.query.status;
        if (req.query.priority) filter.priority = req.query.priority;
        if (req.query.category) filter.category = req.query.category;
        if (req.query.search) {
            const term = String(req.query.search);
            filter.$or = [
                { subject: { $regex: term, $options: 'i' } },
                { description: { $regex: term, $options: 'i' } },
                { ticketId: { $regex: term, $options: 'i' } },
                { 'customer.name': { $regex: term, $options: 'i' } },
                { 'customer.email': { $regex: term, $options: 'i' } },
            ];
        }

        const [items, total] = await Promise.all([
            SupportTicket.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            SupportTicket.countDocuments(filter),
        ]);

        res.json({ success: true, data: items, pagination: buildPagination(page, limit, total) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /support/tickets/:id
 */
router.get('/tickets/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

        const ticket = await SupportTicket.findById(req.params.id).lean();
        if (!ticket) { res.status(404).json({ success: false, message: 'Ticket not found' }); return; }
        if (!isAdmin(req) && ticket.customer?.userId !== userId) {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }
        res.json({ success: true, data: ticket });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /support/tickets
 * Body: { subject, description, priority?, category?, customer? }
 * Customer info defaults to the authenticated user.
 */
router.post('/tickets', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

        const body = req.body || {};
        if (!body.subject || !body.description) {
            res.status(400).json({ success: false, message: 'Subject and description are required' });
            return;
        }

        const customer = body.customer || {
            name: req.user?.email?.split('@')[0] || 'User',
            email: req.user?.email || '',
            userId,
        };

        const ticket = await SupportTicket.create({
            ticketId: `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            subject: body.subject,
            description: body.description,
            customer,
            priority: body.priority || 'medium',
            status: body.status || 'open',
            category: body.category || 'general',
            tags: Array.isArray(body.tags) ? body.tags : [],
            escalated: false,
            attachments: [],
            comments: [],
            createdBy: userId,
            updatedBy: userId,
        });

        res.status(201).json({ success: true, data: ticket, message: 'Ticket created successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * PUT /support/tickets/:id
 * Update fields: status, priority, category, assignedTo, resolution, etc.
 */
router.put('/tickets/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

        const existing = await SupportTicket.findById(req.params.id);
        if (!existing) { res.status(404).json({ success: false, message: 'Ticket not found' }); return; }
        if (!isAdmin(req) && existing.customer?.userId !== userId) {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }

        const allowed = ['subject', 'description', 'priority', 'status', 'category', 'tags', 'assignedTo', 'resolution', 'escalated', 'escalatedTo', 'escalationReason'];
        const update: any = { updatedBy: userId };
        for (const key of allowed) {
            if (req.body[key] !== undefined) update[key] = req.body[key];
        }
        if (update.status === 'resolved' && !existing.resolvedAt) update.resolvedAt = new Date();
        if (update.status === 'closed' && !existing.closedAt) update.closedAt = new Date();
        if (update.escalated === true && !existing.escalatedAt) update.escalatedAt = new Date();

        const updated = await SupportTicket.findByIdAndUpdate(req.params.id, update, { new: true });
        res.json({ success: true, data: updated, message: 'Ticket updated successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * DELETE /support/tickets/:id (admin only)
 */
router.delete('/tickets/:id', authenticate, async (req: Request, res: Response) => {
    try {
        if (!isAdmin(req)) {
            res.status(403).json({ success: false, message: 'Admin role required to delete tickets' });
            return;
        }
        const result = await SupportTicket.findByIdAndDelete(req.params.id);
        if (!result) { res.status(404).json({ success: false, message: 'Ticket not found' }); return; }
        res.json({ success: true, message: 'Ticket deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// TICKET COMMENTS
// =============================================

/**
 * POST /support/tickets/:id/comments
 * Add a comment to a ticket
 */
router.post('/tickets/:id/comments', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const userName = req.user?.email?.split('@')[0] || 'User';
        const userEmail = req.user?.email || '';
        if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

        const { message, isInternal } = req.body;
        if (!message) {
            res.status(400).json({ success: false, message: 'Message is required' });
            return;
        }

        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) { res.status(404).json({ success: false, message: 'Ticket not found' }); return; }

        // Check access: customer can only comment on their own tickets, staff can comment on any
        if (!isStaff(req) && ticket.customer?.userId !== userId) {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }

        const userType = isStaff(req) ? 'staff' : 'customer';
        const comment = await ticketCommentService.addComment(
            req.params.id,
            userId,
            userName,
            userEmail,
            userType,
            message,
            isInternal || false,
            req.body.attachments || []
        );

        // Record history
        await ticketHistoryService.recordChange(
            req.params.id,
            'comment',
            'comments',
            null,
            comment.commentId,
            userId,
            userEmail,
            `${userType === 'staff' ? 'Staff' : 'Customer'} added a comment`
        );

        res.status(201).json({ success: true, data: comment, message: 'Comment added successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /support/tickets/:id/comments
 * Get all comments for a ticket
 */
router.get('/tickets/:id/comments', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) { res.status(404).json({ success: false, message: 'Ticket not found' }); return; }

        // Check access
        if (!isStaff(req) && ticket.customer?.userId !== userId) {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }

        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '20');

        const { comments, total } = await ticketCommentService.getTicketComments(req.params.id, limit, page);

        res.json({ success: true, data: comments, pagination: buildPagination(page, limit, total) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * DELETE /support/tickets/:id/comments/:commentId
 * Delete a comment (admin or comment author only)
 */
router.delete('/tickets/:id/comments/:commentId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

        const comment = await TicketComment.findById(req.params.commentId);
        if (!comment) { res.status(404).json({ success: false, message: 'Comment not found' }); return; }

        // Check access: admin or comment author
        if (!isAdmin(req) && comment.userId !== userId) {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }

        await ticketCommentService.deleteComment(req.params.commentId, req.params.id);
        res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// TICKET HISTORY
// =============================================

/**
 * GET /support/tickets/:id/history
 * Get ticket change history
 */
router.get('/tickets/:id/history', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) { res.status(404).json({ success: false, message: 'Ticket not found' }); return; }

        // Check access
        if (!isStaff(req) && ticket.customer?.userId !== userId) {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }

        const limit = parseInt((req.query.limit as string) || '50');
        const history = await ticketHistoryService.getTicketHistory(req.params.id, limit);

        res.json({ success: true, data: history });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// TICKET ASSIGNMENT
// =============================================

/**
 * POST /support/tickets/:id/assign
 * Assign ticket to staff member (admin only)
 */
router.post('/tickets/:id/assign', authenticate, async (req: Request, res: Response) => {
    try {
        if (!isAdmin(req)) {
            res.status(403).json({ success: false, message: 'Admin role required' });
            return;
        }

        const { staffId, staffName, staffEmail } = req.body;
        if (!staffId || !staffName || !staffEmail) {
            res.status(400).json({ success: false, message: 'staffId, staffName, and staffEmail are required' });
            return;
        }

        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) { res.status(404).json({ success: false, message: 'Ticket not found' }); return; }

        const updated = await ticketAssignmentService.assignTicket(
            req.params.id,
            staffId,
            staffName,
            staffEmail,
            req.user!.id,
            req.user!.email || ''
        );

        res.json({ success: true, data: updated, message: 'Ticket assigned successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /support/tickets/:id/reassign
 * Reassign ticket to different staff member (admin only)
 */
router.post('/tickets/:id/reassign', authenticate, async (req: Request, res: Response) => {
    try {
        if (!isAdmin(req)) {
            res.status(403).json({ success: false, message: 'Admin role required' });
            return;
        }

        const { staffId, staffName, staffEmail, reason } = req.body;
        if (!staffId || !staffName || !staffEmail) {
            res.status(400).json({ success: false, message: 'staffId, staffName, and staffEmail are required' });
            return;
        }

        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) { res.status(404).json({ success: false, message: 'Ticket not found' }); return; }

        const updated = await ticketAssignmentService.reassignTicket(
            req.params.id,
            staffId,
            staffName,
            staffEmail,
            req.user!.id,
            req.user!.email || '',
            reason
        );

        res.json({ success: true, data: updated, message: 'Ticket reassigned successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /support/tickets/:id/unassign
 * Unassign ticket (admin only)
 */
router.post('/tickets/:id/unassign', authenticate, async (req: Request, res: Response) => {
    try {
        if (!isAdmin(req)) {
            res.status(403).json({ success: false, message: 'Admin role required' });
            return;
        }

        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) { res.status(404).json({ success: false, message: 'Ticket not found' }); return; }

        const updated = await ticketAssignmentService.unassignTicket(
            req.params.id,
            req.user!.id,
            req.user!.email || ''
        );

        res.json({ success: true, data: updated, message: 'Ticket unassigned successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /support/tickets/assigned-to-me
 * Get tickets assigned to current staff member
 */
router.get('/assigned-to-me', authenticate, async (req: Request, res: Response) => {
    try {
        if (!isStaff(req)) {
            res.status(403).json({ success: false, message: 'Staff role required' });
            return;
        }

        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '20');
        const status = (req.query.status as string) || undefined;

        const { tickets, total } = await ticketAssignmentService.getAssignedTickets(
            req.user!.id,
            status,
            limit,
            page
        );

        res.json({ success: true, data: tickets, pagination: buildPagination(page, limit, total) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /support/tickets/unassigned
 * Get unassigned tickets (admin only)
 */
router.get('/unassigned', authenticate, async (req: Request, res: Response) => {
    try {
        if (!isAdmin(req)) {
            res.status(403).json({ success: false, message: 'Admin role required' });
            return;
        }

        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '20');

        const { tickets, total } = await ticketAssignmentService.getUnassignedTickets(limit, page);

        res.json({ success: true, data: tickets, pagination: buildPagination(page, limit, total) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /support/staff/:staffId/workload
 * Get staff member's workload (admin only)
 */
router.get('/staff/:staffId/workload', authenticate, async (req: Request, res: Response) => {
    try {
        if (!isAdmin(req)) {
            res.status(403).json({ success: false, message: 'Admin role required' });
            return;
        }

        const workload = await ticketAssignmentService.getStaffWorkload(req.params.staffId);
        res.json({ success: true, data: workload });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /support/statistics — admin overview
 */
router.get('/statistics', authenticate, async (_req: Request, res: Response) => {
    try {
        const [total, open, inProgress, resolved, closed, critical, high] = await Promise.all([
            SupportTicket.countDocuments({}),
            SupportTicket.countDocuments({ status: 'open' }),
            SupportTicket.countDocuments({ status: 'in-progress' }),
            SupportTicket.countDocuments({ status: 'resolved' }),
            SupportTicket.countDocuments({ status: 'closed' }),
            SupportTicket.countDocuments({ priority: 'critical' }),
            SupportTicket.countDocuments({ priority: 'high' }),
        ]);
        res.json({
            success: true,
            data: { total, open, inProgress, resolved, closed, critical, high },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// KNOWLEDGE BASE ARTICLES — Mongoose-backed CRUD
// =============================================

/**
 * GET /support/knowledge
 * Public-readable list (only published articles for non-admins).
 * Query: page, limit, search, category, status, tag, featured
 */
router.get('/knowledge', async (req: Request, res: Response) => {
    try {
        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '20');
        const filter: any = {};

        const role = String(req.user?.role || '').toUpperCase();
        const isAdminCaller = ['ADMIN', 'REGIONAL_ADMIN', 'SUPPORT_STAFF'].includes(role);
        // `status=all` is an admin-only escape hatch to see drafts + published + archived
        // (the admin dashboard list uses it). Public callers always get published-only.
        if (req.query.status === 'all') {
            // no status filter
        } else if (req.query.status) {
            filter.status = req.query.status;
        } else if (!isAdminCaller) {
            filter.status = 'published';
        }

        if (req.query.category) filter.category = req.query.category;
        if (req.query.tag) filter.tags = req.query.tag;
        if (req.query.featured === 'true') filter.featured = true;
        if (req.query.search) {
            const term = String(req.query.search);
            filter.$or = [
                { title: { $regex: term, $options: 'i' } },
                { content: { $regex: term, $options: 'i' } },
                { articleId: { $regex: term, $options: 'i' } },
            ];
        }

        const [items, total] = await Promise.all([
            KnowledgeBaseArticle.find(filter).sort({ featured: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            KnowledgeBaseArticle.countDocuments(filter),
        ]);

        res.json({ success: true, data: items, pagination: buildPagination(page, limit, total) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /support/knowledge/:id
 * Increments the `views` counter on each fetch.
 */
router.get('/knowledge/:id', async (req: Request, res: Response) => {
    try {
        const article = await KnowledgeBaseArticle.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        ).lean();
        if (!article) { res.status(404).json({ success: false, message: 'Article not found' }); return; }
        res.json({ success: true, data: article });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /support/knowledge (admin only)
 */
router.post('/knowledge', authenticate, async (req: Request, res: Response) => {
    try {
        if (!isAdmin(req)) {
            res.status(403).json({ success: false, message: 'Admin role required to create articles' });
            return;
        }
        const userId = req.user!.id;
        const body = req.body || {};
        if (!body.title || !body.content || !body.category) {
            res.status(400).json({ success: false, message: 'title, content, and category are required' });
            return;
        }

        const article = await KnowledgeBaseArticle.create({
            articleId: `KB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            title: body.title,
            content: body.content,
            category: body.category,
            tags: Array.isArray(body.tags) ? body.tags : (typeof body.tags === 'string' ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
            status: body.status || 'draft',
            author: body.author || req.user?.email?.split('@')[0] || 'admin',
            featured: !!body.featured,
            views: 0,
            helpful: 0,
            notHelpful: 0,
            version: 1,
            relatedArticles: [],
            attachments: [],
            createdBy: userId,
            updatedBy: userId,
        });

        res.status(201).json({ success: true, data: article, message: 'Article created successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * PUT /support/knowledge/:id (admin only)
 */
router.put('/knowledge/:id', authenticate, async (req: Request, res: Response) => {
    try {
        if (!isAdmin(req)) {
            res.status(403).json({ success: false, message: 'Admin role required to update articles' });
            return;
        }
        const userId = req.user!.id;
        const allowed = ['title', 'content', 'category', 'tags', 'status', 'featured', 'author', 'relatedArticles'];
        const update: any = { updatedBy: userId, $inc: { version: 1 } };
        for (const key of allowed) {
            if (req.body[key] !== undefined) {
                if (key === 'tags' && typeof req.body.tags === 'string') {
                    update.tags = req.body.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
                } else {
                    update[key] = req.body[key];
                }
            }
        }
        if (update.status === 'published') update.lastReviewed = new Date();

        const article = await KnowledgeBaseArticle.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!article) { res.status(404).json({ success: false, message: 'Article not found' }); return; }
        res.json({ success: true, data: article, message: 'Article updated successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * DELETE /support/knowledge/:id (admin only)
 */
router.delete('/knowledge/:id', authenticate, async (req: Request, res: Response) => {
    try {
        if (!isAdmin(req)) {
            res.status(403).json({ success: false, message: 'Admin role required to delete articles' });
            return;
        }
        const result = await KnowledgeBaseArticle.findByIdAndDelete(req.params.id);
        if (!result) { res.status(404).json({ success: false, message: 'Article not found' }); return; }
        res.json({ success: true, message: 'Article deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// KNOWLEDGE BASE VOTING
// =============================================

/**
 * POST /support/knowledge/:id/vote
 * Vote on article helpfulness
 */
router.post('/knowledge/:id/vote', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

        const { voteType } = req.body;
        if (!voteType || !['helpful', 'not-helpful'].includes(voteType)) {
            res.status(400).json({ success: false, message: 'voteType must be "helpful" or "not-helpful"' });
            return;
        }

        const article = await KnowledgeBaseArticle.findById(req.params.id);
        if (!article) { res.status(404).json({ success: false, message: 'Article not found' }); return; }

        // Check if user already voted
        const existingVote = article.votes?.find((v: any) => v.userId === userId);
        if (existingVote) {
            res.status(400).json({ success: false, message: 'You have already voted on this article' });
            return;
        }

        // Add vote
        const update: any = {
            $push: {
                votes: {
                    userId,
                    voteType,
                    votedAt: new Date(),
                },
            },
        };

        if (voteType === 'helpful') {
            update.$inc = { helpful: 1 };
        } else {
            update.$inc = { notHelpful: 1 };
        }

        const updated = await KnowledgeBaseArticle.findByIdAndUpdate(req.params.id, update, { new: true });
        res.json({ success: true, data: updated, message: 'Vote recorded successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /support/knowledge/:id/related
 * Get related articles based on tags and category
 */
router.get('/knowledge/:id/related', async (req: Request, res: Response) => {
    try {
        const article = await KnowledgeBaseArticle.findById(req.params.id).lean();
        if (!article) { res.status(404).json({ success: false, message: 'Article not found' }); return; }

        const limit = parseInt((req.query.limit as string) || '5');

        // Find articles with similar tags or category
        const related = await KnowledgeBaseArticle.find({
            _id: { $ne: req.params.id },
            status: 'published',
            $or: [
                { tags: { $in: article.tags } },
                { category: article.category },
            ],
        })
            .limit(limit)
            .lean();

        res.json({ success: true, data: related });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// LEGACY: /support/faq (static FAQ list)
// =============================================
router.get('/faq', async (req: Request, res: Response) => {
    try {
        const { category } = req.query;
        const filtered = category ? faqs.filter(f => f.category === category) : faqs;
        res.json({ success: true, data: filtered });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /support/contact (public)
 * Send a contact-us message. Saves as a SupportTicket so admins see it.
 */
router.post('/contact', async (req: Request, res: Response) => {
    try {
        const { name, email, subject, message, phone } = req.body || {};
        if (!name || !email || !subject || !message) {
            res.status(400).json({ success: false, message: 'name, email, subject, and message are required' });
            return;
        }
        await SupportTicket.create({
            ticketId: `CONTACT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            subject,
            description: message,
            customer: { name, email, phone },
            priority: 'medium',
            status: 'open',
            category: 'contact-form',
            tags: ['contact-form'],
            escalated: false,
            attachments: [],
            comments: [],
            createdBy: 'public',
            updatedBy: 'public',
        });
        res.json({ success: true, message: 'Your message has been sent successfully. We will get back to you soon.' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
