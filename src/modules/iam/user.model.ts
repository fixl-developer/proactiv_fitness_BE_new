import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
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
        // @ts-ignore - Mongoose type issue
        tenantId: {
            type: String,
            index: true,
        },
        // @ts-ignore - Mongoose type issue
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            index: true,
        },
        // Region assignment (for REGIONAL_ADMIN scope tracking)
        // @ts-ignore - Mongoose type issue
        regionId: {
            type: Schema.Types.ObjectId,
            ref: 'Region',
            index: true,
        },
        // @ts-ignore - Mongoose type issue
        // @ts-ignore - Mongoose type issue
        locationId: {
            type: Schema.Types.ObjectId,
            ref: 'Location',
            index: true,
        },

        // Partner type (for PARTNER_ADMIN users)
        partnerType: {
            type: String,
            enum: ['school', 'gym', 'corporate', 'sports_academy', 'ngo', 'municipal', 'sports_club', 'other'],
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

        // Password history — stores hashes of the last 5 passwords
        passwordHistory: {
            type: [String],
            default: [],
            select: false,
        },

        // Active sessions — limited to 3 concurrent sessions
        activeSessions: {
            type: [
                {
                    token: { type: String, required: true },
                    device: { type: String, default: 'unknown' },
                    ip: { type: String },
                    createdAt: { type: Date, default: Date.now },
                },
            ],
            default: [],
            select: false,
        },

        // GDPR consent tracking
        gdprConsent: {
            dataProcessing: { type: Boolean, default: false },
            marketing: { type: Boolean, default: false },
            analytics: { type: Boolean, default: false },
            consentDate: { type: Date },
            consentIp: { type: String },
        },

        // Whether the user was created by an admin (can skip email verification)
        createdByAdmin: {
            type: Boolean,
            default: false,
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

// Pre-save middleware to hash password and maintain password history
userSchema.pre('save', async function (next) {
    // Only hash password if it's modified
    const user = this as any;

    if (!user.isModified('password')) {
        return next();
    }

    try {
        // If there is an existing hashed password, push it into history
        // before overwriting.  Keep only the most recent 5 entries.
        if (user.password && !user.isNew) {
            // The current value is the *old* hash (not yet overwritten)
            if (!user.passwordHistory) {
                user.passwordHistory = [];
            }
            user.passwordHistory.push(user.password);
            if (user.passwordHistory.length > 5) {
                user.passwordHistory = user.passwordHistory.slice(-5);
            }
        }

        const salt = await bcrypt.genSalt(envConfig.get().bcryptRounds);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Pre-save middleware to set fullName
userSchema.pre('save', function (next) {
    const user = this as any;
    user.fullName = `${user.firstName} ${user.lastName}`;
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

    const options: SignOptions = {
        expiresIn: envConfig.get().jwtExpiresIn as any,
    };

    return jwt.sign(payload, envConfig.get().jwtSecret, options);
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function (): string {
    const payload = {
        id: this._id,
        type: 'refresh',
    };

    const options: SignOptions = {
        expiresIn: envConfig.get().jwtRefreshExpiresIn as any,
    };

    return jwt.sign(payload, envConfig.get().jwtRefreshSecret, options);
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
