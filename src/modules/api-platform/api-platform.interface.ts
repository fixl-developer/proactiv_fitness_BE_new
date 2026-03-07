export interface IApiKey { _id?: string; userId: string; key: string; name: string; permissions: string[]; status: 'active' | 'revoked'; createdAt?: Date; }
