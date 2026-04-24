import { Router } from 'express';
import { ReportingController } from './reporting.controller';

const router = Router();
const reportingController = new ReportingController();

// Report Management
router.post('/', reportingController.createReport);
router.get('/', reportingController.getReports);
router.get('/:reportId', reportingController.getReport);
router.put('/:reportId', reportingController.updateReport);
router.delete('/:reportId', reportingController.deleteReport);

// Report Execution
router.post('/execute', reportingController.executeReport);
router.get('/:reportId/executions', reportingController.getReportExecutions);
router.get('/executions/:executionId', reportingController.getReportExecution);
router.get('/executions/:executionId/download', reportingController.downloadReport);
router.post('/schedule', reportingController.scheduleReport);

// Dashboard Management
router.post('/dashboards', reportingController.createDashboard);
router.get('/dashboards', reportingController.getDashboards);
router.get('/dashboards/:dashboardId', reportingController.getDashboard);
router.get('/dashboards/:dashboardId/data', reportingController.getDashboardData);

// Data Warehouse Projections
router.post('/projections', reportingController.createProjection);
router.get('/projections', reportingController.getProjections);

export default router;
