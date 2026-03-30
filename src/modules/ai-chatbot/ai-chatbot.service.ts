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
        let suggestions = ['Book a trial class', 'Tell me about programs', 'What are your locations?', 'Pricing information'];
        let intent = 'general';
        let bookingIntent: any = null;

        if (lower.includes('book') || lower.includes('trial') || lower.includes('assessment') || lower.includes('schedule')) {
            response = "I'd love to help you book! We offer free trial classes for all our programs. You can book a trial for Gymnastics, Multi-Sports, Holiday Camps, or Birthday Parties. Just fill in the booking form and we'll get you set up! 🤸‍♀️";
            suggestions = ['Book gymnastics trial', 'Book multi-sports trial', 'View locations'];
            intent = 'book_trial';
            bookingIntent = { programType: null, childName: null, childAge: null };
        } else if (lower.includes('gymnastic') || lower.includes('class') || lower.includes('program') || lower.includes('course')) {
            // Check for age mentions
            const ageMatch = lower.match(/(\d+)\s*(years?\s*old|yr|year)/);
            const age = ageMatch ? parseInt(ageMatch[1]) : null;

            if (age && age >= 2 && age <= 5) {
                response = `Great choice for your ${age}-year-old! 🌟 We have our Kinder Gym program perfect for ages 2-5. It focuses on basic motor skills, coordination, and having fun in a safe environment. Would you like to book a free trial class?`;
            } else if (age && age >= 6 && age <= 12) {
                response = `Wonderful! For your ${age}-year-old, we recommend our School Gymnastics program (ages 6-12). It covers foundational gymnastics skills, flexibility, and strength building. We also have Multi-Sports programs for variety! Would you like to book a free trial?`;
            } else if (age && age >= 13) {
                response = `For your ${age}-year-old, we have advanced gymnastics programs including competitive training tracks. Our experienced coaches work with teens on technique, strength, and performance goals. Want to book a trial?`;
            } else {
                response = "We offer amazing programs for ages 2-18! 🤸‍♀️\n\n• **Gymnastics**: Beginner to Elite levels\n• **Multi-Sports**: Ages 3-12, seasonal fun\n• **Holiday Camps**: Full-day activities during school breaks\n• **Birthday Parties**: Custom party packages at our facilities\n\nWhich program interests you?";
            }
            suggestions = ['Book a free trial', 'Gymnastics details', 'Holiday camps info'];
            intent = 'program_info';
        } else if (lower.includes('price') || lower.includes('cost') || lower.includes('fee') || lower.includes('how much')) {
            response = "Here's our pricing overview 💰:\n\n• **Trial Classes**: Starting from HK$150\n• **Regular Classes**: From HK$300/month\n• **Holiday Camps**: From HK$2,000/week\n• **Birthday Parties**: Custom packages available\n\nWould you like to book a trial class to experience our programs first?";
            suggestions = ['Book trial class', 'Contact for custom pricing', 'View programs'];
            intent = 'pricing';
        } else if (lower.includes('location') || lower.includes('where') || lower.includes('address') || lower.includes('branch')) {
            response = "We have multiple locations to serve you! 📍\n\n• **Cyberport** - Full gymnasium facility\n• **Wan Chai** - Central location with all programs\n\nEach location offers our full range of gymnastics, multi-sports, and camp programs. Which location is most convenient for you?";
            suggestions = ['Cyberport details', 'Wan Chai details', 'Book a trial'];
            intent = 'location';
        } else if (lower.includes('camp') || lower.includes('holiday') || lower.includes('summer') || lower.includes('winter')) {
            response = "Our Holiday Camps are a blast! 🏕️ We run camps during all school holidays with full-day activities including gymnastics, sports, games, and creative activities. Ages 3-12 welcome. Camps start from HK$2,000/week. Would you like to register?";
            suggestions = ['Register for camp', 'Camp schedule', 'Pricing details'];
            intent = 'program_info';
        } else if (lower.includes('birthday') || lower.includes('party') || lower.includes('parties')) {
            response = "Make your child's birthday unforgettable! 🎂 Our Birthday Party packages include exclusive use of our facilities, coached activities, party setup, and cleanup. We customize each party to your child's interests. Contact us for a custom quote!";
            suggestions = ['Party packages', 'Book a party', 'Contact us'];
            intent = 'program_info';
        } else if (lower.includes('age') || lower.includes('old') || lower.includes('child') || lower.includes('kid') || lower.includes('toddler') || lower.includes('baby')) {
            response = "We welcome children of all ages! 👶\n\n• **Ages 2-3**: Kinder Gym (parent-assisted)\n• **Ages 3-5**: Pre-school gymnastics\n• **Ages 6-12**: School-age programs & multi-sports\n• **Ages 13-18**: Teen & competitive gymnastics\n\nHow old is your child? I can recommend the best program!";
            suggestions = ['Book a trial', 'View programs', 'Pricing info'];
            intent = 'program_info';
        } else if (lower.includes('coach') || lower.includes('teacher') || lower.includes('instructor') || lower.includes('team')) {
            response = "Our team of expert coaches is passionate about youth development! 💪 All coaches are certified professionals with years of experience. From our Director of Sports to specialized gymnastics coaches, we have a dedicated team ready to help your child shine. Visit our team page to learn more!";
            suggestions = ['Meet our team', 'Book a trial', 'View programs'];
            intent = 'general';
        } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good')) {
            response = "Hello! Welcome to ProActiv Fitness! 👋 I'm here to help you find the perfect program for your child. We offer gymnastics, multi-sports, holiday camps, and birthday parties for ages 2-18. How can I help you today?";
            suggestions = ['Tell me about programs', 'Book a free trial', 'Pricing information', 'View locations'];
            intent = 'greeting';
        } else if (lower.includes('contact') || lower.includes('phone') || lower.includes('email') || lower.includes('call') || lower.includes('talk') || lower.includes('human') || lower.includes('staff')) {
            response = "You can reach us through these channels 📞:\n\n• **Phone**: +852 1234 5678\n• **Email**: info@proactivsports.net\n• **Visit**: Any of our locations during operating hours\n\nOur team is available Monday-Saturday. Would you like to book a visit?";
            suggestions = ['Book a visit', 'View locations', 'View programs'];
            intent = 'support';
        }

        return {
            response,
            suggestions,
            intent,
            bookingIntent: bookingIntent,
            requiresHumanSupport: false,
            aiPowered: false,
        };
    }
}
