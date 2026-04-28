import { Router } from 'express';
import auditVaultController from './audit-vault.controller';

const router = Router();

router.use('/audit-vault', auditVaultController);

export default router;
