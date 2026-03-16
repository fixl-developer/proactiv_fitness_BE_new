import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { SearchService } from './search.service';

@injectable()
export class SearchController {
    constructor(@inject(SearchService) private searchService: SearchService) { }

    // Basic Search
    async search(req: Request, res: Response): Promise<void> {
        try {
            const { query, filters } = req.query;
            if (!query) {
                res.status(400).json({ success: false, error: 'Query parameter is required' });
                return;
            }

            const result = await this.searchService.search(query as string, filters as any);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Advanced Search
    async advancedSearch(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.searchService.advancedSearch(req.body);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Get Suggestions
    async getSuggestions(req: Request, res: Response): Promise<void> {
        try {
            const { query } = req.query;
            if (!query) {
                res.status(400).json({ success: false, error: 'Query parameter is required' });
                return;
            }

            const suggestions = await this.searchService.getSuggestions(query as string);
            res.status(200).json({ success: true, data: suggestions });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Get Facets
    async getFacets(req: Request, res: Response): Promise<void> {
        try {
            const facets = await this.searchService.getFacets();
            res.status(200).json({ success: true, data: facets });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Search History
    async recordSearchHistory(req: Request, res: Response): Promise<void> {
        try {
            const { userId, query, resultsCount, filters } = req.body;
            const history = await this.searchService.recordSearchHistory(userId, query, resultsCount, filters);
            res.status(201).json({ success: true, data: history });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getSearchHistory(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { limit } = req.query;
            const history = await this.searchService.getSearchHistory(userId, parseInt(limit as string) || 20);
            res.status(200).json({ success: true, data: history });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async clearSearchHistory(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const result = await this.searchService.clearSearchHistory(userId);
            res.status(200).json({ success: true, data: { cleared: result } });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Recommendations
    async getRecommendations(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const recommendations = await this.searchService.getRecommendations(userId);
            res.status(200).json({ success: true, data: recommendations });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async generateRecommendations(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { basedOnPrograms } = req.body;
            const recommendation = await this.searchService.generateRecommendations(userId, basedOnPrograms);
            res.status(201).json({ success: true, data: recommendation });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Analytics
    async getSearchAnalytics(req: Request, res: Response): Promise<void> {
        try {
            const { query } = req.query;
            if (!query) {
                res.status(400).json({ success: false, error: 'Query parameter is required' });
                return;
            }

            const analytics = await this.searchService.getSearchAnalytics(query as string);
            res.status(200).json({ success: true, data: analytics });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getTopSearches(req: Request, res: Response): Promise<void> {
        try {
            const { limit } = req.query;
            const topSearches = await this.searchService.getTopSearches(parseInt(limit as string) || 10);
            res.status(200).json({ success: true, data: topSearches });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Synonyms
    async addSynonym(req: Request, res: Response): Promise<void> {
        try {
            const { term, synonyms } = req.body;
            const synonym = await this.searchService.addSynonym(term, synonyms);
            res.status(201).json({ success: true, data: synonym });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getSynonyms(req: Request, res: Response): Promise<void> {
        try {
            const { term } = req.query;
            if (!term) {
                res.status(400).json({ success: false, error: 'Term parameter is required' });
                return;
            }

            const synonyms = await this.searchService.getSynonyms(term as string);
            res.status(200).json({ success: true, data: synonyms });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Boosts
    async addBoost(req: Request, res: Response): Promise<void> {
        try {
            const { field, boostFactor, condition } = req.body;
            const boost = await this.searchService.addBoost(field, boostFactor, condition);
            res.status(201).json({ success: true, data: boost });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getBoosts(req: Request, res: Response): Promise<void> {
        try {
            const boosts = await this.searchService.getBoosts();
            res.status(200).json({ success: true, data: boosts });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Metrics
    async getSearchMetrics(req: Request, res: Response): Promise<void> {
        try {
            const metrics = await this.searchService.getSearchMetrics();
            res.status(200).json({ success: true, data: metrics });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Program Management
    async addProgram(req: Request, res: Response): Promise<void> {
        try {
            const program = await this.searchService.addProgram(req.body);
            res.status(201).json({ success: true, data: program });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getProgram(req: Request, res: Response): Promise<void> {
        try {
            const { programId } = req.params;
            const program = await this.searchService.getProgram(programId);
            if (!program) {
                res.status(404).json({ success: false, error: 'Program not found' });
                return;
            }
            res.status(200).json({ success: true, data: program });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getAllPrograms(req: Request, res: Response): Promise<void> {
        try {
            const programs = await this.searchService.getAllPrograms();
            res.status(200).json({ success: true, data: programs });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async updateProgram(req: Request, res: Response): Promise<void> {
        try {
            const { programId } = req.params;
            const program = await this.searchService.updateProgram(programId, req.body);
            res.status(200).json({ success: true, data: program });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async deleteProgram(req: Request, res: Response): Promise<void> {
        try {
            const { programId } = req.params;
            const result = await this.searchService.deleteProgram(programId);
            res.status(200).json({ success: true, data: { deleted: result } });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }
}
