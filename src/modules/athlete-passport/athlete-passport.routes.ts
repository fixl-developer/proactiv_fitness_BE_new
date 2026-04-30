import { Router } from 'express';
import { AthletePassportController } from './athlete-passport.controller';
import { authMiddleware } from '../iam/auth.middleware';

const router = Router();
const passportController = new AthletePassportController();

// Apply authentication middleware ONLY to /athlete-passport/* paths.
// (This router is mounted at '/' in routes/index.ts, so a bare router.use(authMiddleware)
//  would intercept every /api/v1/* request and break unrelated routes with 401s.)
router.use('/athlete-passport', authMiddleware);

// Passport Management Routes
router.post('/athlete-passport', passportController.createPassport);
router.get('/athlete-passport', passportController.getPassports);
router.get('/athlete-passport/statistics', passportController.getPassportStatistics);
router.get('/athlete-passport/:passportId', passportController.getPassport);
router.get('/athlete-passport/:passportId/summary', passportController.getPassportSummary);
router.get('/athlete-passport/child/:childId', passportController.getPassportByChild);

// Skill Progress Routes
router.patch('/athlete-passport/:passportId/skills', passportController.updateSkillProgress);
router.post('/athlete-passport/:passportId/milestones', passportController.addMilestone);
router.post('/athlete-passport/:passportId/benchmarks', passportController.recordBenchmark);

// Attendance Routes
router.patch('/athlete-passport/:passportId/attendance', passportController.updateAttendance);

// Behavior Tracking Routes
router.post('/athlete-passport/:passportId/behavior', passportController.addBehaviorNote);

// Transfer Routes
router.post('/athlete-passport/:passportId/transfer', passportController.requestTransfer);

// Export Routes
router.post('/athlete-passport/:passportId/export', passportController.exportPassport);

// Reports Routes
router.get('/athlete-passport/:passportId/progress-report', passportController.generateProgressReport);

// Skill Taxonomy Routes
router.post('/athlete-passport/skills/taxonomy', passportController.createSkill);
router.get('/athlete-passport/skills/taxonomy', passportController.getSkills);
router.get('/athlete-passport/skills/categories', passportController.getSkillCategories);

// Performance Benchmark Routes
router.post('/athlete-passport/benchmarks/definitions', passportController.createBenchmark);
router.get('/athlete-passport/benchmarks/definitions', passportController.getBenchmarks);

export { router as athletePassportRoutes };