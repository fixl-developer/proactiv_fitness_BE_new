import { Router } from 'express';
import { WalletController } from './wallet.controller';

const router = Router();
const controller = new WalletController();

router.post('/', controller.createWallet);
router.post('/credit', controller.addCredit);
router.post('/debit', controller.debitWallet);
router.get('/:userId/balance', controller.getWalletBalance);

export default router;
