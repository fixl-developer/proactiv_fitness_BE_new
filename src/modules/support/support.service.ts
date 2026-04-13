import { FilterQuery, Document } from 'mongoose';
import {
    SupportTicket,
    CustomerInquiry,
    KnowledgeBaseArticle,
    LiveChatSession,
    StaffSettings,
    ISupportTicket,
    ICustomerInquiry,
    IKnowledgeBaseArticle,
    ILiveChatSession,
    IStaffSettings
} from './support.model';
import { BaseService, EntityContext } from '../../shared/base/base.service';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

export class SupportService extends BaseService<ISupportTicket> {
    constructor() {
        super(SupportTicket, 'ticket');
    }

    protected getEntityContext(doc: any): EntityContext | null {
        return {
            targetUserId: doc.createdBy?.toString(),
        };
    }

    /**
     * Get support dashboard data
     */
    async getDashboardData(): Promise<any> {
        try {
            // Try to get real data from database
            const [
                totalTickets,
                openTickets,
                resolvedTickets,
                criticalTickets,
                ticketsToday,
                avgResolutionTime,
                avgResponseTime
            ] = await Promise.all([
                SupportTicket.countDocuments(),
                SupportTicket.countDocuments({ status: { $in: ['open', 'in-progress'] } }),
                SupportTicket.countDocuments({ status: 'resolved' }),
                SupportTicket.countDocuments({ priority: 'critical', status: { $ne: 'closed' } }),
                SupportTicket.countDocuments({
                    createdAt: {
                        $gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }),
                this.calculateAverageResolutionTime(),
                this.calculateAverageResponseTime()
            ]);

            const resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;
            const escalatedTickets = await SupportTicket.countDocuments({ escalated: true, status: { $ne: 'closed' } });

            return {
                totalTickets,
                openTickets,
                resolvedTickets,
                avgResolutionTime: avgResolutionTime || 0,
                customerSatisfaction: await this.calculateCustomerSatisfaction(),
                responseTime: avgResponseTime || 0,
                ticketVolume: ticketsToday,
                resolutionRate: Math.round(resolutionRate * 10) / 10,
                escalatedTickets,
                pendingReview: await SupportTicket.countDocuments({ status: 'pending' }),
                criticalAlerts: criticalTickets,
                warnings: await this.getWarningsCount()
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get dashboard data',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get support tickets with filtering and pagination
     */
    async getTickets(filters: any = {}, page: number = 1, limit: number = 25): Promise<any> {
        try {
            const query: FilterQuery<ISupportTicket> = {};

            if (filters.status) query.status = filters.status;
            if (filters.priority) query.priority = filters.priority;
            if (filters.assignedTo) query.assignedTo = filters.assignedTo;
            if (filters.category) query.category = filters.category;
            if (filters.search) {
                query.$or = [
                    { subject: { $regex: filters.search, $options: 'i' } },
                    { description: { $regex: filters.search, $options: 'i' } },
                    { 'customer.name': { $regex: filters.search, $options: 'i' } },
                    { 'customer.email': { $regex: filters.search, $options: 'i' } }
                ];
            }

            const skip = (page - 1) * limit;
            const [tickets, total] = await Promise.all([
                SupportTicket.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                SupportTicket.countDocuments(query)
            ]);

            return {
                tickets,
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get tickets',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Create new support ticket
     */
    async createTicket(ticketData: Partial<ISupportTicket>, createdBy: string): Promise<ISupportTicket> {
        try {
            const ticketId = this.generateTicketId();

            const ticket = new SupportTicket({
                ticketId,
                ...ticketData,
                createdBy,
                updatedBy: createdBy
            });

            await ticket.save();
            this.emitRealtimeEvent('created', ticket);
            return ticket;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create ticket',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update support ticket
     */
    async updateTicket(ticketId: string, updates: Partial<ISupportTicket>, updatedBy: string): Promise<ISupportTicket> {
        try {
            const ticket = await SupportTicket.findOneAndUpdate(
                { ticketId },
                { ...updates, updatedBy, updatedAt: new Date() },
                { new: true }
            );

            if (!ticket) {
                throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);
            }

            this.emitRealtimeEvent('updated', ticket);
            return ticket;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update ticket',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Add comment to ticket
     */
    async addTicketComment(
        ticketId: string,
        comment: string,
        author: string,
        authorType: 'staff' | 'customer' | 'system',
        isInternal: boolean = false
    ): Promise<ISupportTicket> {
        try {
            const commentId = this.generateCommentId();
            const newComment = {
                commentId,
                author,
                authorType,
                message: comment,
                isInternal,
                createdAt: new Date()
            };

            const ticket = await SupportTicket.findOneAndUpdate(
                { ticketId },
                {
                    $push: { comments: newComment },
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!ticket) {
                throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);
            }

            return ticket;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to add comment',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    private async calculateAverageResolutionTime(): Promise<number> {
        try {
            const result = await SupportTicket.aggregate([
                { $match: { status: 'resolved', resolutionTime: { $exists: true } } },
                { $group: { _id: null, avgTime: { $avg: '$resolutionTime' } } }
            ]);
            return result[0]?.avgTime || 0;
        } catch (error) {
            return 0;
        }
    }

    private async calculateAverageResponseTime(): Promise<number> {
        try {
            const result = await SupportTicket.aggregate([
                { $match: { responseTime: { $exists: true } } },
                { $group: { _id: null, avgTime: { $avg: '$responseTime' } } }
            ]);
            return result[0]?.avgTime || 0;
        } catch (error) {
            return 0;
        }
    }

    private async calculateCustomerSatisfaction(): Promise<number> {
        try {
            const result = await SupportTicket.aggregate([
                { $match: { 'satisfaction.rating': { $exists: true } } },
                { $group: { _id: null, avgRating: { $avg: '$satisfaction.rating' } } }
            ]);
            return result[0]?.avgRating || 0;
        } catch (error) {
            return 0;
        }
    }

    private async getWarningsCount(): Promise<number> {
        try {
            const overdueTickets = await SupportTicket.countDocuments({
                status: { $in: ['open', 'in-progress'] },
                createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 hours ago
            });
            return overdueTickets;
        } catch (error) {
            return 0;
        }
    }

    private generateTicketId(): string {
        return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }

    private generateCommentId(): string {
        return `CMT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    }
}

export class CustomerInquiryService extends BaseService<ICustomerInquiry> {
    constructor() {
        super(CustomerInquiry);
    }

    /**
     * Get customer inquiries with filtering and pagination
     */
    async getInquiries(filters: any = {}, page: number = 1, limit: number = 25): Promise<any> {
        try {
            const query: FilterQuery<ICustomerInquiry> = {};

            if (filters.status) query.status = filters.status;
            if (filters.type) query.type = filters.type;
            if (filters.priority) query.priority = filters.priority;
            if (filters.assignedTo) query.assignedTo = filters.assignedTo;
            if (filters.search) {
                query.$or = [
                    { subject: { $regex: filters.search, $options: 'i' } },
                    { message: { $regex: filters.search, $options: 'i' } },
                    { customerName: { $regex: filters.search, $options: 'i' } },
                    { customerEmail: { $regex: filters.search, $options: 'i' } }
                ];
            }

            const skip = (page - 1) * limit;
            const [inquiries, total] = await Promise.all([
                CustomerInquiry.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                CustomerInquiry.countDocuments(query)
            ]);

            return {
                inquiries,
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get inquiries',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Create new customer inquiry
     */
    async createInquiry(inquiryData: Partial<ICustomerInquiry>): Promise<ICustomerInquiry> {
        try {
            const inquiryId = this.generateInquiryId();

            const inquiry = new CustomerInquiry({
                inquiryId,
                ...inquiryData
            });

            await inquiry.save();
            return inquiry;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create inquiry',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Respond to customer inquiry
     */
    async respondToInquiry(
        inquiryId: string,
        message: string,
        author: string,
        authorType: 'staff' | 'customer',
        isInternal: boolean = false
    ): Promise<ICustomerInquiry> {
        try {
            const responseId = this.generateResponseId();
            const response = {
                responseId,
                message,
                author,
                authorType,
                isInternal,
                timestamp: new Date()
            };

            const inquiry = await CustomerInquiry.findOneAndUpdate(
                { inquiryId },
                {
                    $push: { responses: response },
                    status: 'in-progress',
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!inquiry) {
                throw new AppError('Inquiry not found', HTTP_STATUS.NOT_FOUND);
            }

            return inquiry;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to respond to inquiry',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update inquiry status
     */
    async updateInquiry(inquiryId: string, updates: Partial<ICustomerInquiry>): Promise<ICustomerInquiry> {
        try {
            const inquiry = await CustomerInquiry.findOneAndUpdate(
                { inquiryId },
                { ...updates, updatedAt: new Date() },
                { new: true }
            );

            if (!inquiry) {
                throw new AppError('Inquiry not found', HTTP_STATUS.NOT_FOUND);
            }

            return inquiry;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update inquiry',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    private generateInquiryId(): string {
        return `INQ-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }

    private generateResponseId(): string {
        return `RSP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    }
}

export class KnowledgeBaseService extends BaseService<IKnowledgeBaseArticle> {
    constructor() {
        super(KnowledgeBaseArticle);
    }

    /**
     * Get knowledge base articles with filtering and pagination
     */
    async getArticles(filters: any = {}, page: number = 1, limit: number = 25): Promise<any> {
        try {
            const query: FilterQuery<IKnowledgeBaseArticle> = {};

            if (filters.status) query.status = filters.status;
            if (filters.category) query.category = filters.category;
            if (filters.featured !== undefined) query.featured = filters.featured;
            if (filters.author) query.author = filters.author;
            if (filters.search) {
                query.$or = [
                    { title: { $regex: filters.search, $options: 'i' } },
                    { content: { $regex: filters.search, $options: 'i' } },
                    { tags: { $in: [new RegExp(filters.search, 'i')] } }
                ];
            }

            const skip = (page - 1) * limit;
            const [articles, total] = await Promise.all([
                KnowledgeBaseArticle.find(query)
                    .sort({ featured: -1, createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                KnowledgeBaseArticle.countDocuments(query)
            ]);

            return {
                articles,
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get articles',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Create new knowledge base article
     */
    async createArticle(articleData: Partial<IKnowledgeBaseArticle>, createdBy: string): Promise<IKnowledgeBaseArticle> {
        try {
            const articleId = this.generateArticleId();

            const article = new KnowledgeBaseArticle({
                articleId,
                ...articleData,
                createdBy,
                updatedBy: createdBy
            });

            await article.save();
            return article;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create article',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update knowledge base article
     */
    async updateArticle(articleId: string, updates: Partial<IKnowledgeBaseArticle>, updatedBy: string): Promise<IKnowledgeBaseArticle> {
        try {
            const article = await KnowledgeBaseArticle.findOneAndUpdate(
                { articleId },
                {
                    ...updates,
                    updatedBy,
                    updatedAt: new Date(),
                    $inc: { version: 1 }
                },
                { new: true }
            );

            if (!article) {
                throw new AppError('Article not found', HTTP_STATUS.NOT_FOUND);
            }

            return article;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update article',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Delete knowledge base article
     */
    async deleteArticle(articleId: string): Promise<void> {
        try {
            const result = await KnowledgeBaseArticle.deleteOne({ articleId });

            if (result.deletedCount === 0) {
                throw new AppError('Article not found', HTTP_STATUS.NOT_FOUND);
            }
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to delete article',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Increment article views
     */
    async incrementViews(articleId: string): Promise<void> {
        try {
            await KnowledgeBaseArticle.findOneAndUpdate(
                { articleId },
                { $inc: { views: 1 } }
            );
        } catch (error: any) {
            // Silently fail for view counting
        }
    }

    /**
     * Rate article (helpful/not helpful)
     */
    async rateArticle(articleId: string, helpful: boolean): Promise<IKnowledgeBaseArticle> {
        try {
            const updateField = helpful ? { helpful: 1 } : { notHelpful: 1 };

            const article = await KnowledgeBaseArticle.findOneAndUpdate(
                { articleId },
                { $inc: updateField },
                { new: true }
            );

            if (!article) {
                throw new AppError('Article not found', HTTP_STATUS.NOT_FOUND);
            }

            return article;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to rate article',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    private generateArticleId(): string {
        return `KB-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
}

export class LiveChatService extends BaseService<ILiveChatSession> {
    constructor() {
        super(LiveChatSession);
    }

    /**
     * Get active chat sessions
     */
    async getChatSessions(filters: any = {}): Promise<any> {
        try {
            const query: FilterQuery<ILiveChatSession> = {};

            if (filters.status) query.status = filters.status;
            if (filters.assignedAgent) query.assignedAgent = filters.assignedAgent;
            if (filters.department) query.department = filters.department;

            const sessions = await LiveChatSession.find(query)
                .sort({ startTime: -1 })
                .lean();

            return { sessions };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get chat sessions',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get chat messages for a session
     */
    async getChatMessages(sessionId: string): Promise<any> {
        try {
            const session = await LiveChatSession.findOne({ sessionId }).lean();

            if (!session) {
                throw new AppError('Chat session not found', HTTP_STATUS.NOT_FOUND);
            }

            return { messages: session.messages || [] };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get chat messages',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Send chat message
     */
    async sendMessage(sessionId: string, message: string, sender: 'customer' | 'agent'): Promise<any> {
        try {
            const messageId = this.generateMessageId();
            const newMessage = {
                messageId,
                sender,
                message,
                timestamp: new Date(),
                type: 'text' as const,
                status: 'sent' as const
            };

            const session = await LiveChatSession.findOneAndUpdate(
                { sessionId },
                {
                    $push: { messages: newMessage },
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!session) {
                throw new AppError('Chat session not found', HTTP_STATUS.NOT_FOUND);
            }

            return newMessage;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to send message',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Create a new chat session
     */
    async createSession(data: {
        customerName: string;
        customerEmail?: string;
        initialMessage?: string;
        assignedAgent?: string;
    }): Promise<any> {
        try {
            const sessionId = `CHAT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            const messages: any[] = [];

            if (data.initialMessage) {
                messages.push({
                    messageId: this.generateMessageId(),
                    sender: 'agent',
                    message: data.initialMessage,
                    timestamp: new Date(),
                    type: 'text' as const,
                    status: 'sent' as const
                });
            }

            const session = await LiveChatSession.create({
                sessionId,
                customerName: data.customerName,
                customerEmail: data.customerEmail || '',
                status: 'active',
                startTime: new Date(),
                assignedAgent: data.assignedAgent || '',
                priority: 'medium',
                department: 'general',
                messages
            });

            return session;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to create chat session',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    private generateMessageId(): string {
        return `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    }
}

export class StaffSettingsService extends BaseService<IStaffSettings> {
    constructor() {
        super(StaffSettings);
    }

    /**
     * Get staff settings
     */
    async getSettings(userId: string): Promise<IStaffSettings> {
        try {
            let settings = await StaffSettings.findOne({ userId });

            if (!settings) {
                // Create default settings
                settings = await this.createDefaultSettings(userId);
            }

            // At this point, settings is guaranteed to exist
            if (!settings) {
                throw new AppError('Failed to create or retrieve settings', HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }

            return settings.toObject();
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get settings',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update staff settings
     */
    async updateSettings(userId: string, updates: Partial<IStaffSettings>): Promise<IStaffSettings> {
        try {
            const settings = await StaffSettings.findOneAndUpdate(
                { userId },
                { ...updates, updatedAt: new Date() },
                { new: true, upsert: true }
            );

            return settings;
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to update settings',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    private async createDefaultSettings(userId: string) {
        const defaultSettings = new StaffSettings({
            userId,
            profile: {
                firstName: 'Staff',
                lastName: 'Member',
                email: 'staff@company.com',
                phone: '',
                department: 'Support',
                role: 'Support Staff',
                timezone: 'UTC',
                language: 'English'
            },
            notifications: {
                emailNotifications: true,
                pushNotifications: true,
                smsNotifications: false,
                ticketAssignments: true,
                escalations: true,
                systemUpdates: false,
                weeklyReports: true,
                soundEnabled: true,
                desktopNotifications: true
            },
            security: {
                twoFactorEnabled: false,
                sessionTimeout: 30,
                passwordLastChanged: new Date(),
                loginHistory: true,
                ipRestriction: false
            },
            preferences: {
                theme: 'light',
                ticketsPerPage: 25,
                defaultPriority: 'medium',
                autoRefresh: true,
                refreshInterval: 30,
                showClosedTickets: false,
                compactView: false
            }
        });

        await defaultSettings.save();
        return defaultSettings;
    }
}

export class SupportAnalyticsService {
    /**
     * Get support analytics data
     */
    async getAnalytics(period: string = '30d'): Promise<any> {
        try {
            const dateRange = this.getDateRange(period);

            const [
                ticketTrends,
                resolutionTimes,
                customerSatisfaction,
                topIssues,
                staffPerformance
            ] = await Promise.all([
                this.getTicketTrends(dateRange),
                this.getResolutionTimes(),
                this.getCustomerSatisfaction(dateRange),
                this.getTopIssues(dateRange),
                this.getStaffPerformance(dateRange)
            ]);

            return {
                ticketTrends,
                resolutionTimes,
                customerSatisfaction,
                topIssues,
                staffPerformance
            };
        } catch (error: any) {
            throw new AppError(
                error.message || 'Failed to get analytics',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    }

    private async getTicketTrends(dateRange: { start: Date; end: Date }): Promise<any[]> {
        try {
            const result = await SupportTicket.aggregate([
                {
                    $match: {
                        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                        },
                        tickets: { $sum: 1 },
                        resolved: {
                            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
                        }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            return result.map(item => ({
                date: item._id,
                tickets: item.tickets,
                resolved: item.resolved
            }));
        } catch (error) {
            return [];
        }
    }

    private async getResolutionTimes(): Promise<any[]> {
        try {
            const result = await SupportTicket.aggregate([
                {
                    $match: {
                        status: 'resolved',
                        resolutionTime: { $exists: true }
                    }
                },
                {
                    $group: {
                        _id: '$category',
                        avgTime: { $avg: '$resolutionTime' },
                        count: { $sum: 1 }
                    }
                }
            ]);

            return result.map(item => ({
                category: item._id,
                avgTime: Math.round(item.avgTime * 10) / 10,
                target: 4.0 // Default target
            }));
        } catch (error) {
            return [];
        }
    }

    private async getCustomerSatisfaction(dateRange: { start: Date; end: Date }): Promise<any[]> {
        try {
            const result = await SupportTicket.aggregate([
                {
                    $match: {
                        'satisfaction.rating': { $exists: true },
                        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
                    }
                },
                {
                    $group: {
                        _id: null,
                        rating: { $avg: '$satisfaction.rating' },
                        responses: { $sum: 1 }
                    }
                }
            ]);

            const current = result[0] || { rating: 0, responses: 0 };

            return [
                { period: 'Current Period', rating: Math.round(current.rating * 10) / 10, responses: current.responses }
            ];
        } catch (error) {
            return [];
        }
    }

    private async getTopIssues(dateRange: { start: Date; end: Date }): Promise<any[]> {
        try {
            const result = await SupportTicket.aggregate([
                {
                    $match: {
                        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
                    }
                },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);

            return result.map(item => ({
                category: item._id,
                count: item.count,
                trend: 'stable' as const // Would need historical data for actual trend
            }));
        } catch (error) {
            return [];
        }
    }

    private async getStaffPerformance(dateRange: { start: Date; end: Date }): Promise<any[]> {
        try {
            const result = await SupportTicket.aggregate([
                {
                    $match: {
                        assignedTo: { $exists: true },
                        status: 'resolved',
                        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
                    }
                },
                {
                    $group: {
                        _id: '$assignedTo',
                        ticketsResolved: { $sum: 1 },
                        avgResolutionTime: { $avg: '$resolutionTime' },
                        avgSatisfaction: { $avg: '$satisfaction.rating' }
                    }
                }
            ]);

            return result.map(item => ({
                staffId: item._id,
                name: item._id, // Would need to join with staff collection for actual name
                ticketsResolved: item.ticketsResolved,
                avgResolutionTime: Math.round(item.avgResolutionTime * 10) / 10,
                satisfaction: Math.round((item.avgSatisfaction || 0) * 10) / 10
            }));
        } catch (error) {
            return [];
        }
    }

    private getDateRange(period: string): { start: Date; end: Date } {
        const end = new Date();
        const start = new Date();

        switch (period) {
            case '7d':
                start.setDate(end.getDate() - 7);
                break;
            case '30d':
                start.setDate(end.getDate() - 30);
                break;
            case '90d':
                start.setDate(end.getDate() - 90);
                break;
            case '1y':
                start.setFullYear(end.getFullYear() - 1);
                break;
            default:
                start.setDate(end.getDate() - 30);
        }

        return { start, end };
    }
}