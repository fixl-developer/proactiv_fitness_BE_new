import { Router } from 'express';
import { container } from 'tsyringe';
import { FranchiseController } from './franchise.controller';

const router = Router();
const controller = container.resolve(FranchiseController);

// Franchise Profile Management
router.post('/franchises', (req, res) => controller.createFranchise(req, res));
router.get('/franchises', (req, res) => controller.getAllFranchises(req, res));
router.get('/franchises/status/:status', (req, res) => controller.getFranchisesByStatus(req, res));
router.get('/franchises/:franchiseId', (req, res) => controller.getFranchise(req, res));
router.put('/franchises/:franchiseId', (req, res) => controller.updateFranchise(req, res));
router.delete('/franchises/:franchiseId', (req, res) => controller.deleteFranchise(req, res));
router.post('/franchises/:franchiseId/approve', (req, res) => controller.approveFranchise(req, res));
router.post('/franchises/:franchiseId/reject', (req, res) => controller.rejectFranchise(req, res));

// Royalty Management
router.post('/franchises/:franchiseId/royalties/calculate', (req, res) => controller.calculateRoyalty(req, res));
router.get('/franchises/:franchiseId/royalties', (req, res) => controller.getRoyalties(req, res));
router.post('/royalties/:royaltyId/pay', (req, res) => controller.processRoyaltyPayment(req, res));
router.get('/franchises/:franchiseId/royalties/report', (req, res) => controller.getRoyaltyReport(req, res));

// Dashboard
router.get('/franchises/:franchiseId/dashboard', (req, res) => controller.generateDashboard(req, res));

// Performance Tracking
router.post('/franchises/:franchiseId/performance', (req, res) => controller.trackPerformance(req, res));
router.get('/franchises/:franchiseId/performance', (req, res) => controller.getPerformance(req, res));
router.get('/franchises/:franchiseId/performance/history', (req, res) => controller.getPerformanceHistory(req, res));

// Compliance Management
router.post('/franchises/:franchiseId/compliance', (req, res) => controller.addComplianceCheck(req, res));
router.get('/franchises/:franchiseId/compliance', (req, res) => controller.getCompliances(req, res));
router.put('/compliance/:complianceId/status', (req, res) => controller.updateComplianceStatus(req, res));

// Training Management
router.post('/franchises/:franchiseId/training', (req, res) => controller.createTraining(req, res));
router.get('/franchises/:franchiseId/training', (req, res) => controller.getTrainings(req, res));
router.post('/training/:trainingId/complete', (req, res) => controller.completeTraining(req, res));

// Support Ticket Management
router.post('/franchises/:franchiseId/support', (req, res) => controller.createSupportTicket(req, res));
router.get('/franchises/:franchiseId/support', (req, res) => controller.getSupportTickets(req, res));
router.put('/support/:ticketId', (req, res) => controller.updateSupportTicket(req, res));

// Agreement Management
router.post('/franchises/:franchiseId/agreements', (req, res) => controller.createAgreement(req, res));
router.get('/franchises/:franchiseId/agreements', (req, res) => controller.getAgreements(req, res));
router.post('/agreements/:agreementId/renew', (req, res) => controller.renewAgreement(req, res));

// Search & Stats
router.get('/franchises/search', (req, res) => controller.searchFranchises(req, res));
router.get('/franchises/stats', (req, res) => controller.getFranchiseStats(req, res));

export default router;
