/**
 * Centralized Safety Routes
 * 
 * Drop-off Safety Protocol Engine & Incident Management
 */

import { safetyRoutes as moduleSafetyRoutes } from '../modules/safety/safety.routes';

// Re-export the module routes as centralized routes
export const safetyRoutes = moduleSafetyRoutes;

export default safetyRoutes;