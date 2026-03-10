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
    authController.register.bind(authController)
);

router.post(
    '/login',
    rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 5 }),
    validate(loginValidation),
    authController.login.bind(authController)
);

router.post(
    '/forgot-password',
    rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 3 }),
    validate(passwordResetRequestValidation),
    authController.forgotPassword.bind(authController)
);

router.post(
    '/reset-password',
    rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 3 }),
    validate(passwordResetValidation),
    authController.resetPassword.bind(authController)
);

router.post(
    '/verify-email',
    validate(emailVerificationValidation),
    authController.verifyEmail.bind(authController)
);

router.post(
    '/refresh-token',
    validate(refreshTokenValidation),
    authController.refreshToken.bind(authController)
);

// Protected routes (require authentication)
router.post(
    '/logout',
    authenticate,
    authController.logout.bind(authController)
);

router.post(
    '/change-password',
    authenticate,
    validate(changePasswordValidation),
    authController.changePassword.bind(authController)
);

router.post(
    '/resend-verification',
    authenticate,
    authController.resendVerification.bind(authController)
);

router.get(
    '/me',
    authenticate,
    authController.getCurrentUser.bind(authController)
);

export default router;