import { Router, Request, Response } from 'express';
import { authenticate } from '../iam/auth.middleware';

const router = Router();

// Mock certificates data
const mockCertificates = [
    {
        id: '1',
        userId: 'user-123',
        title: 'Gymnastics Level 1 Completion',
        issueDate: '2024-01-15',
        expiryDate: '2025-01-15',
        certificateNumber: 'CERT-2024-001',
        issuer: 'ProActiv Fitness',
        status: 'active',
        downloadUrl: '/certificates/cert-001.pdf'
    },
    {
        id: '2',
        userId: 'user-123',
        title: 'Multi-Sports Proficiency',
        issueDate: '2024-02-20',
        expiryDate: '2025-02-20',
        certificateNumber: 'CERT-2024-002',
        issuer: 'ProActiv Fitness',
        status: 'active',
        downloadUrl: '/certificates/cert-002.pdf'
    }
];

/**
 * @route   GET /certificates
 * @desc    Get user's certificates
 * @access  Private
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        // Return mock certificates for demo
        res.json({ success: true, data: mockCertificates });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /certificates/:certificateId
 * @desc    Get certificate details
 * @access  Private
 */
router.get('/:certificateId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { certificateId } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const certificate = mockCertificates.find(c => c.id === certificateId);
        if (!certificate) {
            res.status(404).json({ success: false, message: 'Certificate not found' });
            return;
        }

        res.json({ success: true, data: certificate });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /certificates/:certificateId/download
 * @desc    Download certificate
 * @access  Private
 */
router.post('/:certificateId/download', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { certificateId } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const certificate = mockCertificates.find(c => c.id === certificateId);
        if (!certificate) {
            res.status(404).json({ success: false, message: 'Certificate not found' });
            return;
        }

        res.json({
            success: true,
            data: {
                certificateId,
                downloadUrl: certificate.downloadUrl,
                fileName: `${certificate.certificateNumber}.pdf`,
                message: 'Certificate download started'
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /certificates/:certificateId/share
 * @desc    Share certificate
 * @access  Private
 */
router.post('/:certificateId/share', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { certificateId } = req.params;
        const { email, message } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const certificate = mockCertificates.find(c => c.id === certificateId);
        if (!certificate) {
            res.status(404).json({ success: false, message: 'Certificate not found' });
            return;
        }

        // In production, send email with certificate
        res.json({
            success: true,
            message: `Certificate shared with ${email}`,
            data: { certificateId, sharedWith: email }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
