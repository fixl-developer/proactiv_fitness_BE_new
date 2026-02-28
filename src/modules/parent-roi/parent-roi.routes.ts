import { Router } from 'express';
import { ParentROIController } from './parent-roi.controller';

const router = Router();
const controller = new ParentROIController();

// ROI Dashboard Routes
router.post('/calculate', controller.calculateROI);
router.get('/dashboard/:childId', controller.getROIDashboard);
router.get('/summary/:childId', controller.getROISummary);

// Report Generation Routes
router.post('/reports/generate', controller.generateReport);

export default router;
