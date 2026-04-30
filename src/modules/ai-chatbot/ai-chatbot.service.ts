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

            // Use chatCompletion (not jsonCompletion) so we can detect the
            // "canned fallback" path AIService takes on OpenAI errors / quota issues.
            const completion = await aiService.chatCompletion({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                conversationHistory,
                module: 'ai-chatbot',
                temperature: 0.8,
                responseFormat: 'json_object',
            });

            // If AIService returned its canned fallback (e.g. OpenAI 401/429/network),
            // route to our smart keyword fallback instead — that path produces
            // contextual answers per question rather than one repeated reply.
            if (completion.model === 'fallback') {
                logger.warn('AI Chatbot: AIService returned canned fallback — using smart keyword fallback for contextual reply');
                return this.getFallbackResponse(message);
            }

            let parsed: {
                response: string;
                suggestions: string[];
                intent: string;
                bookingIntent: any | null;
                requiresHumanSupport: boolean;
            };
            try {
                parsed = JSON.parse(completion.content);
            } catch {
                logger.warn('AI Chatbot: AI returned non-JSON content, falling back to keyword reply');
                return this.getFallbackResponse(message);
            }

            logger.info(`AI Chatbot: Processed message with intent "${parsed.intent}"`);

            return {
                response: parsed.response,
                suggestions: parsed.suggestions || ['View Programs', 'Book a Trial', 'Contact Support'],
                intent: parsed.intent || 'general',
                bookingIntent: parsed.bookingIntent || null,
                requiresHumanSupport: parsed.requiresHumanSupport || false,
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error('AI Chatbot processing failed:', error.message);

            // Intelligent fallback using keyword matching
            return this.getFallbackResponse(message);
        }
    }

    // ─── Fallback Response (when AI is unavailable) ────────────
    // Keyword-driven matcher. Matched in the order topics are pushed —
    // most specific topics first, generic catch-alls last.
    private getFallbackResponse(message: string): ChatResponse {
        const raw = message.trim();
        const lower = raw.toLowerCase();

        // Extract details from the message so answers can echo them back
        const ageMatch = lower.match(/(\d+)\s*(?:years?\s*old|yr|year|age|y\/o|yo)\b/) || lower.match(/\b(?:age|aged)\s*(\d+)/);
        const extractedAge = ageMatch ? parseInt(ageMatch[1]) : null;

        let detectedProgram: string | null = null;
        if (/gymnastic/.test(lower)) detectedProgram = 'gymnastics';
        else if (/multi[-\s]?sport|multisport/.test(lower)) detectedProgram = 'multi-sports';
        else if (/(holiday|summer|winter|easter|spring)\s*camp|\bcamps?\b/.test(lower)) detectedProgram = 'holiday-camps';
        else if (/birthday|party|parties/.test(lower)) detectedProgram = 'birthday-parties';

        let detectedLocation: 'cyberport' | 'wan-chai' | null = null;
        if (/cyberport/.test(lower)) detectedLocation = 'cyberport';
        else if (/wan\s*chai/.test(lower)) detectedLocation = 'wan-chai';

        const wantsAssessment = /assessment|evaluate|evaluation|skill check|skill-check/.test(lower);
        const wantsBooking = /\bbook(?!s\b)|register|sign\s*up|enrol|enroll|schedule a|reserve/.test(lower)
            || (lower.includes('trial') && !lower.includes('trial what'))
            || wantsAssessment;

        // Build candidate answers in priority order
        const ageHint = extractedAge ? ` for your ${extractedAge}-year-old` : '';
        const programLabel = detectedProgram ? detectedProgram.replace('-', ' ') : null;

        // 1) BOOKING — highest priority, opens the booking form on the frontend
        if (wantsBooking) {
            const type = wantsAssessment ? 'assessment' : 'trial class';
            let response = `Awesome — let's get you booked for a ${type}! 🤸 A booking form will appear below; fill in your details and we'll confirm your slot.`;
            if (programLabel) response += ` I've pre-selected **${programLabel}** for you.`;
            if (detectedLocation) response += ` Location: **${detectedLocation === 'cyberport' ? 'Cyberport' : 'Wan Chai'}**.`;
            if (extractedAge) response += ` Age noted: ${extractedAge}.`;
            return this.buildResponse(response, ['Tell me about programs', 'Pricing info', 'Other location'], 'booking', {
                programType: wantsAssessment ? 'assessment' : detectedProgram,
                childName: null,
                childAge: extractedAge,
                preferredDate: null,
                preferredLocation: detectedLocation,
            });
        }

        // 2) COACHES / INSTRUCTORS / TRAINERS
        if (/coach|instructor|trainer|teacher|qualif|certified|experience/.test(lower)) {
            const female = /female|woman|women|lady|girl coach/.test(lower);
            const male = /\bmale\b|man coach|men coach/.test(lower);
            let response = "Our coaches are certified professionals with years of experience in youth gymnastics, multi-sports and child development. Many hold international gymnastics coaching certifications and are first-aid trained. ";
            if (female) response += "Yes — we have excellent female coaches across both Cyberport and Wan Chai locations. ";
            else if (male) response += "Yes — we have male coaches across both locations as well. ";
            response += "We can match your child with a coach that fits their age and skill level.";
            return this.buildResponse(response, ['Book a trial class', 'View locations', 'Programs offered'], 'coaches');
        }

        // 3) HOURS / SCHEDULE / TIMINGS
        if (/\b(hour|hours|open|opening|close|closing|timing|timings|when.*open|what time|operating)\b/.test(lower)) {
            return this.buildResponse(
                "We're open **Monday to Saturday** at both locations:\n\n🕘 **Weekdays:** 9:00 AM – 7:00 PM\n🕘 **Saturday:** 9:00 AM – 6:00 PM\n🚫 **Sunday:** Closed (private events only)\n\nClass schedules vary by program — pick a day and I'll show available slots.",
                ['Book a class', 'View schedule', 'Locations'],
                'schedule'
            );
        }

        // 4) SAFETY / INSURANCE / EQUIPMENT
        if (/\b(safe|safety|injur|insurance|certified equipment|equipment|mats?|spot)\b/.test(lower)) {
            return this.buildResponse(
                "Safety is our top priority. 🛡️\n\n• All facilities use professional-grade gymnastics mats and apparatus\n• Coaches are certified in first aid & CPR\n• Mandatory coach-to-student ratios (typically 1:6 for under-7s, 1:8 for older)\n• Full liability insurance for every enrolled student\n• Daily equipment safety checks\n\nWe've maintained an excellent safety record across both locations.",
                ['Book a trial', 'Coach qualifications', 'Class sizes'],
                'safety'
            );
        }

        // 5) WHAT TO WEAR / WHAT TO BRING
        if (/\b(wear|clothes|clothing|attire|uniform|bring|equipment to bring|water bottle)\b/.test(lower)) {
            return this.buildResponse(
                "👕 **What to wear:** Comfortable, fitted athletic wear (leotard, t-shirt + shorts/leggings). No jewellery, no zips/buttons. Bare feet for gymnastics; trainers for multi-sports.\n\n🎒 **What to bring:** Water bottle, hair tie if hair is long, and a small towel. We provide all equipment.",
                ['Book a trial', 'Class details', 'Locations'],
                'logistics'
            );
        }

        // 6) CLASS SIZE / RATIO
        if (/\b(class size|how many students|ratio|how many kids|group size|small class)\b/.test(lower)) {
            return this.buildResponse(
                "We keep class sizes small for personal attention:\n\n• **Kinder Gym (2–5):** max 8 children, 1 coach + 1 assistant\n• **School-age (6–12):** max 10 children, 1 coach\n• **Teen / Competitive (13+):** max 8 athletes per coach\n\nThis ensures every child gets hands-on coaching every session.",
                ['Book a trial', 'Coach info', 'Programs'],
                'class_size'
            );
        }

        // 7) REFUND / CANCELLATION / MAKE-UP
        if (/\b(refund|cancel|cancellation|make[-\s]?up|reschedule|policy|missed class|miss a class)\b/.test(lower)) {
            return this.buildResponse(
                "📋 **Cancellation & make-up policy:**\n\n• Cancel ≥24 hrs before class: full make-up class credit\n• Cancel <24 hrs or no-show: class is forfeited\n• Refunds available within 14 days of enrolment if no classes attended\n• Up to 2 make-up classes per term for medical absences\n\nNeed help with a specific booking? Contact info@proactivsports.net.",
                ['Book a class', 'Contact support', 'Pricing'],
                'policy'
            );
        }

        // 8) SIBLING / DISCOUNT / PROMOTION
        if (/\b(sibling|discount|promo|promotion|offer|deal|cheaper|free trial)\b/.test(lower)) {
            return this.buildResponse(
                "💰 **Discounts available:**\n\n• **Sibling discount:** 10% off the second child, 15% off the third\n• **Term packages:** Save up to 15% vs. monthly billing\n• **Free trial class** for first-time families\n• **Multi-program discount:** 10% off when enrolling in 2+ programs\n\nWant me to start a free trial booking?",
                ['Book free trial', 'Pricing details', 'Programs'],
                'discount'
            );
        }

        // 9) COMPETITION / PROGRESSION / LEVELS
        if (/\b(compet|level|advance|progress|elite|professional|team|squad)\b/.test(lower)) {
            return this.buildResponse(
                "🏆 We offer a clear progression path:\n\n• **Recreational** → fun, fundamentals, no competition pressure\n• **Pre-team** → invitation-based, building competitive skills\n• **Competitive squad** → regional/national meets\n• **Elite track** → year-round training for serious athletes\n\nCoaches recommend progression based on skill assessments. Want to book an assessment?",
                ['Book assessment', 'Coach info', 'Class details'],
                'progression'
            );
        }

        // 10) DISTANCE / TRAVEL / TRANSPORT / MTR
        if (/\b(mtr|bus|drive|parking|park|transport|how far|distance|near|close to|getting there)\b/.test(lower)) {
            const where = detectedLocation === 'wan-chai' ? 'Wan Chai' : detectedLocation === 'cyberport' ? 'Cyberport' : 'both locations';
            const detail = detectedLocation === 'wan-chai'
                ? "🚇 **Wan Chai:** 5-min walk from Wan Chai MTR Exit A. Limited paid parking nearby."
                : detectedLocation === 'cyberport'
                    ? "🚌 **Cyberport:** Cyberport bus terminus on-site (routes 30X/107). On-site paid parking available."
                    : "🚇 **Wan Chai:** 5-min walk from Wan Chai MTR.\n🚌 **Cyberport:** Cyberport bus terminus on-site, on-site paid parking.";
            return this.buildResponse(`Getting to ${where} is easy:\n\n${detail}`, ['Book at Cyberport', 'Book at Wan Chai', 'Other questions'], 'transport');
        }

        // 11) PRICING — handle BEFORE program info so "how much for camp" → camp pricing
        if (/\bprice|cost|fee|fees|how much|charges?|rate|tuition|expensive|cheap\b/.test(lower)) {
            let response: string;
            if (detectedProgram === 'holiday-camps') {
                response = "🏕️ **Holiday Camp pricing:**\n\n• 3-day mini camp: from HK$1,200\n• 5-day full week: from **HK$2,000/week**\n• Multi-week packages: 10% off\n• Sibling discount: 10–15% off\n\nLunch and snacks included for full-day camps.";
            } else if (detectedProgram === 'birthday-parties') {
                response = "🎂 **Birthday party packages** are custom-built around your guest count and theme:\n\n• Up to 15 kids: from HK$3,500\n• 16–25 kids: from HK$5,000\n• 25+ kids: contact us for a quote\n\nIncludes 1.5-hr session, dedicated coach, decoration & cleanup.";
            } else if (detectedProgram === 'gymnastics') {
                response = "🤸 **Gymnastics pricing:**\n\n• Trial class: Free / HK$150\n• Recreational classes: from HK$300/month (1 class/week)\n• Multi-class packages: from HK$550/month (2 classes/week)\n• Competitive squad: contact us for tailored quote";
            } else if (detectedProgram === 'multi-sports') {
                response = "🏃 **Multi-Sports pricing:**\n\n• Trial class: Free / HK$150\n• Weekly programs: from HK$320/month\n• Term packages: from HK$1,100 (12 weeks)";
            } else {
                response = "💰 **Our pricing at a glance:**\n\n• **Trial Class:** Free / from HK$150\n• **Regular gymnastics/multi-sports:** From HK$300/month\n• **Holiday Camps:** From HK$2,000/week\n• **Birthday Parties:** Custom packages from HK$3,500\n\nSibling and multi-program discounts available!";
            }
            return this.buildResponse(response, ['Book a trial', 'Sibling discount', 'View programs'], 'pricing');
        }

        // 12) LOCATION DETAILS
        if (/\b(location|where|address|branch|directions|cyberport|wan\s*chai|venue)\b/.test(lower)) {
            let response: string;
            if (detectedLocation === 'cyberport') {
                response = "📍 **Cyberport Location**\n\nFull-sized gymnasium with spring floor, beam, bars, vault & foam pit.\nAddress: Cyberport, Pok Fu Lam, Hong Kong Island\n🚌 Cyberport bus terminus on-site\n🚗 On-site paid parking available\nMon–Sat: 9 AM – 7 PM";
            } else if (detectedLocation === 'wan-chai') {
                response = "📍 **Wan Chai Location**\n\nCentral studio with full apparatus, ideal for after-school sessions.\nAddress: Wan Chai, Hong Kong Island\n🚇 5-min walk from Wan Chai MTR Exit A\nMon–Sat: 9 AM – 7 PM";
            } else {
                response = "📍 We have **two Hong Kong locations**:\n\n• **Cyberport** — Full gymnasium facility, on-site parking\n• **Wan Chai** — Central, near MTR\n\nBoth locations run our complete program range. Which is more convenient for you?";
            }
            return this.buildResponse(response, ['Book at Cyberport', 'Book at Wan Chai', 'Programs offered'], 'location');
        }

        // 13) GYMNASTICS-specific question
        if (/gymnastic/.test(lower)) {
            let response: string;
            if (extractedAge && extractedAge >= 2 && extractedAge <= 5) {
                response = `Perfect age! Our **Kinder Gym** program${ageHint} (ages 2–5) builds motor skills, body awareness and coordination through guided play. Sessions are 45 minutes, parent-assisted for the youngest. Great first-sport experience!`;
            } else if (extractedAge && extractedAge >= 6 && extractedAge <= 12) {
                response = `Excellent! Our **School Gymnastics** program${ageHint} (ages 6–12) covers floor, beam, bars and vault — building strength, flexibility and discipline. Recreational and pre-team tracks available.`;
            } else if (extractedAge && extractedAge >= 13) {
                response = `For age ${extractedAge}, we offer **Teen & Competitive Gymnastics** — technique refinement, strength conditioning, and (if interested) competition prep. Coaches assess each athlete to design their training plan.`;
            } else {
                response = "🤸 **Our Gymnastics programs:**\n\n• **Kinder Gym** (ages 2–5) — fundamentals through play\n• **School Gymnastics** (ages 6–12) — full apparatus training\n• **Teen / Competitive** (ages 13–18) — advanced & elite tracks\n\nWhat age is your child?";
            }
            return this.buildResponse(response, ['Book a trial', 'View pricing', 'Coach details'], 'program_info');
        }

        // 14) MULTI-SPORTS
        if (/multi[-\s]?sport|multisport|variety|different sports/.test(lower)) {
            return this.buildResponse(
                `🏃 Our **Multi-Sports** program${ageHint} (ages 3–12) rotates through football, basketball, athletics, racquet sports, and team games each term. Perfect for kids who want variety and to discover what they love.\n\nSessions are 60 minutes, weekly throughout the term.`,
                ['Book a trial', 'Term schedule', 'Pricing'],
                'program_info'
            );
        }

        // 15) HOLIDAY CAMPS
        if (/(holiday|summer|winter|easter|spring)\s*camp|\bcamps?\b/.test(lower)) {
            return this.buildResponse(
                `🏕️ **Holiday Camps** run during every school break (Easter, summer, autumn half-term, winter)${ageHint} for ages 3–12. Full-day (9 AM – 4 PM) or half-day options. Activities: gymnastics, sports, games, arts & crafts. Lunch & snacks included for full-day. From HK$2,000/week.`,
                ['Register for camp', 'Camp schedule', 'Sibling discount'],
                'program_info'
            );
        }

        // 16) BIRTHDAY PARTIES
        if (/birthday|party|parties/.test(lower)) {
            return this.buildResponse(
                "🎂 **Birthday parties** at ProActiv are unforgettable! 1.5-hour sessions include exclusive facility use, dedicated coach-led activities (gymnastics circuit, games, obstacle courses), party setup, decoration and cleanup. Custom themes available. Packages from HK$3,500.",
                ['Book a party', 'Party packages', 'Contact us'],
                'program_info'
            );
        }

        // 17) AGE GROUPS
        if (/\b(age|old|child|kid|toddler|baby|young|teenager|teen)\b/.test(lower)) {
            const personalised = extractedAge
                ? `For age ${extractedAge}, ${this.recommendForAge(extractedAge)}`
                : "We welcome ages 2–18 across all programs:";
            return this.buildResponse(
                `${personalised}\n\n• **2–3:** Kinder Gym (parent-assisted)\n• **3–5:** Pre-school gymnastics & multi-sports\n• **6–12:** School-age programs (gym + multi-sports)\n• **13–18:** Teen, advanced & competitive gymnastics`,
                ['Book a trial', 'View programs', 'Pricing'],
                'program_info'
            );
        }

        // 18) GENERAL "PROGRAM / CLASS / COURSE" — broader fallback
        if (/\b(program|programme|class|course|offer|what.*do you|what.*you have|services?)\b/.test(lower)) {
            return this.buildResponse(
                "We offer four core programs for ages 2–18:\n\n🤸 **Gymnastics** — Kinder Gym to Competitive\n🏃 **Multi-Sports** — variety, ages 3–12\n🏕️ **Holiday Camps** — full-day during school breaks\n🎂 **Birthday Parties** — custom packages\n\nWhich one interests you most?",
                ['Gymnastics details', 'Multi-Sports details', 'Holiday camps'],
                'program_info'
            );
        }

        // 19) CONTACT / SUPPORT
        if (/\b(contact|phone|email|call|whatsapp|talk|human|staff|reach you|get in touch|reception)\b/.test(lower)) {
            return this.buildResponse(
                "📞 **Get in touch:**\n\n• **Email:** info@proactivsports.net\n• **Website:** proactivsports.net\n• **Visit:** Cyberport or Wan Chai, Mon–Sat\n\nFor the fastest reply, email us — we usually respond within a few hours.",
                ['Book a trial', 'Locations', 'Programs'],
                'support'
            );
        }

        // 20) GREETING
        if (/^\s*(hi|hello|hey|hii+|hola|namaste|good morning|good afternoon|good evening)\b/.test(lower)
            || /^thanks?\b|^thank you/.test(lower)) {
            const greet = lower.startsWith('thank') ? "You're very welcome! 😊" : "Hello! Welcome to ProActiv Fitness 👋";
            return this.buildResponse(
                `${greet} I can help you with programs (gymnastics, multi-sports, camps, parties), pricing, locations, schedules, and bookings. What would you like to know?`,
                ['Book a trial class', 'Tell me about programs', 'Pricing info'],
                'greeting'
            );
        }

        // 21) YES / NO short replies
        if (/^\s*(yes|yeah|yep|sure|ok|okay)\s*$/i.test(raw)) {
            return this.buildResponse(
                "Great! Tell me a bit more — what age is your child, and which program (gymnastics, multi-sports, camps, or birthday party) are you interested in?",
                ['Book a trial', 'Programs', 'Pricing'],
                'general'
            );
        }
        if (/^\s*(no|nope|nah)\s*$/i.test(raw)) {
            return this.buildResponse(
                "No problem! Is there something else I can help with — programs, pricing, locations, or perhaps a birthday party?",
                ['Programs', 'Pricing', 'Locations'],
                'general'
            );
        }

        // 22) THE catch-all — at least acknowledge what they typed instead of repeating the same line
        const snippet = raw.length > 60 ? raw.slice(0, 60) + '…' : raw;
        return this.buildResponse(
            `Hmm, I want to make sure I answer "${snippet}" correctly. I can help with **programs** (gymnastics, multi-sports, camps, birthday parties), **pricing**, **locations** (Cyberport / Wan Chai), **schedules**, **coaches**, and **bookings**. Could you rephrase or pick one of the topics below?`,
            ['Tell me about programs', 'Pricing info', 'Book a trial'],
            'general'
        );
    }

    private buildResponse(
        response: string,
        suggestions: string[],
        intent: string,
        bookingIntent: any = null,
    ): ChatResponse {
        return {
            response,
            suggestions,
            intent,
            bookingIntent,
            requiresHumanSupport: false,
            aiPowered: false,
        };
    }

    private recommendForAge(age: number): string {
        if (age <= 1) return "we typically recommend waiting until age 2 — but feel free to drop by and watch a Kinder Gym session.";
        if (age <= 5) return "we recommend our **Kinder Gym** program — parent-assisted, fun-first.";
        if (age <= 12) return "we recommend **School Gymnastics** or **Multi-Sports** — both are great fits.";
        if (age <= 18) return "we recommend our **Teen Gymnastics** track, with optional competitive pathway.";
        return "we focus on ages 2–18, but contact us — we may have adult open-gym sessions.";
    }
}
