import mongoose, { Schema } from 'mongoose';
import { IDynamicPricing } from './pricing.interface';

const DynamicPricingSchema = new Schema<IDynamicPricing>(
    {
        pricingId: { type: String, required: true, unique: true },
        programId: { type: String, required: true, index: true },
        programName: { type: String, required: true },
        basePrice: { type: Number, required: true },
        currentPrice: { type: Number, required: true },
        demandMultiplier: { type: Number, default: 1.0 },
        seasonalAdjustment: { type: Number, default: 0 },
        peakPricing: { type: Boolean, default: false },
        effectiveDate: { type: Date, required: true },
        businessUnitId: { type: String, required: true },
        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'dynamic_pricing' }
);

export const DynamicPricing = mongoose.model<IDynamicPricing>('DynamicPricing', DynamicPricingSchema);
