import { Request, Response } from 'express';
import { WalletService } from './wallet.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { sendSuccess } from '../../shared/utils/response.util';

const walletService = new WalletService();

export class WalletController {
    createWallet = asyncHandler(async (req: Request, res: Response) => {
        const { userId, userName } = req.body;
        const createdBy = (req as any).user?.id || 'system';
        const wallet = await walletService.createWallet(userId, userName, createdBy);
        sendSuccess(res, wallet, 'Wallet created successfully', 201);
    });

    addCredit = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id || 'system';
        const wallet = await walletService.addCredit(req.body, userId);
        sendSuccess(res, wallet, 'Credit added successfully');
    });

    debitWallet = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id || 'system';
        const wallet = await walletService.debitWallet(req.body, userId);
        sendSuccess(res, wallet, 'Wallet debited successfully');
    });

    getWalletBalance = asyncHandler(async (req: Request, res: Response) => {
        const { userId } = req.params;
        const balance = await walletService.getWalletBalance(userId);
        sendSuccess(res, balance, 'Wallet balance retrieved successfully');
    });
}
