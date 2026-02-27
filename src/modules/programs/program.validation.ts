import Joi from 'joi';
import { ProgramType, SkillLevel, AgeGroupType } from './program.interface';

const ageGroupSchema = Joi.object({
    minAge: Joi.number().min(0).required().messages({
        'number.min': 'Minimum age cannot be negative',
        'any.required': 'Minimum age is required'
    }),
    maxAge: Joi.number().min(0).required().messages({
        'number.min': 'Maximum age cannot be negative',
        'any.required': 'Maximum age is required'
    }),
    ageType: Joi.string().valid(...Object.values(AgeGroupType)).required().messages({
        'any.only': 'Age type must be either months or years',
        'any.required': 'Age type is required'
    }),
    description: Joi.string().trim().required().messages({
        'any.required': 'Age group description is required'
    })
}).custom((value, helpers) => {
    if (value.minAge > value.maxAge) {
        return helpers.error('any.invalid', { message: 'Minimum age cannot be greater than maximum age' });
    }
    return value;
});

const skillProgressionSchema = Joi.object({
    currentLevel: Joi.string().valid(...Object.values(SkillLevel)).required(),
    nextLevel: Joi.string().valid(...Object.values(SkillLevel)).optional(),
    prerequisites: Joi.array().items(Joi.string().trim()).default([]),
    estimatedDuration: Joi.number().min(1).required().messages({
        'number.min': 'Duration must be at least 1 week'
    }),
    assessmentCriteria: Joi.array().items(Joi.string().trim().required()).min(1).required()
});

const capacityRulesSchema = Joi.object({
    minParticipants: Joi.number().min(1).required().messages({
        'number.min': 'Minimum participants must be at least 1'
    }),
    maxParticipants: Joi.number().min(1).required().messages({
        'number.min': 'Maximum participants must be at least 1'
    }),
    coachToParticipantRatio: Joi.number().min(1).required().messages({
        'number.min': 'Ratio must be at least 1:1'
    }),
    waitlistCapacity: Joi.number().min(0).required().messages({
        'number.min': 'Waitlist capacity cannot be negative'
    }),
    allowOverbooking: Joi.boolean().default(false),
    overbookingPercentage: Joi.number().min(0).max(100).when('allowOverbooking', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.optional()
    })
}).custom((value, helpers) => {
    if (value.minParticipants > value.maxParticipants) {
        return helpers.error('any.invalid', { message: 'Minimum participants cannot be greater than maximum participants' });
    }
    return value;
});

const pricingModelSchema = Joi.object({
    basePrice: Joi.number().min(0).required().messages({
        'number.min': 'Base price cannot be negative'
    }),
    currency: Joi.string().uppercase().default('USD'),
    pricingType: Joi.string().valid('per_session', 'per_term', 'per_month', 'flat_rate').required(),
    discounts: Joi.object({
        earlyBird: Joi.number().min(0).max(100),
        sibling: Joi.number().min(0).max(100),
        loyalty: Joi.number().min(0).max(100),
        bulk: Joi.number().min(0).max(100)
    }).optional(),
    additionalFees: Joi.object({
        registration: Joi.number().min(0),
        equipment: Joi.number().min(0),
        insurance: Joi.number().min(0)
    }).optional()
});

const eligibilityRulesSchema = Joi.object({
    ageRestrictions: ageGroupSchema.required(),
    skillLevelRequired: Joi.string().valid(...Object.values(SkillLevel)).optional(),
    prerequisitePrograms: Joi.array().items(Joi.string().hex().length(24)).default([]),
    medicalClearanceRequired: Joi.boolean().default(false),
    parentalConsentRequired: Joi.boolean().default(true),
    equipmentRequired: Joi.array().items(Joi.string().trim()).default([]),
    specialRequirements: Joi.array().items(Joi.string().trim()).default([])
});

const classTemplateSchema = Joi.object({
    name: Joi.string().trim().required(),
    description: Joi.string().trim().required(),
    duration: Joi.number().min(15).required().messages({
        'number.min': 'Class duration must be at least 15 minutes'
    }),
    activities: Joi.array().items(Joi.string().trim().required()).min(1).required(),
    equipmentNeeded: Joi.array().items(Joi.string().trim()).default([]),
    safetyRequirements: Joi.array().items(Joi.string().trim()).default([]),
    learningObjectives: Joi.array().items(Joi.string().trim().required()).min(1).required(),
    assessmentPoints: Joi.array().items(Joi.string().trim()).default([])
});

const timeSlotSchema = Joi.object({
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
        'string.pattern.base': 'Invalid time format (HH:MM)'
    }),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
        'string.pattern.base': 'Invalid time format (HH:MM)'
    }),
    days: Joi.array().items(
        Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
    ).min(1).required()
}).custom((value, helpers) => {
    const startTime = new Date(`2000-01-01T${value.startTime}:00`);
    const endTime = new Date(`2000-01-01T${value.endTime}:00`);
    if (startTime >= endTime) {
        return helpers.error('any.invalid', { message: 'Start time must be before end time' });
    }
    return value;
});

export const createProgramValidation = Joi.object({
    // Basic Information
    name: Joi.string().trim().max(100).required().messages({
        'string.max': 'Program name cannot exceed 100 characters'
    }),
    description: Joi.string().trim().max(2000).required().messages({
        'string.max': 'Description cannot exceed 2000 characters'
    }),
    shortDescription: Joi.string().trim().max(200).required().messages({
        'string.max': 'Short description cannot exceed 200 characters'
    }),
    programType: Joi.string().valid(...Object.values(ProgramType)).required(),
    category: Joi.string().trim().required(),
    subcategory: Joi.string().trim().optional(),

    // Organization
    businessUnitId: Joi.string().hex().length(24).required(),
    locationIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),

    // Age and Skill
    ageGroups: Joi.array().items(ageGroupSchema).min(1).required(),
    skillLevels: Joi.array().items(Joi.string().valid(...Object.values(SkillLevel))).min(1).required(),
    skillProgression: Joi.array().items(skillProgressionSchema).default([]),

    // Capacity and Rules
    capacityRules: capacityRulesSchema.required(),
    eligibilityRules: eligibilityRulesSchema.required(),

    // Pricing
    pricingModel: pricingModelSchema.required(),

    // Class Structure
    classTemplates: Joi.array().items(classTemplateSchema).min(1).required(),
    sessionDuration: Joi.number().min(15).required().messages({
        'number.min': 'Session duration must be at least 15 minutes'
    }),
    sessionsPerWeek: Joi.number().min(1).max(7).required().messages({
        'number.min': 'Must have at least 1 session per week',
        'number.max': 'Cannot have more than 7 sessions per week'
    }),
    termDuration: Joi.number().min(1).max(52).required().messages({
        'number.min': 'Term duration must be at least 1 week',
        'number.max': 'Term duration cannot exceed 52 weeks'
    }),

    // Scheduling
    availableDays: Joi.array().items(
        Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
    ).min(1).required(),
    availableTimeSlots: Joi.array().items(timeSlotSchema).min(1).required(),

    // Status and Metadata
    isActive: Joi.boolean().default(true),
    isPublic: Joi.boolean().default(true),
    requiresApproval: Joi.boolean().default(false),

    // Media and Marketing
    imageUrl: Joi.string().uri().optional(),
    videoUrl: Joi.string().uri().optional(),
    brochureUrl: Joi.string().uri().optional(),
    tags: Joi.array().items(Joi.string().trim().lowercase()).default([]),

    // Tracking
    maxEnrollments: Joi.number().min(1).optional()
});

export const updateProgramValidation = Joi.object({
    name: Joi.string().trim().max(100).optional(),
    description: Joi.string().trim().max(2000).optional(),
    shortDescription: Joi.string().trim().max(200).optional(),
    programType: Joi.string().valid(...Object.values(ProgramType)).optional(),
    category: Joi.string().trim().optional(),
    subcategory: Joi.string().trim().optional(),
    businessUnitId: Joi.string().hex().length(24).optional(),
    locationIds: Joi.array().items(Joi.string().hex().length(24)).min(1).optional(),
    ageGroups: Joi.array().items(ageGroupSchema).min(1).optional(),
    skillLevels: Joi.array().items(Joi.string().valid(...Object.values(SkillLevel))).min(1).optional(),
    skillProgression: Joi.array().items(skillProgressionSchema).optional(),
    capacityRules: capacityRulesSchema.optional(),
    eligibilityRules: eligibilityRulesSchema.optional(),
    pricingModel: pricingModelSchema.optional(),
    classTemplates: Joi.array().items(classTemplateSchema).min(1).optional(),
    sessionDuration: Joi.number().min(15).optional(),
    sessionsPerWeek: Joi.number().min(1).max(7).optional(),
    termDuration: Joi.number().min(1).max(52).optional(),
    availableDays: Joi.array().items(
        Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
    ).min(1).optional(),
    availableTimeSlots: Joi.array().items(timeSlotSchema).min(1).optional(),
    isActive: Joi.boolean().optional(),
    isPublic: Joi.boolean().optional(),
    requiresApproval: Joi.boolean().optional(),
    imageUrl: Joi.string().uri().optional(),
    videoUrl: Joi.string().uri().optional(),
    brochureUrl: Joi.string().uri().optional(),
    tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
    maxEnrollments: Joi.number().min(1).optional()
});

export const programEligibilityValidation = Joi.object({
    childAge: Joi.number().min(0).required(),
    childAgeType: Joi.string().valid(...Object.values(AgeGroupType)).required(),
    skillLevel: Joi.string().valid(...Object.values(SkillLevel)).optional(),
    prerequisitePrograms: Joi.array().items(Joi.string().hex().length(24)).optional()
});

export const duplicateProgramValidation = Joi.object({
    newName: Joi.string().trim().max(100).required().messages({
        'string.max': 'Program name cannot exceed 100 characters',
        'any.required': 'New program name is required'
    })
});

export const idParamValidation = Joi.object({
    id: Joi.string().hex().length(24).required().messages({
        'string.hex': 'Invalid program ID format',
        'string.length': 'Invalid program ID length',
        'any.required': 'Program ID is required'
    })
});

export const programQueryValidation = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    sortBy: Joi.string().valid('name', 'category', 'createdAt', 'updatedAt', 'enrollmentCount').default('name'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
    programType: Joi.string().valid(...Object.values(ProgramType)).optional(),
    category: Joi.string().optional(),
    subcategory: Joi.string().optional(),
    skillLevel: Joi.string().valid(...Object.values(SkillLevel)).optional(),
    locationId: Joi.string().hex().length(24).optional(),
    businessUnitId: Joi.string().hex().length(24).optional(),
    isActive: Joi.boolean().optional(),
    isPublic: Joi.boolean().optional(),
    availableDay: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').optional(),
    tags: Joi.alternatives().try(
        Joi.string(),
        Joi.array().items(Joi.string())
    ).optional(),
    minAge: Joi.number().min(0).optional(),
    maxAge: Joi.number().min(0).optional(),
    ageType: Joi.string().valid(...Object.values(AgeGroupType)).optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional()
}).with('minAge', ['maxAge', 'ageType']).with('maxAge', ['minAge', 'ageType']).with('minPrice', 'maxPrice').with('maxPrice', 'minPrice');