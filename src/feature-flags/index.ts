/**
 * Feature Flags Module - Main Export
 */

export { FeatureFlagsService } from './feature-flags.service';
export { FeatureFlagsController } from './controllers/feature-flags.controller';
export { EvaluationEngine } from './services/evaluation-engine.service';
export { FlagManagementService } from './services/flag-management.service';
export { FlagRepository } from './repositories/flag.repository';
export * from './interfaces';