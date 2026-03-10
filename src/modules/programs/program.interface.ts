import { Document } from 'mongoose';

export enum ProgramType {
    REGULAR = 'regular',
    CAMP = 'camp',
    EVENT = 'event',
    PRIVATE = 'private',
    ASSESSMENT = 'assessment',
    PARTY = 'party',
    TRIAL = 'trial'
}

export enum SkillLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    EXPERT = 'expert'
}

export enum AgeGroupType {
    MONTHS = 'months',
    YEARS = 'years'
}

export interface IAgeGroup {
    minAge: number;
    maxAge: number;
    ageType: AgeGroupType;
    description: string;
}

export interface ISkillProgression {
    currentLevel: SkillLevel;
    nextLevel?: SkillLevel;
    prerequisites: string[];
    estimatedDuration: number; // in weeks
    assessmentCriteria: string[];
}

export interface ICapacityRules {
    minParticipants: number;
    maxParticipants: number;
    coachToParticipantRatio: number;
    waitlistCapacity: number;
    allowOverbooking: boolean;
    overbookingPercentage?: number;
}

export interface IPricingModel {
    basePrice: number;
    currency: string;
    pricingType: 'per_session' | 'per_term' | 'per_month' | 'flat_rate';
    discounts?: {
        earlyBird?: number;
        sibling?: number;
        loyalty?: number;
        bulk?: number;
    };
    additionalFees?: {
        registration?: number;
        equipment?: number;
        insurance?: number;
    };
}

export interface IEligibilityRules {
    ageRestrictions: IAgeGroup;
    skillLevelRequired?: SkillLevel;
    prerequisitePrograms?: string[];
    medicalClearanceRequired: boolean;
    parentalConsentRequired: boolean;
    equipmentRequired?: string[];
    specialRequirements?: string[];
}

export interface IClassTemplate {
    name: string;
    description: string;
    duration: number; // in minutes
    activities: string[];
    equipmentNeeded: string[];
    safetyRequirements: string[];
    learningObjectives: string[];
    assessmentPoints?: string[];
}

export interface IProgram extends Document {
    // Basic Information
    name: string;
    description: string;
    shortDescription: string;
    programType: ProgramType;
    category: string; // e.g., 'Swimming', 'Gymnastics', 'Soccer'
    subcategory?: string; // e.g., 'Competitive Swimming', 'Recreational'

    // Organization
    businessUnitId: string;
    locationIds: string[];

    // Age and Skill
    ageGroups: IAgeGroup[];
    skillLevels: SkillLevel[];
    skillProgression: ISkillProgression[];

    // Capacity and Rules
    capacityRules: ICapacityRules;
    eligibilityRules: IEligibilityRules;

    // Pricing
    pricingModel: IPricingModel;

    // Class Structure
    classTemplates: IClassTemplate[];
    sessionDuration: number; // in minutes
    sessionsPerWeek: number;
    termDuration: number; // in weeks

    // Scheduling
    availableDays: string[]; // ['monday', 'tuesday', etc.]
    availableTimeSlots: {
        startTime: string;
        endTime: string;
        days: string[];
    }[];

    // Status and Metadata
    isActive: boolean;
    isPublic: boolean; // visible to parents for booking
    requiresApproval: boolean; // needs admin approval for enrollment

    // Media and Marketing
    imageUrl?: string;
    videoUrl?: string;
    brochureUrl?: string;
    tags: string[];

    // Tracking
    enrollmentCount: number;
    maxEnrollments?: number;

    // Audit
    createdBy: any;
    updatedBy: any;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}

export interface IProgramFilter {
    programType?: ProgramType;
    category?: string;
    subcategory?: string;
    skillLevel?: SkillLevel;
    ageGroup?: {
        minAge: number;
        maxAge: number;
        ageType: AgeGroupType;
    };
    locationId?: string;
    businessUnitId?: string;
    isActive?: boolean;
    isPublic?: boolean;
    priceRange?: {
        min: number;
        max: number;
    };
    availableDay?: string;
    tags?: string[];
}

export interface IProgramSearchResult {
    programs: IProgram[];
    totalCount: number;
    filters: {
        categories: string[];
        skillLevels: SkillLevel[];
        ageGroups: IAgeGroup[];
        priceRange: {
            min: number;
            max: number;
        };
        locations: {
            id: string;
            name: string;
        }[];
    };
}

export interface IProgramEnrollmentEligibility {
    eligible: boolean;
    reasons?: string[];
    requirements?: string[];
    alternatives?: {
        programId: string;
        programName: string;
        reason: string;
    }[];
}