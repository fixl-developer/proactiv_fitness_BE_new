import { Document } from 'mongoose';

export enum CreditBucketType {
    CASH = 'cash',
    PROMO = 'promo',
    SCHOLARSHIP = 'scholarship',
    REFERRAL = 'referral',
    SPONSOR = 'sponsor',
    LOYALTY = 'loyalty'
}

export enum TransactionType {
    CREDIT = 'credit',
    DEBIT = 'debit',
    TRANSFER = 'transfer',
    REFUND = 'refund',
    EXPIRY = 'expiry'
}

export interface IWallet extends Document {
    walletId: string;
    userId: string;
    userName: string;

    creditBuckets: {
        bucketType: CreditBucketType;
        balance: number;
        expiryDate?: Date;
        restrictions?: string[];
    }[];

    totalBalance: number;

    transactions: {
        transactionId: string;
        type: TransactionType;
        bucketType: CreditBucketType;
        amount: number;
        balance: number;
        description: string;
        date: Date;
        relatedEntity?: string;
    }[];

    crossBrandSpending: {
        enabled: boolean;
        allowedBrands: string[];
    };

    businessUnitId: string;

    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAddCreditRequest {
    userId: string;
    bucketType: CreditBucketType;
    amount: number;
    description: string;
    expiryDate?: Date;
}

export interface IDebitRequest {
    userId: string;
    amount: number;
    description: string;
}
