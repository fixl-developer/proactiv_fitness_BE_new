import { Document } from 'mongoose';

export enum SkillLevel {
    NOT_ATTEMPTED = 'not_attempted',
    BEGINNER = 'beginner',
    DEVELOPING = 'developing',
    PROFICIENT = 'proficient',
    MASTERED = 'mastered',
    ADVANCED = 'advanced'
}

export enum CertificationStatus {
    PENDING = 'pending',
    EARNED = 'earned',
    EXPIRED = 'expired',
    REVOKED = 'revoked'
}

export enum MilestoneType {
    SKILL_ACHIEVEMENT = 'skill_achievement',
    ATTENDANCE_MILESTONE = 'attendance_milestone',
    BEHAVIOR_RECOGNITION = 'behavior_recognition',
    COMPETITION_PARTICIPATION = 'competition_participation',
    LEADERSHIP_RECOGNITION = 'leadership_recognition',
    SAFETY_ACHIEVEMENT = 'safety_achievement'
}

export enum TransferStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    COMPLETED = 'completed',
    REJECTED = 'rejected'
}

export interface IAthletePassport extends Document {
    // Basic Information
    passportId: string;
    childId: string;
    childName: string;
    dateOfBirth: Date;

    // Current Status
    currentPrograms: string[];
    currentSkillLevel: SkillLevel;
    enrollmentDate: Date;
    lastActivityDate: Date;

    // Skill Tracking
    skillsProgress: {
        skillId: string;
        skillName: string;
        category: string;
        currentLevel: SkillLevel;
        dateAchieved?: Date;
        coachNotes: string;
        videoEvidence?: string[];
        assessmentHistory: {
            date: Date;
            level: SkillLevel;
            assessedBy: string;
            notes: string;
        }[];
    }[];

    // Certifications
    certifications: {
        certificationId: string;
        name: string;
        level: string;
        status: CertificationStatus;
        earnedDate?: Date;
        expiryDate?: Date;
        issuedBy: string;
        certificateUrl?: string;
        requirements: string[];
        verificationCode: string;
    }[];

    // Milestones & Achievements
    milestones: {
        milestoneId: string;
        type: MilestoneType;
        title: string;
        description: string;
        achievedDate: Date;
        recognizedBy: string;
        evidenceUrls: string[];
        points?: number;
        badgeUrl?: string;
    }[];

    // Performance Benchmarks
    benchmarks: {
        benchmarkId: string;
        name: string;
        category: string;
        value: number;
        unit: string;
        recordedDate: Date;
        recordedBy: string;
        isPersonalBest: boolean;
        ageGroupRanking?: number;
        notes?: string;
    }[];

    // Attendance History
    attendanceStats: {
        totalSessions: number;
        attendedSessions: number;
        attendanceRate: number;
        consecutiveAttendance: number;
        longestStreak: number;
        lastAttendanceDate?: Date;
        monthlyStats: {
            month: string;
            year: number;
            sessionsScheduled: number;
            sessionsAttended: number;
            rate: number;
        }[];
    };

    // Behavioral Tracking
    behaviorProfile: {
        positiveNotes: {
            date: Date;
            note: string;
            recordedBy: string;
            category: string;
        }[];
        areasForImprovement: {
            date: Date;
            area: string;
            note: string;
            recordedBy: string;
            resolved: boolean;
            resolvedDate?: Date;
        }[];
        leadershipMoments: {
            date: Date;
            description: string;
            recognizedBy: string;
        }[];
    };

    // Health & Safety
    healthProfile: {
        medicalAlerts: string[];
        injuryHistory: {
            date: Date;
            type: string;
            description: string;
            treatment: string;
            recoveryTime?: number;
            preventiveMeasures: string[];
        }[];
        safetyTraining: {
            trainingType: string;
            completedDate: Date;
            expiryDate?: Date;
            certificateUrl?: string;
        }[];
    };

    // Transfer & Portability
    transferHistory: {
        transferId: string;
        fromLocation: string;
        toLocation: string;
        transferDate: Date;
        status: TransferStatus;
        reason: string;
        approvedBy?: string;
        notes?: string;
    }[];

    // Export & Sharing
    exportHistory: {
        exportId: string;
        exportType: 'pdf' | 'json' | 'transcript';
        requestedBy: string;
        requestedDate: Date;
        purpose: string;
        recipientOrganization?: string;
        expiryDate?: Date;
        downloadUrl?: string;
    }[];

    // Privacy & Consent
    privacySettings: {
        shareWithCoaches: boolean;
        shareWithParents: boolean;
        shareForResearch: boolean;
        shareForMarketing: boolean;
        allowPhotoVideo: boolean;
        allowPublicRecognition: boolean;
    };

    // Business Context
    businessUnitId: string;
    locationIds: string[];

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISkillTaxonomy extends Document {
    // Skill Information
    skillId: string;
    skillName: string;
    category: string;
    subcategory?: string;

    // Skill Details
    description: string;
    prerequisites: string[];
    progressionPath: {
        level: SkillLevel;
        criteria: string[];
        typicalAgeRange: {
            min: number;
            max: number;
        };
        averageTimeToAchieve: number; // in weeks
    }[];

    // Assessment Criteria
    assessmentCriteria: {
        level: SkillLevel;
        requirements: string[];
        demonstrationMethods: string[];
        safetyConsiderations: string[];
    }[];

    // Related Skills
    relatedSkills: string[];
    nextSkills: string[];

    // Program Association
    programTypes: string[];
    ageGroups: string[];

    // Media Resources
    instructionalVideos: string[];
    demonstrationImages: string[];

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

export interface IPerformanceBenchmark extends Document {
    // Benchmark Information
    benchmarkId: string;
    name: string;
    category: string;
    description: string;

    // Measurement Details
    unit: string;
    measurementType: 'time' | 'distance' | 'count' | 'score' | 'rating';
    higherIsBetter: boolean;

    // Age Group Standards
    ageGroupStandards: {
        ageGroup: string;
        minAge: number;
        maxAge: number;
        standards: {
            level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
            value: number;
            percentile?: number;
        }[];
    }[];

    // Program Association
    programTypes: string[];
    skillCategories: string[];

    // Status
    isActive: boolean;

    // Business Context
    businessUnitId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Request/Response Interfaces

export interface ICreatePassportRequest {
    childId: string;
    initialPrograms: string[];
    privacySettings?: any;
}

export interface IUpdateSkillRequest {
    skillId: string;
    newLevel: SkillLevel;
    coachNotes: string;
    videoEvidence?: string[];
    assessedBy: string;
}

export interface IAddMilestoneRequest {
    type: MilestoneType;
    title: string;
    description: string;
    evidenceUrls?: string[];
    points?: number;
    recognizedBy: string;
}

export interface IRecordBenchmarkRequest {
    benchmarkId: string;
    value: number;
    recordedBy: string;
    notes?: string;
}

export interface ITransferRequest {
    fromLocation: string;
    toLocation: string;
    reason: string;
    requestedBy: string;
}

export interface IExportRequest {
    exportType: 'pdf' | 'json' | 'transcript';
    purpose: string;
    recipientOrganization?: string;
    requestedBy: string;
}

export interface IPassportSummary {
    passportId: string;
    childName: string;
    currentLevel: SkillLevel;
    totalSkills: number;
    masteredSkills: number;
    certifications: number;
    milestones: number;
    attendanceRate: number;
    lastActivity: Date;
    progressScore: number;
}

export interface ISkillProgressReport {
    childId: string;
    childName: string;
    reportPeriod: {
        startDate: Date;
        endDate: Date;
    };
    skillsAssessed: number;
    skillsImproved: number;
    newSkillsLearned: number;
    skillsByCategory: {
        category: string;
        total: number;
        mastered: number;
        inProgress: number;
    }[];
    recentAchievements: any[];
    recommendedFocus: string[];
    coachRecommendations: string[];
}

export interface ITranscriptData {
    studentInfo: {
        name: string;
        dateOfBirth: Date;
        passportId: string;
        enrollmentDate: Date;
    };
    programHistory: {
        program: string;
        startDate: Date;
        endDate?: Date;
        location: string;
        instructor: string;
    }[];
    skillsAchieved: {
        skill: string;
        level: SkillLevel;
        dateAchieved: Date;
        assessedBy: string;
    }[];
    certifications: {
        name: string;
        level: string;
        earnedDate: Date;
        issuedBy: string;
        verificationCode: string;
    }[];
    attendanceRecord: {
        totalSessions: number;
        attendedSessions: number;
        attendanceRate: number;
    };
    achievements: {
        title: string;
        type: MilestoneType;
        date: Date;
        recognizedBy: string;
    }[];
    issuedDate: Date;
    issuedBy: string;
    verificationUrl: string;
}