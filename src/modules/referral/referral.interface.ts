export interface IReferral { _id?: string; referrerId: string; referredId: string; status: 'pending' | 'completed'; reward: number; createdAt?: Date; }
