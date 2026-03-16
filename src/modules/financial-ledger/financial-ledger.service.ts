export class FinancialLedgerService {
    async createEntry(data: any): Promise<any> {
        return { id: 'stub', ...data };
    }

    async getEntries(tenantId: string, filters: any): Promise<any[]> {
        return [];
    }

    async getBalance(tenantId: string): Promise<any> {
        return { balance: 0, tenantId };
    }
}
