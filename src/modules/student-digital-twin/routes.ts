import { Router } from 'express';
import studentDigitalTwinController from './controller';

const router = Router();

router.use('/student-digital-twin', studentDigitalTwinController);

export default router;
