import { Router, Request, Response } from 'express';
import { walletService } from './wallet.service';
import { CreditBucketType } from './wallet.interface';
import { authenticate } from '../iam/auth.middleware';

const router = Router();

/**
 * @route   GET /wallet/balance
 * @desc    Get wallet balance
 * @access  Private
 */
router.get('/balance', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const balance = await walletService.getWalletBalance(userId);
        res.json({ success: true, data: balance });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /wallet/transactions
 * @desc    Get wallet transactions
 * @access  Private
 */
router.get('/transactions', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const wallet = await walletService.getWallet(userId);
        if (!wallet) {
            res.status(404).json({ success: false, message: 'Wallet not found' });
            return;
        }

        res.json({ success: true, data: wallet.transactions || [] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /wallet/add-funds
 * @desc    Add funds to wallet
 * @access  Private
 */
router.post('/add-funds', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { amount, bucketType, description } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        if (!amount || amount <= 0) {
            res.status(400).json({ success: false, message: 'Invalid amount' });
            return;
        }

        const result = await walletService.addCredit(
            {
                userId,
                amount,
                bucketType: bucketType || 'CASH',
                description: description || 'Manual credit'
            },
            userId
        );

        res.json({ success: true, data: result, message: 'Funds added successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /wallet/refund
 * @desc    Request refund
 * @access  Private
 */
router.post('/refund', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { amount, reason } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        if (!amount || amount <= 0) {
            res.status(400).json({ success: false, message: 'Invalid amount' });
            return;
        }

        const result = await walletService.addCredit(
            {
                userId,
                amount,
                bucketType: CreditBucketType.CASH,
                description: `Refund: ${reason || 'Refund request'}`
            },
            userId
        );

        res.json({ success: true, data: result, message: 'Refund processed successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
