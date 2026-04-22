import { Router } from 'express';
import studentDigitalTwinController from './controller';

const router = Router();

router.use('/', studentDigitalTwinController);

export default router;
