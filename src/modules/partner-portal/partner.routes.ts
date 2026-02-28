import { Router } from 'express';
import { PartnerController } from './partner.controller';

const router = Router();
const controller = new PartnerController();

router.post('/', controller.createPartner);
router.get('/', controller.getAllPartners);
router.get('/:partnerId/dashboard', controller.getPartnerDashboard);
router.post('/bulk-import', controller.bulkImportStudents);

export default router;
