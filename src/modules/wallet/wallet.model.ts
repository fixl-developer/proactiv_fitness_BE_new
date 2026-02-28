import mongoose, { Schema } from 'mongoose';
import { IWallet, CreditBucketType, TransactionType } from './wallet.interface';

const WalletSchema = new Schema<IWallet>(
    {
        walletId: { type: String, required: true, unique: true },
        userId: { type: String, required: true, unique: true, index: true },
        userName: { type: String, required: true },

        creditBuckets: [{
            bucketType: { type: String, enum: Object.values(CreditBucketType), required: true },
            balance: { type: Number, default: 0 },
            expiryDate: Date,
            restrictions: [String]
        }],

        totalBalance: { type: Number, default: 0 },

        transactions: [{
            transactionId: String,
            type: { type: String, enum: Object.values(TransactionType) },
            bucketType: { type: String, enum: Object.values(CreditBucketType) },
            amount: Number,
            balance: Number,
            description: String,
            date: { type: Date, default: Date.now },
            relatedEntity: String
        }],

        crossBrandSpending: {
            enabled: { type: Boolean, default: true },
            allowedBrands: [String]
        },

        businessUnitId: { type: String, required: true, index: true },

        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'wallets' }
);

export const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);
