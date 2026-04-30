/**
 * Feature Flags Module - Core Interfaces
 * 
 * Defines the data structures for the hierarchical feature flag system
 * supporting tenant-specific configuration, rollout strategies, A/B testing,
 * and environment isolation.
 */

export enum HierarchyLevel {
    HQ = 'HQ',
    REGION = 'REGION',
    FRANCHISE = 'FRANCHISE',
    LOCATION = 'LOCATION'
}

export enum Environment {
    PRODUCTION = 'PRODUCTION',
    STAGING = 'STAGING',
    SANDBOX = 'SANDBOX'
}

export enum ValueType {
    BOOLEAN = 'boolean',
    STRING = 'string',
    NUMBER = 'number',
    JSON = 'json'
}

export enum RolloutType {
    ALL = 'all',
    PERCENTAGE = 'percentage',
    WHITELIST = 'whitelist',
    BLACKLIST = 'blacklist',
    COMBINED = 'combined'
}

export interface AttributeRule {
    attribute: string;
    operator: 'equals' | 'in' | 'contains' | 'gt' | 'lt';
    value: any;
}

export interface RolloutStrategy {
    type: RolloutType;
    percentage?: number; // 0-100
    tenantWhitelist?: string[];
    tenantBlacklist?: string[];
    userWhitelist?: string[];
    userBlacklist?: string[];
    attributeRules?: AttributeRule[];
}

export interface ABVariant {
    name: string;
    percentage: number;
    value: any;
}

export interface ABTestConfig {
    testId: string;
    variants: ABVariant[];
    status: 'active' | 'concluded' | 'paused';
    winningVariant?: string;
    startDate: Date;
    endDate?: Date;
}

export interface FlagDefinition {
    flagKey: string;
    tenantId: string;
    hierarchyLevel: HierarchyLevel;
    environment: Environment;
    valueType: ValueType;
    defaultValue: any;
    rollout: RolloutStrategy;
    abTest?: ABTestConfig;
    prerequisites: string[];
    schema?: any; // JSON Schema
    description: string;
    tags: string[];
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    version: number;
}

export interface EvaluationContext {
    tenantId: string;
    userId?: string;
    environment: Environment;
    hierarchyLevel?: HierarchyLevel;
    customAttributes?: Record<string, any>;
}

export interface FlagEvaluation {
    flagKey: string;
    value: any;
    valueType: ValueType;
    sourceLevel: HierarchyLevel;
    sourceTenantId: string;
    variant?: string;
    evaluatedAt: Date;
    reason?: string;
    ruleId?: string;
    evaluationTime?: number;
    metadata: {
        rolloutMatched: boolean;
        prerequisitesPassed: boolean;
        fromCache: boolean;
    };
}

export interface ConfigVersion {
    versionId: string;
    flagKey: string;
    tenantId: string;
    snapshot: FlagDefinition;
    changeType: 'create' | 'update' | 'delete' | 'rollback';
    author: string;
    timestamp: Date;
    comment?: string;
}

export interface FlagEvaluationEvent {
    eventId: string;
    flagKey: string;
    tenantId: string;
    userId?: string;
    environment: Environment;
    value: any;
    variant?: string;
    sourceLevel: HierarchyLevel;
    latencyMs: number;
    timestamp: Date;
}

export interface CreateFlagRequest {
    flagKey: string;
    tenantId: string;
    hierarchyLevel: HierarchyLevel;
    environment: Environment;
    valueType: ValueType;
    defaultValue: any;
    rollout: RolloutStrategy;
    abTest?: ABTestConfig;
    prerequisites?: string[];
    schema?: any;
    description: string;
    tags?: string[];
}

export interface UpdateFlagRequest {
    defaultValue?: any;
    rollout?: RolloutStrategy;
    abTest?: ABTestConfig;
    prerequisites?: string[];
    schema?: any;
    description?: string;
    tags?: string[];
}

export interface FlagQueryFilters {
    tenantId?: string;
    hierarchyLevel?: HierarchyLevel;
    environment?: Environment;
    tags?: string[];
    createdBy?: string;
    updatedAfter?: Date;
    updatedBefore?: Date;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface FlagChangeEvent {
    flagKey: string;
    changeType: 'create' | 'update' | 'delete';
    timestamp: Date;
}