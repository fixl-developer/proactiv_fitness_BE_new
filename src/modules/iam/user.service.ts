import { FilterQuery } from 'mongoose';
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

export class UserService extends BaseService<IUser> {
    constructor() {
        super(User);
    }

    /**
     * Create a new user
     */
    async createUser(data: IUserCreate): Promise<IUser> {
        // Check if user already exists
        const existingUser = await User.findOne({ email: data.email.toLowerCase() });
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
        );
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
     * Reset password using token
     */
    async resetPassword(token: string, newPassword: string): Promise<void> {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() },
            isDeleted: false,
        }).select('+passwordResetToken +passwordResetExpires');

        if (!user) {
            throw new AppError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST);
        }

        // Update password
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.lastPasswordChange = new Date();
        await user.save();
    }

    /**
     * Change password
     */
    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        const user = await User.findById(userId).select('+password');
        if (!user) {
            throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw new AppError('Current password is incorrect', HTTP_STATUS.BAD_REQUEST);
        }

        // Update password
        user.password = newPassword;
        user.lastPasswordChange = new Date();
        await user.save();
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

    /**
     * Format user response (remove sensitive data)
     */
    formatUserResponse(user: IUser): IUserResponse {
        return {
            id: user._id.toString(),
            email: user.email,
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
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}

export default new UserService();
