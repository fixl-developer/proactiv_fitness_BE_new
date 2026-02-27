/**
 * Program Catalog Management Module
 * 
 * This module handles all program-related functionality including:
 * - Program creation and management
 * - Program categorization and filtering
 * - Enrollment eligibility checking
 * - Pricing calculations
 * - Program search and discovery
 */

export { ProgramController } from './program.controller';
export { ProgramService } from './program.service';
export { Program } from './program.model';
export * from './program.interface';
export { default as programRoutes } from './program.routes';
export * from './program.validation';