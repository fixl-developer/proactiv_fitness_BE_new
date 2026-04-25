import { Router, Request, Response } from 'express';
import { authenticate } from '../iam/auth.middleware';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory storage for demo (replace with database in production).
// NOTE: this module is a lightweight in-memory store used by the admin
// Support pages and the user-facing /user/support routes. It intentionally
// does NOT persist across restarts.
const tickets: any[] = [];
const knowledgeArticles: any[] = [];
const faqs = [
    {
        id: '1',
        question: 'How do I book a class?',
        answer: 'You can book a class by going to My Classes section and selecting the class you want to attend. Click the Book button and confirm your booking.',
        category: 'Booking'
    },
    {
        id: '2',
        question: 'Can I cancel my booking?',
        answer: 'Yes, you can cancel your booking up to 24 hours before the class starts. Go to My Classes and click Cancel.',
        category: 'Booking'
    },
    {
        id: '3',
        question: 'How do I track my progress?',
        answer: 'Visit the Progress section in your dashboard to see your fitness metrics, achievements, and performance trends.',
        category: 'Progress'
    },
    {
        id: '4',
        question: 'What payment methods do you accept?',
        answer: 'We accept credit cards, debit cards, bank transfers, and digital wallets. You can manage your payment methods in Settings.',
        category: 'Payment'
    },
    {
        id: '5',
        question: 'How do I get a refund?',
        answer: 'Refunds are processed within 5-7 business days. Contact our support team with your booking details for assistance.',
        category: 'Payment'
    }
];

// Helper: detect admin role (case-insensitive). Admins see all tickets/articles;
// regular users only see their own tickets.
const isAdmin = (req: Request): boolean => {
    const role = (req.user?.role as string | undefined) || '';
    return role.toUpperCase() === 'ADMIN';
};

// Pagination helper that mirrors the response shape consumed by the
// admin frontend (`response.data`, `response.pagination.totalPages`).
const paginate = <T>(items: T[], page: number, limit: number) => {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const data = items.slice(start, start + limit);
    return { data, pagination: { page, limit, total, totalPages } };
};

// =============================================================================
// SUPPORT TICKETS
// =============================================================================

/**
 * @route   GET /support/tickets
 * @desc    Get support tickets (admin sees all, users see their own)
 * @access  Private
 */
router.get('/tickets', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const page = parseInt((req.query.page as string) || '1', 10);
        const limit = parseInt((req.query.limit as string) || '10', 10);
        const search = ((req.query.search as string) || '').toLowerCase().trim();

        let scope = isAdmin(req) ? tickets : tickets.filter(t => t.userId === userId);

        if (search) {
            scope = scope.filter(t => {
                const subject = (t.subject || t.title || '').toLowerCase();
                const desc = (t.description || '').toLowerCase();
                return subject.includes(search) || desc.includes(search);
            });
        }

        // Newest first
        const sorted = [...scope].sort((a, b) => {
            const ad = new Date(a.createdAt || 0).getTime();
            const bd = new Date(b.createdAt || 0).getTime();
            return bd - ad;
        });

        const { data, pagination } = paginate(sorted, page, limit);
        res.json({ success: true, data, pagination });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /support/tickets
 * @desc    Create a support ticket
 * @access  Private
 */
router.post('/tickets', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const {
            subject,
            title,
            description,
            priority,
            status,
            assignedTo,
            category,
        } = req.body || {};

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const finalSubject = subject || title;
        if (!finalSubject || !description) {
            res.status(400).json({
                success: false,
                message: 'Title/subject and description are required'
            });
            return;
        }

        const ticket = {
            id: uuidv4(),
            userId,
            title: finalSubject,
            subject: finalSubject,
            description,
            priority: priority || 'medium',
            status: status || 'open',
            assignedTo: assignedTo || undefined,
            category: category || 'General',
            createdAt: new Date(),
            updatedAt: new Date(),
            replies: 0,
        };

        tickets.push(ticket);
        res.status(201).json({
            success: true,
            data: ticket,
            message: 'Ticket created successfully'
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /support/tickets/:ticketId
 * @desc    Get ticket details
 * @access  Private
 */
router.get('/tickets/:ticketId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { ticketId } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const ticket = isAdmin(req)
            ? tickets.find(t => t.id === ticketId)
            : tickets.find(t => t.id === ticketId && t.userId === userId);

        if (!ticket) {
            res.status(404).json({ success: false, message: 'Ticket not found' });
            return;
        }

        res.json({ success: true, data: ticket });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   PUT /support/tickets/:ticketId
 * @desc    Update ticket (status, priority, assignedTo, etc.)
 * @access  Private
 */
router.put('/tickets/:ticketId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { ticketId } = req.params;
        const { status, priority, assignedTo, title, subject, description, category } = req.body || {};

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const ticket = isAdmin(req)
            ? tickets.find(t => t.id === ticketId)
            : tickets.find(t => t.id === ticketId && t.userId === userId);

        if (!ticket) {
            res.status(404).json({ success: false, message: 'Ticket not found' });
            return;
        }

        if (status !== undefined) ticket.status = status;
        if (priority !== undefined) ticket.priority = priority;
        if (assignedTo !== undefined) ticket.assignedTo = assignedTo;
        if (category !== undefined) ticket.category = category;
        if (description !== undefined) ticket.description = description;
        const newSubject = subject || title;
        if (newSubject !== undefined) {
            ticket.subject = newSubject;
            ticket.title = newSubject;
        }
        ticket.updatedAt = new Date();

        res.json({ success: true, data: ticket, message: 'Ticket updated successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   DELETE /support/tickets/:ticketId
 * @desc    Delete a ticket (admin can delete any; users only their own)
 * @access  Private
 */
router.delete('/tickets/:ticketId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { ticketId } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const idx = isAdmin(req)
            ? tickets.findIndex(t => t.id === ticketId)
            : tickets.findIndex(t => t.id === ticketId && t.userId === userId);

        if (idx === -1) {
            res.status(404).json({ success: false, message: 'Ticket not found' });
            return;
        }

        const [removed] = tickets.splice(idx, 1);
        res.json({ success: true, data: removed, message: 'Ticket deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================================================
// KNOWLEDGE BASE ARTICLES
// =============================================================================

/**
 * @route   GET /support/knowledge
 * @desc    List knowledge base articles (paginated, searchable)
 * @access  Private
 */
router.get('/knowledge', authenticate, async (req: Request, res: Response) => {
    try {
        const page = parseInt((req.query.page as string) || '1', 10);
        const limit = parseInt((req.query.limit as string) || '10', 10);
        const search = ((req.query.search as string) || '').toLowerCase().trim();
        const category = (req.query.category as string) || undefined;

        let scope = [...knowledgeArticles];

        if (category) {
            scope = scope.filter(a => a.category === category);
        }

        if (search) {
            scope = scope.filter(a => {
                const title = (a.title || '').toLowerCase();
                const content = (a.content || '').toLowerCase();
                const tags = (a.tags || []).join(' ').toLowerCase();
                return title.includes(search) || content.includes(search) || tags.includes(search);
            });
        }

        // Newest first
        scope.sort((a, b) => {
            const ad = new Date(a.createdAt || 0).getTime();
            const bd = new Date(b.createdAt || 0).getTime();
            return bd - ad;
        });

        const { data, pagination } = paginate(scope, page, limit);
        res.json({ success: true, data, pagination });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /support/knowledge/:articleId
 * @desc    Get a single knowledge base article
 * @access  Private
 */
router.get('/knowledge/:articleId', authenticate, async (req: Request, res: Response) => {
    try {
        const { articleId } = req.params;
        const article = knowledgeArticles.find(a => a.id === articleId);

        if (!article) {
            res.status(404).json({ success: false, message: 'Article not found' });
            return;
        }

        // Increment view counter
        article.views = (article.views || 0) + 1;

        res.json({ success: true, data: article });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /support/knowledge
 * @desc    Create a knowledge base article
 * @access  Private (admin)
 */
router.post('/knowledge', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { title, category, content, tags, isPublished, status } = req.body || {};

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        if (!title || !content || !category) {
            res.status(400).json({
                success: false,
                message: 'Title, content and category are required'
            });
            return;
        }

        const normalizedTags = Array.isArray(tags)
            ? tags.filter(Boolean)
            : typeof tags === 'string'
                ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                : [];

        const published = typeof isPublished === 'boolean'
            ? isPublished
            : (status ? status === 'published' : true);

        const article = {
            id: uuidv4(),
            title,
            category,
            content,
            tags: normalizedTags,
            isPublished: published,
            status: published ? 'published' : 'draft',
            views: 0,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        knowledgeArticles.push(article);
        res.status(201).json({
            success: true,
            data: article,
            message: 'Article created successfully'
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   PUT /support/knowledge/:articleId
 * @desc    Update a knowledge base article
 * @access  Private (admin)
 */
router.put('/knowledge/:articleId', authenticate, async (req: Request, res: Response) => {
    try {
        const { articleId } = req.params;
        const { title, category, content, tags, isPublished, status } = req.body || {};

        const article = knowledgeArticles.find(a => a.id === articleId);
        if (!article) {
            res.status(404).json({ success: false, message: 'Article not found' });
            return;
        }

        if (title !== undefined) article.title = title;
        if (category !== undefined) article.category = category;
        if (content !== undefined) article.content = content;
        if (tags !== undefined) {
            article.tags = Array.isArray(tags)
                ? tags.filter(Boolean)
                : typeof tags === 'string'
                    ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                    : article.tags;
        }
        if (typeof isPublished === 'boolean') {
            article.isPublished = isPublished;
            article.status = isPublished ? 'published' : 'draft';
        } else if (status !== undefined) {
            article.status = status;
            article.isPublished = status === 'published';
        }
        article.updatedAt = new Date();

        res.json({ success: true, data: article, message: 'Article updated successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   DELETE /support/knowledge/:articleId
 * @desc    Delete a knowledge base article
 * @access  Private (admin)
 */
router.delete('/knowledge/:articleId', authenticate, async (req: Request, res: Response) => {
    try {
        const { articleId } = req.params;
        const idx = knowledgeArticles.findIndex(a => a.id === articleId);

        if (idx === -1) {
            res.status(404).json({ success: false, message: 'Article not found' });
            return;
        }

        const [removed] = knowledgeArticles.splice(idx, 1);
        res.json({ success: true, data: removed, message: 'Article deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================================================
// FAQ + CONTACT (legacy public endpoints, retained)
// =============================================================================

/**
 * @route   GET /support/faq
 * @desc    Get FAQs
 * @access  Public
 */
router.get('/faq', async (req: Request, res: Response) => {
    try {
        const { category } = req.query;
        let filteredFaqs = faqs;

        if (category) {
            filteredFaqs = faqs.filter(f => f.category === category);
        }

        res.json({ success: true, data: filteredFaqs });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /support/contact
 * @desc    Send contact message
 * @access  Public
 */
router.post('/contact', async (req: Request, res: Response) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            res.status(400).json({ success: false, message: 'All fields are required' });
            return;
        }

        // In production, send email or save to database
        res.json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon.'
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
