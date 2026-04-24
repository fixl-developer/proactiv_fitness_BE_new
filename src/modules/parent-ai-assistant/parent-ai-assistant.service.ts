import { ParentAIAssistantModel } from './parent-ai-assistant.model';
import { v4 as uuidv4 } from 'uuid';
import aiService from '@shared/services/ai.service';
import { AIPromptService } from '@shared/services/ai-prompt.service';
import logger from '@shared/utils/logger.util';

export class ParentAIAssistantService {
    // ─── Generate Progress Report ────────────────────────────────
    async generateReport(studentId: string, tenantId: string, period: string, parentId: string) {
        try {
            const previousReports = await ParentAIAssistantModel.find({
                studentId,
                tenantId,
                type: { $in: ['WEEKLY_REPORT', 'MONTHLY_REPORT'] },
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            const prompt = {
                system: `You are an AI assistant for parents of students at a fitness academy. Generate a clear, encouraging, and honest progress report. Use language appropriate for parents. Highlight positives while being transparent about areas needing improvement. RESPOND ONLY with valid JSON matching this schema: { "summary": string, "highlights": [string], "areasOfProgress": [{ "area": string, "progress": string, "trend": "improving" | "stable" | "needs-attention" }], "recommendations": [string], "parentActionItems": [string] }`,
                user: `Student ID: ${studentId}\nReport period: ${period}\nPrevious reports: ${JSON.stringify(previousReports.map(r => ({ summary: r.report?.summary, date: r.createdAt })))}`,
            };

            const aiResult = await aiService.jsonCompletion<{
                summary: string;
                highlights: string[];
                areasOfProgress: Array<{
                    area: string;
                    progress: string;
                    trend: string;
                }>;
                recommendations: string[];
                parentActionItems: string[];
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'parent-ai-assistant',
                temperature: 0.5,
            });

            const reportType = period === 'monthly' ? 'MONTHLY_REPORT' : 'WEEKLY_REPORT';
            const record = await ParentAIAssistantModel.create({
                reportId: uuidv4(),
                tenantId,
                parentId,
                studentId,
                type: reportType,
                report: {
                    summary: aiResult.summary,
                    highlights: aiResult.highlights,
                    areasOfProgress: aiResult.areasOfProgress,
                    recommendations: aiResult.recommendations,
                },
            });

            logger.info(`Parent AI Assistant: Generated ${reportType} for student ${studentId}`);

            return {
                reportId: record.reportId,
                studentId,
                period,
                summary: aiResult.summary,
                highlights: aiResult.highlights,
                areasOfProgress: aiResult.areasOfProgress,
                recommendations: aiResult.recommendations,
                parentActionItems: aiResult.parentActionItems,
                generatedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Parent AI Assistant report generation failed for student ${studentId}:`, error.message);
            return {
                studentId,
                period,
                summary: 'Report generation is temporarily unavailable. Please try again later.',
                highlights: [],
                areasOfProgress: [],
                recommendations: ['Please contact your coach directly for a progress update.'],
                parentActionItems: [],
                generatedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Parent Q&A ──────────────────────────────────────────────
    async askQuestion(data: any) {
        const { tenantId, parentId, studentId, question } = data;

        try {
            const previousQA = await ParentAIAssistantModel.find({
                parentId,
                tenantId,
                type: 'QA_RESPONSE',
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            const recentReports = await ParentAIAssistantModel.find({
                studentId,
                tenantId,
                type: { $in: ['WEEKLY_REPORT', 'MONTHLY_REPORT'] },
            })
                .sort({ createdAt: -1 })
                .limit(3)
                .lean();

            const prompt = {
                system: `You are a helpful AI assistant for parents of fitness academy students. Answer parent questions about their child's progress, schedule, and development in a warm, supportive tone. Use available context from recent reports. If you don't have specific data, say so honestly and suggest they contact the coach. RESPOND ONLY with valid JSON matching this schema: { "answer": string, "followUpSuggestions": [string], "relevantContext": string, "shouldEscalateToCoach": boolean }`,
                user: `Parent question: "${question}"\nStudent ID: ${studentId}\nPrevious Q&A: ${JSON.stringify(previousQA.map(q => ({ question: q.qaConversation?.question, answer: q.qaConversation?.answer })))}\nRecent report summaries: ${JSON.stringify(recentReports.map(r => r.report?.summary))}`,
            };

            const aiResult = await aiService.jsonCompletion<{
                answer: string;
                followUpSuggestions: string[];
                relevantContext: string;
                shouldEscalateToCoach: boolean;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'parent-ai-assistant',
                temperature: 0.5,
            });

            const record = await ParentAIAssistantModel.create({
                reportId: uuidv4(),
                tenantId,
                parentId,
                studentId,
                type: 'QA_RESPONSE',
                qaConversation: {
                    question,
                    answer: aiResult.answer,
                    followUpSuggestions: aiResult.followUpSuggestions,
                },
            });

            logger.info(`Parent AI Assistant: Answered question from parent ${parentId} about student ${studentId}`);

            return {
                reportId: record.reportId,
                question,
                answer: aiResult.answer,
                followUpSuggestions: aiResult.followUpSuggestions,
                shouldEscalateToCoach: aiResult.shouldEscalateToCoach,
                answeredAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Parent AI Assistant Q&A failed for parent ${parentId}:`, error.message);
            return {
                question,
                answer: 'I apologize, but I am unable to answer your question right now. Please contact your child\'s coach directly for assistance.',
                followUpSuggestions: [],
                shouldEscalateToCoach: true,
                answeredAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Detect and Get Milestones ───────────────────────────────
    async getMilestones(studentId: string, tenantId: string) {
        try {
            const existingMilestones = await ParentAIAssistantModel.find({
                studentId,
                tenantId,
                type: 'MILESTONE',
            })
                .sort({ createdAt: -1 })
                .lean();

            const recentReports = await ParentAIAssistantModel.find({
                studentId,
                tenantId,
                type: { $in: ['WEEKLY_REPORT', 'MONTHLY_REPORT'] },
            })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();

            const prompt = {
                system: `You are an AI milestone detection specialist for a youth fitness academy. Analyze student progress data and identify new milestones worth celebrating. Be encouraging and specific. RESPOND ONLY with valid JSON matching this schema: { "newMilestones": [{ "title": string, "description": string, "category": "fitness" | "skill" | "attendance" | "social" | "personal-best", "significance": "minor" | "major" | "exceptional" }], "upcomingMilestones": [{ "title": string, "description": string, "estimatedDate": string, "category": string }] }`,
                user: `Student ID: ${studentId}\nExisting milestones: ${JSON.stringify(existingMilestones.map(m => m.milestone?.title))}\nRecent report summaries: ${JSON.stringify(recentReports.map(r => ({ summary: r.report?.summary, highlights: r.report?.highlights, date: r.createdAt })))}`,
            };

            const aiResult = await aiService.jsonCompletion<{
                newMilestones: Array<{
                    title: string;
                    description: string;
                    category: string;
                    significance: string;
                }>;
                upcomingMilestones: Array<{
                    title: string;
                    description: string;
                    estimatedDate: string;
                    category: string;
                }>;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'parent-ai-assistant',
                temperature: 0.5,
            });

            // Save newly detected milestones
            const savedMilestones = [];
            for (const milestone of aiResult.newMilestones) {
                const record = await ParentAIAssistantModel.create({
                    reportId: uuidv4(),
                    tenantId,
                    parentId: '',
                    studentId,
                    type: 'MILESTONE',
                    milestone: {
                        title: milestone.title,
                        description: milestone.description,
                        achievedAt: new Date(),
                        category: milestone.category,
                    },
                });
                savedMilestones.push({ ...milestone, reportId: record.reportId });
            }

            logger.info(`Parent AI Assistant: Detected ${aiResult.newMilestones.length} new milestones for student ${studentId}`);

            return {
                studentId,
                existingMilestones: existingMilestones.map(m => m.milestone),
                newMilestones: savedMilestones,
                upcomingMilestones: aiResult.upcomingMilestones,
                detectedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Parent AI Assistant milestone detection failed for student ${studentId}:`, error.message);
            return {
                studentId,
                existingMilestones: [],
                newMilestones: [],
                upcomingMilestones: [],
                detectedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Generate Report Card ────────────────────────────────────
    async generateReportCard(studentId: string, tenantId: string, termId: string, parentId: string) {
        try {
            const termReports = await ParentAIAssistantModel.find({
                studentId,
                tenantId,
                type: { $in: ['WEEKLY_REPORT', 'MONTHLY_REPORT'] },
            })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

            const milestones = await ParentAIAssistantModel.find({
                studentId,
                tenantId,
                type: 'MILESTONE',
            })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();

            const prompt = {
                system: `You are an AI report card generator for a youth fitness academy. Create a comprehensive term-end report card summarizing the student's performance across all areas. Use a grading scale of A+ to F. Be fair, balanced, and constructive. RESPOND ONLY with valid JSON matching this schema: { "termName": string, "overallGrade": string, "categories": [{ "name": string, "grade": string, "comments": string }], "coachComments": string, "parentSummary": string, "nextTermGoals": [string] }`,
                user: `Student ID: ${studentId}\nTerm ID: ${termId}\nTerm reports: ${JSON.stringify(termReports.map(r => ({ summary: r.report?.summary, highlights: r.report?.highlights, progress: r.report?.areasOfProgress })))}\nMilestones achieved: ${JSON.stringify(milestones.map(m => m.milestone?.title))}`,
            };

            const aiResult = await aiService.jsonCompletion<{
                termName: string;
                overallGrade: string;
                categories: Array<{
                    name: string;
                    grade: string;
                    comments: string;
                }>;
                coachComments: string;
                parentSummary: string;
                nextTermGoals: string[];
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'parent-ai-assistant',
                temperature: 0.5,
            });

            const record = await ParentAIAssistantModel.create({
                reportId: uuidv4(),
                tenantId,
                parentId,
                studentId,
                type: 'REPORT_CARD',
                reportCard: {
                    termName: aiResult.termName,
                    overallGrade: aiResult.overallGrade,
                    categories: aiResult.categories,
                    coachComments: aiResult.coachComments,
                },
            });

            logger.info(`Parent AI Assistant: Generated report card for student ${studentId}, term ${termId} — grade ${aiResult.overallGrade}`);

            return {
                reportId: record.reportId,
                studentId,
                termId,
                termName: aiResult.termName,
                overallGrade: aiResult.overallGrade,
                categories: aiResult.categories,
                coachComments: aiResult.coachComments,
                parentSummary: aiResult.parentSummary,
                nextTermGoals: aiResult.nextTermGoals,
                generatedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Parent AI Assistant report card failed for student ${studentId}:`, error.message);
            return {
                studentId,
                termId,
                termName: 'Unknown Term',
                overallGrade: 'N/A',
                categories: [],
                coachComments: 'Report card generation unavailable. Please contact the academy.',
                parentSummary: '',
                nextTermGoals: [],
                generatedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Get AI-Curated Notifications ────────────────────────────
    async getNotifications(parentId: string, tenantId: string) {
        try {
            const recentActivity = await ParentAIAssistantModel.find({
                parentId,
                tenantId,
            })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

            const milestones = recentActivity.filter(a => a.type === 'MILESTONE');
            const reports = recentActivity.filter(a => ['WEEKLY_REPORT', 'MONTHLY_REPORT'].includes(a.type));

            const prompt = {
                system: `You are an AI notification curator for parents of fitness academy students. Decide which updates are important enough to notify parents about. Prioritize milestones, significant progress changes, and actionable items. Avoid notification fatigue. RESPOND ONLY with valid JSON matching this schema: { "notifications": [{ "title": string, "message": string, "priority": "high" | "medium" | "low", "category": "milestone" | "progress" | "action-required" | "reminder" | "celebration", "relatedReportId": string }], "unreadCount": number, "summary": string }`,
                user: `Parent ID: ${parentId}\nRecent milestones: ${JSON.stringify(milestones.map(m => ({ title: m.milestone?.title, date: m.createdAt, reportId: m.reportId })))}\nRecent reports: ${JSON.stringify(reports.map(r => ({ summary: r.report?.summary, date: r.createdAt, reportId: r.reportId })))}`,
            };

            const aiResult = await aiService.jsonCompletion<{
                notifications: Array<{
                    title: string;
                    message: string;
                    priority: string;
                    category: string;
                    relatedReportId: string;
                }>;
                unreadCount: number;
                summary: string;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'parent-ai-assistant',
                temperature: 0.5,
            });

            logger.info(`Parent AI Assistant: Generated ${aiResult.notifications.length} notifications for parent ${parentId}`);

            return {
                parentId,
                notifications: aiResult.notifications,
                unreadCount: aiResult.unreadCount,
                summary: aiResult.summary,
                generatedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Parent AI Assistant notifications failed for parent ${parentId}:`, error.message);
            return {
                parentId,
                notifications: [],
                unreadCount: 0,
                summary: 'Unable to load notifications. Please try again later.',
                generatedAt: new Date(),
                aiPowered: false,
            };
        }
    }
}
