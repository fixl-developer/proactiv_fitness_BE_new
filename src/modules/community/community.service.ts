import { injectable } from 'tsyringe';
import {
    IPost,
    IComment,
    IReaction,
    ICommunityEvent,
    IEventRegistration,
    IParentGroup,
    IGroupMembership,
    IRecognition,
    IBadge,
    IUserBadge,
    IFeed,
    IModerationLog,
    ICommunityStats,
    IVolunteer,
    ICommunityNotification
} from './community.model';

@injectable()
export class CommunityService {
    private posts: Map<string, IPost> = new Map();
    private comments: Map<string, IComment> = new Map();
    private reactions: Map<string, IReaction> = new Map();
    private events: Map<string, ICommunityEvent> = new Map();
    private eventRegistrations: Map<string, IEventRegistration> = new Map();
    private groups: Map<string, IParentGroup> = new Map();
    private groupMemberships: Map<string, IGroupMembership> = new Map();
    private recognitions: Map<string, IRecognition> = new Map();
    private badges: Map<string, IBadge> = new Map();
    private userBadges: Map<string, IUserBadge> = new Map();
    private feeds: Map<string, IFeed> = new Map();
    private moderationLogs: Map<string, IModerationLog> = new Map();
    private volunteers: Map<string, IVolunteer> = new Map();
    private notifications: Map<string, ICommunityNotification> = new Map();

    // Post Management
    async createPost(userId: string, data: Partial<IPost>): Promise<IPost> {
        const post: IPost = {
            postId: `POST-${Date.now()}`,
            userId,
            content: data.content || '',
            type: data.type || 'discussion',
            mediaUrls: data.mediaUrls || [],
            likes: 0,
            comments: 0,
            shares: 0,
            visibility: data.visibility || 'public',
            groupId: data.groupId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.posts.set(post.postId, post);

        // Create feed entry
        await this.createFeedEntry(userId, 'announcement', post.content, { postId: post.postId });

        return post;
    }

    async getPost(postId: string): Promise<IPost | undefined> {
        return this.posts.get(postId);
    }

    async getAllPosts(limit: number = 20, offset: number = 0): Promise<IPost[]> {
        const allPosts = Array.from(this.posts.values())
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return allPosts.slice(offset, offset + limit);
    }

    async updatePost(postId: string, data: Partial<IPost>): Promise<IPost> {
        const post = this.posts.get(postId);
        if (!post) throw new Error('Post not found');

        const updated = { ...post, ...data, updatedAt: new Date() };
        this.posts.set(postId, updated);
        return updated;
    }

    async deletePost(postId: string): Promise<boolean> {
        return this.posts.delete(postId);
    }

    // Comment Management
    async createComment(postId: string, userId: string, content: string, parentCommentId?: string): Promise<IComment> {
        const comment: IComment = {
            commentId: `COMMENT-${Date.now()}`,
            postId,
            userId,
            content,
            parentCommentId,
            likes: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.comments.set(comment.commentId, comment);

        // Update post comment count
        const post = this.posts.get(postId);
        if (post) {
            post.comments++;
        }

        return comment;
    }

    async getComments(postId: string): Promise<IComment[]> {
        return Array.from(this.comments.values())
            .filter(c => c.postId === postId)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    async deleteComment(commentId: string): Promise<boolean> {
        const comment = this.comments.get(commentId);
        if (comment) {
            const post = this.posts.get(comment.postId);
            if (post && post.comments > 0) {
                post.comments--;
            }
        }
        return this.comments.delete(commentId);
    }

    // Reaction Management
    async addReaction(postId: string, userId: string, type: string): Promise<IReaction> {
        const reaction: IReaction = {
            reactionId: `REACTION-${Date.now()}`,
            postId,
            userId,
            type: type as any,
            createdAt: new Date()
        };

        this.reactions.set(reaction.reactionId, reaction);

        // Update post likes
        const post = this.posts.get(postId);
        if (post) {
            post.likes++;
        }

        return reaction;
    }

    async removeReaction(reactionId: string): Promise<boolean> {
        const reaction = this.reactions.get(reactionId);
        if (reaction) {
            const post = this.posts.get(reaction.postId);
            if (post && post.likes > 0) {
                post.likes--;
            }
        }
        return this.reactions.delete(reactionId);
    }

    async getReactions(postId: string): Promise<IReaction[]> {
        return Array.from(this.reactions.values()).filter(r => r.postId === postId);
    }

    // Event Management
    async createEvent(userId: string, data: Partial<ICommunityEvent>): Promise<ICommunityEvent> {
        const event: ICommunityEvent = {
            eventId: `EVENT-${Date.now()}`,
            title: data.title || '',
            description: data.description || '',
            type: data.type || 'social',
            startDate: data.startDate || new Date(),
            endDate: data.endDate || new Date(),
            location: data.location || '',
            capacity: data.capacity || 0,
            registrations: 0,
            status: 'upcoming',
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.events.set(event.eventId, event);
        return event;
    }

    async getEvent(eventId: string): Promise<ICommunityEvent | undefined> {
        return this.events.get(eventId);
    }

    async getAllEvents(): Promise<ICommunityEvent[]> {
        return Array.from(this.events.values())
            .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    }

    async registerForEvent(eventId: string, userId: string): Promise<IEventRegistration> {
        const event = this.events.get(eventId);
        if (!event) throw new Error('Event not found');

        if (event.registrations >= event.capacity) {
            throw new Error('Event is full');
        }

        const registration: IEventRegistration = {
            registrationId: `REG-${Date.now()}`,
            eventId,
            userId,
            status: 'registered',
            registeredAt: new Date()
        };

        this.eventRegistrations.set(registration.registrationId, registration);
        event.registrations++;

        return registration;
    }

    async getEventRegistrations(eventId: string): Promise<IEventRegistration[]> {
        return Array.from(this.eventRegistrations.values()).filter(r => r.eventId === eventId);
    }

    // Group Management
    async createGroup(userId: string, data: Partial<IParentGroup>): Promise<IParentGroup> {
        const group: IParentGroup = {
            groupId: `GROUP-${Date.now()}`,
            name: data.name || '',
            description: data.description || '',
            type: data.type || 'interest-based',
            members: 1,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.groups.set(group.groupId, group);

        // Add creator as admin
        const membership: IGroupMembership = {
            membershipId: `MEMBER-${Date.now()}`,
            groupId: group.groupId,
            userId,
            role: 'admin',
            joinedAt: new Date()
        };
        this.groupMemberships.set(membership.membershipId, membership);

        return group;
    }

    async getGroup(groupId: string): Promise<IParentGroup | undefined> {
        return this.groups.get(groupId);
    }

    async getAllGroups(): Promise<IParentGroup[]> {
        return Array.from(this.groups.values());
    }

    async joinGroup(groupId: string, userId: string): Promise<IGroupMembership> {
        const group = this.groups.get(groupId);
        if (!group) throw new Error('Group not found');

        const membership: IGroupMembership = {
            membershipId: `MEMBER-${Date.now()}`,
            groupId,
            userId,
            role: 'member',
            joinedAt: new Date()
        };

        this.groupMemberships.set(membership.membershipId, membership);
        group.members++;

        return membership;
    }

    async getGroupMembers(groupId: string): Promise<IGroupMembership[]> {
        return Array.from(this.groupMemberships.values()).filter(m => m.groupId === groupId);
    }

    // Recognition Management
    async createRecognition(userId: string, data: Partial<IRecognition>): Promise<IRecognition> {
        const recognition: IRecognition = {
            recognitionId: `REC-${Date.now()}`,
            recipientId: data.recipientId || '',
            type: data.type || 'achievement',
            title: data.title || '',
            description: data.description || '',
            awardedBy: userId,
            awardedAt: new Date(),
            createdAt: new Date()
        };

        this.recognitions.set(recognition.recognitionId, recognition);
        return recognition;
    }

    async getRecognitions(userId: string): Promise<IRecognition[]> {
        return Array.from(this.recognitions.values()).filter(r => r.recipientId === userId);
    }

    // Badge Management
    async createBadge(data: Partial<IBadge>): Promise<IBadge> {
        const badge: IBadge = {
            badgeId: `BADGE-${Date.now()}`,
            name: data.name || '',
            description: data.description || '',
            icon: data.icon || '',
            criteria: data.criteria || '',
            rarity: data.rarity || 'common',
            createdAt: new Date()
        };

        this.badges.set(badge.badgeId, badge);
        return badge;
    }

    async awardBadge(userId: string, badgeId: string): Promise<IUserBadge> {
        const badge = this.badges.get(badgeId);
        if (!badge) throw new Error('Badge not found');

        const userBadge: IUserBadge = {
            userBadgeId: `UBADGE-${Date.now()}`,
            userId,
            badgeId,
            earnedAt: new Date()
        };

        this.userBadges.set(userBadge.userBadgeId, userBadge);
        return userBadge;
    }

    async getUserBadges(userId: string): Promise<IUserBadge[]> {
        return Array.from(this.userBadges.values()).filter(b => b.userId === userId);
    }

    // Feed Management
    async createFeedEntry(userId: string, type: string, content: string, metadata?: Record<string, any>): Promise<IFeed> {
        const feed: IFeed = {
            feedId: `FEED-${Date.now()}`,
            userId,
            feedType: type as any,
            content,
            metadata: metadata || {},
            createdAt: new Date()
        };

        this.feeds.set(feed.feedId, feed);
        return feed;
    }

    async getUserFeed(userId: string, limit: number = 20): Promise<IFeed[]> {
        return Array.from(this.feeds.values())
            .filter(f => f.userId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, limit);
    }

    // Moderation
    async flagContent(contentId: string, contentType: string, reason: string, moderatorId: string): Promise<IModerationLog> {
        const log: IModerationLog = {
            logId: `MOD-${Date.now()}`,
            contentId,
            contentType: contentType as any,
            action: 'flagged',
            reason,
            moderatorId,
            createdAt: new Date()
        };

        this.moderationLogs.set(log.logId, log);
        return log;
    }

    async removeContent(contentId: string, contentType: string, reason: string, moderatorId: string): Promise<IModerationLog> {
        const log: IModerationLog = {
            logId: `MOD-${Date.now()}`,
            contentId,
            contentType: contentType as any,
            action: 'removed',
            reason,
            moderatorId,
            createdAt: new Date()
        };

        this.moderationLogs.set(log.logId, log);

        // Remove content
        if (contentType === 'post') {
            this.posts.delete(contentId);
        } else if (contentType === 'comment') {
            this.comments.delete(contentId);
        }

        return log;
    }

    // Volunteer Management
    async registerVolunteer(userId: string, eventId: string, role: string): Promise<IVolunteer> {
        const volunteer: IVolunteer = {
            volunteerId: `VOL-${Date.now()}`,
            userId,
            eventId,
            role,
            status: 'registered',
            hoursContributed: 0,
            registeredAt: new Date()
        };

        this.volunteers.set(volunteer.volunteerId, volunteer);
        return volunteer;
    }

    async getEventVolunteers(eventId: string): Promise<IVolunteer[]> {
        return Array.from(this.volunteers.values()).filter(v => v.eventId === eventId);
    }

    async completeVolunteerShift(volunteerId: string, hours: number): Promise<IVolunteer> {
        const volunteer = this.volunteers.get(volunteerId);
        if (!volunteer) throw new Error('Volunteer not found');

        volunteer.status = 'completed';
        volunteer.hoursContributed = hours;
        volunteer.completedAt = new Date();

        return volunteer;
    }

    // Notifications
    async createNotification(userId: string, type: string, relatedId: string, message: string): Promise<ICommunityNotification> {
        const notification: ICommunityNotification = {
            notificationId: `NOTIF-${Date.now()}`,
            userId,
            type: type as any,
            relatedId,
            message,
            read: false,
            createdAt: new Date()
        };

        this.notifications.set(notification.notificationId, notification);
        return notification;
    }

    async getUserNotifications(userId: string): Promise<ICommunityNotification[]> {
        return Array.from(this.notifications.values())
            .filter(n => n.userId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async markNotificationAsRead(notificationId: string): Promise<ICommunityNotification> {
        const notification = this.notifications.get(notificationId);
        if (!notification) throw new Error('Notification not found');

        notification.read = true;
        return notification;
    }

    // Statistics
    async getCommunityStats(): Promise<ICommunityStats> {
        const stats: ICommunityStats = {
            statsId: `STATS-${Date.now()}`,
            totalPosts: this.posts.size,
            totalComments: this.comments.size,
            totalEvents: this.events.size,
            totalMembers: new Set(Array.from(this.groupMemberships.values()).map(m => m.userId)).size,
            activeMembers: Math.floor(this.groupMemberships.size * 0.7),
            engagementRate: 0.65,
            period: 'monthly',
            createdAt: new Date()
        };

        return stats;
    }

    async getGroupStats(groupId: string): Promise<any> {
        const group = this.groups.get(groupId);
        if (!group) throw new Error('Group not found');

        const members = await this.getGroupMembers(groupId);
        const posts = Array.from(this.posts.values()).filter(p => p.groupId === groupId);

        return {
            groupId,
            totalMembers: members.length,
            totalPosts: posts.length,
            totalComments: posts.reduce((sum, p) => sum + p.comments, 0),
            totalLikes: posts.reduce((sum, p) => sum + p.likes, 0),
            createdAt: new Date()
        };
    }
}
