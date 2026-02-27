import { Document } from 'mongoose';

export enum LedgerEntryType {
    REVENUE = 'revenue',
    REFUND = 'refund',
    FEE = 'fee',
    DISCOUNT = 'discount',
    ADJUSTMENT = 'adjustment',
    ROYALTY = 'royalty',
    COMMISSION = 'commission'
}

export enum ReconciliationStatus {
    PENDING = 'pending',
    MATCHED = 'matched',
    DISCREPANCY = 'discrepancy',
    RESOLVED = 'resolved'
}

export interface ILedgerEntry extends Document {
    entryId: string;
    type: LedgerEntryType;

    // Financial Details
    amount: number;
    currency: string;
    description: string;

    // References
    familyId?: string;
    bookingId?: string;
    invoiceId?: string;
    transactionId?: string;

    // Business Context
    businessUnitId: string;
    locationId?: string;
    programId?: string;

    // Reconciliation
    reconciliationStatus: ReconciliationStatus;
    reconciledAt?: Date;
    reconciledBy?: string;

    // Audit
    createdBy: string;
    createdAt: Date;
}

export interface IFinancialSummary {
    totalRevenue: number;
    totalRefunds: number;
    totalFees: number;
    totalDiscounts: number;
    netRevenue: number;
    outstandingBalance: number;
    reconciliationRate: number;
}