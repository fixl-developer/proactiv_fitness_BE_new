import { Schema, model, Document } from 'mongoose';
import { baseSchemaOptions } from '../../shared/base/base.model';

// ==================== INTERFACES ====================

export interface IAccessControl extends Document {
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
}

export interface IRFIDCard extends Document {
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
}

export interface IQRCode extends Document {
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
}

export interface IBiometric extends Document {
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
}

export interface IFacilityZone extends Document {
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
    isActive: boolean;
}

export interface IEquipmentBooking extends Document {
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

export interface IEquipment extends Document {
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
}

export interface IMaintenanceTicket extends Document {
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
}

export interface AccessLogEntry {
    logId: string;
    userId: string;
    accessTime: Date;
    accessMethod: 'rfid' | 'nfc' | 'qr' | 'biometric' | 'manual';
    status: 'granted' | 'denied';
    reason?: string;
}

export interface ISmartLock extends Document {
    lockId: string;
    centerId: string;
    zone: string;
    lockName: string;
    lockType: 'electronic' | 'biometric' | 'rfid' | 'hybrid';
    isActive: boolean;
    batteryLevel: number;
    lastBatteryCheck?: Date;
    accessLog: AccessLogEntry[];
}

export interface IFacilityHeatmap extends Document {
    heatmapId: string;
    centerId: string;
    zone: string;
    date: Date;
    hour: number;
    occupancyLevel: number;
    peakTime: boolean;
    averageStayTime: number;
    trafficFlow: 'low' | 'medium' | 'high' | 'peak';
}

export interface IRealTimeOccupancy extends Document {
    occupancyId: string;
    centerId: string;
    zone: string;
    currentOccupancy: number;
    capacity: number;
    occupancyPercentage: number;
    lastUpdated: Date;
    trend: 'increasing' | 'decreasing' | 'stable';
    estimatedPeakTime?: Date;
}

export interface IAccessLog extends Document {
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
}

export interface IAuditTrail extends Document {
    auditId: string;
    centerId: string;
    action: string;
    actionType: 'access_granted' | 'access_denied' | 'equipment_booked' | 'maintenance_logged' | 'lock_opened' | 'lock_closed';
    performedBy: string;
    affectedUser?: string;
    details: any;
    timestamp: Date;
}

export interface TimeRestriction {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    startTime: string;
    endTime: string;
    allowed: boolean;
}

export interface IZoneAccessPermission extends Document {
    permissionId: string;
    centerId: string;
    zone: string;
    userType: 'student' | 'parent' | 'coach' | 'staff' | 'visitor';
    canAccess: boolean;
    requiresApproval: boolean;
    approvalRequired: string[];
    timeRestrictions?: TimeRestriction[];
}

export interface IFacilityAnalytics extends Document {
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
}

// ==================== SCHEMAS ====================

const accessControlSchema = new Schema<IAccessControl>({
    accessId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    accessType: { type: String, enum: ['rfid', 'nfc', 'qr', 'biometric', 'manual'], required: true },
    userId: { type: String, required: true, index: true },
    userType: { type: String, enum: ['student', 'parent', 'coach', 'staff', 'visitor'], required: true },
    accessTime: { type: Date, required: true, index: true },
    exitTime: { type: Date },
    zone: { type: String, required: true, index: true },
    status: { type: String, enum: ['granted', 'denied', 'pending'], required: true, index: true },
    reason: { type: String, trim: true },
}, baseSchemaOptions);

const rfidCardSchema = new Schema<IRFIDCard>({
    cardId: { type: String, required: true, unique: true, index: true },
    cardNumber: { type: String, required: true, unique: true, trim: true },
    userId: { type: String, required: true, index: true },
    userType: { type: String, enum: ['student', 'parent', 'coach', 'staff'], required: true },
    isActive: { type: Boolean, default: true, index: true },
    issuedDate: { type: Date, required: true },
    expiryDate: { type: Date },
    lastUsedDate: { type: Date },
    accessLevel: { type: String, enum: ['basic', 'premium', 'admin'], required: true },
    zones: [{ type: String }],
}, baseSchemaOptions);

const qrCodeSchema = new Schema<IQRCode>({
    qrId: { type: String, required: true, unique: true, index: true },
    qrCode: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    userType: { type: String, enum: ['student', 'parent', 'coach', 'staff'], required: true },
    isActive: { type: Boolean, default: true, index: true },
    issuedDate: { type: Date, required: true },
    expiryDate: { type: Date },
    lastUsedDate: { type: Date },
    accessLevel: { type: String, enum: ['basic', 'premium', 'admin'], required: true },
    zones: [{ type: String }],
}, baseSchemaOptions);

const biometricSchema = new Schema<IBiometric>({
    biometricId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userType: { type: String, enum: ['student', 'parent', 'coach', 'staff'], required: true },
    biometricType: { type: String, enum: ['fingerprint', 'facial', 'iris', 'palm'], required: true },
    biometricData: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
    registeredDate: { type: Date, required: true },
    lastUsedDate: { type: Date },
    accessLevel: { type: String, enum: ['basic', 'premium', 'admin'], required: true },
    zones: [{ type: String }],
}, baseSchemaOptions);

const facilityZoneSchema = new Schema<IFacilityZone>({
    zoneId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    zoneName: { type: String, required: true, trim: true },
    zoneType: { type: String, enum: ['gym', 'observation', 'office', 'storage', 'common', 'restricted'], required: true },
    description: { type: String, trim: true },
    capacity: { type: Number, required: true, min: 0 },
    currentOccupancy: { type: Number, default: 0, min: 0 },
    allowedUserTypes: [{ type: String, enum: ['student', 'parent', 'coach', 'staff', 'visitor'] }],
    accessRequirements: [{ type: String }],
    equipment: [{ type: String }],
    isActive: { type: Boolean, default: true, index: true },
}, baseSchemaOptions);

const maintenanceRecordSubSchema = new Schema({
    recordId: { type: String, required: true },
    maintenanceDate: { type: Date, required: true },
    maintenanceType: { type: String, enum: ['routine', 'repair', 'inspection'], required: true },
    description: { type: String, trim: true },
    performedBy: { type: String, required: true },
    cost: { type: Number, min: 0 },
    nextScheduledDate: { type: Date },
}, { _id: false });

const equipmentBookingSchema = new Schema<IEquipmentBooking>({
    bookingId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    equipmentId: { type: String, required: true, index: true },
    equipmentName: { type: String, required: true, trim: true },
    bookedBy: { type: String, required: true, index: true },
    bookingDate: { type: Date, required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'confirmed', 'in_use', 'completed', 'cancelled'], default: 'pending', index: true },
    notes: { type: String, trim: true },
}, baseSchemaOptions);

const equipmentSchema = new Schema<IEquipment>({
    equipmentId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    equipmentName: { type: String, required: true, trim: true },
    equipmentType: { type: String, enum: ['beam', 'trampoline', 'mat', 'bar', 'vault', 'other'], required: true },
    zone: { type: String, required: true, index: true },
    status: { type: String, enum: ['available', 'in_use', 'maintenance', 'retired'], default: 'available', index: true },
    purchaseDate: { type: Date, required: true },
    lastMaintenanceDate: { type: Date },
    nextMaintenanceDate: { type: Date },
    maintenanceHistory: [maintenanceRecordSubSchema],
}, baseSchemaOptions);

const maintenanceTicketSchema = new Schema<IMaintenanceTicket>({
    ticketId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    equipmentId: { type: String, required: true, index: true },
    equipmentName: { type: String, required: true, trim: true },
    reportedBy: { type: String, required: true },
    reportedDate: { type: Date, required: true },
    issueType: { type: String, enum: ['damage', 'malfunction', 'safety', 'cleaning', 'other'], required: true },
    description: { type: String, required: true, trim: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true, index: true },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open', index: true },
    assignedTo: { type: String },
    resolvedDate: { type: Date },
    resolutionNotes: { type: String, trim: true },
}, baseSchemaOptions);

const accessLogEntrySubSchema = new Schema({
    logId: { type: String, required: true },
    userId: { type: String, required: true },
    accessTime: { type: Date, required: true },
    accessMethod: { type: String, enum: ['rfid', 'nfc', 'qr', 'biometric', 'manual'], required: true },
    status: { type: String, enum: ['granted', 'denied'], required: true },
    reason: { type: String, trim: true },
}, { _id: false });

const smartLockSchema = new Schema<ISmartLock>({
    lockId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    zone: { type: String, required: true, index: true },
    lockName: { type: String, required: true, trim: true },
    lockType: { type: String, enum: ['electronic', 'biometric', 'rfid', 'hybrid'], required: true },
    isActive: { type: Boolean, default: true, index: true },
    batteryLevel: { type: Number, default: 100, min: 0, max: 100 },
    lastBatteryCheck: { type: Date },
    accessLog: [accessLogEntrySubSchema],
}, baseSchemaOptions);

const facilityHeatmapSchema = new Schema<IFacilityHeatmap>({
    heatmapId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    zone: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    hour: { type: Number, required: true, min: 0, max: 23 },
    occupancyLevel: { type: Number, default: 0, min: 0 },
    peakTime: { type: Boolean, default: false },
    averageStayTime: { type: Number, default: 0, min: 0 },
    trafficFlow: { type: String, enum: ['low', 'medium', 'high', 'peak'], default: 'low' },
}, baseSchemaOptions);

const realTimeOccupancySchema = new Schema<IRealTimeOccupancy>({
    occupancyId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    zone: { type: String, required: true, index: true },
    currentOccupancy: { type: Number, default: 0, min: 0 },
    capacity: { type: Number, required: true, min: 0 },
    occupancyPercentage: { type: Number, default: 0, min: 0, max: 100 },
    lastUpdated: { type: Date, default: Date.now },
    trend: { type: String, enum: ['increasing', 'decreasing', 'stable'], default: 'stable' },
    estimatedPeakTime: { type: Date },
}, baseSchemaOptions);

const accessLogSchema = new Schema<IAccessLog>({
    logId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    userType: { type: String, enum: ['student', 'parent', 'coach', 'staff', 'visitor'], required: true },
    accessType: { type: String, enum: ['rfid', 'nfc', 'qr', 'biometric', 'manual'], required: true },
    zone: { type: String, required: true, index: true },
    accessTime: { type: Date, required: true, index: true },
    exitTime: { type: Date },
    duration: { type: Number, min: 0 },
    status: { type: String, enum: ['granted', 'denied'], required: true, index: true },
    reason: { type: String, trim: true },
}, baseSchemaOptions);

const auditTrailSchema = new Schema<IAuditTrail>({
    auditId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    action: { type: String, required: true, trim: true },
    actionType: { type: String, enum: ['access_granted', 'access_denied', 'equipment_booked', 'maintenance_logged', 'lock_opened', 'lock_closed'], required: true, index: true },
    performedBy: { type: String, required: true },
    affectedUser: { type: String },
    details: { type: Schema.Types.Mixed },
    timestamp: { type: Date, required: true, index: true },
}, baseSchemaOptions);

const timeRestrictionSubSchema = new Schema({
    day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    allowed: { type: Boolean, default: true },
}, { _id: false });

const zoneAccessPermissionSchema = new Schema<IZoneAccessPermission>({
    permissionId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    zone: { type: String, required: true, index: true },
    userType: { type: String, enum: ['student', 'parent', 'coach', 'staff', 'visitor'], required: true },
    canAccess: { type: Boolean, default: true },
    requiresApproval: { type: Boolean, default: false },
    approvalRequired: [{ type: String }],
    timeRestrictions: [timeRestrictionSubSchema],
}, baseSchemaOptions);

const facilityAnalyticsSchema = new Schema<IFacilityAnalytics>({
    analyticsId: { type: String, required: true, unique: true, index: true },
    centerId: { type: String, required: true, index: true },
    period: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true, index: true },
    date: { type: Date, required: true, index: true },
    totalAccess: { type: Number, default: 0, min: 0 },
    grantedAccess: { type: Number, default: 0, min: 0 },
    deniedAccess: { type: Number, default: 0, min: 0 },
    averageOccupancy: { type: Number, default: 0, min: 0 },
    peakOccupancy: { type: Number, default: 0, min: 0 },
    equipmentUtilization: { type: Number, default: 0, min: 0, max: 100 },
    maintenanceTickets: { type: Number, default: 0, min: 0 },
}, baseSchemaOptions);

// ==================== COMPOUND INDEXES ====================

accessControlSchema.index({ centerId: 1, userId: 1, accessTime: -1 });
rfidCardSchema.index({ userId: 1, isActive: 1 });
facilityZoneSchema.index({ centerId: 1, zoneType: 1 });
equipmentBookingSchema.index({ equipmentId: 1, startTime: 1, endTime: 1 });
accessLogSchema.index({ centerId: 1, accessTime: -1 });
auditTrailSchema.index({ centerId: 1, timestamp: -1 });
zoneAccessPermissionSchema.index({ centerId: 1, zone: 1, userType: 1 });
realTimeOccupancySchema.index({ centerId: 1, zone: 1 }, { unique: true });

// ==================== EXPORT MODELS ====================

export const AccessControl = model<IAccessControl>('AccessControl', accessControlSchema);
export const RFIDCard = model<IRFIDCard>('RFIDCard', rfidCardSchema);
export const QRCode = model<IQRCode>('QRCode', qrCodeSchema);
export const Biometric = model<IBiometric>('Biometric', biometricSchema);
export const FacilityZone = model<IFacilityZone>('FacilityZone', facilityZoneSchema);
export const EquipmentBooking = model<IEquipmentBooking>('EquipmentBooking', equipmentBookingSchema);
export const Equipment = model<IEquipment>('Equipment', equipmentSchema);
export const MaintenanceTicket = model<IMaintenanceTicket>('MaintenanceTicket', maintenanceTicketSchema);
export const SmartLock = model<ISmartLock>('SmartLock', smartLockSchema);
export const FacilityHeatmap = model<IFacilityHeatmap>('FacilityHeatmap', facilityHeatmapSchema);
export const RealTimeOccupancy = model<IRealTimeOccupancy>('RealTimeOccupancy', realTimeOccupancySchema);
export const AccessLog = model<IAccessLog>('AccessLog', accessLogSchema);
export const AuditTrail = model<IAuditTrail>('AuditTrail', auditTrailSchema);
export const ZoneAccessPermission = model<IZoneAccessPermission>('ZoneAccessPermission', zoneAccessPermissionSchema);
export const FacilityAnalytics = model<IFacilityAnalytics>('FacilityAnalytics', facilityAnalyticsSchema);
