import { Request, Response, NextFunction } from 'express';
import { ReportingService } from './reporting.service';

const reportingService = new ReportingService();

export class ReportingController {
    // Report Management
    async createReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.userId || 'system';
            const report = await reportingService.createReport(req.body, userId);

            res.status(201).json({
                success: true,
                message: 'Report created successfully',
                data: report
            });
        } catch (error) {
            next(error);
        }
    }

    async getReports(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = {
                reportType: req.query.reportType as string,
                status: req.query.status as string
            };

            const reports = await reportingService.getReports(filters);

            res.status(200).json({
                success: true,
                message: 'Reports retrieved successfully',
                data: reports
            });
        } catch (error) {
            next(error);
        }
    }

    async getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reportId } = req.params;
            const report = await reportingService.getReport(reportId);

            res.status(200).json({
                success: true,
                message: 'Report retrieved successfully',
                data: report
            });
        } catch (error) {
            next(error);
        }
    }

    async updateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reportId } = req.params;
            const report = await reportingService.updateReport(reportId, req.body);

            res.status(200).json({
                success: true,
                message: 'Report updated successfully',
                data: report
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reportId } = req.params;
            await reportingService.deleteReport(reportId);

            res.status(200).json({
                success: true,
                message: 'Report deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // Report Execution
    async executeReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.userId || 'system';
            const execution = await reportingService.executeReport(req.body, userId);

            res.status(200).json({
                success: true,
                message: 'Report execution started',
                data: execution
            });
        } catch (error) {
            next(error);
        }
    }

    async getReportExecutions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reportId } = req.params;
            const executions = await reportingService.getReportExecutions(reportId);

            res.status(200).json({
                success: true,
                message: 'Report executions retrieved successfully',
                data: executions
            });
        } catch (error) {
            next(error);
        }
    }

    async getReportExecution(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { executionId } = req.params;
            const execution = await reportingService.getReportExecution(executionId);

            res.status(200).json({
                success: true,
                message: 'Report execution retrieved successfully',
                data: execution
            });
        } catch (error) {
            next(error);
        }
    }

    async downloadReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { executionId } = req.params;
            const result = await reportingService.downloadReport(executionId);

            res.status(200).json({
                success: true,
                message: 'Report ready for download',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async scheduleReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const report = await reportingService.scheduleReport(req.body);

            res.status(200).json({
                success: true,
                message: 'Report scheduled successfully',
                data: report
            });
        } catch (error) {
            next(error);
        }
    }

    // Dashboard Management
    async createDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.userId || 'system';
            const dashboard = await reportingService.createDashboard(req.body, userId);

            res.status(201).json({
                success: true,
                message: 'Dashboard created successfully',
                data: dashboard
            });
        } catch (error) {
            next(error);
        }
    }

    async getDashboards(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dashboards = await reportingService.getDashboards();

            res.status(200).json({
                success: true,
                message: 'Dashboards retrieved successfully',
                data: dashboards
            });
        } catch (error) {
            next(error);
        }
    }

    async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { dashboardId } = req.params;
            const dashboard = await reportingService.getDashboard(dashboardId);

            res.status(200).json({
                success: true,
                message: 'Dashboard retrieved successfully',
                data: dashboard
            });
        } catch (error) {
            next(error);
        }
    }

    async getDashboardData(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { dashboardId } = req.params;
            const data = await reportingService.getDashboardData(dashboardId);

            res.status(200).json({
                success: true,
                message: 'Dashboard data retrieved successfully',
                data
            });
        } catch (error) {
            next(error);
        }
    }

    // Data Warehouse Projections
    async createProjection(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const projection = await reportingService.createProjection(req.body);

            res.status(201).json({
                success: true,
                message: 'Projection created successfully',
                data: projection
            });
        } catch (error) {
            next(error);
        }
    }

    async getProjections(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const projections = await reportingService.getProjections();

            res.status(200).json({
                success: true,
                message: 'Projections retrieved successfully',
                data: projections
            });
        } catch (error) {
            next(error);
        }
    }
}
