/**
 * Centralized Routes Index
 * Main entry point for all application routes
 */

import { Router, Request, Response } from 'express';

// Phase 1: Core Infrastructure
import authRoutes from '../modules/iam/auth.routes';
import userRoutes from '../modules/iam/user.routes';

const router = Router();

// API Information
router.get('/', (_req: Request, res: Response) => {
    res.json({
        message: 'Proactiv Fitness Platform API',
        version: '1.0.0',
        status: 'Running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

router.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Phase 1: Core Infrastructure
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
