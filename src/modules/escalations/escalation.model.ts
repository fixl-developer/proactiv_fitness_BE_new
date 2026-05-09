import { Schema, model, Document } from 'mongoose';

export interface IEscalation extends Document {
    escalationId: string;
    ticketId: string;
    title: string;
    customer: string;
    customerEmail?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'acknowledged' | 'resolved';
    reason: string;
    escalatedBy: string;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
    resolvedBy?: string;
    resolvedAt?: Date;
    escalatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const EscalationSchema = new Schema<IEscalation>({
    escalationId: { type: String, required: true, unique: true, index: true },
    ticketId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    customer: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: { type: String, enum: ['pending', 'acknowledged', 'resolved'], default: 'pending', index: true },
    reason: { type: String, required: true },
    escalatedBy: { type: String, required: true },
    acknowledgedBy: String,
    acknowledgedAt: Date,
    resolvedBy: String,
    resolvedAt: Date,
    escalatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const Escalation = model<IEscalation>('Escalation', EscalationSchema);
