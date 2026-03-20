// API Constants
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

// Pagination
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// JWT
export const JWT_EXPIRY = '7d';
export const REFRESH_TOKEN_EXPIRY = '30d';

// Rate Limiting
export const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX = process.env.NODE_ENV === 'development' ? 10000 : 200;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword'];

// Validation
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const MIN_AGE = 2;
export const MAX_AGE = 18;

// Business Rules
export const DEFAULT_CLASS_CAPACITY = 8;
export const MIN_CLASS_CAPACITY = 4;
export const MAX_CLASS_CAPACITY = 12;
export const DEFAULT_COACH_RATIO = 8; // 1 coach : 8 kids

// Time
export const MINUTES_IN_HOUR = 60;
export const HOURS_IN_DAY = 24;
export const DAYS_IN_WEEK = 7;
export const WEEKS_IN_TERM = 12;

// Booking
export const BOOKING_ADVANCE_DAYS = 30;
export const CANCELLATION_HOURS = 24;
export const LATE_PICKUP_GRACE_MINUTES = 15;

// Notification
export const EMAIL_RETRY_ATTEMPTS = 3;
export const SMS_RETRY_ATTEMPTS = 3;

// Cache TTL (in seconds)
export const CACHE_TTL_SHORT = 300; // 5 minutes
export const CACHE_TTL_MEDIUM = 1800; // 30 minutes
export const CACHE_TTL_LONG = 3600; // 1 hour

// Error Messages
export const ERROR_MESSAGES = {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Forbidden resource',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation error',
    INTERNAL_ERROR: 'Internal server error',
    DUPLICATE_ENTRY: 'Duplicate entry',
    INVALID_CREDENTIALS: 'Invalid credentials',
    TOKEN_EXPIRED: 'Token expired',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
};

// Success Messages
export const SUCCESS_MESSAGES = {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    RETRIEVED: 'Resource retrieved successfully',
};

// Regex Patterns
export const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[1-9]\d{1,14}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
};

// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};
