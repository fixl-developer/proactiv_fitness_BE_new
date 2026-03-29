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

    // Multi-tenancy & Hierarchy
    tenantId?: string;
    organizationId?: string;  // Business Unit / Franchise ID
    regionId?: string;        // Region ID (for REGIONAL_ADMIN scope)
    locationId?: string;      // Location ID (for LOCATION_MANAGER scope)
    partnerType?: string;     // Partner type (for PARTNER_ADMIN)

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

    // Password history (last 5 hashed passwords)
    passwordHistory?: string[];

    // Active sessions
    activeSessions?: Array<{
        token: string;
        device: string;
        ip: string;
        createdAt: Date;
    }>;

    // GDPR consent
    gdprConsent?: {
        dataProcessing: boolean;
        marketing: boolean;
        analytics: boolean;
        consentDate?: Date;
        consentIp?: string;
    };

    // Whether the user was created by an admin
    createdByAdmin?: boolean;

    // Metadata
    metadata?: Record<string, any>;

    // Timestamps (from Mongoose)
    createdAt?: Date;
    updatedAt?: Date;

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
    regionId?: string;
    locationId?: string;
    partnerType?: string;
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
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserQuery {
    role?: UserRole;
    status?: UserStatus;
    tenantId?: string;
    organizationId?: string;
    locationId?: string;
    search?: string;
}
