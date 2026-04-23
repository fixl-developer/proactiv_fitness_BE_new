import { Router } from 'express';
import authController from './auth.controller';
import parentRegistrationController from './parent-registration.controller';
import { validate } from '@middleware/validation.middleware';
import { authLimiter } from '@middleware/rate-limit.middleware';
import { authenticate } from './auth.middleware';
import { asyncHandler } from '@shared/utils/async-handler.util';
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

// Sanitize all incoming request bodies
router.use(sanitizeInput());

// Public routes (with rate limiting)
router.post(
    '/register',
    authLimiter,
    validate(registerValidation),
    asyncHandler(authController.register.bind(authController))
);

router.post(
    '/register/parent',
    authLimiter,
    asyncHandler(parentRegistrationController.registerParent.bind(parentRegistrationController))
);

router.post(
    '/register/check-email',
    authLimiter,
    asyncHandler(parentRegistrationController.checkEmailAvailability.bind(parentRegistrationController))
);

router.post(
    '/register/save-progress',
    authLimiter,
    asyncHandler(parentRegistrationController.saveRegistrationProgress.bind(parentRegistrationController))
);

router.post(
    '/login',
    authLimiter,
    validate(loginValidation),
    asyncHandler(authController.login.bind(authController))
);

router.post(
    '/forgot-password',
    authLimiter,
    validate(passwordResetRequestValidation),
    asyncHandler(authController.forgotPassword.bind(authController))
);

router.post(
    '/reset-password',
    authLimiter,
    validate(passwordResetValidation),
    asyncHandler(authController.resetPassword.bind(authController))
);

router.post(
    '/verify-email',
    validate(emailVerificationValidation),
    asyncHandler(authController.verifyEmail.bind(authController))
);

router.post(
    '/refresh-token',
    validate(refreshTokenValidation),
    asyncHandler(authController.refreshToken.bind(authController))
);

// Protected routes (require authentication)
router.post(
    '/logout',
    authenticate,
    asyncHandler(authController.logout.bind(authController))
);

router.post(
    '/change-password',
    authenticate,
    validate(changePasswordValidation),
    asyncHandler(authController.changePassword.bind(authController))
);

router.post(
    '/resend-verification',
    authenticate,
    asyncHandler(authController.resendVerification.bind(authController))
);

router.get(
    '/me',
    authenticate,
    asyncHandler(authController.getCurrentUser.bind(authController))
);

export default router;
