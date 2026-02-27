import { Document } from 'mongoose';
import { UserRole, UserStatus, Gender, Language } from '@shared/enums';
import { IAddress, IContactInfo } from '@shared/interfaces/common.interface';

// User Document Interface
export interface IUser extends Document {
    // Basic Information
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    fullName: string;

    // Profile
    phone?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    profileImage?: string;
    language: Language;

    // Address
    address?: IAddress;

    // Role & Permissions
    role: UserRole;
    status: UserStatus;
    permissions?: string[];

    // Multi-tenancy
    tenantId?: string;
    organizationId?: string;
    locationId?: string;

    // Security
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    lastLogin?: Date;
    lastPasswordChange?: Date;
    failedLoginAttempts: number;
    lockUntil?: Date;

    // Refresh Token
    refreshToken?: string;
    refreshTokenExpires?: Date;

    // Metadata
    metadata?: Record<string, any>;

    // Methods
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateAuthToken(): string;
    generateRefreshToken(): string;
    isLocked(): boolean;
}

// DTOs (Data Transfer Objects)
export interface IUserCreate {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    dateOfBirth?: Date;
    gender?: Gender;
    language?: Language;
    tenantId?: string;
    organizationId?: string;
    locationId?: string;
}

export interface IUserUpdate {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    profileImage?: string;
    language?: Language;
    address?: IAddress;
    metadata?: Record<string, any>;
}

export interface IUserLogin {
    email: string;
    password: string;
}

export interface IUserRegister {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
    dateOfBirth?: Date;
    gender?: Gender;
    language?: Language;
}

export interface IPasswordReset {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export interface IPasswordChange {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface IAuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface IAuthResponse {
    user: IUserResponse;
    tokens: IAuthTokens;
}

export interface IUserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phone?: string;
    role: UserRole;
    status: UserStatus;
    profileImage?: string;
    language: Language;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserQuery {
    role?: UserRole;
    status?: UserStatus;
    tenantId?: string;
    organizationId?: string;
    locationId?: string;
    search?: string;
}
