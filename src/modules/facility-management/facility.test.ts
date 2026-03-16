import { FacilityService } from './facility.service';
import { FacilityController } from './facility.controller';

describe('Facility Management Module', () => {
    let service: FacilityService;
    let controller: FacilityController;

    beforeEach(() => {
        service = new FacilityService();
        controller = new FacilityController();
    });

    // ==================== ACCESS CONTROL TESTS ====================

    describe('Access Control Management', () => {
        it('should grant access successfully', async () => {
            const accessData = {
                centerId: 'center-1',
                accessType: 'rfid' as const,
                userId: 'user-1',
                userType: 'student' as const,
                zone: 'gym'
            };
            const result = await service.grantAccess(accessData);
            expect(result.status).toBe('granted');
            expect(result.userId).toBe('user-1');
        });

        it('should deny access with reason', async () => {
            const accessData = {
                centerId: 'center-1',
                accessType: 'rfid' as const,
                userId: 'user-1',
                userType: 'student' as const,
                zone: 'restricted'
            };
            const result = await service.denyAccess(accessData, 'Insufficient permissions');
            expect(result.status).toBe('denied');
            expect(result.reason).toBe('Insufficient permissions');
        });

        it('should check access permission', async () => {
            const hasAccess = await service.checkAccessPermission('user-1', 'gym', 'center-1');
            expect(typeof hasAccess).toBe('boolean');
        });

        it('should record exit time', async () => {
            const exitTime = new Date();
            const result = await service.recordExit('access-1', exitTime);
            expect(result.exitTime).toEqual(exitTime);
        });
    });

    // ==================== RFID/NFC CARD TESTS ====================

    describe('RFID/NFC Card Management', () => {
        it('should issue RFID card', async () => {
            const result = await service.issueRFIDCard('user-1', 'student', 'basic', ['gym', 'observation']);
            expect(result.cardId).toBeDefined();
            expect(result.isActive).toBe(true);
            expect(result.zones).toContain('gym');
        });

        it('should activate RFID card', async () => {
            const result = await service.activateRFIDCard('card-1');
            expect(result.isActive).toBe(true);
        });

        it('should deactivate RFID card', async () => {
            const result = await service.deactivateRFIDCard('card-1');
            expect(result.isActive).toBe(false);
        });

        it('should update card zones', async () => {
            const newZones = ['gym', 'observation', 'office'];
            const result = await service.updateCardZones('card-1', newZones);
            expect(result.zones).toEqual(newZones);
        });
    });

    // ==================== QR CODE TESTS ====================

    describe('QR Code Management', () => {
        it('should generate QR code', async () => {
            const result = await service.generateQRCode('user-1', 'student', 'basic', ['gym']);
            expect(result.qrId).toBeDefined();
            expect(result.qrCode).toBeDefined();
            expect(result.isActive).toBe(true);
        });

        it('should validate QR code', async () => {
            const isValid = await service.validateQRCode('QR123456');
            expect(typeof isValid).toBe('boolean');
        });

        it('should revoke QR code', async () => {
            const result = await service.revokeQRCode('qr-1');
            expect(result.isActive).toBe(false);
        });
    });

    // ==================== BIOMETRIC TESTS ====================

    describe('Biometric Management', () => {
        it('should register biometric', async () => {
            const result = await service.registerBiometric('user-1', 'student', 'fingerprint', 'bio-data-123');
            expect(result.biometricId).toBeDefined();
            expect(result.isActive).toBe(true);
            expect(result.biometricType).toBe('fingerprint');
        });

        it('should verify biometric', async () => {
            const isVerified = await service.verifyBiometric('user-1', 'bio-data-123');
            expect(typeof isVerified).toBe('boolean');
        });

        it('should disable biometric', async () => {
            const result = await service.disableBiometric('bio-1');
            expect(result.isActive).toBe(false);
        });
    });

    // ==================== FACILITY ZONE TESTS ====================

    describe('Facility Zone Management', () => {
        it('should create zone', async () => {
            const zoneData = {
                centerId: 'center-1',
                zoneName: 'Main Gym',
                zoneType: 'gym' as const,
                description: 'Main gymnasium',
                capacity: 50,
                allowedUserTypes: ['student', 'coach'],
                accessRequirements: ['active_membership'],
                equipment: ['beam', 'trampoline']
            };
            const result = await service.createZone(zoneData);
            expect(result.zoneId).toBeDefined();
            expect(result.zoneName).toBe('Main Gym');
            expect(result.capacity).toBe(50);
        });

        it('should update zone occupancy', async () => {
            const result = await service.updateZoneOccupancy('zone-1', 30);
            expect(result.currentOccupancy).toBe(30);
        });

        it('should get zone capacity status', async () => {
            const status = await service.getZoneCapacityStatus('zone-1');
            expect(status).toHaveProperty('capacity');
            expect(status).toHaveProperty('occupancy');
            expect(status).toHaveProperty('available');
            expect(status).toHaveProperty('percentage');
        });

        it('should update zone access requirements', async () => {
            const requirements = ['active_membership', 'waiver_signed'];
            const result = await service.updateZoneAccessRequirements('zone-1', requirements);
            expect(result.accessRequirements).toEqual(requirements);
        });
    });

    // ==================== EQUIPMENT BOOKING TESTS ====================

    describe('Equipment Booking', () => {
        it('should book equipment', async () => {
            const bookingData = {
                centerId: 'center-1',
                equipmentId: 'eq-1',
                equipmentName: 'Trampoline',
                bookedBy: 'user-1',
                bookingDate: new Date(),
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600000),
                duration: 60
            };
            const result = await service.bookEquipment(bookingData);
            expect(result.bookingId).toBeDefined();
            expect(result.status).toBe('pending');
        });

        it('should confirm booking', async () => {
            const result = await service.confirmBooking('booking-1');
            expect(result.status).toBe('confirmed');
        });

        it('should cancel booking', async () => {
            const result = await service.cancelBooking('booking-1');
            expect(result.status).toBe('cancelled');
        });

        it('should check equipment availability', async () => {
            const isAvailable = await service.checkEquipmentAvailability(
                'eq-1',
                new Date(),
                new Date(Date.now() + 3600000)
            );
            expect(typeof isAvailable).toBe('boolean');
        });
    });

    // ==================== EQUIPMENT TRACKING TESTS ====================

    describe('Equipment Tracking', () => {
        it('should create equipment', async () => {
            const equipmentData = {
                centerId: 'center-1',
                equipmentName: 'Trampoline',
                equipmentType: 'trampoline' as const,
                zone: 'gym',
                purchaseDate: new Date()
            };
            const result = await service.createEquipment(equipmentData);
            expect(result.equipmentId).toBeDefined();
            expect(result.status).toBe('available');
        });

        it('should update equipment status', async () => {
            const result = await service.updateEquipmentStatus('eq-1', 'maintenance');
            expect(result.status).toBe('maintenance');
        });

        it('should get equipment maintenance history', async () => {
            const history = await service.getEquipmentMaintenanceHistory('eq-1');
            expect(Array.isArray(history)).toBe(true);
        });
    });

    // ==================== MAINTENANCE TESTS ====================

    describe('Maintenance Management', () => {
        it('should create maintenance ticket', async () => {
            const ticketData = {
                centerId: 'center-1',
                equipmentId: 'eq-1',
                equipmentName: 'Trampoline',
                reportedBy: 'user-1',
                issueType: 'damage' as const,
                description: 'Spring broken',
                severity: 'high' as const
            };
            const result = await service.createMaintenanceTicket(ticketData);
            expect(result.ticketId).toBeDefined();
            expect(result.status).toBe('open');
        });

        it('should assign maintenance ticket', async () => {
            const result = await service.assignMaintenanceTicket('ticket-1', 'staff-1');
            expect(result.assignedTo).toBe('staff-1');
            expect(result.status).toBe('in_progress');
        });

        it('should resolve maintenance ticket', async () => {
            const result = await service.resolveMaintenanceTicket('ticket-1', 'Spring replaced');
            expect(result.status).toBe('resolved');
            expect(result.resolutionNotes).toBe('Spring replaced');
        });

        it('should get open maintenance tickets', async () => {
            const tickets = await service.getOpenMaintenanceTickets('center-1');
            expect(Array.isArray(tickets)).toBe(true);
        });
    });

    // ==================== SMART LOCK TESTS ====================

    describe('Smart Lock Management', () => {
        it('should create smart lock', async () => {
            const lockData = {
                centerId: 'center-1',
                zone: 'gym',
                lockName: 'Main Entrance',
                lockType: 'electronic' as const
            };
            const result = await service.createSmartLock(lockData);
            expect(result.lockId).toBeDefined();
            expect(result.isActive).toBe(true);
            expect(result.batteryLevel).toBe(100);
        });

        it('should unlock door', async () => {
            const success = await service.unlockDoor('lock-1', 'user-1', 'rfid');
            expect(typeof success).toBe('boolean');
        });

        it('should lock door', async () => {
            const success = await service.lockDoor('lock-1');
            expect(typeof success).toBe('boolean');
        });

        it('should check battery level', async () => {
            const level = await service.checkBatteryLevel('lock-1');
            expect(typeof level).toBe('number');
        });

        it('should update battery level', async () => {
            const result = await service.updateBatteryLevel('lock-1', 75);
            expect(result.batteryLevel).toBe(75);
        });
    });

    // ==================== HEATMAP & OCCUPANCY TESTS ====================

    describe('Heatmap & Occupancy', () => {
        it('should generate heatmap', async () => {
            const result = await service.generateHeatmap('center-1', 'gym', new Date());
            expect(result.heatmapId).toBeDefined();
            expect(result.zone).toBe('gym');
        });

        it('should get real-time occupancy', async () => {
            const result = await service.getRealTimeOccupancy('center-1', 'gym');
            expect(result.occupancyId).toBeDefined();
            expect(result.zone).toBe('gym');
        });

        it('should update occupancy', async () => {
            const result = await service.updateOccupancy('center-1', 'gym', 25, 50);
            expect(result.currentOccupancy).toBe(25);
            expect(result.capacity).toBe(50);
            expect(result.occupancyPercentage).toBe(50);
        });

        it('should predict peak time', async () => {
            const peakTime = await service.predictPeakTime('center-1', 'gym');
            expect(peakTime === null || peakTime instanceof Date).toBe(true);
        });
    });

    // ==================== ACCESS LOGGING TESTS ====================

    describe('Access Logging', () => {
        it('should log access', async () => {
            const logData = {
                centerId: 'center-1',
                userId: 'user-1',
                userType: 'student' as const,
                accessType: 'rfid' as const,
                zone: 'gym',
                accessTime: new Date(),
                status: 'granted' as const
            };
            const result = await service.logAccess(logData);
            expect(result.logId).toBeDefined();
            expect(result.status).toBe('granted');
        });

        it('should log exit', async () => {
            const result = await service.logExit('log-1', new Date());
            expect(result.exitTime).toBeDefined();
        });

        it('should get access logs', async () => {
            const logs = await service.getAccessLogs('center-1');
            expect(Array.isArray(logs)).toBe(true);
        });
    });

    // ==================== AUDIT TRAIL TESTS ====================

    describe('Audit Trail', () => {
        it('should create audit trail', async () => {
            const auditData = {
                centerId: 'center-1',
                action: 'Access granted',
                actionType: 'access_granted' as const,
                performedBy: 'system',
                details: { userId: 'user-1', zone: 'gym' }
            };
            const result = await service.createAuditTrail(auditData);
            expect(result.auditId).toBeDefined();
            expect(result.action).toBe('Access granted');
        });

        it('should get audit trail', async () => {
            const audit = await service.getAuditTrail('center-1');
            expect(Array.isArray(audit)).toBe(true);
        });
    });

    // ==================== ZONE PERMISSIONS TESTS ====================

    describe('Zone Access Permissions', () => {
        it('should create zone permission', async () => {
            const permissionData = {
                centerId: 'center-1',
                zone: 'gym',
                userType: 'student' as const,
                canAccess: true,
                requiresApproval: false,
                approvalRequired: []
            };
            const result = await service.createZonePermission(permissionData);
            expect(result.permissionId).toBeDefined();
            expect(result.canAccess).toBe(true);
        });

        it('should update zone permission', async () => {
            const result = await service.updateZonePermission('perm-1', false);
            expect(result.canAccess).toBe(false);
        });

        it('should add time restriction', async () => {
            const restriction = {
                day: 'monday' as const,
                startTime: '09:00',
                endTime: '17:00',
                allowed: true
            };
            const result = await service.addTimeRestriction('perm-1', restriction);
            expect(result.timeRestrictions).toBeDefined();
        });
    });

    // ==================== ANALYTICS TESTS ====================

    describe('Facility Analytics', () => {
        it('should generate analytics', async () => {
            const result = await service.generateAnalytics('center-1', 'daily', new Date());
            expect(result.analyticsId).toBeDefined();
            expect(result.period).toBe('daily');
        });

        it('should get access statistics', async () => {
            const stats = await service.getAccessStatistics('center-1', new Date(), new Date());
            expect(stats).toHaveProperty('totalAccess');
            expect(stats).toHaveProperty('grantedAccess');
            expect(stats).toHaveProperty('deniedAccess');
        });

        it('should get equipment utilization', async () => {
            const utilization = await service.getEquipmentUtilization('center-1');
            expect(utilization).toHaveProperty('totalEquipment');
            expect(utilization).toHaveProperty('utilizationPercentage');
        });

        it('should get occupancy trends', async () => {
            const trends = await service.getOccupancyTrends('center-1', 7);
            expect(Array.isArray(trends)).toBe(true);
        });
    });

    // ==================== CONTROLLER TESTS ====================

    describe('Facility Controller', () => {
        it('should handle grant access request', async () => {
            const req = {
                body: {
                    centerId: 'center-1',
                    accessType: 'rfid',
                    userId: 'user-1',
                    userType: 'student',
                    zone: 'gym'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            await controller.grantAccess(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should handle check access permission request', async () => {
            const req = {
                query: {
                    userId: 'user-1',
                    zone: 'gym',
                    centerId: 'center-1'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            await controller.checkAccessPermission(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should handle create zone request', async () => {
            const req = {
                body: {
                    centerId: 'center-1',
                    zoneName: 'Main Gym',
                    zoneType: 'gym',
                    description: 'Main gymnasium',
                    capacity: 50,
                    allowedUserTypes: ['student', 'coach'],
                    accessRequirements: ['active_membership'],
                    equipment: ['beam', 'trampoline']
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            await controller.createZone(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should handle error gracefully', async () => {
            const req = { body: {} };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            await controller.grantAccess(req, res);
            expect(res.status).toHaveBeenCalled();
        });
    });

    // ==================== INTEGRATION TESTS ====================

    describe('Integration Tests', () => {
        it('should complete full access control workflow', async () => {
            // Create zone
            const zone = await service.createZone({
                centerId: 'center-1',
                zoneName: 'Gym',
                zoneType: 'gym',
                description: 'Main gym',
                capacity: 50,
                allowedUserTypes: ['student'],
                accessRequirements: [],
                equipment: []
            });
            expect(zone.zoneId).toBeDefined();

            // Issue RFID card
            const card = await service.issueRFIDCard('user-1', 'student', 'basic', [zone.zoneId]);
            expect(card.cardId).toBeDefined();

            // Grant access
            const access = await service.grantAccess({
                centerId: 'center-1',
                accessType: 'rfid',
                userId: 'user-1',
                userType: 'student',
                zone: zone.zoneId
            });
            expect(access.status).toBe('granted');

            // Record exit
            const exit = await service.recordExit(access.accessId, new Date());
            expect(exit.exitTime).toBeDefined();
        });

        it('should complete equipment booking workflow', async () => {
            // Create equipment
            const equipment = await service.createEquipment({
                centerId: 'center-1',
                equipmentName: 'Trampoline',
                equipmentType: 'trampoline',
                zone: 'gym',
                purchaseDate: new Date()
            });
            expect(equipment.equipmentId).toBeDefined();

            // Check availability
            const isAvailable = await service.checkEquipmentAvailability(
                equipment.equipmentId,
                new Date(),
                new Date(Date.now() + 3600000)
            );
            expect(typeof isAvailable).toBe('boolean');

            // Book equipment
            const booking = await service.bookEquipment({
                centerId: 'center-1',
                equipmentId: equipment.equipmentId,
                equipmentName: equipment.equipmentName,
                bookedBy: 'user-1',
                bookingDate: new Date(),
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600000),
                duration: 60
            });
            expect(booking.bookingId).toBeDefined();

            // Confirm booking
            const confirmed = await service.confirmBooking(booking.bookingId);
            expect(confirmed.status).toBe('confirmed');
        });

        it('should complete maintenance workflow', async () => {
            // Create equipment
            const equipment = await service.createEquipment({
                centerId: 'center-1',
                equipmentName: 'Beam',
                equipmentType: 'beam',
                zone: 'gym',
                purchaseDate: new Date()
            });

            // Create maintenance ticket
            const ticket = await service.createMaintenanceTicket({
                centerId: 'center-1',
                equipmentId: equipment.equipmentId,
                equipmentName: equipment.equipmentName,
                reportedBy: 'user-1',
                issueType: 'damage',
                description: 'Crack in beam',
                severity: 'high'
            });
            expect(ticket.ticketId).toBeDefined();

            // Assign ticket
            const assigned = await service.assignMaintenanceTicket(ticket.ticketId, 'staff-1');
            expect(assigned.assignedTo).toBe('staff-1');

            // Resolve ticket
            const resolved = await service.resolveMaintenanceTicket(ticket.ticketId, 'Beam repaired');
            expect(resolved.status).toBe('resolved');
        });
    });
});
