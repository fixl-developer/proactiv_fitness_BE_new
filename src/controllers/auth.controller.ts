import { Request, Response } from 'express';
import { BaseController } from '../shared/base/base.controller';
import authService from '../modules/iam/auth.service';
import { IUserLogin, IUserRegister } from '../modules/iam/user.interface';

export class AuthController extends BaseController {
    /**
     * Register a new user
     * POST /api/v1/auth/register
     */
    async register(req: Request, res: Response) {
        const data: IUserRegister = req.body;
        const result = await authService.register(data);
        return this.sendCreated(res, result, 'User registered successfully');
    }

    /**
     * Login user
     * POST /api/v1/auth/login
     */
    async login(req: Request, res: Response) {
        const data: IUserLogin = req.body;
        const result = await authService.login(data);
        return this.sendSuccess(res, result, 'Login successful');
    }

    /**
     * Logout user
     * POST /api/v1/auth/logout
     */
    async logout(req: Request, res: Response) {
        const userId = (req as any).user.id; // From auth middleware
        await authService.logout(userId);
        return this.sendSuccess(res, null, 'Logout successful');
    }

    /**
     * Refresh access token
     * POST /api/v1/auth/refresh-token
     */
    async refreshToken(req: Request, res: Response) {
        const { refreshToken } = req.body;
        const tokens = await authService.refreshToken(refreshToken);
        return this.sendSuccess(res, tokens, 'Token refreshed successfully');
    }

    /**
     * Request password reset
     * POST /api/v1/auth/forgot-password
     */
    async forgotPassword(req: Request, res: Response) {
        const { email } = req.body;
        const token = await authService.requestPasswordReset(email);

        // In production, don't send token in response
        // Send it via email instead
        return this.sendSuccess(
            res,
            { message: 'Password reset link sent to email', token }, // Remove token in production
            'Password reset email sent'
        );
    }

    /**
     * Reset password
     * POST /api/v1/auth/reset-password
     */
    async resetPassword(req: Request, res: Response) {
        const { token, newPassword, confirmPassword } = req.body;
        await authService.resetPassword(token, newPassword, confirmPassword);
        return this.sendSuccess(res, null, 'Password reset successfully');
    }

    /**
     * Change password
     * POST /api/v1/auth/change-password
     */
    async changePassword(req: Request, res: Response) {
        const userId = (req as any).user.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;
        await authService.changePassword(userId, currentPassword, newPassword, confirmPassword);
        return this.sendSuccess(res, null, 'Password changed successfully');
    }

    /**
     * Verify email
     * POST /api/v1/auth/verify-email
     */
    async verifyEmail(req: Request, res: Response) {
        const { token } = req.body;
        await authService.verifyEmail(token);
        return this.sendSuccess(res, null, 'Email verified successfully');
    }

    /**
     * Resend email verification
     * POST /api/v1/auth/resend-verification
     */
    async resendVerification(req: Request, res: Response) {
        const userId = (req as any).user.id;
        const token = await authService.resendEmailVerification(userId);

        // In production, don't send token in response
        return this.sendSuccess(
            res,
            { message: 'Verification email sent', token }, // Remove token in production
            'Verification email sent'
        );
    }

    /**
     * Get current user
     * GET /api/v1/auth/me
     */
    async getCurrentUser(req: Request, res: Response) {
        const userId = (req as any).user.id;
        const userService = require('../modules/iam/user.service').default;
        const user = await userService.getUserById(userId);

        if (!user) {
            return this.sendNotFound(res, 'User not found');
        }

        return this.sendSuccess(res, userService.formatUserResponse(user));
    }
}

export default new AuthController();