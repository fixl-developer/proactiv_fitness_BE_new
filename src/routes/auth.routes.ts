import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { authenticate } from '../modules/iam/auth.middleware';
import {
    registerValidation,
    loginValidation,
    passwordResetRequestValidation,
    passwordResetValidation,
    changePasswordValidation,
    emailVerificationValidation,
    refreshTokenValidation,
} from '../modules/iam/user.validation';

const router = Router();

// Public routes (with rate limiting)
router.post(
    '/register',
    rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 5 }),
    validate(registerValidation),
    authController.wrap(authController.register)
);

router.post(
    '/login',
    rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 5 }),
    validate(loginValidation),
    authController.wrap(authController.login)
);

router.post(
    '/forgot-password',
    rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 3 }),
    validate(passwordResetRequestValidation),
    authController.wrap(authController.forgotPassword)
);

router.post(
    '/reset-password',
    rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 3 }),
    validate(passwordResetValidation),
    authController.wrap(authController.resetPassword)
);

router.post(
    '/verify-email',
    validate(emailVerificationValidation),
    authController.wrap(authController.verifyEmail)
);

router.post(
    '/refresh-token',
    validate(refreshTokenValidation),
    authController.wrap(authController.refreshToken)
);

// Protected routes (require authentication)
router.post(
    '/logout',
    authenticate,
    authController.wrap(authController.logout)
);

router.post(
    '/change-password',
    authenticate,
    validate(changePasswordValidation),
    authController.wrap(authController.changePassword)
);

router.post(
    '/resend-verification',
    authenticate,
    authController.wrap(authController.resendVerification)
);

router.get(
    '/me',
    authenticate,
    authController.wrap(authController.getCurrentUser)
);

export default router;