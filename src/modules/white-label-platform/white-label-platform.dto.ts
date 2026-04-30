export interface OnboardTenantDTO {
    name: string;
    email: string;
    contactPerson: string;
    phone: string;
}

export interface UpdateTenantBrandingDTO {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    customCSS?: string;
}

export interface ConfigureCustomDomainDTO {
    domain: string;
}

export interface SetUsageBasedPricingDTO {
    basePrice: number;
    pricePerUser: number;
    pricePerTransaction: number;
    pricePerAPI: number;
}

export interface AddTenantUserDTO {
    email: string;
    name: string;
    role: string;
}

export interface ManageAPIAccessDTO {
    name: string;
    permissions: string[];
}
