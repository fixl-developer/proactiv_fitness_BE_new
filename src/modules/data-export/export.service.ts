import { ExportPack, ExportTemplate, ExportHistory } from './export.model';
import { ICreateExportRequest, IParentExportRequest, IFranchiseExportRequest, IScheduleExportRequest } from './export.interface';
import { AppError } from '../../shared/utils/app-error.util';
import { v4 as uuidv4 } from 'uuid';

export class DataExportService {
    // Export Pack Management
    async createExport(data: ICreateExportRequest, userId: string, userName: string, email: string): Promise<any> {
        const exportId = uuidv4();

        // Set expiry date (30 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const exportPack = new ExportPack({
            exportId,
            exportType: data.exportType,
            requestedBy: {
                userId,
                userName,
                userType: 'admin',
                email
            },
            scope: data.scope,
            dataCategories: data.dataCategories.map(cat => ({
                category: cat,
                included: true
            })),
            format: data.format,
            status: 'pending',
            metadata: {
                dateRange: data.dateRange,
                includeArchived: data.includeArchived || false
            },
            schedule: data.schedule,
            expiryDate,
            businessUnitId: 'bu-001',
            createdBy: userId
        });

        const savedExport = await exportPack.save();

        // Log history
        await this.logHistory(exportId, 'created', userId);

        // Start processing (in real implementation, this would be async)
        this.processExport(exportId);

        return savedExport;
    }

    async createParentExport(data: IParentExportRequest, userId: string, userName: string, email: string): Promise<any> {
        const exportRequest: ICreateExportRequest = {
            exportType: 'parent_level',
            scope: {
                entityType: 'parent',
                entityId: data.parentId,
                entityName: 'Parent Export'
            },
            dataCategories: data.categories,
            format: data.format,
            dateRange: data.dateRange
        };

        return await this.createExport(exportRequest, userId, userName, email);
    }

    async createFranchiseExport(data: IFranchiseExportRequest, userId: string, userName: string, email: string): Promise<any> {
        const exportRequest: ICreateExportRequest = {
            exportType: 'franchise_level',
            scope: {
                entityType: 'franchise',
                entityId: data.franchiseId,
                entityName: 'Franchise Export'
            },
            dataCategories: data.categories,
            format: data.format,
            dateRange: data.dateRange
        };

        return await this.createExport(exportRequest, userId, userName, email);
    }

    async getExports(filters: any): Promise<any[]> {
        const query: any = {};

        if (filters.exportType) query.exportType = filters.exportType;
        if (filters.status) query.status = filters.status;
        if (filters.userId) query['requestedBy.userId'] = filters.userId;

        return await ExportPack.find(query)
            .sort({ createdAt: -1 })
            .limit(filters.limit || 50);
    }

    async getExport(exportId: string): Promise<any> {
        const exportPack = await ExportPack.findOne({ exportId });

        if (!exportPack) {
            throw new AppError('Export not found', 404);
        }

        return exportPack;
    }

    async downloadExport(exportId: string, userId: string): Promise<any> {
        const exportPack = await ExportPack.findOne({ exportId });

        if (!exportPack) {
            throw new AppError('Export not found', 404);
        }

        if (exportPack.status !== 'completed') {
            throw new AppError('Export is not ready for download', 400);
        }

        if (new Date() > exportPack.expiryDate) {
            throw new AppError('Export has expired', 410);
        }

        // Update download count
        await ExportPack.findOneAndUpdate(
            { exportId },
            {
                $inc: { downloadCount: 1 },
                lastDownloadedAt: new Date()
            }
        );

        // Log history
        await this.logHistory(exportId, 'downloaded', userId);

        return {
            exportId: exportPack.exportId,
            files: exportPack.files,
            expiryDate: exportPack.expiryDate
        };
    }

    async scheduleExport(data: IScheduleExportRequest, userId: string): Promise<any> {
        const exportPack = await ExportPack.findOne({ exportId: data.exportId });

        if (!exportPack) {
            throw new AppError('Export not found', 404);
        }

        const nextRun = this.calculateNextRun(data.frequency, data.startDate);

        return await ExportPack.findOneAndUpdate(
            { exportId: data.exportId },
            {
                schedule: {
                    isScheduled: true,
                    frequency: data.frequency,
                    nextRun,
                    lastRun: null
                }
            },
            { new: true }
        );
    }

    // Template Management
    async createTemplate(templateName: string, description: string, exportType: string, dataCategories: string[], format: string, userId: string): Promise<any> {
        const templateId = uuidv4();

        const template = new ExportTemplate({
            templateId,
            templateName,
            description,
            exportType,
            dataCategories,
            format,
            businessUnitId: 'bu-001',
            createdBy: userId
        });

        return await template.save();
    }

    async getTemplates(): Promise<any[]> {
        return await ExportTemplate.find({ isActive: true }).sort({ isDefault: -1, templateName: 1 });
    }

    // Helper Methods
    private async processExport(exportId: string): Promise<void> {
        // Simulate export processing
        setTimeout(async () => {
            await ExportPack.findOneAndUpdate(
                { exportId },
                {
                    status: 'processing',
                    'progress.percentage': 25,
                    'progress.currentStep': 'Collecting data'
                }
            );

            await this.logHistory(exportId, 'started', 'system');
        }, 1000);

        setTimeout(async () => {
            await ExportPack.findOneAndUpdate(
                { exportId },
                {
                    status: 'processing',
                    'progress.percentage': 50,
                    'progress.currentStep': 'Generating files'
                }
            );
        }, 3000);

        setTimeout(async () => {
            await ExportPack.findOneAndUpdate(
                { exportId },
                {
                    status: 'processing',
                    'progress.percentage': 75,
                    'progress.currentStep': 'Compressing files'
                }
            );
        }, 5000);

        setTimeout(async () => {
            await ExportPack.findOneAndUpdate(
                { exportId },
                {
                    status: 'completed',
                    'progress.percentage': 100,
                    'progress.currentStep': 'Completed',
                    files: [{
                        fileName: 'export-data.zip',
                        fileUrl: 'https://storage.example.com/exports/export-data.zip',
                        fileSize: 1024000,
                        format: 'zip',
                        generatedAt: new Date()
                    }],
                    'metadata.totalRecords': 1500,
                    'metadata.totalSize': 1024000
                }
            );

            await this.logHistory(exportId, 'completed', 'system');
        }, 7000);
    }

    private calculateNextRun(frequency: string, startDate: Date): Date {
        const nextRun = new Date(startDate);

        switch (frequency) {
            case 'daily':
                nextRun.setDate(nextRun.getDate() + 1);
                break;
            case 'weekly':
                nextRun.setDate(nextRun.getDate() + 7);
                break;
            case 'monthly':
                nextRun.setMonth(nextRun.getMonth() + 1);
                break;
            case 'quarterly':
                nextRun.setMonth(nextRun.getMonth() + 3);
                break;
        }

        return nextRun;
    }

    private async logHistory(exportId: string, action: string, performedBy: string, details?: string): Promise<void> {
        const historyId = uuidv4();

        const history = new ExportHistory({
            historyId,
            exportId,
            action,
            performedBy,
            details,
            timestamp: new Date()
        });

        await history.save();
    }

    async getExportHistory(exportId: string): Promise<any[]> {
        return await ExportHistory.find({ exportId }).sort({ timestamp: -1 });
    }
}
