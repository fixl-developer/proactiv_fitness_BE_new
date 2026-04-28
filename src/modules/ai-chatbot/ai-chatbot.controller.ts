import { Router, Request, Response } from 'express';
import { BookingService } from '../booking/booking.service';
import { AIChatbotService } from './ai-chatbot.service';
import { ResponseUtil } from '@/shared/utils/response.util';
import { AppError } from '@/shared/utils/app-error.util';
import { HTTP_STATUS } from '@/shared/constants';

const router = Router();
const bookingService = new BookingService();
const aiChatbotService = new AIChatbotService();

interface ChatMessage {
    message: string;
    conversationHistory: any[];
}

interface BookingRequest {
    type: 'trial' | 'assessment';
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    childName: string;
    childAge: string;
    childGender: string;
    program: string;
    location: string;
    date: string;
    timeSlot: string;
}

// AI Chat endpoint — delegates to AIChatbotService (OpenAI-powered with rich keyword fallback)
router.post('/chat', async (req: Request, res: Response) => {
    try {
        const { message, conversationHistory = [] } = req.body as ChatMessage;

        if (!message || !message.trim()) {
            throw new AppError('Message is required', HTTP_STATUS.BAD_REQUEST);
        }

        // Normalize incoming history to the {role, content} shape the AI service expects
        const safeHistory = Array.isArray(conversationHistory)
            ? conversationHistory
                .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
                .slice(-10) // keep context window manageable
            : [];

        const result = await aiChatbotService.processMessage(message, safeHistory);

        ResponseUtil.success(res, {
            response: result.response,
            suggestions: result.suggestions,
            intent: result.intent,
            bookingIntent: result.bookingIntent,
            requiresHumanSupport: result.requiresHumanSupport,
            aiPowered: result.aiPowered,
            conversationHistory: [
                ...safeHistory,
                { role: 'user', content: message },
                { role: 'assistant', content: result.response },
            ],
        }, 'Chat response generated successfully');
    } catch (error: any) {
        res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to process chat message'
        });
    }
});

// Book via chat endpoint
router.post('/book-via-chat', async (req: Request, res: Response) => {
    try {
        const bookingData = req.body as BookingRequest;

        // Validate required fields
        const requiredFields = ['parentName', 'parentEmail', 'parentPhone', 'childName', 'childAge', 'program', 'location', 'date', 'timeSlot'];
        const missingFields = requiredFields.filter(field => !bookingData[field as keyof BookingRequest]);

        if (missingFields.length > 0) {
            throw new AppError(`Missing required fields: ${missingFields.join(', ')}`, HTTP_STATUS.BAD_REQUEST);
        }

        // Create booking using booking service
        const bookingPayload = {
            familyName: bookingData.parentName,
            parentEmail: bookingData.parentEmail,
            parentPhone: bookingData.parentPhone,
            childName: bookingData.childName,
            childAge: parseInt(bookingData.childAge),
            childGender: bookingData.childGender || 'Not specified',
            bookingType: bookingData.type,
            program: bookingData.program,
            location: bookingData.location,
            sessionDate: new Date(`${bookingData.date}T${bookingData.timeSlot}`),
            status: 'confirmed',
            paymentStatus: 'pending'
        };

        const booking = await bookingService.createBooking(bookingPayload as any, 'chatbot-user');

        const confirmationMessage = `✅ **Booking Confirmed!**\n\nThank you, ${bookingData.parentName}!\n\n📋 **Booking Details:**\n- Type: ${bookingData.type === 'trial' ? 'Trial Class' : 'Assessment'}\n- Child: ${bookingData.childName} (Age ${bookingData.childAge})\n- Program: ${bookingData.program}\n- Location: ${bookingData.location}\n- Date & Time: ${bookingData.date} at ${bookingData.timeSlot}\n\n📧 Confirmation email sent to ${bookingData.parentEmail}\n\nWe look forward to seeing you soon! 🤸‍♀️`;

        ResponseUtil.success(res, {
            success: true,
            bookingId: booking.bookingId,
            confirmationMessage,
            bookingDetails: booking
        }, 'Booking created successfully', HTTP_STATUS.CREATED);
    } catch (error: any) {
        res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to create booking'
        });
    }
});

export default router;
