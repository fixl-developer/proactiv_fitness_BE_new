import { VirtualSession, VirtualRecording, VirtualLibrary, VirtualAttendance } from './virtual-training.model';
import { IVirtualSession, IVirtualRecording, IVirtualLibrary, IVirtualAttendance, ISessionAnalytics } from './virtual-training.interface';
import { AppError } from '../../utils/appError';
import { logger } from '../../utils/logger';

export class VirtualTrainingService {
    async createSession(data: Partial<IVirtualSession>): Promise<IVirtualSession> {
        try {
            const session = await VirtualSession.create({
                ...data,
                id: `session_${Date.now()}`,
                status: 'scheduled',
                participants: []
            });
            return session.toObject();
        } catch (error) {
            logger.error('Error creating virtual session', { error });
            throw new AppError('Failed to create session', 500);
        }
    }

    async startSession(sessionId: string): Promise<IVirtualSession> {
        try {
            const session = await VirtualSession.findOneAndUpdate(
                { id: sessionId, status: 'scheduled' },
                { $set: { status: 'live', actualStart: new Date(), streamUrl: `stream_${sessionId}` } },
                { new: true }
            );
            if (!session) throw new AppError('Session not found or already started', 404);
            return session.toObject();
        } catch (error) {
            logger.error('Error starting session', { error, sessionId });
            throw new AppError('Failed to start session', 500);
        }
    }

    async endSession(sessionId: string): Promise<IVirtualSession> {
        try {
            const session = await VirtualSession.findOneAndUpdate(
                { id: sessionId, status: 'live' },
                { $set: { status: 'completed', actualEnd: new Date() } },
                { new: true }
            );
            if (!session) throw new AppError('Session not found or not live', 404);

            if (session.settings.recordSession) {
                await this.createRecording(session);
            }

            return session.toObject();
        } catch (error) {
            logger.error('Error ending session', { error, sessionId });
            throw new AppError('Failed to end session', 500);
        }
    }

    async joinSession(sessionId: string, userId: string, role: string): Promise<any> {
        try {
            const session = await VirtualSession.findOne({ id: sessionId });
            if (!session) throw new AppError('Session not found', 404);

            if (session.participants.length >= session.maxParticipants) {
                throw new AppError('Session is full', 400);
            }

            await VirtualSession.updateOne(
                { id: sessionId },
                { $push: { participants: { userId, role, joinedAt: new Date(), cameraEnabled: true, micEnabled: true } } }
            );

            await VirtualAttendance.create({
                id: `attend_${Date.now()}`,
                sessionId,
                userId,
                joinedAt: new Date()
            });

            return { success: true, streamUrl: session.streamUrl };
        } catch (error) {
            logger.error('Error joining session', { error, sessionId, userId });
            throw new AppError('Failed to join session', 500);
        }
    }

    async createRecording(session: any): Promise<IVirtualRecording> {
        try {
            const recording = await VirtualRecording.create({
                id: `rec_${Date.now()}`,
                sessionId: session.id,
                title: session.title,
                duration: Math.floor((session.actualEnd - session.actualStart) / 1000 / 60),
                fileUrl: `recordings/${session.id}.mp4`,
                format: 'mp4',
                quality: session.settings.quality,
                status: 'processing'
            });
            return recording.toObject();
        } catch (error) {
            logger.error('Error creating recording', { error });
            throw new AppError('Failed to create recording', 500);
        }
    }

    async getLibrary(filters?: any): Promise<IVirtualLibrary[]> {
        try {
            const query: any = {};
            if (filters?.category) query.category = { $in: [filters.category] };
            if (filters?.difficulty) query.difficulty = filters.difficulty;
            if (filters?.isPremium !== undefined) query.isPremium = filters.isPremium;

            const videos = await VirtualLibrary.find(query).sort({ views: -1 }).limit(50);
            return videos.map(v => v.toObject());
        } catch (error) {
            logger.error('Error getting library', { error });
            throw new AppError('Failed to get library', 500);
        }
    }

    async trackAttendance(sessionId: string, userId: string): Promise<IVirtualAttendance> {
        try {
            const attendance = await VirtualAttendance.findOne({ sessionId, userId });
            if (!attendance) throw new AppError('Attendance record not found', 404);

            const duration = Math.floor((Date.now() - attendance.joinedAt.getTime()) / 1000 / 60);
            attendance.leftAt = new Date();
            attendance.duration = duration;
            attendance.completed = duration >= 30;
            await attendance.save();

            return attendance.toObject();
        } catch (error) {
            logger.error('Error tracking attendance', { error });
            throw new AppError('Failed to track attendance', 500);
        }
    }

    async getAnalytics(sessionId: string): Promise<ISessionAnalytics> {
        try {
            const session = await VirtualSession.findOne({ id: sessionId });
            if (!session) throw new AppError('Session not found', 404);

            const attendances = await VirtualAttendance.find({ sessionId });

            return {
                sessionId,
                totalParticipants: session.participants.length,
                averageDuration: attendances.reduce((sum, a) => sum + (a.duration || 0), 0) / attendances.length,
                peakConcurrent: session.participants.length,
                engagementRate: 85,
                completionRate: attendances.filter(a => a.completed).length / attendances.length * 100,
                chatMessages: 0,
                questions: 0,
                technicalIssues: 0
            };
        } catch (error) {
            logger.error('Error getting analytics', { error });
            throw new AppError('Failed to get analytics', 500);
        }
    }
}

export const virtualTrainingService = new VirtualTrainingService();
