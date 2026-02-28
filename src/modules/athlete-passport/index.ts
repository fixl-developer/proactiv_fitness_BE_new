/**
 * Athlete Passport Module Index
 * 
 * Digital Athlete Passport - Module 7.1
 */

// Models
export {
    AthletePassport,
    SkillTaxonomy,
    PerformanceBenchmark
} from './athlete-passport.model';

// Interfaces
export * from './athlete-passport.interface';

// Services
export {
    AthletePassportService,
    SkillTaxonomyService,
    PerformanceBenchmarkService
} from './athlete-passport.service';

// Controller
export { AthletePassportController } from './athlete-passport.controller';

// Routes
export { athletePassportRoutes } from './athlete-passport.routes';