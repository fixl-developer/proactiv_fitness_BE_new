export class CreateAPIKeyDTO {
    tenantId: string;
    name: string;
    permissions: string[];
    rateLimit?: number;
}

export class APIKeyResponseDTO {
    keyId: string;
    name: string;
    key: string;
    permissions: string[];
    rateLimit: number;
    status: string;
    createdAt: Date;
}
