export interface IVirtualSession {
    id: string;
    title: string;
    description: string;
    type: 'live' | 'on-demand' | 'one-on-one';
    programId?: string;
    coachId: string;
    scheduledStart: Date;
    scheduledEnd: Date;
    actualStart?: Date;
    actualEnd?: Date;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    maxParticipants: number;
    participants: IParticipant[];
    streamUrl?: string;
    recordingUrl?: string;
    chatEnabled: boolean;
    screenShareEnabled: boolean;
    multiCamera: boolean;
    settings: ISessionSettings;
}

export interface IParticipant {
    userId: string;
    role: 'coach' | 'student' | 'observer';
    joinedAt?: Date;
    leftAt?: Date;
    duration?: number;
    cameraEnabled: boolean;
    micEnabled: boolean;
    screenSharing: boolean;
}

export interface ISessionSettings {
    quality: 'low' | 'medium' | 'high' | 'hd';
    recordSession: boolean;
    allowChat: boolean;
    allowQuestions: boolean;
    waitingRoom: boolean;
    autoRecord: boolean;
}

export interface IVirtualRecording {
    id: string;
    sessionId: string;
    title: string;
    duration: number;
    fileUrl: string;
    thumbnailUrl?: string;
    size: number;
    format: string;
    quality: string;
    views: number;
    status: 'processing' | 'ready' | 'failed';
    createdAt: Date;
}

export interface IVirtualLibrary {
    id: string;
    title: string;
    description: string;
    category: string[];
    tags: string[];
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    coachId: string;
    views: number;
    likes: number;
    rating: number;
    isPremium: boolean;
}

export interface IVirtualAttendance {
    id: string;
    sessionId: string;
    userId: string;
    joinedAt: Date;
    leftAt?: Date;
    duration: number;
    engagement: number;
    completed: boolean;
}

export interface ISessionAnalytics {
    sessionId: string;
    totalParticipants: number;
    averageDuration: number;
    peakConcurrent: number;
    engagementRate: number;
    completionRate: number;
    chatMessages: number;
    questions: number;
    technicalIssues: number;
}
