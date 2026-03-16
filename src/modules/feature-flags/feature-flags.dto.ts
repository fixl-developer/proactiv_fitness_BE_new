export class CreateFeatureFlagDTO {
    tenantId: string;
    name: string;
    description?: string;
    enabled: boolean;
    rolloutPercentage?: number;
    targetUsers?: string[];
}

export class FeatureFlagResponseDTO {
    flagId: string;
    name: string;
    enabled: boolean;
    rolloutPercentage: number;
    createdAt: Date;
}
