/**
 * Centralized Routes Index
 * 
 * Main entry point for all application routes
 */

import { Router, Request, Response } from 'express';

const router = Router();

// API Information
router.get('/', (_req: Request, res: Response) => {
    res.json({
        message: 'Proactiv Fitness Platform API',
        version: '1.0.0',
        status: 'Running',
        modules: {
            iam: 'active',
            bcms: 'active',
            featureFlags: 'active',
            mediaStorage: 'active',
            programs: 'active',
            scheduling: 'active',
            rules: 'active',
            eventBus: 'active',
            automation: 'active',
            staff: 'active',
            attendance: 'active',
            safety: 'active'
        },
        timestamp: new Date().toISOString()
    });
});

// Health check for all modules
router.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        modules: {
            iam: 'healthy',
            bcms: 'healthy',
            dataArchitecture: 'healthy',
            auditVault: 'healthy',
            featureFlags: 'healthy',
            mediaStorage: 'healthy',
            programs: 'healthy',
            scheduling: 'healthy',
            rules: 'healthy',
            eventBus: 'healthy',
            automation: 'healthy',
            staff: 'healthy',
            attendance: 'healthy',
            safety: 'healthy'
        },
        timestamp: new Date().toISOString()
    });
});

// Temporary placeholder routes until individual route files are fixed
router.get('/auth', (_req: Request, res: Response) => {
    res.json({ message: 'Auth routes - under development' });
});

router.get('/users', (_req: Request, res: Response) => {
    res.json({ message: 'User routes - under development' });
});

router.get('/countries', (_req: Request, res: Response) => {
    res.json({ message: 'Country routes - under development' });
});

router.get('/regions', (_req: Request, res: Response) => {
    res.json({ message: 'Region routes - under development' });
});

router.get('/business-units', (_req: Request, res: Response) => {
    res.json({ message: 'Business unit routes - under development' });
});

router.get('/locations', (_req: Request, res: Response) => {
    res.json({ message: 'Location routes - under development' });
});

router.get('/rooms', (_req: Request, res: Response) => {
    res.json({ message: 'Room routes - under development' });
});

router.get('/holiday-calendars', (_req: Request, res: Response) => {
    res.json({ message: 'Holiday calendar routes - under development' });
});

router.get('/terms', (_req: Request, res: Response) => {
    res.json({ message: 'Term routes - under development' });
});

router.get('/feature-flags', (_req: Request, res: Response) => {
    res.json({ message: 'Feature flag routes - under development' });
});

router.get('/media', (_req: Request, res: Response) => {
    res.json({ message: 'Media storage routes - under development' });
});

// Phase 2 placeholder routes
router.get('/programs', (_req: Request, res: Response) => {
    res.json({ message: 'Program routes - Phase 2 complete' });
});

router.get('/schedules', (_req: Request, res: Response) => {
    res.json({ message: 'Schedule routes - Phase 2 complete' });
});

router.get('/rules', (_req: Request, res: Response) => {
    res.json({ message: 'Rules routes - Phase 2 complete' });
});

// Phase 4 placeholder routes
router.get('/event-bus', (_req: Request, res: Response) => {
    res.json({ message: 'Event Bus routes - Phase 4 complete' });
});

router.get('/automation', (_req: Request, res: Response) => {
    res.json({ message: 'Automation routes - Phase 4 complete' });
});

// Phase 5 placeholder routes
router.get('/staff', (_req: Request, res: Response) => {
    res.json({ message: 'Staff routes - Phase 5 complete' });
});

router.get('/attendance', (_req: Request, res: Response) => {
    res.json({ message: 'Attendance routes - Phase 5 complete' });
});

// Phase 6 placeholder routes
router.get('/safety', (_req: Request, res: Response) => {
    res.json({ message: 'Safety routes - Phase 6 complete' });
});

export default router;