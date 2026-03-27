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
        let suggestions = ['Book a trial', 'Program information', 'Locations', 'Pricing'];
        let intent = 'general';

        if (lower.includes('book') || lower.includes('trial') || lower.includes('assessment')) {
            response = "I'd love to help you book! Please provide your child's name, age, preferred program, and location, and we'll get you set up.";
            suggestions = ['Gymnastics trial', 'Multi-Sports trial', 'View locations'];
            intent = 'booking';
        } else if (lower.includes('program') || lower.includes('class') || lower.includes('gymnastics')) {
            response = 'We offer Gymnastics (ages 2-18), Multi-Sports (ages 3-12), Holiday Camps, and Birthday Parties. Which interests you?';
            suggestions = ['Gymnastics details', 'Multi-Sports details', 'Holiday Camps'];
            intent = 'program_info';
        } else if (lower.includes('price') || lower.includes('cost') || lower.includes('fee')) {
            response = 'Trial classes start at HK$150. Regular classes from HK$300/month. Holiday Camps from HK$2,000/week. Want to book a trial?';
            suggestions = ['Book trial class', 'More pricing details', 'Contact us'];
            intent = 'pricing';
        } else if (lower.includes('location') || lower.includes('where') || lower.includes('address')) {
            response = 'We have multiple global locations. Would you like details about a specific area?';
            suggestions = ['Find nearest location', 'All locations', 'Contact us'];
            intent = 'location';
        }

        return {
            response,
            suggestions,
            intent,
            bookingIntent: null,
            requiresHumanSupport: false,
            aiPowered: false,
        };
    }
}
