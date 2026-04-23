import { Router } from 'express';
import advancedVideoProcessingController from './advanced-video-processing.controller';

const router = Router();

router.use('/videos', advancedVideoProcessingController);

export default router;
