import { VirtualSession } from './virtual-training.model';
import { IVirtualSession } from './virtual-training.interface';

export class VirtualTrainingService {
    async createSession(data: Partial<IVirtualSession>): Promise<IVirtualSession> {
        const session = new VirtualSession(data);
        return await session.save();
    }

    async getSessions(filters: any = {}): Promise<IVirtualSession[]> {
        return await VirtualSession.find(filters).sort({ scheduledAt: -1 });
    }

    async getSessionById(id: string): Promise<IVirtualSession | null> {
        return await VirtualSession.findById(id);
    }

    async updateSession(id: string, data: Partial<IVirtualSession>): Promise<IVirtualSession | null> {
        return await VirtualSession.findByIdAndUpdate(id, data, { new: true });
    }

    async joinSession(sessionId: string, userId: string): Promise<IVirtualSession | null> {
        return await VirtualSession.findByIdAndUpdate(
            sessionId,
            { $addToSet: { participants: userId } },
            { new: true }
        );
    }
}
