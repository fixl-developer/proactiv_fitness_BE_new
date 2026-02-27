// CRM Module Exports

// Models
export * from './crm.model';

// Interfaces
export * from './crm.interface';

// Services
export { FamilyService, ChildService, InquiryService, LeadService } from './crm.service';

// Controllers
export { FamilyController, ChildController, InquiryController, LeadController } from './crm.controller';

// Routes
export { default as crmRoutes } from './crm.routes';