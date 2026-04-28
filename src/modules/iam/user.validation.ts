import { body, param, query } from 'express-validator';
import { UserRole, UserStatus, Gender, Language } from '@shared/enums';

// Register validation
export const registerValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage(
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ),
    body('confirmPassword')
        .notEmpty()
        .withMessage('Confirm password is required')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match'),
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
    body('phone')
        .optional()
        .trim()
        .matches(/^\+?[1-9]\d{1,14}$/)
        .withMessage('Please provide a valid phone number'),
    body('role')
        .optional()
        .isIn(Object.values(UserRole))
        .withMessage('Invalid role'),
    body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid date'),
    body('gender')
        .optional()
        .isIn(Object.values(Gender))
        .withMessage('Invalid gender'),
    body('language')
        .optional()
        .isIn(Object.values(Language))
        .withMessage('Invalid language'),
];

// Login validation
export const loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];

// Password reset request validation
export const passwordResetRequestValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
];

// Password reset validation
export const passwordResetValidation = [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage(
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ),
    body('confirmPassword')
        .notEmpty()
        .withMessage('Confirm password is required')
        .custom((value, { req }) => value === req.body.newPassword)
        .withMessage('Passwords do not match'),
];

// Change password validation
export const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage(
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        )
        .custom((value, { req }) => value !== req.body.currentPassword)
        .withMessage('New password must be different from current password'),
    body('confirmPassword')
        .notEmpty()
        .withMessage('Confirm password is required')
        .custom((value, { req }) => value === req.body.newPassword)
        .withMessage('Passwords do not match'),
];

// Update user validation
export const updateUserValidation = [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('firstName')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('First name cannot be empty')
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    body('lastName')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Last name cannot be empty')
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
    // Accept phone with formatting characters (spaces, dashes, parentheses).
    // Backend strips them via customSanitizer before regex check, then stores
    // the digits-only (with optional leading +) form.
    body('phone')
        .optional({ checkFalsy: true })
        .customSanitizer((value: string) => {
            if (!value) return value;
            const str = String(value);
            const hasPlus = str.trim().startsWith('+');
            const digits = str.replace(/\D/g, '');
            return hasPlus ? `+${digits}` : digits;
        })
        .matches(/^\+?[1-9]\d{1,14}$/)
        .withMessage('Please provide a valid phone number (7-15 digits, optional leading +)'),
    body('role')
        .optional()
        .isIn(Object.values(UserRole))
        .withMessage('Invalid role'),
    body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid date'),
    body('gender')
        .optional()
        .isIn(Object.values(Gender))
        .withMessage('Invalid gender'),
    body('language')
        .optional()
        .isIn(Object.values(Language))
        .withMessage('Invalid language'),
];

// Create user validation (admin)
export const createUserValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters'),
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(Object.values(UserRole))
        .withMessage('Invalid role'),
    // Accept phone with formatting characters (spaces, dashes, parentheses).
    // We strip non-digit characters before the regex check so users can paste
    // pretty-formatted numbers like "+1 555 123 4567" or "(555) 123-4567".
    body('phone')
        .optional({ checkFalsy: true })
        .customSanitizer((value: string) => {
            if (!value) return value;
            const str = String(value);
            const hasPlus = str.trim().startsWith('+');
            const digits = str.replace(/\D/g, '');
            return hasPlus ? `+${digits}` : digits;
        })
        .matches(/^\+?[1-9]\d{1,14}$/)
        .withMessage('Please provide a valid phone number (7-15 digits, optional leading +)'),
];

// Update user status validation
export const updateUserStatusValidation = [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(Object.values(UserStatus))
        .withMessage('Invalid status'),
];

// Get users query validation
export const getUsersQueryValidation = [
    query('role')
        .optional()
        .isIn(Object.values(UserRole))
        .withMessage('Invalid role'),
    query('status')
        .optional()
        .isIn(Object.values(UserStatus))
        .withMessage('Invalid status'),
    query('search')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Search query must be at least 2 characters'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
];

// ID param validation
export const idParamValidation = [
    param('id').isMongoId().withMessage('Invalid user ID'),
];

// Email verification validation
export const emailVerificationValidation = [
    body('token').notEmpty().withMessage('Verification token is required'),
];

// Refresh token validation
export const refreshTokenValidation = [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];
