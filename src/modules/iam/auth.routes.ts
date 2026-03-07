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
    authController.wrap(authController.register)
);

// Parent registration (multi-step from frontend)
router.post(
    '/register/parent',
    authLimiter,
    parentRegistrationController.wrap(parentRegistrationController.registerParent)
);

router.post(
    '/register/check-email',
    authLimiter,
    parentRegistrationController.wrap(parentRegistrationController.checkEmailAvailability)
);

router.post(
    '/register/save-progress',
    authLimiter,
    parentRegistrationController.wrap(parentRegistrationController.saveRegistrationProgress)
);

router.post(
    '/login',
    authLimiter,
    validate(loginValidation),
    authController.wrap(authController.login)
);

router.post(
    '/forgot-password',
    authLimiter,
    validate(passwordResetRequestValidation),
    authController.wrap(authController.forgotPassword)
);

router.post(
    '/reset-password',
    authLimiter,
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
