import { Schema, model } from 'mongoose';
import { LedgerEntry } from '../interfaces';
import { COLLECTIONS } from '../constants';

const ledgerEntrySchema = new Schema<LedgerEntry>(
    {
        transactionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        accountId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
            default: 'USD',
        },
        type: {
            type: String,
            enum: ['debit', 'credit'],
            required: true,
        },
        timestamp: {
            type: Date,
            required: true,
            default: Date.now,
            index: true,
        },
        description: {
            type: String,
            required: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        locationId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        businessUnitId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
        collection: COLLECTIONS.LEDGER_ENTRIES,
    }
);

// Compound indexes
ledgerEntrySchema.index({ locationId: 1, timestamp: -1 });
ledgerEntrySchema.index({ accountId: 1, timestamp: -1 });

// Prevent updates and deletes (append-only)
ledgerEntrySchema.pre('updateOne', function (next) {
    next(new Error('Ledger entries cannot be updated'));
});

ledgerEntrySchema.pre('findOneAndUpdate', function (next) {
    next(new Error('Ledger entries cannot be updated'));
});

ledgerEntrySchema.pre('deleteOne', function (next) {
    next(new Error('Ledger entries cannot be deleted'));
});

export const LedgerEntryModel = model<LedgerEntry>(
    COLLECTIONS.LEDGER_ENTRIES,
    ledgerEntrySchema
);
