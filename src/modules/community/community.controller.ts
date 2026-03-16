import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { CommunityService } from './community.service';

@injectable()
export class CommunityController {
    constructor(@inject(CommunityService) private communityService: CommunityService) { }

    // Post Management
    async createPost(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const post = await this.communityService.createPost(userId, req.body);
            res.status(201).json({ success: true, data: post });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getPost(req: Request, res: Response): Promise<void> {
        try {
            const { postId } = req.params;
            const post = await this.communityService.getPost(postId);
            if (!post) {
                res.status(404).json({ success: false, error: 'Post not found' });
                return;
            }
            res.status(200).json({ success: true, data: post });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getAllPosts(req: Request, res: Response): Promise<void> {
        try {
            const { limit, offset } = req.query;
            const posts = await this.communityService.getAllPosts(
                parseInt(limit as string) || 20,
                parseInt(offset as string) || 0
            );
            res.status(200).json({ success: true, data: posts });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async updatePost(req: Request, res: Response): Promise<void> {
        try {
            const { postId } = req.params;
            const post = await this.communityService.updatePost(postId, req.body);
            res.status(200).json({ success: true, data: post });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async deletePost(req: Request, res: Response): Promise<void> {
        try {
            const { postId } = req.params;
            const result = await this.communityService.deletePost(postId);
            res.status(200).json({ success: true, data: { deleted: result } });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Comment Management
    async createComment(req: Request, res: Response): Promise<void> {
        try {
            const { postId, userId } = req.params;
            const { content, parentCommentId } = req.body;
            const comment = await this.communityService.createComment(postId, userId, content, parentCommentId);
            res.status(201).json({ success: true, data: comment });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getComments(req: Request, res: Response): Promise<void> {
        try {
            const { postId } = req.params;
            const comments = await this.communityService.getComments(postId);
            res.status(200).json({ success: true, data: comments });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async deleteComment(req: Request, res: Response): Promise<void> {
        try {
            const { commentId } = req.params;
            const result = await this.communityService.deleteComment(commentId);
            res.status(200).json({ success: true, data: { deleted: result } });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Reaction Management
    async addReaction(req: Request, res: Response): Promise<void> {
        try {
            const { postId, userId } = req.params;
            const { type } = req.body;
            const reaction = await this.communityService.addReaction(postId, userId, type);
            res.status(201).json({ success: true, data: reaction });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async removeReaction(req: Request, res: Response): Promise<void> {
        try {
            const { reactionId } = req.params;
            const result = await this.communityService.removeReaction(reactionId);
            res.status(200).json({ success: true, data: { deleted: result } });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getReactions(req: Request, res: Response): Promise<void> {
        try {
            const { postId } = req.params;
            const reactions = await this.communityService.getReactions(postId);
            res.status(200).json({ success: true, data: reactions });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Event Management
    async createEvent(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const event = await this.communityService.createEvent(userId, req.body);
            res.status(201).json({ success: true, data: event });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getEvent(req: Request, res: Response): Promise<void> {
        try {
            const { eventId } = req.params;
            const event = await this.communityService.getEvent(eventId);
            if (!event) {
                res.status(404).json({ success: false, error: 'Event not found' });
                return;
            }
            res.status(200).json({ success: true, data: event });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getAllEvents(req: Request, res: Response): Promise<void> {
        try {
            const events = await this.communityService.getAllEvents();
            res.status(200).json({ success: true, data: events });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async registerForEvent(req: Request, res: Response): Promise<void> {
        try {
            const { eventId, userId } = req.params;
            const registration = await this.communityService.registerForEvent(eventId, userId);
            res.status(201).json({ success: true, data: registration });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getEventRegistrations(req: Request, res: Response): Promise<void> {
        try {
            const { eventId } = req.params;
            const registrations = await this.communityService.getEventRegistrations(eventId);
            res.status(200).json({ success: true, data: registrations });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Group Management
    async createGroup(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const group = await this.communityService.createGroup(userId, req.body);
            res.status(201).json({ success: true, data: group });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getGroup(req: Request, res: Response): Promise<void> {
        try {
            const { groupId } = req.params;
            const group = await this.communityService.getGroup(groupId);
            if (!group) {
                res.status(404).json({ success: false, error: 'Group not found' });
                return;
            }
            res.status(200).json({ success: true, data: group });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getAllGroups(req: Request, res: Response): Promise<void> {
        try {
            const groups = await this.communityService.getAllGroups();
            res.status(200).json({ success: true, data: groups });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async joinGroup(req: Request, res: Response): Promise<void> {
        try {
            const { groupId, userId } = req.params;
            const membership = await this.communityService.joinGroup(groupId, userId);
            res.status(201).json({ success: true, data: membership });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getGroupMembers(req: Request, res: Response): Promise<void> {
        try {
            const { groupId } = req.params;
            const members = await this.communityService.getGroupMembers(groupId);
            res.status(200).json({ success: true, data: members });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Recognition Management
    async createRecognition(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const recognition = await this.communityService.createRecognition(userId, req.body);
            res.status(201).json({ success: true, data: recognition });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getRecognitions(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const recognitions = await this.communityService.getRecognitions(userId);
            res.status(200).json({ success: true, data: recognitions });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Badge Management
    async createBadge(req: Request, res: Response): Promise<void> {
        try {
            const badge = await this.communityService.createBadge(req.body);
            res.status(201).json({ success: true, data: badge });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async awardBadge(req: Request, res: Response): Promise<void> {
        try {
            const { userId, badgeId } = req.params;
            const userBadge = await this.communityService.awardBadge(userId, badgeId);
            res.status(201).json({ success: true, data: userBadge });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getUserBadges(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const badges = await this.communityService.getUserBadges(userId);
            res.status(200).json({ success: true, data: badges });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Volunteer Management
    async registerVolunteer(req: Request, res: Response): Promise<void> {
        try {
            const { userId, eventId } = req.params;
            const { role } = req.body;
            const volunteer = await this.communityService.registerVolunteer(userId, eventId, role);
            res.status(201).json({ success: true, data: volunteer });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getEventVolunteers(req: Request, res: Response): Promise<void> {
        try {
            const { eventId } = req.params;
            const volunteers = await this.communityService.getEventVolunteers(eventId);
            res.status(200).json({ success: true, data: volunteers });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async completeVolunteerShift(req: Request, res: Response): Promise<void> {
        try {
            const { volunteerId } = req.params;
            const { hours } = req.body;
            const volunteer = await this.communityService.completeVolunteerShift(volunteerId, hours);
            res.status(200).json({ success: true, data: volunteer });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Notifications
    async getUserNotifications(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const notifications = await this.communityService.getUserNotifications(userId);
            res.status(200).json({ success: true, data: notifications });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async markNotificationAsRead(req: Request, res: Response): Promise<void> {
        try {
            const { notificationId } = req.params;
            const notification = await this.communityService.markNotificationAsRead(notificationId);
            res.status(200).json({ success: true, data: notification });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Statistics
    async getCommunityStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await this.communityService.getCommunityStats();
            res.status(200).json({ success: true, data: stats });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async getGroupStats(req: Request, res: Response): Promise<void> {
        try {
            const { groupId } = req.params;
            const stats = await this.communityService.getGroupStats(groupId);
            res.status(200).json({ success: true, data: stats });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    // Moderation
    async flagContent(req: Request, res: Response): Promise<void> {
        try {
            const { contentId, contentType, moderatorId } = req.params;
            const { reason } = req.body;
            const log = await this.communityService.flagContent(contentId, contentType, reason, moderatorId);
            res.status(201).json({ success: true, data: log });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }

    async removeContent(req: Request, res: Response): Promise<void> {
        try {
            const { contentId, contentType, moderatorId } = req.params;
            const { reason } = req.body;
            const log = await this.communityService.removeContent(contentId, contentType, reason, moderatorId);
            res.status(200).json({ success: true, data: log });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    }
}
