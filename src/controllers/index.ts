/**
 * Centralized Controllers Index
 * 
 * Main entry point for all application controllers
 */

// IAM Controllers
export { default as AuthController } from './auth.controller';
export { default as UserController } from './user.controller';

// BCMS Controllers
export { default as CountryController } from './country.controller';
export { default as RegionController } from './region.controller';
export { default as BusinessUnitController } from './business-unit.controller';
export { default as LocationController } from './location.controller';
export { default as RoomController } from './room.controller';
export { default as HolidayCalendarController } from './holiday-calendar.controller';
export { default as TermController } from './term.controller';

// Feature Flags Controllers
export { FeatureFlagsController } from './feature-flags.controller';

// Media Storage Controllers
export { MediaStorageController } from './media-storage.controller';

// Phase 2 Controllers
export { ProgramController } from './program.controller';
export { ScheduleController } from './schedule.controller';
export { RuleController, PolicyController, RuleTemplateController } from './rule.controller';

// Phase 4 Controllers
export { AutomationController } from './automation.controller';

// Phase 5 Controllers
export { StaffController } from './staff.controller';
export { AttendanceController } from './attendance.controller';

// Phase 6 Controllers
export { SafetyController } from './safety.controller';