import { Document } from 'mongoose';

export enum CertificationLevel {
    BRONZE = 'bronze',
    SILVER = 'silver',
    GOLD = 'gold',
    PLATINUM = 'platinum',
    DIAMOND = 'diamond'
}

export enum CertificationStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    PENDING = 'pending',
    EARNED = 'earned',
    EXPIRED = 'expired',
    REVOKED = 'revoked',
    SUSPENDED = 'suspended'
}

export enum BadgeType {
    SKILL_MASTERY = 'skill_mastery',
    ATTENDANCE = 'attendance',
    BEHAVIOR = 'behavior',
    LEADERSHIP = 'leadership',
    SAFETY = 'safety',
    COMPETITION = 'competition',
    COMMUNITY_SERVICE = 'community_service',
    MENTORSHIP = 'mentorship'
}

export enum VerificationStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    FAILED = 'failed',
    EXPIRED = 'expired'
}

export interface IMicroCredential extends Document {
    // Basic Information
    credentialId: string;
    name: string;
    description: string;
    category: string;
    level: CertificationLevel;

    // Visual Identity
    badgeImageUrl: string;
    badgeType: BadgeType;
    colorScheme: {
        primary: string;
        secondary: string;
        accent: string;
    };

    // Requirements
    requirements: {
        skillRequirements: {
            skillId: string;
            skillName: string;
            minimumLevel: string;
            isRequired: boolean;
        }[];
        attendanceRequirements: {
            minimumSessions: number;
            timeframe: number; // in days
            attendanceRate: number; // percentage
        };
        behaviorRequirements: {
            positiveNotes: number;
            leadershipMoments: number;
            noMajorIncidents: boolean;
        };
        performanceRequirements: {
            benchmarkId: string;
            benchmarkName: string;
            minimumValue: number;
            unit: string;
        }[];
        prerequisiteCertifications: string[];
    };

    // Validation Rules
    validationRules: {
        minimumAge?: number;
        maximumAge?: number;
        programTypes: string[];
        locationRestrictions?: string[];
        seasonalAvailability?: {
            startMonth: number;
            endMonth: number;
        };
        maxAttempts?: number;
        cooldownPeriod?: number; // in days
    };

    // Assessment Criteria
    assessmentCriteria: {
        criteriaId: string;
        name: string;
        description: string;
        weight: number; // percentage
        passingScore: number;
        assessmentMethod: 'observation' | 'demonstration' | 'test' | 'portfolio';
        rubric: {
            level: string;
            description: string;
            points: number;
        }[];
    }[];

    // Expiration & Renewal
    expirationRules: {
        hasExpiration: boolean;
        validityPeriod?: number; // in months
        renewalRequired: boolean;
        renewalCriteria?: string[];
        gracePeriod?: number; // in days
    };

    // Digital Certificate
    certificateTemplate: {
        templateId: string;
        layout: string;
        includeQRCode: boolean;
        includeBlockchain: boolean;
        customFields: {
            fieldName: string;
            fieldValue: string;
            isVariable: boolean;
        }[];
    };

    // Verification System
    verificationSystem: {
        verificationMethod: 'qr_code' | 'blockchain' | 'api' | 'manual';
        publicVerificationUrl: string;
        verificationCode: string;
        blockchainHash?: string;
    };

    // Statistics
    statistics: {
        totalIssued: number;
        totalActive: number;
        totalExpired: number;
        averageTimeToEarn: number; // in days
        successRate: number; // percentage
    };

    // Status
    isActive: boolean;
    version: string;

    // Business Context
    businessUnitId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IIssuedCredential extends Document {
    // Basic Information
    issuedCredentialId: string;
    credentialId: string;
    credentialName: string;
    recipientId: string;
    recipientName: string;

    // Issuance Details
    issuedDate: Date;
    issuedBy: string;
    issuedByName: string;
    status: CertificationStatus;

    // Achievement Data
    achievementData: {
        skillsAssessed: {
            skillId: string;
            skillName: string;
            levelAchieved: string;
            assessedBy: string;
            assessedDate: Date;
            score?: number;
        }[];
        attendanceData: {
            totalSessions: number;
            attendedSessions: number;
            attendanceRate: number;
            period: {
                startDate: Date;
                endDate: Date;
            };
        };
        behaviorData: {
            positiveNotes: number;
            leadershipMoments: number;
            incidents: number;
        };
        performanceData: {
            benchmarkId: string;
            benchmarkName: string;
            value: number;
            unit: string;
            recordedDate: Date;
        }[];
    };

    // Assessment Results
    assessmentResults: {
        criteriaId: string;
        criteriaName: string;
        score: number;
        maxScore: number;
        passed: boolean;
        assessedBy: string;
        assessedDate: Date;
        notes?: string;
        evidenceUrls?: string[];
    }[];

    // Digital Certificate
    digitalCertificate: {
        certificateUrl: string;
        certificateHash: string;
        qrCodeUrl: string;
        verificationUrl: string;
        blockchainTxId?: string;
    };

    // Verification
    verificationHistory: {
        verificationId: string;
        verifiedBy: string;
        verifiedDate: Date;
        verificationMethod: string;
        status: VerificationStatus;
        notes?: string;
    }[];

    // Expiration & Renewal
    expirationDate?: Date;
    isExpired: boolean;
    renewalHistory: {
        renewalId: string;
        renewalDate: Date;
        renewedBy: string;
        newExpirationDate: Date;
        renewalNotes?: string;
    }[];

    // Sharing & Privacy
    sharingSettings: {
        isPublic: boolean;
        shareWithEmployers: boolean;
        shareWithEducators: boolean;
        shareOnSocialMedia: boolean;
        customSharingUrl?: string;
    };

    // Revocation
    revocationInfo?: {
        revokedDate: Date;
        revokedBy: string;
        reason: string;
        isAppealable: boolean;
        appealDeadline?: Date;
    };

    // Business Context
    businessUnitId: string;
    locationId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBadgeSystem extends Document {
    // Badge Information
    badgeId: string;
    name: string;
    description: string;
    category: string;
    badgeType: BadgeType;

    // Visual Design
    imageUrl: string;
    iconUrl: string;
    colorScheme: {
        primary: string;
        secondary: string;
        background: string;
    };

    // Earning Criteria
    earningCriteria: {
        criteriaType: 'single' | 'multiple' | 'progressive';
        requirements: {
            type: 'skill' | 'attendance' | 'behavior' | 'performance' | 'time' | 'count';
            description: string;
            target: number;
            unit: string;
            timeframe?: number; // in days
        }[];
        isStackable: boolean;
        maxEarnings?: number;
    };

    // Point System
    pointValue: number;
    bonusMultiplier?: number;

    // Rarity & Difficulty
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    estimatedTimeToEarn: number; // in days

    // Status
    isActive: boolean;
    isVisible: boolean;

    // Business Context
    businessUnitId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IEarnedBadge extends Document {
    // Basic Information
    earnedBadgeId: string;
    badgeId: string;
    badgeName: string;
    recipientId: string;
    recipientName: string;

    // Earning Details
    earnedDate: Date;
    earnedBy: string; // who awarded it
    earnedByName: string;

    // Achievement Context
    achievementContext: {
        triggerEvent: string;
        relatedSkills: string[];
        relatedSessions: string[];
        evidenceUrls: string[];
        witnessedBy?: string[];
    };

    // Progress Tracking (for progressive badges)
    progressData?: {
        currentProgress: number;
        targetProgress: number;
        progressHistory: {
            date: Date;
            progress: number;
            notes?: string;
        }[];
    };

    // Points & Rewards
    pointsEarned: number;
    bonusPoints?: number;
    totalPoints: number;

    // Display Settings
    displaySettings: {
        isVisible: boolean;
        isPinned: boolean;
        displayOrder: number;
        showOnProfile: boolean;
    };

    // Business Context
    businessUnitId: string;
    locationId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Request/Response Interfaces

export interface ICreateCredentialRequest {
    name: string;
    description: string;
    category: string;
    level: CertificationLevel;
    badgeType: BadgeType;
    requirements: any;
    validationRules: any;
    assessmentCriteria: any[];
    expirationRules: any;
}

export interface IIssueCredentialRequest {
    credentialId: string;
    recipientId: string;
    achievementData: any;
    assessmentResults: any[];
    issuedBy: string;
}

export interface ICreateBadgeRequest {
    name: string;
    description: string;
    category: string;
    badgeType: BadgeType;
    earningCriteria: any;
    pointValue: number;
    rarity: string;
    difficulty: string;
}

export interface IAwardBadgeRequest {
    badgeId: string;
    recipientId: string;
    achievementContext: any;
    awardedBy: string;
}

export interface IVerifyCredentialRequest {
    credentialId: string;
    verificationCode: string;
    verificationMethod: string;
}

export interface ICredentialSummary {
    credentialId: string;
    name: string;
    level: CertificationLevel;
    status: CertificationStatus;
    issuedDate: Date;
    expirationDate?: Date;
    isExpired: boolean;
    verificationUrl: string;
    badgeImageUrl: string;
}

export interface IBadgeCollection {
    recipientId: string;
    recipientName: string;
    totalBadges: number;
    totalPoints: number;
    badgesByCategory: {
        category: string;
        count: number;
        points: number;
    }[];
    recentBadges: IEarnedBadge[];
    pinnedBadges: IEarnedBadge[];
    achievements: {
        totalSkillBadges: number;
        totalAttendanceBadges: number;
        totalBehaviorBadges: number;
        totalLeadershipBadges: number;
        rareBadges: number;
        legendaryBadges: number;
    };
}

export interface ICredentialPortfolio {
    recipientId: string;
    recipientName: string;
    totalCredentials: number;
    activeCredentials: number;
    expiredCredentials: number;
    credentialsByLevel: {
        level: CertificationLevel;
        count: number;
    }[];
    credentialsByCategory: {
        category: string;
        count: number;
    }[];
    recentCredentials: ICredentialSummary[];
    expiringCredentials: ICredentialSummary[];
}

export interface IVerificationResult {
    isValid: boolean;
    credentialInfo?: {
        name: string;
        recipientName: string;
        issuedDate: Date;
        issuedBy: string;
        status: CertificationStatus;
        expirationDate?: Date;
    };
    verificationDate: Date;
    verificationMethod: string;
    errorMessage?: string;
}