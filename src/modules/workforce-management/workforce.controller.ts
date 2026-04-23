// Workforce Management Controller - API Endpoints

import { Request, Response } from 'express';
import { WorkforceService } from './workforce.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { sendSuccess } from '../../shared/utils/response.util';

const workforceService = new WorkforceService();

export class WorkforceController {
    // ==================== Staff Profile Management ====================

    createStaffProfile = asyncHandler(async (req: Request, res: Response) => {
        const result = await workforceService.createStaffProfile(req.body);
        sendSuccess(res, result, 'Staff profile created successfully', 201);
    });

    getStaffProfile = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const profile = await workforceService.getStaffProfile(staffId);
        sendSuccess(res, profile, 'Staff profile retrieved successfully');
    });

    updateStaffProfile = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const result = await workforceService.updateStaffProfile(staffId, req.body);
        sendSuccess(res, result, 'Staff profile updated successfully');
    });

    listStaffProfiles = asyncHandler(async (req: Request, res: Response) => {
        const profiles = await workforceService.listStaffProfiles(req.query);
        sendSuccess(res, profiles, 'Staff profiles retrieved successfully');
    });

    // ==================== Certification Management ====================

    addCertification = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const result = await workforceService.addCertification(staffId, req.body);
        sendSuccess(res, result, 'Certification added successfully', 201);
    });

    getCertifications = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const certs = await workforceService.getCertifications(staffId);
        sendSuccess(res, certs, 'Certifications retrieved successfully');
    });

    getExpiringCertifications = asyncHandler(async (req: Request, res: Response) => {
        const { days } = req.query;
        const certs = await workforceService.getExpiringCertifications(parseInt(days as string) || 30);
        sendSuccess(res, certs, 'Expiring certifications retrieved successfully');
    });

    // ==================== Leave Management ====================

    requestLeave = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const result = await workforceService.requestLeave(staffId, req.body);
        sendSuccess(res, result, 'Leave request created successfully', 201);
    });

    approveLeaveRequest = asyncHandler(async (req: Request, res: Response) => {
        const { leaveRequestId } = req.params;
        const { approvedBy } = req.body;
        const result = await workforceService.approveLeaveRequest(leaveRequestId, approvedBy);
        sendSuccess(res, result, 'Leave request approved successfully');
    });

    rejectLeaveRequest = asyncHandler(async (req: Request, res: Response) => {
        const { leaveRequestId } = req.params;
        const { reason } = req.body;
        const result = await workforceService.rejectLeaveRequest(leaveRequestId, reason);
        sendSuccess(res, result, 'Leave request rejected successfully');
    });

    getLeaveRequests = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const { status } = req.query;
        const leaves = await workforceService.getLeaveRequests(staffId, status as string);
        sendSuccess(res, leaves, 'Leave requests retrieved successfully');
    });

    getLeaveBalance = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const { year } = req.query;
        const balance = await workforceService.getLeaveBalance(staffId, parseInt(year as string) || new Date().getFullYear());
        sendSuccess(res, balance, 'Leave balance retrieved successfully');
    });

    // ==================== Time Tracking ====================

    logTimeTracking = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const result = await workforceService.logTimeTracking(staffId, req.body);
        sendSuccess(res, result, 'Time tracking logged successfully', 201);
    });

    getTimeTracking = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const { startDate, endDate } = req.query;
        const tracking = await workforceService.getTimeTracking(
            staffId,
            new Date(startDate as string),
            new Date(endDate as string)
        );
        sendSuccess(res, tracking, 'Time tracking retrieved successfully');
    });

    createTimesheet = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const { period, startDate, endDate } = req.body;
        const timesheet = await workforceService.createTimesheet(
            staffId,
            period,
            new Date(startDate),
            new Date(endDate)
        );
        sendSuccess(res, timesheet, 'Timesheet created successfully', 201);
    });

    // ==================== Performance Management ====================

    createPerformanceKPI = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const result = await workforceService.createPerformanceKPI(staffId, req.body);
        sendSuccess(res, result, 'Performance KPI created successfully', 201);
    });

    getPerformanceKPIs = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const kpis = await workforceService.getPerformanceKPIs(staffId);
        sendSuccess(res, kpis, 'Performance KPIs retrieved successfully');
    });

    // ==================== Payroll Management ====================

    createPayroll = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const result = await workforceService.createPayroll(staffId, req.body);
        sendSuccess(res, result, 'Payroll created successfully', 201);
    });

    getPayrolls = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const payrolls = await workforceService.getPayrolls(staffId);
        sendSuccess(res, payrolls, 'Payrolls retrieved successfully');
    });

    exportPayroll = asyncHandler(async (req: Request, res: Response) => {
        const { period, startDate, endDate, format } = req.body;
        const result = await workforceService.exportPayroll(
            period,
            new Date(startDate),
            new Date(endDate),
            format
        );
        sendSuccess(res, result, 'Payroll exported successfully', 201);
    });

    // ==================== Training & Development ====================

    addTrainingRecord = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const result = await workforceService.addTrainingRecord(staffId, req.body);
        sendSuccess(res, result, 'Training record added successfully', 201);
    });

    getTrainingRecords = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const records = await workforceService.getTrainingRecords(staffId);
        sendSuccess(res, records, 'Training records retrieved successfully');
    });

    createDevelopmentPlan = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const { year } = req.body;
        const result = await workforceService.createDevelopmentPlan(staffId, year, req.body);
        sendSuccess(res, result, 'Development plan created successfully', 201);
    });

    // ==================== Location Assignment ====================

    assignLocation = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const result = await workforceService.assignLocation(staffId, req.body);
        sendSuccess(res, result, 'Location assigned successfully', 201);
    });

    getLocationAssignments = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const assignments = await workforceService.getLocationAssignments(staffId);
        sendSuccess(res, assignments, 'Location assignments retrieved successfully');
    });

    // ==================== Notifications ====================

    sendNotification = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const result = await workforceService.sendNotification(staffId, req.body);
        sendSuccess(res, result, 'Notification sent successfully', 201);
    });

    getNotifications = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const { unreadOnly } = req.query;
        const notifs = await workforceService.getNotifications(staffId, unreadOnly === 'true');
        sendSuccess(res, notifs, 'Notifications retrieved successfully');
    });
}
