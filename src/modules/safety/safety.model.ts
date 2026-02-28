import { Schema, model } from 'mongoose';
import {
    IAuthorizedGuardian,
    IPickupRecord,
    IRestrictionOrder,
    IEmergencyProtocol,
    IEmergencyIncident,
    ICrisisMode,
    IIncidentReport,
    IEmergencyBroadcast,
    GuardianType,
    PickupStatus,
    RestrictionType,
    RestrictionSeverity,
    EmergencyType,
    EmergencyStatus,
    VerificationMethod,
    CrisisLevel,
    CrisisType,
    BroadcastType,
    IncidentSeverity
} from './safety.interface';
import { baseSchemaOptions } from '../../shared/base/base.model';

// Address Schema
const addressSchema = new Schema({
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true }
});

// Legal Document Schema
const legalDocumentSchema = new Schema({
    documentType: { type: String, required: true, trim: true },
    documentUrl: { type: String, required: true, trim: true },
    expiryDate: Date,
    isVerified: { type: Boolean, default: false }
});

// Authorized Guardian Schema
const authorizedGuardianSchema = new Schema<IAuthorizedGuardian>({
    // Guardian Information
    guardianId: { type: String, required: true, unique: true, index: true },
    childId: { type: String, required: true, index: true },
    guardianType: { type: String, enum: Object.values(GuardianType), required: true, index: true },

    // Personal Information
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    relationship: { type: String, required: true, trim: true, maxlength: 50 },
    dateOfBirth: Date,

    // Contact Information
    phone: { type: String, required: true, trim: true },
    alternatePhone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: addressSchema,

    // Identification
    idType: { type: String, enum: ['passport', 'national_id', 'driving_license', 'other'], required: true },
    idNumber: { type: String, required: true, trim: true },
    idExpiryDate: Date,
    idPhotoUrl: { type: String, trim: true },

    // Verification
    isVerified: { type: Boolean, default: false, index: true },
    verificationMethod: [{ type: String, enum: Object.values(VerificationMethod) }],
    verificationDate: Date,
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },

    // Authorization Details
    canPickup: { type: Boolean, default: true },
    canDropOff: { type: Boolean, default: true },
    canAuthorizeOthers: { type: Boolean, default: false },
    pickupDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
    pickupTimeRestrictions: {
        startTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
        endTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
    },

    // Security
    pinCode: { type: String, trim: true, minlength: 4, maxlength: 8 },
    biometricData: { type: String, trim: true },
    photoUrl: { type: String, trim: true },
    signatureUrl: { type: String, trim: true },

    // Status
    isActive: { type: Boolean, default: true, index: true },
    isBlocked: { type: Boolean, default: false, index: true },
    blockReason: { type: String, trim: true },
    blockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    blockedAt: Date,

    // Emergency Authorization
    isEmergencyContact: { type: Boolean, default: false, index: true },
    emergencyPriority: { type: Number, min: 1, max: 10 },

    // Legal Documentation
    legalDocuments: [legalDocumentSchema],

    // Business Context
    businessUnitId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    locationIds: [{ type: Schema.Types.ObjectId, ref: 'Location' }],

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Pickup Record Schema
const pickupRecordSchema = new Schema<IPickupRecord>({
    // Basic Information
    pickupId: { type: String, required: true, unique: true, index: true },
    childId: { type: String, required: true, index: true },
    childName: { type: String, required: true, trim: true },
    sessionId: { type: String, index: true },

    // Guardian Information
    guardianId: { type: String, required: true, index: true },
    guardianName: { type: String, required: true, trim: true },
    guardianType: { type: String, enum: Object.values(GuardianType), required: true },

    // Pickup Details
    scheduledPickupTime: Date,
    actualPickupTime: Date,
    status: { type: String, enum: Object.values(PickupStatus), default: PickupStatus.PENDING, index: true },

    // Location Information
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    pickupLocation: { type: String, trim: true },

    // Verification
    verificationMethod: { type: String, enum: Object.values(VerificationMethod), required: true },
    verificationData: {
        idVerified: { type: Boolean, default: false },
        idNumber: { type: String, trim: true },
        photoTaken: { type: Boolean, default: false },
        signatureRequired: { type: Boolean, default: false },
        signatureUrl: { type: String, trim: true },
        biometricVerified: { type: Boolean, default: false },
        pinVerified: { type: Boolean, default: false }
    },

    // Staff Information
    authorizedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorizedByName: { type: String, required: true, trim: true },
    witnessedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    witnessedByName: { type: String, trim: true },

    // Late Pickup Handling
    isLate: { type: Boolean, default: false, index: true },
    lateMinutes: { type: Number, min: 0 },
    latePickupFee: { type: Number, min: 0 },
    latePickupReason: { type: String, trim: true },
    parentNotified: { type: Boolean, default: false },
    notificationTime: Date,

    // Emergency Information
    isEmergencyPickup: { type: Boolean, default: false, index: true },
    emergencyReason: { type: String, trim: true },
    emergencyApprovedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    emergencyDocumentation: [String],

    // Special Instructions
    specialInstructions: { type: String, trim: true },
    medicalAlerts: [String],
    behavioralNotes: [String],

    // Documentation
    photos: [String],
    documents: [String],
    notes: { type: String, trim: true },

    // Business Context
    businessUnitId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Restriction Order Schema
const restrictionOrderSchema = new Schema<IRestrictionOrder>({
    // Basic Information
    restrictionId: { type: String, required: true, unique: true, index: true },
    childId: { type: String, required: true, index: true },
    childName: { type: String, required: true, trim: true },

    // Restriction Details
    restrictionType: { type: String, enum: Object.values(RestrictionType), required: true, index: true },
    severity: { type: String, enum: Object.values(RestrictionSeverity), required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },

    // Restricted Person Information
    restrictedPersonId: { type: String, index: true },
    restrictedPersonName: { type: String, required: true, trim: true },
    restrictedPersonDetails: {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        relationship: { type: String, trim: true },
        idType: { type: String, trim: true },
        idNumber: { type: String, trim: true },
        photoUrl: { type: String, trim: true },
        physicalDescription: { type: String, trim: true },
        knownAliases: [String]
    },

    // Legal Information
    courtOrderNumber: { type: String, trim: true },
    issuingCourt: { type: String, trim: true },
    legalDocumentUrl: { type: String, trim: true },
    legalRepresentative: {
        name: { type: String, trim: true },
        phone: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        firm: { type: String, trim: true }
    },

    // Restriction Scope
    restrictionScope: {
        noContact: { type: Boolean, default: false },
        noPickup: { type: Boolean, default: true },
        noDropOff: { type: Boolean, default: true },
        noFacilityAccess: { type: Boolean, default: true },
        noInformation: { type: Boolean, default: true },
        noPhotos: { type: Boolean, default: true },
        proximityRestriction: { type: Number, min: 0 }
    },

    // Validity
    effectiveDate: { type: Date, required: true, index: true },
    expiryDate: { type: Date, index: true },
    isActive: { type: Boolean, default: true, index: true },

    // Enforcement
    enforcementInstructions: { type: String, required: true, trim: true },
    escalationProcedure: { type: String, required: true, trim: true },
    policeContactRequired: { type: Boolean, default: false },
    emergencyContacts: [{
        name: { type: String, required: true, trim: true },
        role: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        priority: { type: Number, required: true, min: 1 }
    }],

    // Violation Tracking
    violations: [{
        violationId: { type: String, required: true },
        violationDate: { type: Date, required: true },
        violationType: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        actionTaken: { type: String, required: true, trim: true },
        reportedBy: { type: String, required: true },
        policeNotified: { type: Boolean, default: false },
        documentationUrl: { type: String, trim: true }
    }],

    // Notifications
    alertStaff: { type: Boolean, default: true },
    alertSecurity: { type: Boolean, default: true },
    alertManagement: { type: Boolean, default: true },
    notificationRecipients: [String],

    // Business Context
    businessUnitId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    locationIds: [{ type: Schema.Types.ObjectId, ref: 'Location' }],

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Emergency Protocol Schema
const emergencyProtocolSchema = new Schema<IEmergencyProtocol>({
    // Protocol Information
    protocolId: { type: String, required: true, unique: true, index: true },
    protocolName: { type: String, required: true, trim: true, maxlength: 100 },
    emergencyType: { type: String, enum: Object.values(EmergencyType), required: true, index: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true, index: true },

    // Protocol Details
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    triggerConditions: [{ type: String, required: true, trim: true }],
    immediateActions: [{
        step: { type: Number, required: true, min: 1 },
        action: { type: String, required: true, trim: true },
        responsibleRole: { type: String, required: true, trim: true },
        timeLimit: { type: Number, min: 1 },
        isRequired: { type: Boolean, default: true }
    }],

    // Communication Plan
    notificationSequence: [{
        priority: { type: Number, required: true, min: 1 },
        recipient: { type: String, required: true, trim: true },
        method: { type: String, enum: ['phone', 'sms', 'email', 'app', 'radio'], required: true },
        message: { type: String, required: true, trim: true },
        timeDelay: { type: Number, min: 0 }
    }],

    // Evacuation Procedures
    evacuationRequired: { type: Boolean, default: false },
    evacuationPlan: {
        primaryRoute: { type: String, trim: true },
        alternateRoutes: [String],
        assemblyPoint: { type: String, trim: true },
        specialInstructions: [String]
    },

    // External Contacts
    emergencyContacts: [{
        organization: { type: String, required: true, trim: true },
        contactPerson: { type: String, trim: true },
        phone: { type: String, required: true, trim: true },
        alternatePhone: { type: String, trim: true },
        whenToContact: { type: String, required: true, trim: true },
        priority: { type: Number, required: true, min: 1 }
    }],

    // Documentation Requirements
    documentationRequired: { type: Boolean, default: true },
    requiredDocuments: [String],
    reportingDeadline: { type: Number, min: 1 },

    // Recovery Procedures
    recoverySteps: [{
        step: { type: Number, required: true, min: 1 },
        action: { type: String, required: true, trim: true },
        responsibleRole: { type: String, required: true, trim: true },
        completionCriteria: { type: String, required: true, trim: true }
    }],

    // Training Requirements
    trainingRequired: { type: Boolean, default: true },
    trainingFrequency: { type: Number, min: 1 },
    certificationRequired: { type: Boolean, default: false },

    // Status
    isActive: { type: Boolean, default: true, index: true },
    lastReviewed: Date,
    nextReviewDate: Date,

    // Business Context
    businessUnitId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    locationIds: [{ type: Schema.Types.ObjectId, ref: 'Location' }],

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Emergency Incident Schema
const emergencyIncidentSchema = new Schema<IEmergencyIncident>({
    // Incident Information
    incidentId: { type: String, required: true, unique: true, index: true },
    emergencyType: { type: String, enum: Object.values(EmergencyType), required: true, index: true },
    status: { type: String, enum: Object.values(EmergencyStatus), default: EmergencyStatus.ACTIVE, index: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true, index: true },

    // Basic Details
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    occurredAt: { type: Date, required: true, index: true },
    reportedAt: { type: Date, required: true, index: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reporterName: { type: String, required: true, trim: true },

    // Location Information
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    specificLocation: { type: String, required: true, trim: true },
    coordinates: {
        latitude: { type: Number, min: -90, max: 90 },
        longitude: { type: Number, min: -180, max: 180 }
    },

    // People Involved
    childrenInvolved: [{
        childId: { type: String, required: true },
        childName: { type: String, required: true, trim: true },
        age: { type: Number, required: true, min: 0, max: 18 },
        injuryLevel: { type: String, enum: ['none', 'minor', 'moderate', 'severe'] },
        medicalAttentionRequired: { type: Boolean, default: false },
        parentNotified: { type: Boolean, default: false },
        parentNotificationTime: Date
    }],

    staffInvolved: [{
        staffId: { type: String, required: true },
        staffName: { type: String, required: true, trim: true },
        role: { type: String, required: true, trim: true },
        injuryLevel: { type: String, enum: ['none', 'minor', 'moderate', 'severe'] },
        actionsTaken: [String]
    }],

    witnessesPresent: [{
        witnessId: String,
        witnessName: { type: String, required: true, trim: true },
        witnessType: { type: String, enum: ['staff', 'parent', 'child', 'visitor'], required: true },
        contactInfo: { type: String, trim: true },
        statementGiven: { type: Boolean, default: false },
        statementUrl: { type: String, trim: true }
    }],

    // Response Actions
    immediateActions: [{
        action: { type: String, required: true, trim: true },
        takenBy: { type: String, required: true, trim: true },
        takenAt: { type: Date, required: true },
        effectiveness: { type: String, enum: ['effective', 'partially_effective', 'ineffective'] }
    }],

    // Medical Response
    medicalResponse: {
        firstAidGiven: { type: Boolean, default: false },
        firstAidBy: { type: String, trim: true },
        ambulanceCalled: { type: Boolean, default: false },
        ambulanceArrivalTime: Date,
        hospitalTransport: { type: Boolean, default: false },
        hospitalName: { type: String, trim: true },
        medicalPersonnelInvolved: [String]
    },

    // External Agencies
    agenciesNotified: [{
        agency: { type: String, required: true, trim: true },
        contactPerson: { type: String, trim: true },
        notifiedAt: { type: Date, required: true },
        notifiedBy: { type: String, required: true, trim: true },
        referenceNumber: { type: String, trim: true },
        responseReceived: { type: Boolean, default: false }
    }],

    // Documentation
    photos: [String],
    videos: [String],
    documents: [String],
    officialReports: [{
        reportType: { type: String, required: true, trim: true },
        reportUrl: { type: String, required: true, trim: true },
        submittedBy: { type: String, required: true, trim: true },
        submittedAt: { type: Date, required: true }
    }],

    // Follow-up Actions
    followUpRequired: { type: Boolean, default: false },
    followUpActions: [{
        action: { type: String, required: true, trim: true },
        assignedTo: { type: String, required: true, trim: true },
        dueDate: { type: Date, required: true },
        status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
        completedAt: Date
    }],

    // Resolution
    resolvedAt: Date,
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolutionSummary: { type: String, trim: true },
    lessonsLearned: [String],
    preventiveMeasures: [String],

    // Business Context
    businessUnitId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Indexes for performance
authorizedGuardianSchema.index({ childId: 1, guardianType: 1 });
authorizedGuardianSchema.index({ businessUnitId: 1, isActive: 1 });
authorizedGuardianSchema.index({ phone: 1 });
authorizedGuardianSchema.index({ isEmergencyContact: 1, isActive: 1 });

pickupRecordSchema.index({ childId: 1, actualPickupTime: -1 });
pickupRecordSchema.index({ guardianId: 1, actualPickupTime: -1 });
pickupRecordSchema.index({ locationId: 1, actualPickupTime: -1 });
pickupRecordSchema.index({ isLate: 1, actualPickupTime: -1 });
pickupRecordSchema.index({ isEmergencyPickup: 1, actualPickupTime: -1 });

restrictionOrderSchema.index({ childId: 1, isActive: 1 });
restrictionOrderSchema.index({ restrictedPersonName: 1, isActive: 1 });
restrictionOrderSchema.index({ effectiveDate: 1, expiryDate: 1 });
restrictionOrderSchema.index({ severity: 1, isActive: 1 });

emergencyProtocolSchema.index({ emergencyType: 1, isActive: 1 });
emergencyProtocolSchema.index({ businessUnitId: 1, isActive: 1 });
emergencyProtocolSchema.index({ severity: 1, isActive: 1 });

emergencyIncidentSchema.index({ emergencyType: 1, status: 1 });
emergencyIncidentSchema.index({ locationId: 1, occurredAt: -1 });
emergencyIncidentSchema.index({ severity: 1, status: 1 });
emergencyIncidentSchema.index({ reportedAt: -1, status: 1 });

// Text search indexes
authorizedGuardianSchema.index({
    firstName: 'text',
    lastName: 'text',
    phone: 'text'
});

restrictionOrderSchema.index({
    restrictedPersonName: 'text',
    title: 'text',
    description: 'text'
});

emergencyIncidentSchema.index({
    title: 'text',
    description: 'text'
});

// Pre-save middleware
authorizedGuardianSchema.pre('save', function (next) {
    if (this.isNew && !this.guardianId) {
        this.guardianId = `guard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

pickupRecordSchema.pre('save', function (next) {
    if (this.isNew && !this.pickupId) {
        this.pickupId = `pickup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

restrictionOrderSchema.pre('save', function (next) {
    if (this.isNew && !this.restrictionId) {
        this.restrictionId = `restrict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

emergencyProtocolSchema.pre('save', function (next) {
    if (this.isNew && !this.protocolId) {
        this.protocolId = `protocol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

emergencyIncidentSchema.pre('save', function (next) {
    if (this.isNew && !this.incidentId) {
        this.incidentId = `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

// Virtual fields
authorizedGuardianSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

pickupRecordSchema.virtual('isOverdue').get(function () {
    if (!this.scheduledPickupTime) return false;
    return new Date() > this.scheduledPickupTime && this.status === PickupStatus.PENDING;
});

restrictionOrderSchema.virtual('isExpired').get(function () {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
});

emergencyIncidentSchema.virtual('responseTime').get(function () {
    return this.reportedAt.getTime() - this.occurredAt.getTime();
});

// Export models
export const AuthorizedGuardian = model<IAuthorizedGuardian>('AuthorizedGuardian', authorizedGuardianSchema);
export const PickupRecord = model<IPickupRecord>('PickupRecord', pickupRecordSchema);
export const RestrictionOrder = model<IRestrictionOrder>('RestrictionOrder', restrictionOrderSchema);
export const EmergencyProtocol = model<IEmergencyProtocol>('EmergencyProtocol', emergencyProtocolSchema);
export const EmergencyIncident = model<IEmergencyIncident>('EmergencyIncident', emergencyIncidentSchema);

// Crisis Management Schemas

// Crisis Mode Schema
const crisisModeSchema = new Schema<ICrisisMode>({
    // Crisis Information
    crisisId: { type: String, required: true, unique: true, index: true },
    crisisType: { type: String, enum: Object.values(CrisisType), required: true, index: true },
    crisisLevel: { type: String, enum: Object.values(CrisisLevel), required: true, index: true },
    status: { type: String, enum: Object.values(EmergencyStatus), default: EmergencyStatus.ACTIVE, index: true },

    // Basic Details
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    triggeredAt: { type: Date, required: true, index: true },
    triggeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    triggeredByName: { type: String, required: true, trim: true },

    // Location Information
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
    affectedAreas: [{ type: String, trim: true }],
    evacuationRequired: { type: Boolean, default: false },
    lockdownRequired: { type: Boolean, default: false },

    // Response Team
    incidentCommander: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    responseTeam: [{
        memberId: { type: String, required: true },
        memberName: { type: String, required: true, trim: true },
        role: { type: String, required: true, trim: true },
        assignedAt: { type: Date, required: true },
        status: { type: String, enum: ['assigned', 'responding', 'on_scene', 'completed'], default: 'assigned' }
    }],

    // External Agencies
    agenciesNotified: [{
        agency: { type: String, required: true, trim: true },
        contactPerson: { type: String, trim: true },
        notifiedAt: { type: Date, required: true },
        notifiedBy: { type: String, required: true, trim: true },
        responseStatus: { type: String, enum: ['notified', 'responding', 'on_scene', 'completed'], default: 'notified' }
    }],

    // Communication
    broadcasts: [{
        broadcastId: { type: String, required: true },
        broadcastType: { type: String, enum: Object.values(BroadcastType), required: true },
        message: { type: String, required: true, trim: true },
        recipients: [String],
        sentAt: { type: Date, required: true },
        sentBy: { type: String, required: true, trim: true },
        deliveryStatus: { type: String, enum: ['sent', 'delivered', 'failed'], default: 'sent' }
    }],

    // Resolution
    resolvedAt: Date,
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolutionSummary: { type: String, trim: true },
    postIncidentActions: [String],

    // Business Context
    businessUnitId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Incident Report Schema
const incidentReportSchema = new Schema<IIncidentReport>({
    // Report Information
    reportId: { type: String, required: true, unique: true, index: true },
    incidentType: { type: String, enum: Object.values(CrisisType), required: true, index: true },
    severity: { type: String, enum: Object.values(IncidentSeverity), required: true, index: true },
    status: { type: String, enum: ['draft', 'submitted', 'under_review', 'approved', 'closed'], default: 'draft', index: true },

    // Basic Details
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    occurredAt: { type: Date, required: true, index: true },
    reportedAt: { type: Date, required: true, index: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reporterName: { type: String, required: true, trim: true },

    // Location Information
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    specificLocation: { type: String, required: true, trim: true },

    // People Involved
    childrenInvolved: [{
        childId: { type: String, required: true },
        childName: { type: String, required: true, trim: true },
        age: { type: Number, required: true, min: 0, max: 18 },
        injuryType: { type: String, trim: true },
        injuryDescription: { type: String, trim: true },
        medicalAttentionRequired: { type: Boolean, default: false },
        parentNotified: { type: Boolean, default: false },
        parentNotificationTime: Date
    }],

    staffInvolved: [{
        staffId: { type: String, required: true },
        staffName: { type: String, required: true, trim: true },
        role: { type: String, required: true, trim: true },
        involvement: { type: String, enum: ['witness', 'first_responder', 'involved_party', 'supervisor'], required: true },
        actionsTaken: [String]
    }],

    // Incident Details
    contributingFactors: [String],
    environmentalFactors: [String],
    equipmentInvolved: [String],

    // Response Actions
    immediateActions: [{
        action: { type: String, required: true, trim: true },
        takenBy: { type: String, required: true, trim: true },
        takenAt: { type: Date, required: true },
        effectiveness: { type: String, enum: ['effective', 'partially_effective', 'ineffective'] }
    }],

    // Medical Response
    medicalResponse: {
        firstAidGiven: { type: Boolean, default: false },
        firstAidBy: { type: String, trim: true },
        ambulanceCalled: { type: Boolean, default: false },
        ambulanceArrivalTime: Date,
        hospitalTransport: { type: Boolean, default: false },
        hospitalName: { type: String, trim: true },
        injuryAssessment: { type: String, trim: true },
        treatmentProvided: { type: String, trim: true }
    },

    // Documentation
    photos: [String],
    videos: [String],
    documents: [String],
    witnessStatements: [{
        witnessId: { type: String, required: true },
        witnessName: { type: String, required: true, trim: true },
        statement: { type: String, required: true, trim: true },
        statementDate: { type: Date, required: true }
    }],

    // Follow-up
    followUpRequired: { type: Boolean, default: false },
    followUpActions: [{
        action: { type: String, required: true, trim: true },
        assignedTo: { type: String, required: true, trim: true },
        dueDate: { type: Date, required: true },
        status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
        completedAt: Date
    }],

    // Prevention
    preventiveMeasures: [String],
    policyChanges: [String],
    trainingRequired: { type: Boolean, default: false },
    equipmentChanges: [String],

    // Approval Workflow
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    reviewComments: { type: String, trim: true },

    // Business Context
    businessUnitId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Emergency Broadcast Schema
const emergencyBroadcastSchema = new Schema<IEmergencyBroadcast>({
    // Broadcast Information
    broadcastId: { type: String, required: true, unique: true, index: true },
    broadcastType: { type: String, enum: Object.values(BroadcastType), required: true, index: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true, index: true },
    status: { type: String, enum: ['draft', 'scheduled', 'sent', 'delivered', 'failed'], default: 'draft', index: true },

    // Content
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    instructions: [String],

    // Targeting
    recipients: {
        recipientType: { type: String, enum: ['all_staff', 'location_staff', 'parents', 'emergency_contacts', 'specific_users'], required: true },
        locationIds: [{ type: Schema.Types.ObjectId, ref: 'Location' }],
        userIds: [String],
        roles: [String]
    },

    // Delivery
    channels: [{ type: String, enum: ['email', 'sms', 'push', 'app', 'public_address'] }],
    scheduledFor: Date,
    sentAt: Date,
    sentBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Delivery Status
    deliveryStats: {
        totalRecipients: { type: Number, default: 0 },
        delivered: { type: Number, default: 0 },
        failed: { type: Number, default: 0 },
        pending: { type: Number, default: 0 }
    },

    // Related Crisis
    crisisId: { type: String, index: true },
    incidentId: { type: String, index: true },

    // Business Context
    businessUnitId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    locationIds: [{ type: Schema.Types.ObjectId, ref: 'Location' }],

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Indexes for crisis management
crisisModeSchema.index({ crisisType: 1, status: 1 });
crisisModeSchema.index({ locationId: 1, triggeredAt: -1 });
crisisModeSchema.index({ crisisLevel: 1, status: 1 });

incidentReportSchema.index({ incidentType: 1, status: 1 });
incidentReportSchema.index({ locationId: 1, occurredAt: -1 });
incidentReportSchema.index({ severity: 1, status: 1 });
incidentReportSchema.index({ reportedAt: -1, status: 1 });

emergencyBroadcastSchema.index({ broadcastType: 1, status: 1 });
emergencyBroadcastSchema.index({ priority: 1, sentAt: -1 });
emergencyBroadcastSchema.index({ crisisId: 1, sentAt: -1 });

// Text search indexes for crisis management
crisisModeSchema.index({
    title: 'text',
    description: 'text'
});

incidentReportSchema.index({
    title: 'text',
    description: 'text'
});

emergencyBroadcastSchema.index({
    title: 'text',
    message: 'text'
});

// Pre-save middleware for crisis management
crisisModeSchema.pre('save', function (next) {
    if (this.isNew && !this.crisisId) {
        this.crisisId = `crisis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

incidentReportSchema.pre('save', function (next) {
    if (this.isNew && !this.reportId) {
        this.reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

emergencyBroadcastSchema.pre('save', function (next) {
    if (this.isNew && !this.broadcastId) {
        this.broadcastId = `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

// Virtual fields for crisis management
crisisModeSchema.virtual('isActive').get(function () {
    return this.status === EmergencyStatus.ACTIVE;
});

incidentReportSchema.virtual('isOverdue').get(function () {
    return this.followUpActions.some(action =>
        action.status !== 'completed' && new Date() > action.dueDate
    );
});

emergencyBroadcastSchema.virtual('deliveryRate').get(function () {
    if (this.deliveryStats.totalRecipients === 0) return 0;
    return (this.deliveryStats.delivered / this.deliveryStats.totalRecipients) * 100;
});

// Export crisis management models
export const CrisisMode = model<ICrisisMode>('CrisisMode', crisisModeSchema);
export const IncidentReport = model<IIncidentReport>('IncidentReport', incidentReportSchema);
export const EmergencyBroadcast = model<IEmergencyBroadcast>('EmergencyBroadcast', emergencyBroadcastSchema);