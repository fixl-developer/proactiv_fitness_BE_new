import jwt from 'jsonwebtoken';
import { IUser, IUserLogin, IUserRegister, IAuthResponse, IAuthTokens } from './user.interface';
import userService from './user.service';
import { AppError } from '@middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';
import envConfig from '@config/env.config';
import logger from '@shared/utils/logger.util';

export class AuthService {
    /**
     * Register a new user
     * Status is set to PENDING until email is verified.
     */
    async register(data: IUserRegister): Promise<IAuthResponse> {
        // Validate password match
        if (data.password !== data.confirmPassword) {
            throw new AppError('Passwords do not match', HTTP_STATUS.BAD_REQUEST);
        }

        // Create user with PENDING status until email verification
        const user = await userService.createUser({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            role: data.role || 'PARENT' as any,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            language: data.language,
        });

        // Set status to PENDING until email is verified
        await userService.updateUserStatus(user._id.toString(), 'PENDING' as any);

        // Generate tokens
        const tokens = this.generateTokens(user);

        // Save refresh token
        await userService.saveRefreshToken(user._id.toString(), tokens.refreshToken);

        // Generate email verification token (for future email service)
        await userService.generateEmailVerificationToken(user._id.toString());

        logger.info('User registered successfully (pending email verification)', {
            userId: user._id,
            email: user.email,
        });

        return {
            user: userService.formatUserResponse(user),
            tokens,
        };
    }

    /**
     * Login user — now enforces email verification and tracks sessions.
     */
    async login(data: IUserLogin, meta?: { device?: string; ip?: string }): Promise<IAuthResponse> {
        // Get user with password
        const user = await userService.getUserByEmailWithPassword(data.email);

        if (!user) {
            throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
        }

        // Check if account is locked
        if (user.isLocked()) {
            throw new AppError(
                'Account is temporarily locked due to multiple failed login attempts',
                HTTP_STATUS.FORBIDDEN
            );
        }

        // Enforce email verification (admin-created users are exempt)
        await userService.enforceEmailVerification(user);

        // Check if account is active (PENDING users are caught by verification check above)
        if (user.status !== 'ACTIVE' && user.status !== 'PENDING') {
            throw new AppError('Account is not active', HTTP_STATUS.FORBIDDEN);
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(data.password);

        if (!isPasswordValid) {
            // Increment failed login attempts
            await userService.incrementFailedLoginAttempts(user._id.toString());
            throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
        }

        // Reset failed login attempts
        await userService.resetFailedLoginAttempts(user._id.toString());

        // Update last login
        await userService.updateLastLogin(user._id.toString());

        // Generate tokens
        const tokens = this.generateTokens(user);

        // Save refresh token
        await userService.saveRefreshToken(user._id.toString(), tokens.refreshToken);

        // Track active session (limit to 3 concurrent sessions)
        await userService.addSession(
            user._id.toString(),
            tokens.accessToken,
            meta?.device || 'unknown',
            meta?.ip || ''
        );

        logger.info('User logged in successfully', { userId: user._id, email: user.email });

        return {
            user: userService.formatUserResponse(user),
            tokens,
        };
    }

    /**
     * Logout user — clears refresh token and removes the active session.
     */
    async logout(userId: string, accessToken?: string): Promise<void> {
        await userService.clearRefreshToken(userId);

        // Remove the specific session if a token is provided, otherwise clear all
        if (accessToken) {
            await userService.removeSession(userId, accessToken);
        } else {
            await userService.removeAllSessions(userId);
        }

        logger.info('User logged out', { userId });
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<IAuthTokens> {
        try {
            // Verify refresh token
            const decoded: any = jwt.verify(refreshToken, envConfig.get().jwtRefreshSecret);

            // Get user
            const user = await userService.getUserById(decoded.id);
            if (!user) {
                throw new AppError('User not found', HTTP_STATUS.UNAUTHORIZED);
            }

            // Verify refresh token in database
            const isValid = await userService.verifyRefreshToken(decoded.id, refreshToken);
            if (!isValid) {
                throw new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED);
            }

            // Generate new tokens
            const tokens = this.generateTokens(user);

            // Save new refresh token
            await userService.saveRefreshToken(user._id.toString(), tokens.refreshToken);

            return tokens;
        } catch (error) {
            throw new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED);
        }
    }

    /**
     * Request password reset
     */
    async requestPasswordReset(email: string): Promise<string> {
        const token = await userService.generatePasswordResetToken(email);

        // TODO: Send email with reset link
        // For now, return token (in production, this should be sent via email)

        logger.info('Password reset requested', { email });
        return token;
    }

    /**
     * Reset password
     */
    async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<void> {
        if (newPassword !== confirmPassword) {
            throw new AppError('Passwords do not match', HTTP_STATUS.BAD_REQUEST);
        }

        await userService.resetPassword(token, newPassword);
        logger.info('Password reset successfully');
    }

    /**
     * Change password
     */
    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string,
        confirmPassword: string
    ): Promise<void> {
        if (newPassword !== confirmPassword) {
            throw new AppError('Passwords do not match', HTTP_STATUS.BAD_REQUEST);
        }

        await userService.changePassword(userId, currentPassword, newPassword);
        logger.info('Password changed successfully', { userId });
    }

    /**
     * Verify email
     */
    async verifyEmail(token: string): Promise<void> {
        await userService.verifyEmail(token);
        logger.info('Email verified successfully');
    }

    /**
     * Resend email verification
     */
    async resendEmailVerification(userId: string): Promise<string> {
        const token = await userService.generateEmailVerificationToken(userId);

        // TODO: Send verification email
        // For now, return token

        logger.info('Email verification resent', { userId });
        return token;
    }

    /**
     * Verify JWT token
     */
    verifyToken(token: string): any {
        try {
            return jwt.verify(token, envConfig.get().jwtSecret);
        } catch (error) {
            throw new AppError('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED);
        }
    }

    /**
     * Generate access and refresh tokens
     */
    private generateTokens(user: IUser): IAuthTokens {
        const accessToken = user.generateAuthToken();
        const refreshToken = user.generateRefreshToken();

        // Parse expiry time (e.g., "7d" -> 7 days in seconds)
        const expiresIn = this.parseExpiryTime(envConfig.get().jwtExpiresIn);

        return {
            accessToken,
            refreshToken,
            expiresIn,
        };
    }

    /**
     * Parse expiry time string to seconds
     */
    private parseExpiryTime(expiryString: string): number {
        const unit = expiryString.slice(-1);
        const value = parseInt(expiryString.slice(0, -1));

        switch (unit) {
            case 's':
                return value;
            case 'm':
                return value * 60;
            case 'h':
                return value * 60 * 60;
            case 'd':
                return value * 24 * 60 * 60;
            default:
                return 7 * 24 * 60 * 60; // Default 7 days
        }
    }
}

export default new AuthService();
