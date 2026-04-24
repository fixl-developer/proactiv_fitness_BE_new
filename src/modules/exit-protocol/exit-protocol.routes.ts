import { Router } from 'express';
import exitProtocolController from './exit-protocol.controller';

const router = Router();

router.use('/exit-protocol', exitProtocolController);

export default router;
