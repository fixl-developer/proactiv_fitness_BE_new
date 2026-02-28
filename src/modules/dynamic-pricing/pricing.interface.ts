import { Document } from 'mongoose';

export interface IDynamicPricing extends Document {
    pricingId: string;
    programId: string;
    programName: string;
    basePrice: number;
    currentPrice: number;
    demandMultiplier: number;
    seasonalAdjustment: number;
    peakPricing: boolean;
    effectiveDate: Date;
    businessUnitId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICalculatePriceRequest {
    programId: string;
    date: Date;
}
