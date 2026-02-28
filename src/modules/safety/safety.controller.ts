import { Request, Response } from 'express';
import { SafetyService, EmergencyService, EmergencyProtocolService, CrisisManagementService, IncidentReportService, EmergencyBroadcastService } from './safety.service';
import { BaseController } from '../../shared/base/base.controller';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';
import { successResponse } from '../../shared/utils/response.util';

export class SafetyController extends BaseController {
    private safetyService: SafetyService;
    private emergencyService: EmergencyService;
    private protocolService: EmergencyProtocolService;
    private crisisService: CrisisManagementService;
    private incidentService: IncidentReportService;
    private broadcastService: EmergencyBroadcastService;

    constructor() {
        super();
        this.safetyService = new SafetyService();
        this.emergencyService = new EmergencyService();
        this.protocolService = new EmergencyProtocolService();
        this.crisisService = new CrisisManagementService();
        this.incidentService = new IncidentReportService();
        this.broadcastService = new EmergencyBroadcastService();
    }

    /**
     * Create authorized guardian
     */
    createAuthorizedGuardian = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const guardian = await this.safetyService.createAuthorizedGuardian(req.body, userId);

        return successResponse(res, {
            message: 'Authorized guardian created successfully',
            data: guardian
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Get authorized guardians for a child
     */
    getAuthorizedGuardians = asyncHandler(async (req: Request, res: Response) => {
        const { childId } = req.params;
        const {
            page = 1,
            limit = 10,
            guardianType,
            isActive,
            isVerified
        } = req.query;

        const filter: any = { childId };

        if (guardianType) filter.guardianType = guardianType;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

        const guardians = await this.safetyService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { createdAt: -1 }
            }
        );

        return successResponse(res, {
            message: 'Authorized guardians retrieved successfully',
            data: guardians
        });
    });

    /**
     * Verify guardian identity
     */
    verifyGuardian = asyncHandler(async (req: Request, res: Response) => {
        const { guardianId } = req.params;
        const { verificationMethod, verificationData } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const guardian = await this.safetyService.verifyGuardian(
            guardianId,
            verificationMethod,
            verificationData,
            userId
        );

        return successResponse(res, {
            message: 'Guardian verified successfully',
            data: guardian
        });
    });

    /**
     * Process pickup request
     */
    processPickup = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const pickupRecord = await this.safetyService.processPickup(req.body, userId);

        return successResponse(res, {
            message: 'Pickup processed successfully',
            data: pickupRecord
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Get pickup records
     */
    getPickupRecords = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            childId,
            guardianId,
            locationId,
            status,
            isLate,
            isEmergencyPickup,
            startDate,
            endDate
        } = req.query;

        const filter: any = {};

        if (childId) filter.childId = childId;
        if (guardianId) filter.guardianId = guardianId;
        if (locationId) filter.locationId = locationId;
        if (status) filter.status = status;
        if (isLate !== undefined) filter.isLate = isLate === 'true';
        if (isEmergencyPickup !== undefined) filter.isEmergencyPickup = isEmergencyPickup === 'true';

        if (startDate || endDate) {
            filter.actualPickupTime = {};
            if (startDate) filter.actualPickupTime.$gte = new Date(startDate as string);
            if (endDate) filter.actualPickupTime.$lte = new Date(endDate as string);
        }

        const pickupRecords = await this.safetyService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { actualPickupTime: -1 },
                populate: [
                    { path: 'locationId', select: 'name address' }
                ]
            }
        );

        return successResponse(res, {
            message: 'Pickup records retrieved successfully',
            data: pickupRecords
        });
    });

    /**
     * Create restriction order
     */
    createRestrictionOrder = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const restriction = await this.safetyService.createRestrictionOrder(req.body, userId);

        return successResponse(res, {
            message: 'Restriction order created successfully',
            data: restriction
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Get restriction orders
     */
    getRestrictionOrders = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            childId,
            restrictionType,
            severity,
            isActive
        } = req.query;

        const filter: any = {};

        if (childId) filter.childId = childId;
        if (restrictionType) filter.restrictionType = restrictionType;
        if (severity) filter.severity = severity;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const restrictions = await this.safetyService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { effectiveDate: -1 }
            }
        );

        return successResponse(res, {
            message: 'Restriction orders retrieved successfully',
            data: restrictions
        });
    });

    /**
     * Update restriction order status
     */
    updateRestrictionStatus = asyncHandler(async (req: Request, res: Response) => {
        const { restrictionId } = req.params;
        const { isActive } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const restriction = await this.safetyService.findOneAndUpdate(
            { restrictionId },
            { isActive, updatedBy: userId },
            { new: true }
        );

        if (!restriction) {
            throw new AppError('Restriction order not found', HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(res, {
            message: 'Restriction order status updated successfully',
            data: restriction
        });
    });

    /**
     * Create emergency incident
     */
    createEmergencyIncident = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const incident = await this.emergencyService.createEmergencyIncident(req.body, userId);

        return successResponse(res, {
            message: 'Emergency incident created successfully',
            data: incident
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Get emergency incidents
     */
    getEmergencyIncidents = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            emergencyType,
            status,
            severity,
            locationId,
            startDate,
            endDate
        } = req.query;

        const filter: any = {};

        if (emergencyType) filter.emergencyType = emergencyType;
        if (status) filter.status = status;
        if (severity) filter.severity = severity;
        if (locationId) filter.locationId = locationId;

        if (startDate || endDate) {
            filter.occurredAt = {};
            if (startDate) filter.occurredAt.$gte = new Date(startDate as string);
            if (endDate) filter.occurredAt.$lte = new Date(endDate as string);
        }

        const incidents = await this.emergencyService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { occurredAt: -1 },
                populate: [
                    { path: 'locationId', select: 'name address' },
                    { path: 'reportedBy', select: 'firstName lastName' }
                ]
            }
        );

        return successResponse(res, {
            message: 'Emergency incidents retrieved successfully',
            data: incidents
        });
    });

    /**
     * Update incident status
     */
    updateIncidentStatus = asyncHandler(async (req: Request, res: Response) => {
        const { incidentId } = req.params;
        const { status, resolutionSummary } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const incident = await this.emergencyService.updateIncidentStatus(
            incidentId,
            status,
            userId,
            resolutionSummary
        );

        return successResponse(res, {
            message: 'Incident status updated successfully',
            data: incident
        });
    });

    /**
     * Add incident follow-up action
     */
    addIncidentFollowUp = asyncHandler(async (req: Request, res: Response) => {
        const { incidentId } = req.params;
        const { action, assignedTo, dueDate } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const incident = await this.emergencyService.findOne({ incidentId });
        if (!incident) {
            throw new AppError('Incident not found', HTTP_STATUS.NOT_FOUND);
        }

        incident.followUpActions.push({
            action,
            assignedTo,
            dueDate: new Date(dueDate),
            status: 'pending'
        });

        incident.followUpRequired = true;
        incident.updatedBy = userId;
        await incident.save();

        return successResponse(res, {
            message: 'Follow-up action added successfully',
            data: incident
        });
    });

    /**
     * Create emergency protocol
     */
    createEmergencyProtocol = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const protocol = await this.protocolService.createEmergencyProtocol(req.body, userId);

        return successResponse(res, {
            message: 'Emergency protocol created successfully',
            data: protocol
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Get emergency protocols
     */
    getEmergencyProtocols = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            emergencyType,
            severity,
            isActive,
            locationId
        } = req.query;

        const filter: any = {};

        if (emergencyType) filter.emergencyType = emergencyType;
        if (severity) filter.severity = severity;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (locationId) filter.locationIds = { $in: [locationId] };

        const protocols = await this.protocolService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { createdAt: -1 },
                populate: [
                    { path: 'locationIds', select: 'name address' }
                ]
            }
        );

        return successResponse(res, {
            message: 'Emergency protocols retrieved successfully',
            data: protocols
        });
    });

    /**
     * Get safety statistics
     */
    getSafetyStatistics = asyncHandler(async (req: Request, res: Response) => {
        const { businessUnitId, startDate, endDate } = req.query;

        const statistics = await this.safetyService.getSafetyStatistics(
            businessUnitId as string,
            startDate ? new Date(startDate as string) : undefined,
            endDate ? new Date(endDate as string) : undefined
        );

        return successResponse(res, {
            message: 'Safety statistics retrieved successfully',
            data: statistics
        });
    });

    /**
     * Check child pickup authorization
     */
    checkPickupAuthorization = asyncHandler(async (req: Request, res: Response) => {
        const { childId, guardianId } = req.params;

        const guardian = await this.safetyService.findOne({
            guardianId,
            childId,
            isActive: true,
            isBlocked: false
        });

        if (!guardian) {
            return successResponse(res, {
                message: 'Guardian not authorized',
                data: {
                    authorized: false,
                    reason: 'Guardian not found or blocked'
                }
            });
        }

        if (!guardian.canPickup) {
            return successResponse(res, {
                message: 'Guardian not authorized for pickup',
                data: {
                    authorized: false,
                    reason: 'Pickup permission not granted'
                }
            });
        }

        // Check for active restrictions
        const activeRestrictions = await this.safetyService.find({
            childId,
            isActive: true,
            effectiveDate: { $lte: new Date() },
            $or: [
                { expiryDate: { $exists: false } },
                { expiryDate: { $gte: new Date() } }
            ]
        });

        if (activeRestrictions.length > 0) {
            return successResponse(res, {
                message: 'Pickup restricted',
                data: {
                    authorized: false,
                    reason: 'Active restriction order in place',
                    restrictions: activeRestrictions
                }
            });
        }

        return successResponse(res, {
            message: 'Guardian authorized for pickup',
            data: {
                authorized: true,
                guardian: {
                    guardianId: guardian.guardianId,
                    name: `${guardian.firstName} ${guardian.lastName}`,
                    relationship: guardian.relationship,
                    isVerified: guardian.isVerified,
                    verificationMethods: guardian.verificationMethod
                }
            }
        });
    });

    /**
     * Generate pickup verification code
     */
    generatePickupCode = asyncHandler(async (req: Request, res: Response) => {
        const { childId, guardianId } = req.body;

        // Generate temporary pickup code
        const pickupCode = Math.random().toString(36).substr(2, 8).toUpperCase();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Store code temporarily (in production, use Redis or similar)
        // For now, return the code directly

        return successResponse(res, {
            message: 'Pickup verification code generated',
            data: {
                pickupCode,
                expiresAt,
                childId,
                guardianId
            }
        });
    });

    /**
     * Validate pickup verification code
     */
    validatePickupCode = asyncHandler(async (req: Request, res: Response) => {
        const { pickupCode, childId, guardianId } = req.body;

        // In production, validate against stored codes
        // For now, accept any 8-character code
        if (!pickupCode || pickupCode.length !== 8) {
            throw new AppError('Invalid pickup code', HTTP_STATUS.BAD_REQUEST);
        }

        return successResponse(res, {
            message: 'Pickup code validated successfully',
            data: {
                valid: true,
                childId,
                guardianId,
                validatedAt: new Date()
            }
        });
    });

    // Crisis Management Methods

    /**
     * Activate crisis mode
     */
    activateCrisisMode = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const crisis = await this.crisisService.activateCrisisMode(req.body, userId);

        return successResponse(res, {
            message: 'Crisis mode activated successfully',
            data: crisis
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Get active crises
     */
    getActiveCrises = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            crisisType,
            crisisLevel,
            status,
            locationId
        } = req.query;

        const filter: any = {};

        if (crisisType) filter.crisisType = crisisType;
        if (crisisLevel) filter.crisisLevel = crisisLevel;
        if (status) filter.status = status;
        if (locationId) filter.locationId = locationId;

        const crises = await this.crisisService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { triggeredAt: -1 },
                populate: [
                    { path: 'locationId', select: 'name address' },
                    { path: 'triggeredBy', select: 'firstName lastName' }
                ]
            }
        );

        return successResponse(res, {
            message: 'Active crises retrieved successfully',
            data: crises
        });
    });

    /**
     * Update crisis status
     */
    updateCrisisStatus = asyncHandler(async (req: Request, res: Response) => {
        const { crisisId } = req.params;
        const { status, resolutionSummary } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const crisis = await this.crisisService.updateCrisisStatus(
            crisisId,
            status,
            userId,
            resolutionSummary
        );

        return successResponse(res, {
            message: 'Crisis status updated successfully',
            data: crisis
        });
    });

    /**
     * Add response team member
     */
    addResponseTeamMember = asyncHandler(async (req: Request, res: Response) => {
        const { crisisId } = req.params;
        const { memberId, role } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const crisis = await this.crisisService.addResponseTeamMember(
            crisisId,
            memberId,
            role,
            userId
        );

        return successResponse(res, {
            message: 'Response team member added successfully',
            data: crisis
        });
    });

    /**
     * Create incident report
     */
    createIncidentReport = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const report = await this.incidentService.createIncidentReport(req.body, userId);

        return successResponse(res, {
            message: 'Incident report created successfully',
            data: report
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Get incident reports
     */
    getIncidentReports = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            incidentType,
            severity,
            status,
            locationId,
            startDate,
            endDate
        } = req.query;

        const filter: any = {};

        if (incidentType) filter.incidentType = incidentType;
        if (severity) filter.severity = severity;
        if (status) filter.status = status;
        if (locationId) filter.locationId = locationId;

        if (startDate || endDate) {
            filter.occurredAt = {};
            if (startDate) filter.occurredAt.$gte = new Date(startDate as string);
            if (endDate) filter.occurredAt.$lte = new Date(endDate as string);
        }

        const reports = await this.incidentService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { occurredAt: -1 },
                populate: [
                    { path: 'locationId', select: 'name address' },
                    { path: 'reportedBy', select: 'firstName lastName' }
                ]
            }
        );

        return successResponse(res, {
            message: 'Incident reports retrieved successfully',
            data: reports
        });
    });

    /**
     * Submit incident report
     */
    submitIncidentReport = asyncHandler(async (req: Request, res: Response) => {
        const { reportId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const report = await this.incidentService.submitIncidentReport(reportId, userId);

        return successResponse(res, {
            message: 'Incident report submitted successfully',
            data: report
        });
    });

    /**
     * Review incident report
     */
    reviewIncidentReport = asyncHandler(async (req: Request, res: Response) => {
        const { reportId } = req.params;
        const { approved, reviewComments } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const report = await this.incidentService.reviewIncidentReport(
            reportId,
            userId,
            approved,
            reviewComments
        );

        return successResponse(res, {
            message: 'Incident report reviewed successfully',
            data: report
        });
    });

    /**
     * Create emergency broadcast
     */
    createEmergencyBroadcast = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
        }

        const broadcast = await this.broadcastService.createEmergencyBroadcast(req.body, userId);

        return successResponse(res, {
            message: 'Emergency broadcast created successfully',
            data: broadcast
        }, HTTP_STATUS.CREATED);
    });

    /**
     * Send emergency broadcast
     */
    sendEmergencyBroadcast = asyncHandler(async (req: Request, res: Response) => {
        const { broadcastId } = req.params;

        const broadcast = await this.broadcastService.findOne({ broadcastId });
        if (!broadcast) {
            throw new AppError('Broadcast not found', HTTP_STATUS.NOT_FOUND);
        }

        const sentBroadcast = await this.broadcastService.sendBroadcast(broadcast);

        return successResponse(res, {
            message: 'Emergency broadcast sent successfully',
            data: sentBroadcast
        });
    });

    /**
     * Get broadcast status
     */
    getBroadcastStatus = asyncHandler(async (req: Request, res: Response) => {
        const { broadcastId } = req.params;

        const status = await this.broadcastService.getBroadcastStatus(broadcastId);

        return successResponse(res, {
            message: 'Broadcast status retrieved successfully',
            data: status
        });
    });

    /**
     * Get emergency broadcasts
     */
    getEmergencyBroadcasts = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            broadcastType,
            priority,
            status,
            crisisId,
            incidentId
        } = req.query;

        const filter: any = {};

        if (broadcastType) filter.broadcastType = broadcastType;
        if (priority) filter.priority = priority;
        if (status) filter.status = status;
        if (crisisId) filter.crisisId = crisisId;
        if (incidentId) filter.incidentId = incidentId;

        const broadcasts = await this.broadcastService.findWithPagination(
            filter,
            {
                page: Number(page),
                limit: Number(limit),
                sort: { sentAt: -1 },
                populate: [
                    { path: 'sentBy', select: 'firstName lastName' }
                ]
            }
        );

        return successResponse(res, {
            message: 'Emergency broadcasts retrieved successfully',
            data: broadcasts
        });
    });
}