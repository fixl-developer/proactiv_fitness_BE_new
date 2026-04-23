export interface CreateAPIKeyDTO {
  developerId: string;
  name: string;
  permissions: string[];
}

export interface CreateOAuthAppDTO {
  developerId: string;
  name: string;
  description: string;
  redirectUrl: string;
  permissions: string[];
}
