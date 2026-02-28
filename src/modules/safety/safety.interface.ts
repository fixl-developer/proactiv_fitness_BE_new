import { Document } from 'mongoose';

export enum GuardianType {
    PARENT = 'parent',
    LEGAL_GUARDIAN = 'legal_guardian',
    AUTHORIZED_PERSON = 'authorized_person',
    EMERGENCY_CONTACT = 'emergency_contact',
    TEMPORARY_GUARDIAN = 'temporary_guardian'
}

export enum PickupStatus {
    PENDING = 'pending',
    AUTHORIZED = 'authorized',
    COMPLETED = 'completed',
    DENIED = 'denied',
    LATE = 'late',
    EMERGENCY = 'emergency'
}

export enum RestrictionType {
    COURT_ORDER = 'court_order',
    CUSTODY_RESTRICTION = 'custody_restriction',
    SAFETY_CONCERN = 'safety_concern',
    MEDICAL_RESTRICTION = 'medical_restriction',
    BEHAVIORAL_RESTRICTION = 'behavioral_restriction',
    TEMPORARY_RESTRICTION = 'temporary_restriction'
}

export enum RestrictionSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export enum EmergencyType {
    MEDICAL = 'medical',
    FIRE = 'fire',
    NATURAL_DISASTER = 'natural_disaster',
    SECURITY_THREAT = 'security_threat',
    MISSING_CHILD = 'missing_child',
    UNAUTHORIZED_PERSON = 'unauthorized_person',
    FACILITY_EMERGENCY = 'facility_emergency'
}

export enum EmergencyStatus {
    ACTIVE = 'active',
    RESOLVED = 'resolved',
    ESCALATED = 'escalated',
    CANCELLED = 'cancelled'
}

export enum CrisisLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
    LOCKDOWN = 'lockdown'
}

export enum CrisisType {
    MISSING_CHILD = 'missing_child',
    UNAUTHORIZED_PERSON = 'unauthorized_person',
    MEDICAL_EMERGENCY = 'medical_emergency',
    FIRE_EMERGENCY = 'fire_emergency',
    NATURAL_DISASTER = 'natural_disaster',
    SECURITY_THREAT = 'security_threat',
    FACILITY_EMERGENCY = 'facility_emergency',
    BEHAVIORAL_INCIDENT = 'behavioral_incident',
    INJURY_INCIDENT = 'injury_incident',
    SAFETY_VIOLATION = 'safety_violation'
}

export enum BroadcastType {
    EMERGENCY_ALERT = 'emergency_alert',
    LOCKDOWN_NOTICE = 'lockdown_notice',
    EVACUATION_ORDER = 'evacuation_order',
    ALL_CLEAR = 'all_clear',
    PARENT_NOTIFICATION = 'parent_notification',
    STAFF_ALERT = 'staff_alert'
}

export enum IncidentSeverity {
    MINOR = 'minor',
    MODERATE = 'moderate',
    SEVERE = 'severe',
    CRITICAL = 'critical'
}

export enum VerificationMethod {
    PHOTO_ID = 'photo_id',
    BIOMETRIC = 'biometric',
    PIN_CODE = 'pin_code',
    FACIAL_RECOGNITION = 'facial_recognition',
    SIGNATURE = 'signature',
    PHONE_VERIFICATION = 'phone_verification'
}

export interface IAuthorizedGuardian extends Document {
    // Guardian Information
    guardianId: string;
    childId: string;
    guardianType: GuardianType;

    // Personal Information
    firstName: string;
    lastName: string;
    relationship: string;
    dateOfBirth?: Date;

    // Contact Information
    phone: string;
    alternatePhone?: string;
    email?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };

    // Identification
    idType: 'passport' | 'national_id' | 'driving_license' | 'other';
    idNumber: string;
    idExpiryDate?: Date;
    idPhotoUrl?: string;

    // Verification
    isVerified: boolean;
    verificationMethod: VerificationMethod[];
    verificationDate?: Date;
    verifiedBy?: string;

    // Authorization Details
    canPickup: boolean;
    canDropOff: boolean;
    canAuthorizeOthers: boolean;
    pickupDays?: string[]; // ['monday', 'tuesday', etc.]
    pickupTimeRestrictions?: {
        startTime: string;
        endTime: string;
    };

    // Security
    pinCode?: string;
    biometricData?: string;
    photoUrl?: string;
    signatureUrl?: string;

    // Status
    isActive: boolean;
    isBlocked: boolean;
    blockReason?: string;
    blockedBy?: string;
    blockedAt?: Date;

    // Emergency Authorization
    isEmergencyContact: boolean;
    emergencyPriority?: number;

    // Legal Documentation
    legalDocuments?: {
        documentType: string;
        documentUrl: string;
        expiryDate?: Date;
        isVerified: boolean;
    }[];

    // Business Context
    businessUnitId: string;
    locationIds: string[];

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPickupRecord extends Document {
    // Basic Information
    pickupId: string;
    childId: string;
    childName: string;
    sessionId?: string;

    // Guardian Information
    guardianId: string;
    guardianName: string;
    guardianType: GuardianType;

    // Pickup Details
    scheduledPickupTime?: Date;
    actualPickupTime?: Date;
    status: PickupStatus;

    // Location Information
    locationId: string;
    roomId?: string;
    pickupLocation?: string;

    // Verification
    verificationMethod: VerificationMethod;
    verificationData?: {
        idVerified: boolean;
        idNumber?: string;
        photoTaken: boolean;
        signatureRequired: boolean;
        signatureUrl?: string;
        biometricVerified?: boolean;
        pinVerified?: boolean;
    };

    // Staff Information
    authorizedBy: string;
    authorizedByName: string;
    witnessedBy?: string;
    witnessedByName?: string;

    // Late Pickup Handling
    isLate: boolean;
    lateMinutes?: number;
    latePickupFee?: number;
    latePickupReason?: string;
    parentNotified?: boolean;
    notificationTime?: Date;

    // Emergency Information
    isEmergencyPickup: boolean;
    emergencyReason?: string;
    emergencyApprovedBy?: string;
    emergencyDocumentation?: string[];

    // Special Instructions
    specialInstructions?: string;
    medicalAlerts?: string[];
    behavioralNotes?: string[];

    // Documentation
    photos?: string[];
    documents?: string[];
    notes?: string;

    // Business Context
    businessUnitId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IRestrictionOrder extends Document {
    // Basic Information
    restrictionId: string;
    childId: string;
    childName: string;

    // Restriction Details
    restrictionType: RestrictionType;
    severity: RestrictionSeverity;
    title: string;
    description: string;

    // Restricted Person Information
    restrictedPersonId?: string;
    restrictedPersonName: string;
    restrictedPersonDetails: {
        firstName: string;
        lastName: string;
        relationship?: string;
        idType?: string;
        idNumber?: string;
        photoUrl?: string;
        physicalDescription?: string;
        knownAliases?: string[];
    };

    // Legal Information
    courtOrderNumber?: string;
    issuingCourt?: string;
    legalDocumentUrl?: string;
    legalRepresentative?: {
        name: string;
        phone: string;
        email: string;
        firm?: string;
    };

    // Restriction Scope
    restrictionScope: {
        noContact: boolean;
        noPickup: boolean;
        noDropOff: boolean;
        noFacilityAccess: boolean;
        noInformation: boolean;
        noPhotos: boolean;
        proximityRestriction?: number; // in meters
    };

    // Validity
    effectiveDate: Date;
    expiryDate?: Date;
    isActive: boolean;

    // Enforcement
    enforcementInstructions: string;
    escalationProcedure: string;
    policeContactRequired: boolean;
    emergencyContacts: {
        name: string;
        role: string;
        phone: string;
        priority: number;
    }[];

    // Violation Tracking
    violations: {
        violationId: string;
        violationDate: Date;
        violationType: string;
        description: string;
        actionTaken: string;
        reportedBy: string;
        policeNotified: boolean;
        documentationUrl?: string;
    }[];

    // Notifications
    alertStaff: boolean;
    alertSecurity: boolean;
    alertManagement: boolean;
    notificationRecipients: string[];

    // Business Context
    businessUnitId: string;
    locationIds: string[];

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IEmergencyProtocol extends Document {
    // Protocol Information
    protocolId: string;
    protocolName: string;
    emergencyType: EmergencyType;
    severity: 'low' | 'medium' | 'high' | 'critical';

    // Protocol Details
    description: string;
    triggerConditions: string[];
    immediateActions: {
        step: number;
        action: string;
        responsibleRole: string;
        timeLimit?: number; // in minutes
        isRequired: boolean;
    }[];

    // Communication Plan
    notificationSequence: {
        priority: number;
        recipient: string;
        method: 'phone' | 'sms' | 'email' | 'app' | 'radio';
        message: string;
        timeDelay?: number; // in minutes
    }[];

    // Evacuation Procedures
    evacuationRequired: boolean;
    evacuationPlan?: {
        primaryRoute: string;
        alternateRoutes: string[];
        assemblyPoint: string;
        specialInstructions: string[];
    };

    // External Contacts
    emergencyContacts: {
        organization: string;
        contactPerson?: string;
        phone: string;
        alternatePhone?: string;
        whenToContact: string;
        priority: number;
    }[];

    // Documentation Requirements
    documentationRequired: boolean;
    requiredDocuments: string[];
    reportingDeadline?: number; // in hours

    // Recovery Procedures
    recoverySteps: {
        step: number;
        action: string;
        responsibleRole: string;
        completionCriteria: string;
    }[];

    // Training Requirements
    trainingRequired: boolean;
    trainingFrequency?: number; // in months
    certificationRequired: boolean;

    // Status
    isActive: boolean;
    lastReviewed?: Date;
    nextReviewDate?: Date;

    // Business Context
    businessUnitId: string;
    locationIds: string[];

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IEmergencyIncident extends Document {
    // Incident Information
    incidentId: string;
    emergencyType: EmergencyType;
    status: EmergencyStatus;
    severity: 'low' | 'medium' | 'high' | 'critical';

    // Basic Details
    title: string;
    description: string;
    occurredAt: Date;
    reportedAt: Date;
    reportedBy: string;
    reporterName: string;

    // Location Information
    locationId: string;
    roomId?: string;
    specificLocation: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };

    // People Involved
    childrenInvolved: {
        childId: string;
        childName: string;
        age: number;
        injuryLevel?: 'none' | 'minor' | 'moderate' | 'severe';
        medicalAttentionRequired: boolean;
        parentNotified: boolean;
        parentNotificationTime?: Date;
    }[];

    staffInvolved: {
        staffId: string;
        staffName: string;
        role: string;
        injuryLevel?: 'none' | 'minor' | 'moderate' | 'severe';
        actionsTaken: string[];
    }[];

    witnessesPresent: {
        witnessId?: string;
        witnessName: string;
        witnessType: 'staff' | 'parent' | 'child' | 'visitor';
        contactInfo?: string;
        statementGiven: boolean;
        statementUrl?: string;
    }[];

    // Response Actions
    immediateActions: {
        action: string;
        takenBy: string;
        takenAt: Date;
        effectiveness: 'effective' | 'partially_effective' | 'ineffective';
    }[];

    // Medical Response
    medicalResponse?: {
        firstAidGiven: boolean;
        firstAidBy: string;
        ambulanceCalled: boolean;
        ambulanceArrivalTime?: Date;
        hospitalTransport: boolean;
        hospitalName?: string;
        medicalPersonnelInvolved: string[];
    };

    // External Agencies
    agenciesNotified: {
        agency: string;
        contactPerson?: string;
        notifiedAt: Date;
        notifiedBy: string;
        referenceNumber?: string;
        responseReceived: boolean;
    }[];

    // Documentation
    photos: string[];
    videos: string[];
    documents: string[];
    officialReports: {
        reportType: string;
        reportUrl: string;
        submittedBy: string;
        submittedAt: Date;
    }[];

    // Follow-up Actions
    followUpRequired: boolean;
    followUpActions: {
        action: string;
        assignedTo: string;
        dueDate: Date;
        status: 'pending' | 'in_progress' | 'completed';
        completedAt?: Date;
    }[];

    // Resolution
    resolvedAt?: Date;
    resolvedBy?: string;
    resolutionSummary?: string;
    lessonsLearned?: string[];
    preventiveMeasures?: string[];

    // Business Context
    businessUnitId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Request/Response Interfaces
export interface ICreateGuardianRequest {
    childId: string;
    guardianType: GuardianType;
    firstName: string;
    lastName: string;
    relationship: string;
    phone: string;
    email?: string;
    idType: string;
    idNumber: string;
    canPickup: boolean;
    canDropOff: boolean;
    isEmergencyContact?: boolean;
}

export interface IPickupRequest {
    childId: string;
    guardianId: string;
    verificationMethod: VerificationMethod;
    verificationData?: any;
    specialInstructions?: string;
    isEmergencyPickup?: boolean;
    emergencyReason?: string;
}

export interface IRestrictionOrderRequest {
    childId: string;
    restrictionType: RestrictionType;
    severity: RestrictionSeverity;
    title: string;
    description: string;
    restrictedPersonName: string;
    restrictedPersonDetails: any;
    restrictionScope: any;
    effectiveDate: Date;
    expiryDate?: Date;
    enforcementInstructions: string;
}

export interface IEmergencyIncidentRequest {
    emergencyType: EmergencyType;
    severity: string;
    title: string;
    description: string;
    locationId: string;
    specificLocation: string;
    childrenInvolved?: any[];
    staffInvolved?: any[];
    immediateActions?: any[];
}

export interface ISafetyStatistics {
    totalGuardians: number;
    activeGuardians: number;
    verifiedGuardians: number;
    totalPickups: number;
    latePickups: number;
    emergencyPickups: number;
    activeRestrictions: number;
    totalIncidents: number;
    openIncidents: number;
    averageResponseTime: number;
    complianceRate: number;

    // Trends
    pickupTrends: {
        date: Date;
        totalPickups: number;
        latePickups: number;
        emergencyPickups: number;
    }[];

    // By Location
    locationStats: {
        locationId: string;
        locationName: string;
        totalPickups: number;
        incidentCount: number;
        complianceRate: number;
    }[];
}

// Crisis Management Interfaces

export interface ICrisisMode extends Document {
    // Crisis Information
    crisisId: string;
    crisisType: CrisisType;
    crisisLevel: CrisisLevel;
    status: EmergencyStatus;

    // Basic Details
    title: string;
    description: string;
    triggeredAt: Date;
    triggeredBy: string;
    triggeredByName: string;

    // Location Information
    locationId: string;
    affectedAreas: string[];
    evacuationRequired: boolean;
    lockdownRequired: boolean;

    // Response Team
    incidentCommander: string;
    responseTeam: {
        memberId: string;
        memberName: string;
        role: string;
        assignedAt: Date;
        status: 'assigned' | 'responding' | 'on_scene' | 'completed';
    }[];

    // External Agencies
    agenciesNotified: {
        agency: string;
        contactPerson?: string;
        notifiedAt: Date;
        notifiedBy: string;
        responseStatus: 'notified' | 'responding' | 'on_scene' | 'completed';
    }[];

    // Communication
    broadcasts: {
        broadcastId: string;
        broadcastType: BroadcastType;
        message: string;
        recipients: string[];
        sentAt: Date;
        sentBy: string;
        deliveryStatus: 'sent' | 'delivered' | 'failed';
    }[];

    // Resolution
    resolvedAt?: Date;
    resolvedBy?: string;
    resolutionSummary?: string;
    postIncidentActions: string[];

    // Business Context
    businessUnitId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IIncidentReport extends Document {
    // Report Information
    reportId: string;
    incidentType: CrisisType;
    severity: IncidentSeverity;
    status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'closed';

    // Basic Details
    title: string;
    description: string;
    occurredAt: Date;
    reportedAt: Date;
    reportedBy: string;
    reporterName: string;

    // Location Information
    locationId: string;
    roomId?: string;
    specificLocation: string;

    // People Involved
    childrenInvolved: {
        childId: string;
        childName: string;
        age: number;
        injuryType?: string;
        injuryDescription?: string;
        medicalAttentionRequired: boolean;
        parentNotified: boolean;
        parentNotificationTime?: Date;
    }[];

    staffInvolved: {
        staffId: string;
        staffName: string;
        role: string;
        involvement: 'witness' | 'first_responder' | 'involved_party' | 'supervisor';
        actionsTaken: string[];
    }[];

    // Incident Details
    contributingFactors: string[];
    environmentalFactors: string[];
    equipmentInvolved: string[];

    // Response Actions
    immediateActions: {
        action: string;
        takenBy: string;
        takenAt: Date;
        effectiveness: 'effective' | 'partially_effective' | 'ineffective';
    }[];

    // Medical Response
    medicalResponse?: {
        firstAidGiven: boolean;
        firstAidBy: string;
        ambulanceCalled: boolean;
        ambulanceArrivalTime?: Date;
        hospitalTransport: boolean;
        hospitalName?: string;
        injuryAssessment: string;
        treatmentProvided: string;
    };

    // Documentation
    photos: string[];
    videos: string[];
    documents: string[];
    witnessStatements: {
        witnessId: string;
        witnessName: string;
        statement: string;
        statementDate: Date;
    }[];

    // Follow-up
    followUpRequired: boolean;
    followUpActions: {
        action: string;
        assignedTo: string;
        dueDate: Date;
        status: 'pending' | 'in_progress' | 'completed';
        completedAt?: Date;
    }[];

    // Prevention
    preventiveMeasures: string[];
    policyChanges: string[];
    trainingRequired: boolean;
    equipmentChanges: string[];

    // Approval Workflow
    reviewedBy?: string;
    reviewedAt?: Date;
    approvedBy?: string;
    approvedAt?: Date;
    reviewComments?: string;

    // Business Context
    businessUnitId: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IEmergencyBroadcast extends Document {
    // Broadcast Information
    broadcastId: string;
    broadcastType: BroadcastType;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'draft' | 'scheduled' | 'sent' | 'delivered' | 'failed';

    // Content
    title: string;
    message: string;
    instructions: string[];

    // Targeting
    recipients: {
        recipientType: 'all_staff' | 'location_staff' | 'parents' | 'emergency_contacts' | 'specific_users';
        locationIds?: string[];
        userIds?: string[];
        roles?: string[];
    };

    // Delivery
    channels: ('email' | 'sms' | 'push' | 'app' | 'public_address')[];
    scheduledFor?: Date;
    sentAt?: Date;
    sentBy: string;

    // Delivery Status
    deliveryStats: {
        totalRecipients: number;
        delivered: number;
        failed: number;
        pending: number;
    };

    // Related Crisis
    crisisId?: string;
    incidentId?: string;

    // Business Context
    businessUnitId: string;
    locationIds: string[];

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Request/Response Interfaces for Crisis Management

export interface ICrisisModeRequest {
    crisisType: CrisisType;
    crisisLevel: CrisisLevel;
    title: string;
    description: string;
    locationId: string;
    affectedAreas?: string[];
    evacuationRequired?: boolean;
    lockdownRequired?: boolean;
    responseTeam?: any[];
}

export interface IIncidentReportRequest {
    incidentType: CrisisType;
    severity: IncidentSeverity;
    title: string;
    description: string;
    occurredAt: Date;
    locationId: string;
    specificLocation: string;
    childrenInvolved?: any[];
    staffInvolved?: any[];
    contributingFactors?: string[];
    immediateActions?: any[];
}

export interface IEmergencyBroadcastRequest {
    broadcastType: BroadcastType;
    priority: string;
    title: string;
    message: string;
    instructions?: string[];
    recipients: any;
    channels: string[];
    scheduledFor?: Date;
    crisisId?: string;
    incidentId?: string;
}