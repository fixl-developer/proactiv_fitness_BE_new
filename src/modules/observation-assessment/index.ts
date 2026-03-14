export * from './observation.model';
export * from './observation.service';
export * from './observation.controller';
export * from './observation.routes';
export * from './observation.dto';

import { ObservationService } from './observation.service';
import { ObservationController } from './observation.controller';
import { ObservationRoutes } from './observation.routes';

export const observationModule = {
    service: ObservationService,
    controller: ObservationController,
    routes: ObservationRoutes
};

export default observationModule;
