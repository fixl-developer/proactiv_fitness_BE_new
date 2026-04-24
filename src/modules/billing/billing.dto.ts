export class CreateBillingDTO {
    userId: string;
    tenantId: string;
    amount: number;
    billingPeriod: 'monthly' | 'quarterly' | 'annual';
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }>;
    dueDate: Date;
    notes?: string;
}

export class BillingResponseDTO {
    billingId: string;
    userId: string;
    amount: number;
    status: string;
    dueDate: Date;
    createdAt: Date;
}
