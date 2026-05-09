import { SupportSchedule, ISupportSchedule } from './support-schedule.model';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class SupportScheduleService {
    async list(filters: any = {}): Promise<ISupportSchedule[]> {
        const query: any = {};
        if (filters.status) query.status = filters.status;
        if (filters.shiftType) query.shiftType = filters.shiftType;
        if (filters.staffName) query.staffName = { $regex: filters.staffName, $options: 'i' };
        if (filters.startDate || filters.endDate) {
            query.date = {} as any;
            if (filters.startDate) query.date.$gte = filters.startDate;
            if (filters.endDate) query.date.$lte = filters.endDate;
        }
        return SupportSchedule.find(query).sort({ date: 1, startTime: 1 }).lean() as any;
    }

    async create(data: Partial<ISupportSchedule>, createdBy: string): Promise<ISupportSchedule> {
        if (!data.staffName || !data.date || !data.startTime || !data.endTime || !data.location) {
            throw new AppError('staffName, date, startTime, endTime and location are required', HTTP_STATUS.BAD_REQUEST);
        }
        const scheduleId = `SCH-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        return SupportSchedule.create({ scheduleId, ...data, createdBy });
    }

    async update(scheduleId: string, updates: Partial<ISupportSchedule>, updatedBy: string): Promise<ISupportSchedule> {
        const schedule = await SupportSchedule.findOneAndUpdate(
            { scheduleId },
            { ...updates, updatedBy },
            { new: true }
        );
        if (!schedule) throw new AppError('Schedule not found', HTTP_STATUS.NOT_FOUND);
        return schedule;
    }

    async delete(scheduleId: string): Promise<void> {
        const result = await SupportSchedule.deleteOne({ scheduleId });
        if (result.deletedCount === 0) throw new AppError('Schedule not found', HTTP_STATUS.NOT_FOUND);
    }
}
