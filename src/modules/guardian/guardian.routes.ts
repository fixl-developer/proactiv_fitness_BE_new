import { Router } from 'express';
import guardianController from './guardian.controller';
import { authenticate } from '../iam/auth.middleware';
import { sanitizeInput } from '../iam/security.middleware';
import { asyncHandler } from '@shared/utils/async-handler.util';

const router = Router();

// Sanitize all inputs
router.use(sanitizeInput());

// All routes require authentication
router.use(authenticate);

// Search users to add as guardian (must be before /:id routes)
router.get(
    '/search',
    asyncHandler(guardianController.searchGuardianUsers.bind(guardianController))
);

// Get pending invitations for the current user (as guardian)
router.get(
    '/invitations/pending',
    asyncHandler(guardianController.getPendingInvitations.bind(guardianController))
);

// Get all students linked to me (as guardian)
router.get(
    '/students',
    asyncHandler(guardianController.getMyStudents.bind(guardianController))
);

// Accept invitation via token
router.post(
    '/accept-by-token',
    asyncHandler(guardianController.acceptByToken.bind(guardianController))
);

// CRUD for guardian links
router.get(
    '/',
    asyncHandler(guardianController.getMyGuardians.bind(guardianController))
);

router.post(
    '/',
    asyncHandler(guardianController.addGuardian.bind(guardianController))
);

router.get(
    '/:id',
    asyncHandler(guardianController.getGuardianLink.bind(guardianController))
);

router.put(
    '/:id',
    asyncHandler(guardianController.updateGuardianLink.bind(guardianController))
);

router.delete(
    '/:id',
    asyncHandler(guardianController.removeGuardianLink.bind(guardianController))
);

// Invitation actions
router.post(
    '/:id/accept',
    asyncHandler(guardianController.acceptInvitation.bind(guardianController))
);

router.post(
    '/:id/reject',
    asyncHandler(guardianController.rejectInvitation.bind(guardianController))
);

router.post(
    '/:id/resend',
    asyncHandler(guardianController.resendInvitation.bind(guardianController))
);

export default router;
