import { FacilityController } from './facility.controller';

export class FacilityRoutes {
    private controller: FacilityController;

    constructor() {
        this.controller = new FacilityController();
    }

    public getRoutes() {
        return [
            // ==================== ACCESS CONTROL ROUTES ====================
            {
                method: 'POST',
                path: '/api/facility/access/grant',
                handler: (req: any, res: any) => this.controller.grantAccess(req, res)
            },
            {
                method: 'POST',
                path: '/api/facility/access/deny',
                handler: (req: any, res: any) => this.controller.denyAccess(req, res)
            },
            {
                method: 'GET',
                path: '/api/facility/access/check',
                handler: (req: any, res: any) => this.controller.checkAccessPermission(req, res)
            },
            {
                method: 'PUT',
                path: '/api/facility/access/:accessId/exit',
                handler: (req: any, res: any) => this.controller.recordExit(req, res)
            },

            // ==================== RFID/NFC CARD ROUTES ====================
            {
                method: 'POST',
                path: '/api/facility/rfid/issue',
                handler: (req: any, res: any) => this.controller.issueRFIDCard(req, res)
            },
            {
                method: 'PUT',
                path: '/api/facility/rfid/:cardId/activate',
                handler: (req: any, res: any) => this.controller.activateRFIDCard(req, res)
            },
            {
                method: 'PUT',
                path: '/api/facility/rfid/:cardId/deactivate',
                handler: (req: any, res: any) => this.controller.deactivateRFIDCard(req, res)
            },
            {
                method: 'PUT',
                path: '/api/facility/rfid/:cardId/zones',
                handler: (req: any, res: any) => this.controller.updateCardZones(req, res)
            },

            // ==================== QR CODE ROUTES ====================
            {
                method: 'POST',
                path: '/api/facility/qr/generate',
                handler: (req: any, res: any) => this.controller.generateQRCode(req, res)
            },
            {
                method: 'POST',
                path: '/api/facility/qr/validate',
                handler: (req: any, res: any) => this.controller.validateQRCode(req, res)
            },
            {
                method: 'DELETE',
                path: '/api/facility/qr/:qrId',
                handler: (req: any, res: any) => this.controller.revokeQRCode(req, res)
            },

            // ==================== BIOMETRIC ROUTES ====================
            {
                method: 'POST',
                path: '/api/facility/biometric/register',
                handler: (req: any, res: any) => this.controller.registerBiometric(req, res)
            },
            {
                method: 'POST',
                path: '/api/facility/biometric/verify',
                handler: (req: any, res: any) => this.controller.verifyBiometric(req, res)
            },
            {
                method: 'DELETE',
                path: '/api/facility/biometric/:biometricId',
                handler: (req: any, res: any) => this.controller.disableBiometric(req, res)
            },

            // ==================== FACILITY ZONE ROUTES ====================
            {
                method: 'POST',
                path: '/api/facility/zones',
                handler: (req: any, res: any) => this.controller.createZone(req, res)
            },
            {
                method: 'PUT',
                path: '/api/facility/zones/:zoneId/occupancy',
                handler: (req: any, res: any) => this.controller.updateZoneOccupancy(req, res)
            },
            {
                method: 'GET',
                path: '/api/facility/zones/:zoneId/capacity',
                handler: (req: any, res: any) => this.controller.getZoneCapacityStatus(req, res)
            },
            {
                method: 'PUT',
                path: '/api/facility/zones/:zoneId/access-requirements',
                handler: (req: any, res: any) => this.controller.updateZoneAccessRequirements(req, res)
            },

            // ==================== EQUIPMENT BOOKING ROUTES ====================
            {
                method: 'POST',
                path: '/api/facility/equipment/book',
                handler: (req: any, res: any) => this.controller.bookEquipment(req, res)
            },
            {
                method: 'PUT',
                path: '/api/facility/equipment/booking/:bookingId/confirm',
                handler: (req: any, res: any) => this.controller.confirmBooking(req, res)
            },
            {
                method: 'PUT',
                path: '/api/facility/equipment/booking/:bookingId/cancel',
                handler: (req: any, res: any) => this.controller.cancelBooking(req, res)
            },
            {
                method: 'GET',
                path: '/api/facility/equipment/availability',
                handler: (req: any, res: any) => this.controller.checkEquipmentAvailability(req, res)
            },

            // ==================== EQUIPMENT TRACKING ROUTES ====================
            {
                method: 'POST',
                path: '/api/facility/equipment',
                handler: (req: any, res: any) => this.controller.createEquipment(req, res)
            },
            {
                method: 'PUT',
                path: '/api/facility/equipment/:equipmentId/status',
                handler: (req: any, res: any) => this.controller.updateEquipmentStatus(req, res)
            },
            {
                method: 'GET',
                path: '/api/facility/equipment/:equipmentId/maintenance-history',
                handler: (req: any, res: any) => this.controller.getEquipmentMaintenanceHistory(req, res)
            },

            // ==================== MAINTENANCE ROUTES ====================
            {
                method: 'POST',
                path: '/api/facility/maintenance/ticket',
                handler: (req: any, res: any) => this.controller.createMaintenanceTicket(req, res)
            },
            {
                method: 'PUT',
                path: '/api/facility/maintenance/ticket/:ticketId/assign',
                handler: (req: any, res: any) => this.controller.assignMaintenanceTicket(req, res)
            },
            {
                method: 'PUT',
                path: '/api/facility/maintenance/ticket/:ticketId/resolve',
                handler: (req: any, res: any) => this.controller.resolveMaintenanceTicket(req, res)
            },
            {
                method: 'GET',
                path: '/api/facility/maintenance/tickets/open',
                handler: (req: any, res: any) => this.controller.getOpenMaintenanceTickets(req, res)
            },

            // ==================== SMART LOCK ROUTES ====================
            {
                method: 'POST',
                path: '/api/facility/smart-lock',
                handler: (req: any, res: any) => this.controller.createSmartLock(req, res)
            },
            {
                method: 'PUT',
                path: '/api/facility/smart-lock/:lockId/unlock',
                handler: (req: any, res: any) => this.controller.unlockDoor(req, res)
            },
            {
                method: 'PUT',
                path: '/api/facility/smart-lock/:lockId/lock',
                handler: (req: any, res: any) => this.controller.lockDoor(req, res)
            },
            {
                method: 'GET',
                path: '/api/facility/smart-lock/:lockId/battery',
                handler: (req: any, res: any) => this.controller.checkBatteryLevel(req, res)
            },
            {
                method: 'PUT',
                path: '/api/facility/smart-lock/:lockId/battery',
                handler: (req: any, res: any) => this.controller.updateBatteryLevel(req, res)
            },

            // ==================== HEATMAP & OCCUPANCY ROUTES ====================
            {
                method: 'POST',
                path: '/api/facility/heatmap',
                handler: (req: any, res: any) => this.controller.generateHeatmap(req, res)
            },
            {
                method: 'GET',
                path: '/api/facility/occupancy/real-time',
                handler: (req: any, res: any) => this.controller.getRealTimeOccupancy(req, res)
            },
            {
                method: 'PUT',
                path: '/api/facility/occupancy/update',
                handler: (req: any, res: any) => this.controller.updateOccupancy(req, res)
            },
            {
                method: 'GET',
                path: '/api/facility/occupancy/peak-time',
                handler: (req: any, res: any) => this.controller.predictPeakTime(req, res)
            },

            // ==================== ACCESS LOGGING ROUTES ====================
            {
                method: 'POST',
                path: '/api/facility/logs/access',
                handler: (req: any, res: any) => this.controller.logAccess(req, res)
            },
            {
                method: 'PUT',
                path: '/api/facility/logs/:logId/exit',
                handler: (req: any, res: any) => this.controller.logExit(req, res)
            },
            {
                method: 'GET',
                path: '/api/facility/logs/access',
                handler: (req: any, res: any) => this.controller.getAccessLogs(req, res)
            },

            // ==================== AUDIT TRAIL ROUTES ====================
            {
                method: 'POST',
                path: '/api/facility/audit',
                handler: (req: any, res: any) => this.controller.createAuditTrail(req, res)
            },
            {
                method: 'GET',
                path: '/api/facility/audit',
                handler: (req: any, res: any) => this.controller.getAuditTrail(req, res)
            },

            // ==================== ZONE PERMISSIONS ROUTES ====================
            {
                method: 'POST',
                path: '/api/facility/permissions/zone',
                handler: (req: any, res: any) => this.controller.createZonePermission(req, res)
            },
            {
                method: 'PUT',
                path: '/api/facility/permissions/:permissionId',
                handler: (req: any, res: any) => this.controller.updateZonePermission(req, res)
            },
            {
                method: 'POST',
                path: '/api/facility/permissions/:permissionId/time-restriction',
                handler: (req: any, res: any) => this.controller.addTimeRestriction(req, res)
            },

            // ==================== ANALYTICS ROUTES ====================
            {
                method: 'POST',
                path: '/api/facility/analytics',
                handler: (req: any, res: any) => this.controller.generateAnalytics(req, res)
            },
            {
                method: 'GET',
                path: '/api/facility/analytics/access-statistics',
                handler: (req: any, res: any) => this.controller.getAccessStatistics(req, res)
            },
            {
                method: 'GET',
                path: '/api/facility/analytics/equipment-utilization',
                handler: (req: any, res: any) => this.controller.getEquipmentUtilization(req, res)
            },
            {
                method: 'GET',
                path: '/api/facility/analytics/occupancy-trends',
                handler: (req: any, res: any) => this.controller.getOccupancyTrends(req, res)
            }
        ];
    }
}
