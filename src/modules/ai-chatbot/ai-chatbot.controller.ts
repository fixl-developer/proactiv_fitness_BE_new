import { Router, Request, Response } from 'express';
import { AICoachService } from '../ai-coach/ai-coach.service';
import { BookingService } from '../booking/booking.service';
import { ResponseUtil } from '@/shared/utils/response.util';
import { AppError } from '@/shared/utils/app-error.util';
import { HTTP_STATUS } from '@/shared/constants';

const router = Router();
const aiCoachService = new AICoachService();
const bookingService = new BookingService();

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

// AI Chat endpoint
router.post('/chat', async (req: Request, res: Response) => {
    try {
        const { message, conversationHistory } = req.body as ChatMessage;

        if (!message || !message.trim()) {
            throw new AppError('Message is required', HTTP_STATUS.BAD_REQUEST);
        }

        // Detect intent from message
        const intent = detectIntent(message);
        let response = '';
        let suggestions: string[] = [];
        let bookingIntent = null;

        // Handle different intents
        if (intent.type === 'book_trial' || intent.type === 'book_assessment') {
            response = `Great! I'd love to help you book a ${intent.type === 'book_trial' ? 'trial class' : 'assessment'}. Let me collect some information from you.`;
            suggestions = ['Tell me about your child', 'What program interests you?', 'Which location?'];
            bookingIntent = {
                intent: intent.type,
                childName: intent.childName,
                childAge: intent.childAge,
                program: intent.program,
                location: intent.location
            };
        } else if (intent.type === 'program_info') {
            response = `We offer several programs:\n\n🤸‍♀️ **Gymnastics** - For all ages and skill levels\n🏃‍♂️ **Multi-Sports** - Develop diverse athletic skills\n🏕️ **Holiday Camps** - Fun and intensive training\n\nWhich program interests you?`;
            suggestions = ['Tell me about Gymnastics', 'Multi-Sports details', 'Holiday Camps info'];
        } else if (intent.type === 'location_info') {
            response = `We have locations at:\n\n📍 **Cyberport** - Central location with modern facilities\n📍 **Wan Chai** - Convenient for East Island residents\n\nWhich location works best for you?`;
            suggestions = ['Cyberport details', 'Wan Chai details', 'Both locations'];
        } else if (intent.type === 'pricing_info') {
            response = `Our pricing varies by program and age group:\n\n💰 **Trial Class** - HK$150 (includes assessment)\n💰 **Regular Classes** - From HK$300/month\n💰 **Holiday Camps** - From HK$2,000/week\n\nWould you like to book a trial class?`;
            suggestions = ['Book trial class', 'More pricing details', 'Ask something else'];
        } else {
            // Default response with AI coach recommendations
            response = `I'm here to help! I can assist you with:\n\n📅 Booking trial classes or assessments\n🏋️ Information about our programs\n📍 Location and schedule details\n💰 Pricing information\n\nWhat would you like to know?`;
            suggestions = ['Book a trial', 'Program information', 'Locations', 'Pricing'];
        }

        ResponseUtil.success(res, {
            response,
            suggestions,
            intent: bookingIntent,
            conversationHistory: [...conversationHistory, { role: 'user', content: message }, { role: 'assistant', content: response }]
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

// Helper function to detect intent from message
function detectIntent(message: string) {
    const lowerMessage = message.toLowerCase();

    // Book trial/assessment intent
    if (lowerMessage.includes('book') || lowerMessage.includes('trial') || lowerMessage.includes('assessment')) {
        return {
            type: lowerMessage.includes('assessment') ? 'book_assessment' : 'book_trial',
            childName: extractValue(message, 'child'),
            childAge: extractValue(message, 'age'),
            program: extractValue(message, 'program'),
            location: extractValue(message, 'location')
        };
    }

    // Program info intent
    if (lowerMessage.includes('program') || lowerMessage.includes('class') || lowerMessage.includes('gymnastics') || lowerMessage.includes('sports')) {
        return { type: 'program_info' };
    }

    // Location intent
    if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('cyberport') || lowerMessage.includes('wan chai')) {
        return { type: 'location_info' };
    }

    // Pricing intent
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee') || lowerMessage.includes('how much')) {
        return { type: 'pricing_info' };
    }

    // Default
    return { type: 'general' };
}

// Helper function to extract values from message
function extractValue(message: string, key: string): string | undefined {
    const patterns: { [key: string]: RegExp } = {
        child: /(?:child|kid|son|daughter|name)[\s:]*([A-Za-z]+)/i,
        age: /(?:age|years?|old)[\s:]*(\d+)/i,
        program: /(?:program|class|gymnastics|sports)[\s:]*([A-Za-z\s]+)/i,
        location: /(?:location|cyberport|wan\s?chai)/i
    };

    const pattern = patterns[key];
    if (!pattern) return undefined;

    const match = message.match(pattern);
    return match ? match[1]?.trim() : undefined;
}

export default router;
