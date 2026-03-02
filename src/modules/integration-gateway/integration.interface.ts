import { Document } from 'mongoose';

// Integration Interface
export interface IIntegration extends Document {
    integrationId: string;
    integrationType: 'payment_gateway' | 'accounting' | 'email_sms' | 'calendar' | 'access_control' | 'third_party_api';
    provider: string;
    name: string;
    description?: string;
    config: {
        apiKey?: string;
        apiSecret?: string;
        webhookUrl?: string;
        environment: 'sandbox' | 'production';
        customSettings?: Record<string, any>;
    };
    status: 'active' | 'inactive' | 'error' | 'pending';
    healthCheck: {
        lastChecked?: Date;
        isHealthy: boolean;
        errorMessage?: string;
    };
    usage: {
        totalCalls: number;
        successfulCalls: number;
        failedCalls: number;
        lastUsed?: Date;
    };
    businessUnitId: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Integration Log Interface
export interface IIntegrationLog extends Document {
    logId: string;
    integrationId: string;
    integrationType: string;
    provider: string;
    action: string;
    request: {
        method: string;
        endpoint: string;
        payload?: any;
    };
    response: {
        statusCode: number;
        data?: any;
        error?: string;
    };
    duration: number;
    success: boolean;
    timestamp: Date;
}

// Webhook Interface
export interface IWebhook extends Document {
    webhookId: string;
    integrationId: string;
    eventType: string;
    payload: any;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    retryCount: number;
    maxRetries: number;
    processedAt?: Date;
    errorMessage?: string;
    createdAt: Date;
}

// Request Interfaces
export interface ICreateIntegrationRequest {
    integrationType: string;
    provider: string;
    name: string;
    description?: string;
    config: {
        apiKey?: string;
        apiSecret?: string;
        webhookUrl?: string;
        environment: string;
        customSettings?: Record<string, any>;
    };
}

export interface IUpdateIntegrationRequest {
    name?: string;
    description?: string;
    config?: {
        apiKey?: string;
        apiSecret?: string;
        webhookUrl?: string;
        environment?: string;
        customSettings?: Record<string, any>;
    };
    status?: string;
}

export interface IIntegrationCallRequest {
    integrationId: string;
    action: string;
    payload: any;
}

export interface IWebhookRequest {
    integrationId: string;
    eventType: string;
    payload: any;
}
