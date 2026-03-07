import Joi from 'joi';

export const aiCoachValidation = {
    analyzeForm: Joi.object({
        studentId: Joi.string().required(),
        sessionId: Joi.string().required(),
        exerciseType: Joi.string().required(),
        videoUrl: Joi.string().uri().optional()
    }),

    suggestWorkout: Joi.object({
        studentId: Joi.string().required(),
        programId: Joi.string().required(),
        basedOn: Joi.object({
            skillLevel: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
            recentPerformance: Joi.array().optional(),
            goals: Joi.array().items(Joi.string()).optional(),
            injuries: Joi.array().items(Joi.string()).optional()
        }).optional()
    }),

    voiceCommand: Joi.object({
        studentId: Joi.string().required(),
        coachId: Joi.string().required(),
        sessionId: Joi.string().required(),
        audioUrl: Joi.string().uri().optional(),
        transcript: Joi.string().required()
    }),

    feedback: Joi.object({
        studentId: Joi.string().required(),
        sessionId: Joi.string().required(),
        exerciseId: Joi.string().required(),
        deliveryMethod: Joi.string().valid('text', 'voice', 'visual').optional()
    }),

    annotateVideo: Joi.object({
        videoId: Joi.string().required(),
        studentId: Joi.string().required(),
        annotations: Joi.array().items(
            Joi.object({
                timestamp: Joi.number().required(),
                type: Joi.string().valid('form', 'technique', 'safety', 'achievement').required(),
                marker: Joi.object({
                    x: Joi.number().required(),
                    y: Joi.number().required(),
                    label: Joi.string().required(),
                    color: Joi.string().required()
                }).required(),
                note: Joi.string().required()
            })
        ).optional()
    }),

    updateSettings: Joi.object({
        enabled: Joi.boolean().optional(),
        features: Joi.object({
            formCorrection: Joi.boolean().optional(),
            voiceCommands: Joi.boolean().optional(),
            progressPrediction: Joi.boolean().optional(),
            injuryPrevention: Joi.boolean().optional(),
            autoFeedback: Joi.boolean().optional(),
            videoAnalysis: Joi.boolean().optional()
        }).optional(),
        aiProvider: Joi.string().valid('openai', 'anthropic', 'custom').optional(),
        modelVersion: Joi.string().optional(),
        confidenceThreshold: Joi.number().min(0).max(1).optional(),
        language: Joi.string().optional()
    })
};
