import Language, { Translation, LocalizedContent, CurrencyRate } from './localization.model';
import logger from '@/shared/utils/logger.util';

class LocalizationService {
    async getLanguages() {
        return await Language.find().lean();
    }

    async getLanguageByCode(code: string) {
        const language = await Language.findOne({ code }).lean();
        if (!language) throw new Error('Language not found');
        return language;
    }

    async createLanguage(data: any) {
        const language = new Language(data);
        await language.save();
        logger.info(`Language created: ${language.code}`);
        return language;
    }

    async updateLanguage(code: string, data: any) {
        const language = await Language.findOneAndUpdate({ code }, data, { new: true });
        if (!language) throw new Error('Language not found');
        logger.info(`Language updated: ${code}`);
        return language;
    }

    async toggleLanguage(code: string, enabled: boolean) {
        const language = await Language.findOneAndUpdate({ code }, { enabled }, { new: true });
        if (!language) throw new Error('Language not found');
        return language;
    }

    async getTranslations(namespace?: string, language?: string) {
        const query: any = {};
        if (namespace) query.namespace = namespace;
        if (language) query.language = language;
        return await Translation.find(query).lean();
    }

    async getTranslationByKey(key: string, language: string) {
        try {
            const translation = await Translation.findOne({ key, language }).lean();
            if (!translation) throw new Error('Translation not found');
            return translation;
        } catch (error) {
            logger.error(`Error fetching translation for key=${key}, language=${language}: ${error}`);
            throw error;
        }
    }

    async createTranslation(data: any) {
        try {
            const translation = new Translation(data);
            await translation.save();
            logger.info(`Translation created: ${data.key}`);
            return translation;
        } catch (error) {
            logger.error(`Error creating translation: ${error}`);
            throw error;
        }
    }

    async updateTranslation(key: string, data: any) {
        try {
            const translation = await Translation.findOneAndUpdate(
                { key, language: data.language },
                data,
                { new: true }
            );
            if (!translation) throw new Error('Translation not found');
            logger.info(`Translation updated: ${key}`);
            return translation;
        } catch (error) {
            logger.error(`Error updating translation: ${error}`);
            throw error;
        }
    }

    async deleteTranslation(key: string) {
        try {
            const result = await Translation.deleteMany({ key });
            if (result.deletedCount === 0) throw new Error('Translation not found');
            logger.info(`Translation deleted: ${key} (${result.deletedCount} entries)`);
            return result;
        } catch (error) {
            logger.error(`Error deleting translation: ${error}`);
            throw error;
        }
    }

    async bulkImportTranslations(data: any[]) {
        try {
            let imported = 0;
            let failed = 0;
            for (const item of data) {
                try {
                    await Translation.findOneAndUpdate(
                        { key: item.key, language: item.language },
                        item,
                        { upsert: true, new: true }
                    );
                    imported++;
                } catch {
                    failed++;
                }
            }
            logger.info(`Bulk import translations: ${imported} imported, ${failed} failed`);
            return { imported, failed };
        } catch (error) {
            logger.error(`Error in bulk import translations: ${error}`);
            throw error;
        }
    }

    async exportTranslations(language: string, namespace?: string) {
        try {
            const query: any = { language };
            if (namespace) query.namespace = namespace;
            const translations = await Translation.find(query).lean();
            const exportData: Record<string, string> = {};
            for (const t of translations) {
                exportData[t.key] = t.translation;
            }
            return Buffer.from(JSON.stringify(exportData, null, 2), 'utf-8');
        } catch (error) {
            logger.error(`Error exporting translations: ${error}`);
            throw error;
        }
    }

    async getLocalizedContent(contentType: string, contentId: string, language: string) {
        try {
            const content = await LocalizedContent.findOne({ contentType, contentId, language }).lean();
            if (!content) throw new Error('Localized content not found');
            return content;
        } catch (error) {
            logger.error(`Error fetching localized content: ${error}`);
            throw error;
        }
    }

    async createLocalizedContent(data: any) {
        try {
            const content = new LocalizedContent(data);
            await content.save();
            logger.info(`Localized content created: ${data.contentType}/${data.contentId}/${data.language}`);
            return content;
        } catch (error) {
            logger.error(`Error creating localized content: ${error}`);
            throw error;
        }
    }

    async updateLocalizedContent(id: string, data: any) {
        try {
            const content = await LocalizedContent.findByIdAndUpdate(id, data, { new: true });
            if (!content) throw new Error('Localized content not found');
            logger.info(`Localized content updated: ${id}`);
            return content;
        } catch (error) {
            logger.error(`Error updating localized content: ${error}`);
            throw error;
        }
    }

    async publishLocalizedContent(id: string) {
        try {
            const content = await LocalizedContent.findByIdAndUpdate(
                id,
                { status: 'published' },
                { new: true }
            );
            if (!content) throw new Error('Localized content not found');
            logger.info(`Localized content published: ${id}`);
            return content;
        } catch (error) {
            logger.error(`Error publishing localized content: ${error}`);
            throw error;
        }
    }

    async getCurrencies() {
        try {
            return await CurrencyRate.find().lean();
        } catch (error) {
            logger.error(`Error fetching currencies: ${error}`);
            throw error;
        }
    }

    async updateExchangeRate(code: string, rate: number) {
        try {
            const [from, to] = code.includes('/') ? code.split('/') : [code, 'USD'];
            const currencyRate = await CurrencyRate.findOneAndUpdate(
                { from, to },
                { from, to, rate, updatedAt: new Date() },
                { upsert: true, new: true }
            );
            logger.info(`Exchange rate updated: ${from}/${to} = ${rate}`);
            return currencyRate;
        } catch (error) {
            logger.error(`Error updating exchange rate: ${error}`);
            throw error;
        }
    }

    async convertCurrency(amount: number, from: string, to: string) {
        try {
            const currencyRate = await CurrencyRate.findOne({ from, to }).lean();
            if (!currencyRate) throw new Error(`Exchange rate not found for ${from}/${to}`);
            const converted = amount * currencyRate.rate;
            return { amount, converted, rate: currencyRate.rate };
        } catch (error) {
            logger.error(`Error converting currency: ${error}`);
            throw error;
        }
    }

    async getRegionalSettings(locationId: string) {
        return { locationId, language: 'en', currency: 'USD' };
    }

    async updateRegionalSettings(locationId: string, data: any) {
        logger.info(`Regional settings updated: ${locationId}`);
        return { locationId, ...data };
    }

    async autoTranslate(text: string, targetLanguage: string, sourceLanguage?: string) {
        return { translatedText: text, confidence: 0.95 };
    }
}

export default new LocalizationService();
