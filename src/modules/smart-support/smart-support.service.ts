import { SmartSupportModel } from './smart-support.model';
import { v4 as uuidv4 } from 'uuid';
import aiService from '@shared/services/ai.service';
import logger from '@shared/utils/logger.util';

export class SmartSupportService {
    // ─── Classify Ticket ─────────────────────────────────────────
    async classifyTicket(data: any) {
        const { tenantId, ticketRef, subject, message, memberHistory } = data;

        try {
            const prompt = {
                system: `You are an expert support ticket classifier for fitness businesses. RESPOND ONLY with valid JSON: { "category": "BILLING|SCHEDULING|TECHNICAL|FEEDBACK|SAFETY|ENROLLMENT|GENERAL", "priority": "LOW|MEDIUM|HIGH|URGENT", "confidence": number (0-100), "reasoning": "string", "suggestedTags": ["string"], "escalationNeeded": boolean }`,
                user: `Classify this fitness business support ticket.
Subject: ${subject}
Message: ${message}
Ticket Reference: ${ticketRef || 'N/A'}
Member History: ${memberHistory ? JSON.stringify(memberHistory) : 'No history available'}
Determine the category, priority level, and confidence score.`,
            };

            const aiResult = await aiService.jsonCompletion<{
                category: string;
                priority: string;
                confidence: number;
                reasoning: string;
                suggestedTags: string[];
                escalationNeeded: boolean;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'smart-support',
                temperature: 0.3,
            });

            const record = await SmartSupportModel.create({
                supportId: uuidv4(),
                tenantId,
                originalTicketRef: ticketRef,
                classification: {
                    category: aiResult.category,
                    priority: aiResult.priority,
                    confidence: aiResult.confidence,
                },
            });

            logger.info(`Smart Support: Classified ticket ${ticketRef} as ${aiResult.category}/${aiResult.priority} (confidence: ${aiResult.confidence}%)`);

            return {
                supportId: record.supportId,
                ticketRef,
                classification: {
                    category: aiResult.category,
                    priority: aiResult.priority,
                    confidence: aiResult.confidence,
                },
                reasoning: aiResult.reasoning,
                suggestedTags: aiResult.suggestedTags,
                escalationNeeded: aiResult.escalationNeeded,
                classifiedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Smart Support classification failed for ticket ${ticketRef}:`, error.message);
            return {
                ticketRef,
                classification: {
                    category: 'GENERAL',
                    priority: 'MEDIUM',
                    confidence: 0,
                },
                reasoning: 'AI classification unavailable, defaulting to GENERAL/MEDIUM',
                suggestedTags: [],
                escalationNeeded: false,
                classifiedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Route Ticket ────────────────────────────────────────────
    async routeTicket(data: any) {
        const { tenantId, ticketRef, category, priority, subject, message, availableAgents } = data;

        try {
            const prompt = {
                system: `You are an expert support ticket routing system for fitness businesses. RESPOND ONLY with valid JSON: { "assignedAgentId": "string", "routingReason": "string", "alternativeAgents": ["string"], "estimatedResponseTime": "string", "specialInstructions": "string" }`,
                user: `Route this fitness support ticket to the best available agent.
Ticket Reference: ${ticketRef}
Category: ${category || 'GENERAL'}
Priority: ${priority || 'MEDIUM'}
Subject: ${subject}
Message: ${message}
Available Agents: ${JSON.stringify(availableAgents || [])}
Select the best agent and provide routing reasoning.`,
            };

            const aiResult = await aiService.jsonCompletion<{
                assignedAgentId: string;
                routingReason: string;
                alternativeAgents: string[];
                estimatedResponseTime: string;
                specialInstructions: string;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'smart-support',
                temperature: 0.3,
            });

            const record = await SmartSupportModel.findOneAndUpdate(
                { originalTicketRef: ticketRef, tenantId },
                {
                    $set: {
                        routing: {
                            assignedAgentId: aiResult.assignedAgentId,
                            routingReason: aiResult.routingReason,
                            alternativeAgents: aiResult.alternativeAgents,
                        },
                    },
                },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );

            if (!record?.supportId) {
                await SmartSupportModel.findByIdAndUpdate(record?._id, {
                    supportId: uuidv4(),
                    tenantId,
                    originalTicketRef: ticketRef,
                });
            }

            logger.info(`Smart Support: Routed ticket ${ticketRef} to agent ${aiResult.assignedAgentId}`);

            return {
                ticketRef,
                routing: {
                    assignedAgentId: aiResult.assignedAgentId,
                    routingReason: aiResult.routingReason,
                    alternativeAgents: aiResult.alternativeAgents,
                },
                estimatedResponseTime: aiResult.estimatedResponseTime,
                specialInstructions: aiResult.specialInstructions,
                routedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Smart Support routing failed for ticket ${ticketRef}:`, error.message);
            return {
                ticketRef,
                routing: {
                    assignedAgentId: availableAgents?.[0] || 'unassigned',
                    routingReason: 'AI routing unavailable, assigned to first available agent',
                    alternativeAgents: [],
                },
                estimatedResponseTime: 'Unknown',
                specialInstructions: 'Manual review recommended',
                routedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Suggest Response ────────────────────────────────────────
    async suggestResponse(ticketId: string) {
        try {
            const ticket = await SmartSupportModel.findOne({
                $or: [{ supportId: ticketId }, { originalTicketRef: ticketId }],
            }).lean();

            if (!ticket) {
                throw new Error(`Ticket ${ticketId} not found`);
            }

            const prompt = {
                system: `You are an expert customer support response writer for fitness businesses. RESPOND ONLY with valid JSON: { "response": "string", "tone": "string", "confidence": number (0-100), "alternativeResponses": [{ "response": "string", "tone": "string" }], "followUpActions": ["string"] }`,
                user: `Generate a suggested response for this fitness support ticket.
Ticket Reference: ${ticket.originalTicketRef}
Category: ${ticket.classification?.category || 'GENERAL'}
Priority: ${ticket.classification?.priority || 'MEDIUM'}
Sentiment: ${ticket.sentiment?.label || 'neutral'}
Write a helpful, professional response that addresses the likely concern.`,
            };

            const aiResult = await aiService.jsonCompletion<{
                response: string;
                tone: string;
                confidence: number;
                alternativeResponses: Array<{ response: string; tone: string }>;
                followUpActions: string[];
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'smart-support',
                temperature: 0.5,
            });

            await SmartSupportModel.updateOne(
                { _id: ticket._id },
                {
                    $set: {
                        suggestedResponse: {
                            response: aiResult.response,
                            tone: aiResult.tone,
                            confidence: aiResult.confidence,
                        },
                    },
                }
            );

            logger.info(`Smart Support: Generated response suggestion for ticket ${ticketId} (confidence: ${aiResult.confidence}%)`);

            return {
                ticketId,
                suggestedResponse: {
                    response: aiResult.response,
                    tone: aiResult.tone,
                    confidence: aiResult.confidence,
                },
                alternativeResponses: aiResult.alternativeResponses,
                followUpActions: aiResult.followUpActions,
                generatedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Smart Support response suggestion failed for ticket ${ticketId}:`, error.message);
            return {
                ticketId,
                suggestedResponse: {
                    response: 'Thank you for reaching out. We have received your inquiry and a team member will respond shortly.',
                    tone: 'professional',
                    confidence: 0,
                },
                alternativeResponses: [],
                followUpActions: ['Manual review required'],
                generatedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Analyze Sentiment ───────────────────────────────────────
    async analyzeSentiment(data: any) {
        const { tenantId, ticketRef, message } = data;

        try {
            const prompt = {
                system: `You are an expert sentiment analysis engine for fitness business customer support. RESPOND ONLY with valid JSON: { "score": number (-1 to 1), "label": "very_negative|negative|neutral|positive|very_positive", "keyPhrases": ["string"], "emotionalTone": "string", "urgencyIndicators": ["string"], "customerSatisfactionEstimate": number (0-100) }`,
                user: `Analyze the sentiment of this customer support message from a fitness business member.
Message: ${message}
Ticket Reference: ${ticketRef || 'N/A'}
Provide detailed sentiment analysis with key phrases and urgency indicators.`,
            };

            const aiResult = await aiService.jsonCompletion<{
                score: number;
                label: string;
                keyPhrases: string[];
                emotionalTone: string;
                urgencyIndicators: string[];
                customerSatisfactionEstimate: number;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'smart-support',
                temperature: 0.3,
            });

            const updateResult = await SmartSupportModel.findOneAndUpdate(
                { originalTicketRef: ticketRef, tenantId },
                {
                    $set: {
                        sentiment: {
                            score: aiResult.score,
                            label: aiResult.label,
                            keyPhrases: aiResult.keyPhrases,
                        },
                    },
                },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );

            if (!updateResult?.supportId) {
                await SmartSupportModel.findByIdAndUpdate(updateResult?._id, {
                    supportId: uuidv4(),
                    tenantId,
                    originalTicketRef: ticketRef,
                });
            }

            logger.info(`Smart Support: Sentiment analysis for ticket ${ticketRef} — ${aiResult.label} (score: ${aiResult.score})`);

            return {
                ticketRef,
                sentiment: {
                    score: aiResult.score,
                    label: aiResult.label,
                    keyPhrases: aiResult.keyPhrases,
                },
                emotionalTone: aiResult.emotionalTone,
                urgencyIndicators: aiResult.urgencyIndicators,
                customerSatisfactionEstimate: aiResult.customerSatisfactionEstimate,
                analyzedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Smart Support sentiment analysis failed:`, error.message);
            return {
                ticketRef,
                sentiment: {
                    score: 0,
                    label: 'neutral',
                    keyPhrases: [],
                },
                emotionalTone: 'unknown',
                urgencyIndicators: [],
                customerSatisfactionEstimate: 50,
                analyzedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Auto-Resolve Ticket ─────────────────────────────────────
    async autoResolve(data: any) {
        const { tenantId, ticketRef, subject, message, category } = data;

        try {
            const prompt = {
                system: `You are an expert auto-resolution system for fitness business support tickets. RESPOND ONLY with valid JSON: { "resolved": boolean, "resolution": "string", "confidence": number (0-100), "resolutionType": "string", "additionalInfo": "string", "requiresHumanReview": boolean }`,
                user: `Attempt to auto-resolve this fitness support ticket.
Subject: ${subject}
Message: ${message}
Category: ${category || 'GENERAL'}
Ticket Reference: ${ticketRef || 'N/A'}
Only resolve if you are confident (>80%) in the solution. Common resolutions include FAQ answers, account info, scheduling help, and billing inquiries.`,
            };

            const aiResult = await aiService.jsonCompletion<{
                resolved: boolean;
                resolution: string;
                confidence: number;
                resolutionType: string;
                additionalInfo: string;
                requiresHumanReview: boolean;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'smart-support',
                temperature: 0.3,
            });

            const isAutoResolved = aiResult.resolved && aiResult.confidence > 80;

            const record = await SmartSupportModel.findOneAndUpdate(
                { originalTicketRef: ticketRef, tenantId },
                {
                    $set: {
                        autoResolution: {
                            resolved: isAutoResolved,
                            resolution: aiResult.resolution,
                            confidence: aiResult.confidence,
                        },
                    },
                },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );

            if (!record?.supportId) {
                await SmartSupportModel.findByIdAndUpdate(record?._id, {
                    supportId: uuidv4(),
                    tenantId,
                    originalTicketRef: ticketRef,
                });
            }

            logger.info(`Smart Support: Auto-resolve attempt for ticket ${ticketRef} — resolved: ${isAutoResolved}, confidence: ${aiResult.confidence}%`);

            return {
                ticketRef,
                autoResolution: {
                    resolved: isAutoResolved,
                    resolution: aiResult.resolution,
                    confidence: aiResult.confidence,
                },
                resolutionType: aiResult.resolutionType,
                additionalInfo: aiResult.additionalInfo,
                requiresHumanReview: aiResult.requiresHumanReview || !isAutoResolved,
                resolvedAt: isAutoResolved ? new Date() : null,
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Smart Support auto-resolve failed for ticket ${ticketRef}:`, error.message);
            return {
                ticketRef,
                autoResolution: {
                    resolved: false,
                    resolution: 'Auto-resolution unavailable. Ticket requires manual review.',
                    confidence: 0,
                },
                resolutionType: 'MANUAL',
                additionalInfo: 'AI auto-resolution service temporarily unavailable',
                requiresHumanReview: true,
                resolvedAt: null,
                aiPowered: false,
            };
        }
    }
}
