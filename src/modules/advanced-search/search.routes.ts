import { Router } from 'express';
import { container } from 'tsyringe';
import { SearchController } from './search.controller';

const router = Router();
const controller = container.resolve(SearchController);

// Basic Search
router.get('/search', (req, res) => controller.search(req, res));
router.post('/search/advanced', (req, res) => controller.advancedSearch(req, res));

// Suggestions & Facets
router.get('/suggestions', (req, res) => controller.getSuggestions(req, res));
router.get('/facets', (req, res) => controller.getFacets(req, res));

// Search History
router.post('/history', (req, res) => controller.recordSearchHistory(req, res));
router.get('/history/:userId', (req, res) => controller.getSearchHistory(req, res));
router.delete('/history/:userId', (req, res) => controller.clearSearchHistory(req, res));

// Recommendations
router.get('/recommendations/:userId', (req, res) => controller.getRecommendations(req, res));
router.post('/recommendations/:userId/generate', (req, res) => controller.generateRecommendations(req, res));

// Analytics
router.get('/analytics', (req, res) => controller.getSearchAnalytics(req, res));
router.get('/analytics/top-searches', (req, res) => controller.getTopSearches(req, res));
router.get('/metrics', (req, res) => controller.getSearchMetrics(req, res));

// Synonyms
router.post('/synonyms', (req, res) => controller.addSynonym(req, res));
router.get('/synonyms', (req, res) => controller.getSynonyms(req, res));

// Boosts
router.post('/boosts', (req, res) => controller.addBoost(req, res));
router.get('/boosts', (req, res) => controller.getBoosts(req, res));

// Program Management
router.post('/programs', (req, res) => controller.addProgram(req, res));
router.get('/programs', (req, res) => controller.getAllPrograms(req, res));
router.get('/programs/:programId', (req, res) => controller.getProgram(req, res));
router.put('/programs/:programId', (req, res) => controller.updateProgram(req, res));
router.delete('/programs/:programId', (req, res) => controller.deleteProgram(req, res));

export default router;
