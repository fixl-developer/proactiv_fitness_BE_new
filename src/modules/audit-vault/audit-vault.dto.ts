export class LogAuditEventDTO {
    userId: string;
    tenantId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes: Record<string, any>;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
}

export class AuditLogResponseDTO {
    auditId: string;
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    createdAt: Date;
}
