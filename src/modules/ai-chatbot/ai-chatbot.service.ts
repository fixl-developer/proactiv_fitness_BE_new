import aiService from '@shared/services/ai.service';
import { AIPromptService } from '@shared/services/ai-prompt.service';
import logger from '@shared/utils/logger.util';

interface ChatResponse {
    response: string;
    suggestions: string[];
    intent: string;
    bookingIntent: any | null;
    requiresHumanSupport: boolean;
    aiPowered: boolean;
}

export class AIChatbotService {
    // ─── Process Chat Message with AI ──────────────────────────
    async processMessage(
        message: string,
        conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
        userContext?: any
    ): Promise<ChatResponse> {
        try {
            const prompt = AIPromptService.chatbotConversation({
                message,
                conversationHistory,
                userContext,
            });

            const result = await aiService.jsonCompletion<{
                response: string;
                suggestions: string[];
                intent: string;
                bookingIntent: any | null;
                requiresHumanSupport: boolean;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                conversationHistory,
                module: 'ai-chatbot',
                temperature: 0.8,
            });

            logger.info(`AI Chatbot: Processed message with intent "${result.intent}"`);

            return {
                response: result.response,
                suggestions: result.suggestions || ['View Programs', 'Book a Trial', 'Contact Support'],
                intent: result.intent || 'general',
                bookingIntent: result.bookingIntent || null,
                requiresHumanSupport: result.requiresHumanSupport || false,
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error('AI Chatbot processing failed:', error.message);

            // Intelligent fallback using keyword matching
            return this.getFallbackResponse(message);
        }
    }

    // ─── Fallback Response (when AI is unavailable) ────────────
    private getFallbackResponse(message: string): ChatResponse {
        const lower = message.toLowerCase();

        let response = "I'm here to help! I can assist you with booking classes, program information, locations, and pricing. What would you like to know?";
        let suggestions = ['Book a trial class', 'Tell me about programs', 'What are your locations?'];
        let intent = 'general';
        let bookingIntent: any = null;

        // Booking intent detection
        const wantsAssessment = lower.includes('assessment') || lower.includes('evaluate') || lower.includes('skill check');
        const wantsBooking = lower.includes('book') || lower.includes('trial') || lower.includes('register') ||
            lower.includes('sign up') || lower.includes('enroll') || lower.includes('schedule') ||
            lower.includes('try') || wantsAssessment;

        // Extract child details from message
        const ageMatch = lower.match(/(\d+)\s*(years?\s*old|yr|year|age)/);
        const extractedAge = ageMatch ? parseInt(ageMatch[1]) : null;

        let detectedProgram: string | null = null;
        if (lower.includes('gymnastic')) detectedProgram = 'gymnastics';
        else if (lower.includes('multi') || lower.includes('sport')) detectedProgram = 'multi-sports';
        else if (lower.includes('camp') || lower.includes('holiday')) detectedProgram = 'holiday-camps';
        else if (lower.includes('birthday') || lower.includes('party')) detectedProgram = 'birthday-parties';

        if (wantsBooking) {
            const bookingType = wantsAssessment ? 'assessment' : 'trial class';
            response = `Great! I'd love to help you book a ${bookingType}! 🤸 A booking form will appear below — just fill in your details and we'll get you set up right away.`;
            if (detectedProgram) {
                response += ` I've pre-selected ${detectedProgram.replace('-', ' ')} for you.`;
            }
            suggestions = ['Tell me about programs', 'View locations', 'Pricing information'];
            intent = 'booking';
            bookingIntent = {
                programType: wantsAssessment ? 'assessment' : detectedProgram,
                childName: null,
                childAge: extractedAge,
                preferredDate: null,
                preferredLocation: null,
            };
        } else if (lower.includes('gymnastic') || lower.includes('class') || lower.includes('program') || lower.includes('course')) {
            if (extractedAge && extractedAge >= 2 && extractedAge <= 5) {
                response = `Great choice for your ${extractedAge}-year-old! Our Kinder Gym program (ages 2-5) focuses on basic motor skills, coordination, and having fun in a safe environment. Would you like to book a free trial class?`;
            } else if (extractedAge && extractedAge >= 6 && extractedAge <= 12) {
                response = `Wonderful! For your ${extractedAge}-year-old, we recommend our School Gymnastics program (ages 6-12). It covers foundational gymnastics skills, flexibility, and strength building. We also have Multi-Sports programs for variety! Would you like to book a free trial?`;
            } else if (extractedAge && extractedAge >= 13) {
                response = `For your ${extractedAge}-year-old, we have advanced gymnastics programs including competitive training tracks. Our experienced coaches work with teens on technique, strength, and performance goals. Want to book a trial?`;
            } else {
                response = "We offer amazing programs for ages 2-18! 🤸\n\n- Gymnastics: Beginner to Elite levels\n- Multi-Sports: Ages 3-12, seasonal fun\n- Holiday Camps: Full-day activities during school breaks\n- Birthday Parties: Custom party packages\n\nWhich program interests you?";
            }
            suggestions = ['Book a free trial', 'Gymnastics details', 'Holiday camps info'];
            intent = 'program_info';
        } else if (lower.includes('price') || lower.includes('cost') || lower.includes('fee') || lower.includes('how much')) {
            response = "Here's our pricing overview:\n\n- Trial Classes: Free / from HK$150\n- Regular Classes: From HK$300/month\n- Holiday Camps: From HK$2,000/week\n- Birthday Parties: Custom packages\n\nWould you like to book a trial class to experience our programs first?";
            suggestions = ['Book a trial class', 'Contact for pricing', 'View programs'];
            intent = 'pricing';
        } else if (lower.includes('location') || lower.includes('where') || lower.includes('address') || lower.includes('branch')) {
            response = "We have two locations in Hong Kong:\n\n📍 Cyberport — Full gymnasium facility\n📍 Wan Chai — Central location with all programs\n\nBoth locations offer our full range of gymnastics, multi-sports, and camp programs. Which location is most convenient for you?";
            suggestions = ['Book at Cyberport', 'Book at Wan Chai', 'View programs'];
            intent = 'location';
        } else if (lower.includes('camp') || lower.includes('holiday') || lower.includes('summer') || lower.includes('winter')) {
            response = "Our Holiday Camps are a blast! We run camps during all school holidays with full-day activities including gymnastics, sports, games, and creative activities. Ages 3-12 welcome. Camps start from HK$2,000/week. Would you like to register?";
            suggestions = ['Register for camp', 'Camp schedule', 'Pricing details'];
            intent = 'program_info';
        } else if (lower.includes('birthday') || lower.includes('party') || lower.includes('parties')) {
            response = "Make your child's birthday unforgettable! 🎂 Our Birthday Party packages include exclusive use of our facilities, coached activities, party setup, and cleanup. We customize each party to your child's interests. Contact us for a custom quote!";
            suggestions = ['Book a party', 'Contact us', 'View locations'];
            intent = 'program_info';
        } else if (lower.includes('age') || lower.includes('old') || lower.includes('child') || lower.includes('kid') || lower.includes('toddler') || lower.includes('baby')) {
            response = "We welcome children of all ages!\n\n- Ages 2-3: Kinder Gym (parent-assisted)\n- Ages 3-5: Pre-school gymnastics\n- Ages 6-12: School-age programs & multi-sports\n- Ages 13-18: Teen & competitive gymnastics\n\nHow old is your child? I can recommend the best program!";
            suggestions = ['Book a trial', 'View programs', 'Pricing info'];
            intent = 'program_info';
        } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good') || lower.includes('thanks')) {
            response = "Hello! Welcome to ProActiv Fitness! 👋 I'm here to help you find the perfect program for your child. We offer gymnastics, multi-sports, holiday camps, and birthday parties for ages 2-18. How can I help you today?";
            suggestions = ['Tell me about programs', 'Book a free trial', 'Pricing information'];
            intent = 'greeting';
        } else if (lower.includes('contact') || lower.includes('phone') || lower.includes('email') || lower.includes('call') || lower.includes('talk') || lower.includes('human') || lower.includes('staff')) {
            response = "You can reach us through these channels:\n\n📞 Phone: +852 1234 5678\n📧 Email: info@proactivsports.net\n🏢 Visit: Any of our locations Mon-Sat\n\nWould you like to book a visit instead?";
            suggestions = ['Book a trial', 'View locations', 'View programs'];
            intent = 'support';
        }

        return {
            response,
            suggestions,
            intent,
            bookingIntent,
            requiresHumanSupport: false,
            aiPowered: false,
        };
    }
}
