import { Router } from 'express';
import financialLedgerController from './financial-ledger.controller';

const router = Router();

router.use('/', financialLedgerController);

export default router;
