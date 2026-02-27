import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface IEnvConfig {
    // Application
    nodeEnv: string;
    port: number;
    apiVersion: string;
    appName: string;

    // Database
    mongodbUri: string;
    mongodbTestUri: string;

    // Redis
    redisHost: string;
    redisPort: number;
    redisPassword: string;

    // JWT
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtRefreshSecret: string;
    jwtRefreshExpiresIn: string;

    // CORS
    corsOrigin: string[];

    // Rate Limiting
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;

    // Email
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser: string;
    smtpPassword: string;
    emailFrom: string;

    // SMS
    twilioAccountSid: string;
    twilioAuthToken: string;
    twilioPhoneNumber: string;

    // Payment
    stripeSecretKey: string;
    stripeWebhookSecret: string;
    paypayApiKey: string;
    paypaySecretKey: string;

    // File Upload
    maxFileSize: number;
    uploadPath: string;

    // Logging
    logLevel: string;
    logFilePath: string;

    // Security
    bcryptRounds: number;
    sessionSecret: string;

    // Feature Flags
    enableRedis: boolean;
    enableEmail: boolean;
    enableSms: boolean;
    enablePayments: boolean;

    // Multi-tenancy
    defaultTenant: string;
}

class EnvConfig {
    private static instance: EnvConfig;
    private config: IEnvConfig;

    private constructor() {
        this.config = {
            // Application
            nodeEnv: process.env.NODE_ENV || 'development',
            port: parseInt(process.env.PORT || '5000', 10),
            apiVersion: process.env.API_VERSION || 'v1',
            appName: process.env.APP_NAME || 'Proactiv Fitness Platform',

            // Database
            mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/proactiv_fitness',
            mongodbTestUri:
                process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/proactiv_fitness_test',

            // Redis
            redisHost: process.env.REDIS_HOST || 'localhost',
            redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
            redisPassword: process.env.REDIS_PASSWORD || '',

            // JWT
            jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
            jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
            jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
            jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

            // CORS
            corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],

            // Rate Limiting
            rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
            rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

            // Email
            smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
            smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
            smtpSecure: process.env.SMTP_SECURE === 'true',
            smtpUser: process.env.SMTP_USER || '',
            smtpPassword: process.env.SMTP_PASSWORD || '',
            emailFrom: process.env.EMAIL_FROM || 'noreply@proactivfitness.com',

            // SMS
            twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
            twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
            twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',

            // Payment
            stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
            paypayApiKey: process.env.PAYPAY_API_KEY || '',
            paypaySecretKey: process.env.PAYPAY_SECRET_KEY || '',

            // File Upload
            maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
            uploadPath: process.env.UPLOAD_PATH || './uploads',

            // Logging
            logLevel: process.env.LOG_LEVEL || 'info',
            logFilePath: process.env.LOG_FILE_PATH || './logs',

            // Security
            bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
            sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',

            // Feature Flags
            enableRedis: process.env.ENABLE_REDIS === 'true',
            enableEmail: process.env.ENABLE_EMAIL !== 'false',
            enableSms: process.env.ENABLE_SMS === 'true',
            enablePayments: process.env.ENABLE_PAYMENTS !== 'false',

            // Multi-tenancy
            defaultTenant: process.env.DEFAULT_TENANT || 'proactiv-hq',
        };

        this.validate();
    }

    static getInstance(): EnvConfig {
        if (!EnvConfig.instance) {
            EnvConfig.instance = new EnvConfig();
        }
        return EnvConfig.instance;
    }

    private validate(): void {
        const requiredVars = ['JWT_SECRET', 'MONGODB_URI'];

        const missing = requiredVars.filter((varName) => {
            const key = varName.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            return !this.config[key as keyof IEnvConfig];
        });

        if (missing.length > 0 && this.config.nodeEnv === 'production') {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }

    get(): IEnvConfig {
        return this.config;
    }

    isDevelopment(): boolean {
        return this.config.nodeEnv === 'development';
    }

    isProduction(): boolean {
        return this.config.nodeEnv === 'production';
    }

    isTest(): boolean {
        return this.config.nodeEnv === 'test';
    }
}

export default EnvConfig.getInstance();
