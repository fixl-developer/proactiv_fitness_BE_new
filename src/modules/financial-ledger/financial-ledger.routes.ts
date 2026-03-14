import { Router } from 'express';
import financialLedgerController from './financial-ledger.controller';

const router = Router();

router.use('/financial-ledger', financialLedgerController);

export default router;
