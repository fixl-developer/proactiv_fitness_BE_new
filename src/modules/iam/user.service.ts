import { FilterQuery } from 'mongoose';
import bcrypt from 'bcryptjs';
import { BaseService } from '@shared/base/base.service';
import { User } from './user.model';
import {
    IUser,
    IUserCreate,
    IUserUpdate,
    IUserResponse,
    IUserQuery,
} from './user.interface';
import { AppError } from '@middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';
import { UserStatus } from '@shared/enums';
import crypto from 'crypto';
import logger from '@shared/utils/logger.util';

const MAX_CONCURRENT_SESSIONS = 3;
const PASSWORD_HISTORY_SIZE = 5;

export class UserService extends BaseService<IUser> {
    constructor() {
        super(User);
    }

    /**
     * Create a new user
     */
    async createUser(data: IUserCreate): Promise<IUser> {
        // Only block on *active* duplicates — soft-deleted accounts (isDeleted: true)
        // free up the email so admins can re-create a user with the same address.
        const existingUser = await User.findOne({
            email: data.email.toLowerCase(),
            isDeleted: { $ne: true },
        });
        if (existingUser) {
            throw new AppError('User with this email already exists', HTTP_STATUS.CONFLICT);
        }

        // Create user
        const user = await this.create(data as Partial<IUser>);
        return user;
    }

    /**
     * Get user by ID
     */
    async getUserById(id: string): Promise<IUser | null> {
        return await this.findById(id);
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email: email.toLowerCase(), isDeleted: false });
    }

    /**
     * Get user by email with password (for authentication)
     */
    async getUserByEmailWithPassword(email: string): Promise<IUser | null> {
        return await User.findOne({ email: email.toLowerCase(), isDeleted: false }).select(
            '+password +refreshToken +refreshTokenExpires'
        ) as IUser | null;
    }

    /**
     * Update user
     */
    async updateUser(id: string, data: IUserUpdate): Promise<IUser | null> {
        const user = await this.update(id, data);
        if (!user) {
            throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
        }
        return user;
    }

    /**
     * Delete user (soft delete)
     */
    async deleteUser(id: string): Promise<boolean> {
        return await this.delete(id);
    }

    /**
     * Get all users with filters
     */
    async getUsers(query: IUserQuery): Promise<IUser[]> {
        const filter: FilterQuery<IUser> = {};

        if (query.role) filter.role = query.role;
        if (query.status) filter.status = query.status;
        if (query.tenantId) filter.tenantId = query.tenantId;
        if (query.organizationId) filter.organizationId = query.organizationId;
        if (query.locationId) filter.locationId = query.locationId;

        // Search by name or email
        if (query.search) {
            filter.$or = [
                { firstName: { $regex: query.search, $options: 'i' } },
                { lastName: { $regex: query.search, $options: 'i' } },
                { email: { $regex: query.search, $options: 'i' } },
            ];
        }

        return await this.findAll(filter);
    }

    /**
     * Update user status
     */
    async updateUserStatus(id: string, status: UserStatus): Promise<IUser | null> {
        return await this.update(id, { status } as any);
    }

    /**
     * Update last login
     */
    async updateLastLogin(id: string): Promise<void> {
        await User.updateOne({ _id: id }, { lastLogin: new Date() });
    }

    /**
     * Increment failed login attempts
     */
    async incrementFailedLoginAttempts(id: string): Promise<void> {
        const user = await this.findById(id);
        if (!user) return;

        const updates: any = {
            $inc: { failedLoginAttempts: 1 },
        };

        // Lock account after 5 failed attempts
        if (user.failedLoginAttempts + 1 >= 5) {
            updates.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        }

        await User.updateOne({ _id: id }, updates);
    }

    /**
     * Reset failed login attempts
     */
    async resetFailedLoginAttempts(id: string): Promise<void> {
        await User.updateOne(
            { _id: id },
            {
                failedLoginAttempts: 0,
                lockUntil: null,
            }
        );
    }

    /**
     * Generate password reset token
     */
    async generatePasswordResetToken(email: string): Promise<string> {
        const user = await this.getUserByEmail(email);
        if (!user) {
            throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save hashed token to database
        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        return resetToken; // Return unhashed token to send via email
    }

    /**
     * Reset password using token — includes password-history check
     */
    async resetPassword(token: string, newPassword: string): Promise<void> {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() },
            isDeleted: false,
        }).select('+password +passwordResetToken +passwordResetExpires +passwordHistory');

        if (!user) {
            throw new AppError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST);
        }

        // Check the new password against history
        await this.checkPasswordHistory(user, newPassword);

        // Update password
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.lastPasswordChange = new Date();
        await user.save();
    }

    /**
     * Change password — includes password-history check
     */
    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        const user = await User.findById(userId).select('+password +passwordHistory');
        if (!user) {
            throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw new AppError('Current password is incorrect', HTTP_STATUS.BAD_REQUEST);
        }

        // Check the new password against password history
        await this.checkPasswordHistory(user, newPassword);

        // Update password (pre-save hook hashes and stores old hash in history)
        user.password = newPassword;
        user.lastPasswordChange = new Date();
        await user.save();
    }

    /**
     * Verify that `plaintext` has not been used in the user's recent
     * password history.  Compares against both the current hash and the
     * stored history array.
     */
    async checkPasswordHistory(user: IUser, plaintext: string): Promise<void> {
        // Check against current password
        const matchesCurrent = await bcrypt.compare(plaintext, user.password);
        if (matchesCurrent) {
            throw new AppError(
                'New password must be different from your current password',
                HTTP_STATUS.BAD_REQUEST
            );
        }

        // Check against historical passwords
        const history = (user as any).passwordHistory || [];
        for (const oldHash of history) {
            const matchesOld = await bcrypt.compare(plaintext, oldHash);
            if (matchesOld) {
                throw new AppError(
                    `New password cannot be any of your last ${PASSWORD_HISTORY_SIZE} passwords`,
                    HTTP_STATUS.BAD_REQUEST
                );
            }
        }
    }

    /**
     * Verify email
     */
    async verifyEmail(token: string): Promise<void> {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: new Date() },
            isDeleted: false,
        }).select('+emailVerificationToken +emailVerificationExpires');

        if (!user) {
            throw new AppError('Invalid or expired verification token', HTTP_STATUS.BAD_REQUEST);
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
    }

    /**
     * Generate email verification token
     */
    async generateEmailVerificationToken(userId: string): Promise<string> {
        const user = await this.findById(userId);
        if (!user) {
            throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await user.save();

        return verificationToken;
    }

    /**
     * Save refresh token
     */
    async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
        await User.updateOne(
            { _id: userId },
            {
                refreshToken,
                refreshTokenExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            }
        );
    }

    /**
     * Verify refresh token
     */
    async verifyRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
        const user = await User.findById(userId).select('+refreshToken +refreshTokenExpires');
        if (!user) return false;

        if (
            user.refreshToken === refreshToken &&
            user.refreshTokenExpires &&
            user.refreshTokenExpires > new Date()
        ) {
            return true;
        }

        return false;
    }

    /**
     * Clear refresh token
     */
    async clearRefreshToken(userId: string): Promise<void> {
        await User.updateOne(
            { _id: userId },
            {
                refreshToken: null,
                refreshTokenExpires: null,
            }
        );
    }

    // ─────────────────────────────────────────────────────────────────────
    // Session Management
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Add a new session for the user.
     * If the user already has MAX_CONCURRENT_SESSIONS active sessions, the
     * oldest one is removed automatically.
     */
    async addSession(
        userId: string,
        token: string,
        device: string,
        ip: string
    ): Promise<void> {
        try {
            // Use findByIdAndUpdate to avoid triggering pre-save hooks (which re-hash password)
            await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        activeSessions: {
                            $each: [{ token, device, ip, createdAt: new Date() }],
                            $slice: -MAX_CONCURRENT_SESSIONS // keep only latest N sessions
                        }
                    }
                }
            );
        } catch (error) {
            // Non-critical — don't block login if session tracking fails
            logger.warn('Failed to track session', { userId, error });
        }
    }

    /**
     * Remove a specific session (logout).
     */
    async removeSession(userId: string, token: string): Promise<void> {
        await User.updateOne(
            { _id: userId },
            { $pull: { activeSessions: { token } } }
        );
    }

    /**
     * Remove all sessions (force logout everywhere).
     */
    async removeAllSessions(userId: string): Promise<void> {
        await User.updateOne(
            { _id: userId },
            { $set: { activeSessions: [] } }
        );
    }

    // ─────────────────────────────────────────────────────────────────────
    // Email Verification Enforcement
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Check whether the user is allowed to log in.
     * - Users who have not verified their email are blocked (unless they
     *   were created by an admin, which grants automatic verification skip).
     */
    async enforceEmailVerification(user: IUser): Promise<void> {
        if (user.isEmailVerified) {
            return; // all good
        }

        // Admin-created users may skip verification
        if ((user as any).createdByAdmin === true) {
            return;
        }

        // ACTIVE users (e.g. seeded demo accounts) skip verification
        if (user.status === 'ACTIVE') {
            return;
        }

        throw new AppError(
            'Please verify your email address before logging in. Check your inbox for the verification link.',
            HTTP_STATUS.FORBIDDEN
        );
    }

    /**
     * Format user response (remove sensitive data)
     */
    formatUserResponse(user: IUser): any {
        return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName || `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
            status: user.status,
            profileImage: user.profileImage,
            language: user.language,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            lastLogin: user.lastLogin,
            // Hierarchy scope fields
            organizationId: user.organizationId,
            regionId: (user as any).regionId,
            locationId: user.locationId,
            partnerType: user.partnerType,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}

export default new UserService();
