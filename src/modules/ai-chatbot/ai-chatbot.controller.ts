import { Router, Request, Response } from 'express';
import { AIChatbotService } from './ai-chatbot.service';
import { BookingService } from '../booking/booking.service';
import { ResponseUtil } from '@/shared/utils/response.util';
import { AppError } from '@/shared/utils/app-error.util';
import { HTTP_STATUS } from '@/shared/constants';

const router = Router();
const chatbotService = new AIChatbotService();
const bookingService = new BookingService();

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

// ─── AI Chat Endpoint ──────────────────────────────────────────
router.post('/chat', async (req: Request, res: Response) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || !message.trim()) {
            throw new AppError('Message is required', HTTP_STATUS.BAD_REQUEST);
        }

        const userContext = req.user ? { userId: req.user.id, role: req.user.role } : null;

        const chatResponse = await chatbotService.processMessage(
            message.trim(),
            conversationHistory,
            userContext
        );

        ResponseUtil.success(res, {
            ...chatResponse,
            conversationHistory: [
                ...conversationHistory,
                { role: 'user', content: message },
                { role: 'assistant', content: chatResponse.response },
            ],
        }, 'Chat response generated successfully');
    } catch (error: any) {
        ResponseUtil.error(
            res,
            error.message || 'Failed to process chat message',
            error,
            error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
});

// ─── Book via Chat Endpoint ────────────────────────────────────
router.post('/book-via-chat', async (req: Request, res: Response) => {
    try {
        const bookingData = req.body as BookingRequest;

        const requiredFields = ['parentName', 'parentEmail', 'parentPhone', 'childName', 'childAge', 'program', 'location', 'date', 'timeSlot'];
        const missingFields = requiredFields.filter(field => !bookingData[field as keyof BookingRequest]);

        if (missingFields.length > 0) {
            throw new AppError(`Missing required fields: ${missingFields.join(', ')}`, HTTP_STATUS.BAD_REQUEST);
        }

        const bookingPayload = {
            program: bookingData.program,
            childName: bookingData.childName,
            childAge: parseInt(bookingData.childAge),
            childGender: bookingData.childGender || 'Not specified',
            location: bookingData.location,
            date: bookingData.date,
            timeSlot: bookingData.timeSlot,
            parentName: bookingData.parentName,
            parentEmail: bookingData.parentEmail,
            parentPhone: bookingData.parentPhone,
        };

        // Use the correct simplified booking methods based on type
        let booking;
        if (bookingData.type === 'assessment') {
            booking = await bookingService.createAssessmentBooking(bookingPayload, 'chatbot-user');
        } else {
            // Trial class booking
            booking = await bookingService.createClassBooking({
                classId: `chatbot-${Date.now()}`,
                className: `Trial: ${bookingData.program}`,
                classDate: bookingData.date,
                classTime: bookingData.timeSlot,
                location: bookingData.location,
                price: 0,
                childName: bookingData.childName,
                childAge: parseInt(bookingData.childAge),
                notes: `Parent: ${bookingData.parentName} | Email: ${bookingData.parentEmail} | Phone: ${bookingData.parentPhone} | Gender: ${bookingData.childGender || 'Not specified'}`,
            }, 'chatbot-user');
        }

        const confirmationMessage = `Booking Confirmed! ✅\n\nThank you, ${bookingData.parentName}!\n\nBooking Details:\n📋 Type: ${bookingData.type === 'trial' ? 'Trial Class' : 'Assessment'}\n👧 Child: ${bookingData.childName} (Age ${bookingData.childAge})\n🤸 Program: ${bookingData.program}\n📍 Location: ${bookingData.location}\n📅 Date: ${bookingData.date}\n🕐 Time: ${bookingData.timeSlot}\n\nConfirmation ID: ${booking.bookingId}\nConfirmation email will be sent to ${bookingData.parentEmail}.\n\nWe look forward to seeing ${bookingData.childName}! 🎉`;

        ResponseUtil.created(res, {
            bookingId: booking.bookingId,
            confirmationMessage,
            bookingDetails: booking,
        }, 'Booking created successfully');
    } catch (error: any) {
        ResponseUtil.error(
            res,
            error.message || 'Failed to create booking',
            error,
            error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
});

export default router;
