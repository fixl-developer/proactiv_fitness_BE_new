import { BaseService, EntityContext } from '../../shared/base/base.service';
import { IPaymentMethod, ITransaction } from './payments.interface';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';
import { PaymentModel } from './payments.model';
import { FinancialLedgerModel } from '../financial-ledger/financial-ledger.model';

export class PaymentService extends BaseService<IPaymentMethod> {
    constructor() {
        super({} as any, 'payment'); // Placeholder for PaymentMethod model
    }

    protected getEntityContext(doc: any): EntityContext | null {
        return {
            locationId: doc.locationId?.toString(),
            targetUserId: doc.userId?.toString(),
        };
    }

    /**
     * Process payment
     */
    async processPayment(paymentData: any): Promise<ITransaction> {
        try {
            // Implementation for payment processing
            throw new AppError('Not implemented', HTTP_STATUS.NOT_IMPLEMENTED);
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to process payment',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Refund payment
     *
     * Looks up the payment by transactionId, marks it as REFUNDED, and writes
     * an audit row to the FinancialLedger so the refund is traceable.
     */
    async refundPayment(transactionId: string, amount?: number): Promise<any> {
        try {
            if (!transactionId) {
                throw new AppError('Transaction ID is required', HTTP_STATUS.BAD_REQUEST);
            }

            const payment = await PaymentModel.findOne({ transactionId });
            if (!payment) {
                throw new AppError('Payment not found', HTTP_STATUS.NOT_FOUND);
            }

            if (payment.status === 'refunded') {
                throw new AppError('Payment is already refunded', HTTP_STATUS.BAD_REQUEST);
            }
            if (payment.status !== 'completed') {
                throw new AppError(
                    `Only completed payments can be refunded (current status: ${payment.status})`,
                    HTTP_STATUS.BAD_REQUEST
                );
            }

            const refundAmount = amount && amount > 0 ? Math.min(amount, payment.amount) : payment.amount;

            // Mark payment as refunded
            payment.status = 'refunded';
            const existingMeta = (payment.metadata as any) || {};
            payment.metadata = {
                ...existingMeta,
                refundedAt: new Date().toISOString(),
                refundAmount,
            } as any;
            await payment.save();

            // Write audit entry to financial ledger so the refund is traceable
            try {
                await FinancialLedgerModel.create({
                    entryId: `REFUND-${Date.now().toString(36).toUpperCase()}`,
                    tenantId: payment.tenantId || 'default',
                    transactionId: payment.transactionId,
                    type: 'debit',
                    amount: refundAmount,
                    currency: payment.currency || 'USD',
                    category: 'refund',
                    description: `Refund for payment ${payment.transactionId}`,
                    relatedEntity: { entityType: 'Payment', entityId: String((payment as any)._id) },
                    metadata: {
                        reference: payment.transactionId,
                        status: 'posted',
                        date: new Date().toISOString(),
                        gateway: payment.gateway,
                        paymentMethod: payment.paymentMethod,
                    },
                });
            } catch (ledgerErr) {
                // Ledger write failures should not undo the refund itself;
                // log and continue so the admin still sees the payment as refunded.
                // eslint-disable-next-line no-console
                console.error('Failed to write refund ledger entry:', ledgerErr);
            }

            return {
                id: String((payment as any)._id),
                transactionId: payment.transactionId,
                amount: payment.amount,
                refundAmount,
                currency: payment.currency,
                status: payment.status,
                refundedAt: (payment.metadata as any)?.refundedAt,
            };
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(
                error.message || 'Failed to refund payment',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get payments by user
     */
    async getPaymentsByUser(userId: string): Promise<ITransaction[]> {
        try {
            // Return empty array for now - implementation would fetch from database
            return [];
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get payments',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get transaction by ID
     */
    async getTransaction(transactionId: string): Promise<ITransaction | null> {
        try {
            // Implementation would fetch from database
            return null;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get transaction',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get user transactions with pagination
     */
    async getUserTransactions(userId: string, limit: number = 10, offset: number = 0): Promise<ITransaction[]> {
        try {
            // Implementation would fetch from database
            return [];
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get user transactions',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Handle payment gateway webhook
     */
    async handleWebhook(gateway: string, event: any): Promise<void> {
        try {
            // Implementation would process webhook events
            console.log(`Processing webhook from ${gateway}:`, event.type);
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to handle webhook',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }
}

export const paymentService = new PaymentService();