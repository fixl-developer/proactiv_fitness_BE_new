import { Request, Response } from 'express';
import { StaffService, StaffScheduleService, StaffAttendanceService } from './staff.service';
import {
    SupportService,
    CustomerInquiryService,
    KnowledgeBaseService,
    LiveChatService,
    StaffSettingsService,
    SupportAnalyticsService
} from '../support/support.service';
import { BaseController } from '../../shared/base/base.controller';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';
import userService from '../iam/user.service';
import { UserRole } from '../../shared/enums';

export class StaffController extends BaseController {
    private staffService: StaffService;
    private scheduleService: StaffScheduleService;
    private attendanceService: StaffAttendanceService;
    private supportService: SupportService;
    private inquiryService: CustomerInquiryService;
    private knowledgeBaseService: KnowledgeBaseService;
    private liveChatService: LiveChatService;
    private staffSettingsService: StaffSettingsService;
    private analyticsService: SupportAnalyticsService;

    constructor() {
        super();
        this.staffService = new StaffService();
        this.scheduleService = new StaffScheduleService();
        this.attendanceService = new StaffAttendanceService();
        this.supportService = new SupportService();
        this.inquiryService = new CustomerInquiryService();
        this.knowledgeBaseService = new KnowledgeBaseService();
        this.liveChatService = new LiveChatService();
        this.staffSettingsService = new StaffSettingsService();
        this.analyticsService = new SupportAnalyticsService();
    }

    /**
     * Create staff member
     */
    createStaff = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.createStaff(req.body, userId);

        return this.sendSuccess(res, {
            message: 'Staff member created successfully',
            data: staff
        });
    });

    /**
     * Get all staff members
     */
    getStaffMembers = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            staffType,
            status,
            businessUnitId,
            locationId,
            skills,
            availabilityStatus,
            searchText
        } = req.query;

        const filter = {
            staffType,
            status,
            businessUnitId,
            locationId,
            skills: skills ? (Array.isArray(skills) ? skills : [skills]) : undefined,
            availabilityStatus,
            searchText
        };

        const staffMembers = await this.staffService.getStaffMembers(
            filter as any,
            Number(page),
            Number(limit)
        );

        return this.sendSuccess(res, {
            message: 'Staff members retrieved successfully',
            data: staffMembers
        });
    });

    /**
     * Get staff member by ID
     */
    getStaffById = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;

        const staff = await this.staffService.findOne({ staffId });
        if (!staff) {
            throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
        }

        return this.sendSuccess(res, {
            message: 'Staff member retrieved successfully',
            data: staff
        });
    });

    /**
     * Update staff member
     */
    updateStaff = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.updateStaff(staffId, req.body, userId);

        return this.sendSuccess(res, {
            message: 'Staff member updated successfully',
            data: staff
        });
    });

    /**
     * Delete staff member
     */
    deleteStaff = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.updateStaff(staffId, { isActive: false } as any, userId
        );

        if (!staff) {
            throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
        }

        return this.sendSuccess(res, {
            message: 'Staff member deleted successfully'
        });
    });

    /**
     * Update staff availability
     */
    updateStaffAvailability = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.updateStaffAvailability(req.body, userId);

        return this.sendSuccess(res, {
            message: 'Staff availability updated successfully',
            data: staff
        });
    });

    /**
     * Create staff schedule
     */
    createStaffSchedule = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const schedule = await this.staffService.createStaffSchedule(req.body, userId);

        return this.sendSuccess(res, {
            message: 'Staff schedule created successfully',
            data: schedule
        });
    });

    /**
     * Get staff schedules
     */
    getStaffSchedules = asyncHandler(async (req: Request, res: Response) => {
        const {
            startDate,
            endDate,
            staffId,
            locationId
        } = req.query;

        if (!startDate || !endDate) {
            throw new AppError('Start date and end date are required', HTTP_STATUS.BAD_REQUEST);
        }

        const schedules = await this.scheduleService.getSchedules(
            new Date(startDate as string),
            new Date(endDate as string),
            staffId as string,
            locationId as string
        );

        return this.sendSuccess(res, {
            message: 'Staff schedules retrieved successfully',
            data: schedules
        });
    });

    /**
     * Update schedule status
     */
    updateScheduleStatus = asyncHandler(async (req: Request, res: Response) => {
        const { scheduleId } = req.params;
        const { status } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const schedule = await this.scheduleService.updateScheduleStatus(scheduleId, status, userId);

        return this.sendSuccess(res, {
            message: 'Schedule status updated successfully',
            data: schedule
        });
    });

    /**
     * Submit time off request
     */
    submitTimeOffRequest = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.submitTimeOffRequest(req.body, userId);

        return this.sendSuccess(res, {
            message: 'Time off request submitted successfully',
            data: staff
        });
    });

    /**
     * Process time off request
     */
    processTimeOffRequest = asyncHandler(async (req: Request, res: Response) => {
        const { staffId, requestId } = req.params;
        const { action, rejectionReason } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        if (!['approve', 'reject'].includes(action)) {
            throw new AppError('Invalid action. Must be approve or reject', HTTP_STATUS.BAD_REQUEST);
        }

        const staff = await this.staffService.processTimeOffRequest(
            staffId,
            requestId,
            action,
            rejectionReason,
            userId
        );

        return this.sendSuccess(res, {
            message: `Time off request ${action}d successfully`,
            data: staff
        });
    });

    /**
     * Check in staff member
     */
    checkInStaff = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const attendance = await this.attendanceService.checkIn(req.body, userId);

        return this.sendSuccess(res, {
            message: 'Staff member checked in successfully',
            data: attendance
        });
    });

    /**
     * Check out staff member
     */
    checkOutStaff = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const attendance = await this.attendanceService.checkOut(staffId, req.body, userId);

        return this.sendSuccess(res, {
            message: 'Staff member checked out successfully',
            data: attendance
        });
    });

    /**
     * Get staff attendance records
     */
    getStaffAttendance = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            staffId,
            locationId,
            startDate,
            endDate,
            status
        } = req.query;

        const filter: any = {};

        if (staffId) filter.staffId = staffId;
        if (locationId) filter.locationId = locationId;
        if (status) filter.status = status;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate as string);
            if (endDate) filter.date.$lte = new Date(endDate as string);
        }

        const attendance = await this.attendanceService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit)
            } as any
        );

        return this.sendSuccess(res, {
            message: 'Staff attendance retrieved successfully',
            data: attendance
        });
    });

    /**
     * Get staff statistics
     */
    getStaffStatistics = asyncHandler(async (req: Request, res: Response) => {
        const { businessUnitId } = req.query;

        const statistics = await this.staffService.getStaffStatistics(businessUnitId as string);

        return this.sendSuccess(res, {
            message: 'Staff statistics retrieved successfully',
            data: statistics
        });
    });

    /**
     * Get attendance statistics
     */
    getAttendanceStatistics = asyncHandler(async (req: Request, res: Response) => {
        const { startDate, endDate, locationId } = req.query;

        if (!startDate || !endDate) {
            throw new AppError('Start date and end date are required', HTTP_STATUS.BAD_REQUEST);
        }

        const statistics = await this.staffService.getAttendanceStatistics(
            new Date(startDate as string),
            new Date(endDate as string),
            locationId as string
        );

        return this.sendSuccess(res, {
            message: 'Attendance statistics retrieved successfully',
            data: statistics
        });
    });

    /**
     * Add staff certification
     */
    addStaffCertification = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.findOne({ staffId });
        if (!staff) {
            throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
        }

        const certificationId = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const certification = {
            certificationId,
            ...req.body
        };

        staff.certifications.push(certification);
        staff.updatedBy = userId;
        await staff.save();

        return this.sendSuccess(res, {
            message: 'Certification added successfully',
            data: staff
        });
    });

    /**
     * Update staff certification
     */
    updateStaffCertification = asyncHandler(async (req: Request, res: Response) => {
        const { staffId, certificationId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.findOne({ staffId });
        if (!staff) {
            throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
        }

        const certification = staff.certifications.find(cert => cert.certificationId === certificationId);
        if (!certification) {
            throw new AppError('Certification not found', HTTP_STATUS.NOT_FOUND);
        }

        Object.assign(certification, req.body);
        staff.updatedBy = userId;
        await staff.save();

        return this.sendSuccess(res, {
            message: 'Certification updated successfully',
            data: staff
        });
    });

    /**
     * Add background check
     */
    addBackgroundCheck = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.findOne({ staffId });
        if (!staff) {
            throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
        }

        const checkId = `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const backgroundCheck = {
            checkId,
            ...req.body,
            requestDate: new Date()
        };

        staff.backgroundChecks.push(backgroundCheck);
        staff.updatedBy = userId;
        await staff.save();

        return this.sendSuccess(res, {
            message: 'Background check added successfully',
            data: staff
        });
    });

    /**
     * Get staff performance metrics
     */
    getStaffPerformance = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const { period } = req.query;

        const staff = await this.staffService.findOne({ staffId });
        if (!staff) {
            throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
        }

        let performanceMetrics = staff.performanceMetrics;

        if (period) {
            performanceMetrics = performanceMetrics.filter(metric => metric.period === period);
        }

        return this.sendSuccess(res, {
            message: 'Staff performance retrieved successfully',
            data: {
                staffId,
                staffName: `${staff.personalInfo.firstName} ${staff.personalInfo.lastName}`,
                performanceMetrics
            }
        });
    });

    /**
     * Update staff performance metrics
     */
    updateStaffPerformance = asyncHandler(async (req: Request, res: Response) => {
        const { staffId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const staff = await this.staffService.findOne({ staffId });
        if (!staff) {
            throw new AppError('Staff member not found', HTTP_STATUS.NOT_FOUND);
        }

        const { period } = req.body;
        const existingMetricIndex = staff.performanceMetrics.findIndex(metric => metric.period === period);

        if (existingMetricIndex >= 0) {
            // Update existing metrics
            Object.assign(staff.performanceMetrics[existingMetricIndex], req.body);
        } else {
            // Add new metrics
            staff.performanceMetrics.push(req.body);
        }

        staff.updatedBy = userId;
        await staff.save();

        return this.sendSuccess(res, {
            message: 'Staff performance updated successfully',
            data: staff
        });
    });

    // Support Staff Dashboard Routes
    /**
     * Get support staff dashboard data
     */
    getSupportDashboard = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const dashboardData = await this.supportService.getDashboardData();

        return this.sendSuccess(res, {
            message: 'Support dashboard data retrieved successfully',
            data: dashboardData
        });
    });

    /**
     * Get support tickets
     */
    getSupportTickets = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const { status, priority, search, page = 1, limit = 25 } = req.query;

        const filters = {
            status,
            priority,
            search
        };

        const result = await this.supportService.getTickets(filters, Number(page), Number(limit));

        return this.sendSuccess(res, {
            message: 'Support tickets retrieved successfully',
            data: result
        });
    });

    /**
     * Get customer inquiries
     */
    getCustomerInquiries = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const { status, type, search, page = 1, limit = 25 } = req.query;

        const filters = {
            status,
            type,
            search
        };

        const result = await this.inquiryService.getInquiries(filters, Number(page), Number(limit));

        return this.sendSuccess(res, {
            message: 'Customer inquiries retrieved successfully',
            data: result
        });
    });

    /**
     * Get knowledge base articles
     */
    getKnowledgeBaseArticles = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const { category, status, search, page = 1, limit = 25 } = req.query;

        const filters = {
            category,
            status,
            search
        };

        const result = await this.knowledgeBaseService.getArticles(filters, Number(page), Number(limit));

        return this.sendSuccess(res, {
            message: 'Knowledge base articles retrieved successfully',
            data: result
        });
    });

    /**
     * Get support analytics
     */
    getSupportAnalytics = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const { period = '30d' } = req.query;

        const analytics = await this.analyticsService.getAnalytics(period as string);

        return this.sendSuccess(res, {
            message: 'Support analytics retrieved successfully',
            data: analytics
        });
    });

    /**
     * Create support ticket
     */
    createSupportTicket = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const ticket = await this.supportService.createTicket(req.body, userId);

        return this.sendSuccess(res, {
            message: 'Support ticket created successfully',
            data: ticket
        });
    });

    /**
     * Update support ticket
     */
    updateSupportTicket = asyncHandler(async (req: Request, res: Response) => {
        const { ticketId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const ticket = await this.supportService.updateTicket(ticketId, req.body, userId);

        return this.sendSuccess(res, {
            message: 'Support ticket updated successfully',
            data: ticket
        });
    });

    /**
     * Respond to customer inquiry
     */
    respondToInquiry = asyncHandler(async (req: Request, res: Response) => {
        const { inquiryId } = req.params;
        const { message, isInternal = false } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const inquiry = await this.inquiryService.respondToInquiry(
            inquiryId,
            message,
            userId,
            'staff',
            isInternal
        );

        return this.sendSuccess(res, {
            message: 'Response added successfully',
            data: inquiry
        });
    });

    /**
     * Create knowledge base article
     */
    createKnowledgeBaseArticle = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const article = await this.knowledgeBaseService.createArticle(req.body, userId);

        return this.sendSuccess(res, {
            message: 'Knowledge base article created successfully',
            data: article
        });
    });

    /**
     * Update knowledge base article
     */
    updateKnowledgeBaseArticle = asyncHandler(async (req: Request, res: Response) => {
        const { articleId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const article = await this.knowledgeBaseService.updateArticle(articleId, req.body, userId);

        return this.sendSuccess(res, {
            message: 'Knowledge base article updated successfully',
            data: article
        });
    });

    /**
     * Delete knowledge base article
     */
    deleteKnowledgeBaseArticle = asyncHandler(async (req: Request, res: Response) => {
        const { articleId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        await this.knowledgeBaseService.deleteArticle(articleId);

        return this.sendSuccess(res, {
            message: 'Knowledge base article deleted successfully'
        });
    });

    /**
     * Get staff settings
     */
    getStaffSettings = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const settings = await this.staffSettingsService.getSettings(userId);

        return this.sendSuccess(res, {
            message: 'Staff settings retrieved successfully',
            data: settings
        });
    });

    /**
     * Update staff settings
     */
    updateStaffSettings = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const settings = await this.staffSettingsService.updateSettings(userId, req.body);

        return this.sendSuccess(res, {
            message: 'Staff settings updated successfully',
            data: settings
        });
    });

    // Advanced Features - Live Chat
    /**
     * Get live chat sessions
     */
    getLiveChatSessions = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const result = await this.liveChatService.getChatSessions(req.query);

        return this.sendSuccess(res, {
            message: 'Live chat sessions retrieved successfully',
            data: result
        });
    });

    /**
     * Get chat messages
     */
    getChatMessages = asyncHandler(async (req: Request, res: Response) => {
        const { chatId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const result = await this.liveChatService.getChatMessages(chatId);

        return this.sendSuccess(res, {
            message: 'Chat messages retrieved successfully',
            data: result
        });
    });

    /**
     * Send chat message
     */
    sendChatMessage = asyncHandler(async (req: Request, res: Response) => {
        const { chatId } = req.params;
        const { message } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const newMessage = await this.liveChatService.sendMessage(chatId, message, 'agent');

        return this.sendSuccess(res, {
            message: 'Message sent successfully',
            data: newMessage
        });
    });

    /**
     * Create a new chat session
     */
    createChatSession = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const { customerName, customerEmail, initialMessage } = req.body;
        if (!customerName) {
            throw new AppError('Customer name is required', HTTP_STATUS.BAD_REQUEST);
        }

        const session = await this.liveChatService.createSession({
            customerName,
            customerEmail,
            initialMessage,
            assignedAgent: userId
        });

        return this.sendSuccess(res, {
            message: 'Chat session created successfully',
            data: { session }
        });
    });

    // Escalations
    /**
     * Get escalations
     */
    getEscalations = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        // Mock data - replace with actual implementation
        const escalations = [
            {
                id: 'ESC-001',
                ticketId: 'TKT-001',
                title: 'Payment Processing Failure - Urgent Resolution Needed',
                customer: 'Sarah Johnson',
                priority: 'critical',
                status: 'pending',
                escalatedAt: '2024-03-15T09:30:00Z'
            }
        ];

        return this.sendSuccess(res, {
            message: 'Escalations retrieved successfully',
            data: { escalations }
        });
    });

    /**
     * Create escalation
     */
    createEscalation = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        // Mock creation - replace with actual implementation
        const escalation = {
            id: `ESC-${Date.now()}`,
            ...req.body,
            createdAt: new Date().toISOString(),
            createdBy: userId
        };

        return this.sendSuccess(res, {
            message: 'Escalation created successfully',
            data: escalation
        });
    });

    // Schedules
    /**
     * Get staff schedules
     */
    getStaffSchedulesAdvanced = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        // Mock data - replace with actual implementation
        const schedules = [
            {
                id: 'SCH-001',
                staffName: 'John Doe',
                date: '2024-03-15',
                startTime: '09:00',
                endTime: '17:00',
                shiftType: 'full-day',
                status: 'confirmed',
                location: 'Main Office'
            }
        ];

        return this.sendSuccess(res, {
            message: 'Staff schedules retrieved successfully',
            data: { schedules }
        });
    });

    // Training
    /**
     * Get training modules
     */
    getTrainingModules = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        // Mock data - replace with actual implementation
        const modules = [
            {
                id: 'TM-001',
                title: 'Customer Service Excellence',
                description: 'Learn the fundamentals of providing exceptional customer service',
                category: 'Customer Service',
                type: 'video',
                duration: 45,
                difficulty: 'beginner',
                status: 'completed',
                progress: 100
            }
        ];

        return this.sendSuccess(res, {
            message: 'Training modules retrieved successfully',
            data: { modules }
        });
    });

    /**
     * Get training paths
     */
    getTrainingPaths = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        // Mock data - replace with actual implementation
        const paths = [
            {
                id: 'TP-001',
                name: 'Customer Support Specialist',
                description: 'Complete training path for new customer support specialists',
                modules: ['TM-001', 'TM-003', 'TM-004'],
                totalDuration: 135,
                completedModules: 2,
                progress: 67
            }
        ];

        return this.sendSuccess(res, {
            message: 'Training paths retrieved successfully',
            data: { paths }
        });
    });

    /**
     * Get user training progress
     */
    getUserTrainingProgress = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        // Mock data - replace with actual implementation
        const progress = {
            totalModules: 4,
            completedModules: 2,
            inProgressModules: 1,
            certificatesEarned: 2,
            totalHours: 3.5,
            currentStreak: 5
        };

        return this.sendSuccess(res, {
            message: 'User training progress retrieved successfully',
            data: progress
        });
    });

    // Reports
    /**
     * Get reports
     */
    getReports = asyncHandler(async (req: Request, res: Response) => {
        const { type } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        // Mock data - replace with actual implementation
        const reports = [
            {
                id: 'RPT-001',
                name: 'Weekly Performance Report',
                type: type,
                generatedAt: new Date().toISOString(),
                status: 'completed'
            }
        ];

        return this.sendSuccess(res, {
            message: 'Reports retrieved successfully',
            data: { reports }
        });
    });

    // Automation
    /**
     * Get automation rules
     */
    getAutomationRules = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        // Mock data - replace with actual implementation
        const rules = [
            {
                id: 'AR-001',
                name: 'Auto-assign high priority tickets',
                description: 'Automatically assign high priority tickets to senior staff',
                status: 'active',
                trigger: 'ticket_created',
                conditions: [{ field: 'priority', operator: 'equals', value: 'high' }],
                actions: [{ type: 'assign', value: 'senior_staff' }]
            }
        ];

        return this.sendSuccess(res, {
            message: 'Automation rules retrieved successfully',
            data: { rules }
        });
    });

    // Quality Assurance
    /**
     * Get quality metrics
     */
    getQualityMetrics = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        // Mock data - replace with actual implementation
        const metrics = {
            overallScore: 4.6,
            responseTime: 2.3,
            resolutionRate: 94.2,
            customerSatisfaction: 4.7,
            qualityChecks: 156,
            passedChecks: 148
        };

        return this.sendSuccess(res, {
            message: 'Quality metrics retrieved successfully',
            data: metrics
        });
    });

    /**
     * Get quality reviews
     */
    getQualityReviews = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        // Mock data - replace with actual implementation
        const reviews = [
            {
                id: 'QR-001',
                ticketId: 'TKT-101',
                reviewer: 'Quality Team',
                agent: 'John Doe',
                score: 4.5,
                status: 'passed',
                feedback: 'Excellent response time and resolution',
                reviewedAt: new Date().toISOString()
            },
            {
                id: 'QR-002',
                ticketId: 'TKT-102',
                reviewer: 'Quality Team',
                agent: 'Jane Smith',
                score: 3.2,
                status: 'needs-improvement',
                feedback: 'Response could be more detailed',
                reviewedAt: new Date().toISOString()
            },
            {
                id: 'QR-003',
                ticketId: 'TKT-103',
                reviewer: 'Quality Team',
                agent: 'Mike Johnson',
                score: 1.8,
                status: 'failed',
                feedback: 'Incorrect information provided to customer',
                reviewedAt: new Date().toISOString()
            }
        ];

        return this.sendSuccess(res, {
            message: 'Quality reviews retrieved successfully',
            data: { reviews }
        });
    });

    // Communication
    /**
     * Get announcements
     */
    getAnnouncements = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        // Mock data - replace with actual implementation
        const announcements = [
            {
                id: 'ANN-001',
                title: 'New Training Module Available',
                content: 'A new customer service training module has been added to the platform.',
                priority: 'medium',
                publishedAt: '2024-03-15T09:00:00Z',
                author: 'HR Team'
            }
        ];

        return this.sendSuccess(res, {
            message: 'Announcements retrieved successfully',
            data: { announcements }
        });
    });

    // ==================== COACH MANAGEMENT ====================

    /**
     * Get all coaches (filtered from staff)
     */
    getCoaches = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 20,
            status,
            locationId,
            searchText
        } = req.query;

        const filter = {
            staffType: 'coach',
            status: status || undefined,
            locationId: locationId || undefined,
            searchText: searchText || undefined
        };

        const coaches = await this.staffService.getStaffMembers(
            filter as any,
            Number(page),
            Number(limit)
        );

        return this.sendSuccess(res, {
            message: 'Coaches retrieved successfully',
            data: coaches
        });
    });

    /**
     * Create a new coach with both User account and Staff record
     * This creates:
     * 1. A User record (for login/auth) with role COACH
     * 2. A Staff record (for staff management) with staffType 'coach'
     */
    createCoachWithUser = asyncHandler(async (req: Request, res: Response) => {
        const adminUserId = req.user?.id;
        if (!adminUserId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            specializations,
            skills,
            experienceYears,
            locationId,
            organizationId,
            maxHoursPerWeek
        } = req.body;

        if (!firstName || !lastName || !email || !password) {
            throw new AppError('firstName, lastName, email, and password are required', HTTP_STATUS.BAD_REQUEST);
        }

        // Scope-based auto-assignment: enforce creator's scope on new coach
        let resolvedLocationId = locationId;
        let resolvedOrganizationId = organizationId;
        let resolvedRegionId: string | undefined;
        const requester = req.user!;

        switch (requester.role) {
            case UserRole.LOCATION_MANAGER:
                // Force assign to creator's location, organization and region
                resolvedLocationId = requester.locationId?.toString() || locationId;
                resolvedOrganizationId = requester.organizationId?.toString() || organizationId;
                resolvedRegionId = (requester as any).regionId?.toString();
                break;
            case UserRole.FRANCHISE_OWNER:
                // Force assign to creator's organization and region; location can be chosen
                resolvedOrganizationId = requester.organizationId?.toString() || organizationId;
                resolvedRegionId = (requester as any).regionId?.toString();
                if (!resolvedLocationId) {
                    resolvedLocationId = requester.locationId?.toString();
                }
                break;
            case UserRole.REGIONAL_ADMIN:
                // Force assign to creator's organization and region
                resolvedOrganizationId = requester.organizationId?.toString() || organizationId;
                resolvedRegionId = (requester as any).regionId?.toString();
                break;
            // ADMIN: use whatever was provided in the request
        }

        // Step 1: Create User account for login
        const user = await userService.createUser({
            email,
            password,
            firstName,
            lastName,
            phone,
            role: UserRole.COACH,
            locationId: resolvedLocationId,
            organizationId: resolvedOrganizationId,
            regionId: resolvedRegionId
        });

        // Mark as admin-created (skip email verification)
        await userService.updateUser(user._id.toString(), {
            metadata: { createdByAdmin: true }
        } as any);
        await userService.updateUserStatus(user._id.toString(), 'ACTIVE' as any);

        // Step 2: Create Staff record for management
        const staff = await this.staffService.createStaff({
            personalInfo: { firstName, lastName },
            contactInfo: { email, phone },
            staffType: 'coach',
            specializations: specializations || [],
            skills: skills || [],
            experienceYears: experienceYears || 0,
            locationIds: resolvedLocationId ? [resolvedLocationId] : [],
            primaryLocationId: resolvedLocationId,
            businessUnitId: resolvedOrganizationId,
            maxHoursPerWeek: maxHoursPerWeek || 40
        } as any, adminUserId);

        return this.sendSuccess(res, {
            message: 'Coach created successfully with login credentials',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                },
                staff
            }
        });
    });

    /**
     * Get coach statistics summary
     */
    getCoachStatistics = asyncHandler(async (req: Request, res: Response) => {
        const stats = await this.staffService.getStaffMembers(
            { staffType: 'coach' } as any, 1, 1000
        );

        const allCoaches = stats?.data || stats?.docs || [];
        const active = allCoaches.filter((c: any) => c.status === 'active');
        const onLeave = allCoaches.filter((c: any) => c.status === 'on_leave');

        return this.sendSuccess(res, {
            message: 'Coach statistics retrieved successfully',
            data: {
                totalCoaches: allCoaches.length,
                activeCoaches: active.length,
                onLeaveCoaches: onLeave.length,
                avgExperience: allCoaches.length > 0
                    ? Math.round(allCoaches.reduce((sum: number, c: any) => sum + (c.experienceYears || 0), 0) / allCoaches.length)
                    : 0
            }
        });
    });
}