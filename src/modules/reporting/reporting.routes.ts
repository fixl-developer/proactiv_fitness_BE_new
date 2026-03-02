import { Router } from 'express';
import { ReportingController } from './reporting.controller';

const router = Router();
const reportingController = new ReportingController();

// Report Management
router.post('/reports', reportingController.createReport);
router.get('/reports', reportingController.getReports);
router.get('/reports/:reportId', reportingController.getReport);
router.put('/reports/:reportId', reportingController.updateReport);
router.delete('/reports/:reportId', reportingController.deleteReport);

// Report Execution
router.post('/reports/execute', reportingController.executeReport);
router.get('/reports/:reportId/executions', reportingController.getReportExecutions);
router.get('/executions/:executionId', reportingController.getReportExecution);
router.get('/executions/:executionId/download', reportingController.downloadReport);
router.post('/reports/schedule', reportingController.scheduleReport);

// Dashboard Management
router.post('/dashboards', reportingController.createDashboard);
router.get('/dashboards', reportingController.getDashboards);
router.get('/dashboards/:dashboardId', reportingController.getDashboard);
router.get('/dashboards/:dashboardId/data', reportingController.getDashboardData);

// Data Warehouse Projections
router.post('/projections', reportingController.createProjection);
router.get('/projections', reportingController.getProjections);

export default router;
