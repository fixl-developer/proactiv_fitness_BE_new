import { Schema, model } from 'mongoose';
import {
    IAthletePassport,
    ISkillTaxonomy,
    IPerformanceBenchmark,
    SkillLevel,
    CertificationStatus,
    MilestoneType,
    TransferStatus
} from './athlete-passport.interface';
import { baseSchemaOptions } from '../../shared/base/base.model';

// Athlete Passport Schema
const athletePassportSchema = new Schema<IAthletePassport>({
    // Basic Information
    passportId: { type: String, required: true, unique: true, index: true },
    childId: { type: String, required: true, unique: true, index: true },
    childName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },

    // Current Status
    currentPrograms: [{ type: String, trim: true }],
    currentSkillLevel: { type: String, enum: Object.values(SkillLevel), default: SkillLevel.BEGINNER },
    enrollmentDate: { type: Date, required: true },
    lastActivityDate: Date,

    // Skill Tracking
    skillsProgress: [{
        skillId: { type: String, required: true, trim: true },
        skillName: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true },
        currentLevel: { type: String, enum: Object.values(SkillLevel), required: true },
        dateAchieved: Date,
        coachNotes: { type: String, trim: true },
        videoEvidence: [String],
        assessmentHistory: [{
            date: { type: Date, required: true },
            level: { type: String, enum: Object.values(SkillLevel), required: true },
            assessedBy: { type: String, required: true },
            notes: { type: String, trim: true }
        }]
    }],

    // Certifications
    certifications: [{
        certificationId: { type: String, required: true },
        name: { type: String, required: true, trim: true },
        level: { type: String, required: true, trim: true },
        status: { type: String, enum: Object.values(CertificationStatus), required: true },
        earnedDate: Date,
        expiryDate: Date,
        issuedBy: { type: String, required: true, trim: true },
        certificateUrl: { type: String, trim: true },
        requirements: [String],
        verificationCode: { type: String, required: true, trim: true }
    }],

    // Milestones & Achievements
    milestones: [{
        milestoneId: { type: String, required: true },
        type: { type: String, enum: Object.values(MilestoneType), required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        achievedDate: { type: Date, required: true },
        recognizedBy: { type: String, required: true, trim: true },
        evidenceUrls: [String],
        points: { type: Number, min: 0 },
        badgeUrl: { type: String, trim: true }
    }],

    // Performance Benchmarks
    benchmarks: [{
        benchmarkId: { type: String, required: true },
        name: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true },
        value: { type: Number, required: true },
        unit: { type: String, required: true, trim: true },
        recordedDate: { type: Date, required: true },
        recordedBy: { type: String, required: true, trim: true },
        isPersonalBest: { type: Boolean, default: false },
        ageGroupRanking: { type: Number, min: 1 },
        notes: { type: String, trim: true }
    }],

    // Attendance History
    attendanceStats: {
        totalSessions: { type: Number, default: 0, min: 0 },
        attendedSessions: { type: Number, default: 0, min: 0 },
        attendanceRate: { type: Number, default: 0, min: 0, max: 100 },
        consecutiveAttendance: { type: Number, default: 0, min: 0 },
        longestStreak: { type: Number, default: 0, min: 0 },
        lastAttendanceDate: Date,
        monthlyStats: [{
            month: { type: String, required: true },
            year: { type: Number, required: true },
            sessionsScheduled: { type: Number, required: true, min: 0 },
            sessionsAttended: { type: Number, required: true, min: 0 },
            rate: { type: Number, required: true, min: 0, max: 100 }
        }]
    },

    // Behavioral Tracking
    behaviorProfile: {
        positiveNotes: [{
            date: { type: Date, required: true },
            note: { type: String, required: true, trim: true },
            recordedBy: { type: String, required: true, trim: true },
            category: { type: String, required: true, trim: true }
        }],
        areasForImprovement: [{
            date: { type: Date, required: true },
            area: { type: String, required: true, trim: true },
            note: { type: String, required: true, trim: true },
            recordedBy: { type: String, required: true, trim: true },
            resolved: { type: Boolean, default: false },
            resolvedDate: Date
        }],
        leadershipMoments: [{
            date: { type: Date, required: true },
            description: { type: String, required: true, trim: true },
            recognizedBy: { type: String, required: true, trim: true }
        }]
    },

    // Health & Safety
    healthProfile: {
        medicalAlerts: [String],
        injuryHistory: [{
            date: { type: Date, required: true },
            type: { type: String, required: true, trim: true },
            description: { type: String, required: true, trim: true },
            treatment: { type: String, required: true, trim: true },
            recoveryTime: { type: Number, min: 0 },
            preventiveMeasures: [String]
        }],
        safetyTraining: [{
            trainingType: { type: String, required: true, trim: true },
            completedDate: { type: Date, required: true },
            expiryDate: Date,
            certificateUrl: { type: String, trim: true }
        }]
    },

    // Transfer & Portability
    transferHistory: [{
        transferId: { type: String, required: true },
        fromLocation: { type: String, required: true, trim: true },
        toLocation: { type: String, required: true, trim: true },
        transferDate: { type: Date, required: true },
        status: { type: String, enum: Object.values(TransferStatus), required: true },
        reason: { type: String, required: true, trim: true },
        approvedBy: { type: String, trim: true },
        notes: { type: String, trim: true }
    }],

    // Export & Sharing
    exportHistory: [{
        exportId: { type: String, required: true },
        exportType: { type: String, enum: ['pdf', 'json', 'transcript'], required: true },
        requestedBy: { type: String, required: true, trim: true },
        requestedDate: { type: Date, required: true },
        purpose: { type: String, required: true, trim: true },
        recipientOrganization: { type: String, trim: true },
        expiryDate: Date,
        downloadUrl: { type: String, trim: true }
    }],

    // Privacy & Consent
    privacySettings: {
        shareWithCoaches: { type: Boolean, default: true },
        shareWithParents: { type: Boolean, default: true },
        shareForResearch: { type: Boolean, default: false },
        shareForMarketing: { type: Boolean, default: false },
        allowPhotoVideo: { type: Boolean, default: true },
        allowPublicRecognition: { type: Boolean, default: true }
    },

    // Business Context
    businessUnitId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    locationIds: [{ type: Schema.Types.ObjectId, ref: 'Location' }],

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Skill Taxonomy Schema
const skillTaxonomySchema = new Schema<ISkillTaxonomy>({
    // Skill Information
    skillId: { type: String, required: true, unique: true, index: true },
    skillName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    subcategory: { type: String, trim: true },

    // Skill Details
    description: { type: String, required: true, trim: true },
    prerequisites: [String],
    progressionPath: [{
        level: { type: String, enum: Object.values(SkillLevel), required: true },
        criteria: [{ type: String, required: true }],
        typicalAgeRange: {
            min: { type: Number, required: true, min: 2, max: 18 },
            max: { type: Number, required: true, min: 2, max: 18 }
        },
        averageTimeToAchieve: { type: Number, required: true, min: 1 }
    }],

    // Assessment Criteria
    assessmentCriteria: [{
        level: { type: String, enum: Object.values(SkillLevel), required: true },
        requirements: [{ type: String, required: true }],
        demonstrationMethods: [String],
        safetyConsiderations: [String]
    }],

    // Related Skills
    relatedSkills: [String],
    nextSkills: [String],

    // Program Association
    programTypes: [String],
    ageGroups: [String],

    // Media Resources
    instructionalVideos: [String],
    demonstrationImages: [String],

    // Status
    isActive: { type: Boolean, default: true, index: true },
    version: { type: String, required: true, default: '1.0' },

    // Business Context
    businessUnitId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Performance Benchmark Schema
const performanceBenchmarkSchema = new Schema<IPerformanceBenchmark>({
    // Benchmark Information
    benchmarkId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },

    // Measurement Details
    unit: { type: String, required: true, trim: true },
    measurementType: { type: String, enum: ['time', 'distance', 'count', 'score', 'rating'], required: true },
    higherIsBetter: { type: Boolean, required: true },

    // Age Group Standards
    ageGroupStandards: [{
        ageGroup: { type: String, required: true, trim: true },
        minAge: { type: Number, required: true, min: 2, max: 18 },
        maxAge: { type: Number, required: true, min: 2, max: 18 },
        standards: [{
            level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'elite'], required: true },
            value: { type: Number, required: true },
            percentile: { type: Number, min: 1, max: 100 }
        }]
    }],

    // Program Association
    programTypes: [String],
    skillCategories: [String],

    // Status
    isActive: { type: Boolean, default: true, index: true },

    // Business Context
    businessUnitId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Indexes for performance
athletePassportSchema.index({ childId: 1 });
athletePassportSchema.index({ businessUnitId: 1, currentSkillLevel: 1 });
athletePassportSchema.index({ 'skillsProgress.skillId': 1, 'skillsProgress.currentLevel': 1 });
athletePassportSchema.index({ 'certifications.status': 1, 'certifications.expiryDate': 1 });
athletePassportSchema.index({ lastActivityDate: -1 });

skillTaxonomySchema.index({ category: 1, isActive: 1 });
skillTaxonomySchema.index({ programTypes: 1, isActive: 1 });
skillTaxonomySchema.index({ ageGroups: 1, isActive: 1 });

performanceBenchmarkSchema.index({ category: 1, isActive: 1 });
performanceBenchmarkSchema.index({ programTypes: 1, isActive: 1 });

// Text search indexes
athletePassportSchema.index({
    childName: 'text',
    'skillsProgress.skillName': 'text',
    'milestones.title': 'text'
});

skillTaxonomySchema.index({
    skillName: 'text',
    description: 'text',
    category: 'text'
});

performanceBenchmarkSchema.index({
    name: 'text',
    description: 'text',
    category: 'text'
});

// Pre-save middleware
athletePassportSchema.pre('save', function (next) {
    if (this.isNew && !this.passportId) {
        this.passportId = `passport_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Update attendance rate
    if (this.attendanceStats.totalSessions > 0) {
        this.attendanceStats.attendanceRate =
            (this.attendanceStats.attendedSessions / this.attendanceStats.totalSessions) * 100;
    }

    // Update last activity date
    this.lastActivityDate = new Date();

    next();
});

skillTaxonomySchema.pre('save', function (next) {
    if (this.isNew && !this.skillId) {
        this.skillId = `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

performanceBenchmarkSchema.pre('save', function (next) {
    if (this.isNew && !this.benchmarkId) {
        this.benchmarkId = `benchmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

// Virtual fields
athletePassportSchema.virtual('age').get(function () {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
});

athletePassportSchema.virtual('totalMilestones').get(function () {
    return this.milestones.length;
});

athletePassportSchema.virtual('totalCertifications').get(function () {
    return this.certifications.filter(cert => cert.status === CertificationStatus.EARNED).length;
});

athletePassportSchema.virtual('masteredSkills').get(function () {
    return this.skillsProgress.filter(skill => skill.currentLevel === SkillLevel.MASTERED).length;
});

athletePassportSchema.virtual('progressScore').get(function () {
    const totalSkills = this.skillsProgress.length;
    if (totalSkills === 0) return 0;

    const skillPoints = this.skillsProgress.reduce((total, skill) => {
        const levelPoints = {
            [SkillLevel.NOT_ATTEMPTED]: 0,
            [SkillLevel.BEGINNER]: 1,
            [SkillLevel.DEVELOPING]: 2,
            [SkillLevel.PROFICIENT]: 3,
            [SkillLevel.MASTERED]: 4,
            [SkillLevel.ADVANCED]: 5
        };
        return total + (levelPoints[skill.currentLevel] || 0);
    }, 0);

    const maxPossiblePoints = totalSkills * 5;
    return Math.round((skillPoints / maxPossiblePoints) * 100);
});

// Export models
export const AthletePassport = model<IAthletePassport>('AthletePassport', athletePassportSchema);
export const SkillTaxonomy = model<ISkillTaxonomy>('SkillTaxonomy', skillTaxonomySchema);
export const PerformanceBenchmark = model<IPerformanceBenchmark>('PerformanceBenchmark', performanceBenchmarkSchema);