import { Router } from 'express';
import authController from './auth.controller';
import parentRegistrationController from './parent-registration.controller';
import { validate } from '@middleware/validation.middleware';
import { authLimiter } from '@middleware/rate-limit.middleware';
import { authenticate } from './auth.middleware';
import {
    registerValidation,
    loginValidation,
    passwordResetRequestValidation,
    passwordResetValidation,
    changePasswordValidation,
    emailVerificationValidation,
    refreshTokenValidation,
} from './user.validation';

const router = Router();

// Public routes (with rate limiting)
router.post(
    '/register',
    authLimiter,
    validate(registerValidation),
    authController.register
);

// Parent registration (multi-step from frontend)
router.post(
    '/register/parent',
    authLimiter,
    parentRegistrationController.registerParent.bind(parentRegistrationController)
);

router.post(
    '/register/check-email',
    authLimiter,
    parentRegistrationController.checkEmailAvailability.bind(parentRegistrationController)
);

router.post(
    '/register/save-progress',
    authLimiter,
    parentRegistrationController.saveRegistrationProgress.bind(parentRegistrationController)
);

router.post(
    '/login',
    authLimiter,
    validate(loginValidation),
    authController.login
);

router.post(
    '/forgot-password',
    authLimiter,
    validate(passwordResetRequestValidation),
    authController.forgotPassword
);

router.post(
    '/reset-password',
    authLimiter,
    validate(passwordResetValidation),
    authController.resetPassword
);

router.post(
    '/verify-email',
    validate(emailVerificationValidation),
    authController.verifyEmail
);

router.post(
    '/refresh-token',
    validate(refreshTokenValidation),
    authController.refreshToken
);

// Protected routes (require authentication)
router.post(
    '/logout',
    authenticate,
    authController.logout
);

router.post(
    '/change-password',
    authenticate,
    validate(changePasswordValidation),
    authController.changePassword
);

router.post(
    '/resend-verification',
    authenticate,
    authController.resendVerification
);

router.get(
    '/me',
    authenticate,
    authController.getCurrentUser
);

export default router;
