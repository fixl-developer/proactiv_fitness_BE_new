import { Document } from 'mongoose';

export enum NotificationType {
    EMAIL = 'email',
    SMS = 'sms',
    PUSH = 'push',
    IN_APP = 'in_app'
}

export enum NotificationStatus {
    PENDING = 'pending',
    SENT = 'sent',
    DELIVERED = 'delivered',
    READ = 'read',
    FAILED = 'failed'
}

export enum NotificationCategory {
    BOOKING_CONFIRMATION = 'booking_confirmation',
    BOOKING_REMINDER = 'booking_reminder',
    BOOKING_CANCELLATION = 'booking_cancellation',
    PAYMENT_CONFIRMATION = 'payment_confirmation',
    PAYMENT_REMINDER = 'payment_reminder',
    SCHEDULE_CHANGE = 'schedule_change',
    PROMOTIONAL = 'promotional',
    SYSTEM_ALERT = 'system_alert'
}

export interface INotification extends Document {
    notificationId: string;
    type: NotificationType;
    category: NotificationCategory;

    // Recipients
    familyId: string;
    userId?: string;

    // Content
    subject?: string;
    content: string;
    templateId?: string;
    templateData?: Record<string, any>;

    // Delivery
    status: NotificationStatus;
    sentAt?: Date;
    deliveredAt?: Date;
    readAt?: Date;
    failureReason?: string;

    // Scheduling
    scheduledFor?: Date;
    priority: number;

    // Business Context
    businessUnitId: string;

    // Audit
    createdBy: string;
    createdAt: Date;
}

export interface INotificationTemplate extends Document {
    templateId: string;
    name: string;
    category: NotificationCategory;
    type: NotificationType;

    // Content
    subject?: string;
    content: string;
    variables: string[];

    // Settings
    isActive: boolean;
    businessUnitId?: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}