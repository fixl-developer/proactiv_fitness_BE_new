import { TicketHistory, ITicketHistory } from './support.model';

export class TicketHistoryService {
    async recordChange(
        ticketId: string,
        changeType: 'status' | 'priority' | 'assignment' | 'escalation' | 'resolution' | 'comment' | 'attachment' | 'other',
        fieldName: string,
        oldValue: any,
        newValue: any,
        changedBy: string,
        changedByEmail: string,
        reason?: string
    ): Promise<ITicketHistory> {
        const history = await TicketHistory.create({
            historyId: `HIST-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            ticketId,
            changeType,
            fieldName,
            oldValue,
            newValue,
            changedBy,
            changedByEmail,
            reason,
        });

        return history;
    }

    async getTicketHistory(ticketId: string, limit: number = 50): Promise<ITicketHistory[]> {
        return TicketHistory.find({ ticketId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }

    async getChangesSince(ticketId: string, since: Date): Promise<ITicketHistory[]> {
        return TicketHistory.find({
            ticketId,
            createdAt: { $gte: since },
        })
            .sort({ createdAt: -1 })
            .lean();
    }

    async getChangesByUser(changedBy: string, limit: number = 100): Promise<ITicketHistory[]> {
        return TicketHistory.find({ changedBy })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }

    async deleteTicketHistory(ticketId: string): Promise<void> {
        await TicketHistory.deleteMany({ ticketId });
    }
}

export const ticketHistoryService = new TicketHistoryService();
