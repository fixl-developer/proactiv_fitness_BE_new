import { Request, Response } from 'express';
import localizationService from './localization.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';

class LocalizationController {
    getLanguages = asyncHandler(async (req: Request, res: Response) => {
        const languages = await localizationService.getLanguages();
        res.json({ success: true, data: languages });
    });

    getLanguageByCode = asyncHandler(async (req: Request, res: Response) => {
        const language = await localizationService.getLanguageByCode(req.params.code);
        res.json({ success: true, data: language });
    });

    createLanguage = asyncHandler(async (req: Request, res: Response) => {
        const language = await localizationService.createLanguage(req.body);
        res.status(201).json({ success: true, data: language });
    });

    updateLanguage = asyncHandler(async (req: Request, res: Response) => {
        const language = await localizationService.updateLanguage(req.params.code, req.body);
        res.json({ success: true, data: language });
    });

    toggleLanguage = asyncHandler(async (req: Request, res: Response) => {
        const language = await localizationService.toggleLanguage(req.params.code, req.body.enabled);
        res.json({ success: true, data: language });
    });

    getTranslations = asyncHandler(async (req: Request, res: Response) => {
        const translations = await localizationService.getTranslations(req.query.namespace as string, req.query.language as string);
        res.json({ success: true, data: translations });
    });

    getTranslationByKey = asyncHandler(async (req: Request, res: Response) => {
        const translation = await localizationService.getTranslationByKey(req.params.key, req.query.language as string);
        res.json({ success: true, data: translation });
    });

    createTranslation = asyncHandler(async (req: Request, res: Response) => {
        const translation = await localizationService.createTranslation(req.body);
        res.status(201).json({ success: true, data: translation });
    });

    updateTranslation = asyncHandler(async (req: Request, res: Response) => {
        const translation = await localizationService.updateTranslation(req.params.key, req.body);
        res.json({ success: true, data: translation });
    });

    deleteTranslation = asyncHandler(async (req: Request, res: Response) => {
        await localizationService.deleteTranslation(req.params.key);
        res.json({ success: true, message: 'Translation deleted' });
    });

    bulkImportTranslations = asyncHandler(async (req: Request, res: Response) => {
        const result = await localizationService.bulkImportTranslations(req.body);
        res.json({ success: true, data: result });
    });

    exportTranslations = asyncHandler(async (req: Request, res: Response) => {
        const blob = await localizationService.exportTranslations(req.query.language as string, req.query.namespace as string);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.send(blob);
    });

    getLocalizedContent = asyncHandler(async (req: Request, res: Response) => {
        const content = await localizationService.getLocalizedContent(req.query.contentType as string, req.query.contentId as string, req.query.language as string);
        res.json({ success: true, data: content });
    });

    createLocalizedContent = asyncHandler(async (req: Request, res: Response) => {
        const content = await localizationService.createLocalizedContent(req.body);
        res.status(201).json({ success: true, data: content });
    });

    updateLocalizedContent = asyncHandler(async (req: Request, res: Response) => {
        const content = await localizationService.updateLocalizedContent(req.params.id, req.body);
        res.json({ success: true, data: content });
    });

    publishLocalizedContent = asyncHandler(async (req: Request, res: Response) => {
        const content = await localizationService.publishLocalizedContent(req.params.id);
        res.json({ success: true, data: content });
    });

    getCurrencies = asyncHandler(async (req: Request, res: Response) => {
        const currencies = await localizationService.getCurrencies();
        res.json({ success: true, data: currencies });
    });

    updateExchangeRate = asyncHandler(async (req: Request, res: Response) => {
        const currency = await localizationService.updateExchangeRate(req.params.code, req.body.rate);
        res.json({ success: true, data: currency });
    });

    convertCurrency = asyncHandler(async (req: Request, res: Response) => {
        const result = await localizationService.convertCurrency(req.query.amount as any, req.query.from as string, req.query.to as string);
        res.json({ success: true, data: result });
    });

    getRegionalSettings = asyncHandler(async (req: Request, res: Response) => {
        const settings = await localizationService.getRegionalSettings(req.params.locationId);
        res.json({ success: true, data: settings });
    });

    updateRegionalSettings = asyncHandler(async (req: Request, res: Response) => {
        const settings = await localizationService.updateRegionalSettings(req.params.locationId, req.body);
        res.json({ success: true, data: settings });
    });

    autoTranslate = asyncHandler(async (req: Request, res: Response) => {
        const result = await localizationService.autoTranslate(req.body.text, req.body.targetLanguage, req.body.sourceLanguage);
        res.json({ success: true, data: result });
    });
}

export default new LocalizationController();
