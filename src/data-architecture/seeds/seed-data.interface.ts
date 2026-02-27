export interface SeedData {
    collection: string;
    environment: 'development' | 'staging' | 'production' | 'all';
    data: any[];
    idempotent: boolean;
    uniqueField?: string; // Field to check for duplicates
}

export interface SeedResult {
    collection: string;
    inserted: number;
    skipped: number;
    errors: number;
}
