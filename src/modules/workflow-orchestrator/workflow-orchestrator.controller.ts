import { Router, Request, Response } from 'express';
import { WorkflowOrchestratorService } from './workflow-orchestrator.service';
import { authenticate } from '@modules/iam/auth.middleware';

const router = Router();
const workflowOrchestratorService = new WorkflowOrchestratorService();

// Create workflow chain
router.post('/chains/create', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { name, description, steps, useAI } = req.body;
        const createdBy = req.user?.id;

        const result = await workflowOrchestratorService.createChain({
            tenantId,
            name,
            description,
            steps,
            createdBy,
            useAI,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Execute workflow chain
router.post('/chains/execute', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { chainId } = req.body;

        const result = await workflowOrchestratorService.executeChain(chainId, tenantId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get chain details
router.get('/chains/:chainId', authenticate, async (req: Request, res: Response) => {
    try {
        const { chainId } = req.params;

        const result = await workflowOrchestratorService.getChain(chainId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Schedule report
router.post('/schedule-report', authenticate, async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { chainId, cron, description } = req.body;

        const result = await workflowOrchestratorService.scheduleReport({
            tenantId,
            chainId,
            cron,
            description,
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get workflow health
router.get('/health/:workflowId', authenticate, async (req: Request, res: Response) => {
    try {
        const { workflowId } = req.params;

        const result = await workflowOrchestratorService.getWorkflowHealth(workflowId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
