import { Schema, model, Document } from 'mongoose';

// Ticket Comment Schema
export interface ITicketComment extends Document {
    commentId: string;
    ticketId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userType: 'staff' | 'customer' | 'system';
    message: string;
    isInternal: boolean;
    attachments: {
        filename: string;
        url: string;
        uploadedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const TicketCommentSchema = new Schema<ITicketComment>({
    commentId: { type: String, required: true, unique: true },
    ticketId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userType: { type: String, enum: ['staff', 'customer', 'system'], required: true },
    message: { type: String, required: true },
    isInternal: { type: Boolean, default: false },
    attachments: [{
        filename: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Ticket History Schema
export interface ITicketHistory extends Document {
    historyId: string;
    ticketId: string;
    changeType: 'status' | 'priority' | 'assignment' | 'escalation' | 'resolution' | 'comment' | 'attachment' | 'other';
    fieldName: string;
    oldValue: any;
    newValue: any;
    changedBy: string;
    changedByEmail: string;
    reason?: string;
    createdAt: Date;
}

const TicketHistorySchema = new Schema<ITicketHistory>({
    historyId: { type: String, required: true, unique: true },
    ticketId: { type: String, required: true, index: true },
    changeType: { type: String, enum: ['status', 'priority', 'assignment', 'escalation', 'resolution', 'comment', 'attachment', 'other'], required: true },
    fieldName: { type: String, required: true },
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed,
    changedBy: { type: String, required: true },
    changedByEmail: { type: String, required: true },
    reason: String
}, {
    timestamps: true
});

// Support Ticket Schema
export interface ISupportTicket extends Document {
    ticketId: string;
    subject: string;
    description: string;
    customer: {
        name: string;
        email: string;
        phone?: string;
        userId?: string;
    };
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
    category: string;
    tags: string[];
    assignedTo?: string;
    assignedToName?: string;
    assignedToEmail?: string;
    assignedAt?: Date;
    resolution?: string;
    resolutionTime?: number; // in hours
    responseTime?: number; // in hours
    firstResponseAt?: Date;
    resolvedAt?: Date;
    closedAt?: Date;
    escalated: boolean;
    escalatedAt?: Date;
    escalatedTo?: string;
    escalationReason?: string;
    attachments: {
        filename: string;
        url: string;
        uploadedAt: Date;
    }[];
    comments: {
        commentId: string;
        author: string;
        authorType: 'staff' | 'customer' | 'system';
        message: string;
        isInternal: boolean;
        createdAt: Date;
    }[];
    history: {
        historyId: string;
        changeType: string;
        fieldName: string;
        oldValue: any;
        newValue: any;
        changedBy: string;
        changedAt: Date;
    }[];
    satisfaction?: {
        rating: number;
        feedback?: string;
        submittedAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

const SupportTicketSchema = new Schema<ISupportTicket>({
    ticketId: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: String,
        userId: String
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'pending', 'resolved', 'closed'],
        default: 'open'
    },
    category: { type: String, required: true },
    tags: [String],
    assignedTo: String,
    assignedToName: String,
    assignedToEmail: String,
    assignedAt: Date,
    resolution: String,
    resolutionTime: Number,
    responseTime: Number,
    firstResponseAt: Date,
    resolvedAt: Date,
    closedAt: Date,
    escalated: { type: Boolean, default: false },
    escalatedAt: Date,
    escalatedTo: String,
    escalationReason: String,
    attachments: [{
        filename: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    comments: [{
        commentId: { type: String, required: true },
        author: { type: String, required: true },
        authorType: { type: String, enum: ['staff', 'customer', 'system'], required: true },
        message: { type: String, required: true },
        isInternal: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    history: [{
        historyId: { type: String, required: true },
        changeType: { type: String, required: true },
        fieldName: { type: String, required: true },
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
        changedBy: { type: String, required: true },
        changedAt: { type: Date, default: Date.now }
    }],
    satisfaction: {
        rating: { type: Number, min: 1, max: 5 },
        feedback: String,
        submittedAt: Date
    },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true }
}, {
    timestamps: true
});

// Customer Inquiry Schema
export interface ICustomerInquiry extends Document {
    inquiryId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    subject: string;
    message: string;
    type: 'general' | 'billing' | 'technical' | 'complaint' | 'suggestion';
    status: 'new' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    assignedTo?: string;
    assignedAt?: Date;
    responses: {
        responseId: string;
        message: string;
        author: string;
        authorType: 'staff' | 'customer';
        isInternal: boolean;
        timestamp: Date;
    }[];
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
}

const CustomerInquirySchema = new Schema<ICustomerInquiry>({
    inquiryId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: String,
    subject: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['general', 'billing', 'technical', 'complaint', 'suggestion'],
        default: 'general'
    },
    status: {
        type: String,
        enum: ['new', 'in-progress', 'resolved', 'closed'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    assignedTo: String,
    assignedAt: Date,
    responses: [{
        responseId: { type: String, required: true },
        message: { type: String, required: true },
        author: { type: String, required: true },
        authorType: { type: String, enum: ['staff', 'customer'], required: true },
        isInternal: { type: Boolean, default: false },
        timestamp: { type: Date, default: Date.now }
    }],
    resolvedAt: Date,
    createdBy: String,
    updatedBy: String
}, {
    timestamps: true
});

// Knowledge Base Article Schema
export interface IKnowledgeBaseArticle extends Document {
    articleId: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    status: 'draft' | 'published' | 'archived';
    author: string;
    featured: boolean;
    views: number;
    helpful: number;
    notHelpful: number;
    votes: {
        userId: string;
        voteType: 'helpful' | 'not-helpful';
        votedAt: Date;
    }[];
    lastReviewed?: Date;
    reviewedBy?: string;
    version: number;
    relatedArticles: string[];
    attachments: {
        filename: string;
        url: string;
        uploadedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

const KnowledgeBaseArticleSchema = new Schema<IKnowledgeBaseArticle>({
    articleId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    tags: [String],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    author: { type: String, required: true },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 },
    votes: [{
        userId: { type: String, required: true },
        voteType: { type: String, enum: ['helpful', 'not-helpful'], required: true },
        votedAt: { type: Date, default: Date.now }
    }],
    lastReviewed: Date,
    reviewedBy: String,
    version: { type: Number, default: 1 },
    relatedArticles: [String],
    attachments: [{
        filename: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true }
}, {
    timestamps: true
});

// Live Chat Session Schema
export interface ILiveChatSession extends Document {
    sessionId: string;
    customerName: string;
    customerEmail: string;
    status: 'active' | 'waiting' | 'ended';
    startTime: Date;
    endTime?: Date;
    assignedAgent?: string;
    assignedAt?: Date;
    priority: 'low' | 'medium' | 'high';
    department: string;
    messages: {
        messageId: string;
        sender: 'customer' | 'agent';
        message: string;
        timestamp: Date;
        type: 'text' | 'image' | 'file';
        status: 'sent' | 'delivered' | 'read';
    }[];
    satisfaction?: {
        rating: number;
        feedback?: string;
        submittedAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const LiveChatSessionSchema = new Schema<ILiveChatSession>({
    sessionId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    status: {
        type: String,
        enum: ['active', 'waiting', 'ended'],
        default: 'waiting'
    },
    startTime: { type: Date, default: Date.now },
    endTime: Date,
    assignedAgent: String,
    assignedAt: Date,
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    department: { type: String, required: true },
    messages: [{
        messageId: { type: String, required: true },
        sender: { type: String, enum: ['customer', 'agent'], required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
        status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' }
    }],
    satisfaction: {
        rating: { type: Number, min: 1, max: 5 },
        feedback: String,
        submittedAt: Date
    }
}, {
    timestamps: true
});

// Staff Settings Schema
export interface IStaffSettings extends Document {
    userId: string;
    profile: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        department: string;
        role: string;
        timezone: string;
        language: string;
    };
    notifications: {
        emailNotifications: boolean;
        pushNotifications: boolean;
        smsNotifications: boolean;
        ticketAssignments: boolean;
        escalations: boolean;
        systemUpdates: boolean;
        weeklyReports: boolean;
        soundEnabled: boolean;
        desktopNotifications: boolean;
    };
    security: {
        twoFactorEnabled: boolean;
        sessionTimeout: number;
        passwordLastChanged: Date;
        loginHistory: boolean;
        ipRestriction: boolean;
    };
    preferences: {
        theme: string;
        ticketsPerPage: number;
        defaultPriority: string;
        autoRefresh: boolean;
        refreshInterval: number;
        showClosedTickets: boolean;
        compactView: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

const StaffSettingsSchema = new Schema<IStaffSettings>({
    userId: { type: String, required: true, unique: true },
    profile: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: String,
        department: String,
        role: String,
        timezone: { type: String, default: 'UTC' },
        language: { type: String, default: 'English' }
    },
    notifications: {
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: false },
        ticketAssignments: { type: Boolean, default: true },
        escalations: { type: Boolean, default: true },
        systemUpdates: { type: Boolean, default: false },
        weeklyReports: { type: Boolean, default: true },
        soundEnabled: { type: Boolean, default: true },
        desktopNotifications: { type: Boolean, default: true }
    },
    security: {
        twoFactorEnabled: { type: Boolean, default: false },
        sessionTimeout: { type: Number, default: 30 },
        passwordLastChanged: Date,
        loginHistory: { type: Boolean, default: true },
        ipRestriction: { type: Boolean, default: false }
    },
    preferences: {
        theme: { type: String, default: 'light' },
        ticketsPerPage: { type: Number, default: 25 },
        defaultPriority: { type: String, default: 'medium' },
        autoRefresh: { type: Boolean, default: true },
        refreshInterval: { type: Number, default: 30 },
        showClosedTickets: { type: Boolean, default: false },
        compactView: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

// Create indexes for better performance
SupportTicketSchema.index({ ticketId: 1 });
SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ priority: 1 });
SupportTicketSchema.index({ assignedTo: 1 });
SupportTicketSchema.index({ createdAt: -1 });
SupportTicketSchema.index({ 'customer.email': 1 });

TicketCommentSchema.index({ ticketId: 1 });
TicketCommentSchema.index({ userId: 1 });
TicketCommentSchema.index({ createdAt: -1 });

TicketHistorySchema.index({ ticketId: 1 });
TicketHistorySchema.index({ changedBy: 1 });
TicketHistorySchema.index({ createdAt: -1 });

CustomerInquirySchema.index({ inquiryId: 1 });
CustomerInquirySchema.index({ status: 1 });
CustomerInquirySchema.index({ type: 1 });
CustomerInquirySchema.index({ customerEmail: 1 });
CustomerInquirySchema.index({ createdAt: -1 });

KnowledgeBaseArticleSchema.index({ articleId: 1 });
KnowledgeBaseArticleSchema.index({ status: 1 });
KnowledgeBaseArticleSchema.index({ category: 1 });
KnowledgeBaseArticleSchema.index({ tags: 1 });
KnowledgeBaseArticleSchema.index({ featured: 1 });

LiveChatSessionSchema.index({ sessionId: 1 });
LiveChatSessionSchema.index({ status: 1 });
LiveChatSessionSchema.index({ assignedAgent: 1 });
LiveChatSessionSchema.index({ startTime: -1 });

StaffSettingsSchema.index({ userId: 1 });

// Export models
export const SupportTicket = model<ISupportTicket>('SupportTicket', SupportTicketSchema);
export const TicketComment = model<ITicketComment>('TicketComment', TicketCommentSchema);
export const TicketHistory = model<ITicketHistory>('TicketHistory', TicketHistorySchema);
export const CustomerInquiry = model<ICustomerInquiry>('CustomerInquiry', CustomerInquirySchema);
export const KnowledgeBaseArticle = model<IKnowledgeBaseArticle>('KnowledgeBaseArticle', KnowledgeBaseArticleSchema);
export const LiveChatSession = model<ILiveChatSession>('LiveChatSession', LiveChatSessionSchema);
export const StaffSettings = model<IStaffSettings>('StaffSettings', StaffSettingsSchema);