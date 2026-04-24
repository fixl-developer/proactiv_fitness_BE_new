// Marketing & Growth Engine Module Exports

export * from './marketing.model';
export * from './marketing.service';
export * from './marketing.controller';
export * from './marketing.routes';
export * from './marketing.dto';

import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { MarketingRoutes } from './marketing.routes';

export const marketingModule = {
    service: MarketingService,
    controller: MarketingController,
    routes: MarketingRoutes
};

export default marketingModule;
