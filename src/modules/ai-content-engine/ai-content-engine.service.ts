import { AIContentEngineModel } from './ai-content-engine.model';
import { v4 as uuidv4 } from 'uuid';
import aiService from '@shared/services/ai.service';
import logger from '@shared/utils/logger.util';

export class AIContentEngineService {
    // ─── Generate Social Media Post ──────────────────────────────
    async generateSocialPost(data: any) {
        const { tenantId, topic, targetAudience, tone, platform } = data;

        try {
            const prompt = {
                system: `You are an expert fitness social media content creator. RESPOND ONLY with valid JSON: { "title": "string", "body": "string", "hashtags": ["string"], "callToAction": "string", "mediaSuggestions": ["string"], "platform": "string", "bestPostingTime": "string" }`,
                user: `Create a compelling social media post for a fitness business.
Topic: ${topic}
Target Audience: ${targetAudience}
Tone: ${tone || 'motivational'}
Platform: ${platform || 'Instagram'}
Generate engaging content with relevant hashtags and media suggestions.`,
            };

            const aiResult = await aiService.jsonCompletion<{
                title: string;
                body: string;
                hashtags: string[];
                callToAction: string;
                mediaSuggestions: string[];
                platform: string;
                bestPostingTime: string;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-content-engine',
                temperature: 0.7,
            });

            const record = await AIContentEngineModel.create({
                contentId: uuidv4(),
                tenantId,
                type: 'SOCIAL_POST',
                topic,
                targetAudience,
                tone: tone || 'motivational',
                content: {
                    title: aiResult.title,
                    body: aiResult.body,
                    hashtags: aiResult.hashtags,
                    callToAction: aiResult.callToAction,
                    mediaSuggestions: aiResult.mediaSuggestions,
                },
                status: 'DRAFT',
            });

            logger.info(`AI Content Engine: Generated social post for tenant ${tenantId} — topic: ${topic}`);

            return {
                contentId: record.contentId,
                ...aiResult,
                status: 'DRAFT',
                generatedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`AI Content Engine social post generation failed:`, error.message);
            return {
                title: topic || 'Fitness Update',
                body: 'Stay active and keep pushing your limits!',
                hashtags: ['#fitness', '#health', '#motivation'],
                callToAction: 'Join us today!',
                mediaSuggestions: ['Use a high-quality workout photo'],
                generatedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Generate Email Campaign ─────────────────────────────────
    async generateEmail(data: any) {
        const { tenantId, topic, targetAudience, tone, campaignType } = data;

        try {
            const prompt = {
                system: `You are an expert email marketing specialist for fitness businesses. RESPOND ONLY with valid JSON: { "title": "string", "subjectLine": "string", "previewText": "string", "body": "string", "callToAction": "string", "segmentSuggestions": ["string"], "sendTimeSuggestion": "string" }`,
                user: `Create an email campaign for a fitness business.
Topic: ${topic}
Target Audience: ${targetAudience}
Tone: ${tone || 'professional'}
Campaign Type: ${campaignType || 'promotional'}
Write compelling email content with a strong subject line and CTA.`,
            };

            const aiResult = await aiService.jsonCompletion<{
                title: string;
                subjectLine: string;
                previewText: string;
                body: string;
                callToAction: string;
                segmentSuggestions: string[];
                sendTimeSuggestion: string;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-content-engine',
                temperature: 0.6,
            });

            const record = await AIContentEngineModel.create({
                contentId: uuidv4(),
                tenantId,
                type: 'EMAIL',
                topic,
                targetAudience,
                tone: tone || 'professional',
                content: {
                    title: aiResult.title,
                    body: aiResult.body,
                    hashtags: [],
                    callToAction: aiResult.callToAction,
                    mediaSuggestions: [],
                },
                status: 'DRAFT',
            });

            logger.info(`AI Content Engine: Generated email campaign for tenant ${tenantId} — topic: ${topic}`);

            return {
                contentId: record.contentId,
                ...aiResult,
                status: 'DRAFT',
                generatedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`AI Content Engine email generation failed:`, error.message);
            return {
                title: topic || 'Newsletter',
                subjectLine: 'Your Fitness Journey Update',
                previewText: 'Check out what is new at the gym...',
                body: 'We have exciting updates for you!',
                callToAction: 'Learn More',
                segmentSuggestions: ['All members'],
                sendTimeSuggestion: 'Tuesday 10:00 AM',
                generatedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Generate Fitness Article ────────────────────────────────
    async generateArticle(data: any) {
        const { tenantId, topic, targetAudience, tone, wordCount } = data;

        try {
            const prompt = {
                system: `You are an expert fitness content writer and health journalist. RESPOND ONLY with valid JSON: { "title": "string", "body": "string", "summary": "string", "headings": ["string"], "keywords": ["string"], "metaDescription": "string", "callToAction": "string", "mediaSuggestions": ["string"] }`,
                user: `Write a comprehensive fitness article.
Topic: ${topic}
Target Audience: ${targetAudience}
Tone: ${tone || 'informative'}
Approximate Word Count: ${wordCount || 1500}
Include proper structure with headings, SEO keywords, and actionable advice.`,
            };

            const aiResult = await aiService.jsonCompletion<{
                title: string;
                body: string;
                summary: string;
                headings: string[];
                keywords: string[];
                metaDescription: string;
                callToAction: string;
                mediaSuggestions: string[];
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-content-engine',
                temperature: 0.6,
                maxTokens: 3000,
            });

            const record = await AIContentEngineModel.create({
                contentId: uuidv4(),
                tenantId,
                type: 'ARTICLE',
                topic,
                targetAudience,
                tone: tone || 'informative',
                content: {
                    title: aiResult.title,
                    body: aiResult.body,
                    hashtags: [],
                    callToAction: aiResult.callToAction,
                    mediaSuggestions: aiResult.mediaSuggestions,
                },
                seoData: {
                    keywords: aiResult.keywords,
                    metaDescription: aiResult.metaDescription,
                    headings: aiResult.headings,
                    suggestions: [],
                },
                status: 'DRAFT',
            });

            logger.info(`AI Content Engine: Generated article for tenant ${tenantId} — topic: ${topic}`);

            return {
                contentId: record.contentId,
                ...aiResult,
                status: 'DRAFT',
                generatedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`AI Content Engine article generation failed:`, error.message);
            return {
                title: topic || 'Fitness Article',
                body: 'Article content could not be generated at this time.',
                summary: 'Please try again later.',
                headings: [],
                keywords: [],
                metaDescription: '',
                callToAction: 'Contact us for more information',
                mediaSuggestions: [],
                generatedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Generate Ad Copy ────────────────────────────────────────
    async generateAdCopy(data: any) {
        const { tenantId, topic, targetAudience, tone, adPlatform, budget } = data;

        try {
            const prompt = {
                system: `You are an expert fitness advertising copywriter. RESPOND ONLY with valid JSON: { "title": "string", "headline": "string", "body": "string", "callToAction": "string", "variations": [{ "headline": "string", "body": "string", "callToAction": "string" }], "targetingRecommendations": ["string"], "mediaSuggestions": ["string"] }`,
                user: `Create ad copy for a fitness business.
Topic: ${topic}
Target Audience: ${targetAudience}
Tone: ${tone || 'persuasive'}
Ad Platform: ${adPlatform || 'Facebook Ads'}
Budget Range: ${budget || 'moderate'}
Generate multiple variations with targeting recommendations.`,
            };

            const aiResult = await aiService.jsonCompletion<{
                title: string;
                headline: string;
                body: string;
                callToAction: string;
                variations: Array<{ headline: string; body: string; callToAction: string }>;
                targetingRecommendations: string[];
                mediaSuggestions: string[];
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-content-engine',
                temperature: 0.7,
            });

            const record = await AIContentEngineModel.create({
                contentId: uuidv4(),
                tenantId,
                type: 'AD_COPY',
                topic,
                targetAudience,
                tone: tone || 'persuasive',
                content: {
                    title: aiResult.title,
                    body: aiResult.body,
                    hashtags: [],
                    callToAction: aiResult.callToAction,
                    mediaSuggestions: aiResult.mediaSuggestions,
                },
                status: 'DRAFT',
            });

            logger.info(`AI Content Engine: Generated ad copy for tenant ${tenantId} — platform: ${adPlatform || 'Facebook Ads'}`);

            return {
                contentId: record.contentId,
                ...aiResult,
                status: 'DRAFT',
                generatedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`AI Content Engine ad copy generation failed:`, error.message);
            return {
                title: topic || 'Fitness Ad',
                headline: 'Transform Your Fitness Journey Today',
                body: 'Join our community and achieve your fitness goals.',
                callToAction: 'Sign Up Now',
                variations: [],
                targetingRecommendations: ['Target fitness enthusiasts aged 25-45'],
                mediaSuggestions: ['Use before/after transformation images'],
                generatedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Get SEO Suggestions ─────────────────────────────────────
    async getSeoSuggestions(pageId: string, tenantId: string) {
        try {
            const existingContent = await AIContentEngineModel.find({
                tenantId,
                type: { $in: ['ARTICLE', 'SEO'] },
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            const prompt = {
                system: `You are an expert SEO analyst for fitness websites. RESPOND ONLY with valid JSON: { "keywords": ["string"], "metaDescription": "string", "headings": ["string"], "suggestions": ["string"], "competitorKeywords": ["string"], "contentGaps": ["string"], "technicalSeoTips": ["string"], "overallScore": number }`,
                user: `Analyze and provide SEO suggestions for a fitness website page.
Page ID: ${pageId}
Tenant ID: ${tenantId}
Existing Content Topics: ${existingContent.map(c => c.topic).join(', ') || 'None'}
Provide comprehensive SEO recommendations including keyword strategy, meta descriptions, heading structure, and technical tips.`,
            };

            const aiResult = await aiService.jsonCompletion<{
                keywords: string[];
                metaDescription: string;
                headings: string[];
                suggestions: string[];
                competitorKeywords: string[];
                contentGaps: string[];
                technicalSeoTips: string[];
                overallScore: number;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'ai-content-engine',
                temperature: 0.5,
            });

            const record = await AIContentEngineModel.create({
                contentId: uuidv4(),
                tenantId,
                type: 'SEO',
                topic: `SEO Analysis for page ${pageId}`,
                seoData: {
                    keywords: aiResult.keywords,
                    metaDescription: aiResult.metaDescription,
                    headings: aiResult.headings,
                    suggestions: aiResult.suggestions,
                },
                status: 'DRAFT',
            });

            logger.info(`AI Content Engine: Generated SEO suggestions for page ${pageId}, tenant ${tenantId}`);

            return {
                contentId: record.contentId,
                pageId,
                ...aiResult,
                analyzedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`AI Content Engine SEO analysis failed for page ${pageId}:`, error.message);
            return {
                pageId,
                keywords: ['fitness', 'gym', 'workout'],
                metaDescription: 'Discover the best fitness programs and gym services.',
                headings: [],
                suggestions: ['Add more keyword-rich content', 'Improve page load speed'],
                competitorKeywords: [],
                contentGaps: [],
                technicalSeoTips: ['Ensure mobile responsiveness'],
                overallScore: 0,
                analyzedAt: new Date(),
                aiPowered: false,
            };
        }
    }
}
