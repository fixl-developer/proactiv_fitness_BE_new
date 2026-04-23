export class CreateLedgerEntryDTO {
    tenantId: string;
    transactionId: string;
    type: 'credit' | 'debit';
    amount: number;
    currency?: string;
    category: string;
    description?: string;
    relatedEntity?: {
        entityType: string;
        entityId: string;
    };
    metadata?: Record<string, any>;
}

export class LedgerEntryResponseDTO {
    entryId: string;
    type: string;
    amount: number;
    category: string;
    createdAt: Date;
}
