import { Router } from 'express';
import { SafetyController } from './safety.controller';
import { authMiddleware } from '../iam/auth.middleware';

const router = Router();
const safetyController = new SafetyController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Guardian management routes
router.post('/safety/guardians', safetyController.createAuthorizedGuardian);
router.get('/safety/guardians/:childId', safetyController.getAuthorizedGuardians);
router.post('/safety/guardians/:guardianId/verify', safetyController.verifyGuardian);

// Pickup management routes
router.post('/safety/pickup', safetyController.processPickup);
router.get('/safety/pickup/records', safetyController.getPickupRecords);
router.get('/safety/pickup/authorization/:childId/:guardianId', safetyController.checkPickupAuthorization);

// Pickup verification codes
router.post('/safety/pickup/generate-code', safetyController.generatePickupCode);
router.post('/safety/pickup/validate-code', safetyController.validatePickupCode);

// Restriction order routes
router.post('/safety/restrictions', safetyController.createRestrictionOrder);
router.get('/safety/restrictions', safetyController.getRestrictionOrders);
router.patch('/safety/restrictions/:restrictionId/status', safetyController.updateRestrictionStatus);

// Emergency incident routes
router.post('/safety/incidents', safetyController.createEmergencyIncident);
router.get('/safety/incidents', safetyController.getEmergencyIncidents);
router.patch('/safety/incidents/:incidentId/status', safetyController.updateIncidentStatus);
router.post('/safety/incidents/:incidentId/follow-up', safetyController.addIncidentFollowUp);

// Emergency protocol routes
router.post('/safety/protocols', safetyController.createEmergencyProtocol);
router.get('/safety/protocols', safetyController.getEmergencyProtocols);

// Statistics routes
router.get('/safety/statistics', safetyController.getSafetyStatistics);

// Crisis Management routes
router.post('/safety/crisis/activate', safetyController.activateCrisisMode);
router.get('/safety/crisis', safetyController.getActiveCrises);
router.patch('/safety/crisis/:crisisId/status', safetyController.updateCrisisStatus);
router.post('/safety/crisis/:crisisId/response-team', safetyController.addResponseTeamMember);

// Incident Report routes
router.post('/safety/incident-reports', safetyController.createIncidentReport);
router.get('/safety/incident-reports', safetyController.getIncidentReports);
router.patch('/safety/incident-reports/:reportId/submit', safetyController.submitIncidentReport);
router.patch('/safety/incident-reports/:reportId/review', safetyController.reviewIncidentReport);

// Emergency Broadcast routes
router.post('/safety/broadcasts', safetyController.createEmergencyBroadcast);
router.post('/safety/broadcasts/:broadcastId/send', safetyController.sendEmergencyBroadcast);
router.get('/safety/broadcasts/:broadcastId/status', safetyController.getBroadcastStatus);
router.get('/safety/broadcasts', safetyController.getEmergencyBroadcasts);

export { router as safetyRoutes };