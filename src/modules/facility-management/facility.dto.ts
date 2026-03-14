// ==================== ACCESS CONTROL DTOs ====================

export class GrantAccessDTO {
    centerId: string;
    accessType: 'rfid' | 'nfc' | 'qr' | 'biometric' | 'manual';
    userId: string;
    userType: 'student' | 'parent' | 'coach' | 'staff' | 'visitor';
    zone: string;
}

export class DenyAccessDTO {
    centerId: string;
    accessType: 'rfid' | 'nfc' | 'qr' | 'biometric' | 'manual';
    userId: string;
    userType: 'student' | 'parent' | 'coach' | 'staff' | 'visitor';
    zone: string;
    reason: string;
}

export class CheckAccessPermissionDTO {
    userId: string;
    zone: string;
    centerId: string;
}

export class RecordExitDTO {
    exitTime: Date;
}

// ==================== RFID/NFC CARD DTOs ====================

export class IssueRFIDCardDTO {
    userId: string;
    userType: 'student' | 'parent' | 'coach' | 'staff';
    accessLevel: 'basic' | 'premium' | 'admin';
    zones: string[];
}

export class UpdateCardZonesDTO {
    zones: string[];
}

// ==================== QR CODE DTOs ====================

export class GenerateQRCodeDTO {
    userId: string;
    userType: 'student' | 'parent' | 'coach' | 'staff';
    accessLevel: 'basic' | 'premium' | 'admin';
    zones: string[];
}

export class ValidateQRCodeDTO {
    qrCode: string;
}

// ==================== BIOMETRIC DTOs ====================

export class RegisterBiometricDTO {
    userId: string;
    userType: 'student' | 'parent' | 'coach' | 'staff';
    biometricType: 'fingerprint' | 'facial' | 'iris' | 'palm';
    biometricData: string;
}

export class VerifyBiometricDTO {
    userId: string;
    biometricData: string;
}

// ==================== FACILITY ZONE DTOs ====================

export class CreateZoneDTO {
    centerId: string;
    zoneName: string;
    zoneType: 'gym' | 'observation' | 'office' | 'storage' | 'common' | 'restricted';
    description: string;
    capacity: number;
    allowedUserTypes: string[];
    accessRequirements: string[];
    equipment: string[];
}

export class UpdateZoneOccupancyDTO {
    occupancy: number;
}

export class UpdateZoneAccessRequirementsDTO {
    requirements: string[];
}

// ==================== EQUIPMENT BOOKING DTOs ====================

export class BookEquipmentDTO {
    centerId: string;
    equipmentId: string;
    equipmentName: string;
    bookedBy: string;
    bookingDate: Date;
    startTime: Date;
    endTime: Date;
    duration: number;
    notes?: string;
}

export class CheckEquipmentAvailabilityDTO {
    equipmentId: string;
    startTime: Date;
    endTime: Date;
}

// ==================== EQUIPMENT DTOs ====================

export class CreateEquipmentDTO {
    centerId: string;
    equipmentName: string;
    equipmentType: 'beam' | 'trampoline' | 'mat' | 'bar' | 'vault' | 'other';
    zone: string;
    purchaseDate: Date;
}

export class UpdateEquipmentStatusDTO {
    status: 'available' | 'in_use' | 'maintenance' | 'retired';
}

// ==================== MAINTENANCE DTOs ====================

export class CreateMaintenanceTicketDTO {
    centerId: string;
    equipmentId: string;
    equipmentName: string;
    reportedBy: string;
    issueType: 'damage' | 'malfunction' | 'safety' | 'cleaning' | 'other';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export class AssignMaintenanceTicketDTO {
    assignedTo: string;
}

export class ResolveMaintenanceTicketDTO {
    resolutionNotes: string;
}

// ==================== SMART LOCK DTOs ====================

export class CreateSmartLockDTO {
    centerId: string;
    zone: string;
    lockName: string;
    lockType: 'electronic' | 'biometric' | 'rfid' | 'hybrid';
}

export class UnlockDoorDTO {
    userId: string;
    accessMethod: 'rfid' | 'nfc' | 'qr' | 'biometric' | 'manual';
}

export class UpdateBatteryLevelDTO {
    level: number;
}

// ==================== HEATMAP & OCCUPANCY DTOs ====================

export class GenerateHeatmapDTO {
    centerId: string;
    zone: string;
    date: Date;
}

export class UpdateOccupancyDTO {
    centerId: string;
    zone: string;
    occupancy: number;
    capacity: number;
}

// ==================== ACCESS LOGGING DTOs ====================

export class LogAccessDTO {
    centerId: string;
    userId: string;
    userType: 'student' | 'parent' | 'coach' | 'staff' | 'visitor';
    accessType: 'rfid' | 'nfc' | 'qr' | 'biometric' | 'manual';
    zone: string;
    accessTime: Date;
    status: 'granted' | 'denied';
    reason?: string;
}

export class LogExitDTO {
    exitTime: Date;
}

// ==================== AUDIT TRAIL DTOs ====================

export class CreateAuditTrailDTO {
    centerId: string;
    action: string;
    actionType: 'access_granted' | 'access_denied' | 'equipment_booked' | 'maintenance_logged' | 'lock_opened' | 'lock_closed';
    performedBy: string;
    affectedUser?: string;
    details: any;
}

// ==================== ZONE PERMISSIONS DTOs ====================

export class CreateZonePermissionDTO {
    centerId: string;
    zone: string;
    userType: 'student' | 'parent' | 'coach' | 'staff' | 'visitor';
    canAccess: boolean;
    requiresApproval: boolean;
    approvalRequired: string[];
    timeRestrictions?: TimeRestrictionDTO[];
}

export class UpdateZonePermissionDTO {
    canAccess: boolean;
}

export class TimeRestrictionDTO {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    startTime: string;
    endTime: string;
    allowed: boolean;
}

// ==================== ANALYTICS DTOs ====================

export class GenerateAnalyticsDTO {
    centerId: string;
    period: 'daily' | 'weekly' | 'monthly';
    date: Date;
}

export class GetAccessStatisticsDTO {
    centerId: string;
    startDate: Date;
    endDate: Date;
}

export class GetOccupancyTrendsDTO {
    centerId: string;
    days: number;
}

// ==================== RESPONSE DTOs ====================

export class AccessControlResponseDTO {
    accessId: string;
    centerId: string;
    accessType: string;
    userId: string;
    userType: string;
    accessTime: Date;
    exitTime?: Date;
    zone: string;
    status: string;
    reason?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class RFIDCardResponseDTO {
    cardId: string;
    cardNumber: string;
    userId: string;
    userType: string;
    isActive: boolean;
    issuedDate: Date;
    expiryDate?: Date;
    lastUsedDate?: Date;
    accessLevel: string;
    zones: string[];
    createdAt: Date;
    updatedAt: Date;
}

export class QRCodeResponseDTO {
    qrId: string;
    qrCode: string;
    userId: string;
    userType: string;
    isActive: boolean;
    issuedDate: Date;
    expiryDate?: Date;
    lastUsedDate?: Date;
    accessLevel: string;
    zones: string[];
    createdAt: Date;
    updatedAt: Date;
}

export class BiometricResponseDTO {
    biometricId: string;
    userId: string;
    userType: string;
    biometricType: string;
    isActive: boolean;
    registeredDate: Date;
    lastUsedDate?: Date;
    accessLevel: string;
    zones: string[];
    createdAt: Date;
    updatedAt: Date;
}

export class FacilityZoneResponseDTO {
    zoneId: string;
    centerId: string;
    zoneName: string;
    zoneType: string;
    description: string;
    capacity: number;
    currentOccupancy: number;
    allowedUserTypes: string[];
    accessRequirements: string[];
    equipment: string[];
    createdAt: Date;
    updatedAt: Date;
}

export class EquipmentBookingResponseDTO {
    bookingId: string;
    centerId: string;
    equipmentId: string;
    equipmentName: string;
    bookedBy: string;
    bookingDate: Date;
    startTime: Date;
    endTime: Date;
    duration: number;
    status: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class EquipmentResponseDTO {
    equipmentId: string;
    centerId: string;
    equipmentName: string;
    equipmentType: string;
    zone: string;
    status: string;
    purchaseDate: Date;
    lastMaintenanceDate?: Date;
    nextMaintenanceDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class MaintenanceTicketResponseDTO {
    ticketId: string;
    centerId: string;
    equipmentId: string;
    equipmentName: string;
    reportedBy: string;
    reportedDate: Date;
    issueType: string;
    description: string;
    severity: string;
    status: string;
    assignedTo?: string;
    resolvedDate?: Date;
    resolutionNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class SmartLockResponseDTO {
    lockId: string;
    centerId: string;
    zone: string;
    lockName: string;
    lockType: string;
    isActive: boolean;
    batteryLevel: number;
    lastBatteryCheck?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class FacilityHeatmapResponseDTO {
    heatmapId: string;
    centerId: string;
    zone: string;
    date: Date;
    hour: number;
    occupancyLevel: number;
    peakTime: boolean;
    averageStayTime: number;
    trafficFlow: string;
    createdAt: Date;
    updatedAt: Date;
}

export class RealTimeOccupancyResponseDTO {
    occupancyId: string;
    centerId: string;
    zone: string;
    currentOccupancy: number;
    capacity: number;
    occupancyPercentage: number;
    lastUpdated: Date;
    trend: string;
    estimatedPeakTime?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class AccessLogResponseDTO {
    logId: string;
    centerId: string;
    userId: string;
    userType: string;
    accessType: string;
    zone: string;
    accessTime: Date;
    exitTime?: Date;
    duration?: number;
    status: string;
    reason?: string;
    createdAt: Date;
}

export class AuditTrailResponseDTO {
    auditId: string;
    centerId: string;
    action: string;
    actionType: string;
    performedBy: string;
    affectedUser?: string;
    details: any;
    timestamp: Date;
    createdAt: Date;
}

export class ZoneAccessPermissionResponseDTO {
    permissionId: string;
    centerId: string;
    zone: string;
    userType: string;
    canAccess: boolean;
    requiresApproval: boolean;
    approvalRequired: string[];
    timeRestrictions?: TimeRestrictionDTO[];
    createdAt: Date;
    updatedAt: Date;
}

export class FacilityAnalyticsResponseDTO {
    analyticsId: string;
    centerId: string;
    period: string;
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
