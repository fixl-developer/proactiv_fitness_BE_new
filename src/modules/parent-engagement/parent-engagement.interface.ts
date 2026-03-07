export interface IParentUpdate { _id?: string; athleteId: string; parentId: string; type: 'video' | 'photo' | 'milestone'; content: string; mediaUrl?: string; createdAt?: Date; }
