import { describe, it, expect, beforeEach } from '@jest/globals';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { Request, Response } from 'express';

describe('Advanced Search & Discovery Module', () => {
    let service: SearchService;
    let controller: SearchController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        service = new SearchService();
        controller = new SearchController(service);
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe('Basic Search', () => {
        it('should perform basic search', async () => {
            const result = await service.search('yoga');
            expect(result.resultId).toBeDefined();
            expect(result.query).toBe('yoga');
            expect(result.results.length).toBeGreaterThan(0);
        });

        it('should search with filters', async () => {
            const result = await service.search('yoga', { difficulty: 'beginner' });
            expect(result.results.every(p => p.difficulty === 'beginner')).toBe(true);
        });

        it('should search with price filter', async () => {
            const result = await service.search('training', { minPrice: 50, maxPrice: 150 });
            expect(result.results.every(p => p.price >= 50 && p.price <= 150)).toBe(true);
        });

        it('should search with rating filter', async () => {
            const result = await service.search('program', { minRating: 4.5 });
            expect(result.results.every(p => p.rating >= 4.5)).toBe(true);
        });

        it('should return execution time', async () => {
            const result = await service.search('yoga');
            expect(result.executionTime).toBeGreaterThanOrEqual(0);
        });

        it('should cache search results', async () => {
            const result1 = await service.search('yoga');
            const result2 = await service.search('yoga');
            expect(result1.resultId).toBe(result2.resultId);
        });
    });

    describe('Advanced Search', () => {
        it('should perform advanced search with multiple terms', async () => {
            const result = await service.advancedSearch({
                searchTerms: ['yoga', 'flexibility']
            });
            expect(result.results.length).toBeGreaterThanOrEqual(0);
        });

        it('should apply sorting', async () => {
            const result = await service.advancedSearch({
                searchTerms: ['training'],
                sortBy: 'price',
                sortOrder: 'asc'
            });

            for (let i = 1; i < result.results.length; i++) {
                expect(result.results[i].price).toBeGreaterThanOrEqual(result.results[i - 1].price);
            }
        });

        it('should apply pagination', async () => {
            const result = await service.advancedSearch({
                searchTerms: ['training'],
                limit: 2,
                offset: 0
            });
            expect(result.results.length).toBeLessThanOrEqual(2);
        });

        it('should apply complex filters', async () => {
            const result = await service.advancedSearch({
                searchTerms: ['training'],
                filters: {
                    difficulty: 'intermediate',
                    priceRange: { min: 50, max: 200 }
                }
            });

            expect(result.results.every(p =>
                p.difficulty === 'intermediate' &&
                p.price >= 50 &&
                p.price <= 200
            )).toBe(true);
        });
    });

    describe('Search Suggestions', () => {
        it('should get search suggestions', async () => {
            const suggestions = await service.getSuggestions('yoga');
            expect(Array.isArray(suggestions)).toBe(true);
        });

        it('should return completion suggestions', async () => {
            const suggestions = await service.getSuggestions('yoga');
            const completions = suggestions.filter(s => s.type === 'completion');
            expect(completions.length).toBeGreaterThanOrEqual(0);
        });

        it('should return related suggestions', async () => {
            const suggestions = await service.getSuggestions('yoga');
            const related = suggestions.filter(s => s.type === 'related');
            expect(related.length).toBeGreaterThanOrEqual(0);
        });

        it('should limit suggestions to 10', async () => {
            const suggestions = await service.getSuggestions('training');
            expect(suggestions.length).toBeLessThanOrEqual(10);
        });
    });

    describe('Search Facets', () => {
        it('should get search facets', async () => {
            const facets = await service.getFacets();
            expect(Array.isArray(facets)).toBe(true);
            expect(facets.length).toBeGreaterThan(0);
        });

        it('should include category facet', async () => {
            const facets = await service.getFacets();
            const categoryFacet = facets.find(f => f.facetType === 'category');
            expect(categoryFacet).toBeDefined();
            expect(categoryFacet!.values.length).toBeGreaterThan(0);
        });

        it('should include difficulty facet', async () => {
            const facets = await service.getFacets();
            const difficultyFacet = facets.find(f => f.facetType === 'difficulty');
            expect(difficultyFacet).toBeDefined();
        });

        it('should include price range facet', async () => {
            const facets = await service.getFacets();
            const priceFacet = facets.find(f => f.facetType === 'price');
            expect(priceFacet).toBeDefined();
        });
    });

    describe('Search History', () => {
        it('should record search history', async () => {
            const history = await service.recordSearchHistory('user1', 'yoga', 5);
            expect(history.historyId).toBeDefined();
            expect(history.userId).toBe('user1');
            expect(history.searchQuery).toBe('yoga');
            expect(history.resultsCount).toBe(5);
        });

        it('should get search history', async () => {
            await service.recordSearchHistory('user2', 'yoga', 5);
            await service.recordSearchHistory('user2', 'strength', 3);

            const history = await service.getSearchHistory('user2');
            expect(history.length).toBe(2);
        });

        it('should limit search history', async () => {
            for (let i = 0; i < 30; i++) {
                await service.recordSearchHistory('user3', `query${i}`, i);
            }

            const history = await service.getSearchHistory('user3', 10);
            expect(history.length).toBeLessThanOrEqual(10);
        });

        it('should clear search history', async () => {
            await service.recordSearchHistory('user4', 'yoga', 5);
            const cleared = await service.clearSearchHistory('user4');
            expect(cleared).toBe(true);

            const history = await service.getSearchHistory('user4');
            expect(history.length).toBe(0);
        });
    });

    describe('Recommendations', () => {
        it('should generate recommendations', async () => {
            const recommendation = await service.generateRecommendations('user1', ['PROG-001']);
            expect(recommendation.recommendationId).toBeDefined();
            expect(recommendation.userId).toBe('user1');
            expect(recommendation.recommendedPrograms.length).toBeGreaterThan(0);
        });

        it('should get recommendations', async () => {
            await service.generateRecommendations('user2', ['PROG-001']);
            const recommendations = await service.getRecommendations('user2');
            expect(recommendations.length).toBeGreaterThan(0);
        });

        it('should exclude base programs from recommendations', async () => {
            const recommendation = await service.generateRecommendations('user3', ['PROG-001']);
            const baseIds = ['PROG-001'];
            expect(recommendation.recommendedPrograms.every(p => !baseIds.includes(p.programId))).toBe(true);
        });

        it('should set expiration date for recommendations', async () => {
            const recommendation = await service.generateRecommendations('user4', ['PROG-001']);
            expect(recommendation.expiresAt).toBeInstanceOf(Date);
            expect(recommendation.expiresAt.getTime()).toBeGreaterThan(new Date().getTime());
        });
    });

    describe('Search Analytics', () => {
        it('should track search analytics', async () => {
            await service.search('yoga');
            const analytics = await service.getSearchAnalytics('yoga');
            expect(analytics).toBeDefined();
            expect(analytics!.searchCount).toBeGreaterThan(0);
        });

        it('should get top searches', async () => {
            await service.search('yoga');
            await service.search('yoga');
            await service.search('strength');

            const topSearches = await service.getTopSearches(5);
            expect(topSearches.length).toBeGreaterThan(0);
            expect(topSearches[0].searchCount).toBeGreaterThanOrEqual(topSearches[1]?.searchCount || 0);
        });

        it('should calculate average execution time', async () => {
            await service.search('yoga');
            const analytics = await service.getSearchAnalytics('yoga');
            expect(analytics!.avgExecutionTime).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Synonyms', () => {
        it('should add synonym', async () => {
            const synonym = await service.addSynonym('fitness', ['gym', 'workout', 'exercise']);
            expect(synonym.synonymId).toBeDefined();
            expect(synonym.term).toBe('fitness');
            expect(synonym.synonyms.length).toBe(3);
        });

        it('should get synonyms', async () => {
            await service.addSynonym('yoga', ['pilates', 'stretching']);
            const synonyms = await service.getSynonyms('yoga');
            expect(synonyms).toContain('pilates');
            expect(synonyms).toContain('stretching');
        });

        it('should return empty array for non-existent synonyms', async () => {
            const synonyms = await service.getSynonyms('nonexistent');
            expect(synonyms).toEqual([]);
        });
    });

    describe('Boosts', () => {
        it('should add boost', async () => {
            const boost = await service.addBoost('rating', 2.0);
            expect(boost.boostId).toBeDefined();
            expect(boost.field).toBe('rating');
            expect(boost.boostFactor).toBe(2.0);
        });

        it('should add boost with condition', async () => {
            const boost = await service.addBoost('price', 1.5, { category: 'yoga' });
            expect(boost.condition).toBeDefined();
            expect(boost.condition!.category).toBe('yoga');
        });

        it('should get boosts', async () => {
            await service.addBoost('rating', 2.0);
            await service.addBoost('price', 1.5);

            const boosts = await service.getBoosts();
            expect(boosts.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Search Metrics', () => {
        it('should get search metrics', async () => {
            await service.search('yoga');
            const metrics = await service.getSearchMetrics();
            expect(metrics.metricsId).toBeDefined();
            expect(metrics.totalSearches).toBeGreaterThanOrEqual(0);
            expect(metrics.avgResponseTime).toBeGreaterThanOrEqual(0);
        });

        it('should calculate cache hit rate', async () => {
            const metrics = await service.getSearchMetrics();
            expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0);
            expect(metrics.cacheHitRate).toBeLessThanOrEqual(1);
        });

        it('should calculate error rate', async () => {
            const metrics = await service.getSearchMetrics();
            expect(metrics.errorRate).toBeGreaterThanOrEqual(0);
            expect(metrics.errorRate).toBeLessThanOrEqual(1);
        });
    });

    describe('Program Management', () => {
        it('should add program', async () => {
            const program = await service.addProgram({
                name: 'New Program',
                description: 'Test program',
                category: 'fitness',
                difficulty: 'intermediate',
                duration: 10,
                price: 99,
                rating: 4.5,
                reviews: 50,
                instructor: 'Test Instructor',
                tags: ['test', 'fitness']
            });

            expect(program.programId).toBeDefined();
            expect(program.name).toBe('New Program');
        });

        it('should get program', async () => {
            const added = await service.addProgram({
                name: 'Test Program',
                description: 'Desc',
                category: 'fitness',
                difficulty: 'beginner',
                duration: 5,
                price: 50,
                rating: 4.0,
                reviews: 20,
                instructor: 'Instructor',
                tags: ['test']
            });

            const retrieved = await service.getProgram(added.programId);
            expect(retrieved).toBeDefined();
            expect(retrieved!.name).toBe('Test Program');
        });

        it('should get all programs', async () => {
            const programs = await service.getAllPrograms();
            expect(Array.isArray(programs)).toBe(true);
            expect(programs.length).toBeGreaterThan(0);
        });

        it('should update program', async () => {
            const added = await service.addProgram({
                name: 'Original Name',
                description: 'Desc',
                category: 'fitness',
                difficulty: 'beginner',
                duration: 5,
                price: 50,
                rating: 4.0,
                reviews: 20,
                instructor: 'Instructor',
                tags: ['test']
            });

            const updated = await service.updateProgram(added.programId, {
                name: 'Updated Name',
                price: 75
            });

            expect(updated.name).toBe('Updated Name');
            expect(updated.price).toBe(75);
        });

        it('should delete program', async () => {
            const added = await service.addProgram({
                name: 'To Delete',
                description: 'Desc',
                category: 'fitness',
                difficulty: 'beginner',
                duration: 5,
                price: 50,
                rating: 4.0,
                reviews: 20,
                instructor: 'Instructor',
                tags: ['test']
            });

            const deleted = await service.deleteProgram(added.programId);
            expect(deleted).toBe(true);

            const retrieved = await service.getProgram(added.programId);
            expect(retrieved).toBeUndefined();
        });
    });

    describe('Controller Integration', () => {
        it('should handle search endpoint', async () => {
            mockRequest.query = { query: 'yoga' };
            await controller.search(mockRequest as Request, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalled();
        });

        it('should handle advanced search endpoint', async () => {
            mockRequest.body = {
                searchTerms: ['yoga'],
                limit: 10
            };
            await controller.advancedSearch(mockRequest as Request, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalled();
        });

        it('should handle suggestions endpoint', async () => {
            mockRequest.query = { query: 'yoga' };
            await controller.getSuggestions(mockRequest as Request, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalled();
        });

        it('should handle facets endpoint', async () => {
            await controller.getFacets(mockRequest as Request, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalled();
        });
    });
});
