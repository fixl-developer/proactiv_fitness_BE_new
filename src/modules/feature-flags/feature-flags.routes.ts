import { Router } from 'express';
import featureFlagsController from './feature-flags.controller';

const router = Router();

router.use('/feature-flags', featureFlagsController);

export default router;
