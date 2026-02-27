import { Document } from 'mongoose';

export enum BillingCycle {
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    ANNUALLY = 'annually',
    ONE_TIME = 'one_time'
}

export enum InvoiceStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    SENT = 'sent',
    PAID = 'paid',
    OVERDUE = 'overdue',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded'
}

export enum BillingItemType {
    PROGRAM_FEE = 'program_fee',
    REGISTRATION_FEE = 'registration_fee',
    LATE_FEE = 'late_fee',
    CANCELLATION_FEE = 'cancellation_fee',
    DISCOUNT = 'discount',
    CREDIT = 'credit',
    REFUND = 'refund',
    ADJUSTMENT = 'adjustment'
}

export interface IBillingItem {
    type: BillingItemType;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    taxRate?: number;
    taxAmount?: number;
    discountAmount?: number;
    programId?: string;
    bookingId?: string;
}

export interface IInvoice extends Document {
    invoiceNumber: string;
    familyId: string;
    businessUnitId: string;

    // Billing Period
    billingPeriod: {
        startDate: Date;
        endDate: Date;
    };

    // Status and Dates
    status: InvoiceStatus;
    issueDate: Date;
    dueDate: Date;
    paidDate?: Date;

    // Items and Amounts
    items: IBillingItem[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;

    // Payment Information
    paymentTerms: string;
    paymentMethods: string[];

    // Communication
    sentDate?: Date;
    remindersSent: number;
    lastReminderDate?: Date;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBillingSchedule extends Document {
    familyId: string;
    billingCycle: BillingCycle;
    nextBillingDate: Date;
    isActive: boolean;
    autoPayEnabled: boolean;
    paymentMethodId?: string;

    // Billing Rules
    consolidateCharges: boolean;
    prorationEnabled: boolean;
    lateFeeEnabled: boolean;
    lateFeeAmount: number;
    lateFeeDays: number;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}