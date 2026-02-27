import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser } from './user.interface';
import { UserRole, UserStatus, Gender, Language } from '@shared/enums';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';
import envConfig from '@config/env.config';

const userSchema = new Schema<IUser>(
    {
        // Basic Information
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Don't return password by default
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            maxlength: [50, 'First name cannot exceed 50 characters'],
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            maxlength: [50, 'Last name cannot exceed 50 characters'],
        },
        fullName: {
            type: String,
            trim: true,
        },

        // Profile
        phone: {
            type: String,
            trim: true,
            match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
        },
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: Object.values(Gender),
        },
        profileImage: {
            type: String,
        },
        language: {
            type: String,
            enum: Object.values(Language),
            default: Language.EN,
        },

        // Address
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            postalCode: String,
            coordinates: {
                latitude: Number,
                longitude: Number,
            },
        },

        // Role & Permissions
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.PARENT,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(UserStatus),
            default: UserStatus.ACTIVE,
        },
        permissions: [
            {
                type: String,
            },
        ],

        // Multi-tenancy
        tenantId: {
            type: String,
            index: true,
        },
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            index: true,
        },
        locationId: {
            type: Schema.Types.ObjectId,
            ref: 'Location',
            index: true,
        },

        // Security
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        isPhoneVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: {
            type: String,
            select: false,
        },
        emailVerificationExpires: {
            type: Date,
            select: false,
        },
        passwordResetToken: {
            type: String,
            select: false,
        },
        passwordResetExpires: {
            type: Date,
            select: false,
        },
        lastLogin: {
            type: Date,
        },
        lastPasswordChange: {
            type: Date,
        },
        failedLoginAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: {
            type: Date,
        },

        // Refresh Token
        refreshToken: {
            type: String,
            select: false,
        },
        refreshTokenExpires: {
            type: Date,
            select: false,
        },

        // Metadata
        metadata: {
            type: Schema.Types.Mixed,
        },

        ...baseSchemaFields,
    },
    {
        ...baseSchemaOptions,
        timestamps: true,
    }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ tenantId: 1, role: 1 });
userSchema.index({ organizationId: 1 });
userSchema.index({ locationId: 1 });
userSchema.index({ firstName: 1, lastName: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function (this: IUser) {
    return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    // Only hash password if it's modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(envConfig.get().bcryptRounds);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Pre-save middleware to set fullName
userSchema.pre('save', function (next) {
    this.fullName = `${this.firstName} ${this.lastName}`;
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

// Method to generate auth token
userSchema.methods.generateAuthToken = function (): string {
    const payload = {
        id: this._id,
        email: this.email,
        role: this.role,
        tenantId: this.tenantId,
        organizationId: this.organizationId,
        locationId: this.locationId,
    };

    return jwt.sign(payload, envConfig.get().jwtSecret, {
        expiresIn: envConfig.get().jwtExpiresIn,
    });
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function (): string {
    const payload = {
        id: this._id,
        type: 'refresh',
    };

    return jwt.sign(payload, envConfig.get().jwtRefreshSecret, {
        expiresIn: envConfig.get().jwtRefreshExpiresIn,
    });
};

// Method to check if account is locked
userSchema.methods.isLocked = function (): boolean {
    return !!(this.lockUntil && this.lockUntil > new Date());
};

// Static method to find by email
userSchema.statics.findByEmail = function (email: string) {
    return this.findOne({ email: email.toLowerCase(), isDeleted: false });
};

export const User = model<IUser>('User', userSchema);
