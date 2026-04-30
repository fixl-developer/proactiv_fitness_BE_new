import { DynamicPricing } from './pricing.model';
import { ICalculatePriceRequest } from './pricing.interface';
import { v4 as uuidv4 } from 'uuid';
import aiService from '@shared/services/ai.service';
import { AIPromptService } from '@shared/services/ai-prompt.service';
import logger from '@shared/utils/logger.util';

export class DynamicPricingService {
    // ─── AI-Powered Dynamic Price Calculation ──────────────────
    async calculatePrice(data: ICalculatePriceRequest, userId: string): Promise<any> {
        try {
            // Gather demand signals from historical pricing
            const pricingHistory = await DynamicPricing.find({
                programId: data.programId,
            })
                .sort({ effectiveDate: -1 })
                .limit(10)
                .lean();

            const demandSignals = {
                historicalPrices: pricingHistory.map(p => ({
                    price: p.currentPrice,
                    date: p.effectiveDate,
                    multiplier: p.demandMultiplier,
                })),
                totalHistoricalRecords: pricingHistory.length,
                averageHistoricalPrice: pricingHistory.length > 0
                    ? pricingHistory.reduce((sum, p) => sum + (p.currentPrice || 0), 0) / pricingHistory.length
                    : (data as any).basePrice || 100,
            };

            const prompt = AIPromptService.dynamicPricing({
                programData: {
                    programId: data.programId,
                    programName: (data as any).programName || 'Program',
                    basePrice: (data as any).basePrice || 100,
                    date: data.date,
                },
                demandSignals,
                seasonalFactors: {
                    month: new Date(data.date || Date.now()).getMonth() + 1,
                    dayOfWeek: new Date(data.date || Date.now()).getDay(),
                    isHoliday: (data as any).isHoliday || false,
                },
            });

            const aiPricing = await aiService.jsonCompletion<{
                suggestedPrice: number;
                basePrice: number;
                demandMultiplier: number;
                seasonalAdjustment: number;
                peakPricing: boolean;
                reasoning: string;
                confidenceBand: { low: number; high: number };
                recommendation: string;
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'dynamic-pricing',
                temperature: 0.3,
            });

            const pricing = new DynamicPricing({
                pricingId: uuidv4(),
                programId: data.programId,
                programName: (data as any).programName || 'Program',
                basePrice: aiPricing.basePrice || (data as any).basePrice || 100,
                currentPrice: aiPricing.suggestedPrice,
                demandMultiplier: aiPricing.demandMultiplier,
                seasonalAdjustment: aiPricing.seasonalAdjustment,
                peakPricing: aiPricing.peakPricing,
                effectiveDate: data.date,
                aiAnalysis: {
                    reasoning: aiPricing.reasoning,
                    confidenceBand: aiPricing.confidenceBand,
                    recommendation: aiPricing.recommendation,
                    aiPowered: true,
                },
                businessUnitId: (data as any).businessUnitId || 'bu-001',
                createdBy: userId,
                updatedBy: userId,
            });

            const saved = await pricing.save();

            logger.info(`Dynamic Pricing: Calculated price for program ${data.programId} — Base: $${aiPricing.basePrice}, Suggested: $${aiPricing.suggestedPrice}, Multiplier: ${aiPricing.demandMultiplier}`);

            return saved;
        } catch (error: any) {
            logger.error(`Dynamic Pricing calculation failed for program ${data.programId}:`, error.message);

            // Fallback to basic pricing
            const basePrice = (data as any).basePrice || 100;
            const pricing = new DynamicPricing({
                pricingId: uuidv4(),
                programId: data.programId,
                programName: (data as any).programName || 'Program',
                basePrice,
                currentPrice: basePrice,
                demandMultiplier: 1.0,
                seasonalAdjustment: 0,
                peakPricing: false,
                effectiveDate: data.date,
                aiAnalysis: { aiPowered: false, reasoning: 'AI pricing unavailable — using base price' },
                businessUnitId: 'bu-001',
                createdBy: userId,
                updatedBy: userId,
            });

            return await pricing.save();
        }
    }

    // ─── Get Current Pricing ───────────────────────────────────
    async getCurrentPricing(programId: string): Promise<any> {
        return await DynamicPricing.findOne({ programId }).sort({ effectiveDate: -1 });
    }

    // ─── Get Pricing Recommendations ───────────────────────────
    async getPricingRecommendations(programId: string): Promise<any> {
        try {
            const pricingHistory = await DynamicPricing.find({ programId })
                .sort({ effectiveDate: -1 })
                .limit(20)
                .lean();

            if (pricingHistory.length === 0) {
                return {
                    programId,
                    recommendations: ['No pricing history available. Set an initial price first.'],
                    aiPowered: false,
                };
            }

            const prompt = AIPromptService.dynamicPricing({
                programData: {
                    programId,
                    programName: pricingHistory[0].programName,
                    basePrice: pricingHistory[0].basePrice,
                    currentPrice: pricingHistory[0].currentPrice,
                },
                demandSignals: {
                    historicalPrices: pricingHistory.map(p => ({
                        price: p.currentPrice,
                        date: p.effectiveDate,
                        multiplier: p.demandMultiplier,
                    })),
                },
            });

            const analysis = await aiService.jsonCompletion<{
                suggestedPrice: number;
                reasoning: string;
                recommendation: string;
                confidenceBand: { low: number; high: number };
            }>({
                systemPrompt: prompt.system,
                userPrompt: prompt.user,
                module: 'dynamic-pricing',
                temperature: 0.4,
            });

            return {
                programId,
                currentPrice: pricingHistory[0].currentPrice,
                suggestedPrice: analysis.suggestedPrice,
                reasoning: analysis.reasoning,
                recommendation: analysis.recommendation,
                confidenceBand: analysis.confidenceBand,
                historyAnalyzed: pricingHistory.length,
                aiPowered: true,
            };
        } catch (error: any) {
            logger.error(`Dynamic Pricing recommendations failed for ${programId}:`, error.message);
            return {
                programId,
                recommendations: ['AI pricing recommendations unavailable. Please try again later.'],
                aiPowered: false,
            };
        }
    }
}
