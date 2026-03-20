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
            const { name, provider, apiKey, secretKey, webhookUrl, isDefault, status } = req.body;

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
            const { name, provider, apiKey, secretKey, webhookUrl, isDefault, status } = req.body;

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
