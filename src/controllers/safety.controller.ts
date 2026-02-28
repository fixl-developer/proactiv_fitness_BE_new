/**
 * Centralized Safety Controller
 * 
 * Drop-off Safety Protocol Engine & Incident Management
 */

import { SafetyController as ModuleSafetyController } from '../modules/safety/safety.controller';

// Re-export the module controller as the centralized controller
export const SafetyController = ModuleSafetyController;

export default SafetyController;