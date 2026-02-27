import { Document } from 'mongoose';

export enum PaymentMethodType {
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    BANK_ACCOUNT = 'bank_account',
    DIGITAL_WALLET = 'digital_wallet',
    CASH = 'cash',
    CHECK = 'check'
}

export enum PaymentGateway {
    STRIPE = 'stripe',
    PAYPAL = 'paypal',
    SQUARE = 'square',
    AUTHORIZE_NET = 'authorize_net'
}

export enum TransactionStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
    PARTIALLY_REFUNDED = 'partially_refunded'
}

export interface IPaymentMethod extends Document {
    familyId: string;
    type: PaymentMethodType;
    gateway: PaymentGateway;
    gatewayPaymentMethodId: string;

    // Card Information (encrypted)
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;

    // Bank Account Information (encrypted)
    bankName?: string;
    accountType?: string;
    routingNumber?: string;

    // Status
    isDefault: boolean;
    isActive: boolean;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITransaction extends Document {
    transactionId: string;
    familyId: string;
    invoiceId?: string;
    bookingId?: string;

    // Payment Details
    amount: number;
    currency: string;
    paymentMethodId: string;
    gateway: PaymentGateway;
    gatewayTransactionId: string;

    // Status
    status: TransactionStatus;
    failureReason?: string;

    // Dates
    processedAt?: Date;
    completedAt?: Date;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}