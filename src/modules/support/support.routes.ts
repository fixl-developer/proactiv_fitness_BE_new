import { Router, Request, Response } from 'express';
import { authenticate } from '../iam/auth.middleware';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory storage for demo (replace with database in production)
const tickets: any[] = [];
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

/**
 * @route   GET /support/tickets
 * @desc    Get user's support tickets
 * @access  Private
 */
router.get('/tickets', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userTickets = tickets.filter(t => t.userId === userId);
        res.json({ success: true, data: userTickets });
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
        const { subject, description, priority } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        if (!subject || !description) {
            res.status(400).json({ success: false, message: 'Subject and description are required' });
            return;
        }

        const ticket = {
            id: uuidv4(),
            userId,
            subject,
            description,
            priority: priority || 'medium',
            status: 'open',
            createdAt: new Date(),
            updatedAt: new Date(),
            replies: 0
        };

        tickets.push(ticket);
        res.status(201).json({ success: true, data: ticket, message: 'Ticket created successfully' });
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

        const ticket = tickets.find(t => t.id === ticketId && t.userId === userId);
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
 * @desc    Update ticket status
 * @access  Private
 */
router.put('/tickets/:ticketId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { ticketId } = req.params;
        const { status } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const ticket = tickets.find(t => t.id === ticketId && t.userId === userId);
        if (!ticket) {
            res.status(404).json({ success: false, message: 'Ticket not found' });
            return;
        }

        ticket.status = status || ticket.status;
        ticket.updatedAt = new Date();

        res.json({ success: true, data: ticket, message: 'Ticket updated successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

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
        res.json({ success: true, message: 'Your message has been sent successfully. We will get back to you soon.' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
