import { Router } from 'express';
import { FranchiseController } from './franchise.controller';

const router = Router();
const controller = new FranchiseController();

// Franchise Management Routes
router.post('/', controller.createFranchise);
router.get('/', controller.getAllFranchises);
router.get('/:franchiseId/summary', controller.getFranchiseSummary);
router.get('/:franchiseId/dashboard', controller.getFranchiseDashboard);
router.put('/:franchiseId', controller.updateFranchise);

// Royalty Routes
router.post('/royalty/calculate', controller.calculateRoyalty);

// P&L Routes
router.post('/pl/generate', controller.generatePL);

export default router;
