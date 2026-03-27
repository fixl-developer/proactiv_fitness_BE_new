import { SmartSchedulerModel } from './smart-scheduler.model';
import { v4 as uuidv4 } from 'uuid';
import aiService from '@shared/services/ai.service';
import { AIPromptService } from '@shared/services/ai-prompt.service';
import logger from '@shared/utils/logger.util';

export class SmartSchedulerService {
    // ─── Predict Attendance / No-Shows ───────────────────────────
    async predictAttendance(data: any) {
        const { tenantId, classId, studentIds, historicalData } = data;

        try {
            const previousPredictions = await SmartSchedulerModel.find({
                tenantId,
                type: 'ATTENDANCE_PREDICTION',
                targetEntityId: classId,
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            const prompt = {
                system: `You are an AI scheduling analyst specializing in class attendance prediction for fitness academies. Analyze historical patterns and predict no-show probability for each student. RESPOND ONLY with valid JSON matching this schema: { "predictions": [{ "studentId": string, "noShowProbability": number (0-1), "confidence": number (0-1), "factors": [string] }], "classNoShowRate": number (0-1), "recommendedOverbooking": number, "insights": string }`,
                user: `Class ID: ${classId}\nStudent IDs: ${JSON.stringify(studentIds)}\nHistorical data: ${JSON.stringify(historicalData)}\nPrevious prediction accuracy: ${previousPredictions.map(p => `${p.prediction?.noShowProbability}`).join(', ') || 'No prior predictions'}`,
            };

            const aiResult = await aiService.jsonCompletion<{
                predictions: Array<{
                    studentId: string;
                    noShowProbability: number;
                    confidence: number;
                    factors: string[];
                }>;
                classNoShowRate: number;
                recommendedOverbooking: number;
                insights: string;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'smart-scheduler',
                temperature: 0.5,
            });

            const record = await SmartSchedulerModel.create({
                predictionId: uuidv4(),
                tenantId,
                type: 'ATTENDANCE_PREDICTION',
                targetEntityId: classId,
                prediction: {
                    noShowProbability: aiResult.classNoShowRate,
                    confidence: aiResult.predictions.reduce((acc, p) => acc + p.confidence, 0) / aiResult.predictions.length,
                    factors: aiResult.predictions.flatMap(p => p.factors).filter((v, i, a) => a.indexOf(v) === i),
                },
            });

            logger.info(`Smart Scheduler: Attendance prediction for class ${classId} — no-show rate: ${aiResult.classNoShowRate}`);

            return {
                predictionId: record.predictionId,
                classId,
                predictions: aiResult.predictions,
                classNoShowRate: aiResult.classNoShowRate,
                recommendedOverbooking: aiResult.recommendedOverbooking,
                insights: aiResult.insights,
                predictedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Smart Scheduler attendance prediction failed for class ${classId}:`, error.message);
            return {
                classId,
                predictions: (studentIds || []).map((id: string) => ({
                    studentId: id,
                    noShowProbability: 0.15,
                    confidence: 0,
                    factors: ['Fallback default — AI unavailable'],
                })),
                classNoShowRate: 0.15,
                recommendedOverbooking: 1,
                insights: 'AI prediction unavailable. Using default 15% no-show rate.',
                predictedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Optimize Schedule ───────────────────────────────────────
    async optimizeSchedule(data: any) {
        const { tenantId, locationId, currentSchedule, constraints } = data;

        try {
            const previousOptimizations = await SmartSchedulerModel.find({
                tenantId,
                type: 'SCHEDULE_OPTIMIZATION',
                targetEntityId: locationId,
            })
                .sort({ createdAt: -1 })
                .limit(3)
                .lean();

            const prompt = {
                system: `You are an AI schedule optimization expert for fitness academies. Analyze the current schedule and suggest optimal time slots that maximize attendance and minimize conflicts. RESPOND ONLY with valid JSON matching this schema: { "suggestedSlots": [{ "dayOfWeek": string, "timeSlot": string, "expectedDemand": number, "score": number (0-100) }], "reasoning": string, "conflictsResolved": [string], "expectedImprovementPercent": number }`,
                user: `Location ID: ${locationId}\nCurrent schedule: ${JSON.stringify(currentSchedule)}\nConstraints: ${JSON.stringify(constraints || {})}\nPrevious optimizations: ${previousOptimizations.length} records available`,
            };

            const aiResult = await aiService.jsonCompletion<{
                suggestedSlots: Array<{
                    dayOfWeek: string;
                    timeSlot: string;
                    expectedDemand: number;
                    score: number;
                }>;
                reasoning: string;
                conflictsResolved: string[];
                expectedImprovementPercent: number;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'smart-scheduler',
                temperature: 0.5,
            });

            const record = await SmartSchedulerModel.create({
                predictionId: uuidv4(),
                tenantId,
                type: 'SCHEDULE_OPTIMIZATION',
                targetEntityId: locationId,
                scheduleOptimization: {
                    suggestedSlots: aiResult.suggestedSlots,
                    reasoning: aiResult.reasoning,
                },
            });

            logger.info(`Smart Scheduler: Schedule optimized for location ${locationId} — ${aiResult.suggestedSlots.length} slots suggested`);

            return {
                predictionId: record.predictionId,
                locationId,
                suggestedSlots: aiResult.suggestedSlots,
                reasoning: aiResult.reasoning,
                conflictsResolved: aiResult.conflictsResolved,
                expectedImprovementPercent: aiResult.expectedImprovementPercent,
                optimizedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Smart Scheduler optimization failed for location ${locationId}:`, error.message);
            return {
                locationId,
                suggestedSlots: [],
                reasoning: 'AI optimization unavailable. Please try again later.',
                conflictsResolved: [],
                expectedImprovementPercent: 0,
                optimizedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Analyze Peak Hours ──────────────────────────────────────
    async analyzePeakHours(locationId: string, tenantId: string) {
        try {
            const existingAnalysis = await SmartSchedulerModel.findOne({
                tenantId,
                type: 'PEAK_ANALYSIS',
                targetEntityId: locationId,
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            })
                .sort({ createdAt: -1 })
                .lean();

            if (existingAnalysis?.peakHourAnalysis) {
                return {
                    locationId,
                    ...existingAnalysis.peakHourAnalysis,
                    predictionId: existingAnalysis.predictionId,
                    aiPowered: true,
                    cached: true,
                };
            }

            const historicalData = await SmartSchedulerModel.find({
                tenantId,
                targetEntityId: locationId,
            })
                .sort({ createdAt: -1 })
                .limit(50)
                .lean();

            const prompt = {
                system: `You are an AI utilization analyst for fitness facilities. Analyze patterns and determine peak usage hours. RESPOND ONLY with valid JSON matching this schema: { "peakHours": [{ "hour": number (0-23), "utilization": number (0-100) }], "recommendations": [string], "busiestDay": string, "quietestDay": string, "optimalClassTimes": [string] }`,
                user: `Location ID: ${locationId}\nHistorical records: ${historicalData.length}\nExisting schedule data: ${JSON.stringify(historicalData.slice(0, 10).map(d => ({ type: d.type, createdAt: d.createdAt })))}`,
            };

            const aiResult = await aiService.jsonCompletion<{
                peakHours: Array<{ hour: number; utilization: number }>;
                recommendations: string[];
                busiestDay: string;
                quietestDay: string;
                optimalClassTimes: string[];
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'smart-scheduler',
                temperature: 0.5,
            });

            const record = await SmartSchedulerModel.create({
                predictionId: uuidv4(),
                tenantId,
                type: 'PEAK_ANALYSIS',
                targetEntityId: locationId,
                peakHourAnalysis: {
                    peakHours: aiResult.peakHours,
                    recommendations: aiResult.recommendations,
                },
            });

            logger.info(`Smart Scheduler: Peak hour analysis for location ${locationId} — ${aiResult.peakHours.length} hours analyzed`);

            return {
                predictionId: record.predictionId,
                locationId,
                peakHours: aiResult.peakHours,
                recommendations: aiResult.recommendations,
                busiestDay: aiResult.busiestDay,
                quietestDay: aiResult.quietestDay,
                optimalClassTimes: aiResult.optimalClassTimes,
                analyzedAt: new Date(),
                aiPowered: true,
                cached: false,
            };
        } catch (error: any) {
            logger.error(`Smart Scheduler peak analysis failed for location ${locationId}:`, error.message);
            return {
                locationId,
                peakHours: [],
                recommendations: ['Unable to analyze peak hours. Please try again later.'],
                busiestDay: 'unknown',
                quietestDay: 'unknown',
                optimalClassTimes: [],
                analyzedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Match Coach to Student ──────────────────────────────────
    async matchCoach(data: any) {
        const { tenantId, studentId, requirements, availableCoaches } = data;

        try {
            const prompt = {
                system: `You are an AI coach matching specialist for fitness academies. Match students with the best coaches based on requirements, skills, and compatibility. RESPOND ONLY with valid JSON matching this schema: { "bestMatch": { "coachId": string, "matchScore": number (0-100), "matchReasons": [string] }, "alternativeMatches": [{ "coachId": string, "matchScore": number, "matchReasons": [string] }], "reasoning": string }`,
                user: `Student ID: ${studentId}\nRequirements: ${JSON.stringify(requirements)}\nAvailable coaches: ${JSON.stringify(availableCoaches)}`,
            };

            const aiResult = await aiService.jsonCompletion<{
                bestMatch: {
                    coachId: string;
                    matchScore: number;
                    matchReasons: string[];
                };
                alternativeMatches: Array<{
                    coachId: string;
                    matchScore: number;
                    matchReasons: string[];
                }>;
                reasoning: string;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'smart-scheduler',
                temperature: 0.5,
            });

            const record = await SmartSchedulerModel.create({
                predictionId: uuidv4(),
                tenantId,
                type: 'COACH_MATCH',
                targetEntityId: studentId,
                coachMatch: {
                    coachId: aiResult.bestMatch.coachId,
                    matchScore: aiResult.bestMatch.matchScore,
                    matchReasons: aiResult.bestMatch.matchReasons,
                },
            });

            logger.info(`Smart Scheduler: Coach matched for student ${studentId} — coach ${aiResult.bestMatch.coachId}, score ${aiResult.bestMatch.matchScore}`);

            return {
                predictionId: record.predictionId,
                studentId,
                bestMatch: aiResult.bestMatch,
                alternativeMatches: aiResult.alternativeMatches,
                reasoning: aiResult.reasoning,
                matchedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Smart Scheduler coach match failed for student ${studentId}:`, error.message);
            return {
                studentId,
                bestMatch: { coachId: '', matchScore: 0, matchReasons: ['AI matching unavailable'] },
                alternativeMatches: [],
                reasoning: 'AI coach matching unavailable. Please assign manually.',
                matchedAt: new Date(),
                aiPowered: false,
            };
        }
    }

    // ─── Auto-Fill Waitlist from Predictions ─────────────────────
    async autoFillWaitlist(data: any) {
        const { tenantId, classId, waitlistedStudents, currentEnrolled, maxCapacity } = data;

        try {
            const attendancePredictions = await SmartSchedulerModel.find({
                tenantId,
                type: 'ATTENDANCE_PREDICTION',
                targetEntityId: classId,
            })
                .sort({ createdAt: -1 })
                .limit(3)
                .lean();

            const prompt = {
                system: `You are an AI waitlist management specialist for fitness academies. Based on predicted no-shows, determine which waitlisted students should be promoted to fill expected empty spots. RESPOND ONLY with valid JSON matching this schema: { "promotions": [{ "studentId": string, "reason": string, "confidence": number (0-1) }], "expectedNoShows": number, "availableSpots": number, "reasoning": string, "riskAssessment": string }`,
                user: `Class ID: ${classId}\nMax capacity: ${maxCapacity}\nCurrently enrolled: ${currentEnrolled}\nWaitlisted students: ${JSON.stringify(waitlistedStudents)}\nRecent attendance predictions: ${JSON.stringify(attendancePredictions.map(p => p.prediction))}`,
            };

            const aiResult = await aiService.jsonCompletion<{
                promotions: Array<{
                    studentId: string;
                    reason: string;
                    confidence: number;
                }>;
                expectedNoShows: number;
                availableSpots: number;
                reasoning: string;
                riskAssessment: string;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'smart-scheduler',
                temperature: 0.5,
            });

            const record = await SmartSchedulerModel.create({
                predictionId: uuidv4(),
                tenantId,
                type: 'WAITLIST_FILL',
                targetEntityId: classId,
                prediction: {
                    noShowProbability: aiResult.expectedNoShows / (currentEnrolled || 1),
                    confidence: aiResult.promotions.reduce((acc, p) => acc + p.confidence, 0) / (aiResult.promotions.length || 1),
                    factors: [aiResult.reasoning],
                },
            });

            logger.info(`Smart Scheduler: Waitlist auto-fill for class ${classId} — promoting ${aiResult.promotions.length} students`);

            return {
                predictionId: record.predictionId,
                classId,
                promotions: aiResult.promotions,
                expectedNoShows: aiResult.expectedNoShows,
                availableSpots: aiResult.availableSpots,
                reasoning: aiResult.reasoning,
                riskAssessment: aiResult.riskAssessment,
                processedAt: new Date(),
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Smart Scheduler waitlist auto-fill failed for class ${classId}:`, error.message);
            return {
                classId,
                promotions: [],
                expectedNoShows: 0,
                availableSpots: 0,
                reasoning: 'AI waitlist analysis unavailable. Please manage waitlist manually.',
                riskAssessment: 'unknown',
                processedAt: new Date(),
                aiPowered: false,
            };
        }
    }
}
