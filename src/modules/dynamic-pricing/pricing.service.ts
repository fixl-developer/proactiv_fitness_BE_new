import { DynamicPricing } from './pricing.model';
import { ICalculatePriceRequest } from './pricing.interface';
import { v4 as uuidv4 } from 'uuid';

export class DynamicPricingService {
    async calculatePrice(data: ICalculatePriceRequest, userId: string): Promise<any> {
        const basePrice = 100;
        const demandMultiplier = 1.2;
        const currentPrice = basePrice * demandMultiplier;

        const pricing = new DynamicPricing({
            pricingId: uuidv4(),
            programId: data.programId,
            programName: 'Sample Program',
            basePrice,
            currentPrice,
            demandMultiplier,
            seasonalAdjustment: 0,
            peakPricing: true,
            effectiveDate: data.date,
            businessUnitId: 'bu-001',
            createdBy: userId,
            updatedBy: userId
        });

        return await pricing.save();
    }

    async getCurrentPricing(programId: string): Promise<any> {
        return await DynamicPricing.findOne({ programId }).sort({ effectiveDate: -1 });
    }
}
