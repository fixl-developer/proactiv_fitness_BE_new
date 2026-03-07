import { Request, Response, NextFunction } from 'express';
import { aiCoachService } from './ai-coach.service';
import { AppError } from '../../utils/appError';
import { logger } from '../../utils/logger';

export class AICoachController {
    // POST /api/v1/ai-coach/analyze-form
    async analyzeForm(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { studentId, sessionId, exerciseType, videoUrl } = req.body;

            if (!studentId || !sessionId || !exerciseType) {
                throw new AppError('Missing required fields', 400);
            }

            const analysis = await aiCoachService.analyzeForm({
                studentId,
                sessionId,
                exerciseType,
                videoUrl
            });

            res.status(201).json({
                success: true,
                data: analysis
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/v1/ai-coach/suggest-workout
    async suggestWorkout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { studentId, programId, basedOn } = req.body;

            if (!studentId || !programId) {
                throw new AppError('Missing required fields', 400);
            }

            const suggestion = await aiCoachService.suggestWorkout({
                studentId,
                programId,
                basedOn
            });

            res.status(201).json({
                success: true,
                data: suggestion
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/v1/ai-coach/voice-command
    async processVoiceCommand(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { studentId, coachId, sessionId, audioUrl, transcript } = req.body;

            if (!studentId || !coachId || !sessionId || !transcript) {
                throw new AppError('Missing required fields', 400);
            }

            const command = await aiCoachService.processVoiceCommand({
                studentId,
                coachId,
                sessionId,
                audioUrl,
                transcript
            });

            res.status(201).json({
                success: true,
                data: command
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/v1/ai-coach/predictions/:studentId
    async getPredictions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { studentId } = req.params;
            const { skillId } = req.query;

            if (!skillId) {
                throw new AppError('Skill ID is required', 400);
            }

            const prediction = await aiCoachService.predictProgress(studentId, skillId as string);

            res.status(200).json({
                success: true,
                data: prediction
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/v1/ai-coach/injury-alerts/:studentId
    async getInjuryAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { studentId } = req.params;
            const limit = parseInt(req.query.limit as string) || 10;

            const alerts = await aiCoachService.getInjuryAlerts(studentId, limit);

            res.status(200).json({
                success: true,
                count: alerts.length,
                data: alerts
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/v1/ai-coach/feedback
    async generateFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { studentId, sessionId, exerciseId, deliveryMethod } = req.body;

            if (!studentId || !sessionId || !exerciseId) {
                throw new AppError('Missing required fields', 400);
            }

            const feedback = await aiCoachService.generateFeedback({
                studentId,
                sessionId,
                exerciseId,
                deliveryMethod
            });

            res.status(201).json({
                success: true,
                data: feedback
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/v1/ai-coach/annotate-video
    async annotateVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { videoId, studentId, annotations } = req.body;

            if (!videoId || !studentId) {
                throw new AppError('Missing required fields', 400);
            }

            const annotation = await aiCoachService.annotateVideo({
                videoId,
                studentId,
                annotations
            });

            res.status(201).json({
                success: true,
                data: annotation
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/v1/ai-coach/settings/:tenantId
    async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { tenantId } = req.params;

            const settings = await aiCoachService.getSettings(tenantId);

            res.status(200).json({
                success: true,
                data: settings
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/v1/ai-coach/settings/:tenantId
    async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { tenantId } = req.params;
            const updates = req.body;

            const settings = await aiCoachService.updateSettings(tenantId, updates);

            res.status(200).json({
                success: true,
                data: settings
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/v1/ai-coach/form-analyses/:studentId
    async getFormAnalyses(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { studentId } = req.params;
            const limit = parseInt(req.query.limit as string) || 10;

            const analyses = await aiCoachService.getFormAnalyses(studentId, limit);

            res.status(200).json({
                success: true,
                count: analyses.length,
                data: analyses
            });
        } catch (error) {
            next(error);
        }
    }
}

export const aiCoachController = new AICoachController();
