import aiService from '@shared/services/ai.service';
import logger from '@shared/utils/logger.util';
import { v4 as uuidv4 } from 'uuid';
import AICommunicationModel from './model';

export class AICommunicationService {
  // ─── 1. Optimize Message for Multiple Channels ─────────────────
  async optimizeMessage(data: {
    tenantId: string;
    userId: string;
    originalMessage: string;
    targetAudience?: string;
    channels?: string[];
    tone?: string;
  }) {
    try {
      const prompt = {
        system: `You are an expert communication optimizer for fitness businesses. RESPOND ONLY with valid JSON: {
          "optimizedVersions": [{ "channel": "email|sms|push|whatsapp", "content": "string", "subject": "string", "reasoning": "string" }],
          "recommendedChannel": "string"
        }`,
        user: `Optimize this message for multiple communication channels.
Original message: "${data.originalMessage}"
Target audience: ${data.targetAudience || 'general members'}
Preferred channels: ${(data.channels || ['email', 'sms', 'push']).join(', ')}
Tone: ${data.tone || 'professional and motivating'}`,
      };

      const result = await aiService.jsonCompletion<{
        optimizedVersions: Array<{ channel: string; content: string; subject: string; reasoning: string }>;
        recommendedChannel: string;
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'ai-communication',
        temperature: 0.5,
      });

      const record = await AICommunicationModel.create({
        communicationId: uuidv4(),
        tenantId: data.tenantId,
        type: 'MESSAGE_OPTIMIZATION',
        userId: data.userId,
        messageOptimization: {
          originalMessage: data.originalMessage,
          optimizedVersions: result.optimizedVersions,
          recommendedChannel: result.recommendedChannel,
        },
      });

      logger.info(`AI Communication: Message optimized for ${result.optimizedVersions.length} channels`);

      return {
        communicationId: record.communicationId,
        originalMessage: data.originalMessage,
        optimizedVersions: result.optimizedVersions,
        recommendedChannel: result.recommendedChannel,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('AI Communication optimizeMessage failed:', error.message);
      return {
        communicationId: uuidv4(),
        originalMessage: data.originalMessage,
        optimizedVersions: [
          { channel: 'email', content: data.originalMessage, subject: 'Update from your fitness center', reasoning: 'Fallback: AI unavailable' },
          { channel: 'sms', content: data.originalMessage.substring(0, 160), subject: '', reasoning: 'Fallback: truncated for SMS' },
        ],
        recommendedChannel: 'email',
        aiPowered: false,
      };
    }
  }

  // ─── 2. Get Best Send Time ─────────────────────────────────────
  async getBestTime(userId: string, tenantId: string) {
    try {
      const prompt = {
        system: `You are an expert in communication timing optimization for fitness businesses. RESPOND ONLY with valid JSON: {
          "bestSendTimes": [{ "dayOfWeek": "string", "hour": 0, "openRate": 0.0 }],
          "reasoning": "string"
        }`,
        user: `Analyze and determine the best times to send communications to user ${userId} in tenant ${tenantId}. Consider typical fitness member engagement patterns including morning motivation, post-work hours, and weekend activity windows.`,
      };

      const result = await aiService.jsonCompletion<{
        bestSendTimes: Array<{ dayOfWeek: string; hour: number; openRate: number }>;
        reasoning: string;
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'ai-communication',
        temperature: 0.5,
      });

      const record = await AICommunicationModel.create({
        communicationId: uuidv4(),
        tenantId,
        type: 'TIMING',
        userId,
        timingAnalysis: {
          bestSendTimes: result.bestSendTimes,
          reasoning: result.reasoning,
        },
      });

      logger.info(`AI Communication: Best time analysis completed for user ${userId}`);

      return {
        communicationId: record.communicationId,
        bestSendTimes: result.bestSendTimes,
        reasoning: result.reasoning,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('AI Communication getBestTime failed:', error.message);
      return {
        communicationId: uuidv4(),
        bestSendTimes: [
          { dayOfWeek: 'Monday', hour: 8, openRate: 0.45 },
          { dayOfWeek: 'Wednesday', hour: 17, openRate: 0.42 },
          { dayOfWeek: 'Saturday', hour: 9, openRate: 0.50 },
        ],
        reasoning: 'Fallback: Default optimal fitness communication times based on industry averages.',
        aiPowered: false,
      };
    }
  }

  // ─── 3. Create A/B Test Variants ───────────────────────────────
  async createABTest(data: {
    tenantId: string;
    userId?: string;
    campaignName: string;
    baseMessage: string;
    goal: string;
    variantCount?: number;
  }) {
    try {
      const prompt = {
        system: `You are an A/B testing expert for fitness marketing communications. RESPOND ONLY with valid JSON: {
          "variants": [{ "name": "string", "content": "string", "predictedPerformance": 0.0 }],
          "recommendedVariant": "string",
          "duration": "string"
        }`,
        user: `Create A/B test variants for this fitness campaign.
Campaign: "${data.campaignName}"
Base message: "${data.baseMessage}"
Goal: ${data.goal}
Number of variants: ${data.variantCount || 3}`,
      };

      const result = await aiService.jsonCompletion<{
        variants: Array<{ name: string; content: string; predictedPerformance: number }>;
        recommendedVariant: string;
        duration: string;
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'ai-communication',
        temperature: 0.7,
      });

      const record = await AICommunicationModel.create({
        communicationId: uuidv4(),
        tenantId: data.tenantId,
        type: 'AB_TEST',
        userId: data.userId,
        abTest: {
          variants: result.variants,
          recommendedVariant: result.recommendedVariant,
          duration: result.duration,
        },
      });

      logger.info(`AI Communication: A/B test created with ${result.variants.length} variants`);

      return {
        communicationId: record.communicationId,
        variants: result.variants,
        recommendedVariant: result.recommendedVariant,
        duration: result.duration,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('AI Communication createABTest failed:', error.message);
      return {
        communicationId: uuidv4(),
        variants: [
          { name: 'Variant A - Original', content: data.baseMessage, predictedPerformance: 0.35 },
          { name: 'Variant B - Urgent', content: `Don't miss out! ${data.baseMessage}`, predictedPerformance: 0.40 },
        ],
        recommendedVariant: 'Variant B - Urgent',
        duration: '7 days',
        aiPowered: false,
      };
    }
  }

  // ─── 4. Get Engagement Score ───────────────────────────────────
  async getEngagementScore(userId: string, tenantId: string) {
    try {
      const prompt = {
        system: `You are a member engagement analytics expert for fitness businesses. RESPOND ONLY with valid JSON: {
          "score": 0,
          "breakdown": { "emailEngagement": 0, "smsEngagement": 0, "pushEngagement": 0, "appUsage": 0 },
          "trend": "string",
          "recommendations": ["string"]
        }`,
        user: `Calculate the communication engagement score for user ${userId} in tenant ${tenantId}. Provide a comprehensive breakdown across all channels and actionable recommendations to improve engagement.`,
      };

      const result = await aiService.jsonCompletion<{
        score: number;
        breakdown: { emailEngagement: number; smsEngagement: number; pushEngagement: number; appUsage: number };
        trend: string;
        recommendations: string[];
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'ai-communication',
        temperature: 0.5,
      });

      const record = await AICommunicationModel.create({
        communicationId: uuidv4(),
        tenantId,
        type: 'ENGAGEMENT_SCORE',
        userId,
        engagementScore: {
          score: result.score,
          breakdown: result.breakdown,
          trend: result.trend,
          recommendations: result.recommendations,
        },
      });

      logger.info(`AI Communication: Engagement score ${result.score} for user ${userId}`);

      return {
        communicationId: record.communicationId,
        score: result.score,
        breakdown: result.breakdown,
        trend: result.trend,
        recommendations: result.recommendations,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('AI Communication getEngagementScore failed:', error.message);
      return {
        communicationId: uuidv4(),
        score: 50,
        breakdown: { emailEngagement: 55, smsEngagement: 45, pushEngagement: 40, appUsage: 60 },
        trend: 'stable',
        recommendations: [
          'Increase personalization in email communications',
          'Optimize push notification frequency',
          'Encourage app usage through in-app rewards',
        ],
        aiPowered: false,
      };
    }
  }

  // ─── 5. Predict Campaign Performance ───────────────────────────
  async predictCampaign(data: {
    tenantId: string;
    campaignType: string;
    targetAudience: string;
    channel: string;
    messagePreview: string;
    scheduledTime?: string;
  }) {
    try {
      const prompt = {
        system: `You are a campaign performance prediction expert for fitness businesses. RESPOND ONLY with valid JSON: {
          "expectedOpenRate": 0.0,
          "expectedClickRate": 0.0,
          "expectedConversion": 0.0,
          "confidence": 0.0,
          "recommendations": ["string"]
        }`,
        user: `Predict the performance of this fitness campaign.
Campaign type: ${data.campaignType}
Target audience: ${data.targetAudience}
Channel: ${data.channel}
Message preview: "${data.messagePreview}"
Scheduled time: ${data.scheduledTime || 'not specified'}`,
      };

      const result = await aiService.jsonCompletion<{
        expectedOpenRate: number;
        expectedClickRate: number;
        expectedConversion: number;
        confidence: number;
        recommendations: string[];
      }>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        module: 'ai-communication',
        temperature: 0.5,
      });

      const record = await AICommunicationModel.create({
        communicationId: uuidv4(),
        tenantId: data.tenantId,
        type: 'CAMPAIGN_PREDICTION',
        campaignPrediction: {
          expectedOpenRate: result.expectedOpenRate,
          expectedClickRate: result.expectedClickRate,
          expectedConversion: result.expectedConversion,
          confidence: result.confidence,
          recommendations: result.recommendations,
        },
      });

      logger.info(`AI Communication: Campaign prediction - open rate ${result.expectedOpenRate}%`);

      return {
        communicationId: record.communicationId,
        expectedOpenRate: result.expectedOpenRate,
        expectedClickRate: result.expectedClickRate,
        expectedConversion: result.expectedConversion,
        confidence: result.confidence,
        recommendations: result.recommendations,
        aiPowered: true,
      };
    } catch (error: any) {
      logger.error('AI Communication predictCampaign failed:', error.message);
      return {
        communicationId: uuidv4(),
        expectedOpenRate: 25.0,
        expectedClickRate: 3.5,
        expectedConversion: 1.2,
        confidence: 0.3,
        recommendations: [
          'Consider A/B testing subject lines',
          'Segment audience for better targeting',
          'Schedule during peak engagement hours',
        ],
        aiPowered: false,
      };
    }
  }
}

export default new AICommunicationService();
