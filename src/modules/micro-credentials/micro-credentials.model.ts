import { Schema, model } from 'mongoose';
import {
    IMicroCredential,
    IIssuedCredential,
    IBadgeSystem,
    IEarnedBadge,
    CertificationLevel,
    CertificationStatus,
    BadgeType,
    VerificationStatus
} from './micro-credentials.interface';
import { baseSchemaOptions } from '../../shared/base/base.model';

// Micro Credential Schema
const microCredentialSchema = new Schema<IMicroCredential>({
    // Basic Information
    credentialId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    category: { type: String, required: true, trim: true, index: true },
    level: { type: String, enum: Object.values(CertificationLevel), required: true, index: true },

    // Visual Identity
    badgeImageUrl: { type: String, required: true, trim: true },
    badgeType: { type: String, enum: Object.values(BadgeType), required: true, index: true },
    colorScheme: {
        primary: { type: String, required: true, trim: true },
        secondary: { type: String, required: true, trim: true },
        accent: { type: String, required: true, trim: true }
    },

    // Requirements
    requirements: {
        skillRequirements: [{
            skillId: { type: String, required: true, trim: true },
            skillName: { type: String, required: true, trim: true },
            minimumLevel: { type: String, required: true, trim: true },
            isRequired: { type: Boolean, default: true }
        }],
        attendanceRequirements: {
            minimumSessions: { type: Number, required: true, min: 0 },
            timeframe: { type: Number, required: true, min: 1 },
            attendanceRate: { type: Number, required: true, min: 0, max: 100 }
        },
        behaviorRequirements: {
            positiveNotes: { type: Number, default: 0, min: 0 },
            leadershipMoments: { type: Number, default: 0, min: 0 },
            noMajorIncidents: { type: Boolean, default: true }
        },
        performanceRequirements: [{
            benchmarkId: { type: String, required: true, trim: true },
            benchmarkName: { type: String, required: true, trim: true },
            minimumValue: { type: Number, required: true },
            unit: { type: String, required: true, trim: true }
        }],
        prerequisiteCertifications: [String]
    },

    // Validation Rules
    validationRules: {
        minimumAge: { type: Number, min: 2, max: 18 },
        maximumAge: { type: Number, min: 2, max: 18 },
        programTypes: [{ type: String, required: true, trim: true }],
        locationRestrictions: [String],
        seasonalAvailability: {
            startMonth: { type: Number, min: 1, max: 12 },
            endMonth: { type: Number, min: 1, max: 12 }
        },
        maxAttempts: { type: Number, min: 1 },
        cooldownPeriod: { type: Number, min: 0 }
    },

    // Assessment Criteria
    assessmentCriteria: [{
        criteriaId: { type: String, required: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        weight: { type: Number, required: true, min: 0, max: 100 },
        passingScore: { type: Number, required: true, min: 0, max: 100 },
        assessmentMethod: { type: String, enum: ['observation', 'demonstration', 'test', 'portfolio'], required: true },
        rubric: [{
            level: { type: String, required: true, trim: true },
            description: { type: String, required: true, trim: true },
            points: { type: Number, required: true, min: 0 }
        }]
    }],

    // Expiration & Renewal
    expirationRules: {
        hasExpiration: { type: Boolean, default: false },
        validityPeriod: { type: Number, min: 1 },
        renewalRequired: { type: Boolean, default: false },
        renewalCriteria: [String],
        gracePeriod: { type: Number, min: 0 }
    },

    // Digital Certificate
    certificateTemplate: {
        templateId: { type: String, required: true, trim: true },
        layout: { type: String, required: true, trim: true },
        includeQRCode: { type: Boolean, default: true },
        includeBlockchain: { type: Boolean, default: false },
        customFields: [{
            fieldName: { type: String, required: true, trim: true },
            fieldValue: { type: String, required: true, trim: true },
            isVariable: { type: Boolean, default: false }
        }]
    },

    // Verification System
    verificationSystem: {
        verificationMethod: { type: String, enum: ['qr_code', 'blockchain', 'api', 'manual'], required: true },
        publicVerificationUrl: { type: String, required: true, trim: true },
        verificationCode: { type: String, required: true, trim: true },
        blockchainHash: { type: String, trim: true }
    },

    // Statistics
    statistics: {
        totalIssued: { type: Number, default: 0, min: 0 },
        totalActive: { type: Number, default: 0, min: 0 },
        totalExpired: { type: Number, default: 0, min: 0 },
        averageTimeToEarn: { type: Number, default: 0, min: 0 },
        successRate: { type: Number, default: 0, min: 0, max: 100 }
    },

    // Status
    isActive: { type: Boolean, default: true, index: true },
    version: { type: String, required: true, default: '1.0' },

    // Business Context
    businessUnitId: { type: String, ref: 'BusinessUnit', required: true, index: true },

    // Audit
    createdBy: { type: String, ref: 'User', required: true },
    updatedBy: { type: String, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Issued Credential Schema
const issuedCredentialSchema = new Schema<IIssuedCredential>({
    // Basic Information
    issuedCredentialId: { type: String, required: true, unique: true, index: true },
    credentialId: { type: String, required: true, index: true },
    credentialName: { type: String, required: true, trim: true },
    recipientId: { type: String, required: true, index: true },
    recipientName: { type: String, required: true, trim: true },

    // Issuance Details
    issuedDate: { type: Date, required: true, index: true },
    issuedBy: { type: String, ref: 'User', required: true },
    issuedByName: { type: String, required: true, trim: true },
    status: { type: String, enum: Object.values(CertificationStatus), default: CertificationStatus.EARNED, index: true },

    // Achievement Data
    achievementData: {
        skillsAssessed: [{
            skillId: { type: String, required: true, trim: true },
            skillName: { type: String, required: true, trim: true },
            levelAchieved: { type: String, required: true, trim: true },
            assessedBy: { type: String, required: true, trim: true },
            assessedDate: { type: Date, required: true },
            score: { type: Number, min: 0, max: 100 }
        }],
        attendanceData: {
            totalSessions: { type: Number, required: true, min: 0 },
            attendedSessions: { type: Number, required: true, min: 0 },
            attendanceRate: { type: Number, required: true, min: 0, max: 100 },
            period: {
                startDate: { type: Date, required: true },
                endDate: { type: Date, required: true }
            }
        },
        behaviorData: {
            positiveNotes: { type: Number, default: 0, min: 0 },
            leadershipMoments: { type: Number, default: 0, min: 0 },
            incidents: { type: Number, default: 0, min: 0 }
        },
        performanceData: [{
            benchmarkId: { type: String, required: true, trim: true },
            benchmarkName: { type: String, required: true, trim: true },
            value: { type: Number, required: true },
            unit: { type: String, required: true, trim: true },
            recordedDate: { type: Date, required: true }
        }]
    },

    // Assessment Results
    assessmentResults: [{
        criteriaId: { type: String, required: true },
        criteriaName: { type: String, required: true, trim: true },
        score: { type: Number, required: true, min: 0 },
        maxScore: { type: Number, required: true, min: 0 },
        passed: { type: Boolean, required: true },
        assessedBy: { type: String, required: true, trim: true },
        assessedDate: { type: Date, required: true },
        notes: { type: String, trim: true },
        evidenceUrls: [String]
    }],

    // Digital Certificate
    digitalCertificate: {
        certificateUrl: { type: String, required: true, trim: true },
        certificateHash: { type: String, required: true, trim: true },
        qrCodeUrl: { type: String, required: true, trim: true },
        verificationUrl: { type: String, required: true, trim: true },
        blockchainTxId: { type: String, trim: true }
    },

    // Verification
    verificationHistory: [{
        verificationId: { type: String, required: true },
        verifiedBy: { type: String, required: true, trim: true },
        verifiedDate: { type: Date, required: true },
        verificationMethod: { type: String, required: true, trim: true },
        status: { type: String, enum: Object.values(VerificationStatus), required: true },
        notes: { type: String, trim: true }
    }],

    // Expiration & Renewal
    expirationDate: { type: Date, index: true },
    isExpired: { type: Boolean, default: false, index: true },
    renewalHistory: [{
        renewalId: { type: String, required: true },
        renewalDate: { type: Date, required: true },
        renewedBy: { type: String, required: true, trim: true },
        newExpirationDate: { type: Date, required: true },
        renewalNotes: { type: String, trim: true }
    }],

    // Sharing & Privacy
    sharingSettings: {
        isPublic: { type: Boolean, default: false },
        shareWithEmployers: { type: Boolean, default: false },
        shareWithEducators: { type: Boolean, default: true },
        shareOnSocialMedia: { type: Boolean, default: false },
        customSharingUrl: { type: String, trim: true }
    },

    // Revocation
    revocationInfo: {
        revokedDate: Date,
        revokedBy: { type: String, trim: true },
        reason: { type: String, trim: true },
        isAppealable: { type: Boolean, default: true },
        appealDeadline: Date
    },

    // Business Context
    businessUnitId: { type: String, ref: 'BusinessUnit', required: true, index: true },
    locationId: { type: String, ref: 'Location', required: true, index: true },

    // Audit
    createdBy: { type: String, ref: 'User', required: true },
    updatedBy: { type: String, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Badge System Schema
const badgeSystemSchema = new Schema<IBadgeSystem>({
    // Badge Information
    badgeId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 300 },
    category: { type: String, required: true, trim: true, index: true },
    badgeType: { type: String, enum: Object.values(BadgeType), required: true, index: true },

    // Visual Design
    imageUrl: { type: String, required: true, trim: true },
    iconUrl: { type: String, required: true, trim: true },
    colorScheme: {
        primary: { type: String, required: true, trim: true },
        secondary: { type: String, required: true, trim: true },
        background: { type: String, required: true, trim: true }
    },

    // Earning Criteria
    earningCriteria: {
        criteriaType: { type: String, enum: ['single', 'multiple', 'progressive'], required: true },
        requirements: [{
            type: { type: String, enum: ['skill', 'attendance', 'behavior', 'performance', 'time', 'count'], required: true },
            description: { type: String, required: true, trim: true },
            target: { type: Number, required: true, min: 0 },
            unit: { type: String, required: true, trim: true },
            timeframe: { type: Number, min: 1 }
        }],
        isStackable: { type: Boolean, default: false },
        maxEarnings: { type: Number, min: 1 }
    },

    // Point System
    pointValue: { type: Number, required: true, min: 0 },
    bonusMultiplier: { type: Number, min: 1 },

    // Rarity & Difficulty
    rarity: { type: String, enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'], required: true, index: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'], required: true, index: true },
    estimatedTimeToEarn: { type: Number, required: true, min: 1 },

    // Status
    isActive: { type: Boolean, default: true, index: true },
    isVisible: { type: Boolean, default: true },

    // Business Context
    businessUnitId: { type: String, ref: 'BusinessUnit', required: true, index: true },

    // Audit
    createdBy: { type: String, ref: 'User', required: true },
    updatedBy: { type: String, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Earned Badge Schema
const earnedBadgeSchema = new Schema<IEarnedBadge>({
    // Basic Information
    earnedBadgeId: { type: String, required: true, unique: true, index: true },
    badgeId: { type: String, required: true, index: true },
    badgeName: { type: String, required: true, trim: true },
    recipientId: { type: String, required: true, index: true },
    recipientName: { type: String, required: true, trim: true },

    // Earning Details
    earnedDate: { type: Date, required: true, index: true },
    earnedBy: { type: String, ref: 'User', required: true },
    earnedByName: { type: String, required: true, trim: true },

    // Achievement Context
    achievementContext: {
        triggerEvent: { type: String, required: true, trim: true },
        relatedSkills: [String],
        relatedSessions: [String],
        evidenceUrls: [String],
        witnessedBy: [String]
    },

    // Progress Tracking (for progressive badges)
    progressData: {
        currentProgress: { type: Number, min: 0 },
        targetProgress: { type: Number, min: 1 },
        progressHistory: [{
            date: { type: Date, required: true },
            progress: { type: Number, required: true, min: 0 },
            notes: { type: String, trim: true }
        }]
    },

    // Points & Rewards
    pointsEarned: { type: Number, required: true, min: 0 },
    bonusPoints: { type: Number, min: 0 },
    totalPoints: { type: Number, required: true, min: 0 },

    // Display Settings
    displaySettings: {
        isVisible: { type: Boolean, default: true },
        isPinned: { type: Boolean, default: false },
        displayOrder: { type: Number, default: 0 },
        showOnProfile: { type: Boolean, default: true }
    },

    // Business Context
    businessUnitId: { type: String, ref: 'BusinessUnit', required: true, index: true },
    locationId: { type: String, ref: 'Location', required: true, index: true },

    // Audit
    createdBy: { type: String, ref: 'User', required: true },
    updatedBy: { type: String, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Indexes for performance
microCredentialSchema.index({ category: 1, level: 1, isActive: 1 });
microCredentialSchema.index({ badgeType: 1, isActive: 1 });
microCredentialSchema.index({ 'validationRules.programTypes': 1 });

issuedCredentialSchema.index({ recipientId: 1, status: 1 });
issuedCredentialSchema.index({ credentialId: 1, status: 1 });
issuedCredentialSchema.index({ issuedDate: -1, status: 1 });
issuedCredentialSchema.index({ expirationDate: 1, isExpired: 1 });

badgeSystemSchema.index({ category: 1, badgeType: 1, isActive: 1 });
badgeSystemSchema.index({ rarity: 1, difficulty: 1 });
badgeSystemSchema.index({ pointValue: -1 });

earnedBadgeSchema.index({ recipientId: 1, earnedDate: -1 });
earnedBadgeSchema.index({ badgeId: 1, earnedDate: -1 });
earnedBadgeSchema.index({ 'displaySettings.isPinned': 1, 'displaySettings.displayOrder': 1 });

// Text search indexes
microCredentialSchema.index({
    name: 'text',
    description: 'text',
    category: 'text'
});

badgeSystemSchema.index({
    name: 'text',
    description: 'text',
    category: 'text'
});

// Pre-save middleware
microCredentialSchema.pre('save', function (next) {
    if (this.isNew && !this.credentialId) {
        this.credentialId = `cred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    if (this.isNew && !this.verificationSystem.verificationCode) {
        this.verificationSystem.verificationCode = Math.random().toString(36).substr(2, 12).toUpperCase();
    }

    next();
});

issuedCredentialSchema.pre('save', function (next) {
    if (this.isNew && !this.issuedCredentialId) {
        this.issuedCredentialId = `issued_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Check expiration
    if (this.expirationDate && new Date() > this.expirationDate) {
        this.isExpired = true;
        if (this.status === CertificationStatus.EARNED) {
            this.status = CertificationStatus.EXPIRED;
        }
    }

    next();
});

badgeSystemSchema.pre('save', function (next) {
    if (this.isNew && !this.badgeId) {
        this.badgeId = `badge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

earnedBadgeSchema.pre('save', function (next) {
    if (this.isNew && !this.earnedBadgeId) {
        this.earnedBadgeId = `earned_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Calculate total points
    this.totalPoints = this.pointsEarned + (this.bonusPoints || 0);

    next();
});

// Virtual fields
issuedCredentialSchema.virtual('daysUntilExpiration').get(function () {
    if (!this.expirationDate) return null;
    const today = new Date();
    const timeDiff = this.expirationDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

earnedBadgeSchema.virtual('daysSinceEarned').get(function () {
    const today = new Date();
    const timeDiff = today.getTime() - this.earnedDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
});

// Export models
export const MicroCredential = model<IMicroCredential>('MicroCredential', microCredentialSchema);
export const IssuedCredential = model<IIssuedCredential>('IssuedCredential', issuedCredentialSchema);
export const BadgeSystem = model<IBadgeSystem>('BadgeSystem', badgeSystemSchema);
export const EarnedBadge = model<IEarnedBadge>('EarnedBadge', earnedBadgeSchema);
