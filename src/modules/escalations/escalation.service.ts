import { Escalation, IEscalation } from './escalation.model';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class EscalationService {
    async list(filters: any = {}): Promise<IEscalation[]> {
        const query: any = {};
        if (filters.status) query.status = filters.status;
        if (filters.priority) query.priority = filters.priority;
        if (filters.ticketId) query.ticketId = filters.ticketId;
        if (filters.search) {
            query.$or = [
                { title: { $regex: filters.search, $options: 'i' } },
                { customer: { $regex: filters.search, $options: 'i' } },
                { ticketId: { $regex: filters.search, $options: 'i' } },
            ];
        }
        return Escalation.find(query).sort({ escalatedAt: -1 }).lean() as any;
    }

    async create(data: Partial<IEscalation>, escalatedBy: string): Promise<IEscalation> {
        if (!data.ticketId || !data.title || !data.customer || !data.reason) {
            throw new AppError('ticketId, title, customer and reason are required', HTTP_STATUS.BAD_REQUEST);
        }
        const escalationId = `ESC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const escalation = await Escalation.create({
            escalationId,
            ...data,
            escalatedBy,
            escalatedAt: new Date(),
        });
        return escalation;
    }

    async update(escalationId: string, updates: Partial<IEscalation>, userId: string): Promise<IEscalation> {
        const patch: any = { ...updates };
        if (updates.status === 'acknowledged') {
            patch.acknowledgedBy = userId;
            patch.acknowledgedAt = new Date();
        }
        if (updates.status === 'resolved') {
            patch.resolvedBy = userId;
            patch.resolvedAt = new Date();
        }
        const escalation = await Escalation.findOneAndUpdate(
            { escalationId },
            patch,
            { new: true }
        );
        if (!escalation) throw new AppError('Escalation not found', HTTP_STATUS.NOT_FOUND);
        return escalation;
    }

    async delete(escalationId: string): Promise<void> {
        const result = await Escalation.deleteOne({ escalationId });
        if (result.deletedCount === 0) throw new AppError('Escalation not found', HTTP_STATUS.NOT_FOUND);
    }
}
