import { FilterQuery } from 'mongoose';
import {
    AuthorizedGuardian,
    PickupRecord,
    RestrictionOrder,
    EmergencyProtocol,
    EmergencyIncident,
    CrisisMode,
    IncidentReport,
    EmergencyBroadcast
} from './safety.model';
import {
    IAuthorizedGuardian,
    IPickupRecord,
    IRestrictionOrder,
    IEmergencyProtocol,
    IEmergencyIncident,
    ICrisisMode,
    IIncidentReport,
    IEmergencyBroadcast,
    ICreateGuardianRequest,
    IPickupRequest,
    IRestrictionOrderRequest,
    IEmergencyIncidentRequest,
    ICrisisModeRequest,
    IIncidentReportRequest,
    IEmergencyBroadcastRequest,
    ISafetyStatistics,
    GuardianType,
    PickupStatus,
    RestrictionSeverity,
    EmergencyStatus,
    VerificationMethod,
    CrisisLevel,
    CrisisType,
    BroadcastType,
    IncidentSeverity
} from './safety.interface';
import { BaseService } from '../../shared/base/base.service';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class SafetyService extends BaseService<IAuthorizedGuardian> {
    constructor() {
        super(AuthorizedGuardian);
    }

    /**
     * Create authorized guardian
     */
    async createAuthorizedGuardian(guardianRequest: ICreateGuardianRequest, createdBy: string): Promise<IAuthorizedGuardian> {
        try {
            // Check if guardian already exists for this child
            const existingGuardian = await AuthorizedGuardian.findOne({
                childId: guardianRequest.childId,
                phone: guardianRequest.phone,
                isActive: true
            });

            if (existingGuardian) {
                throw new AppError('Guardian already exists for this child', HTTP_STATUS.CONFLICT);
            }

            const guardianId = this.generateGuardianId();

            const guardian = new AuthorizedGuardian({
                guardianId,
                childId: guardianRequest.childId,
                guardianType: guardianRequest.guardianType,
                firstName: guardianRequest.firstName,
                lastName: guardianRequest.lastName,
                relationship: guardianRequest.relationship,
                phone: guardianRequest.phone,
                email: guardianRequest.email,
                idType: guardianRequest.idType,
                idNumber: guardianRequest.idNumber,
                canPickup: guardianRequest.canPickup,
                canDropOff: guardianRequest.canDropOff,
                isEmergencyContact: guardianRequest.isEmergencyContact || false,
                businessUnitId: await this.getBusinessUnitId(guardianRequest.childId),
                createdBy,
                updatedBy: createdBy
            });

            await guardian.save();
            return guardian;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create authorized guardian',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Verify guardian identity
     */
    async verifyGuardian(
        guardianId: string,
        verificationMethod: VerificationMethod,
        verificationData: any,
        verifiedBy: string
    ): Promise<IAuthorizedGuardian> {
        try {
            const guardian = await AuthorizedGuardian.findOne({ guardianId });
            if (!guardian) {
                throw new AppError('Guardian not found', HTTP_STATUS.NOT_FOUND);
            }

            // Perform verification based on method
            const isVerified = await this.performVerification(guardian, verificationMethod, verificationData);

            if (!isVerified) {
                throw new AppError('Verification failed', HTTP_STATUS.BAD_REQUEST);
            }

            // Update guardian verification status
            guardian.isVerified = true;
            guardian.verificationMethod.push(verificationMethod);
            guardian.verificationDate = new Date();
            guardian.verifiedBy = verifiedBy;
            guardian.updatedBy = verifiedBy;

            // Store verification data
            switch (verificationMethod) {
                case VerificationMethod.PHOTO_ID:
                    guardian.idPhotoUrl = verificationData.photoUrl;
                    break;
                case VerificationMethod.BIOMETRIC:
                    guardian.biometricData = verificationData.biometricHash;
                    break;
                case VerificationMethod.PIN_CODE:
                    guardian.pinCode = verificationData.pinCode;
                    break;
                case VerificationMethod.SIGNATURE:
                    guardian.signatureUrl = verificationData.signatureUrl;
                    break;
            }

            await guardian.save();
            return guardian;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to verify guardian',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Process pickup request
     */
    async processPickup(pickupRequest: IPickupRequest, processedBy: string): Promise<IPickupRecord> {
        try {
            // Validate guardian authorization
            const guardian = await AuthorizedGuardian.findOne({
                guardianId: pickupRequest.guardianId,
                isActive: true,
                isBlocked: false
            });

            if (!guardian) {
                throw new AppError('Guardian not found or blocked', HTTP_STATUS.NOT_FOUND);
            }

            if (!guardian.canPickup) {
                throw new AppError('Guardian not authorized for pickup', HTTP_STATUS.FORBIDDEN);
            }

            // Check for active restrictions
            await this.checkRestrictions(pickupRequest.childId, guardian);

            // Verify guardian identity
            const verificationResult = await this.verifyPickupIdentity(guardian, pickupRequest);
            if (!verificationResult.success) {
                throw new AppError(verificationResult.message, HTTP_STATUS.BAD_REQUEST);
            }

            // Check if child is currently checked in
            const isChildPresent = await this.isChildPresent(pickupRequest.childId);
            if (!isChildPresent) {
                throw new AppError('Child is not currently checked in', HTTP_STATUS.BAD_REQUEST);
            }

            const pickupId = this.generatePickupId();

            const pickupRecord = new PickupRecord({
                pickupId,
                childId: pickupRequest.childId,
                childName: await this.getChildName(pickupRequest.childId),
                guardianId: pickupRequest.guardianId,
                guardianName: `${guardian.firstName} ${guardian.lastName}`,
                guardianType: guardian.guardianType,
                actualPickupTime: new Date(),
                status: PickupStatus.COMPLETED,
                locationId: await this.getCurrentLocation(pickupRequest.childId),
                verificationMethod: pickupRequest.verificationMethod,
                verificationData: verificationResult.data,
                authorizedBy: processedBy,
                authorizedByName: await this.getStaffName(processedBy),
                isEmergencyPickup: pickupRequest.isEmergencyPickup || false,
                emergencyReason: pickupRequest.emergencyReason,
                specialInstructions: pickupRequest.specialInstructions,
                businessUnitId: guardian.businessUnitId,
                createdBy: processedBy,
                updatedBy: processedBy
            });

            // Check if pickup is late
            const lateStatus = await this.calculateLateStatus(pickupRequest.childId);
            pickupRecord.isLate = lateStatus.isLate;
            pickupRecord.lateMinutes = lateStatus.lateMinutes;

            await pickupRecord.save();

            // Update child attendance status
            await this.updateChildAttendanceStatus(pickupRequest.childId, 'picked_up');

            // Send notifications
            await this.sendPickupNotifications(pickupRecord);

            return pickupRecord;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to process pickup',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Create restriction order
     */
    async createRestrictionOrder(restrictionRequest: IRestrictionOrderRequest, createdBy: string): Promise<IRestrictionOrder> {
        try {
            const restrictionId = this.generateRestrictionId();

            const restriction = new RestrictionOrder({
                restrictionId,
                childId: restrictionRequest.childId,
                childName: await this.getChildName(restrictionRequest.childId),
                restrictionType: restrictionRequest.restrictionType,
                severity: restrictionRequest.severity,
                title: restrictionRequest.title,
                description: restrictionRequest.description,
                restrictedPersonName: restrictionRequest.restrictedPersonName,
                restrictedPersonDetails: restrictionRequest.restrictedPersonDetails,
                restrictionScope: restrictionRequest.restrictionScope,
                effectiveDate: restrictionRequest.effectiveDate,
                expiryDate: restrictionRequest.expiryDate,
                enforcementInstructions: restrictionRequest.enforcementInstructions,
                escalationProcedure: 'Contact management immediately and notify security',
                policeContactRequired: restrictionRequest.severity === RestrictionSeverity.CRITICAL,
                alertStaff: true,
                alertSecurity: true,
                alertManagement: true,
                businessUnitId: await this.getBusinessUnitId(restrictionRequest.childId),
                locationIds: await this.getChildLocationIds(restrictionRequest.childId),
                createdBy,
                updatedBy: createdBy
            });

            await restriction.save();

            // Send alerts to staff
            await this.sendRestrictionAlerts(restriction);

            return restriction;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create restriction order',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get safety statistics
     */
    async getSafetyStatistics(businessUnitId?: string, startDate?: Date, endDate?: Date): Promise<ISafetyStatistics> {
        try {
            const matchStage: any = {};
            if (businessUnitId) {
                matchStage.businessUnitId = businessUnitId;
            }

            const dateFilter: any = {};
            if (startDate || endDate) {
                if (startDate) dateFilter.$gte = startDate;
                if (endDate) dateFilter.$lte = endDate;
            }

            // Guardian statistics
            const guardianStats = await AuthorizedGuardian.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalGuardians: { $sum: 1 },
                        activeGuardians: { $sum: { $cond: ['$isActive', 1, 0] } },
                        verifiedGuardians: { $sum: { $cond: ['$isVerified', 1, 0] } }
                    }
                }
            ]);

            // Pickup statistics
            const pickupMatchStage = { ...matchStage };
            if (Object.keys(dateFilter).length > 0) {
                pickupMatchStage.actualPickupTime = dateFilter;
            }

            const pickupStats = await PickupRecord.aggregate([
                { $match: pickupMatchStage },
                {
                    $group: {
                        _id: null,
                        totalPickups: { $sum: 1 },
                        latePickups: { $sum: { $cond: ['$isLate', 1, 0] } },
                        emergencyPickups: { $sum: { $cond: ['$isEmergencyPickup', 1, 0] } }
                    }
                }
            ]);

            // Restriction statistics
            const restrictionStats = await RestrictionOrder.aggregate([
                { $match: { ...matchStage, isActive: true } },
                {
                    $group: {
                        _id: null,
                        activeRestrictions: { $sum: 1 }
                    }
                }
            ]);

            // Incident statistics
            const incidentMatchStage = { ...matchStage };
            if (Object.keys(dateFilter).length > 0) {
                incidentMatchStage.occurredAt = dateFilter;
            }

            const incidentStats = await EmergencyIncident.aggregate([
                { $match: incidentMatchStage },
                {
                    $group: {
                        _id: null,
                        totalIncidents: { $sum: 1 },
                        openIncidents: { $sum: { $cond: [{ $eq: ['$status', EmergencyStatus.ACTIVE] }, 1, 0] } },
                        averageResponseTime: { $avg: { $subtract: ['$reportedAt', '$occurredAt'] } }
                    }
                }
            ]);

            const guardianResult = guardianStats[0] || {};
            const pickupResult = pickupStats[0] || {};
            const restrictionResult = restrictionStats[0] || {};
            const incidentResult = incidentStats[0] || {};

            const totalPickups = pickupResult.totalPickups || 0;
            const latePickups = pickupResult.latePickups || 0;

            return {
                totalGuardians: guardianResult.totalGuardians || 0,
                activeGuardians: guardianResult.activeGuardians || 0,
                verifiedGuardians: guardianResult.verifiedGuardians || 0,
                totalPickups,
                latePickups,
                emergencyPickups: pickupResult.emergencyPickups || 0,
                activeRestrictions: restrictionResult.activeRestrictions || 0,
                totalIncidents: incidentResult.totalIncidents || 0,
                openIncidents: incidentResult.openIncidents || 0,
                averageResponseTime: incidentResult.averageResponseTime || 0,
                complianceRate: totalPickups > 0 ? ((totalPickups - latePickups) / totalPickups) * 100 : 100,
                pickupTrends: [], // Would need additional aggregation
                locationStats: [] // Would need additional aggregation
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get safety statistics',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Private helper methods

    private async performVerification(
        guardian: IAuthorizedGuardian,
        method: VerificationMethod,
        data: any
    ): Promise<boolean> {
        switch (method) {
            case VerificationMethod.PHOTO_ID:
                return this.verifyPhotoId(guardian, data);
            case VerificationMethod.BIOMETRIC:
                return this.verifyBiometric(guardian, data);
            case VerificationMethod.PIN_CODE:
                return this.verifyPinCode(guardian, data);
            case VerificationMethod.FACIAL_RECOGNITION:
                return this.verifyFacialRecognition(guardian, data);
            case VerificationMethod.SIGNATURE:
                return this.verifySignature(guardian, data);
            case VerificationMethod.PHONE_VERIFICATION:
                return this.verifyPhone(guardian, data);
            default:
                return false;
        }
    }

    private async verifyPhotoId(guardian: IAuthorizedGuardian, data: any): Promise<boolean> {
        // Implementation for photo ID verification
        return data.idNumber === guardian.idNumber;
    }

    private async verifyBiometric(guardian: IAuthorizedGuardian, data: any): Promise<boolean> {
        // Implementation for biometric verification
        return guardian.biometricData === data.biometricHash;
    }

    private async verifyPinCode(guardian: IAuthorizedGuardian, data: any): Promise<boolean> {
        // Implementation for PIN code verification
        return guardian.pinCode === data.pinCode;
    }

    private async verifyFacialRecognition(guardian: IAuthorizedGuardian, data: any): Promise<boolean> {
        // Implementation for facial recognition
        return true; // Placeholder
    }

    private async verifySignature(guardian: IAuthorizedGuardian, data: any): Promise<boolean> {
        // Implementation for signature verification
        return true; // Placeholder
    }

    private async verifyPhone(guardian: IAuthorizedGuardian, data: any): Promise<boolean> {
        // Implementation for phone verification
        return guardian.phone === data.phoneNumber;
    }

    private async checkRestrictions(childId: string, guardian: IAuthorizedGuardian): Promise<void> {
        const activeRestrictions = await RestrictionOrder.find({
            childId,
            isActive: true,
            effectiveDate: { $lte: new Date() },
            $or: [
                { expiryDate: { $exists: false } },
                { expiryDate: { $gte: new Date() } }
            ]
        });

        for (const restriction of activeRestrictions) {
            if (restriction.restrictedPersonName.toLowerCase().includes(guardian.firstName.toLowerCase()) ||
                restriction.restrictedPersonName.toLowerCase().includes(guardian.lastName.toLowerCase())) {
                throw new AppError(
                    `Pickup denied: Active restriction order in place. Contact management immediately.`,
                    HTTP_STATUS.FORBIDDEN
                );
            }
        }
    }

    private async verifyPickupIdentity(guardian: IAuthorizedGuardian, request: IPickupRequest): Promise<any> {
        if (!guardian.isVerified) {
            return { success: false, message: 'Guardian identity not verified' };
        }

        // Perform additional verification based on request method
        const isValid = await this.performVerification(guardian, request.verificationMethod, request.verificationData);

        return {
            success: isValid,
            message: isValid ? 'Verification successful' : 'Verification failed',
            data: {
                idVerified: isValid,
                photoTaken: !!request.verificationData?.photoUrl,
                signatureRequired: request.verificationMethod === VerificationMethod.SIGNATURE,
                biometricVerified: request.verificationMethod === VerificationMethod.BIOMETRIC && isValid,
                pinVerified: request.verificationMethod === VerificationMethod.PIN_CODE && isValid
            }
        };
    }

    private async isChildPresent(childId: string): Promise<boolean> {
        // Implementation to check if child is currently checked in
        // Would integrate with attendance service
        return true; // Placeholder
    }

    private async calculateLateStatus(childId: string): Promise<{ isLate: boolean; lateMinutes?: number }> {
        // Implementation to calculate if pickup is late
        // Would check against scheduled pickup time
        return { isLate: false };
    }

    private async updateChildAttendanceStatus(childId: string, status: string): Promise<void> {
        // Implementation to update child's attendance status
        // Would integrate with attendance service
    }

    private async sendPickupNotifications(pickupRecord: IPickupRecord): Promise<void> {
        // Implementation to send pickup notifications
        // Would integrate with notification service
    }

    private async sendRestrictionAlerts(restriction: IRestrictionOrder): Promise<void> {
        // Implementation to send restriction alerts
        // Would integrate with notification service
    }

    private async getChildName(childId: string): Promise<string> {
        // Implementation to get child name
        return `Child ${childId}`;
    }

    private async getStaffName(staffId: string): Promise<string> {
        // Implementation to get staff name
        return `Staff ${staffId}`;
    }

    private async getCurrentLocation(childId: string): Promise<string> {
        // Implementation to get child's current location
        return 'location_id'; // Placeholder
    }

    private async getBusinessUnitId(childId: string): Promise<string> {
        // Implementation to get business unit ID
        return 'business_unit_id'; // Placeholder
    }

    private async getChildLocationIds(childId: string): Promise<string[]> {
        // Implementation to get child's location IDs
        return ['location_id']; // Placeholder
    }

    private generateGuardianId(): string {
        return `guard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generatePickupId(): string {
        return `pickup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateRestrictionId(): string {
        return `restrict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async findOneAndUpdate(filter: any, update: any, options?: any): Promise<any> {
        return (this.model as any).findOneAndUpdate(filter, update, options);
    }

    async find(filter: any = {}): Promise<any[]> {
        return (this.model as any).find(filter);
    }
}

export class EmergencyService extends BaseService<IEmergencyIncident> {
    constructor() {
        super(EmergencyIncident);
    }

    /**
     * Create emergency incident
     */
    async createEmergencyIncident(incidentRequest: IEmergencyIncidentRequest, reportedBy: string): Promise<IEmergencyIncident> {
        try {
            const incidentId = this.generateIncidentId();

            const incident = new EmergencyIncident({
                incidentId,
                emergencyType: incidentRequest.emergencyType,
                severity: incidentRequest.severity,
                title: incidentRequest.title,
                description: incidentRequest.description,
                occurredAt: new Date(),
                reportedAt: new Date(),
                reportedBy,
                reporterName: await this.getReporterName(reportedBy),
                locationId: incidentRequest.locationId,
                specificLocation: incidentRequest.specificLocation,
                childrenInvolved: incidentRequest.childrenInvolved || [],
                staffInvolved: incidentRequest.staffInvolved || [],
                immediateActions: incidentRequest.immediateActions || [],
                businessUnitId: await this.getBusinessUnitId(incidentRequest.locationId),
                createdBy: reportedBy,
                updatedBy: reportedBy
            });

            await incident.save();

            // Trigger emergency protocol
            await this.triggerEmergencyProtocol(incident);

            // Send immediate notifications
            await this.sendEmergencyNotifications(incident);

            return incident;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create emergency incident',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update incident status
     */
    async updateIncidentStatus(
        incidentId: string,
        status: EmergencyStatus,
        updatedBy: string,
        resolutionSummary?: string
    ): Promise<IEmergencyIncident> {
        try {
            const incident = await EmergencyIncident.findOne({ incidentId });
            if (!incident) {
                throw new AppError('Incident not found', HTTP_STATUS.NOT_FOUND);
            }

            incident.status = status;
            incident.updatedBy = updatedBy;

            if (status === EmergencyStatus.RESOLVED) {
                incident.resolvedAt = new Date();
                incident.resolvedBy = updatedBy;
                incident.resolutionSummary = resolutionSummary;
            }

            await incident.save();

            // Send status update notifications
            await this.sendStatusUpdateNotifications(incident);

            return incident;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update incident status',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Private helper methods

    private async triggerEmergencyProtocol(incident: IEmergencyIncident): Promise<void> {
        // Find applicable emergency protocol
        const protocol = await EmergencyProtocol.findOne({
            emergencyType: incident.emergencyType,
            isActive: true,
            locationIds: { $in: [incident.locationId] }
        });

        if (protocol) {
            // Execute immediate actions
            for (const action of protocol.immediateActions) {
                await this.executeEmergencyAction(action, incident);
            }

            // Send notifications according to protocol
            for (const notification of protocol.notificationSequence) {
                await this.sendProtocolNotification(notification, incident);
            }
        }
    }

    private async executeEmergencyAction(action: any, incident: IEmergencyIncident): Promise<void> {
        // Implementation for executing emergency actions
        // Would integrate with various services based on action type
    }

    private async sendProtocolNotification(notification: any, incident: IEmergencyIncident): Promise<void> {
        // Implementation for sending protocol notifications
        // Would integrate with notification service
    }

    private async sendEmergencyNotifications(incident: IEmergencyIncident): Promise<void> {
        // Implementation for sending emergency notifications
        // Would integrate with notification service
    }

    private async sendStatusUpdateNotifications(incident: IEmergencyIncident): Promise<void> {
        // Implementation for sending status update notifications
        // Would integrate with notification service
    }

    private async getReporterName(reporterId: string): Promise<string> {
        // Implementation to get reporter name
        return `Reporter ${reporterId}`;
    }

    private async getBusinessUnitId(locationId: string): Promise<string> {
        // Implementation to get business unit ID from location
        return 'business_unit_id'; // Placeholder
    }

    private generateIncidentId(): string {
        return `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

export class EmergencyProtocolService extends BaseService<IEmergencyProtocol> {
    constructor() {
        super(EmergencyProtocol);
    }

    /**
     * Create emergency protocol
     */
    async createEmergencyProtocol(protocolData: any, createdBy: string): Promise<IEmergencyProtocol> {
        try {
            const protocolId = this.generateProtocolId();

            const protocol = new EmergencyProtocol({
                protocolId,
                ...protocolData,
                createdBy,
                updatedBy: createdBy
            });

            await protocol.save();
            return protocol;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create emergency protocol',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    private generateProtocolId(): string {
        return `protocol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Crisis Management Services

export class CrisisManagementService extends BaseService<ICrisisMode> {
    constructor() {
        super(CrisisMode);
    }

    /**
     * Activate crisis mode
     */
    async activateCrisisMode(crisisRequest: ICrisisModeRequest, triggeredBy: string): Promise<ICrisisMode> {
        try {
            const crisisId = this.generateCrisisId();

            const crisis = new CrisisMode({
                crisisId,
                crisisType: crisisRequest.crisisType,
                crisisLevel: crisisRequest.crisisLevel,
                title: crisisRequest.title,
                description: crisisRequest.description,
                triggeredAt: new Date(),
                triggeredBy,
                triggeredByName: await this.getStaffName(triggeredBy),
                locationId: crisisRequest.locationId,
                affectedAreas: crisisRequest.affectedAreas || [],
                evacuationRequired: crisisRequest.evacuationRequired || false,
                lockdownRequired: crisisRequest.lockdownRequired || false,
                incidentCommander: triggeredBy,
                responseTeam: crisisRequest.responseTeam || [],
                businessUnitId: await this.getBusinessUnitId(crisisRequest.locationId),
                createdBy: triggeredBy,
                updatedBy: triggeredBy
            });

            await crisis.save();

            // Trigger automatic protocols based on crisis type and level
            await this.triggerCrisisProtocols(crisis);

            // Send immediate alerts
            await this.sendCrisisAlerts(crisis);

            return crisis;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to activate crisis mode',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update crisis status
     */
    async updateCrisisStatus(
        crisisId: string,
        status: EmergencyStatus,
        updatedBy: string,
        resolutionSummary?: string
    ): Promise<ICrisisMode> {
        try {
            const crisis = await CrisisMode.findOne({ crisisId });
            if (!crisis) {
                throw new AppError('Crisis not found', HTTP_STATUS.NOT_FOUND);
            }

            crisis.status = status;
            crisis.updatedBy = updatedBy;

            if (status === EmergencyStatus.RESOLVED) {
                crisis.resolvedAt = new Date();
                crisis.resolvedBy = updatedBy;
                crisis.resolutionSummary = resolutionSummary;
            }

            await crisis.save();

            // Send status update notifications
            await this.sendCrisisStatusUpdate(crisis);

            return crisis;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update crisis status',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Add response team member
     */
    async addResponseTeamMember(
        crisisId: string,
        memberId: string,
        role: string,
        assignedBy: string
    ): Promise<ICrisisMode> {
        try {
            const crisis = await CrisisMode.findOne({ crisisId });
            if (!crisis) {
                throw new AppError('Crisis not found', HTTP_STATUS.NOT_FOUND);
            }

            crisis.responseTeam.push({
                memberId,
                memberName: await this.getStaffName(memberId),
                role,
                assignedAt: new Date(),
                status: 'assigned'
            });

            crisis.updatedBy = assignedBy;
            await crisis.save();

            // Notify the assigned team member
            await this.notifyResponseTeamMember(crisis, memberId, role);

            return crisis;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to add response team member',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Private helper methods

    private async triggerCrisisProtocols(crisis: ICrisisMode): Promise<void> {
        // Find applicable emergency protocols
        const protocols = await EmergencyProtocol.find({
            emergencyType: crisis.crisisType,
            isActive: true,
            locationIds: { $in: [crisis.locationId] }
        });

        for (const protocol of protocols) {
            // Execute immediate actions
            for (const action of protocol.immediateActions) {
                await this.executeCrisisAction(action, crisis);
            }

            // Send notifications according to protocol
            for (const notification of protocol.notificationSequence) {
                await this.sendProtocolNotification(notification, crisis);
            }
        }
    }

    private async executeCrisisAction(action: any, crisis: ICrisisMode): Promise<void> {
        // Implementation for executing crisis actions
        // Would integrate with various services based on action type
    }

    private async sendProtocolNotification(notification: any, crisis: ICrisisMode): Promise<void> {
        // Implementation for sending protocol notifications
        // Would integrate with notification service
    }

    private async sendCrisisAlerts(crisis: ICrisisMode): Promise<void> {
        // Implementation for sending crisis alerts
        // Would integrate with notification service
    }

    private async sendCrisisStatusUpdate(crisis: ICrisisMode): Promise<void> {
        // Implementation for sending status updates
        // Would integrate with notification service
    }

    private async notifyResponseTeamMember(crisis: ICrisisMode, memberId: string, role: string): Promise<void> {
        // Implementation for notifying team members
        // Would integrate with notification service
    }

    private async getStaffName(staffId: string): Promise<string> {
        // Implementation to get staff name
        return `Staff ${staffId}`;
    }

    private async getBusinessUnitId(locationId: string): Promise<string> {
        // Implementation to get business unit ID from location
        return 'business_unit_id'; // Placeholder
    }

    private generateCrisisId(): string {
        return `crisis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

export class IncidentReportService extends BaseService<IIncidentReport> {
    constructor() {
        super(IncidentReport);
    }

    /**
     * Create incident report
     */
    async createIncidentReport(reportRequest: IIncidentReportRequest, reportedBy: string): Promise<IIncidentReport> {
        try {
            const reportId = this.generateReportId();

            const report = new IncidentReport({
                reportId,
                incidentType: reportRequest.incidentType,
                severity: reportRequest.severity,
                title: reportRequest.title,
                description: reportRequest.description,
                occurredAt: reportRequest.occurredAt,
                reportedAt: new Date(),
                reportedBy,
                reporterName: await this.getReporterName(reportedBy),
                locationId: reportRequest.locationId,
                specificLocation: reportRequest.specificLocation,
                childrenInvolved: reportRequest.childrenInvolved || [],
                staffInvolved: reportRequest.staffInvolved || [],
                contributingFactors: reportRequest.contributingFactors || [],
                immediateActions: reportRequest.immediateActions || [],
                businessUnitId: await this.getBusinessUnitId(reportRequest.locationId),
                createdBy: reportedBy,
                updatedBy: reportedBy
            });

            await report.save();

            // Send notifications based on severity
            await this.sendIncidentNotifications(report);

            return report;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create incident report',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Submit incident report for review
     */
    async submitIncidentReport(reportId: string, submittedBy: string): Promise<IIncidentReport> {
        try {
            const report = await IncidentReport.findOne({ reportId });
            if (!report) {
                throw new AppError('Incident report not found', HTTP_STATUS.NOT_FOUND);
            }

            if (report.status !== 'draft') {
                throw new AppError('Report has already been submitted', HTTP_STATUS.BAD_REQUEST);
            }

            report.status = 'submitted';
            report.updatedBy = submittedBy;
            await report.save();

            // Notify reviewers
            await this.notifyReviewers(report);

            return report;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to submit incident report',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Review incident report
     */
    async reviewIncidentReport(
        reportId: string,
        reviewedBy: string,
        approved: boolean,
        reviewComments?: string
    ): Promise<IIncidentReport> {
        try {
            const report = await IncidentReport.findOne({ reportId });
            if (!report) {
                throw new AppError('Incident report not found', HTTP_STATUS.NOT_FOUND);
            }

            report.status = approved ? 'approved' : 'under_review';
            report.reviewedBy = reviewedBy;
            report.reviewedAt = new Date();
            report.reviewComments = reviewComments;
            report.updatedBy = reviewedBy;

            if (approved) {
                report.approvedBy = reviewedBy;
                report.approvedAt = new Date();
            }

            await report.save();

            // Send review notifications
            await this.sendReviewNotifications(report, approved);

            return report;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to review incident report',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Private helper methods

    private async sendIncidentNotifications(report: IIncidentReport): Promise<void> {
        // Implementation for sending incident notifications
        // Would integrate with notification service
    }

    private async notifyReviewers(report: IIncidentReport): Promise<void> {
        // Implementation for notifying reviewers
        // Would integrate with notification service
    }

    private async sendReviewNotifications(report: IIncidentReport, approved: boolean): Promise<void> {
        // Implementation for sending review notifications
        // Would integrate with notification service
    }

    private async getReporterName(reporterId: string): Promise<string> {
        // Implementation to get reporter name
        return `Reporter ${reporterId}`;
    }

    private async getBusinessUnitId(locationId: string): Promise<string> {
        // Implementation to get business unit ID from location
        return 'business_unit_id'; // Placeholder
    }

    private generateReportId(): string {
        return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

export class EmergencyBroadcastService extends BaseService<IEmergencyBroadcast> {
    constructor() {
        super(EmergencyBroadcast);
    }

    /**
     * Create emergency broadcast
     */
    async createEmergencyBroadcast(broadcastRequest: IEmergencyBroadcastRequest, createdBy: string): Promise<IEmergencyBroadcast> {
        try {
            const broadcastId = this.generateBroadcastId();

            const broadcast = new EmergencyBroadcast({
                broadcastId,
                broadcastType: broadcastRequest.broadcastType,
                priority: broadcastRequest.priority,
                title: broadcastRequest.title,
                message: broadcastRequest.message,
                instructions: broadcastRequest.instructions || [],
                recipients: broadcastRequest.recipients,
                channels: broadcastRequest.channels,
                scheduledFor: broadcastRequest.scheduledFor,
                sentBy: createdBy,
                crisisId: broadcastRequest.crisisId,
                incidentId: broadcastRequest.incidentId,
                businessUnitId: await this.getBusinessUnitId(),
                locationIds: await this.getLocationIds(broadcastRequest.recipients),
                createdBy,
                updatedBy: createdBy
            });

            await broadcast.save();

            // If not scheduled, send immediately
            if (!broadcastRequest.scheduledFor) {
                await this.sendBroadcast(broadcast);
            }

            return broadcast;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create emergency broadcast',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Send emergency broadcast
     */
    async sendBroadcast(broadcast: IEmergencyBroadcast): Promise<IEmergencyBroadcast> {
        try {
            // Calculate recipients
            const recipients = await this.calculateRecipients(broadcast.recipients);

            broadcast.deliveryStats.totalRecipients = recipients.length;
            broadcast.status = 'sent';
            broadcast.sentAt = new Date();

            // Send through each channel
            for (const channel of broadcast.channels) {
                await this.sendThroughChannel(broadcast, recipients, channel);
            }

            // Update delivery stats
            await this.updateDeliveryStats(broadcast);

            await broadcast.save();
            return broadcast;
        } catch (error: any) {
            broadcast.status = 'failed';
            await broadcast.save();

            throw new AppError(
                error.message || 'Failed to send emergency broadcast',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get broadcast delivery status
     */
    async getBroadcastStatus(broadcastId: string): Promise<any> {
        try {
            const broadcast = await EmergencyBroadcast.findOne({ broadcastId });
            if (!broadcast) {
                throw new AppError('Broadcast not found', HTTP_STATUS.NOT_FOUND);
            }

            return {
                broadcastId: broadcast.broadcastId,
                status: broadcast.status,
                deliveryStats: broadcast.deliveryStats,
                sentAt: broadcast.sentAt,
                deliveryRate: broadcast.deliveryStats.totalRecipients > 0
                    ? (broadcast.deliveryStats.delivered / broadcast.deliveryStats.totalRecipients) * 100
                    : 0
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get broadcast status',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Private helper methods

    private async calculateRecipients(recipientConfig: any): Promise<string[]> {
        // Implementation to calculate actual recipient list
        // Would integrate with user/staff services
        return ['recipient1', 'recipient2']; // Placeholder
    }

    private async sendThroughChannel(broadcast: IEmergencyBroadcast, recipients: string[], channel: string): Promise<void> {
        // Implementation for sending through specific channels
        // Would integrate with notification service
        switch (channel) {
            case 'email':
                await this.sendEmailBroadcast(broadcast, recipients);
                break;
            case 'sms':
                await this.sendSMSBroadcast(broadcast, recipients);
                break;
            case 'push':
                await this.sendPushBroadcast(broadcast, recipients);
                break;
            case 'app':
                await this.sendAppBroadcast(broadcast, recipients);
                break;
            case 'public_address':
                await this.sendPublicAddressBroadcast(broadcast);
                break;
        }
    }

    private async sendEmailBroadcast(broadcast: IEmergencyBroadcast, recipients: string[]): Promise<void> {
        // Implementation for email broadcast
    }

    private async sendSMSBroadcast(broadcast: IEmergencyBroadcast, recipients: string[]): Promise<void> {
        // Implementation for SMS broadcast
    }

    private async sendPushBroadcast(broadcast: IEmergencyBroadcast, recipients: string[]): Promise<void> {
        // Implementation for push notification broadcast
    }

    private async sendAppBroadcast(broadcast: IEmergencyBroadcast, recipients: string[]): Promise<void> {
        // Implementation for in-app broadcast
    }

    private async sendPublicAddressBroadcast(broadcast: IEmergencyBroadcast): Promise<void> {
        // Implementation for public address system broadcast
    }

    private async updateDeliveryStats(broadcast: IEmergencyBroadcast): Promise<void> {
        // Implementation to update delivery statistics
        // Would track actual delivery success/failure
        broadcast.deliveryStats.delivered = Math.floor(broadcast.deliveryStats.totalRecipients * 0.95); // 95% success rate placeholder
        broadcast.deliveryStats.failed = broadcast.deliveryStats.totalRecipients - broadcast.deliveryStats.delivered;
        broadcast.deliveryStats.pending = 0;

        if (broadcast.deliveryStats.delivered === broadcast.deliveryStats.totalRecipients) {
            broadcast.status = 'delivered';
        }
    }

    private async getBusinessUnitId(): Promise<string> {
        // Implementation to get business unit ID
        return 'business_unit_id'; // Placeholder
    }

    private async getLocationIds(recipientConfig: any): Promise<string[]> {
        // Implementation to get location IDs from recipient config
        return recipientConfig.locationIds || []; // Placeholder
    }

    private generateBroadcastId(): string {
        return `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async findOneAndUpdate(filter: any, update: any, options?: any): Promise<any> {
        return (this.model as any).findOneAndUpdate(filter, update, options);
    }

    async find(filter: any = {}): Promise<any[]> {
        return (this.model as any).find(filter);
    }
}