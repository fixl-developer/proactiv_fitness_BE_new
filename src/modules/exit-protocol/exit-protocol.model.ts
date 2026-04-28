import { Schema, model, Document } from 'mongoose';

export interface IExitProtocolDocument extends Document {
    exitId: string;
    userId: string;
    tenantId: string;
    reason: string;
    status: 'pending' | 'approved' | 'completed' | 'cancelled';
    requestedDate: Date;
    approvalDate?: Date;
    completionDate?: Date;
    approvedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

const exitProtocolSchema = new Schema<IExitProtocolDocument>(
    {
        exitId: { type: String, required: true, unique: true },
        userId: { type: String, required: true },
        tenantId: { type: String, required: true },
        reason: { type: String, required: true },
        status: { type: String, default: 'pending' },
        requestedDate: { type: Date, required: true },
        approvalDate: Date,
        completionDate: Date,
        approvedBy: String,
    },
    { timestamps: true }
);

export const ExitProtocolModel = model<IExitProtocolDocument>('ExitProtocol', exitProtocolSchema);
