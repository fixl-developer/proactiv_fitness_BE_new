export interface IVirtualSession {
    _id?: string;
    title: string;
    type: 'live' | 'recorded';
    instructorId: string;
    streamUrl?: string;
    recordingUrl?: string;
    scheduledAt?: Date;
    duration: number;
    participants: string[];
    status: 'scheduled' | 'live' | 'completed';
    createdAt?: Date;
}
