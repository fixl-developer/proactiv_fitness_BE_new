// Search & Discovery Models

export interface ISearchProgram {
    programId: string;
    name: string;
    description: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number; // in weeks
    price: number;
    rating: number;
    reviews: number;
    instructor: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ISearchFilter {
    filterId: string;
    filterName: string;
    filterType: 'category' | 'difficulty' | 'price' | 'rating' | 'duration' | 'instructor';
    values: string[];
    createdAt: Date;
}

export interface ISearchResult {
    resultId: string;
    query: string;
    results: ISearchProgram[];
    totalResults: number;
    executionTime: number; // in milliseconds
    filters: ISearchFilter[];
    createdAt: Date;
}

export interface ISearchHistory {
    historyId: string;
    userId: string;
    searchQuery: string;
    resultsCount: number;
    timestamp: Date;
    filters: Record<string, any>;
}

export interface ISearchAnalytics {
    analyticsId: string;
    searchTerm: string;
    searchCount: number;
    avgResultsReturned: number;
    avgExecutionTime: number;
    popularFilters: Record<string, number>;
    lastSearched: Date;
    createdAt: Date;
}

export interface IDiscoveryRecommendation {
    recommendationId: string;
    userId: string;
    recommendedPrograms: ISearchProgram[];
    reason: string;
    score: number;
    createdAt: Date;
    expiresAt: Date;
}

export interface ISearchFacet {
    facetId: string;
    facetName: string;
    facetType: string;
    values: Array<{
        value: string;
        count: number;
    }>;
    createdAt: Date;
}

export interface ISearchSuggestion {
    suggestionId: string;
    query: string;
    suggestion: string;
    type: 'correction' | 'completion' | 'related';
    popularity: number;
    createdAt: Date;
}

export interface ISearchCache {
    cacheId: string;
    query: string;
    filters: Record<string, any>;
    results: ISearchResult;
    expiresAt: Date;
    createdAt: Date;
}

export interface IAdvancedSearchQuery {
    queryId: string;
    userId: string;
    searchTerms: string[];
    filters: Record<string, any>;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    limit: number;
    offset: number;
    createdAt: Date;
}

export interface ISearchAggregation {
    aggregationId: string;
    field: string;
    aggregationType: 'count' | 'sum' | 'avg' | 'min' | 'max';
    value: number;
    createdAt: Date;
}

export interface ISearchBoost {
    boostId: string;
    field: string;
    boostFactor: number;
    condition?: Record<string, any>;
    createdAt: Date;
}

export interface ISearchSynonym {
    synonymId: string;
    term: string;
    synonyms: string[];
    createdAt: Date;
}

export interface ISearchIndex {
    indexId: string;
    indexName: string;
    fields: string[];
    analyzer: string;
    status: 'active' | 'building' | 'inactive';
    lastUpdated: Date;
    createdAt: Date;
}

export interface ISearchMetrics {
    metricsId: string;
    totalSearches: number;
    uniqueSearchTerms: number;
    avgResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
    period: string; // daily, weekly, monthly
    createdAt: Date;
}
