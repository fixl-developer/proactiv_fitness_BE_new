import Joi from 'joi';

export const flagValidationSchema = Joi.object({
    flagKey: Joi.string().required().min(1).max(100).pattern(/^[a-zA-Z0-9_.-]+$/),
    name: Joi.string().required().min(1).max(200),
    description: Joi.string().optional().max(1000),
    tenantId: Joi.string().optional().allow(null),
    environment: Joi.string().valid('development', 'staging', 'production').required(),
    hierarchyLevel: Joi.string().valid('hq', 'franchise', 'location').required(),
    isEnabled: Joi.boolean().required(),
    defaultValue: Joi.alternatives().try(
        Joi.boolean(),
        Joi.string(),
        Joi.number(),
        Joi.object()
    ).required(),
    valueType: Joi.string().valid('boolean', 'string', 'number', 'json').required(),

    // Targeting rules
    targetingRules: Joi.array().items(
        Joi.object({
            id: Joi.string().required(),
            name: Joi.string().required(),
            conditions: Joi.array().items(
                Joi.object({
                    attribute: Joi.string().required(),
                    operator: Joi.string().valid('equals', 'not_equals', 'in', 'not_in', 'contains', 'not_contains', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'regex').required(),
                    value: Joi.alternatives().try(
                        Joi.string(),
                        Joi.number(),
                        Joi.boolean(),
                        Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.number()))
                    ).required()
                })
            ).required(),
            value: Joi.alternatives().try(
                Joi.boolean(),
                Joi.string(),
                Joi.number(),
                Joi.object()
            ).required(),
            rolloutPercentage: Joi.number().min(0).max(100).optional()
        })
    ).optional(),

    // Rollout configuration
    rolloutConfig: Joi.object({
        enabled: Joi.boolean().required(),
        percentage: Joi.number().min(0).max(100).required(),
        strategy: Joi.string().valid('percentage', 'user_id', 'custom').required(),
        customAttribute: Joi.string().optional(),
        stickyBucketing: Joi.boolean().optional()
    }).optional(),

    // A/B testing
    abTestConfig: Joi.object({
        enabled: Joi.boolean().required(),
        variants: Joi.array().items(
            Joi.object({
                id: Joi.string().required(),
                name: Joi.string().required(),
                value: Joi.alternatives().try(
                    Joi.boolean(),
                    Joi.string(),
                    Joi.number(),
                    Joi.object()
                ).required(),
                weight: Joi.number().min(0).max(100).required()
            })
        ).optional(),
        trafficAllocation: Joi.number().min(0).max(100).optional()
    }).optional(),

    // Metadata
    category: Joi.string().optional().max(100),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    owner: Joi.string().optional().max(100),

    // Scheduling
    scheduledChanges: Joi.array().items(
        Joi.object({
            id: Joi.string().required(),
            scheduledAt: Joi.date().required(),
            changes: Joi.object().required(),
            status: Joi.string().valid('pending', 'applied', 'cancelled').optional()
        })
    ).optional(),

    // Inheritance
    inheritanceConfig: Joi.object({
        allowOverride: Joi.boolean().required(),
        overrideLevel: Joi.string().valid('franchise', 'location').optional(),
        inheritedFrom: Joi.string().optional()
    }).optional(),

    // Archival
    isArchived: Joi.boolean().optional(),
    archivedAt: Joi.date().optional(),
    archivedBy: Joi.string().optional()
});

export const evaluationValidationSchema = Joi.object({
    tenantId: Joi.string().required(),
    environment: Joi.string().valid('development', 'staging', 'production').required(),
    userId: Joi.string().optional(),
    sessionId: Joi.string().optional(),

    // User attributes
    userAttributes: Joi.object().pattern(
        Joi.string(),
        Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean(), Joi.array())
    ).optional(),

    // Context attributes
    contextAttributes: Joi.object().pattern(
        Joi.string(),
        Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean(), Joi.array())
    ).optional(),

    // Hierarchy context
    hierarchyContext: Joi.object({
        hqId: Joi.string().optional(),
        franchiseId: Joi.string().optional(),
        locationId: Joi.string().optional()
    }).optional(),

    // Request metadata
    requestMetadata: Joi.object({
        ipAddress: Joi.string().optional(),
        userAgent: Joi.string().optional(),
        timestamp: Joi.date().optional()
    }).optional()
});

export const bulkEvaluationValidationSchema = Joi.object({
    flagKeys: Joi.array().items(Joi.string().required()).min(1).max(100).required(),
    context: evaluationValidationSchema.required()
});

export const flagUpdateValidationSchema = Joi.object({
    name: Joi.string().optional().min(1).max(200),
    description: Joi.string().optional().max(1000),
    isEnabled: Joi.boolean().optional(),
    defaultValue: Joi.alternatives().try(
        Joi.boolean(),
        Joi.string(),
        Joi.number(),
        Joi.object()
    ).optional(),
    targetingRules: Joi.array().items(
        Joi.object({
            id: Joi.string().required(),
            name: Joi.string().required(),
            conditions: Joi.array().items(
                Joi.object({
                    attribute: Joi.string().required(),
                    operator: Joi.string().valid('equals', 'not_equals', 'in', 'not_in', 'contains', 'not_contains', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'regex').required(),
                    value: Joi.alternatives().try(
                        Joi.string(),
                        Joi.number(),
                        Joi.boolean(),
                        Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.number()))
                    ).required()
                })
            ).required(),
            value: Joi.alternatives().try(
                Joi.boolean(),
                Joi.string(),
                Joi.number(),
                Joi.object()
            ).required(),
            rolloutPercentage: Joi.number().min(0).max(100).optional()
        })
    ).optional(),
    rolloutConfig: Joi.object({
        enabled: Joi.boolean().required(),
        percentage: Joi.number().min(0).max(100).required(),
        strategy: Joi.string().valid('percentage', 'user_id', 'custom').required(),
        customAttribute: Joi.string().optional(),
        stickyBucketing: Joi.boolean().optional()
    }).optional(),
    abTestConfig: Joi.object({
        enabled: Joi.boolean().required(),
        variants: Joi.array().items(
            Joi.object({
                id: Joi.string().required(),
                name: Joi.string().required(),
                value: Joi.alternatives().try(
                    Joi.boolean(),
                    Joi.string(),
                    Joi.number(),
                    Joi.object()
                ).required(),
                weight: Joi.number().min(0).max(100).required()
            })
        ).optional(),
        trafficAllocation: Joi.number().min(0).max(100).optional()
    }).optional(),
    category: Joi.string().optional().max(100),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    owner: Joi.string().optional().max(100),
    scheduledChanges: Joi.array().items(
        Joi.object({
            id: Joi.string().required(),
            scheduledAt: Joi.date().required(),
            changes: Joi.object().required(),
            status: Joi.string().valid('pending', 'applied', 'cancelled').optional()
        })
    ).optional(),
    inheritanceConfig: Joi.object({
        allowOverride: Joi.boolean().required(),
        overrideLevel: Joi.string().valid('franchise', 'location').optional(),
        inheritedFrom: Joi.string().optional()
    }).optional(),
    isArchived: Joi.boolean().optional()
});