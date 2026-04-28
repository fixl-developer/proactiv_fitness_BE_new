import { Router, Request, Response } from 'express';
import { authenticate } from '../iam/auth.middleware';

const router = Router();

// Mock downloadable resources
const downloadableResources = [
    {
        id: '1',
        name: 'Fitness Guide 2024',
        type: 'pdf',
        size: '2.5 MB',
        category: 'guides',
        downloadUrl: '/downloads/fitness-guide-2024.pdf',
        createdAt: new Date('2024-01-15')
    },
    {
        id: '2',
        name: 'Nutrition Handbook',
        type: 'pdf',
        size: '1.8 MB',
        category: 'nutrition',
        downloadUrl: '/downloads/nutrition-handbook.pdf',
        createdAt: new Date('2024-02-01')
    },
    {
        id: '3',
        name: 'Training Schedule Template',
        type: 'xlsx',
        size: '0.5 MB',
        category: 'templates',
        downloadUrl: '/downloads/training-schedule.xlsx',
        createdAt: new Date('2024-02-10')
    },
    {
        id: '4',
        name: 'Progress Tracking Sheet',
        type: 'xlsx',
        size: '0.3 MB',
        category: 'templates',
        downloadUrl: '/downloads/progress-tracking.xlsx',
        createdAt: new Date('2024-02-15')
    },
    {
        id: '5',
        name: 'Safety Guidelines',
        type: 'pdf',
        size: '1.2 MB',
        category: 'safety',
        downloadUrl: '/downloads/safety-guidelines.pdf',
        createdAt: new Date('2024-01-20')
    }
];

/**
 * @route   GET /downloads
 * @desc    Get available downloads
 * @access  Private
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const { category } = req.query;
        let resources = downloadableResources;

        if (category) {
            resources = resources.filter(r => r.category === category);
        }

        res.json({ success: true, data: resources });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /downloads/:resourceId
 * @desc    Get download details
 * @access  Private
 */
router.get('/:resourceId', authenticate, async (req: Request, res: Response) => {
    try {
        const { resourceId } = req.params;

        const resource = downloadableResources.find(r => r.id === resourceId);
        if (!resource) {
            res.status(404).json({ success: false, message: 'Resource not found' });
            return;
        }

        res.json({ success: true, data: resource });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /downloads/:resourceId/download
 * @desc    Log download and return download link
 * @access  Private
 */
router.post('/:resourceId/download', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { resourceId } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const resource = downloadableResources.find(r => r.id === resourceId);
        if (!resource) {
            res.status(404).json({ success: false, message: 'Resource not found' });
            return;
        }

        // In production, log the download and generate a signed URL
        res.json({
            success: true,
            data: {
                resourceId,
                downloadUrl: resource.downloadUrl,
                fileName: resource.name,
                message: 'Download started'
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /downloads/categories
 * @desc    Get download categories
 * @access  Private
 */
router.get('/categories', authenticate, async (req: Request, res: Response) => {
    try {
        const categories = [...new Set(downloadableResources.map(r => r.category))];
        res.json({ success: true, data: categories });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
