/**
 * Feature Flag Management Service
 * 
 * Handles CRUD operations for feature flags with validation, versioning,
 * and audit integration.
 */

import { FlagRepository } from '../repositories/flag.repository';
import {
    FlagDefinition,
    CreateFlagRequest,
    UpdateFlagRequest,
    FlagQueryFilters,
    ValidationResult,
    ConfigVersion,
    HierarchyLevel,
    Environment,
    ValueType,
    RolloutType
} from '../interfaces';
import { AppError } from '../../shared/utils/app-error.util';
import { Logger } from '../../shared/utils/logger.util';
import Ajv from 'ajv';

export class FlagManagementService {
    private logger = Logger.getInstance();
    private ajv = new Ajv();
    private versionHistory = new Map<string, ConfigVersion[]>();

    constructor(private flagRepository: FlagRepository) { }

    /**
     * Create a new feature flag
     */
    async createFlag(flagData: CreateFlagRequest, author: string): Promise<FlagDefinition> {
        try {
            // Validate flag data
            const validation = this.validateFlagData(flagData);
            if (!validation.isValid) {
                throw new AppError(`Validation failed: ${validation.errors.join(', ')}`, 400);
            }

            // Check if flag already exists
            const exists = await this.flagRepository.exists(
                flagData.flagKey,
                flagData.tenantId,
                flagData.hierarchyLevel,
                flagData.environment
            );

            if (exists) {
                throw new AppError('Feature flag already exists', 409);
            }

            // Check for circular dependencies
            if (flagData.prerequisites) {
                const dependencyCheck = await this.checkDependencies(flagData.flagKey, flagData.prerequisites);
                if (!dependencyCheck.isValid) {
                    throw new AppError(`Dependency validation failed: ${dependencyCheck.errors.join(', ')}`, 400);
                }
            }

            // Create flag
            const flag = await this.flagRepository.create({
                ...flagData,
                prerequisites: flagData.prerequisites || [],
                tags: flagData.tags || [],
                createdBy: author,
                updatedBy: author
            });

            // Create version record
            await this.createVersionRecord(flag, 'create', author);

            // Emit audit event
            this.emitAuditEvent('flag_created', flag, author);

            this.logger.info(`Feature flag created: ${flag.flagKey}`, {
                flagKey: flag.flagKey,
                tenantId: flag.tenantId,
                author
            });

            return flag;
        } catch (error) {
            this.logger.error('Error creating feature flag:', error);
            throw error instanceof AppError ? error : new AppError('Failed to create feature flag', 500);
        }
    }

    /**
     * Update an existing feature flag
     */
    async updateFlag(
        flagKey: string,
        tenantId: string,
        hierarchyLevel: HierarchyLevel,
        environment: Environment,
        updates: UpdateFlagRequest,
        author: string
    ): Promise<FlagDefinition> {
        try {
            // Get current flag
            const currentFlag = await this.flagRepository.findOne({
                flagKey,
                tenantId,
                hierarchyLevel,
                environment
            });

            if (!currentFlag) {
                throw new AppError('Feature flag not found', 404);
            }

            // Validate updates
            const mergedFlag = { ...currentFlag, ...updates };
            const validation = this.validateFlagData(mergedFlag);
            if (!validation.isValid) {
                throw new AppError(`Validation failed: ${validation.errors.join(', ')}`, 400);
            }

            // Check dependencies if prerequisites are being updated
            if (updates.prerequisites) {
                const dependencyCheck = await this.checkDependencies(flagKey, updates.prerequisites);
                if (!dependencyCheck.isValid) {
                    throw new AppError(`Dependency validation failed: ${dependencyCheck.errors.join(', ')}`, 400);
                }
            }

            // Update flag
            const updatedFlag = await this.flagRepository.update(
                flagKey,
                tenantId,
                hierarchyLevel,
                environment,
                { ...updates, updatedBy: author },
                currentFlag.version
            );

            // Create version record
            await this.createVersionRecord(updatedFlag, 'update', author);

            // Emit audit event
            this.emitAuditEvent('flag_updated', updatedFlag, author, { previousVersion: currentFlag });

            this.logger.info(`Feature flag updated: ${flagKey}`, {
                flagKey,
                tenantId,
                author,
                version: updatedFlag.version
            });

            return updatedFlag;
        } catch (error) {
            this.logger.error('Error updating feature flag:', error);
            throw error instanceof AppError ? error : new AppError('Failed to update feature flag', 500);
        }
    }

    /**
     * Delete a feature flag
     */
    async deleteFlag(
        flagKey: string,
        tenantId: string,
        hierarchyLevel: HierarchyLevel,
        environment: Environment,
        author: string
    ): Promise<void> {
        try {
            // Get current flag for audit
            const currentFlag = await this.flagRepository.findOne({
                flagKey,
                tenantId,
                hierarchyLevel,
                environment
            });

            if (!currentFlag) {
                throw new AppError('Feature flag not found', 404);
            }

            // Check if flag is a prerequisite for other flags
            const dependentFlags = await this.findDependentFlags(flagKey);
            if (dependentFlags.length > 0) {
                throw new AppError(
                    `Cannot delete flag: it is a prerequisite for ${dependentFlags.length} other flags`,
                    409
                );
            }

            // Delete flag
            await this.flagRepository.delete(flagKey, tenantId, hierarchyLevel, environment);

            // Create version record
            await this.createVersionRecord(currentFlag, 'delete', author);

            // Emit audit event
            this.emitAuditEvent('flag_deleted', currentFlag, author);

            this.logger.info(`Feature flag deleted: ${flagKey}`, {
                flagKey,
                tenantId,
                author
            });
        } catch (error) {
            this.logger.error('Error deleting feature flag:', error);
            throw error instanceof AppError ? error : new AppError('Failed to delete feature flag', 500);
        }
    }

    /**
     * Query feature flags with filters
     */
    async queryFlags(filters: FlagQueryFilters, limit = 100, offset = 0): Promise<FlagDefinition[]> {
        try {
            return await this.flagRepository.findMany(filters, limit, offset);
        } catch (error) {
            this.logger.error('Error querying feature flags:', error);
            throw error instanceof AppError ? error : new AppError('Failed to query feature flags', 500);
        }
    }

    /**
     * Get a specific feature flag
     */
    async getFlag(
        flagKey: string,
        tenantId: string,
        hierarchyLevel: HierarchyLevel,
        environment: Environment
    ): Promise<FlagDefinition | null> {
        try {
            return await this.flagRepository.findOne({
                flagKey,
                tenantId,
                hierarchyLevel,
                environment
            });
        } catch (error) {
            this.logger.error('Error getting feature flag:', error);
            throw error instanceof AppError ? error : new AppError('Failed to get feature flag', 500);
        }
    }

    /**
     * Rollback flag to a previous version
     */
    async rollbackFlag(
        flagKey: string,
        tenantId: string,
        hierarchyLevel: HierarchyLevel,
        environment: Environment,
        versionId: string,
        author: string
    ): Promise<FlagDefinition> {
        try {
            // Get version to rollback to
            const versions = this.versionHistory.get(`${flagKey}:${tenantId}:${hierarchyLevel}:${environment}`) || [];
            const targetVersion = versions.find(v => v.versionId === versionId);

            if (!targetVersion) {
                throw new AppError('Version not found', 404);
            }

            // Validate compatibility (basic check)
            const validation = this.validateFlagData(targetVersion.snapshot);
            if (!validation.isValid) {
                throw new AppError('Target version is not compatible with current system', 400);
            }

            // Get current flag for version check
            const currentFlag = await this.flagRepository.findOne({
                flagKey,
                tenantId,
                hierarchyLevel,
                environment
            });

            if (!currentFlag) {
                throw new AppError('Feature flag not found', 404);
            }

            // Update flag with rolled back data
            const rolledBackFlag = await this.flagRepository.update(
                flagKey,
                tenantId,
                hierarchyLevel,
                environment,
                {
                    ...targetVersion.snapshot,
                    updatedBy: author
                },
                currentFlag.version
            );

            // Create version record for rollback
            await this.createVersionRecord(rolledBackFlag, 'rollback', author, `Rolled back to version ${versionId}`);

            // Emit audit event
            this.emitAuditEvent('flag_rolled_back', rolledBackFlag, author, { targetVersionId: versionId });

            this.logger.info(`Feature flag rolled back: ${flagKey}`, {
                flagKey,
                tenantId,
                author,
                targetVersionId: versionId
            });

            return rolledBackFlag;
        } catch (error) {
            this.logger.error('Error rolling back feature flag:', error);
            throw error instanceof AppError ? error : new AppError('Failed to rollback feature flag', 500);
        }
    }

    /**
     * Get version history for a flag
     */
    getVersionHistory(
        flagKey: string,
        tenantId: string,
        hierarchyLevel: HierarchyLevel,
        environment: Environment
    ): ConfigVersion[] {
        const key = `${flagKey}:${tenantId}:${hierarchyLevel}:${environment}`;
        return this.versionHistory.get(key) || [];
    }

    /**
     * Validate flag data
     */
    private validateFlagData(flagData: any): ValidationResult {
        const errors: string[] = [];

        // Required fields
        if (!flagData.flagKey) errors.push('flagKey is required');
        if (!flagData.tenantId) errors.push('tenantId is required');
        if (!flagData.hierarchyLevel) errors.push('hierarchyLevel is required');
        if (!flagData.environment) errors.push('environment is required');
        if (!flagData.valueType) errors.push('valueType is required');
        if (flagData.defaultValue === undefined) errors.push('defaultValue is required');

        // Validate enums
        if (flagData.hierarchyLevel && !Object.values(HierarchyLevel).includes(flagData.hierarchyLevel)) {
            errors.push('Invalid hierarchyLevel');
        }
        if (flagData.environment && !Object.values(Environment).includes(flagData.environment)) {
            errors.push('Invalid environment');
        }
        if (flagData.valueType && !Object.values(ValueType).includes(flagData.valueType)) {
            errors.push('Invalid valueType');
        }

        // Validate rollout strategy
        if (flagData.rollout) {
            if (!Object.values(RolloutType).includes(flagData.rollout.type)) {
                errors.push('Invalid rollout type');
            }

            if (flagData.rollout.type === 'percentage' &&
                (flagData.rollout.percentage < 0 || flagData.rollout.percentage > 100)) {
                errors.push('Rollout percentage must be between 0 and 100');
            }
        }

        // Validate A/B test configuration
        if (flagData.abTest) {
            const totalPercentage = flagData.abTest.variants.reduce((sum: number, v: any) => sum + v.percentage, 0);
            if (Math.abs(totalPercentage - 100) > 0.01) {
                errors.push('A/B test variant percentages must sum to 100');
            }
        }

        // Validate JSON schema if provided
        if (flagData.schema) {
            try {
                this.ajv.compile(flagData.schema);
            } catch (error) {
                errors.push('Invalid JSON schema');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Check for circular dependencies
     */
    private async checkDependencies(flagKey: string, prerequisites: string[]): Promise<ValidationResult> {
        const errors: string[] = [];
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const hasCycle = (current: string): boolean => {
            visited.add(current);
            recursionStack.add(current);

            const deps = current === flagKey ? prerequisites : [];

            for (const dep of deps) {
                if (!visited.has(dep)) {
                    if (hasCycle(dep)) return true;
                } else if (recursionStack.has(dep)) {
                    return true;
                }
            }

            recursionStack.delete(current);
            return false;
        };

        if (hasCycle(flagKey)) {
            errors.push('Circular dependency detected');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Find flags that depend on the given flag
     */
    private async findDependentFlags(flagKey: string): Promise<FlagDefinition[]> {
        // This would query all flags and check their prerequisites
        // For now, return empty array
        return [];
    }

    /**
     * Create version record
     */
    private async createVersionRecord(
        flag: FlagDefinition,
        changeType: 'create' | 'update' | 'delete' | 'rollback',
        author: string,
        comment?: string
    ): Promise<void> {
        const versionId = `v${flag.version}-${Date.now()}`;
        const version: ConfigVersion = {
            versionId,
            flagKey: flag.flagKey,
            tenantId: flag.tenantId,
            snapshot: { ...flag },
            changeType,
            author,
            timestamp: new Date(),
            comment
        };

        const key = `${flag.flagKey}:${flag.tenantId}:${flag.hierarchyLevel}:${flag.environment}`;
        const versions = this.versionHistory.get(key) || [];
        versions.push(version);
        this.versionHistory.set(key, versions);
    }

    /**
     * Emit audit event
     */
    private emitAuditEvent(eventType: string, flag: FlagDefinition, author: string, metadata?: any): void {
        // This would integrate with the Audit & Compliance Vault
        this.logger.info(`Audit event: ${eventType}`, {
            eventType,
            flagKey: flag.flagKey,
            tenantId: flag.tenantId,
            author,
            metadata
        });
    }
}