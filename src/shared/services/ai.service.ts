import OpenAI from 'openai';
import EnvConfig from '@config/env.config';
import logger from '@shared/utils/logger.util';
import { AppError } from '@middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';

// ─── Interfaces ────────────────────────────────────────────────

export interface AIChatOptions {
    systemPrompt: string;
    userPrompt: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'text' | 'json_object';
    module: string;
}

export interface AIChatResponse {
    content: string;
    usage: { promptTokens: number; completionTokens: number; totalTokens: number };
    model: string;
    latencyMs: number;
}

// ─── Mock fallback responses ───────────────────────────────────

const FALLBACK_RESPONSES: Record<string, any> = {
    'ai-coach': {
        recommendations: [
            { skill: 'Balance', level: 'intermediate', suggestion: 'Practice single-leg stands for 30 seconds daily', priority: 1 },
            { skill: 'Flexibility', level: 'beginner', suggestion: 'Increase stretching routine to 15 minutes', priority: 2 },
        ],
    },
    'ai-chatbot': {
        response: "I'm your ProActiv Fitness assistant! I can help you with program information, booking trial classes, locations, and pricing. What would you like to know?",
        suggestions: ['Tell me about programs', 'Book a trial class', 'What are your locations?', 'Pricing information'],
        intent: 'general',
        bookingIntent: null,
        requiresHumanSupport: false,
    },
    'ai-coach-assistant': {
        posture: 'Good',
        alignment: 'Needs improvement',
        movement: 'Smooth',
        issues: ['Slight forward lean during landing'],
        overallAssessment: 'Good form with minor corrections needed',
    },
    'smart-nutrition': {
        meals: [{ day: 1, breakfast: 'Oatmeal with fruits', lunch: 'Grilled chicken with rice', dinner: 'Salmon with vegetables', snacks: ['Protein bar'] }],
        macros: { protein: 80, carbs: 200, fats: 60 },
    },
    'advanced-analytics': {
        studentRetention: 85,
        enrollmentGrowth: 12,
        revenueProjection: 150000,
        churnRisk: 15,
        confidence: 75,
        reasoning: 'Based on historical patterns (AI unavailable - using estimates)',
    },
    'capacity-optimizer': {
        recommendations: [{ action: 'MONITOR', priority: 'medium', reason: 'AI analysis unavailable - manual review recommended' }],
    },
    'forecast-simulator': {
        insights: 'AI-powered forecasting is currently unavailable. Using base projections.',
        recommendations: ['Review historical data manually', 'Consider seasonal trends'],
    },
    'dynamic-pricing': {
        suggestedPrice: 100,
        demandMultiplier: 1.0,
        seasonalAdjustment: 0,
        peakPricing: false,
        reasoning: 'Default pricing (AI unavailable)',
    },
    'automation': {
        result: 'AI action executed with default behavior',
        success: true,
    },
    'advanced-search': {
        suggestions: [],
        interpretation: 'Search query processed without AI enhancement',
    },
    'ai-video-analysis': {
        formScore: 70,
        posture: 'Good',
        alignment: 'Adequate',
        movement: 'Smooth',
        issues: ['AI video analysis unavailable - manual review recommended'],
        overallAssessment: 'Video analysis unavailable. Please try again later.',
        safetyRisk: 'unknown',
    },
    'smart-scheduler': {
        predictions: [{ studentId: 'unknown', noShowProbability: 0.15, confidence: 50, factors: ['Insufficient data'] }],
        overallClassRisk: 'unknown',
        suggestedSlots: [],
        reasoning: 'AI scheduling unavailable - using default schedule',
    },
    'parent-ai-assistant': {
        summary: 'Progress report generation is temporarily unavailable.',
        highlights: [],
        recommendations: ['Please contact your coach for a manual update.'],
        answer: 'Unable to answer your question right now. Please try again later.',
    },
    'revenue-intelligence': {
        riskScore: 0,
        riskLevel: 'unknown',
        factors: [],
        retentionActions: ['Manual review recommended - AI unavailable'],
        predictedLtv: 0,
        confidence: 0,
    },
    'ai-content-engine': {
        title: 'Content generation unavailable',
        body: 'AI content generation is temporarily unavailable. Please try again later.',
        hashtags: [],
        callToAction: '',
    },
    'workflow-orchestrator': {
        healthScore: 0,
        bottlenecks: [],
        recommendations: ['AI workflow analysis unavailable'],
        status: 'unknown',
    },
    'smart-support': {
        category: 'GENERAL',
        priority: 'MEDIUM',
        confidence: 0,
        response: 'AI support assistant unavailable. A human agent will review your ticket shortly.',
        sentiment: { score: 0, label: 'neutral' },
    },
    'ai-safety-monitor': {
        overall: 0,
        categories: [],
        trend: 'unknown',
        recommendations: ['AI safety analysis unavailable - conduct manual review'],
        overallRisk: 'unknown',
    },
    'ai-communication': {
        recommendedChannel: 'email',
        optimizedVersions: [],
        score: 50,
        reasoning: 'AI communication analysis unavailable',
    },
    'student-digital-twin': {
        aggregatedSkills: [],
        strengthAreas: [],
        developmentAreas: [],
        learningStyle: 'unknown',
        overallScore: 0,
        message: 'Digital twin analysis unavailable',
    },
    'ai-gamification-engine': {
        challenges: [{ title: 'Daily Attendance', description: 'Attend today\'s class', type: 'daily', difficulty: 1, xpReward: 10 }],
        riskLevel: 'unknown',
        intervention: 'AI gamification unavailable - using default challenges',
    },
    'global-intelligence': {
        locations: [],
        insights: 'Global intelligence unavailable - AI analysis not accessible',
        opportunities: [],
        recommendations: ['Conduct manual cross-location review'],
    },
};

// ─── Provider Resolution ───────────────────────────────────────

type ProviderName = 'gemini' | 'groq' | 'openai';

interface ResolvedProvider {
    name: ProviderName;
    apiKey: string;
    baseURL?: string;
    model: string;
}

// ─── AI Service Singleton ──────────────────────────────────────

class AIService {
    private static instance: AIService;
    private client: OpenAI | null = null;
    private provider: ResolvedProvider | null = null;
    private config = EnvConfig.get();
    private requestCount = 0;
    private requestWindowStart = Date.now();

    private constructor() {
        if (!this.config.enableAi) {
            logger.warn('⚠️ AI Service running in fallback mode (ENABLE_AI=false)');
            return;
        }

        this.provider = this.resolveProvider();

        if (!this.provider) {
            logger.warn('⚠️ AI Service running in fallback mode (no provider key found — set GEMINI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY)');
            return;
        }

        this.client = new OpenAI({
            apiKey: this.provider.apiKey,
            baseURL: this.provider.baseURL,
        });

        logger.info(`🤖 AI Service initialized with provider="${this.provider.name}" model="${this.provider.model}"`);
    }

    private resolveProvider(): ResolvedProvider | null {
        const requested = this.config.aiProvider;
        const candidates: ProviderName[] =
            requested === 'auto' || !requested
                ? ['gemini', 'groq', 'openai']
                : [requested];

        for (const name of candidates) {
            const built = this.buildProvider(name);
            if (built) return built;
        }
        return null;
    }

    private buildProvider(name: ProviderName): ResolvedProvider | null {
        if (name === 'gemini' && this.config.geminiApiKey) {
            return {
                name: 'gemini',
                apiKey: this.config.geminiApiKey,
                baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
                model: this.config.geminiModel,
            };
        }
        if (name === 'groq' && this.config.groqApiKey) {
            return {
                name: 'groq',
                apiKey: this.config.groqApiKey,
                baseURL: 'https://api.groq.com/openai/v1',
                model: this.config.groqModel,
            };
        }
        if (name === 'openai' && this.config.openaiApiKey) {
            return {
                name: 'openai',
                apiKey: this.config.openaiApiKey,
                model: this.config.openaiModel,
            };
        }
        return null;
    }

    static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    // ─── Retry on transient errors (429, 503) ──────────────────

    private async callWithRetry(
        params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
        moduleId: string,
        maxAttempts = 4
    ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
        let lastError: any;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await this.client!.chat.completions.create(params);
            } catch (err: any) {
                lastError = err;
                const status = err?.status;
                const isTransient = status === 429 || status === 503;
                if (!isTransient || attempt === maxAttempts) throw err;
                // Gemini free tier has a 60s RPM window — short waits don't recover from 429.
                // Use 6s/12s/24s on 429 so a burst of dashboard calls smooths over the window
                // instead of collapsing to canned fallbacks.
                const base = status === 429 ? 6000 : 1000;
                const delayMs = base * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 500);
                logger.warn(`🤖 AI [${moduleId}] transient error ${status} (attempt ${attempt}/${maxAttempts}) — retrying in ${delayMs}ms`);
                await new Promise(r => setTimeout(r, delayMs));
            }
        }
        throw lastError;
    }

    // ─── Rate Limiting ─────────────────────────────────────────

    private checkRateLimit(): void {
        const now = Date.now();
        const windowMs = 60 * 1000; // 1 minute

        if (now - this.requestWindowStart > windowMs) {
            this.requestCount = 0;
            this.requestWindowStart = now;
        }

        if (this.requestCount >= this.config.openaiRateLimitPerMinute) {
            throw new AppError('AI rate limit exceeded. Please try again later.', HTTP_STATUS.TOO_MANY_REQUESTS);
        }

        this.requestCount++;
    }

    // ─── Core: Chat Completion ─────────────────────────────────

    async chatCompletion(options: AIChatOptions): Promise<AIChatResponse> {
        if (!this.client || !this.config.enableAi || !this.provider) {
            return this.getFallbackResponse(options);
        }

        this.checkRateLimit();

        const startTime = Date.now();
        const model = options.model || this.provider.model;
        const temperature = options.temperature ?? this.config.openaiTemperature;
        const maxTokens = options.maxTokens || this.config.openaiMaxTokens;

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            { role: 'system', content: options.systemPrompt },
        ];

        if (options.conversationHistory) {
            for (const msg of options.conversationHistory) {
                messages.push({ role: msg.role, content: msg.content });
            }
        }

        messages.push({ role: 'user', content: options.userPrompt });

        try {
            const params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
                model,
                messages,
                temperature,
                max_tokens: maxTokens,
            };

            if (options.responseFormat === 'json_object') {
                params.response_format = { type: 'json_object' };
            }

            // Retry on 429 (rate limit) and 503 (service unavailable) with
            // exponential backoff. Gemini 2.5 free tier is 10 RPM, so a brief
            // wait recovers without falling back to canned data.
            const response = await this.callWithRetry(params, options.module);
            const latencyMs = Date.now() - startTime;

            const result: AIChatResponse = {
                content: response.choices[0]?.message?.content || '',
                usage: {
                    promptTokens: response.usage?.prompt_tokens || 0,
                    completionTokens: response.usage?.completion_tokens || 0,
                    totalTokens: response.usage?.total_tokens || 0,
                },
                model: response.model,
                latencyMs,
            };

            logger.info(`🤖 AI [${options.module}] completed in ${latencyMs}ms | Tokens: ${result.usage.totalTokens} | Model: ${model}`);

            return result;
        } catch (error: any) {
            const latencyMs = Date.now() - startTime;
            logger.error(`🤖 AI [${options.module}] failed after ${latencyMs}ms:`, {
                error: error.message,
                status: error.status,
                module: options.module,
            });

            if (error.status === 401) {
                const providerName = this.provider?.name ?? 'unknown';
                logger.error(`🤖 AI [${options.module}] authentication failed for provider="${providerName}" — check API key in .env`);
                return this.getFallbackResponse(options);
            }
            if (error.status === 400) {
                throw new AppError(`AI service bad request: ${error.message}`, HTTP_STATUS.BAD_REQUEST);
            }

            // For 429 and other errors, return fallback
            logger.warn(`🤖 AI [${options.module}] falling back to default response (${error.status || 'unknown'})`);
            return this.getFallbackResponse(options);
        }
    }

    // ─── JSON Completion (parsed) ──────────────────────────────

    async jsonCompletion<T = any>(options: AIChatOptions): Promise<T> {
        const response = await this.chatCompletion({
            ...options,
            responseFormat: 'json_object',
        });

        const cleaned = this.extractJson(response.content);

        try {
            return JSON.parse(cleaned) as T;
        } catch {
            logger.error(`🤖 AI [${options.module}] JSON parse failed, raw content: ${response.content.substring(0, 300)}`);
            // Fall back to the canned response for this module rather than 500-ing the request,
            // so callers still receive a structured payload they can persist/render.
            const fallback = FALLBACK_RESPONSES[options.module];
            if (fallback) return fallback as T;
            throw new AppError('AI returned invalid JSON response', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }

    // Strips markdown code fences and prose around JSON (Gemini sometimes
    // wraps `json_object` mode output in ```json ... ``` despite the request).
    private extractJson(raw: string): string {
        if (!raw) return '{}';
        let s = raw.trim();
        // Remove ```json ... ``` or ``` ... ``` fences
        const fence = s.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
        if (fence) s = fence[1].trim();
        // If still not valid, find first { ... last } — anything between is the JSON body
        if (!(s.startsWith('{') || s.startsWith('['))) {
            const firstBrace = s.search(/[\{\[]/);
            const lastBrace = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'));
            if (firstBrace !== -1 && lastBrace > firstBrace) {
                s = s.slice(firstBrace, lastBrace + 1);
            }
        }
        return s;
    }

    // ─── Fallback Response ─────────────────────────────────────
    // jsonCompletion / responseFormat='json_object' callers parse `content`
    // back into an object → must be a JSON string. Plain chatCompletion
    // callers render `content` directly to the UI → must be readable text.

    private getFallbackResponse(options: AIChatOptions): AIChatResponse {
        const fallback = FALLBACK_RESPONSES[options.module] || { message: 'AI service is not available' };
        const wantsJson = options.responseFormat === 'json_object';

        return {
            content: wantsJson ? JSON.stringify(fallback) : this.fallbackToReadableText(fallback),
            usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            model: 'fallback',
            latencyMs: 0,
        };
    }

    private fallbackToReadableText(data: any): string {
        if (data == null) return 'AI service is currently unavailable.';
        if (typeof data === 'string') return data;

        const textFields = ['response', 'message', 'summary', 'answer', 'reasoning', 'overallAssessment', 'insights'];
        for (const field of textFields) {
            if (typeof data[field] === 'string' && data[field].trim()) return data[field];
        }

        const skip = new Set(['_id', '__v', 'createdAt', 'updatedAt']);
        const lines: string[] = [];
        for (const [key, val] of Object.entries(data)) {
            if (skip.has(key) || val == null || val === '') continue;
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
            if (Array.isArray(val)) {
                if (!val.length) continue;
                const items = val.slice(0, 3).map(v => typeof v === 'object' ? (v as any).title || (v as any).name || (v as any).suggestion || '' : String(v)).filter(Boolean);
                if (items.length) lines.push(`${label}: ${items.join(', ')}`);
            } else if (typeof val === 'object') {
                const inner = this.fallbackToReadableText(val);
                if (inner) lines.push(`${label}: ${inner}`);
            } else {
                lines.push(`${label}: ${val}`);
            }
        }
        return lines.length ? lines.join('\n') : 'AI service is currently unavailable.';
    }

    // ─── Utility ───────────────────────────────────────────────

    getFallbackData(module: string): any {
        return FALLBACK_RESPONSES[module] || {};
    }

    isEnabled(): boolean {
        return !!(this.client && this.config.enableAi);
    }

    estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }
}

export default AIService.getInstance();
