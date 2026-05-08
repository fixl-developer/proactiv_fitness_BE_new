import { SupportReport, ISupportReport } from './support-report.model';
import { SupportTicket, CustomerInquiry } from '../support/support.model';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class SupportReportService {
    async list(filters: any = {}): Promise<ISupportReport[]> {
        const query: any = {};
        if (filters.type && filters.type !== 'all') query.type = filters.type;
        if (filters.status) query.status = filters.status;
        return SupportReport.find(query).sort({ createdAt: -1 }).lean() as any;
    }

    async generate(input: {
        name: string;
        type: ISupportReport['type'];
        startDate: string;
        endDate: string;
        format: ISupportReport['format'];
    }, generatedBy: string): Promise<ISupportReport> {
        if (!input.name || !input.startDate || !input.endDate) {
            throw new AppError('name, startDate and endDate are required', HTTP_STATUS.BAD_REQUEST);
        }
        const reportId = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const report = await SupportReport.create({
            reportId,
            ...input,
            generatedBy,
            status: 'pending',
        });

        // Compute summary asynchronously and mark completed
        try {
            const summary = await this.computeSummary(input.type, input.startDate, input.endDate);
            report.summary = summary;
            report.status = 'completed';
            report.completedAt = new Date();
            await report.save();
        } catch {
            report.status = 'failed';
            await report.save();
        }
        return report;
    }

    async delete(reportId: string): Promise<void> {
        const result = await SupportReport.deleteOne({ reportId });
        if (result.deletedCount === 0) throw new AppError('Report not found', HTTP_STATUS.NOT_FOUND);
    }

    private async computeSummary(type: string, startDate: string, endDate: string): Promise<any> {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (type === 'tickets' || type === 'performance') {
            const [total, resolved, inProgress, open] = await Promise.all([
                SupportTicket.countDocuments({ createdAt: { $gte: start, $lte: end } }),
                SupportTicket.countDocuments({ createdAt: { $gte: start, $lte: end }, status: 'resolved' }),
                SupportTicket.countDocuments({ createdAt: { $gte: start, $lte: end }, status: 'in-progress' }),
                SupportTicket.countDocuments({ createdAt: { $gte: start, $lte: end }, status: 'open' }),
            ]);
            return { totalTickets: total, resolved, inProgress, open };
        }
        if (type === 'customer') {
            const [totalInquiries, byStatus] = await Promise.all([
                CustomerInquiry.countDocuments({ createdAt: { $gte: start, $lte: end } }),
                CustomerInquiry.aggregate([
                    { $match: { createdAt: { $gte: start, $lte: end } } },
                    { $group: { _id: '$status', count: { $sum: 1 } } },
                ]),
            ]);
            return { totalInquiries, byStatus };
        }
        if (type === 'financial') {
            return { note: 'Financial reports require billing module integration', period: `${startDate} to ${endDate}` };
        }
        return {};
    }
}
