export interface ITenant { _id?: string; name: string; domain: string; plan: string; status: 'active' | 'suspended'; settings: any; createdAt?: Date; }
