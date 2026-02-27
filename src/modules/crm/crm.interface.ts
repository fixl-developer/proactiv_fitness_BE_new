import { Document } from 'mongoose';

export enum FamilyStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    ARCHIVED = 'archived'
}

export enum InquiryStatus {
    NEW = 'new',
    CONTACTED = 'contacted',
    SCHEDULED = 'scheduled',
    VISITED = 'visited',
    ENROLLED = 'enrolled',
    DECLINED = 'declined',
    LOST = 'lost'
}

export enum LeadSource {
    WEBSITE = 'website',
    REFERRAL = 'referral',
    SOCIAL_MEDIA = 'social_media',
    WALK_IN = 'walk_in',
    PHONE = 'phone',
    EMAIL = 'email',
    EVENT = 'event',
    PARTNER = 'partner',
    ADVERTISEMENT = 'advertisement'
}

export enum CommunicationChannel {
    EMAIL = 'email',
    SMS = 'sms',
    PHONE = 'phone',
    IN_PERSON = 'in_person',
    WHATSAPP = 'whatsapp',
    APP_NOTIFICATION = 'app_notification'
}

export enum RelationshipType {
    PARENT = 'parent',
    GUARDIAN = 'guardian',
    GRANDPARENT = 'grandparent',
    SIBLING = 'sibling',
    OTHER = 'other'
}

export enum MedicalFlagType {
    ALLERGY = 'allergy',
    MEDICATION = 'medication',
    CONDITION = 'condition',
    DIETARY = 'dietary',
    BEHAVIORAL = 'behavioral',
    PHYSICAL = 'physical'
}

export enum ContactPreference {
    EMAIL = 'email',
    SMS = 'sms',
    PHONE = 'phone',
    WHATSAPP = 'whatsapp',
    NO_CONTACT = 'no_contact'
}

export interface IAddress {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    type: 'home' | 'work' | 'billing' | 'other';
}

export interface IEmergencyContact {
    name: string;
    relationship: RelationshipType;
    phoneNumber: string;
    alternatePhone?: string;
    email?: string;
    address?: IAddress;
    isPrimary: boolean;
    canPickup: boolean;
    notes?: string;
}

export interface IMedicalFlag {
    type: MedicalFlagType;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    medications?: string[];
    instructions?: string;
    doctorContact?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICommunicationLog {
    channel: CommunicationChannel;
    direction: 'inbound' | 'outbound';
    subject?: string;
    content: string;
    sentBy: string;
    sentTo: string[];
    timestamp: Date;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    metadata?: Record<string, any>;
}

export interface IFamilyMember {
    userId: string;
    relationship: RelationshipType;
    isPrimary: boolean;
    canMakeBookings: boolean;
    canViewBilling: boolean;
    canPickupChildren: boolean;
    contactPreferences: ContactPreference[];
    notes?: string;
    addedAt: Date;
}

export interface IChildProfile extends Document {
    // Basic Information
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';

    // Family Connection
    familyId: string;
    parentIds: string[];

    // Physical Information
    height?: number; // in cm
    weight?: number; // in kg

    // Medical Information (Encrypted)
    medicalFlags: IMedicalFlag[];
    allergies: string[];
    medications: string[];
    medicalConditions: string[];
    dietaryRestrictions: string[];

    // Emergency Contacts
    emergencyContacts: IEmergencyContact[];

    // Program Information
    currentPrograms: string[];
    programHistory: {
        programId: string;
        enrollmentDate: Date;
        completionDate?: Date;
        status: 'active' | 'completed' | 'withdrawn';
        achievements: string[];
    }[];

    // Skills and Progress
    skillLevels: Record<string, string>; // sport/activity -> skill level
    achievements: {
        type: string;
        title: string;
        description: string;
        dateAchieved: Date;
        programId?: string;
    }[];

    // Behavioral Notes
    behavioralNotes: {
        note: string;
        category: 'positive' | 'concern' | 'neutral';
        createdBy: string;
        createdAt: Date;
        isPrivate: boolean;
    }[];

    // Preferences
    preferences: {
        favoriteActivities: string[];
        dislikedActivities: string[];
        learningStyle: string;
        motivationFactors: string[];
    };

    // Photos and Media
    profilePhotoUrl?: string;
    mediaConsent: {
        photography: boolean;
        videography: boolean;
        socialMedia: boolean;
        marketing: boolean;
        consentDate: Date;
        consentBy: string;
    };

    // Status
    isActive: boolean;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IFamilyProfile extends Document {
    // Basic Information
    familyName: string;
    familyCode: string; // Unique family identifier

    // Members
    members: IFamilyMember[];
    children: string[]; // Child profile IDs

    // Contact Information
    primaryEmail: string;
    secondaryEmail?: string;
    primaryPhone: string;
    secondaryPhone?: string;
    addresses: IAddress[];

    // Communication Preferences
    preferredContactMethod: ContactPreference;
    communicationLanguage: string;
    timeZone: string;

    // Business Information
    businessUnitId: string;
    locationIds: string[];

    // Account Status
    status: FamilyStatus;
    accountBalance: number;
    creditLimit: number;

    // Billing Information
    billingAddress?: IAddress;
    paymentMethods: string[]; // Payment method IDs
    billingPreferences: {
        consolidatedBilling: boolean;
        billingCycle: 'monthly' | 'quarterly' | 'annually';
        autoPayEnabled: boolean;
        invoiceDelivery: 'email' | 'postal' | 'both';
    };

    // Marketing and Communication
    marketingConsent: {
        email: boolean;
        sms: boolean;
        phone: boolean;
        postal: boolean;
        consentDate: Date;
    };

    // Family Notes
    notes: {
        note: string;
        category: 'general' | 'billing' | 'medical' | 'behavioral' | 'administrative';
        isPrivate: boolean;
        createdBy: string;
        createdAt: Date;
    }[];

    // Communication History
    communicationLog: ICommunicationLog[];

    // Referral Information
    referredBy?: string;
    referralCode?: string;
    referrals: {
        referredFamilyId: string;
        referralDate: Date;
        status: 'pending' | 'enrolled' | 'expired';
        rewardEarned?: number;
    }[];

    // Important Dates
    firstEnrollmentDate?: Date;
    lastActivityDate?: Date;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IInquiry extends Document {
    // Basic Information
    inquiryId: string;
    source: LeadSource;
    status: InquiryStatus;

    // Contact Information
    parentName: string;
    email: string;
    phone: string;

    // Child Information
    childName?: string;
    childAge?: number;
    childAgeType: 'months' | 'years';

    // Interest Information
    interestedPrograms: string[];
    preferredLocations: string[];
    preferredDays: string[];
    preferredTimes: string[];

    // Business Information
    businessUnitId: string;
    assignedTo?: string; // Staff member ID

    // Follow-up Information
    followUpDate?: Date;
    followUpNotes: string[];

    // Conversion Information
    convertedToFamilyId?: string;
    conversionDate?: Date;

    // Communication History
    communications: ICommunicationLog[];

    // Metadata
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    referrerUrl?: string;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ILeadManagement extends Document {
    // Lead Information
    leadId: string;
    source: LeadSource;
    status: 'new' | 'qualified' | 'nurturing' | 'converted' | 'lost';

    // Contact Information
    contactName: string;
    email: string;
    phone: string;

    // Lead Scoring
    score: number;
    scoringFactors: {
        factor: string;
        points: number;
        reason: string;
    }[];

    // Assignment
    assignedTo?: string;
    assignedDate?: Date;

    // Follow-up
    nextFollowUp?: Date;
    followUpHistory: {
        date: Date;
        method: CommunicationChannel;
        outcome: string;
        nextAction: string;
        staffMember: string;
    }[];

    // Conversion
    convertedToInquiryId?: string;
    conversionDate?: Date;

    // Audit
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Filter interfaces
export interface IFamilyFilter {
    businessUnitId?: string;
    locationId?: string;
    status?: FamilyStatus;
    hasActiveChildren?: boolean;
    accountBalance?: {
        min?: number;
        max?: number;
    };
    lastActivityDate?: {
        from?: Date;
        to?: Date;
    };
    searchText?: string;
}

export interface IChildFilter {
    familyId?: string;
    ageRange?: {
        min?: number;
        max?: number;
        ageType?: 'months' | 'years';
    };
    currentPrograms?: string[];
    skillLevel?: string;
    hasMedicalFlags?: boolean;
    isActive?: boolean;
    searchText?: string;
}

export interface IInquiryFilter {
    businessUnitId?: string;
    status?: InquiryStatus;
    source?: LeadSource;
    assignedTo?: string;
    dateRange?: {
        from?: Date;
        to?: Date;
    };
    interestedPrograms?: string[];
    searchText?: string;
}

// Request/Response interfaces
export interface ICreateFamilyRequest {
    familyName: string;
    primaryEmail: string;
    primaryPhone: string;
    businessUnitId: string;
    locationIds: string[];
    primaryParent: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    address?: IAddress;
}

export interface ICreateChildRequest {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    familyId: string;
    parentIds: string[];
    emergencyContacts: IEmergencyContact[];
    medicalFlags?: IMedicalFlag[];
    mediaConsent: {
        photography: boolean;
        videography: boolean;
        socialMedia: boolean;
        marketing: boolean;
    };
}

export interface ICreateInquiryRequest {
    parentName: string;
    email: string;
    phone: string;
    childName?: string;
    childAge?: number;
    childAgeType: 'months' | 'years';
    interestedPrograms: string[];
    preferredLocations: string[];
    source: LeadSource;
    businessUnitId: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
}

export interface ICommunicationRequest {
    recipientIds: string[];
    channel: CommunicationChannel;
    subject?: string;
    content: string;
    templateId?: string;
    scheduledFor?: Date;
}

export interface IFamilyStatistics {
    totalFamilies: number;
    activeFamilies: number;
    newFamiliesThisMonth: number;
    averageChildrenPerFamily: number;
    totalChildren: number;
    activeChildren: number;
    familiesByStatus: Record<FamilyStatus, number>;
    averageAccountBalance: number;
    totalAccountBalance: number;
}

export interface IInquiryStatistics {
    totalInquiries: number;
    newInquiriesThisMonth: number;
    conversionRate: number;
    inquiriesByStatus: Record<InquiryStatus, number>;
    inquiriesBySource: Record<LeadSource, number>;
    averageResponseTime: number; // in hours
    topInterestedPrograms: {
        programId: string;
        programName: string;
        inquiryCount: number;
    }[];
}