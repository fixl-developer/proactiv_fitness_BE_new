import { Router } from 'express';
import whiteLabelPlatformController from './white-label-platform.controller';

const router = Router();

router.use('/white-label', whiteLabelPlatformController);

export default router;
