import { Router } from 'express';
import { StaffController } from '../controllers/staff.controller';
import { authMiddleware } from '../modules/iam/auth.middleware';

const router = Router();
const staffController = new StaffController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Staff CRUD routes
router.post('/staff', staffController.createStaff);
router.get('/staff', staffController.getStaffMembers);
router.get('/staff/:staffId', staffController.getStaffById);
router.put('/staff/:staffId', staffController.updateStaff);

// Statistics routes
router.get('/staff/statistics/overview', staffController.getStaffStatistics);

export default router;