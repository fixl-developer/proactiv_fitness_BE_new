// Facility Management Module Exports

export * from './facility.model';
export * from './facility.service';
export * from './facility.controller';
export * from './facility.routes';
export * from './facility.dto';

import { FacilityService } from './facility.service';
import { FacilityController } from './facility.controller';
import { FacilityRoutes } from './facility.routes';

export const facilityModule = {
    service: FacilityService,
    controller: FacilityController,
    routes: FacilityRoutes
};

export default facilityModule;
