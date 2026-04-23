import { FacilityService } from './facility.service';
import {
    IAccessControl, IRFIDCard, IQRCode, IBiometric, IFacilityZone,
    IEquipmentBooking, IEquipment, IMaintenanceTicket, ISmartLock,
    IFacilityHeatmap, IRealTimeOccupancy, IAccessLog, IAuditTrail,
    IZoneAccessPermission, IFacilityAnalytics
} from './facility.model';

export class FacilityController {
    private facilityService: FacilityService;

    constructor() {
        this.facilityService = new FacilityService();
    }

    // ==================== ACCESS CONTROL ENDPOINTS ====================

    async grantAccess(req: any, res: any): Promise<void> {
        try {
            const access = await this.facilityService.grantAccess(req.body);
            res.status(201).json({ success: true, data: access });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async denyAccess(req: any, res: any): Promise<void> {
        try {
            const { reason } = req.body;
            const access = await this.facilityService.denyAccess(req.body, reason);
            res.status(201).json({ success: true, data: access });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async checkAccessPermission(req: any, res: any): Promise<void> {
        try {
            const { userId, zone, centerId } = req.query;
            const hasAccess = await this.facilityService.checkAccessPermission(userId, zone, centerId);
            res.status(200).json({ success: true, data: { hasAccess } });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async recordExit(req: any, res: any): Promise<void> {
        try {
            const { accessId } = req.params;
            const { exitTime } = req.body;
            const access = await this.facilityService.recordExit(accessId, new Date(exitTime));
            res.status(200).json({ success: true, data: access });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // ==================== RFID/NFC CARD ENDPOINTS ====================

    async issueRFIDCard(req: any, res: any): Promise<void> {
        try {
            const { userId, userType, accessLevel, zones } = req.body;
            const card = await this.facilityService.issueRFIDCard(userId, userType, accessLevel, zones);
            res.status(201).json({ success: true, data: card });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async activateRFIDCard(req: any, res: any): Promise<void> {
        try {
            const { cardId } = req.params;
            const card = await this.facilityService.activateRFIDCard(cardId);
            res.status(200).json({ success: true, data: card });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async deactivateRFIDCard(req: any, res: any): Promise<void> {
        try {
            const { cardId } = req.params;
            const card = await this.facilityService.deactivateRFIDCard(cardId);
            res.status(200).json({ success: true, data: card });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async updateCardZones(req: any, res: any): Promise<void> {
        try {
            const { cardId } = req.params;
            const { zones } = req.body;
            const card = await this.facilityService.updateCardZones(cardId, zones);
            res.status(200).json({ success: true, data: card });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // ==================== QR CODE ENDPOINTS ====================

    async generateQRCode(req: any, res: any): Promise<void> {
        try {
            const { userId, userType, accessLevel, zones } = req.body;
            const qrCode = await this.facilityService.generateQRCode(userId, userType, accessLevel, zones);
            res.status(201).json({ success: true, data: qrCode });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async validateQRCode(req: any, res: any): Promise<void> {
        try {
            const { qrCode } = req.body;
            const isValid = await this.facilityService.validateQRCode(qrCode);
            res.status(200).json({ success: true, data: { isValid } });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async revokeQRCode(req: any, res: any): Promise<void> {
        try {
            const { qrId } = req.params;
            const qrCode = await this.facilityService.revokeQRCode(qrId);
            res.status(200).json({ success: true, data: qrCode });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // ==================== BIOMETRIC ENDPOINTS ====================

    async registerBiometric(req: any, res: any): Promise<void> {
        try {
            const { userId, userType, biometricType, biometricData } = req.body;
            const biometric = await this.facilityService.registerBiometric(userId, userType, biometricType, biometricData);
            res.status(201).json({ success: true, data: biometric });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async verifyBiometric(req: any, res: any): Promise<void> {
        try {
            const { userId, biometricData } = req.body;
            const isVerified = await this.facilityService.verifyBiometric(userId, biometricData);
            res.status(200).json({ success: true, data: { isVerified } });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async disableBiometric(req: any, res: any): Promise<void> {
        try {
            const { biometricId } = req.params;
            const biometric = await this.facilityService.disableBiometric(biometricId);
            res.status(200).json({ success: true, data: biometric });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // ==================== FACILITY ZONE ENDPOINTS ====================

    async createZone(req: any, res: any): Promise<void> {
        try {
            const zone = await this.facilityService.createZone(req.body);
            res.status(201).json({ success: true, data: zone });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async updateZoneOccupancy(req: any, res: any): Promise<void> {
        try {
            const { zoneId } = req.params;
            const { occupancy } = req.body;
            const zone = await this.facilityService.updateZoneOccupancy(zoneId, occupancy);
            res.status(200).json({ success: true, data: zone });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getZoneCapacityStatus(req: any, res: any): Promise<void> {
        try {
            const { zoneId } = req.params;
            const status = await this.facilityService.getZoneCapacityStatus(zoneId);
            res.status(200).json({ success: true, data: status });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async updateZoneAccessRequirements(req: any, res: any): Promise<void> {
        try {
            const { zoneId } = req.params;
            const { requirements } = req.body;
            const zone = await this.facilityService.updateZoneAccessRequirements(zoneId, requirements);
            res.status(200).json({ success: true, data: zone });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // ==================== EQUIPMENT BOOKING ENDPOINTS ====================

    async bookEquipment(req: any, res: any): Promise<void> {
        try {
            const booking = await this.facilityService.bookEquipment(req.body);
            res.status(201).json({ success: true, data: booking });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async confirmBooking(req: any, res: any): Promise<void> {
        try {
            const { bookingId } = req.params;
            const booking = await this.facilityService.confirmBooking(bookingId);
            res.status(200).json({ success: true, data: booking });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async cancelBooking(req: any, res: any): Promise<void> {
        try {
            const { bookingId } = req.params;
            const booking = await this.facilityService.cancelBooking(bookingId);
            res.status(200).json({ success: true, data: booking });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async checkEquipmentAvailability(req: any, res: any): Promise<void> {
        try {
            const { equipmentId, startTime, endTime } = req.query;
            const isAvailable = await this.facilityService.checkEquipmentAvailability(
                equipmentId,
                new Date(startTime as string),
                new Date(endTime as string)
            );
            res.status(200).json({ success: true, data: { isAvailable } });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // ==================== EQUIPMENT TRACKING ENDPOINTS ====================

    async createEquipment(req: any, res: any): Promise<void> {
        try {
            const equipment = await this.facilityService.createEquipment(req.body);
            res.status(201).json({ success: true, data: equipment });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async updateEquipmentStatus(req: any, res: any): Promise<void> {
        try {
            const { equipmentId } = req.params;
            const { status } = req.body;
            const equipment = await this.facilityService.updateEquipmentStatus(equipmentId, status);
            res.status(200).json({ success: true, data: equipment });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getEquipmentMaintenanceHistory(req: any, res: any): Promise<void> {
        try {
            const { equipmentId } = req.params;
            const history = await this.facilityService.getEquipmentMaintenanceHistory(equipmentId);
            res.status(200).json({ success: true, data: history });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // ==================== MAINTENANCE ENDPOINTS ====================

    async createMaintenanceTicket(req: any, res: any): Promise<void> {
        try {
            const ticket = await this.facilityService.createMaintenanceTicket(req.body);
            res.status(201).json({ success: true, data: ticket });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async assignMaintenanceTicket(req: any, res: any): Promise<void> {
        try {
            const { ticketId } = req.params;
            const { assignedTo } = req.body;
            const ticket = await this.facilityService.assignMaintenanceTicket(ticketId, assignedTo);
            res.status(200).json({ success: true, data: ticket });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async resolveMaintenanceTicket(req: any, res: any): Promise<void> {
        try {
            const { ticketId } = req.params;
            const { resolutionNotes } = req.body;
            const ticket = await this.facilityService.resolveMaintenanceTicket(ticketId, resolutionNotes);
            res.status(200).json({ success: true, data: ticket });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getOpenMaintenanceTickets(req: any, res: any): Promise<void> {
        try {
            const { centerId } = req.query;
            const tickets = await this.facilityService.getOpenMaintenanceTickets(centerId as string);
            res.status(200).json({ success: true, data: tickets });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // ==================== SMART LOCK ENDPOINTS ====================

    async createSmartLock(req: any, res: any): Promise<void> {
        try {
            const lock = await this.facilityService.createSmartLock(req.body);
            res.status(201).json({ success: true, data: lock });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async unlockDoor(req: any, res: any): Promise<void> {
        try {
            const { lockId } = req.params;
            const { userId, accessMethod } = req.body;
            const success = await this.facilityService.unlockDoor(lockId, userId, accessMethod);
            res.status(200).json({ success: true, data: { unlocked: success } });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async lockDoor(req: any, res: any): Promise<void> {
        try {
            const { lockId } = req.params;
            const success = await this.facilityService.lockDoor(lockId);
            res.status(200).json({ success: true, data: { locked: success } });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async checkBatteryLevel(req: any, res: any): Promise<void> {
        try {
            const { lockId } = req.params;
            const level = await this.facilityService.checkBatteryLevel(lockId);
            res.status(200).json({ success: true, data: { batteryLevel: level } });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async updateBatteryLevel(req: any, res: any): Promise<void> {
        try {
            const { lockId } = req.params;
            const { level } = req.body;
            const lock = await this.facilityService.updateBatteryLevel(lockId, level);
            res.status(200).json({ success: true, data: lock });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // ==================== HEATMAP & OCCUPANCY ENDPOINTS ====================

    async generateHeatmap(req: any, res: any): Promise<void> {
        try {
            const { centerId, zone, date } = req.body;
            const heatmap = await this.facilityService.generateHeatmap(centerId, zone, new Date(date));
            res.status(201).json({ success: true, data: heatmap });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getRealTimeOccupancy(req: any, res: any): Promise<void> {
        try {
            const { centerId, zone } = req.query;
            const occupancy = await this.facilityService.getRealTimeOccupancy(centerId as string, zone as string);
            res.status(200).json({ success: true, data: occupancy });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async updateOccupancy(req: any, res: any): Promise<void> {
        try {
            const { centerId, zone, occupancy, capacity } = req.body;
            const updated = await this.facilityService.updateOccupancy(centerId, zone, occupancy, capacity);
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async predictPeakTime(req: any, res: any): Promise<void> {
        try {
            const { centerId, zone } = req.query;
            const peakTime = await this.facilityService.predictPeakTime(centerId as string, zone as string);
            res.status(200).json({ success: true, data: { peakTime } });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // ==================== ACCESS LOGGING ENDPOINTS ====================

    async logAccess(req: any, res: any): Promise<void> {
        try {
            const log = await this.facilityService.logAccess(req.body);
            res.status(201).json({ success: true, data: log });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async logExit(req: any, res: any): Promise<void> {
        try {
            const { logId } = req.params;
            const { exitTime } = req.body;
            const log = await this.facilityService.logExit(logId, new Date(exitTime));
            res.status(200).json({ success: true, data: log });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getAccessLogs(req: any, res: any): Promise<void> {
        try {
            const { centerId } = req.query;
            const logs = await this.facilityService.getAccessLogs(centerId as string, req.query);
            res.status(200).json({ success: true, data: logs });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // ==================== AUDIT TRAIL ENDPOINTS ====================

    async createAuditTrail(req: any, res: any): Promise<void> {
        try {
            const audit = await this.facilityService.createAuditTrail(req.body);
            res.status(201).json({ success: true, data: audit });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getAuditTrail(req: any, res: any): Promise<void> {
        try {
            const { centerId } = req.query;
            const audit = await this.facilityService.getAuditTrail(centerId as string, req.query);
            res.status(200).json({ success: true, data: audit });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // ==================== ZONE PERMISSIONS ENDPOINTS ====================

    async createZonePermission(req: any, res: any): Promise<void> {
        try {
            const permission = await this.facilityService.createZonePermission(req.body);
            res.status(201).json({ success: true, data: permission });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async updateZonePermission(req: any, res: any): Promise<void> {
        try {
            const { permissionId } = req.params;
            const { canAccess } = req.body;
            const permission = await this.facilityService.updateZonePermission(permissionId, canAccess);
            res.status(200).json({ success: true, data: permission });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async addTimeRestriction(req: any, res: any): Promise<void> {
        try {
            const { permissionId } = req.params;
            const permission = await this.facilityService.addTimeRestriction(permissionId, req.body);
            res.status(200).json({ success: true, data: permission });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    // ==================== ANALYTICS ENDPOINTS ====================

    async generateAnalytics(req: any, res: any): Promise<void> {
        try {
            const { centerId, period, date } = req.body;
            const analytics = await this.facilityService.generateAnalytics(centerId, period, new Date(date));
            res.status(201).json({ success: true, data: analytics });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getAccessStatistics(req: any, res: any): Promise<void> {
        try {
            const { centerId, startDate, endDate } = req.query;
            const stats = await this.facilityService.getAccessStatistics(
                centerId as string,
                new Date(startDate as string),
                new Date(endDate as string)
            );
            res.status(200).json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getEquipmentUtilization(req: any, res: any): Promise<void> {
        try {
            const { centerId } = req.query;
            const utilization = await this.facilityService.getEquipmentUtilization(centerId as string);
            res.status(200).json({ success: true, data: utilization });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    async getOccupancyTrends(req: any, res: any): Promise<void> {
        try {
            const { centerId, days } = req.query;
            const trends = await this.facilityService.getOccupancyTrends(centerId as string, parseInt(days as string));
            res.status(200).json({ success: true, data: trends });
        } catch (error) {
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }
}
