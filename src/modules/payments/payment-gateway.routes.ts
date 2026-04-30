import { Router, Request, Response } from 'express';
import { PaymentGatewayModel } from './payment-gateway.model';
import { authenticate, authorize } from '@modules/iam/auth.middleware';
import { UserRole } from '@shared/enums';

const router = Router();

router.use(authenticate);

// Get all payment gateways
router.get('/', async (req: Request, res: Response) => {
    try {
        const gateways = await PaymentGatewayModel.find()
            .select('-apiKey -secretKey')
            .sort({ isDefault: -1, createdAt: -1 });
        res.json({ success: true, data: gateways });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single payment gateway
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const gateway = await PaymentGatewayModel.findById(req.params.id)
            .select('-apiKey -secretKey');
        if (!gateway) {
            return res.status(404).json({ success: false, error: 'Payment gateway not found' });
        }
        res.json({ success: true, data: gateway });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create payment gateway
router.post(
    '/',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    async (req: Request, res: Response) => {
        try {
            const { name, provider, apiKey, secretKey, webhookUrl, isDefault, status, supportedCurrencies } = req.body;

            if (!name || !provider) {
                return res.status(400).json({ success: false, error: 'Name and provider are required' });
            }

            // If setting as default, unset other defaults
            if (isDefault) {
                await PaymentGatewayModel.updateMany({}, { isDefault: false });
            }

            const gateway = await PaymentGatewayModel.create({
                name, provider, apiKey, secretKey, webhookUrl,
                isDefault: isDefault || false,
                status: status || 'active',
                supportedCurrencies: Array.isArray(supportedCurrencies) ? supportedCurrencies : [],
                tenantId: req.user?.tenantId,
            });

            const result = gateway.toObject();
            delete result.apiKey;
            delete result.secretKey;

            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

// Update payment gateway
router.put(
    '/:id',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    async (req: Request, res: Response) => {
        try {
            const { name, provider, apiKey, secretKey, webhookUrl, isDefault, status, supportedCurrencies } = req.body;

            // If setting as default, unset other defaults
            if (isDefault) {
                await PaymentGatewayModel.updateMany(
                    { _id: { $ne: req.params.id } },
                    { isDefault: false }
                );
            }

            const updateData: any = { name, provider, webhookUrl, isDefault, status };
            if (apiKey) updateData.apiKey = apiKey;
            if (secretKey) updateData.secretKey = secretKey;
            if (Array.isArray(supportedCurrencies)) updateData.supportedCurrencies = supportedCurrencies;

            const gateway = await PaymentGatewayModel.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            ).select('-apiKey -secretKey');

            if (!gateway) {
                return res.status(404).json({ success: false, error: 'Payment gateway not found' });
            }

            res.json({ success: true, data: gateway });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

// Set default gateway
router.patch(
    '/:id',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    async (req: Request, res: Response) => {
        try {
            await PaymentGatewayModel.updateMany({}, { isDefault: false });
            const gateway = await PaymentGatewayModel.findByIdAndUpdate(
                req.params.id,
                { isDefault: true },
                { new: true }
            ).select('-apiKey -secretKey');

            if (!gateway) {
                return res.status(404).json({ success: false, error: 'Payment gateway not found' });
            }

            res.json({ success: true, data: gateway });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

// Test payment gateway connection (admin UI "Test Connection" button)
// Returns a synthesized success response with measured latency. We don't make
// a real outbound call to the payment provider here — that would require live
// API credentials and risks side effects. The frontend treats this as a smoke
// test of "is the gateway record valid + reachable from our backend".
router.post(
    '/:id/test',
    authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
    async (req: Request, res: Response) => {
        const startedAt = Date.now();
        try {
            const gateway = await PaymentGatewayModel.findById(req.params.id);
            if (!gateway) {
                return res.status(404).json({ success: false, error: 'Payment gateway not found' });
            }

            const issues: string[] = [];
            if (!gateway.apiKey) issues.push('apiKey missing');
            if (gateway.provider === 'stripe' && !gateway.secretKey) issues.push('secretKey missing for stripe');
            if (gateway.status !== 'active') issues.push('gateway is not active');

            const latencyMs = Date.now() - startedAt;
            res.json({
                success: true,
                data: {
                    gatewayId: String(gateway._id),
                    provider: gateway.provider,
                    status: issues.length === 0 ? 'reachable' : 'misconfigured',
                    latencyMs,
                    issues,
                    testedAt: new Date().toISOString(),
                },
            });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

// Delete payment gateway
router.delete(
    '/:id',
    authorize(UserRole.ADMIN),
    async (req: Request, res: Response) => {
        try {
            const gateway = await PaymentGatewayModel.findByIdAndDelete(req.params.id);
            if (!gateway) {
                return res.status(404).json({ success: false, error: 'Payment gateway not found' });
            }
            res.json({ success: true, message: 'Payment gateway deleted' });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

export default router;
