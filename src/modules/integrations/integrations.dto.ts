export class CreateIntegrationDTO {
    tenantId: string;
    provider: string;
    credentials: Record<string, any>;
    config: Record<string, any>;
}

export class IntegrationResponseDTO {
    integrationId: string;
    provider: string;
    status: string;
    lastSyncedAt?: Date;
}
