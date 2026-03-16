import mongoose, { Schema, Document } from 'mongoose';

// Security Event Interface
export interface ISecurityEvent extends Document {
    type: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'data_access' | 'system_change' | 'user_created' | 'user_updated' | 'user_deleted' | 'user_suspended' | 'user_activated' | 'role_created' | 'role_updated' | 'role_deleted' | 'backup_created' | 'backup_restored' | 'settings_updated' | 'maintenance_enabled' | 'maintenance_disabled' | 'cache_cleared' | 'service_restarted' | 'alert_acknowledged' | 'alert_resolved';
    userId: string;
    userEmail?: string;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    details: any;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// System Log Interface
export interface ISystemLog extends Document {
    level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    message: string;
    timestamp: Date;
    source: string;
    userId?: string;
    metadata?: any;
    stackTrace?: string;
}

// Platform Settings Interface
export interface IPlatformSettings extends Document {
    general: {
        siteName: string;
        siteUrl: string;
        adminEmail: string;
        timezone: string;
        language: string;
        maintenanceMode: boolean;
    };
    security: {
        passwordPolicy: {
            minLength: number;
            requireUppercase: boolean;
            requireLowercase: boolean;
            requireNumbers: boolean;
            requireSpecialChars: boolean;
            expirationDays: number;
        };
        sessionTimeout: number;
        maxLoginAttempts: number;
        twoFactorRequired: boolean;
        ipWhitelist: string[];
    };
    features: {
        [key: string]: boolean;
    };
    integrations: {
        email: {
            provider: string;
            apiKey: string;
            fromEmail: string;
            enabled: boolean;
        };
        sms: {
            provider: string;
            apiKey: string;
            fromNumber: string;
            enabled: boolean;
        };
        payment: {
            stripe: {
                publicKey: string;
                secretKey: string;
                webhookSecret: string;
                enabled: boolean;
            };
            paypal?: {
                clientId: string;
                clientSecret: string;
                enabled: boolean;
            };
        };
    };
    updatedBy: string;
    updatedAt: Date;
}

// Security Event Schema
const SecurityEventSchema = new Schema<ISecurityEvent>({
    type: {
        type: String,
        required: true,
        enum: [
            'login', 'logout', 'failed_login', 'permission_denied', 'data_access', 'system_change',
            'user_created', 'user_updated', 'user_deleted', 'user_suspended', 'user_activated',
            'role_created', 'role_updated', 'role_deleted', 'backup_created', 'backup_restored',
            'settings_updated', 'maintenance_enabled', 'maintenance_disabled', 'cache_cleared',
            'service_restarted', 'alert_acknowledged', 'alert_resolved'
        ]
    },
    userId: {
        type: String,
        required: true
    },
    userEmail: {
        type: String
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    details: {
        type: Schema.Types.Mixed,
        default: {}
    },
    riskLevel: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    }
}, {
    timestamps: true,
    collection: 'security_events'
});

// System Log Schema
const SystemLogSchema = new Schema<ISystemLog>({
    level: {
        type: String,
        required: true,
        enum: ['debug', 'info', 'warn', 'error', 'fatal']
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    userId: {
        type: String
    },
    metadata: {
        type: Schema.Types.Mixed
    },
    stackTrace: {
        type: String
    }
}, {
    timestamps: true,
    collection: 'system_logs'
});

// Platform Settings Schema
const PlatformSettingsSchema = new Schema<IPlatformSettings>({
    general: {
        siteName: { type: String, required: true },
        siteUrl: { type: String, required: true },
        adminEmail: { type: String, required: true },
        timezone: { type: String, default: 'UTC' },
        language: { type: String, default: 'en' },
        maintenanceMode: { type: Boolean, default: false }
    },
    security: {
        passwordPolicy: {
            minLength: { type: Number, default: 8 },
            requireUppercase: { type: Boolean, default: true },
            requireLowercase: { type: Boolean, default: true },
            requireNumbers: { type: Boolean, default: true },
            requireSpecialChars: { type: Boolean, default: true },
            expirationDays: { type: Number, default: 90 }
        },
        sessionTimeout: { type: Number, default: 3600 },
        maxLoginAttempts: { type: Number, default: 5 },
        twoFactorRequired: { type: Boolean, default: false },
        ipWhitelist: [{ type: String }]
    },
    features: {
        type: Schema.Types.Mixed,
        default: {}
    },
    integrations: {
        email: {
            provider: { type: String, default: 'sendgrid' },
            apiKey: { type: String },
            fromEmail: { type: String },
            enabled: { type: Boolean, default: false }
        },
        sms: {
            provider: { type: String, default: 'twilio' },
            apiKey: { type: String },
            fromNumber: { type: String },
            enabled: { type: Boolean, default: false }
        },
        payment: {
            stripe: {
                publicKey: { type: String },
                secretKey: { type: String },
                webhookSecret: { type: String },
                enabled: { type: Boolean, default: false }
            },
            paypal: {
                clientId: { type: String },
                clientSecret: { type: String },
                enabled: { type: Boolean, default: false }
            }
        }
    },
    updatedBy: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    collection: 'platform_settings'
});

// Create indexes for better performance
SecurityEventSchema.index({ timestamp: -1 });
SecurityEventSchema.index({ userId: 1 });
SecurityEventSchema.index({ type: 1 });
SecurityEventSchema.index({ riskLevel: 1 });

SystemLogSchema.index({ timestamp: -1 });
SystemLogSchema.index({ level: 1 });
SystemLogSchema.index({ source: 1 });

// Create models (guard against re-compilation)
const SecurityEvent = (mongoose.models['SecurityEvent'] as any) || mongoose.model<ISecurityEvent>('SecurityEvent', SecurityEventSchema);
const SystemLog = (mongoose.models['SystemLog'] as any) || mongoose.model<ISystemLog>('SystemLog', SystemLogSchema);
const PlatformSettings = (mongoose.models['PlatformSettings'] as any) || mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);

export const SuperAdminModel = {
    SecurityEvent,
    SystemLog,
    PlatformSettings
};

export { SecurityEvent, SystemLog, PlatformSettings };