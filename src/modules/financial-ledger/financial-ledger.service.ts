import { FinancialLedgerModel, IFinancialLedgerDocument } from './financial-ledger.model';
import { CreateLedgerEntryDTO } from './financial-ledger.dto';

export class FinancialLedgerService {
    /**
     * Create a new ledger entry
     */
    async createEntry(data: CreateLedgerEntryDTO): Promise<IFinancialLedgerDocument> {
        try {
            const entry = await FinancialLedgerModel.create({
                entryId: `TXN-${Date.now().toString(36).toUpperCase()}`,
                tenantId: data.tenantId,
                transactionId: data.transactionId || `TR-${Date.now()}`,
                type: data.type || 'debit',
                amount: data.amount || 0,
                currency: data.currency || 'USD',
                category: data.category || 'payment',
                description: data.description || '',
                relatedEntity: data.relatedEntity || {},
                metadata: data.metadata || {},
            });
            return entry;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create ledger entry');
        }
    }

    /**
     * Get ledger entries with optional filters
     */
    async getEntries(
        tenantId: string,
        filters: {
            category?: string;
            type?: string;
            startDate?: string;
            endDate?: string;
            limit?: number;
            offset?: number;
        } = {}
    ): Promise<{ entries: IFinancialLedgerDocument[]; total: number }> {
        try {
            const { category, type, startDate, endDate, limit = 50, offset = 0 } = filters;
            const query: any = {};

            if (tenantId) {
                query.tenantId = tenantId;
            }
            if (category && category !== 'All') {
                query.category = category;
            }
            if (type) {
                query.type = type;
            }
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            const [entries, total] = await Promise.all([
                FinancialLedgerModel.find(query)
                    .sort({ createdAt: -1 })
                    .skip(Number(offset))
                    .limit(Number(limit))
                    .lean(),
                FinancialLedgerModel.countDocuments(query),
            ]);

            return { entries: entries as IFinancialLedgerDocument[], total };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get ledger entries');
        }
    }

    /**
     * Get balance summary (total credits, debits, and net balance)
     */
    async getBalance(tenantId: string): Promise<{
        totalCredit: number;
        totalDebit: number;
        balance: number;
    }> {
        try {
            const matchStage: any = {};
            if (tenantId) {
                matchStage.tenantId = tenantId;
            }

            const [creditAgg, debitAgg] = await Promise.all([
                FinancialLedgerModel.aggregate([
                    { $match: { ...matchStage, type: 'credit' } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
                FinancialLedgerModel.aggregate([
                    { $match: { ...matchStage, type: 'debit' } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
            ]);

            const totalCredit = creditAgg[0]?.total || 0;
            const totalDebit = debitAgg[0]?.total || 0;

            return {
                totalCredit,
                totalDebit,
                balance: totalCredit - totalDebit,
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get balance');
        }
    }
}
