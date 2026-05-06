import { Router } from 'express';
import { TrainingResourceController } from './training-resource.controller';
import { authenticate, authorize } from '../iam/auth.middleware';
import { UserRole } from '../../shared/enums';

const router = Router();
const controller = new TrainingResourceController();

router.use(authenticate);

// Roles allowed to manage (create / update / delete) training resources.
// Anyone authenticated can view + record their own opens.
const MANAGER_ROLES = [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.REGIONAL_ADMIN,
    UserRole.FRANCHISE_OWNER,
    UserRole.LOCATION_MANAGER,
    UserRole.MANAGER,
];

// Personal stats for the current user (must be before /:id)
router.get('/me/stats', controller.myStats);

// Public list / detail
router.get('/', controller.list);
router.get('/:id', controller.getOne);

// Track that current user opened a resource
router.post('/:id/view', controller.recordView);

// Admin / manager CRUD
router.post('/', authorize(...MANAGER_ROLES), controller.create);
router.put('/:id', authorize(...MANAGER_ROLES), controller.update);
router.delete('/:id', authorize(...MANAGER_ROLES), controller.remove);

export default router;
