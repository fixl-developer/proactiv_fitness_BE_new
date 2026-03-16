// Facility & Access Control Data Models

// Access Control Model
export interface IAccessControl {
    accessId: string;
    centerId: string;
    accessType: 'rfid' | 'nfc' | 'qr' | 'biometric' | 'manual';
    userId: string;
    userType: 'student' | 'parent' | 'coach' | 'staff' | 'visitor';
    accessTime: Date;
    exitTime?: Date;
    zone: string;
    status: 'granted' | 'denied' | 'pending';
    reason?: string;
    createdAt: Date;
    updatedAt: Date;
}

// RFID/NFC Card Model
export interface IRFIDCard {
    cardId: string;
    cardNumber: string;
    userId: string;
    userType: 'student' | 'parent' | 'coach' | 'staff';
    isActive: boolean;
    issuedDate: Date;
    expiryDate?: Date;
    lastUsedDate?: Date;
    accessLevel: 'basic' | 'premium' | 'admin';
    zones: string[];
    createdAt: Date;
    updatedAt: Date;
}

// QR Code Model
export interface IQRCode {
    qrId: string;
    qrCode: string;
    userId: string;
    userType: 'student' | 'parent' | 'coach' | 'staff';
    isActive: boolean;
    issuedDate: Date;
    expiryDate?: Date;
    lastUsedDate?: Date;
    accessLevel: 'basic' | 'premium' | 'admin';
    zones: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Biometric Model
export interface IBiometric {
    biometricId: string;
    userId: string;
    userType: 'student' | 'parent' | 'coach' | 'staff';
    biometricType: 'fingerprint' | 'facial' | 'iris' | 'palm';
    biometricData: string;
    isActive: boolean;
    registeredDate: Date;
    lastUsedDate?: Date;
    accessLevel: 'basic' | 'premium' | 'admin';
    zones: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Facility Zone Model
export interface IFacilityZone {
    zoneId: string;
    centerId: string;
    zoneName: string;
    zoneType: 'gym' | 'observation' | 'office' | 'storage' | 'common' | 'restricted';
    description: string;
    capacity: number;
    currentOccupancy: number;
    allowedUserTypes: string[];
    accessRequirements: string[];
    equipment: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Equipment Booking Model
export interface IEquipmentBooking {
    bookingId: string;
    centerId: string;
    equipmentId: string;
    equipmentName: string;
    bookedBy: string;
    bookingDate: Date;
    startTime: Date;
    endTime: Date;
    duration: number;
    status: 'pending' | 'confirmed' | 'in_use' | 'completed' | 'cancelled';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Equipment Model
export interface IEquipment {
    equipmentId: string;
    centerId: string;
    equipmentName: string;
    equipmentType: 'beam' | 'trampoline' | 'mat' | 'bar' | 'vault' | 'other';
    zone: string;
    status: 'available' | 'in_use' | 'maintenance' | 'retired';
    purchaseDate: Date;
    lastMaintenanceDate?: Date;
    nextMaintenanceDate?: Date;
    maintenanceHistory: MaintenanceRecord[];
    createdAt: Date;
    updatedAt: Date;
}

export interface MaintenanceRecord {
    recordId: string;
    maintenanceDate: Date;
    maintenanceType: 'routine' | 'repair' | 'inspection';
    description: string;
    performedBy: string;
    cost?: number;
    nextScheduledDate?: Date;
}

// Maintenance Ticket Model
export interface IMaintenanceTicket {
    ticketId: string;
    centerId: string;
    equipmentId: string;
    equipmentName: string;
    reportedBy: string;
    reportedDate: Date;
    issueType: 'damage' | 'malfunction' | 'safety' | 'cleaning' | 'other';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    assignedTo?: string;
    resolvedDate?: Date;
    resolutionNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Smart Lock Model
export interface ISmartLock {
    lockId: string;
    centerId: string;
    zone: string;
    lockName: string;
    lockType: 'electronic' | 'biometric' | 'rfid' | 'hybrid';
    isActive: boolean;
    batteryLevel: number;
    lastBatteryCheck?: Date;
    accessLog: AccessLogEntry[];
    createdAt: Date;
    updatedAt: Date;
}

export interface AccessLogEntry {
    logId: string;
    userId: string;
    accessTime: Date;
    accessMethod: 'rfid' | 'nfc' | 'qr' | 'biometric' | 'manual';
    status: 'granted' | 'denied';
    reason?: string;
}

// Facility Heatmap Model
export interface IFacilityHeatmap {
    heatmapId: string;
    centerId: string;
    zone: string;
    date: Date;
    hour: number;
    occupancyLevel: number;
    peakTime: boolean;
    averageStayTime: number;
    trafficFlow: 'low' | 'medium' | 'high' | 'peak';
    createdAt: Date;
    updatedAt: Date;
}

// Real-time Occupancy Model
export interface IRealTimeOccupancy {
    occupancyId: string;
    centerId: string;
    zone: string;
    currentOccupancy: number;
    capacity: number;
    occupancyPercentage: number;
    lastUpdated: Date;
    trend: 'increasing' | 'decreasing' | 'stable';
    estimatedPeakTime?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Access Log Model
export interface IAccessLog {
    logId: string;
    centerId: string;
    userId: string;
    userType: 'student' | 'parent' | 'coach' | 'staff' | 'visitor';
    accessType: 'rfid' | 'nfc' | 'qr' | 'biometric' | 'manual';
    zone: string;
    accessTime: Date;
    exitTime?: Date;
    duration?: number;
    status: 'granted' | 'denied';
    reason?: string;
    createdAt: Date;
}

// Audit Trail Model
export interface IAuditTrail {
    auditId: string;
    centerId: string;
    action: string;
    actionType: 'access_granted' | 'access_denied' | 'equipment_booked' | 'maintenance_logged' | 'lock_opened' | 'lock_closed';
    performedBy: string;
    affectedUser?: string;
    details: any;
    timestamp: Date;
    createdAt: Date;
}

// Zone Access Permission Model
export interface IZoneAccessPermission {
    permissionId: string;
    centerId: string;
    zone: string;
    userType: 'student' | 'parent' | 'coach' | 'staff' | 'visitor';
    canAccess: boolean;
    requiresApproval: boolean;
    approvalRequired: string[];
    timeRestrictions?: TimeRestriction[];
    createdAt: Date;
    updatedAt: Date;
}

export interface TimeRestriction {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    startTime: string;
    endTime: string;
    allowed: boolean;
}

// Facility Analytics Model
export interface IFacilityAnalytics {
    analyticsId: string;
    centerId: string;
    period: 'daily' | 'weekly' | 'monthly';
    date: Date;
    totalAccess: number;
    grantedAccess: number;
    deniedAccess: number;
    averageOccupancy: number;
    peakOccupancy: number;
    equipmentUtilization: number;
    maintenanceTickets: number;
    createdAt: Date;
}
