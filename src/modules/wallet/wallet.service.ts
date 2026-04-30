import { Wallet } from './wallet.model';
import { IWallet, IAddCreditRequest, IDebitRequest, CreditBucketType, TransactionType } from './wallet.interface';
import { AppError } from '../../shared/utils/app-error.util';
import { v4 as uuidv4 } from 'uuid';

export class WalletService {
    async createWallet(userId: string, userName: string, createdBy: string): Promise<IWallet> {
        const walletId = uuidv4();

        const wallet = new Wallet({
            walletId,
            userId,
            userName,
            creditBuckets: Object.values(CreditBucketType).map(type => ({
                bucketType: type,
                balance: 0
            })),
            businessUnitId: 'bu-001',
            createdBy,
            updatedBy: createdBy
        });

        return await wallet.save();
    }

    async addCredit(data: IAddCreditRequest, userId: string): Promise<IWallet | null> {
        const wallet = await Wallet.findOne({ userId: data.userId });

        if (!wallet) {
            throw new AppError('Wallet not found', 404);
        }

        const bucket = wallet.creditBuckets.find(b => b.bucketType === data.bucketType);
        if (bucket) {
            bucket.balance += data.amount;
            if (data.expiryDate) {
                bucket.expiryDate = data.expiryDate;
            }
        }

        wallet.totalBalance += data.amount;

        wallet.transactions.push({
            transactionId: uuidv4(),
            type: TransactionType.CREDIT,
            bucketType: data.bucketType,
            amount: data.amount,
            balance: wallet.totalBalance,
            description: data.description,
            date: new Date()
        });

        wallet.updatedBy = userId;
        return await wallet.save();
    }

    async debitWallet(data: IDebitRequest, userId: string): Promise<IWallet | null> {
        const wallet = await Wallet.findOne({ userId: data.userId });

        if (!wallet) {
            throw new AppError('Wallet not found', 404);
        }

        if (wallet.totalBalance < data.amount) {
            throw new AppError('Insufficient balance', 400);
        }

        let remainingAmount = data.amount;

        // Debit priority: CASH > PROMO > REFERRAL > LOYALTY > SCHOLARSHIP > SPONSOR
        const priority = [CreditBucketType.CASH, CreditBucketType.PROMO, CreditBucketType.REFERRAL,
        CreditBucketType.LOYALTY, CreditBucketType.SCHOLARSHIP, CreditBucketType.SPONSOR];

        for (const bucketType of priority) {
            if (remainingAmount <= 0) break;

            const bucket = wallet.creditBuckets.find(b => b.bucketType === bucketType);
            if (bucket && bucket.balance > 0) {
                const debitAmount = Math.min(bucket.balance, remainingAmount);
                bucket.balance -= debitAmount;
                remainingAmount -= debitAmount;

                wallet.transactions.push({
                    transactionId: uuidv4(),
                    type: TransactionType.DEBIT,
                    bucketType,
                    amount: -debitAmount,
                    balance: wallet.totalBalance - debitAmount,
                    description: data.description,
                    date: new Date()
                });
            }
        }

        wallet.totalBalance -= data.amount;
        wallet.updatedBy = userId;

        return await wallet.save();
    }

    async getWalletBalance(userId: string): Promise<any> {
        const wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            throw new AppError('Wallet not found', 404);
        }

        return {
            walletId: wallet.walletId,
            userId: wallet.userId,
            totalBalance: wallet.totalBalance,
            creditBuckets: wallet.creditBuckets
        };
    }

    async getWallet(userId: string): Promise<IWallet | null> {
        return await Wallet.findOne({ userId }).lean();
    }
}

export const walletService = new WalletService();
