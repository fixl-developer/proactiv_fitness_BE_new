import { Schema, model } from 'mongoose';
import {
    IChildProfile,
    IFamilyProfile,
    IInquiry,
    ILeadManagement,
    FamilyStatus,
    InquiryStatus,
    LeadSource,
    CommunicationChannel,
    RelationshipType,
    MedicalFlagType,
    ContactPreference
} from './crm.interface';
import { baseSchemaOptions } from '../../shared/base/base.model';

// Address Schema
const addressSchema = new Schema({
    street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    postalCode: {
        type: String,
        required: [true, 'Postal code is required'],
        trim: true
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        default: 'United States'
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['home', 'work', 'billing', 'other'],
        default: 'home'
    }
});

// Emergency Contact Schema
const emergencyContactSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Emergency contact name is required'],
        trim: true
    },
    relationship: {
        type: String,
        enum: Object.values(RelationshipType),
        required: [true, 'Relationship is required']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    alternatePhone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    address: addressSchema,
    isPrimary: {
        type: Boolean,
        default: false
    },
    canPickup: {
        type: Boolean,
        default: true
    },
    notes: {
        type: String,
        trim: true
    }
});

// Medical Flag Schema
const medicalFlagSchema = new Schema({
    type: {
        type: String,
        enum: Object.values(MedicalFlagType),
        required: [true, 'Medical flag type is required']
    },
    description: {
        type: String,
        required: [true, 'Medical flag description is required'],
        trim: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: [true, 'Severity is required']
    },
    medications: [String],
    instructions: {
        type: String,
        trim: true
    },
    doctorContact: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Communication Log Schema
const communicationLogSchema = new Schema({
    channel: {
        type: String,
        enum: Object.values(CommunicationChannel),
        required: [true, 'Communication channel is required']
    },
    direction: {
        type: String,
        enum: ['inbound', 'outbound'],
        required: [true, 'Communication direction is required']
    },
    subject: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Communication content is required']
    },
    sentBy: {
        type: String,
        required: [true, 'Sender is required']
    },
    sentTo: [{
        type: String,
        required: [true, 'Recipient is required']
    }],
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed'],
        default: 'sent'
    },
    metadata: {
        type: Map,
        of: Schema.Types.Mixed
    }
});

// Family Member Schema
const familyMemberSchema = new Schema({
    // @ts-ignore - Mongoose type issue
    userId: {
        type: String,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    relationship: {
        type: String,
        enum: Object.values(RelationshipType),
        required: [true, 'Relationship is required']
    },
    isPrimary: {
        type: Boolean,
        default: false
    },
    canMakeBookings: {
        type: Boolean,
        default: true
    },
    canViewBilling: {
        type: Boolean,
        default: true
    },
    canPickupChildren: {
        type: Boolean,
        default: true
    },
    contactPreferences: [{
        type: String,
        enum: Object.values(ContactPreference)
    }],
    notes: {
        type: String,
        trim: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

// Child Profile Schema
const childProfileSchema = new Schema<IChildProfile>({
    // Basic Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required'],
        index: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say'],
        required: [true, 'Gender is required']
    },

    // Family Connection
    // @ts-ignore - Mongoose type issue
    familyId: {
        type: String,
        ref: 'FamilyProfile',
        required: [true, 'Family ID is required'],
        index: true
    },
    parentIds: [{
        type: String,
        ref: 'User',
        required: [true, 'At least one parent ID is required']
    }],

    // Physical Information
    height: {
        type: Number,
        min: [0, 'Height cannot be negative']
    },
    weight: {
        type: Number,
        min: [0, 'Weight cannot be negative']
    },

    // Medical Information (Encrypted)
    medicalFlags: [medicalFlagSchema],
    allergies: [String],
    medications: [String],
    medicalConditions: [String],
    dietaryRestrictions: [String],

    // Emergency Contacts
    emergencyContacts: {
        type: [emergencyContactSchema],
        validate: {
            validator: function (contacts: any[]) {
                return contacts && contacts.length > 0;
            },
            message: 'At least one emergency contact is required'
        }
    },

    // Program Information
    currentPrograms: [{
        type: String,
        ref: 'Program'
    }],
    programHistory: [{
        // @ts-ignore - Mongoose type issue
        programId: {
            type: String,
            ref: 'Program',
            required: [true, 'Program ID is required']
        },
        enrollmentDate: {
            type: Date,
            required: [true, 'Enrollment date is required']
        },
        completionDate: Date,
        status: {
            type: String,
            enum: ['active', 'completed', 'withdrawn'],
            required: [true, 'Program status is required']
        },
        achievements: [String]
    }],

    // Skills and Progress
    skillLevels: {
        type: Map,
        of: String
    },
    achievements: [{
        type: {
            type: String,
            required: [true, 'Achievement type is required']
        },
        title: {
            type: String,
            required: [true, 'Achievement title is required']
        },
        description: {
            type: String,
            required: [true, 'Achievement description is required']
        },
        dateAchieved: {
            type: Date,
            required: [true, 'Achievement date is required']
        },
        // @ts-ignore - Mongoose type issue
        programId: {
            type: String,
            ref: 'Program'
        }
    }],

    // Behavioral Notes
    behavioralNotes: [{
        note: {
            type: String,
            required: [true, 'Note is required'],
            trim: true
        },
        category: {
            type: String,
            enum: ['positive', 'concern', 'neutral'],
            required: [true, 'Note category is required']
        },
        createdBy: {
            type: String,
            ref: 'User',
            required: [true, 'Created by is required']
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        isPrivate: {
            type: Boolean,
            default: false
        }
    }],

    // Preferences
    preferences: {
        favoriteActivities: [String],
        dislikedActivities: [String],
        learningStyle: {
            type: String,
            trim: true
        },
        motivationFactors: [String]
    },

    // Photos and Media
    profilePhotoUrl: {
        type: String,
        trim: true
    },
    mediaConsent: {
        photography: {
            type: Boolean,
            required: [true, 'Photography consent is required']
        },
        videography: {
            type: Boolean,
            required: [true, 'Videography consent is required']
        },
        socialMedia: {
            type: Boolean,
            required: [true, 'Social media consent is required']
        },
        marketing: {
            type: Boolean,
            required: [true, 'Marketing consent is required']
        },
        consentDate: {
            type: Date,
            required: [true, 'Consent date is required']
        },
        consentBy: {
            type: String,
            ref: 'User',
            required: [true, 'Consent by is required']
        }
    },

    // Status
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },

    // Audit
    createdBy: {
        type: String,
        ref: 'User',
        required: [true, 'Created by is required']
    },
    updatedBy: {
        type: String,
        ref: 'User',
        required: [true, 'Updated by is required']
    }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Family Profile Schema
const familyProfileSchema = new Schema<IFamilyProfile>({
    // Basic Information
    familyName: {
        type: String,
        required: [true, 'Family name is required'],
        trim: true,
        maxlength: [100, 'Family name cannot exceed 100 characters'],
        index: true
    },
    familyCode: {
        type: String,
        required: [true, 'Family code is required'],
        unique: true,
        trim: true,
        uppercase: true,
        index: true
    },

    // Members
    members: [familyMemberSchema],
    children: [{
        type: String,
        ref: 'ChildProfile'
    }],

    // Contact Information
    primaryEmail: {
        type: String,
        required: [true, 'Primary email is required'],
        trim: true,
        lowercase: true,
        index: true
    },
    secondaryEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    primaryPhone: {
        type: String,
        required: [true, 'Primary phone is required'],
        trim: true,
        index: true
    },
    secondaryPhone: {
        type: String,
        trim: true
    },
    addresses: [addressSchema],

    // Communication Preferences
    preferredContactMethod: {
        type: String,
        enum: Object.values(ContactPreference),
        default: ContactPreference.EMAIL
    },
    communicationLanguage: {
        type: String,
        default: 'en',
        trim: true
    },
    timeZone: {
        type: String,
        default: 'America/New_York',
        trim: true
    },

    // Business Information
    // @ts-ignore - Mongoose type issue
    businessUnitId: {
        type: String,
        ref: 'BusinessUnit',
        required: [true, 'Business unit ID is required'],
        index: true
    },
    locationIds: [{
        type: String,
        ref: 'Location',
        required: [true, 'At least one location ID is required']
    }],

    // Account Status
    status: {
        type: String,
        enum: Object.values(FamilyStatus),
        default: FamilyStatus.ACTIVE,
        index: true
    },
    accountBalance: {
        type: Number,
        default: 0,
        index: true
    },
    creditLimit: {
        type: Number,
        default: 0,
        min: [0, 'Credit limit cannot be negative']
    },

    // Billing Information
    billingAddress: addressSchema,
    paymentMethods: [{
        type: String,
        ref: 'PaymentMethod'
    }],
    billingPreferences: {
        consolidatedBilling: {
            type: Boolean,
            default: true
        },
        billingCycle: {
            type: String,
            enum: ['monthly', 'quarterly', 'annually'],
            default: 'monthly'
        },
        autoPayEnabled: {
            type: Boolean,
            default: false
        },
        invoiceDelivery: {
            type: String,
            enum: ['email', 'postal', 'both'],
            default: 'email'
        }
    },

    // Marketing and Communication
    marketingConsent: {
        email: {
            type: Boolean,
            default: true
        },
        sms: {
            type: Boolean,
            default: false
        },
        phone: {
            type: Boolean,
            default: false
        },
        postal: {
            type: Boolean,
            default: false
        },
        consentDate: {
            type: Date,
            required: [true, 'Marketing consent date is required']
        }
    },

    // Family Notes
    notes: [{
        note: {
            type: String,
            required: [true, 'Note is required'],
            trim: true
        },
        category: {
            type: String,
            enum: ['general', 'billing', 'medical', 'behavioral', 'administrative'],
            required: [true, 'Note category is required']
        },
        isPrivate: {
            type: Boolean,
            default: false
        },
        createdBy: {
            type: String,
            ref: 'User',
            required: [true, 'Created by is required']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Communication History
    communicationLog: [communicationLogSchema],

    // Referral Information
    referredBy: {
        type: String,
        ref: 'FamilyProfile'
    },
    referralCode: {
        type: String,
        trim: true,
        uppercase: true,
        index: true
    },
    referrals: [{
        // @ts-ignore - Mongoose type issue
        referredFamilyId: {
            type: String,
            ref: 'FamilyProfile',
            required: [true, 'Referred family ID is required']
        },
        referralDate: {
            type: Date,
            required: [true, 'Referral date is required']
        },
        status: {
            type: String,
            enum: ['pending', 'enrolled', 'expired'],
            required: [true, 'Referral status is required']
        },
        rewardEarned: Number
    }],

    // Important Dates
    firstEnrollmentDate: {
        type: Date,
        index: true
    },
    lastActivityDate: {
        type: Date,
        index: true
    },

    // Audit
    createdBy: {
        type: String,
        ref: 'User',
        required: [true, 'Created by is required']
    },
    updatedBy: {
        type: String,
        ref: 'User',
        required: [true, 'Updated by is required']
    }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Inquiry Schema
const inquirySchema = new Schema<IInquiry>({
    // Basic Information
    // @ts-ignore - Mongoose type issue
    inquiryId: {
        type: String,
        required: [true, 'Inquiry ID is required'],
        unique: true,
        trim: true,
        index: true
    },
    source: {
        type: String,
        enum: Object.values(LeadSource),
        required: [true, 'Lead source is required'],
        index: true
    },
    status: {
        type: String,
        enum: Object.values(InquiryStatus),
        default: InquiryStatus.NEW,
        index: true
    },

    // Contact Information
    parentName: {
        type: String,
        required: [true, 'Parent name is required'],
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        index: true
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        trim: true,
        index: true
    },

    // Child Information
    childName: {
        type: String,
        trim: true
    },
    childAge: {
        type: Number,
        min: [0, 'Child age cannot be negative']
    },
    childAgeType: {
        type: String,
        enum: ['months', 'years'],
        default: 'years'
    },

    // Interest Information
    interestedPrograms: [{
        type: String,
        ref: 'Program'
    }],
    preferredLocations: [{
        type: String,
        ref: 'Location'
    }],
    preferredDays: [String],
    preferredTimes: [String],

    // Business Information
    // @ts-ignore - Mongoose type issue
    businessUnitId: {
        type: String,
        ref: 'BusinessUnit',
        required: [true, 'Business unit ID is required'],
        index: true
    },
    assignedTo: {
        type: String,
        ref: 'User',
        index: true
    },

    // Follow-up Information
    followUpDate: {
        type: Date,
        index: true
    },
    followUpNotes: [String],

    // Conversion Information
    // @ts-ignore - Mongoose type issue
    convertedToFamilyId: {
        type: String,
        ref: 'FamilyProfile'
    },
    conversionDate: {
        type: Date,
        index: true
    },

    // Communication History
    communications: [communicationLogSchema],

    // Metadata
    utmSource: {
        type: String,
        trim: true
    },
    utmMedium: {
        type: String,
        trim: true
    },
    utmCampaign: {
        type: String,
        trim: true
    },
    referrerUrl: {
        type: String,
        trim: true
    },

    // Audit
    createdBy: {
        type: String,
        ref: 'User',
        required: [true, 'Created by is required']
    },
    updatedBy: {
        type: String,
        ref: 'User',
        required: [true, 'Updated by is required']
    }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Lead Management Schema
const leadManagementSchema = new Schema<ILeadManagement>({
    // Lead Information
    // @ts-ignore - Mongoose type issue
    leadId: {
        type: String,
        required: [true, 'Lead ID is required'],
        unique: true,
        trim: true,
        index: true
    },
    source: {
        type: String,
        enum: Object.values(LeadSource),
        required: [true, 'Lead source is required'],
        index: true
    },
    status: {
        type: String,
        enum: ['new', 'qualified', 'nurturing', 'converted', 'lost'],
        default: 'new',
        index: true
    },

    // Contact Information
    contactName: {
        type: String,
        required: [true, 'Contact name is required'],
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        index: true
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        trim: true,
        index: true
    },

    // Lead Scoring
    score: {
        type: Number,
        default: 0,
        min: [0, 'Score cannot be negative'],
        index: true
    },
    scoringFactors: [{
        factor: {
            type: String,
            required: [true, 'Scoring factor is required']
        },
        points: {
            type: Number,
            required: [true, 'Points are required']
        },
        reason: {
            type: String,
            required: [true, 'Reason is required']
        }
    }],

    // Assignment
    assignedTo: {
        type: String,
        ref: 'User',
        index: true
    },
    assignedDate: {
        type: Date,
        index: true
    },

    // Follow-up
    nextFollowUp: {
        type: Date,
        index: true
    },
    followUpHistory: [{
        date: {
            type: Date,
            required: [true, 'Follow-up date is required']
        },
        method: {
            type: String,
            enum: Object.values(CommunicationChannel),
            required: [true, 'Communication method is required']
        },
        outcome: {
            type: String,
            required: [true, 'Outcome is required']
        },
        nextAction: {
            type: String,
            required: [true, 'Next action is required']
        },
        staffMember: {
            type: String,
            ref: 'User',
            required: [true, 'Staff member is required']
        }
    }],

    // Conversion
    // @ts-ignore - Mongoose type issue
    convertedToInquiryId: {
        type: String,
        ref: 'Inquiry'
    },
    conversionDate: {
        type: Date,
        index: true
    },

    // Audit
    createdBy: {
        type: String,
        ref: 'User',
        required: [true, 'Created by is required']
    },
    updatedBy: {
        type: String,
        ref: 'User',
        required: [true, 'Updated by is required']
    }
}, {
    ...baseSchemaOptions,
    timestamps: true
});

// Indexes for performance
childProfileSchema.index({ familyId: 1, isActive: 1 });
childProfileSchema.index({ 'parentIds': 1 });
childProfileSchema.index({ dateOfBirth: 1 });
childProfileSchema.index({ currentPrograms: 1 });

familyProfileSchema.index({ businessUnitId: 1, status: 1 });
familyProfileSchema.index({ locationIds: 1, status: 1 });
familyProfileSchema.index({ primaryEmail: 1 });
familyProfileSchema.index({ primaryPhone: 1 });
familyProfileSchema.index({ accountBalance: 1 });
familyProfileSchema.index({ lastActivityDate: 1 });

inquirySchema.index({ businessUnitId: 1, status: 1 });
inquirySchema.index({ source: 1, status: 1 });
inquirySchema.index({ assignedTo: 1, status: 1 });
inquirySchema.index({ followUpDate: 1 });
inquirySchema.index({ createdAt: 1 });

leadManagementSchema.index({ source: 1, status: 1 });
leadManagementSchema.index({ assignedTo: 1, status: 1 });
leadManagementSchema.index({ score: -1 });
leadManagementSchema.index({ nextFollowUp: 1 });

// Text search indexes
familyProfileSchema.index({
    familyName: 'text',
    primaryEmail: 'text',
    primaryPhone: 'text'
});

childProfileSchema.index({
    firstName: 'text',
    lastName: 'text'
});

inquirySchema.index({
    parentName: 'text',
    email: 'text',
    phone: 'text',
    childName: 'text'
});

// Pre-save middleware
familyProfileSchema.pre('save', function (next) {
    if (this.isNew && !this.familyCode) {
        this.familyCode = `FAM${Date.now().toString().slice(-6)}`;
    }
    next();
});

inquirySchema.pre('save', function (next) {
    if (this.isNew && !this.inquiryId) {
        this.inquiryId = `INQ${Date.now().toString().slice(-8)}`;
    }
    next();
});

leadManagementSchema.pre('save', function (next) {
    if (this.isNew && !this.leadId) {
        this.leadId = `LEAD${Date.now().toString().slice(-8)}`;
    }
    next();
});

// Virtual fields
childProfileSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

childProfileSchema.virtual('age').get(function () {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
});

familyProfileSchema.virtual('primaryAddress').get(function () {
    return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
});

// Export models
export const ChildProfile = model<IChildProfile>('ChildProfile', childProfileSchema);
export const FamilyProfile = model<IFamilyProfile>('FamilyProfile', familyProfileSchema);
export const Inquiry = model<IInquiry>('Inquiry', inquirySchema);
export const LeadManagement = model<ILeadManagement>('LeadManagement', leadManagementSchema);
