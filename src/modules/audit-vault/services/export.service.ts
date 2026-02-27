import { Db } from 'mongodb';
import { createSign, createVerify } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import { BaseAuditLog, ExportJob } from '../interfaces';
import { AuditLogFilter } from './query.service';
import logger from '../../../shared/utils/logger.util';

export interface ExportRequest {
    tenantId: string;
    filter: AuditLogFilter;
    format: 'json' | 'csv' | 'pdf';
    includeSignature: boolean;
    requestedBy: string;
}

/**
 * Export Service for generating audit log exports
 */
export class ExportService {
    private db: Db;
    private exportDir: string;
    private privateKey?: string;
    private publicKey?: string;

    constructor(db: Db, exportDir: string = './exports') {
        this.db = db;
        this.exportDir = exportDir;
        this.loadKeys();
    }

    /**
     * Create export job
     */
    async createExport(request: ExportRequest): Promise<string> {
        const jobId = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const job: Omit<ExportJob, '_id'> = {
            jobId,
            tenantId: request.tenantId,
            status: 'pending',
            request,
            expiresAt,
            createdAt: new Date(),
        };

        // Save job to database
        const collection = this.db.collection<ExportJob>('export_jobs');
        await collection.insertOne(job as ExportJob);

        // Start processing asynchronously
        this.processExport(jobId).catch(error => {
            logger.error('Export processing failed', { jobId, error });
        });

        logger.info('Export job created', { jobId, tenantId: request.tenantId, format: request.format });

        return jobId;
    }

    /**
     * Get export job status
     */
    async getExportJob(jobId: string): Promise<ExportJob | null> {
        const collection = this.db.collection<ExportJob>('export_jobs');
        return collection.findOne({ jobId });
    }

    /**
     * Process export job
     */
    private async processExport(jobId: string): Promise<void> {
        const collection = this.db.collection<ExportJob>('export_jobs');

        try {
            // Update status to processing
            await collection.updateOne(
                { jobId },
                { $set: { status: 'processing' } }
            );

            const job = await collection.findOne({ jobId });
            if (!job) throw new Error('Job not found');

            // Query audit logs
            const auditCollection = this.db.collection<BaseAuditLog>('audit_logs');
            const logs = await this.queryLogsForExport(auditCollection, job.request.filter);

            // Generate export file
            const filePath = await this.generateExportFile(logs, job.request.format, jobId);
            const fileSize = await this.getFileSize(filePath);

            // Generate signature if requested
            let signature: string | undefined;
            if (job.request.includeSignature && this.privateKey) {
                signature = await this.generateSignature(filePath);
            }

            // Update job with completion
            await collection.updateOne(
                { jobId },
                {
                    $set: {
                        status: 'completed',
                        recordCount: logs.length,
                        fileSize,
                        filePath,
                        downloadUrl: `/api/v1/audit/exports/${jobId}/download`,
                        signature,
                        completedAt: new Date(),
                    },
                }
            );

            logger.info('Export job completed', { jobId, recordCount: logs.length, fileSize });

        } catch (error) {
            // Update job with error
            await collection.updateOne(
                { jobId },
                {
                    $set: {
                        status: 'failed',
                        error: error instanceof Error ? error.message : 'Unknown error',
                        completedAt: new Date(),
                    },
                }
            );

            logger.error('Export job failed', { jobId, error });
            throw error;
        }
    }

    /**
     * Query logs for export
     */
    private async queryLogsForExport(
        collection: any,
        filter: AuditLogFilter
    ): Promise<BaseAuditLog[]> {
        const mongoFilter: any = { tenantId: filter.tenantId };

        // Apply filters
        if (filter.startDate || filter.endDate) {
            mongoFilter.timestamp = {};
            if (filter.startDate) mongoFilter.timestamp.$gte = filter.startDate;
            if (filter.endDate) mongoFilter.timestamp.$lte = filter.endDate;
        }

        if (filter.actorId) mongoFilter.actorId = filter.actorId;
        if (filter.actionType) mongoFilter.actionType = filter.actionType;
        if (filter.actionCategory) mongoFilter.actionCategory = filter.actionCategory;
        if (filter.resourceType) mongoFilter.resourceType = filter.resourceType;
        if (filter.resourceId) mongoFilter.resourceId = filter.resourceId;

        return collection.find(mongoFilter).sort({ timestamp: 1 }).toArray();
    }

    /**
     * Generate export file
     */
    private async generateExportFile(
        logs: BaseAuditLog[],
        format: 'json' | 'csv' | 'pdf',
        jobId: string
    ): Promise<string> {
        const fileName = `audit-export-${jobId}.${format}`;
        const filePath = path.join(this.exportDir, fileName);

        // Ensure export directory exists
        await fs.mkdir(this.exportDir, { recursive: true });

        switch (format) {
            case 'json':
                await this.generateJsonExport(logs, filePath);
                break;
            case 'csv':
                await this.generateCsvExport(logs, filePath);
                break;
            case 'pdf':
                await this.generatePdfExport(logs, filePath);
                break;
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }

        return filePath;
    }

    /**
     * Generate JSON export
     */
    private async generateJsonExport(logs: BaseAuditLog[], filePath: string): Promise<void> {
        const exportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                recordCount: logs.length,
                format: 'json',
            },
            logs,
        };

        await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
    }

    /**
     * Generate CSV export
     */
    private async generateCsvExport(logs: BaseAuditLog[], filePath: string): Promise<void> {
        const headers = [
            'logId',
            'timestamp',
            'tenantId',
            'actorId',
            'actionType',
            'actionCategory',
            'resourceType',
            'resourceId',
            'context',
            'ipAddress',
            'userAgent',
        ];

        const csvLines = [headers.join(',')];

        for (const log of logs) {
            const row = [
                log.logId,
                log.timestamp.toISOString(),
                log.tenantId,
                log.actorId,
                log.actionType,
                log.actionCategory,
                log.resourceType || '',
                log.resourceId || '',
                JSON.stringify(log.context).replace(/"/g, '""'),
                log.ipAddress || '',
                log.userAgent || '',
            ];

            csvLines.push(row.map(field => `"${field}"`).join(','));
        }

        await fs.writeFile(filePath, csvLines.join('\n'));
    }

    /**
     * Generate PDF export (simplified implementation)
     */
    private async generatePdfExport(logs: BaseAuditLog[], filePath: string): Promise<void> {
        // This is a simplified implementation
        // In production, you'd use a proper PDF library like puppeteer or pdfkit

        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Audit Log Export</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Audit Log Export</h1>
        <p>Generated: ${new Date().toISOString()}</p>
        <p>Records: ${logs.length}</p>
        
        <table>
          <tr>
            <th>Timestamp</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Context</th>
          </tr>
          ${logs.map(log => `
            <tr>
              <td>${log.timestamp.toISOString()}</td>
              <td>${log.actorId}</td>
              <td>${log.actionType}</td>
              <td>${log.resourceType || ''} ${log.resourceId || ''}</td>
              <td>${JSON.stringify(log.context)}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;

        // For now, save as HTML (in production, convert to PDF)
        await fs.writeFile(filePath.replace('.pdf', '.html'), htmlContent);
    }

    /**
     * Generate cryptographic signature
     */
    private async generateSignature(filePath: string): Promise<string> {
        if (!this.privateKey) {
            throw new Error('Private key not available for signing');
        }

        const fileContent = await fs.readFile(filePath);
        const sign = createSign('SHA256');
        sign.update(fileContent);
        return sign.sign(this.privateKey, 'hex');
    }

    /**
     * Verify signature
     */
    async verifySignature(filePath: string, signature: string): Promise<boolean> {
        if (!this.publicKey) {
            throw new Error('Public key not available for verification');
        }

        try {
            const fileContent = await fs.readFile(filePath);
            const verify = createVerify('SHA256');
            verify.update(fileContent);
            return verify.verify(this.publicKey, signature, 'hex');
        } catch (error) {
            logger.error('Signature verification failed', { error });
            return false;
        }
    }

    /**
     * Get file size
     */
    private async getFileSize(filePath: string): Promise<number> {
        const stats = await fs.stat(filePath);
        return stats.size;
    }

    /**
     * Load RSA keys for signing
     */
    private async loadKeys(): Promise<void> {
        try {
            // In production, load from secure key storage
            // For now, generate or load from environment
            this.privateKey = process.env.AUDIT_PRIVATE_KEY;
            this.publicKey = process.env.AUDIT_PUBLIC_KEY;
        } catch (error) {
            logger.warn('Could not load signing keys', { error });
        }
    }

    /**
     * Clean up expired exports
     */
    async cleanupExpiredExports(): Promise<void> {
        const collection = this.db.collection<ExportJob>('export_jobs');

        const expiredJobs = await collection
            .find({ expiresAt: { $lt: new Date() } })
            .toArray();

        for (const job of expiredJobs) {
            if (job.filePath) {
                try {
                    await fs.unlink(job.filePath);
                } catch (error) {
                    logger.warn('Could not delete expired export file', {
                        jobId: job.jobId,
                        filePath: job.filePath,
                        error
                    });
                }
            }
        }

        await collection.deleteMany({ expiresAt: { $lt: new Date() } });

        logger.info('Cleaned up expired exports', { count: expiredJobs.length });
    }
}