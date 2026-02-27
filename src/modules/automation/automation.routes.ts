import { Router } from 'express';
import { AutomationController } from './automation.controller';
import { authMiddleware } from '../iam/auth.middleware';

const router = Router();
const automationController = new AutomationController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Workflow routes
router.post('/workflows', automationController.createWorkflow);
router.get('/workflows', automationController.getWorkflows);
router.get('/workflows/:workflowId', automationController.getWorkflowById);
router.put('/workflows/:workflowId', automationController.updateWorkflow);
router.delete('/workflows/:workflowId', automationController.deleteWorkflow);

// Workflow execution routes
router.post('/workflows/:workflowId/execute', automationController.executeWorkflow);
router.get('/workflows/:workflowId/executions', automationController.getWorkflowExecutions);
router.patch('/workflows/:workflowId/status', automationController.updateWorkflowStatus);

// Workflow simulation
router.post('/workflows/:workflowId/simulate', automationController.simulateWorkflow);

// Workflow statistics
router.get('/workflows/statistics/overview', automationController.getWorkflowStatistics);

// Automation rules routes
router.post('/rules', automationController.createAutomationRule);
router.get('/rules', automationController.getAutomationRules);

// Workflow templates routes
router.post('/templates', automationController.createWorkflowTemplate);
router.get('/templates', automationController.getWorkflowTemplates);

export { router as automationRoutes };