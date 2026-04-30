import { Schema, model } from 'mongoose';
import { IProgram, ProgramType, SkillLevel, AgeGroupType } from './program.interface';
import { baseSchemaOptions } from '../../shared/base/base.model';

const ageGroupSchema = new Schema({
    minAge: {
        type: Number,
        required: [true, 'Minimum age is required'],
        min: [0, 'Minimum age cannot be negative']
    },
    maxAge: {
        type: Number,
        required: [true, 'Maximum age is required'],
        min: [0, 'Maximum age cannot be negative']
    },
    ageType: {
        type: String,
        enum: Object.values(AgeGroupType),
        required: [true, 'Age type is required']
    },
    description: {
        type: String,
        required: [true, 'Age group description is required'],
        trim: true
    }
});

const skillProgressionSchema = new Schema({
    currentLevel: {
        type: String,
        enum: Object.values(SkillLevel),
        required: [true, 'Current skill level is required']
    },
    nextLevel: {
        type: String,
        enum: Object.values(SkillLevel)
    },
    prerequisites: [{
        type: String,
        trim: true
    }],
    estimatedDuration: {
        type: Number,
        required: [true, 'Estimated duration is required'],
        min: [1, 'Duration must be at least 1 week']
    },
    assessmentCriteria: [{
        type: String,
        required: [true, 'Assessment criteria is required'],
        trim: true
    }]
});

const capacityRulesSchema = new Schema({
    minParticipants: {
        type: Number,
        required: [true, 'Minimum participants is required'],
        min: [1, 'Minimum participants must be at least 1']
    },
    maxParticipants: {
        type: Number,
        required: [true, 'Maximum participants is required'],
        min: [1, 'Maximum participants must be at least 1']
    },
    coachToParticipantRatio: {
        type: Number,
        required: [true, 'Coach to participant ratio is required'],
        min: [1, 'Ratio must be at least 1:1']
    },
    waitlistCapacity: {
        type: Number,
        required: [true, 'Waitlist capacity is required'],
        min: [0, 'Waitlist capacity cannot be negative']
    },
    allowOverbooking: {
        type: Boolean,
        default: false
    },
    overbookingPercentage: {
        type: Number,
        min: [0, 'Overbooking percentage cannot be negative'],
        max: [100, 'Overbooking percentage cannot exceed 100%']
    }
});

const pricingModelSchema = new Schema({
    basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
        min: [0, 'Base price cannot be negative']
    },
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        default: 'USD',
        uppercase: true
    },
    pricingType: {
        type: String,
        enum: ['per_session', 'per_term', 'per_month', 'flat_rate'],
        required: [true, 'Pricing type is required']
    },
    discounts: {
        earlyBird: { type: Number, min: 0, max: 100 },
        sibling: { type: Number, min: 0, max: 100 },
        loyalty: { type: Number, min: 0, max: 100 },
        bulk: { type: Number, min: 0, max: 100 }
    },
    additionalFees: {
        registration: { type: Number, min: 0 },
        equipment: { type: Number, min: 0 },
        insurance: { type: Number, min: 0 }
    }
});

const eligibilityRulesSchema = new Schema({
    ageRestrictions: {
        type: ageGroupSchema,
        required: [true, 'Age restrictions are required']
    },
    skillLevelRequired: {
        type: String,
        enum: Object.values(SkillLevel)
    },
    prerequisitePrograms: [{
        type: Schema.Types.ObjectId,
        ref: 'Program'
    }],
    medicalClearanceRequired: {
        type: Boolean,
        default: false
    },
    parentalConsentRequired: {
        type: Boolean,
        default: true
    },
    equipmentRequired: [{
        type: String,
        trim: true
    }],
    specialRequirements: [{
        type: String,
        trim: true
    }]
});

const classTemplateSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Class template name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Class template description is required'],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'Class duration is required'],
        min: [15, 'Class duration must be at least 15 minutes']
    },
    activities: [{
        type: String,
        required: [true, 'Activity is required'],
        trim: true
    }],
    equipmentNeeded: [{
        type: String,
        trim: true
    }],
    safetyRequirements: [{
        type: String,
        trim: true
    }],
    learningObjectives: [{
        type: String,
        required: [true, 'Learning objective is required'],
        trim: true
    }],
    assessmentPoints: [{
        type: String,
        trim: true
    }]
});

const timeSlotSchema = new Schema({
    startTime: {
        type: String,
        required: [true, 'Start time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    endTime: {
        type: String,
        required: [true, 'End time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    days: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: [true, 'Day is required']
    }]
});

const programSchema = new Schema<IProgram>({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Program name is required'],
        trim: true,
        maxlength: [100, 'Program name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Program description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    shortDescription: {
        type: String,
        required: [true, 'Short description is required'],
        trim: true,
        maxlength: [200, 'Short description cannot exceed 200 characters']
    },
    programType: {
        type: String,
        enum: Object.values(ProgramType),
        required: [true, 'Program type is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        index: true
    },
    subcategory: {
        type: String,
        trim: true,
        index: true
    },

    // Organization
    // @ts-ignore - Mongoose type issue
    businessUnitId: {
        type: Schema.Types.ObjectId,
        ref: 'BusinessUnit',
        required: [true, 'Business unit is required'],
        index: true
    },
    locationIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Location',
        required: [true, 'At least one location is required']
    }],

    // Age and Skill
    ageGroups: {
        type: [ageGroupSchema],
        required: [true, 'At least one age group is required'],
        validate: {
            validator: function (ageGroups: any[]) {
                return ageGroups && ageGroups.length > 0;
            },
            message: 'At least one age group is required'
        }
    },
    skillLevels: [{
        type: String,
        enum: Object.values(SkillLevel),
        required: [true, 'Skill level is required']
    }],
    skillProgression: [skillProgressionSchema],

    // Capacity and Rules
    capacityRules: {
        type: capacityRulesSchema,
        required: [true, 'Capacity rules are required']
    },
    eligibilityRules: {
        type: eligibilityRulesSchema,
        required: [true, 'Eligibility rules are required']
    },

    // Pricing
    pricingModel: {
        type: pricingModelSchema,
        required: [true, 'Pricing model is required']
    },

    // Class Structure
    classTemplates: {
        type: [classTemplateSchema],
        required: [true, 'At least one class template is required'],
        validate: {
            validator: function (templates: any[]) {
                return templates && templates.length > 0;
            },
            message: 'At least one class template is required'
        }
    },
    sessionDuration: {
        type: Number,
        required: [true, 'Session duration is required'],
        min: [15, 'Session duration must be at least 15 minutes']
    },
    sessionsPerWeek: {
        type: Number,
        required: [true, 'Sessions per week is required'],
        min: [1, 'Must have at least 1 session per week'],
        max: [7, 'Cannot have more than 7 sessions per week']
    },
    termDuration: {
        type: Number,
        required: [true, 'Term duration is required'],
        min: [1, 'Term duration must be at least 1 week'],
        max: [52, 'Term duration cannot exceed 52 weeks']
    },

    // Scheduling
    availableDays: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: [true, 'Available day is required']
    }],
    availableTimeSlots: [timeSlotSchema],

    // Status and Metadata
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isPublic: {
        type: Boolean,
        default: true,
        index: true
    },
    requiresApproval: {
        type: Boolean,
        default: false
    },

    // Media and Marketing
    imageUrl: {
        type: String,
        trim: true
    },
    videoUrl: {
        type: String,
        trim: true
    },
    brochureUrl: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],

    // Tracking
    enrollmentCount: {
        type: Number,
        default: 0,
        min: [0, 'Enrollment count cannot be negative']
    },
    maxEnrollments: {
        type: Number,
        min: [1, 'Max enrollments must be at least 1']
    },

    // Audit
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created by is required']
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Updated by is required']
    },
    version: {
        type: Number,
        default: 1
    }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Indexes for performance
programSchema.index({ businessUnitId: 1, isActive: 1 });
programSchema.index({ category: 1, subcategory: 1 });
programSchema.index({ programType: 1, isPublic: 1 });
programSchema.index({ 'ageGroups.minAge': 1, 'ageGroups.maxAge': 1 });
programSchema.index({ skillLevels: 1 });
programSchema.index({ locationIds: 1 });
programSchema.index({ tags: 1 });
programSchema.index({ 'pricingModel.basePrice': 1 });

// Compound indexes
programSchema.index({
    businessUnitId: 1,
    category: 1,
    isActive: 1,
    isPublic: 1
});

// Text search index
programSchema.index({
    name: 'text',
    description: 'text',
    shortDescription: 'text',
    category: 'text',
    subcategory: 'text',
    tags: 'text'
});

// Virtual for full price calculation
programSchema.virtual('fullPrice').get(function () {
    // @ts-ignore
    const basePrice = this.pricingModel.basePrice;
    // @ts-ignore
    const additionalFees = this.pricingModel.additionalFees || {};
    const totalFees = Object.values(additionalFees).reduce((sum: number, fee: number) => sum + (fee || 0), 0);
    return basePrice + totalFees;
});

// Pre-save middleware
programSchema.pre('save', function (next) {
    // @ts-ignore
    const program = this as any;

    // Validate capacity rules
    if (program.capacityRules.minParticipants > program.capacityRules.maxParticipants) {
        return next(new Error('Minimum participants cannot be greater than maximum participants'));
    }

    // Validate age groups
    for (const ageGroup of program.ageGroups) {
        if (ageGroup.minAge > ageGroup.maxAge) {
            return next(new Error('Minimum age cannot be greater than maximum age'));
        }
    }

    // Validate time slots
    for (const timeSlot of program.availableTimeSlots) {
        const startTime = new Date(`2000-01-01T${timeSlot.startTime}:00`);
        const endTime = new Date(`2000-01-01T${timeSlot.endTime}:00`);
        if (startTime >= endTime) {
            return next(new Error('Start time must be before end time'));
        }
    }

    // Update version
    if (this.isModified() && !this.isNew) {
        program.version += 1;
    }

    next();
});

// Instance methods
programSchema.methods.checkEligibility = function (childAge: number, childAgeType: AgeGroupType, skillLevel?: SkillLevel) {
    // Check age eligibility
    const ageEligible = this.ageGroups.some((ageGroup: any) => {
        if (ageGroup.ageType !== childAgeType) return false;
        return childAge >= ageGroup.minAge && childAge <= ageGroup.maxAge;
    });

    if (!ageEligible) {
        return {
            eligible: false,
            reasons: ['Child age does not meet program requirements']
        };
    }

    // Check skill level if required
    if (this.eligibilityRules.skillLevelRequired && skillLevel) {
        const skillLevelOrder = Object.values(SkillLevel);
        const requiredIndex = skillLevelOrder.indexOf(this.eligibilityRules.skillLevelRequired);
        const childIndex = skillLevelOrder.indexOf(skillLevel);

        if (childIndex < requiredIndex) {
            return {
                eligible: false,
                reasons: [`Required skill level: ${this.eligibilityRules.skillLevelRequired}`]
            };
        }
    }

    return { eligible: true };
};

programSchema.methods.calculatePrice = function (discountType?: string) {
    let price = this.pricingModel.basePrice;

    // Apply discounts
    if (discountType && this.pricingModel.discounts && this.pricingModel.discounts[discountType]) {
        const discountPercent = this.pricingModel.discounts[discountType];
        price = price * (1 - discountPercent / 100);
    }

    // Add additional fees
    if (this.pricingModel.additionalFees) {
        const fees = Object.values(this.pricingModel.additionalFees);
        price += fees.reduce((sum: number, fee: number) => sum + (fee || 0), 0);
    }

    return Math.round(price * 100) / 100; // Round to 2 decimal places
};

export const Program = model<IProgram>('Program', programSchema);