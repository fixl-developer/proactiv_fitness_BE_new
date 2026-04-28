import { Schema, model, Document } from 'mongoose';

export interface IAuditVaultDocument extends Document {
    auditId: string;
    tenantId: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes: Record<string, any>;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

const auditVaultSchema = new Schema<IAuditVaultDocument>(
    {
        auditId: { type: String, required: true, unique: true },
        tenantId: { type: String, required: true },
        userId: { type: String, required: true },
        action: { type: String, required: true },
        entityType: { type: String, required: true },
        entityId: { type: String, required: true },
        changes: { type: Schema.Types.Mixed },
        reason: String,
        ipAddress: String,
        userAgent: String,
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditVaultModel = model<IAuditVaultDocument>('AuditVault', auditVaultSchema);
