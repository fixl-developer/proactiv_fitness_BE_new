import { Router } from 'express';
import { aiCoachController } from './ai-coach.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { aiCoachValidation } from './ai-coach.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Form analysis
router.post(
    '/analyze-form',
    validateRequest(aiCoachValidation.analyzeForm),
    aiCoachController.analyzeForm.bind(aiCoachController)
);

router.get(
    '/form-analyses/:studentId',
    aiCoachController.getFormAnalyses.bind(aiCoachController)
);

// Workout suggestions
router.post(
    '/suggest-workout',
    validateRequest(aiCoachValidation.suggestWorkout),
    aiCoachController.suggestWorkout.bind(aiCoachController)
);

// Voice commands
router.post(
    '/voice-command',
    validateRequest(aiCoachValidation.voiceCommand),
    aiCoachController.processVoiceCommand.bind(aiCoachController)
);

// Progress predictions
router.get(
    '/predictions/:studentId',
    aiCoachController.getPredictions.bind(aiCoachController)
);

// Injury alerts
router.get(
    '/injury-alerts/:studentId',
    aiCoachController.getInjuryAlerts.bind(aiCoachController)
);

// Feedback
router.post(
    '/feedback',
    validateRequest(aiCoachValidation.feedback),
    aiCoachController.generateFeedback.bind(aiCoachController)
);

// Video annotation
router.post(
    '/annotate-video',
    validateRequest(aiCoachValidation.annotateVideo),
    aiCoachController.annotateVideo.bind(aiCoachController)
);

// Settings
router.get(
    '/settings/:tenantId',
    aiCoachController.getSettings.bind(aiCoachController)
);

router.put(
    '/settings/:tenantId',
    validateRequest(aiCoachValidation.updateSettings),
    aiCoachController.updateSettings.bind(aiCoachController)
);

export default router;
