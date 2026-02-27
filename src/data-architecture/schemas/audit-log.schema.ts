import { Schema, model } from 'mongoose';
import { AuditLog } from '../interfaces';
import { COLLECTIONS } from '../constants';

const auditLogSchema = new Schema<AuditLog>(
    {
        eventType: {
            type: String,
            required: true,
            index: true,
        },
        entityType: {
            type: String,
            required: true,
            index: true,
        },
        entityId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        changes: {
            type: Schema.Types.Mixed,
            required: true,
        },
        timestamp: {
            type: Date,
            required: true,
            default: Date.now,
            index: true,
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
        // Tenant context
        countryId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        regionId: {
            type: Schema.Types.ObjectId,
            index: true,
        },
        businessUnitId: {
            type: Schema.Types.ObjectId,
            index: true,
        },
        locationId: {
            type: Schema.Types.ObjectId,
            index: true,
        },
    },
    {
        timestamps: true,
        collection: COLLECTIONS.AUDIT_LOGS,
    }
);

// Compound indexes for common queries
auditLogSchema.index({ countryId: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });

// Prevent updates and deletes (append-only)
auditLogSchema.pre('updateOne', function (next) {
    next(new Error('Audit logs cannot be updated'));
});

auditLogSchema.pre('findOneAndUpdate', function (next) {
    next(new Error('Audit logs cannot be updated'));
});

auditLogSchema.pre('deleteOne', function (next) {
    next(new Error('Audit logs cannot be deleted'));
});

export const AuditLogModel = model<AuditLog>(COLLECTIONS.AUDIT_LOGS, auditLogSchema);
