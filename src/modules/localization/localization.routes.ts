import { Router } from 'express';
import localizationController from './localization.controller';
import { authenticate, authorize } from '@modules/iam/auth.middleware';

const router = Router();

router.get('/languages', localizationController.getLanguages);
router.get('/languages/:code', localizationController.getLanguageByCode);
router.post('/languages', authenticate, localizationController.createLanguage);
router.put('/languages/:code', authenticate, localizationController.updateLanguage);
router.patch('/languages/:code/toggle', authenticate, localizationController.toggleLanguage);

router.get('/translations', localizationController.getTranslations);
router.get('/translations/:key', localizationController.getTranslationByKey);
router.post('/translations', authenticate, localizationController.createTranslation);
router.put('/translations/:key', authenticate, localizationController.updateTranslation);
router.delete('/translations/:key', authenticate, localizationController.deleteTranslation);
router.post('/translations/bulk-import', authenticate, localizationController.bulkImportTranslations);
router.get('/translations/export', authenticate, localizationController.exportTranslations);

router.get('/content', localizationController.getLocalizedContent);
router.post('/content', authenticate, localizationController.createLocalizedContent);
router.put('/content/:id', authenticate, localizationController.updateLocalizedContent);
router.post('/content/:id/publish', authenticate, localizationController.publishLocalizedContent);

router.get('/currencies', localizationController.getCurrencies);
router.patch('/currencies/:code/rate', authenticate, localizationController.updateExchangeRate);
router.get('/currencies/convert', localizationController.convertCurrency);

router.get('/regional-settings/:locationId', localizationController.getRegionalSettings);
router.put('/regional-settings/:locationId', authenticate, localizationController.updateRegionalSettings);

router.post('/auto-translate', authenticate, localizationController.autoTranslate);

export default router;
