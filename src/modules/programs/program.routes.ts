import { Router } from 'express';
import { ProgramController } from './program.controller';
import { authenticate, authorize } from '../iam/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { UserRole } from '../../shared/enums';
import {
    createProgramValidation,
    updateProgramValidation,
    programEligibilityValidation,
    duplicateProgramValidation,
    idParamValidation
} from './program.validation';

const router = Router();
const programController = new ProgramController();

// Apply authentication to all routes
router.use(authenticate);

// Public routes (authenticated users)
router.get(
    '/',
    programController.getPrograms
);

router.get(
    '/search',
    programController.searchPrograms
);

router.get(
    '/categories',
    programController.getCategories
);

router.get(
    '/statistics',
    authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    programController.getProgramStatistics
);

router.get(
    '/category/:category',
    programController.getProgramsByCategory
);

router.get(
    '/age/:age/:ageType',
    programController.getProgramsForAge
);

router.get(
    '/:id',
    validate(idParamValidation),
    programController.getProgramById
);

router.get(
    '/:id/pricing',
    validate(idParamValidation),
    programController.getProgramPricing
);

// Protected routes (admin/manager only)
router.post(
    '/',
    authorize([UserRole.ADMIN, UserRole.MANAGER]),
    validate(createProgramValidation),
    programController.createProgram
);

router.put(
    '/:id',
    authorize([UserRole.ADMIN, UserRole.MANAGER]),
    validate(idParamValidation),
    validate(updateProgramValidation),
    programController.updateProgram
);

router.delete(
    '/:id',
    authorize([UserRole.ADMIN, UserRole.MANAGER]),
    validate(idParamValidation),
    programController.deleteProgram
);

router.post(
    '/:id/duplicate',
    authorize([UserRole.ADMIN, UserRole.MANAGER]),
    validate(idParamValidation),
    validate(duplicateProgramValidation),
    programController.duplicateProgram
);

router.patch(
    '/:id/status',
    authorize([UserRole.ADMIN, UserRole.MANAGER]),
    validate(idParamValidation),
    programController.toggleProgramStatus
);

// Enrollment eligibility check
router.post(
    '/:id/check-eligibility',
    validate(idParamValidation),
    validate(programEligibilityValidation),
    programController.checkEligibility
);

export default router;