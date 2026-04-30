export class SendNotificationDTO {
    userId: string;
    tenantId: string;
    type: 'email' | 'sms' | 'push' | 'in_app';
    category: 'booking' | 'payment' | 'alert' | 'reminder' | 'announcement';
    title: string;
    message: string;
    recipient: string;
    metadata?: Record<string, any>;
}

export class NotificationResponseDTO {
    id: string;
    userId: string;
    type: string;
    category: string;
    title: string;
    message: string;
    status: string;
    createdAt: Date;
    sentAt?: Date;
    readAt?: Date;
}
