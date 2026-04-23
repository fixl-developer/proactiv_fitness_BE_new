// Request DTOs
export interface SearchRequest {
    query: string;
    filters?: {
        category?: string;
        difficulty?: string;
        minPrice?: number;
        maxPrice?: number;
        minRating?: number;
        instructor?: string;
    };
}

export interface AdvancedSearchRequest {
    searchTerms: string[];
    filters?: {
        category?: string;
        difficulty?: string;
        priceRange?: { min: number; max: number };
        ratingRange?: { min: number; max: number };
    };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}

export interface RecordSearchHistoryRequest {
    userId: string;
    query: string;
    resultsCount: number;
    filters?: Record<string, any>;
}

export interface GenerateRecommendationsRequest {
    basedOnPrograms: string[];
}

export interface AddSynonymRequest {
    term: string;
    synonyms: string[];
}

export interface AddBoostRequest {
    field: string;
    boostFactor: number;
    condition?: Record<string, any>;
}

export interface AddProgramRequest {
    name: string;
    description: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    price: number;
    rating: number;
    reviews: number;
    instructor: string;
    tags: string[];
}

export interface UpdateProgramRequest {
    name?: string;
    description?: string;
    category?: string;
    difficulty?: string;
    duration?: number;
    price?: number;
    rating?: number;
    reviews?: number;
    instructor?: string;
    tags?: string[];
}

// Response DTOs
export interface SearchResultResponse {
    resultId: string;
    query: string;
    results: SearchProgramResponse[];
    totalResults: number;
    executionTime: number;
    filters: SearchFilterResponse[];
    createdAt: Date;
}

export interface SearchProgramResponse {
    programId: string;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    duration: number;
    price: number;
    rating: number;
    reviews: number;
    instructor: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface SearchFilterResponse {
    filterId: string;
    filterName: string;
    filterType: string;
    values: string[];
    createdAt: Date;
}

export interface SearchSuggestionResponse {
    suggestionId: string;
    query: string;
    suggestion: string;
    type: 'correction' | 'completion' | 'related';
    popularity: number;
    createdAt: Date;
}

export interface SearchFacetResponse {
    facetId: string;
    facetName: string;
    facetType: string;
    values: Array<{
        value: string;
        count: number;
    }>;
    createdAt: Date;
}

export interface SearchHistoryResponse {
    historyId: string;
    userId: string;
    searchQuery: string;
    resultsCount: number;
    timestamp: Date;
    filters: Record<string, any>;
}

export interface DiscoveryRecommendationResponse {
    recommendationId: string;
    userId: string;
    recommendedPrograms: SearchProgramResponse[];
    reason: string;
    score: number;
    createdAt: Date;
    expiresAt: Date;
}

export interface SearchAnalyticsResponse {
    analyticsId: string;
    searchTerm: string;
    searchCount: number;
    avgResultsReturned: number;
    avgExecutionTime: number;
    popularFilters: Record<string, number>;
    lastSearched: Date;
    createdAt: Date;
}

export interface SearchSynonymResponse {
    synonymId: string;
    term: string;
    synonyms: string[];
    createdAt: Date;
}

export interface SearchBoostResponse {
    boostId: string;
    field: string;
    boostFactor: number;
    condition?: Record<string, any>;
    createdAt: Date;
}

export interface SearchMetricsResponse {
    metricsId: string;
    totalSearches: number;
    uniqueSearchTerms: number;
    avgResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
    period: string;
    createdAt: Date;
}

// Generic Response Wrapper
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
