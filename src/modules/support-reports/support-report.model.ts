import { Schema, model, Document } from 'mongoose';

export interface ISupportReport extends Document {
    reportId: string;
    name: string;
    type: 'performance' | 'tickets' | 'customer' | 'financial';
    startDate: string;
    endDate: string;
    format: 'PDF' | 'CSV' | 'Excel';
    status: 'pending' | 'completed' | 'failed';
    fileUrl?: string;
    summary?: any;
    generatedBy: string;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const SupportReportSchema = new Schema<ISupportReport>({
    reportId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['performance', 'tickets', 'customer', 'financial'], default: 'performance' },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    format: { type: String, enum: ['PDF', 'CSV', 'Excel'], default: 'PDF' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending', index: true },
    fileUrl: String,
    summary: Schema.Types.Mixed,
    generatedBy: { type: String, required: true },
    completedAt: Date,
}, { timestamps: true });

export const SupportReport = model<ISupportReport>('SupportReport', SupportReportSchema);
