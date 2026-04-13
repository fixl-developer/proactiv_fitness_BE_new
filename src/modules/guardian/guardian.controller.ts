import { Request, Response } from 'express';
import guardianService from './guardian.service';
import { HTTP_STATUS } from '@shared/constants';
import logger from '@shared/utils/logger.util';

class GuardianController {
    /**
     * POST /api/v1/user/guardians
     * Add a guardian link for the authenticated user (student)
     */
    async addGuardian(req: Request, res: Response): Promise<void> {
        try {
            const studentId = req.user!.id;
            const tenantId = req.user!.tenantId;
            const link = await guardianService.addGuardian(studentId, req.body, tenantId);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Guardian added successfully. An invitation has been sent.',
                data: link,
            });
        } catch (error: any) {
            logger.error('Error adding guardian', { error: error.message, userId: req.user?.id });
            const status = error.message.includes('not found') ? HTTP_STATUS.NOT_FOUND
                : error.message.includes('already linked') ? HTTP_STATUS.CONFLICT
                : HTTP_STATUS.BAD_REQUEST;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to add guardian',
            });
        }
    }

    /**
     * GET /api/v1/user/guardians
     * Get all guardians for the authenticated user
     */
    async getMyGuardians(req: Request, res: Response): Promise<void> {
        try {
            const studentId = req.user!.id;
            const guardians = await guardianService.getStudentGuardians(studentId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: guardians,
                count: guardians.length,
            });
        } catch (error: any) {
            logger.error('Error getting guardians', { error: error.message, userId: req.user?.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to fetch guardians',
            });
        }
    }

    /**
     * GET /api/v1/user/guardians/students
     * Get all students linked to the authenticated guardian
     */
    async getMyStudents(req: Request, res: Response): Promise<void> {
        try {
            const guardianId = req.user!.id;
            const students = await guardianService.getGuardianStudents(guardianId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: students,
                count: students.length,
            });
        } catch (error: any) {
            logger.error('Error getting students', { error: error.message, userId: req.user?.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to fetch students',
            });
        }
    }

    /**
     * GET /api/v1/user/guardians/:id
     * Get a single guardian link by ID
     */
    async getGuardianLink(req: Request, res: Response): Promise<void> {
        try {
            const link = await guardianService.getGuardianLinkById(req.params.id);
            if (!link) {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: 'Guardian link not found',
                });
                return;
            }

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: link,
            });
        } catch (error: any) {
            logger.error('Error getting guardian link', { error: error.message });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to fetch guardian link',
            });
        }
    }

    /**
     * PUT /api/v1/user/guardians/:id
     * Update a guardian link
     */
    async updateGuardianLink(req: Request, res: Response): Promise<void> {
        try {
            const studentId = req.user!.id;
            const link = await guardianService.updateGuardianLink(req.params.id, studentId, req.body);

            if (!link) {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: 'Guardian link not found',
                });
                return;
            }

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Guardian link updated successfully',
                data: link,
            });
        } catch (error: any) {
            logger.error('Error updating guardian link', { error: error.message, userId: req.user?.id });
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || 'Failed to update guardian link',
            });
        }
    }

    /**
     * DELETE /api/v1/user/guardians/:id
     * Remove a guardian link
     */
    async removeGuardianLink(req: Request, res: Response): Promise<void> {
        try {
            const studentId = req.user!.id;
            const removed = await guardianService.removeGuardianLink(req.params.id, studentId);

            if (!removed) {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: 'Guardian link not found',
                });
                return;
            }

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Guardian link removed successfully',
            });
        } catch (error: any) {
            logger.error('Error removing guardian link', { error: error.message, userId: req.user?.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to remove guardian link',
            });
        }
    }

    /**
     * POST /api/v1/user/guardians/:id/accept
     * Accept a guardian link invitation (guardian side)
     */
    async acceptInvitation(req: Request, res: Response): Promise<void> {
        try {
            const guardianUserId = req.user!.id;
            const link = await guardianService.acceptInvitation(req.params.id, guardianUserId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Guardian link accepted successfully',
                data: link,
            });
        } catch (error: any) {
            logger.error('Error accepting invitation', { error: error.message, userId: req.user?.id });
            const status = error.message.includes('not found') || error.message.includes('already processed')
                ? HTTP_STATUS.NOT_FOUND
                : error.message.includes('not authorized')
                    ? HTTP_STATUS.FORBIDDEN
                    : HTTP_STATUS.BAD_REQUEST;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to accept invitation',
            });
        }
    }

    /**
     * POST /api/v1/user/guardians/:id/reject
     * Reject a guardian link invitation (guardian side)
     */
    async rejectInvitation(req: Request, res: Response): Promise<void> {
        try {
            const guardianUserId = req.user!.id;
            const link = await guardianService.rejectInvitation(req.params.id, guardianUserId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Guardian link rejected',
                data: link,
            });
        } catch (error: any) {
            logger.error('Error rejecting invitation', { error: error.message, userId: req.user?.id });
            const status = error.message.includes('not found') ? HTTP_STATUS.NOT_FOUND
                : error.message.includes('not authorized') ? HTTP_STATUS.FORBIDDEN
                : HTTP_STATUS.BAD_REQUEST;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to reject invitation',
            });
        }
    }

    /**
     * POST /api/v1/user/guardians/accept-by-token
     * Accept invitation via token (email link)
     */
    async acceptByToken(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.body;
            if (!token) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Invitation token is required',
                });
                return;
            }

            const guardianUserId = req.user!.id;
            const link = await guardianService.acceptByToken(token, guardianUserId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Guardian link accepted via invitation',
                data: link,
            });
        } catch (error: any) {
            logger.error('Error accepting by token', { error: error.message });
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || 'Failed to accept invitation',
            });
        }
    }

    /**
     * POST /api/v1/user/guardians/:id/resend
     * Resend invitation to guardian
     */
    async resendInvitation(req: Request, res: Response): Promise<void> {
        try {
            const studentId = req.user!.id;
            const link = await guardianService.resendInvitation(req.params.id, studentId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Invitation resent successfully',
                data: link,
            });
        } catch (error: any) {
            logger.error('Error resending invitation', { error: error.message, userId: req.user?.id });
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || 'Failed to resend invitation',
            });
        }
    }

    /**
     * GET /api/v1/user/guardians/invitations/pending
     * Get pending invitations for the authenticated user (as a guardian)
     */
    async getPendingInvitations(req: Request, res: Response): Promise<void> {
        try {
            const guardianUserId = req.user!.id;
            const invitations = await guardianService.getPendingInvitations(guardianUserId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: invitations,
                count: invitations.length,
            });
        } catch (error: any) {
            logger.error('Error getting pending invitations', { error: error.message, userId: req.user?.id });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to fetch invitations',
            });
        }
    }

    /**
     * GET /api/v1/user/guardians/search
     * Search users to add as guardian
     */
    async searchGuardianUsers(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query.q as string || '';
            const studentId = req.user!.id;
            const users = await guardianService.searchGuardianUsers(query, studentId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: users,
                count: users.length,
            });
        } catch (error: any) {
            logger.error('Error searching guardian users', { error: error.message });
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to search users',
            });
        }
    }
}

export default new GuardianController();
