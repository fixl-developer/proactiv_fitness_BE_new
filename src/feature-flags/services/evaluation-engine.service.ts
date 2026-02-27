/**
 * Feature Flag Evaluation Engine
 * 
 * Core service for evaluating feature flags through inheritance chains,
 * rollout strategies, A/B testing, and prerequisite checking.
 */

import { FlagRepository } from '../repositories/flag.repository';
import {
    FlagDefinition,
    EvaluationContext,
    FlagEvaluation,
    HierarchyLevel,
    RolloutStrategy,
    ABTestConfig,
    ValueType
} from '../interfaces';
import { AppError } from '../../shared/utils/app-error.util';
import { Logger } from '../../shared/utils/logger.util';
import { FlagCacheUtil } from '../utils/flag-cache.util';
import murmurhash3 from 'murmurhash3js';

export class EvaluationEngine {
    private logger = Logger.getInstance();
    private cache = new FlagCacheUtil();

    constructor(private flagRepository: FlagRepository) { }

    /**
     * Evaluate a single feature flag
     */
    async evaluateFlag(flagKey: string, context: EvaluationContext): Promise<FlagEvaluation> {
        const startTime = Date.now();

        try {
            // Check cache first
            const cacheKey = this.buildCacheKey(flagKey, context.tenantId, context.environment);
            const cachedResult = this.cache.get(cacheKey);

            if (cachedResult) {
                return {
                    ...cachedResult,
                    evaluatedAt: new Date(),
                    metadata: {
                        ...cachedResult.metadata,
                        fromCache: true
                    }
                };
            }

            // Resolve flag through inheritance chain
            const flag = await this.resolveInheritance(flagKey, context);

            if (!flag) {
                // Return default value for flag type
                const defaultValue = this.getDefaultValueForType(ValueType.BOOLEAN);
                return {
                    flagKey,
                    value: defaultValue,
                    valueType: ValueType.BOOLEAN,
                    sourceLevel: HierarchyLevel.HQ,
                    sourceTenantId: context.tenantId,
                    evaluatedAt: new Date(),
                    metadata: {
                        rolloutMatched: false,
                        prerequisitesPassed: true,
                        fromCache: false
                    }
                };
            }

            // Check prerequisites
            const prerequisitesPassed = await this.checkPrerequisites(flag, context);
            if (!prerequisitesPassed) {
                const evaluation: FlagEvaluation = {
                    flagKey,
                    value: false,
                    valueType: flag.valueType,
                    sourceLevel: flag.hierarchyLevel,
                    sourceTenantId: flag.tenantId,
                    evaluatedAt: new Date(),
                    metadata: {
                        rolloutMatched: false,
                        prerequisitesPassed: false,
                        fromCache: false
                    }
                };

                // Cache the result
                this.cache.set(cacheKey, evaluation);
                return evaluation;
            }

            // Apply rollout strategy
            const rolloutMatched = this.applyRollout(flag.rollout, context, flagKey);

            let finalValue = flag.defaultValue;
            let variant: string | undefined;

            // Handle A/B testing
            if (flag.abTest && rolloutMatched && context.userId) {
                const assignedVariant = this.assignVariant(flag.abTest, context.userId, flagKey);
                const variantConfig = flag.abTest.variants.find(v => v.name === assignedVariant);
                if (variantConfig) {
                    finalValue = variantConfig.value;
                    variant = assignedVariant;
                }
            } else if (!rolloutMatched) {
                // If rollout doesn't match, return false/default for boolean flags
                finalValue = flag.valueType === ValueType.BOOLEAN ? false : flag.defaultValue;
            }

            const evaluation: FlagEvaluation = {
                flagKey,
                value: finalValue,
                valueType: flag.valueType,
                sourceLevel: flag.hierarchyLevel,
                sourceTenantId: flag.tenantId,
                variant,
                evaluatedAt: new Date(),
                metadata: {
                    rolloutMatched,
                    prerequisitesPassed: true,
                    fromCache: false
                }
            };

            // Cache the result
            this.cache.set(cacheKey, evaluation);

            // Log evaluation event
            this.logEvaluationEvent(evaluation, context, Date.now() - startTime);

            return evaluation;
        } catch (error) {
            this.logger.error(`Error evaluating flag ${flagKey}:`, error);
            throw error instanceof AppError ? error : new AppError('Flag evaluation failed', 500);
        }
    }

    /**
     * Evaluate multiple flags in bulk
     */
    async evaluateFlags(flagKeys: string[], context: EvaluationContext): Promise<Map<string, FlagEvaluation>> {
        const results = new Map<string, FlagEvaluation>();

        // Evaluate flags in parallel
        const evaluationPromises = flagKeys.map(async (flagKey) => {
            try {
                const evaluation = await this.evaluateFlag(flagKey, context);
                return { flagKey, evaluation };
            } catch (error) {
                this.logger.error(`Error evaluating flag ${flagKey} in bulk:`, error);
                // Return default evaluation for failed flags
                return {
                    flagKey,
                    evaluation: {
                        flagKey,
                        value: false,
                        valueType: ValueType.BOOLEAN,
                        sourceLevel: HierarchyLevel.HQ,
                        sourceTenantId: context.tenantId,
                        evaluatedAt: new Date(),
                        metadata: {
                            rolloutMatched: false,
                            prerequisitesPassed: false,
                            fromCache: false
                        }
                    }
                };
            }
        });

        const evaluationResults = await Promise.all(evaluationPromises);

        evaluationResults.forEach(({ flagKey, evaluation }) => {
            results.set(flagKey, evaluation);
        });

        return results;
    }

    /**
     * Resolve flag through inheritance chain
     */
    private async resolveInheritance(
        flagKey: string,
        context: EvaluationContext
    ): Promise<FlagDefinition | null> {
        const hierarchyPath = await this.getHierarchyPath(context.tenantId);

        // Search from most specific to least specific
        for (const level of hierarchyPath) {
            const levelTenantId = this.getTenantIdForLevel(context.tenantId, level);

            const flag = await this.flagRepository.findOne({
                flagKey,
                tenantId: levelTenantId,
                hierarchyLevel: level,
                environment: context.environment
            });

            if (flag) {
                return flag; // First match wins (most specific)
            }
        }

        return null; // No flag found in hierarchy
    }

    /**
     * Apply rollout strategy to determine if user should receive feature
     */
    private applyRollout(rollout: RolloutStrategy, context: EvaluationContext, flagKey: string): boolean {
        switch (rollout.type) {
            case 'all':
                return true;

            case 'percentage':
                return this.evaluatePercentageRollout(rollout.percentage || 0, context.userId || '', flagKey);

            case 'whitelist':
            case 'blacklist':
                return this.evaluateWhitelistBlacklist(rollout, context);

            case 'combined':
                return this.evaluateCombinedRollout(rollout, context, flagKey);

            default:
                return false;
        }
    }

    /**
     * Evaluate percentage-based rollout using consistent hashing
     */
    private evaluatePercentageRollout(percentage: number, userId: string, flagKey: string): boolean {
        if (!userId) return false;

        const hash = murmurhash3.x86.hash32(`${flagKey}:${userId}`);
        const bucket = Math.abs(hash) % 100;
        return bucket < percentage;
    }

    /**
     * Evaluate whitelist/blacklist rollout
     */
    private evaluateWhitelistBlacklist(rollout: RolloutStrategy, context: EvaluationContext): boolean {
        const { tenantId, userId } = context;

        // Blacklist takes precedence
        if (rollout.tenantBlacklist?.includes(tenantId)) return false;
        if (userId && rollout.userBlacklist?.includes(userId)) return false;

        // Check whitelist
        if (rollout.tenantWhitelist?.includes(tenantId)) return true;
        if (userId && rollout.userWhitelist?.includes(userId)) return true;

        return rollout.type === 'whitelist' ? false : true;
    }

    /**
     * Evaluate combined rollout strategy
     */
    private evaluateCombinedRollout(rollout: RolloutStrategy, context: EvaluationContext, flagKey: string): boolean {
        // Whitelist always wins
        if (this.evaluateWhitelistBlacklist(rollout, context)) return true;

        // Then check percentage
        if (rollout.percentage && context.userId) {
            return this.evaluatePercentageRollout(rollout.percentage, context.userId, flagKey);
        }

        // Then check attribute rules
        if (rollout.attributeRules) {
            return this.evaluateAttributeRules(rollout.attributeRules, context);
        }

        return false;
    }

    /**
     * Evaluate attribute-based rules
     */
    private evaluateAttributeRules(rules: any[], context: EvaluationContext): boolean {
        if (!context.customAttributes) return false;

        return rules.every(rule => {
            const attributeValue = context.customAttributes![rule.attribute];
            if (attributeValue === undefined) return false;

            switch (rule.operator) {
                case 'equals':
                    return attributeValue === rule.value;
                case 'in':
                    return Array.isArray(rule.value) && rule.value.includes(attributeValue);
                case 'contains':
                    return String(attributeValue).includes(String(rule.value));
                case 'gt':
                    return Number(attributeValue) > Number(rule.value);
                case 'lt':
                    return Number(attributeValue) < Number(rule.value);
                default:
                    return false;
            }
        });
    }

    /**
     * Assign A/B test variant using consistent hashing
     */
    private assignVariant(test: ABTestConfig, userId: string, flagKey: string): string {
        if (test.status === 'concluded' && test.winningVariant) {
            return test.winningVariant;
        }

        const hash = murmurhash3.x86.hash32(`${flagKey}:${test.testId}:${userId}`);
        const bucket = Math.abs(hash) % 100;

        let cumulative = 0;
        for (const variant of test.variants) {
            cumulative += variant.percentage;
            if (bucket < cumulative) {
                return variant.name;
            }
        }

        // Fallback to last variant
        return test.variants[test.variants.length - 1].name;
    }

    /**
     * Check if all prerequisites are satisfied
     */
    private async checkPrerequisites(flag: FlagDefinition, context: EvaluationContext): Promise<boolean> {
        if (!flag.prerequisites || flag.prerequisites.length === 0) {
            return true;
        }

        for (const prereqKey of flag.prerequisites) {
            const prereqEval = await this.evaluateFlag(prereqKey, context);

            // Prerequisite must be enabled (truthy)
            if (!prereqEval.value) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get hierarchy path for tenant (most specific to least specific)
     */
    private async getHierarchyPath(tenantId: string): Promise<HierarchyLevel[]> {
        // This would integrate with the tenant hierarchy from IAM/BCMS modules
        // For now, return a default hierarchy
        return [HierarchyLevel.LOCATION, HierarchyLevel.FRANCHISE, HierarchyLevel.REGION, HierarchyLevel.HQ];
    }

    /**
     * Get tenant ID for specific hierarchy level
     */
    private getTenantIdForLevel(tenantId: string, level: HierarchyLevel): string {
        // This would map the tenant ID to the appropriate level
        // For now, return the same tenant ID
        return tenantId;
    }

    /**
     * Get default value for value type
     */
    private getDefaultValueForType(valueType: ValueType): any {
        switch (valueType) {
            case ValueType.BOOLEAN:
                return false;
            case ValueType.STRING:
                return '';
            case ValueType.NUMBER:
                return 0;
            case ValueType.JSON:
                return {};
            default:
                return false;
        }
    }

    /**
     * Build cache key for flag evaluation
     */
    private buildCacheKey(flagKey: string, tenantId: string, environment: string): string {
        return `${flagKey}:${tenantId}:${environment}`;
    }

    /**
     * Log evaluation event for analytics
     */
    private logEvaluationEvent(evaluation: FlagEvaluation, context: EvaluationContext, latencyMs: number): void {
        // This would integrate with the analytics service
        this.logger.debug('Flag evaluation event', {
            flagKey: evaluation.flagKey,
            tenantId: context.tenantId,
            userId: context.userId,
            value: evaluation.value,
            variant: evaluation.variant,
            latencyMs
        });
    }

    /**
     * Invalidate cache for a specific flag
     */
    invalidateCache(flagKey: string): void {
        this.cache.invalidate(flagKey);
    }
}