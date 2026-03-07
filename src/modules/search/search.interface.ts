export interface ISearchQuery { query: string; filters?: any; page?: number; limit?: number; } export interface ISearchResult { results: any[]; total: number; page: number; }
