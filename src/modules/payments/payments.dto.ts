export class ProcessPaymentDTO {
    userId: string;
    tenantId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    gateway: string;
    description?: string;
    metadata?: Record<string, any>;
}

export class RefundPaymentDTO {
    transactionId: string;
    amount: number;
    reason?: string;
}

export class PaymentResponseDTO {
    transactionId: string;
    status: string;
    amount: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}
