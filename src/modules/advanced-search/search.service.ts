import {
    ISearchProgram,
    ISearchFilter,
    ISearchResult,
    ISearchHistory,
    ISearchAnalytics,
    IDiscoveryRecommendation,
    ISearchFacet,
    ISearchSuggestion,
    ISearchCache,
    IAdvancedSearchQuery,
    ISearchAggregation,
    ISearchBoost,
    ISearchSynonym,
    ISearchIndex,
    ISearchMetrics
} from './search.model';
import aiService from '@shared/services/ai.service';
import { AIPromptService } from '@shared/services/ai-prompt.service';
import logger from '@shared/utils/logger.util';

export class SearchService {
    private programs: Map<string, ISearchProgram> = new Map();
    private searchHistory: Map<string, ISearchHistory[]> = new Map();
    private searchAnalytics: Map<string, ISearchAnalytics> = new Map();
    private recommendations: Map<string, IDiscoveryRecommendation[]> = new Map();
    private searchCache: Map<string, ISearchCache> = new Map();
    private suggestions: Map<string, ISearchSuggestion> = new Map();
    private synonyms: Map<string, ISearchSynonym> = new Map();
    private boosts: Map<string, ISearchBoost> = new Map();
    private metrics: ISearchMetrics | null = null;

    // Initialize with sample programs
    constructor() {
        this.initializeSamplePrograms();
    }

    private initializeSamplePrograms(): void {
        const samplePrograms: ISearchProgram[] = [
            {
                programId: 'PROG-001',
                name: 'Beginner Yoga',
                description: 'Introduction to yoga for beginners',
                category: 'yoga',
                difficulty: 'beginner',
                duration: 8,
                price: 99,
                rating: 4.5,
                reviews: 150,
                instructor: 'Sarah Johnson',
                tags: ['yoga', 'flexibility', 'mindfulness'],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                programId: 'PROG-002',
                name: 'Advanced Strength Training',
                description: 'Intensive strength training program',
                category: 'strength',
                difficulty: 'advanced',
                duration: 12,
                price: 199,
                rating: 4.8,
                reviews: 200,
                instructor: 'Mike Chen',
                tags: ['strength', 'muscle', 'fitness'],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                programId: 'PROG-003',
                name: 'HIIT Cardio Blast',
                description: 'High-intensity interval training',
                category: 'cardio',
                difficulty: 'intermediate',
                duration: 6,
                price: 79,
                rating: 4.6,
                reviews: 180,
                instructor: 'Emma Wilson',
                tags: ['cardio', 'hiit', 'endurance'],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        samplePrograms.forEach(prog => this.programs.set(prog.programId, prog));
    }

    // Basic Search
    async search(query: string, filters?: Record<string, any>): Promise<ISearchResult> {
        const startTime = Date.now();
        const cacheKey = `${query}-${JSON.stringify(filters || {})}`;

        // Check cache
        const cached = this.searchCache.get(cacheKey);
        if (cached && cached.expiresAt > new Date()) {
            return cached.results;
        }

        // Perform search
        let results = Array.from(this.programs.values());

        // Apply text search
        const lowerQuery = query.toLowerCase();
        results = results.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery) ||
            p.tags.some(t => t.toLowerCase().includes(lowerQuery))
        );

        // Apply filters
        if (filters) {
            if (filters.category) {
                results = results.filter(p => p.category === filters.category);
            }
            if (filters.difficulty) {
                results = results.filter(p => p.difficulty === filters.difficulty);
            }
            if (filters.minPrice !== undefined) {
                results = results.filter(p => p.price >= filters.minPrice);
            }
            if (filters.maxPrice !== undefined) {
                results = results.filter(p => p.price <= filters.maxPrice);
            }
            if (filters.minRating !== undefined) {
                results = results.filter(p => p.rating >= filters.minRating);
            }
            if (filters.instructor) {
                results = results.filter(p => p.instructor === filters.instructor);
            }
        }

        const executionTime = Date.now() - startTime;

        const searchResult: ISearchResult = {
            resultId: `RES-${Date.now()}`,
            query,
            results,
            totalResults: results.length,
            executionTime,
            filters: this.extractFilters(results),
            createdAt: new Date()
        };

        // Cache result
        const cacheEntry: ISearchCache = {
            cacheId: `CACHE-${Date.now()}`,
            query,
            filters: filters || {},
            results: searchResult,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
            createdAt: new Date()
        };
        this.searchCache.set(cacheKey, cacheEntry);

        // Record analytics
        await this.recordSearchAnalytics(query, results.length, executionTime);

        return searchResult;
    }

    // Advanced Search with Multiple Criteria
    async advancedSearch(advancedQuery: Partial<IAdvancedSearchQuery>): Promise<ISearchResult> {
        const startTime = Date.now();
        let results = Array.from(this.programs.values());

        // Apply search terms
        if (advancedQuery.searchTerms && advancedQuery.searchTerms.length > 0) {
            results = results.filter(p =>
                advancedQuery.searchTerms!.some(term =>
                    p.name.toLowerCase().includes(term.toLowerCase()) ||
                    p.description.toLowerCase().includes(term.toLowerCase()) ||
                    p.tags.some(t => t.toLowerCase().includes(term.toLowerCase()))
                )
            );
        }

        // Apply filters
        if (advancedQuery.filters) {
            const filters = advancedQuery.filters;
            if (filters.category) {
                results = results.filter(p => p.category === filters.category);
            }
            if (filters.difficulty) {
                results = results.filter(p => p.difficulty === filters.difficulty);
            }
            if (filters.priceRange) {
                results = results.filter(p =>
                    p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
                );
            }
            if (filters.ratingRange) {
                results = results.filter(p =>
                    p.rating >= filters.ratingRange.min && p.rating <= filters.ratingRange.max
                );
            }
        }

        // Apply sorting
        if (advancedQuery.sortBy) {
            const sortOrder = advancedQuery.sortOrder === 'desc' ? -1 : 1;
            results.sort((a, b) => {
                const aVal = (a as any)[advancedQuery.sortBy!];
                const bVal = (b as any)[advancedQuery.sortBy!];
                return (aVal > bVal ? 1 : -1) * sortOrder;
            });
        }

        // Apply pagination
        const offset = advancedQuery.offset || 0;
        const limit = advancedQuery.limit || 10;
        const paginatedResults = results.slice(offset, offset + limit);

        const executionTime = Date.now() - startTime;

        return {
            resultId: `RES-${Date.now()}`,
            query: advancedQuery.searchTerms?.join(' ') || '',
            results: paginatedResults,
            totalResults: results.length,
            executionTime,
            filters: this.extractFilters(results),
            createdAt: new Date()
        };
    }

    // AI-Enhanced Search Suggestions
    async getSuggestions(query: string): Promise<ISearchSuggestion[]> {
        const suggestions: ISearchSuggestion[] = [];
        const lowerQuery = query.toLowerCase();

        // Generate suggestions from programs (existing logic)
        const programs = Array.from(this.programs.values());
        const matchingPrograms = programs.filter(p =>
            p.name.toLowerCase().startsWith(lowerQuery)
        );

        matchingPrograms.forEach(prog => {
            suggestions.push({
                suggestionId: `SUG-${Date.now()}-${Math.random()}`,
                query,
                suggestion: prog.name,
                type: 'completion',
                popularity: prog.reviews,
                createdAt: new Date()
            });
        });

        // Add related suggestions from tags
        const relatedTags = new Set<string>();
        programs.forEach(p => {
            if (p.name.toLowerCase().includes(lowerQuery)) {
                p.tags.forEach(tag => relatedTags.add(tag));
            }
        });

        relatedTags.forEach(tag => {
            suggestions.push({
                suggestionId: `SUG-${Date.now()}-${Math.random()}`,
                query,
                suggestion: tag,
                type: 'related',
                popularity: 50,
                createdAt: new Date()
            });
        });

        // AI-enhanced suggestions if basic results are sparse
        if (suggestions.length < 3) {
            try {
                const prompt = AIPromptService.searchQueryInterpretation({
                    query,
                    availableCategories: [...new Set(programs.map(p => p.category))],
                    availableTags: [...new Set(programs.flatMap(p => p.tags))],
                });

                const aiResult = await aiService.jsonCompletion<{
                    interpretedQuery: string;
                    filters: any;
                    expandedTerms: string[];
                    suggestions: string[];
                }>({
                    systemPrompt: prompt.system,
                    userPrompt: prompt.user,
                    module: 'advanced-search',
                    temperature: 0.6,
                });

                aiResult.suggestions?.forEach(suggestion => {
                    suggestions.push({
                        suggestionId: `SUG-AI-${Date.now()}-${Math.random()}`,
                        query,
                        suggestion,
                        type: 'related' as const,
                        popularity: 80,
                        createdAt: new Date(),
                    });
                });

                logger.info(`Search AI: Enhanced suggestions for "${query}" with ${aiResult.suggestions?.length || 0} AI suggestions`);
            } catch (error: any) {
                logger.warn(`Search AI suggestions failed for "${query}": ${error.message}`);
            }
        }

        return suggestions.slice(0, 10);
    }

    // AI-Powered Smart Search (natural language to structured query)
    async smartSearch(query: string): Promise<ISearchResult> {
        try {
            const programs = Array.from(this.programs.values());

            const prompt = AIPromptService.searchQueryInterpretation({
                query,
                availableCategories: [...new Set(programs.map(p => p.category))],
                availableTags: [...new Set(programs.flatMap(p => p.tags))],
            });

            const interpretation = await aiService.jsonCompletion<{
                interpretedQuery: string;
                filters: {
                    category: string | null;
                    difficulty: string | null;
                    ageRange: { min: number | null; max: number | null } | null;
                    priceRange: { min: number | null; max: number | null } | null;
                    tags: string[];
                };
                expandedTerms: string[];
                suggestions: string[];
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'advanced-search',
                temperature: 0.4,
            });

            // Build filters from AI interpretation
            const filters: Record<string, any> = {};
            if (interpretation.filters.category) filters.category = interpretation.filters.category;
            if (interpretation.filters.difficulty) filters.difficulty = interpretation.filters.difficulty;
            if (interpretation.filters.priceRange?.min) filters.minPrice = interpretation.filters.priceRange.min;
            if (interpretation.filters.priceRange?.max) filters.maxPrice = interpretation.filters.priceRange.max;

            // Search with original query + expanded terms
            const searchTerms = [query, ...interpretation.expandedTerms];
            let results = programs.filter(p =>
                searchTerms.some(term => {
                    const lower = term.toLowerCase();
                    return (
                        p.name.toLowerCase().includes(lower) ||
                        p.description.toLowerCase().includes(lower) ||
                        p.tags.some(t => t.toLowerCase().includes(lower)) ||
                        p.category.toLowerCase().includes(lower)
                    );
                })
            );

            // Apply AI-determined filters
            if (filters.category) results = results.filter(p => p.category === filters.category);
            if (filters.difficulty) results = results.filter(p => p.difficulty === filters.difficulty);
            if (filters.minPrice) results = results.filter(p => p.price >= filters.minPrice);
            if (filters.maxPrice) results = results.filter(p => p.price <= filters.maxPrice);

            logger.info(`Search AI: Smart search for "${query}" interpreted as "${interpretation.interpretedQuery}" — ${results.length} results`);

            return {
                resultId: `RES-AI-${Date.now()}`,
                query,
                results,
                totalResults: results.length,
                executionTime: 0,
                filters: this.extractFilters(results),
                createdAt: new Date(),
                aiInterpretation: interpretation,
                aiPowered: true,
            } as any;
        } catch (error: any) {
            logger.warn(`Search AI smart search failed, falling back to basic search: ${error.message}`);
            return this.search(query);
        }
    }

    // Search Facets
    async getFacets(): Promise<ISearchFacet[]> {
        const programs = Array.from(this.programs.values());
        const facets: ISearchFacet[] = [];

        // Category facet
        const categories = new Map<string, number>();
        programs.forEach(p => {
            categories.set(p.category, (categories.get(p.category) || 0) + 1);
        });

        facets.push({
            facetId: `FACET-${Date.now()}-1`,
            facetName: 'Category',
            facetType: 'category',
            values: Array.from(categories.entries()).map(([value, count]) => ({ value, count })),
            createdAt: new Date()
        });

        // Difficulty facet
        const difficulties = new Map<string, number>();
        programs.forEach(p => {
            difficulties.set(p.difficulty, (difficulties.get(p.difficulty) || 0) + 1);
        });

        facets.push({
            facetId: `FACET-${Date.now()}-2`,
            facetName: 'Difficulty',
            facetType: 'difficulty',
            values: Array.from(difficulties.entries()).map(([value, count]) => ({ value, count })),
            createdAt: new Date()
        });

        // Price range facet
        const priceRanges = [
            { value: '0-50', count: 0 },
            { value: '50-100', count: 0 },
            { value: '100-200', count: 0 },
            { value: '200+', count: 0 }
        ];

        programs.forEach(p => {
            if (p.price < 50) priceRanges[0].count++;
            else if (p.price < 100) priceRanges[1].count++;
            else if (p.price < 200) priceRanges[2].count++;
            else priceRanges[3].count++;
        });

        facets.push({
            facetId: `FACET-${Date.now()}-3`,
            facetName: 'Price Range',
            facetType: 'price',
            values: priceRanges,
            createdAt: new Date()
        });

        return facets;
    }

    // Search History
    async recordSearchHistory(userId: string, query: string, resultsCount: number, filters?: Record<string, any>): Promise<ISearchHistory> {
        const history: ISearchHistory = {
            historyId: `HIST-${Date.now()}`,
            userId,
            searchQuery: query,
            resultsCount,
            timestamp: new Date(),
            filters: filters || {}
        };

        if (!this.searchHistory.has(userId)) {
            this.searchHistory.set(userId, []);
        }
        this.searchHistory.get(userId)!.push(history);

        return history;
    }

    async getSearchHistory(userId: string, limit: number = 20): Promise<ISearchHistory[]> {
        const history = this.searchHistory.get(userId) || [];
        return history.slice(-limit).reverse();
    }

    async clearSearchHistory(userId: string): Promise<boolean> {
        this.searchHistory.delete(userId);
        return true;
    }

    // Recommendations
    async getRecommendations(userId: string): Promise<IDiscoveryRecommendation[]> {
        return this.recommendations.get(userId) || [];
    }

    async generateRecommendations(userId: string, basedOnPrograms: string[]): Promise<IDiscoveryRecommendation> {
        const basePrograms = basedOnPrograms
            .map(id => this.programs.get(id))
            .filter((p): p is ISearchProgram => p !== undefined);

        if (basePrograms.length === 0) {
            throw new Error('No valid programs provided');
        }

        const allPrograms = Array.from(this.programs.values());
        let recommendedPrograms: ISearchProgram[] = [];
        let reason = 'Based on your interests';
        let score = 0.85;

        try {
            // Use AI for personalized recommendations
            const userHistory = this.searchHistory.get(userId) || [];
            const prompt = AIPromptService.searchRecommendations({
                userHistory: userHistory.map(h => ({ query: h.searchQuery, resultsCount: h.resultsCount })),
                availablePrograms: allPrograms.filter(p => !basedOnPrograms.includes(p.programId)).map(p => ({
                    programId: p.programId,
                    name: p.name,
                    category: p.category,
                    difficulty: p.difficulty,
                    price: p.price,
                    rating: p.rating,
                    tags: p.tags,
                })),
                userProfile: { userId, enrolledPrograms: basedOnPrograms },
            });

            const aiRecs = await aiService.jsonCompletion<{
                recommendations: Array<{
                    programId: string;
                    programName: string;
                    score: number;
                    reason: string;
                }>;
                personalizedMessage: string;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'advanced-search',
                temperature: 0.7,
            });

            // Map AI recommendations to actual programs
            recommendedPrograms = aiRecs.recommendations
                .map(rec => allPrograms.find(p => p.programId === rec.programId))
                .filter((p): p is ISearchProgram => p !== undefined);

            reason = aiRecs.personalizedMessage || 'AI-personalized recommendations';
            score = aiRecs.recommendations[0]?.score || 0.9;

            logger.info(`Search AI: Generated ${recommendedPrograms.length} AI recommendations for user ${userId}`);
        } catch (error: any) {
            logger.warn(`Search AI recommendations failed, falling back to category matching: ${error.message}`);
            // Fallback: category/tag matching
            recommendedPrograms = allPrograms.filter(p =>
                !basedOnPrograms.includes(p.programId) &&
                basePrograms.some(bp =>
                    bp.category === p.category || bp.tags.some(t => p.tags.includes(t))
                )
            );
        }

        const recommendation: IDiscoveryRecommendation = {
            recommendationId: `REC-${Date.now()}`,
            userId,
            recommendedPrograms: recommendedPrograms.slice(0, 5),
            reason,
            score,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };

        if (!this.recommendations.has(userId)) {
            this.recommendations.set(userId, []);
        }
        this.recommendations.get(userId)!.push(recommendation);

        return recommendation;
    }

    // Search Analytics
    private async recordSearchAnalytics(query: string, resultsCount: number, executionTime: number): Promise<void> {
        const existing = this.searchAnalytics.get(query);

        if (existing) {
            existing.searchCount++;
            existing.avgResultsReturned = (existing.avgResultsReturned + resultsCount) / 2;
            existing.avgExecutionTime = (existing.avgExecutionTime + executionTime) / 2;
            existing.lastSearched = new Date();
        } else {
            this.searchAnalytics.set(query, {
                analyticsId: `ANAL-${Date.now()}`,
                searchTerm: query,
                searchCount: 1,
                avgResultsReturned: resultsCount,
                avgExecutionTime: executionTime,
                popularFilters: {},
                lastSearched: new Date(),
                createdAt: new Date()
            });
        }
    }

    async getSearchAnalytics(query: string): Promise<ISearchAnalytics | undefined> {
        return this.searchAnalytics.get(query);
    }

    async getTopSearches(limit: number = 10): Promise<ISearchAnalytics[]> {
        return Array.from(this.searchAnalytics.values())
            .sort((a, b) => b.searchCount - a.searchCount)
            .slice(0, limit);
    }

    // Synonyms
    async addSynonym(term: string, synonyms: string[]): Promise<ISearchSynonym> {
        const synonym: ISearchSynonym = {
            synonymId: `SYN-${Date.now()}`,
            term,
            synonyms,
            createdAt: new Date()
        };

        this.synonyms.set(term, synonym);
        return synonym;
    }

    async getSynonyms(term: string): Promise<string[]> {
        return this.synonyms.get(term)?.synonyms || [];
    }

    // Boosts
    async addBoost(field: string, boostFactor: number, condition?: Record<string, any>): Promise<ISearchBoost> {
        const boost: ISearchBoost = {
            boostId: `BOOST-${Date.now()}`,
            field,
            boostFactor,
            condition,
            createdAt: new Date()
        };

        this.boosts.set(field, boost);
        return boost;
    }

    async getBoosts(): Promise<ISearchBoost[]> {
        return Array.from(this.boosts.values());
    }

    // Metrics
    async getSearchMetrics(): Promise<ISearchMetrics> {
        const analytics = Array.from(this.searchAnalytics.values());
        const totalSearches = analytics.reduce((sum, a) => sum + a.searchCount, 0);
        const avgResponseTime = analytics.length > 0
            ? analytics.reduce((sum, a) => sum + a.avgExecutionTime, 0) / analytics.length
            : 0;

        return {
            metricsId: `METRICS-${Date.now()}`,
            totalSearches,
            uniqueSearchTerms: analytics.length,
            avgResponseTime,
            cacheHitRate: 0.75,
            errorRate: 0.01,
            period: 'daily',
            createdAt: new Date()
        };
    }

    // Helper Methods
    private extractFilters(results: ISearchProgram[]): ISearchFilter[] {
        const filters: ISearchFilter[] = [];

        // Extract categories
        const categories = new Set(results.map(r => r.category));
        filters.push({
            filterId: `FILT-${Date.now()}-1`,
            filterName: 'Category',
            filterType: 'category',
            values: Array.from(categories),
            createdAt: new Date()
        });

        // Extract difficulties
        const difficulties = new Set(results.map(r => r.difficulty));
        filters.push({
            filterId: `FILT-${Date.now()}-2`,
            filterName: 'Difficulty',
            filterType: 'difficulty',
            values: Array.from(difficulties),
            createdAt: new Date()
        });

        return filters;
    }

    // Program Management
    async addProgram(program: Partial<ISearchProgram>): Promise<ISearchProgram> {
        const newProgram: ISearchProgram = {
            programId: `PROG-${Date.now()}`,
            name: program.name || '',
            description: program.description || '',
            category: program.category || '',
            difficulty: program.difficulty || 'beginner',
            duration: program.duration || 0,
            price: program.price || 0,
            rating: program.rating || 0,
            reviews: program.reviews || 0,
            instructor: program.instructor || '',
            tags: program.tags || [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.programs.set(newProgram.programId, newProgram);
        return newProgram;
    }

    async getProgram(programId: string): Promise<ISearchProgram | undefined> {
        return this.programs.get(programId);
    }

    async getAllPrograms(): Promise<ISearchProgram[]> {
        return Array.from(this.programs.values());
    }

    async updateProgram(programId: string, updates: Partial<ISearchProgram>): Promise<ISearchProgram> {
        const program = this.programs.get(programId);
        if (!program) throw new Error('Program not found');

        const updated = { ...program, ...updates, updatedAt: new Date() };
        this.programs.set(programId, updated);
        return updated;
    }

    async deleteProgram(programId: string): Promise<boolean> {
        return this.programs.delete(programId);
    }
}
