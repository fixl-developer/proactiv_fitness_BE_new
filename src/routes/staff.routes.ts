import { Router } from 'express';
import { StaffController } from '../controllers/staff.controller';
import { authMiddleware } from '../modules/iam/auth.middleware';

const router = Router();
const staffController = new StaffController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Staff CRUD routes
router.post('/', staffController.createStaff);
router.get('/', staffController.getStaffMembers);
router.get('/:staffId', staffController.getStaffById);
router.put('/:staffId', staffController.updateStaff);

// Statistics routes
router.get('/statistics/overview', staffController.getStaffStatistics);

export default router;