export * from './partner.model';
export * from './partner.service';
export * from './partner.controller';
export * from './partner.routes';
export * from './partner.dto';

import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';
import { PartnerRoutes } from './partner.routes';

export const partnerModule = {
    service: PartnerService,
    controller: PartnerController,
    routes: PartnerRoutes
};

export default partnerModule;
