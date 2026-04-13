import {
    IAccessControl, IRFIDCard, IQRCode, IBiometric, IFacilityZone,
    IEquipmentBooking, IEquipment, IMaintenanceTicket, ISmartLock,
    IFacilityHeatmap, IRealTimeOccupancy, IAccessLog, IAuditTrail,
    IZoneAccessPermission, IFacilityAnalytics, MaintenanceRecord, AccessLogEntry, TimeRestriction,
    AccessControl, RFIDCard, QRCode, Biometric, FacilityZone,
    EquipmentBooking, Equipment, MaintenanceTicket, SmartLock,
    FacilityHeatmap, RealTimeOccupancy, AccessLog, AuditTrail,
    ZoneAccessPermission, FacilityAnalytics
} from './facility.model';

export class FacilityService {
    // ==================== ACCESS CONTROL MANAGEMENT ====================

    async grantAccess(accessData: Partial<IAccessControl>): Promise<IAccessControl> {
        try {
            const access = new AccessControl({
                accessId: `ACC-${Date.now()}`,
                centerId: accessData.centerId,
                accessType: accessData.accessType || 'manual',
                userId: accessData.userId,
                userType: accessData.userType || 'student',
                accessTime: new Date(),
                zone: accessData.zone,
                status: 'granted',
            });
            return await access.save();
        } catch (error) {
            throw new Error(`Failed to grant access: ${(error as Error).message}`);
        }
    }

    async denyAccess(accessData: Partial<IAccessControl>, reason: string): Promise<IAccessControl> {
        try {
            const access = new AccessControl({
                accessId: `ACC-${Date.now()}`,
                centerId: accessData.centerId,
                accessType: accessData.accessType || 'manual',
                userId: accessData.userId,
                userType: accessData.userType || 'student',
                accessTime: new Date(),
                zone: accessData.zone,
                status: 'denied',
                reason: reason,
            });
            return await access.save();
        } catch (error) {
            throw new Error(`Failed to deny access: ${(error as Error).message}`);
        }
    }

    async checkAccessPermission(userId: string, zone: string, centerId: string): Promise<boolean> {
        try {
            // Look up the user's active RFID card to determine their userType
            const card = await RFIDCard.findOne({ userId, isActive: true });
            if (!card) {
                return false;
            }

            // Check if the card grants access to this zone
            if (!card.zones.includes(zone)) {
                return false;
            }

            // Check if the card has expired
            if (card.expiryDate && card.expiryDate < new Date()) {
                return false;
            }

            // Check zone-level permission for this userType
            const permission = await ZoneAccessPermission.findOne({
                centerId,
                zone,
                userType: card.userType,
            });

            if (permission && !permission.canAccess) {
                return false;
            }

            // Check time restrictions if any
            if (permission && permission.timeRestrictions && permission.timeRestrictions.length > 0) {
                const now = new Date();
                const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const currentDay = days[now.getDay()];
                const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

                const dayRestriction = permission.timeRestrictions.find(
                    (r: TimeRestriction) => r.day === currentDay
                );

                if (dayRestriction) {
                    const withinWindow = currentTime >= dayRestriction.startTime && currentTime <= dayRestriction.endTime;
                    if (!dayRestriction.allowed && withinWindow) {
                        return false;
                    }
                    if (dayRestriction.allowed && !withinWindow) {
                        return false;
                    }
                }
            }

            // Check zone capacity
            const facilityZone = await FacilityZone.findOne({ zoneId: zone, centerId, isActive: true });
            if (facilityZone && facilityZone.currentOccupancy >= facilityZone.capacity) {
                return false;
            }

            return true;
        } catch (error) {
            throw new Error(`Failed to check access permission: ${(error as Error).message}`);
        }
    }

    async recordExit(accessId: string, exitTime: Date): Promise<IAccessControl> {
        try {
            const access = await AccessControl.findOneAndUpdate(
                { accessId },
                { exitTime },
                { new: true }
            );
            if (!access) {
                throw new Error(`Access record not found: ${accessId}`);
            }
            return access;
        } catch (error) {
            throw new Error(`Failed to record exit: ${(error as Error).message}`);
        }
    }

    // ==================== RFID/NFC CARD MANAGEMENT ====================

    async issueRFIDCard(userId: string, userType: string, accessLevel: string, zones: string[]): Promise<IRFIDCard> {
        try {
            const card = new RFIDCard({
                cardId: `RFID-${Date.now()}`,
                cardNumber: Math.random().toString(36).substr(2, 9).toUpperCase(),
                userId,
                userType,
                isActive: true,
                issuedDate: new Date(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                accessLevel,
                zones,
            });
            return await card.save();
        } catch (error) {
            throw new Error(`Failed to issue RFID card: ${(error as Error).message}`);
        }
    }

    async activateRFIDCard(cardId: string): Promise<IRFIDCard> {
        try {
            const card = await RFIDCard.findOneAndUpdate(
                { cardId },
                { isActive: true },
                { new: true }
            );
            if (!card) {
                throw new Error(`RFID card not found: ${cardId}`);
            }
            return card;
        } catch (error) {
            throw new Error(`Failed to activate RFID card: ${(error as Error).message}`);
        }
    }

    async deactivateRFIDCard(cardId: string): Promise<IRFIDCard> {
        try {
            const card = await RFIDCard.findOneAndUpdate(
                { cardId },
                { isActive: false },
                { new: true }
            );
            if (!card) {
                throw new Error(`RFID card not found: ${cardId}`);
            }
            return card;
        } catch (error) {
            throw new Error(`Failed to deactivate RFID card: ${(error as Error).message}`);
        }
    }

    async updateCardZones(cardId: string, zones: string[]): Promise<IRFIDCard> {
        try {
            const card = await RFIDCard.findOneAndUpdate(
                { cardId },
                { zones },
                { new: true }
            );
            if (!card) {
                throw new Error(`RFID card not found: ${cardId}`);
            }
            return card;
        } catch (error) {
            throw new Error(`Failed to update card zones: ${(error as Error).message}`);
        }
    }

    // ==================== QR CODE MANAGEMENT ====================

    async generateQRCode(userId: string, userType: string, accessLevel: string, zones: string[]): Promise<IQRCode> {
        try {
            const qrCode = new QRCode({
                qrId: `QR-${Date.now()}`,
                qrCode: Math.random().toString(36).substr(2, 9).toUpperCase(),
                userId,
                userType,
                isActive: true,
                issuedDate: new Date(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                accessLevel,
                zones,
            });
            return await qrCode.save();
        } catch (error) {
            throw new Error(`Failed to generate QR code: ${(error as Error).message}`);
        }
    }

    async validateQRCode(qrCodeStr: string): Promise<boolean> {
        try {
            const qr = await QRCode.findOne({ qrCode: qrCodeStr, isActive: true });
            if (!qr) {
                return false;
            }
            if (qr.expiryDate && qr.expiryDate < new Date()) {
                return false;
            }
            // Update last used date
            await QRCode.findOneAndUpdate({ qrCode: qrCodeStr }, { lastUsedDate: new Date() });
            return true;
        } catch (error) {
            throw new Error(`Failed to validate QR code: ${(error as Error).message}`);
        }
    }

    async revokeQRCode(qrId: string): Promise<IQRCode> {
        try {
            const qrCode = await QRCode.findOneAndUpdate(
                { qrId },
                { isActive: false },
                { new: true }
            );
            if (!qrCode) {
                throw new Error(`QR code not found: ${qrId}`);
            }
            return qrCode;
        } catch (error) {
            throw new Error(`Failed to revoke QR code: ${(error as Error).message}`);
        }
    }

    // ==================== BIOMETRIC MANAGEMENT ====================

    async registerBiometric(userId: string, userType: string, biometricType: string, biometricData: string): Promise<IBiometric> {
        try {
            const biometric = new Biometric({
                biometricId: `BIO-${Date.now()}`,
                userId,
                userType,
                biometricType,
                biometricData,
                isActive: true,
                registeredDate: new Date(),
                accessLevel: 'basic',
                zones: [],
            });
            return await biometric.save();
        } catch (error) {
            throw new Error(`Failed to register biometric: ${(error as Error).message}`);
        }
    }

    async verifyBiometric(userId: string, biometricData: string): Promise<boolean> {
        try {
            const biometric = await Biometric.findOne({
                userId,
                biometricData,
                isActive: true,
            });
            if (!biometric) {
                return false;
            }
            // Update last used date
            await Biometric.findOneAndUpdate(
                { biometricId: biometric.biometricId },
                { lastUsedDate: new Date() }
            );
            return true;
        } catch (error) {
            throw new Error(`Failed to verify biometric: ${(error as Error).message}`);
        }
    }

    async disableBiometric(biometricId: string): Promise<IBiometric> {
        try {
            const biometric = await Biometric.findOneAndUpdate(
                { biometricId },
                { isActive: false },
                { new: true }
            );
            if (!biometric) {
                throw new Error(`Biometric not found: ${biometricId}`);
            }
            return biometric;
        } catch (error) {
            throw new Error(`Failed to disable biometric: ${(error as Error).message}`);
        }
    }

    // ==================== FACILITY ZONE MANAGEMENT ====================

    async createZone(zoneData: Partial<IFacilityZone>): Promise<IFacilityZone> {
        try {
            const zone = new FacilityZone({
                zoneId: `ZONE-${Date.now()}`,
                centerId: zoneData.centerId,
                zoneName: zoneData.zoneName,
                zoneType: zoneData.zoneType || 'common',
                description: zoneData.description || '',
                capacity: zoneData.capacity || 0,
                currentOccupancy: 0,
                allowedUserTypes: zoneData.allowedUserTypes || [],
                accessRequirements: zoneData.accessRequirements || [],
                equipment: zoneData.equipment || [],
                isActive: true,
            });
            return await zone.save();
        } catch (error) {
            throw new Error(`Failed to create zone: ${(error as Error).message}`);
        }
    }

    async updateZoneOccupancy(zoneId: string, occupancy: number): Promise<IFacilityZone> {
        try {
            const zone = await FacilityZone.findOneAndUpdate(
                { zoneId },
                { currentOccupancy: occupancy },
                { new: true }
            );
            if (!zone) {
                throw new Error(`Zone not found: ${zoneId}`);
            }
            return zone;
        } catch (error) {
            throw new Error(`Failed to update zone occupancy: ${(error as Error).message}`);
        }
    }

    async getZoneCapacityStatus(zoneId: string): Promise<{ capacity: number; occupancy: number; available: number; percentage: number }> {
        try {
            const zone = await FacilityZone.findOne({ zoneId });
            if (!zone) {
                throw new Error(`Zone not found: ${zoneId}`);
            }
            const available = zone.capacity - zone.currentOccupancy;
            const percentage = zone.capacity > 0 ? (zone.currentOccupancy / zone.capacity) * 100 : 0;
            return {
                capacity: zone.capacity,
                occupancy: zone.currentOccupancy,
                available,
                percentage: Math.round(percentage * 100) / 100,
            };
        } catch (error) {
            throw new Error(`Failed to get zone capacity status: ${(error as Error).message}`);
        }
    }

    async updateZoneAccessRequirements(zoneId: string, requirements: string[]): Promise<IFacilityZone> {
        try {
            const zone = await FacilityZone.findOneAndUpdate(
                { zoneId },
                { accessRequirements: requirements },
                { new: true }
            );
            if (!zone) {
                throw new Error(`Zone not found: ${zoneId}`);
            }
            return zone;
        } catch (error) {
            throw new Error(`Failed to update zone access requirements: ${(error as Error).message}`);
        }
    }

    // ==================== EQUIPMENT BOOKING ====================

    async bookEquipment(bookingData: Partial<IEquipmentBooking>): Promise<IEquipmentBooking> {
        try {
            // Check availability before booking
            const isAvailable = await this.checkEquipmentAvailability(
                bookingData.equipmentId!,
                bookingData.startTime!,
                bookingData.endTime!
            );
            if (!isAvailable) {
                throw new Error('Equipment is not available for the requested time slot');
            }

            const booking = new EquipmentBooking({
                bookingId: `BOOK-${Date.now()}`,
                centerId: bookingData.centerId,
                equipmentId: bookingData.equipmentId,
                equipmentName: bookingData.equipmentName,
                bookedBy: bookingData.bookedBy,
                bookingDate: bookingData.bookingDate || new Date(),
                startTime: bookingData.startTime,
                endTime: bookingData.endTime,
                duration: bookingData.duration || 0,
                status: 'pending',
                notes: bookingData.notes,
            });
            return await booking.save();
        } catch (error) {
            throw new Error(`Failed to book equipment: ${(error as Error).message}`);
        }
    }

    async confirmBooking(bookingId: string): Promise<IEquipmentBooking> {
        try {
            const booking = await EquipmentBooking.findOneAndUpdate(
                { bookingId, status: 'pending' },
                { status: 'confirmed' },
                { new: true }
            );
            if (!booking) {
                throw new Error(`Booking not found or not in pending status: ${bookingId}`);
            }
            return booking;
        } catch (error) {
            throw new Error(`Failed to confirm booking: ${(error as Error).message}`);
        }
    }

    async cancelBooking(bookingId: string): Promise<IEquipmentBooking> {
        try {
            const booking = await EquipmentBooking.findOneAndUpdate(
                { bookingId, status: { $in: ['pending', 'confirmed'] } },
                { status: 'cancelled' },
                { new: true }
            );
            if (!booking) {
                throw new Error(`Booking not found or cannot be cancelled: ${bookingId}`);
            }
            return booking;
        } catch (error) {
            throw new Error(`Failed to cancel booking: ${(error as Error).message}`);
        }
    }

    async checkEquipmentAvailability(equipmentId: string, startTime: Date, endTime: Date): Promise<boolean> {
        try {
            const conflicting = await EquipmentBooking.findOne({
                equipmentId,
                status: { $in: ['pending', 'confirmed', 'in_use'] },
                $or: [
                    { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
                ],
            });
            return !conflicting;
        } catch (error) {
            throw new Error(`Failed to check equipment availability: ${(error as Error).message}`);
        }
    }

    // ==================== EQUIPMENT TRACKING ====================

    async createEquipment(equipmentData: Partial<IEquipment>): Promise<IEquipment> {
        try {
            const equipment = new Equipment({
                equipmentId: `EQ-${Date.now()}`,
                centerId: equipmentData.centerId,
                equipmentName: equipmentData.equipmentName,
                equipmentType: equipmentData.equipmentType || 'other',
                zone: equipmentData.zone,
                status: 'available',
                purchaseDate: equipmentData.purchaseDate || new Date(),
                maintenanceHistory: [],
            });
            return await equipment.save();
        } catch (error) {
            throw new Error(`Failed to create equipment: ${(error as Error).message}`);
        }
    }

    async updateEquipmentStatus(equipmentId: string, status: string): Promise<IEquipment> {
        try {
            const equipment = await Equipment.findOneAndUpdate(
                { equipmentId },
                { status },
                { new: true }
            );
            if (!equipment) {
                throw new Error(`Equipment not found: ${equipmentId}`);
            }
            return equipment;
        } catch (error) {
            throw new Error(`Failed to update equipment status: ${(error as Error).message}`);
        }
    }

    async getEquipmentMaintenanceHistory(equipmentId: string): Promise<MaintenanceRecord[]> {
        try {
            const equipment = await Equipment.findOne({ equipmentId });
            if (!equipment) {
                throw new Error(`Equipment not found: ${equipmentId}`);
            }
            return equipment.maintenanceHistory;
        } catch (error) {
            throw new Error(`Failed to get maintenance history: ${(error as Error).message}`);
        }
    }

    // ==================== MAINTENANCE MANAGEMENT ====================

    async createMaintenanceTicket(ticketData: Partial<IMaintenanceTicket>): Promise<IMaintenanceTicket> {
        try {
            const ticket = new MaintenanceTicket({
                ticketId: `MAINT-${Date.now()}`,
                centerId: ticketData.centerId,
                equipmentId: ticketData.equipmentId,
                equipmentName: ticketData.equipmentName,
                reportedBy: ticketData.reportedBy,
                reportedDate: new Date(),
                issueType: ticketData.issueType || 'other',
                description: ticketData.description,
                severity: ticketData.severity || 'low',
                status: 'open',
            });
            return await ticket.save();
        } catch (error) {
            throw new Error(`Failed to create maintenance ticket: ${(error as Error).message}`);
        }
    }

    async assignMaintenanceTicket(ticketId: string, assignedTo: string): Promise<IMaintenanceTicket> {
        try {
            const ticket = await MaintenanceTicket.findOneAndUpdate(
                { ticketId },
                { assignedTo, status: 'in_progress' },
                { new: true }
            );
            if (!ticket) {
                throw new Error(`Maintenance ticket not found: ${ticketId}`);
            }
            return ticket;
        } catch (error) {
            throw new Error(`Failed to assign maintenance ticket: ${(error as Error).message}`);
        }
    }

    async resolveMaintenanceTicket(ticketId: string, resolutionNotes: string): Promise<IMaintenanceTicket> {
        try {
            const ticket = await MaintenanceTicket.findOneAndUpdate(
                { ticketId },
                {
                    status: 'resolved',
                    resolvedDate: new Date(),
                    resolutionNotes,
                },
                { new: true }
            );
            if (!ticket) {
                throw new Error(`Maintenance ticket not found: ${ticketId}`);
            }

            // Add to equipment maintenance history
            if (ticket.equipmentId) {
                await Equipment.findOneAndUpdate(
                    { equipmentId: ticket.equipmentId },
                    {
                        lastMaintenanceDate: new Date(),
                        $push: {
                            maintenanceHistory: {
                                recordId: `REC-${Date.now()}`,
                                maintenanceDate: new Date(),
                                maintenanceType: 'repair',
                                description: resolutionNotes,
                                performedBy: ticket.assignedTo || 'unknown',
                            },
                        },
                    }
                );
            }

            return ticket;
        } catch (error) {
            throw new Error(`Failed to resolve maintenance ticket: ${(error as Error).message}`);
        }
    }

    async getOpenMaintenanceTickets(centerId: string): Promise<IMaintenanceTicket[]> {
        try {
            return await MaintenanceTicket.find({
                centerId,
                status: { $in: ['open', 'in_progress'] },
            }).sort({ severity: -1, reportedDate: 1 });
        } catch (error) {
            throw new Error(`Failed to get open maintenance tickets: ${(error as Error).message}`);
        }
    }

    // ==================== SMART LOCK MANAGEMENT ====================

    async createSmartLock(lockData: Partial<ISmartLock>): Promise<ISmartLock> {
        try {
            const lock = new SmartLock({
                lockId: `LOCK-${Date.now()}`,
                centerId: lockData.centerId,
                zone: lockData.zone,
                lockName: lockData.lockName,
                lockType: lockData.lockType || 'electronic',
                isActive: true,
                batteryLevel: 100,
                accessLog: [],
            });
            return await lock.save();
        } catch (error) {
            throw new Error(`Failed to create smart lock: ${(error as Error).message}`);
        }
    }

    async unlockDoor(lockId: string, userId: string, accessMethod: string): Promise<boolean> {
        try {
            const lock = await SmartLock.findOne({ lockId, isActive: true });
            if (!lock) {
                return false;
            }

            // Check if user has permission to this zone
            const hasPermission = await this.checkAccessPermission(userId, lock.zone, lock.centerId);

            const logEntry: AccessLogEntry = {
                logId: `LOG-${Date.now()}`,
                userId,
                accessTime: new Date(),
                accessMethod: accessMethod as any,
                status: hasPermission ? 'granted' : 'denied',
                reason: hasPermission ? undefined : 'Permission denied',
            };

            await SmartLock.findOneAndUpdate(
                { lockId },
                { $push: { accessLog: logEntry } }
            );

            return hasPermission;
        } catch (error) {
            throw new Error(`Failed to unlock door: ${(error as Error).message}`);
        }
    }

    async lockDoor(lockId: string): Promise<boolean> {
        try {
            const lock = await SmartLock.findOne({ lockId, isActive: true });
            if (!lock) {
                return false;
            }
            // Lock is always active; just confirm it exists and is active
            return true;
        } catch (error) {
            throw new Error(`Failed to lock door: ${(error as Error).message}`);
        }
    }

    async checkBatteryLevel(lockId: string): Promise<number> {
        try {
            const lock = await SmartLock.findOne({ lockId });
            if (!lock) {
                throw new Error(`Smart lock not found: ${lockId}`);
            }
            return lock.batteryLevel;
        } catch (error) {
            throw new Error(`Failed to check battery level: ${(error as Error).message}`);
        }
    }

    async updateBatteryLevel(lockId: string, level: number): Promise<ISmartLock> {
        try {
            const lock = await SmartLock.findOneAndUpdate(
                { lockId },
                { batteryLevel: level, lastBatteryCheck: new Date() },
                { new: true }
            );
            if (!lock) {
                throw new Error(`Smart lock not found: ${lockId}`);
            }
            return lock;
        } catch (error) {
            throw new Error(`Failed to update battery level: ${(error as Error).message}`);
        }
    }

    // ==================== HEATMAP & OCCUPANCY ====================

    async generateHeatmap(centerId: string, zone: string, date: Date): Promise<IFacilityHeatmap> {
        try {
            const hour = new Date().getHours();

            // Get access logs for this zone on this date to compute occupancy
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const accessCount = await AccessLog.countDocuments({
                centerId,
                zone,
                accessTime: { $gte: startOfDay, $lte: endOfDay },
                status: 'granted',
            });

            // Get current hour logs for peak detection
            const hourStart = new Date(date);
            hourStart.setHours(hour, 0, 0, 0);
            const hourEnd = new Date(date);
            hourEnd.setHours(hour, 59, 59, 999);

            const hourlyCount = await AccessLog.countDocuments({
                centerId,
                zone,
                accessTime: { $gte: hourStart, $lte: hourEnd },
                status: 'granted',
            });

            const zoneData = await FacilityZone.findOne({ centerId, zoneId: zone });
            const capacity = zoneData ? zoneData.capacity : 0;
            const occupancyLevel = capacity > 0 ? (hourlyCount / capacity) * 100 : 0;
            const peakTime = occupancyLevel > 75;

            let trafficFlow: 'low' | 'medium' | 'high' | 'peak' = 'low';
            if (occupancyLevel > 75) trafficFlow = 'peak';
            else if (occupancyLevel > 50) trafficFlow = 'high';
            else if (occupancyLevel > 25) trafficFlow = 'medium';

            const heatmap = await FacilityHeatmap.findOneAndUpdate(
                { centerId, zone, date: startOfDay, hour },
                {
                    heatmapId: `HEAT-${Date.now()}`,
                    centerId,
                    zone,
                    date: startOfDay,
                    hour,
                    occupancyLevel: Math.round(occupancyLevel),
                    peakTime,
                    averageStayTime: accessCount > 0 ? Math.round(accessCount / 24) : 0,
                    trafficFlow,
                },
                { new: true, upsert: true }
            );

            return heatmap!;
        } catch (error) {
            throw new Error(`Failed to generate heatmap: ${(error as Error).message}`);
        }
    }

    async getRealTimeOccupancy(centerId: string, zone: string): Promise<IRealTimeOccupancy> {
        try {
            const occupancy = await RealTimeOccupancy.findOne({ centerId, zone });
            if (!occupancy) {
                // Create a new record with defaults from zone data
                const zoneData = await FacilityZone.findOne({ centerId, zoneId: zone });
                const newOccupancy = new RealTimeOccupancy({
                    occupancyId: `OCC-${Date.now()}`,
                    centerId,
                    zone,
                    currentOccupancy: zoneData ? zoneData.currentOccupancy : 0,
                    capacity: zoneData ? zoneData.capacity : 0,
                    occupancyPercentage: 0,
                    lastUpdated: new Date(),
                    trend: 'stable',
                });
                return await newOccupancy.save();
            }
            return occupancy;
        } catch (error) {
            throw new Error(`Failed to get real-time occupancy: ${(error as Error).message}`);
        }
    }

    async updateOccupancy(centerId: string, zone: string, occupancy: number, capacity: number): Promise<IRealTimeOccupancy> {
        try {
            // Determine trend by comparing with previous value
            const previous = await RealTimeOccupancy.findOne({ centerId, zone });
            let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
            if (previous) {
                if (occupancy > previous.currentOccupancy) trend = 'increasing';
                else if (occupancy < previous.currentOccupancy) trend = 'decreasing';
            }

            const percentage = capacity > 0 ? Math.round((occupancy / capacity) * 100 * 100) / 100 : 0;

            const result = await RealTimeOccupancy.findOneAndUpdate(
                { centerId, zone },
                {
                    occupancyId: `OCC-${Date.now()}`,
                    centerId,
                    zone,
                    currentOccupancy: occupancy,
                    capacity,
                    occupancyPercentage: percentage,
                    lastUpdated: new Date(),
                    trend,
                },
                { new: true, upsert: true }
            );

            // Also sync the zone's currentOccupancy
            await FacilityZone.findOneAndUpdate(
                { centerId, zoneId: zone },
                { currentOccupancy: occupancy }
            );

            return result!;
        } catch (error) {
            throw new Error(`Failed to update occupancy: ${(error as Error).message}`);
        }
    }

    async predictPeakTime(centerId: string, zone: string): Promise<Date | null> {
        try {
            // Analyze heatmap data for the last 30 days to find the most common peak hour
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const peakData = await FacilityHeatmap.aggregate([
                {
                    $match: {
                        centerId,
                        zone,
                        date: { $gte: thirtyDaysAgo },
                        peakTime: true,
                    },
                },
                {
                    $group: {
                        _id: '$hour',
                        count: { $sum: 1 },
                        avgOccupancy: { $avg: '$occupancyLevel' },
                    },
                },
                { $sort: { count: -1, avgOccupancy: -1 } },
                { $limit: 1 },
            ]);

            if (peakData.length === 0) {
                return null;
            }

            const peakHour = peakData[0]._id;
            const nextPeak = new Date();
            nextPeak.setHours(peakHour, 0, 0, 0);
            if (nextPeak < new Date()) {
                nextPeak.setDate(nextPeak.getDate() + 1);
            }
            return nextPeak;
        } catch (error) {
            throw new Error(`Failed to predict peak time: ${(error as Error).message}`);
        }
    }

    // ==================== ACCESS LOGGING ====================

    async logAccess(logData: Partial<IAccessLog>): Promise<IAccessLog> {
        try {
            const log = new AccessLog({
                logId: `LOG-${Date.now()}`,
                centerId: logData.centerId,
                userId: logData.userId,
                userType: logData.userType || 'student',
                accessType: logData.accessType || 'manual',
                zone: logData.zone,
                accessTime: logData.accessTime || new Date(),
                status: logData.status || 'granted',
                reason: logData.reason,
            });
            return await log.save();
        } catch (error) {
            throw new Error(`Failed to log access: ${(error as Error).message}`);
        }
    }

    async logExit(logId: string, exitTime: Date): Promise<IAccessLog> {
        try {
            const log = await AccessLog.findOne({ logId });
            if (!log) {
                throw new Error(`Access log not found: ${logId}`);
            }

            const duration = Math.round((exitTime.getTime() - log.accessTime.getTime()) / 60000); // minutes

            const updated = await AccessLog.findOneAndUpdate(
                { logId },
                { exitTime, duration },
                { new: true }
            );
            return updated!;
        } catch (error) {
            throw new Error(`Failed to log exit: ${(error as Error).message}`);
        }
    }

    async getAccessLogs(centerId: string, filters?: any): Promise<IAccessLog[]> {
        try {
            const query: any = { centerId };

            if (filters) {
                if (filters.userId) query.userId = filters.userId;
                if (filters.zone) query.zone = filters.zone;
                if (filters.status) query.status = filters.status;
                if (filters.accessType) query.accessType = filters.accessType;
                if (filters.userType) query.userType = filters.userType;
                if (filters.startDate || filters.endDate) {
                    query.accessTime = {};
                    if (filters.startDate) query.accessTime.$gte = new Date(filters.startDate);
                    if (filters.endDate) query.accessTime.$lte = new Date(filters.endDate);
                }
            }

            return await AccessLog.find(query).sort({ accessTime: -1 });
        } catch (error) {
            throw new Error(`Failed to get access logs: ${(error as Error).message}`);
        }
    }

    // ==================== AUDIT TRAIL ====================

    async createAuditTrail(auditData: Partial<IAuditTrail>): Promise<IAuditTrail> {
        try {
            const audit = new AuditTrail({
                auditId: `AUDIT-${Date.now()}`,
                centerId: auditData.centerId,
                action: auditData.action,
                actionType: auditData.actionType || 'access_granted',
                performedBy: auditData.performedBy,
                affectedUser: auditData.affectedUser,
                details: auditData.details || {},
                timestamp: new Date(),
            });
            return await audit.save();
        } catch (error) {
            throw new Error(`Failed to create audit trail: ${(error as Error).message}`);
        }
    }

    async getAuditTrail(centerId: string, filters?: any): Promise<IAuditTrail[]> {
        try {
            const query: any = { centerId };

            if (filters) {
                if (filters.actionType) query.actionType = filters.actionType;
                if (filters.performedBy) query.performedBy = filters.performedBy;
                if (filters.startDate || filters.endDate) {
                    query.timestamp = {};
                    if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
                    if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
                }
            }

            return await AuditTrail.find(query).sort({ timestamp: -1 });
        } catch (error) {
            throw new Error(`Failed to get audit trail: ${(error as Error).message}`);
        }
    }

    // ==================== ZONE ACCESS PERMISSIONS ====================

    async createZonePermission(permissionData: Partial<IZoneAccessPermission>): Promise<IZoneAccessPermission> {
        try {
            const permission = new ZoneAccessPermission({
                permissionId: `PERM-${Date.now()}`,
                centerId: permissionData.centerId,
                zone: permissionData.zone,
                userType: permissionData.userType || 'student',
                canAccess: permissionData.canAccess !== undefined ? permissionData.canAccess : true,
                requiresApproval: permissionData.requiresApproval || false,
                approvalRequired: permissionData.approvalRequired || [],
                timeRestrictions: permissionData.timeRestrictions || [],
            });
            return await permission.save();
        } catch (error) {
            throw new Error(`Failed to create zone permission: ${(error as Error).message}`);
        }
    }

    async updateZonePermission(permissionId: string, canAccess: boolean): Promise<IZoneAccessPermission> {
        try {
            const permission = await ZoneAccessPermission.findOneAndUpdate(
                { permissionId },
                { canAccess },
                { new: true }
            );
            if (!permission) {
                throw new Error(`Zone permission not found: ${permissionId}`);
            }
            return permission;
        } catch (error) {
            throw new Error(`Failed to update zone permission: ${(error as Error).message}`);
        }
    }

    async addTimeRestriction(permissionId: string, restriction: TimeRestriction): Promise<IZoneAccessPermission> {
        try {
            const permission = await ZoneAccessPermission.findOneAndUpdate(
                { permissionId },
                { $push: { timeRestrictions: restriction } },
                { new: true }
            );
            if (!permission) {
                throw new Error(`Zone permission not found: ${permissionId}`);
            }
            return permission;
        } catch (error) {
            throw new Error(`Failed to add time restriction: ${(error as Error).message}`);
        }
    }

    // ==================== FACILITY ANALYTICS ====================

    async generateAnalytics(centerId: string, period: string, date: Date): Promise<IFacilityAnalytics> {
        try {
            let startDate: Date;
            const endDate = new Date(date);

            if (period === 'daily') {
                startDate = new Date(date);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
            } else if (period === 'weekly') {
                startDate = new Date(date);
                startDate.setDate(startDate.getDate() - 7);
            } else {
                startDate = new Date(date);
                startDate.setMonth(startDate.getMonth() - 1);
            }

            // Gather real statistics
            const totalAccess = await AccessLog.countDocuments({
                centerId,
                accessTime: { $gte: startDate, $lte: endDate },
            });
            const grantedAccess = await AccessLog.countDocuments({
                centerId,
                accessTime: { $gte: startDate, $lte: endDate },
                status: 'granted',
            });
            const deniedAccess = await AccessLog.countDocuments({
                centerId,
                accessTime: { $gte: startDate, $lte: endDate },
                status: 'denied',
            });

            // Average occupancy from heatmaps
            const occupancyData = await FacilityHeatmap.aggregate([
                { $match: { centerId, date: { $gte: startDate, $lte: endDate } } },
                {
                    $group: {
                        _id: null,
                        avgOccupancy: { $avg: '$occupancyLevel' },
                        maxOccupancy: { $max: '$occupancyLevel' },
                    },
                },
            ]);

            const avgOccupancy = occupancyData.length > 0 ? Math.round(occupancyData[0].avgOccupancy) : 0;
            const peakOccupancy = occupancyData.length > 0 ? occupancyData[0].maxOccupancy : 0;

            // Equipment utilization
            const totalEquipment = await Equipment.countDocuments({ centerId });
            const inUseEquipment = await Equipment.countDocuments({ centerId, status: 'in_use' });
            const equipmentUtilization = totalEquipment > 0 ? Math.round((inUseEquipment / totalEquipment) * 100) : 0;

            // Maintenance tickets count
            const maintenanceTicketsCount = await MaintenanceTicket.countDocuments({
                centerId,
                reportedDate: { $gte: startDate, $lte: endDate },
            });

            const analytics = await FacilityAnalytics.findOneAndUpdate(
                { centerId, period, date: startDate },
                {
                    analyticsId: `ANALYTICS-${Date.now()}`,
                    centerId,
                    period,
                    date: startDate,
                    totalAccess,
                    grantedAccess,
                    deniedAccess,
                    averageOccupancy: avgOccupancy,
                    peakOccupancy,
                    equipmentUtilization,
                    maintenanceTickets: maintenanceTicketsCount,
                },
                { new: true, upsert: true }
            );

            return analytics!;
        } catch (error) {
            throw new Error(`Failed to generate analytics: ${(error as Error).message}`);
        }
    }

    async getAccessStatistics(centerId: string, startDate: Date, endDate: Date): Promise<any> {
        try {
            const totalAccess = await AccessLog.countDocuments({
                centerId,
                accessTime: { $gte: startDate, $lte: endDate },
            });
            const grantedAccess = await AccessLog.countDocuments({
                centerId,
                accessTime: { $gte: startDate, $lte: endDate },
                status: 'granted',
            });
            const deniedAccess = await AccessLog.countDocuments({
                centerId,
                accessTime: { $gte: startDate, $lte: endDate },
                status: 'denied',
            });

            const accessByType = await AccessLog.aggregate([
                { $match: { centerId, accessTime: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: '$accessType', count: { $sum: 1 } } },
            ]);

            const accessByZone = await AccessLog.aggregate([
                { $match: { centerId, accessTime: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: '$zone', count: { $sum: 1 } } },
            ]);

            const byTypeMap: Record<string, number> = {};
            accessByType.forEach((item: any) => { byTypeMap[item._id] = item.count; });

            const byZoneMap: Record<string, number> = {};
            accessByZone.forEach((item: any) => { byZoneMap[item._id] = item.count; });

            return {
                totalAccess,
                grantedAccess,
                deniedAccess,
                accessByType: byTypeMap,
                accessByZone: byZoneMap,
            };
        } catch (error) {
            throw new Error(`Failed to get access statistics: ${(error as Error).message}`);
        }
    }

    async getEquipmentUtilization(centerId: string): Promise<any> {
        try {
            const totalEquipment = await Equipment.countDocuments({ centerId });
            const availableEquipment = await Equipment.countDocuments({ centerId, status: 'available' });
            const inUseEquipment = await Equipment.countDocuments({ centerId, status: 'in_use' });
            const maintenanceEquipment = await Equipment.countDocuments({ centerId, status: 'maintenance' });
            const utilizationPercentage = totalEquipment > 0
                ? Math.round((inUseEquipment / totalEquipment) * 100)
                : 0;

            return {
                totalEquipment,
                availableEquipment,
                inUseEquipment,
                maintenanceEquipment,
                utilizationPercentage,
            };
        } catch (error) {
            throw new Error(`Failed to get equipment utilization: ${(error as Error).message}`);
        }
    }

    async getOccupancyTrends(centerId: string, days: number): Promise<any[]> {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const trends = await FacilityHeatmap.aggregate([
                {
                    $match: {
                        centerId,
                        date: { $gte: startDate },
                    },
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                            zone: '$zone',
                        },
                        avgOccupancy: { $avg: '$occupancyLevel' },
                        peakOccupancy: { $max: '$occupancyLevel' },
                        avgStayTime: { $avg: '$averageStayTime' },
                    },
                },
                {
                    $sort: { '_id.date': 1 },
                },
            ]);

            return trends.map((t: any) => ({
                date: t._id.date,
                zone: t._id.zone,
                averageOccupancy: Math.round(t.avgOccupancy),
                peakOccupancy: t.peakOccupancy,
                averageStayTime: Math.round(t.avgStayTime),
            }));
        } catch (error) {
            throw new Error(`Failed to get occupancy trends: ${(error as Error).message}`);
        }
    }
}
