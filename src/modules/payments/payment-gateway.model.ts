import { Schema, model, Document } from 'mongoose';

export interface IPaymentGateway extends Document {
    name: string;
    provider: 'stripe' | 'paypal' | 'square';
    isDefault: boolean;
    status: 'active' | 'inactive';
    apiKey?: string;
    secretKey?: string;
    webhookUrl?: string;
    supportedCurrencies: string[];
    tenantId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const paymentGatewaySchema = new Schema<IPaymentGateway>(
    {
        name: { type: String, required: true, trim: true },
        provider: { type: String, required: true, enum: ['stripe', 'paypal', 'square'] },
        isDefault: { type: Boolean, default: false },
        status: { type: String, default: 'active', enum: ['active', 'inactive'] },
        apiKey: { type: String },
        secretKey: { type: String },
        webhookUrl: { type: String },
        supportedCurrencies: { type: [String], default: [] },
        tenantId: { type: String },
    },
    { timestamps: true }
);

paymentGatewaySchema.index({ provider: 1 });
paymentGatewaySchema.index({ isDefault: 1 });

export const PaymentGatewayModel = model<IPaymentGateway>('PaymentGateway', paymentGatewaySchema);
