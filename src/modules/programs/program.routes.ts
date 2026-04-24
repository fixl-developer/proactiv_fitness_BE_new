import { Router } from 'express';
import { ProgramController } from './program.controller';
import { authenticate, authorize } from '../iam/auth.middleware';
import { validateBody, validateParams } from '../../middleware/joi-validation.middleware';
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
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN, UserRole.LOCATION_MANAGER),
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
    validateParams(idParamValidation),
    programController.getProgramById
);

router.get(
    '/:id/pricing',
    validateParams(idParamValidation),
    programController.getProgramPricing
);

// Protected routes (admin/manager only)
router.post(
    '/',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validateBody(createProgramValidation),
    programController.createProgram
);

router.put(
    '/:id',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validateParams(idParamValidation),
    validateBody(updateProgramValidation),
    programController.updateProgram
);

router.delete(
    '/:id',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validateParams(idParamValidation),
    programController.deleteProgram
);

router.post(
    '/:id/duplicate',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validateParams(idParamValidation),
    validateBody(duplicateProgramValidation),
    programController.duplicateProgram
);

router.patch(
    '/:id/status',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    validateParams(idParamValidation),
    programController.toggleProgramStatus
);

// Enrollment eligibility check
router.post(
    '/:id/check-eligibility',
    validateParams(idParamValidation),
    validateBody(programEligibilityValidation),
    programController.checkEligibility
);

export default router;