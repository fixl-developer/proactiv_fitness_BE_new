import { Schema, model, models, Document } from 'mongoose';

// =============================================
// FRANCHISE INVENTORY
// =============================================
export interface IFranchiseInventory extends Document {
    name: string;
    category: string;
    sku?: string;
    quantity: number;
    minStock: number;
    maxStock?: number;
    unitCost: number;
    totalValue: number;
    supplier?: string;
    locationId?: string;
    status: 'OPTIMAL' | 'LOW' | 'CRITICAL';
    notes?: string;
    franchiseId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const FranchiseInventorySchema = new Schema<IFranchiseInventory>(
    {
        name: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true, default: 'Equipment' },
        sku: { type: String, trim: true },
        quantity: { type: Number, required: true, min: 0, default: 0 },
        minStock: { type: Number, required: true, min: 0, default: 0 },
        maxStock: { type: Number, min: 0 },
        unitCost: { type: Number, required: true, min: 0, default: 0 },
        totalValue: { type: Number, default: 0 },
        supplier: { type: String, trim: true },
        locationId: { type: String, trim: true },
        status: {
            type: String,
            enum: ['OPTIMAL', 'LOW', 'CRITICAL'],
            default: 'OPTIMAL',
        },
        notes: { type: String, trim: true },
        franchiseId: { type: String, trim: true },
    },
    { timestamps: true }
);

FranchiseInventorySchema.pre('save', function (next) {
    this.totalValue = (this.quantity || 0) * (this.unitCost || 0);
    if (this.quantity <= (this.minStock || 0)) {
        this.status = this.quantity <= Math.floor((this.minStock || 0) / 2) ? 'CRITICAL' : 'LOW';
    } else {
        this.status = 'OPTIMAL';
    }
    next();
});

export const FranchiseInventory =
    (models.FranchiseInventory as any) ||
    model<IFranchiseInventory>('FranchiseInventory', FranchiseInventorySchema);

// =============================================
// FRANCHISE MARKETING CAMPAIGN
// =============================================
export interface IFranchiseCampaign extends Document {
    name: string;
    description?: string;
    type: string;
    status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
    discount?: number;
    budget: number;
    spent: number;
    reach: number;
    conversions: number;
    roi: number;
    startDate?: Date;
    endDate?: Date;
    targetAudience?: string;
    channels?: string[];
    locationIds?: string[];
    franchiseId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const FranchiseCampaignSchema = new Schema<IFranchiseCampaign>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        type: { type: String, required: true, default: 'PROMOTIONAL', trim: true },
        status: {
            type: String,
            enum: ['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'],
            default: 'DRAFT',
        },
        discount: { type: Number, min: 0, max: 100 },
        budget: { type: Number, required: true, min: 0, default: 0 },
        spent: { type: Number, default: 0, min: 0 },
        reach: { type: Number, default: 0, min: 0 },
        conversions: { type: Number, default: 0, min: 0 },
        roi: { type: Number, default: 0 },
        startDate: { type: Date },
        endDate: { type: Date },
        targetAudience: { type: String, trim: true },
        channels: [{ type: String, trim: true }],
        locationIds: [{ type: String, trim: true }],
        franchiseId: { type: String, trim: true },
    },
    { timestamps: true }
);

export const FranchiseCampaign =
    (models.FranchiseCampaign as any) ||
    model<IFranchiseCampaign>('FranchiseCampaign', FranchiseCampaignSchema);

// =============================================
// FRANCHISE FEEDBACK
// =============================================
export interface IFranchiseFeedback extends Document {
    customerName: string;
    customerEmail?: string;
    program?: string;
    locationId?: string;
    title?: string;
    comment: string;
    rating: number; // 1-5
    status: 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
    helpful: number;
    unhelpful: number;
    reply?: string;
    repliedAt?: Date;
    repliedBy?: string;
    franchiseId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const FranchiseFeedbackSchema = new Schema<IFranchiseFeedback>(
    {
        customerName: { type: String, required: true, trim: true },
        customerEmail: { type: String, trim: true, lowercase: true },
        program: { type: String, trim: true },
        locationId: { type: String, trim: true },
        title: { type: String, trim: true },
        comment: { type: String, required: true, trim: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        status: {
            type: String,
            enum: ['PENDING', 'PUBLISHED', 'ARCHIVED'],
            default: 'PENDING',
        },
        helpful: { type: Number, default: 0, min: 0 },
        unhelpful: { type: Number, default: 0, min: 0 },
        reply: { type: String, trim: true },
        repliedAt: { type: Date },
        repliedBy: { type: String, trim: true },
        franchiseId: { type: String, trim: true },
    },
    { timestamps: true }
);

export const FranchiseFeedback =
    (models.FranchiseFeedback as any) ||
    model<IFranchiseFeedback>('FranchiseFeedback', FranchiseFeedbackSchema);

// =============================================
// FRANCHISE SETTINGS (single doc per franchise / owner)
// =============================================
export interface IFranchiseSettings extends Document {
    ownerId?: string;
    franchiseId?: string;
    franchiseName: string;
    franchiseCode: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    businessPhone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    timezone: string;
    currency: string;
    notificationsEmail: boolean;
    notificationsSMS: boolean;
    notificationsPush: boolean;
    maintenanceMode: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const FranchiseSettingsSchema = new Schema<IFranchiseSettings>(
    {
        ownerId: { type: String, trim: true, index: true },
        franchiseId: { type: String, trim: true, index: true },
        franchiseName: { type: String, default: '', trim: true },
        franchiseCode: { type: String, default: '', trim: true },
        ownerName: { type: String, default: '', trim: true },
        ownerEmail: { type: String, default: '', trim: true, lowercase: true },
        ownerPhone: { type: String, default: '', trim: true },
        businessPhone: { type: String, default: '', trim: true },
        address: { type: String, default: '', trim: true },
        city: { type: String, default: '', trim: true },
        state: { type: String, default: '', trim: true },
        zipCode: { type: String, default: '', trim: true },
        timezone: { type: String, default: 'America/New_York', trim: true },
        currency: { type: String, default: 'USD', trim: true },
        notificationsEmail: { type: Boolean, default: true },
        notificationsSMS: { type: Boolean, default: true },
        notificationsPush: { type: Boolean, default: true },
        maintenanceMode: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const FranchiseSettings =
    (models.FranchiseSettings as any) ||
    model<IFranchiseSettings>('FranchiseSettings', FranchiseSettingsSchema);

// =============================================
// FRANCHISE EXPENSE (real expense tracking — replaces hardcoded percentages)
// =============================================
export type FranchiseExpenseCategory =
    | 'STAFF_SALARIES'
    | 'FACILITY_RENT'
    | 'EQUIPMENT'
    | 'UTILITIES'
    | 'MARKETING'
    | 'INSURANCE'
    | 'SUPPLIES'
    | 'OTHER';

export interface IFranchiseExpense extends Document {
    category: FranchiseExpenseCategory;
    amount: number;
    date: Date;
    description?: string;
    vendor?: string;
    paymentMethod?: string;
    referenceNumber?: string;
    locationId?: string;
    franchiseId?: string;
    status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
    approvedBy?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const FranchiseExpenseSchema = new Schema<IFranchiseExpense>(
    {
        category: {
            type: String,
            enum: ['STAFF_SALARIES', 'FACILITY_RENT', 'EQUIPMENT', 'UTILITIES', 'MARKETING', 'INSURANCE', 'SUPPLIES', 'OTHER'],
            required: true,
            index: true,
        },
        amount: { type: Number, required: true, min: 0 },
        date: { type: Date, required: true, default: Date.now, index: true },
        description: { type: String, trim: true },
        vendor: { type: String, trim: true },
        paymentMethod: { type: String, trim: true },
        referenceNumber: { type: String, trim: true },
        locationId: { type: String, trim: true },
        franchiseId: { type: String, trim: true, index: true },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'PAID', 'REJECTED'],
            default: 'PENDING',
        },
        approvedBy: { type: String, trim: true },
        notes: { type: String, trim: true },
    },
    { timestamps: true }
);

export const FranchiseExpense =
    (models.FranchiseExpense as any) ||
    model<IFranchiseExpense>('FranchiseExpense', FranchiseExpenseSchema);
