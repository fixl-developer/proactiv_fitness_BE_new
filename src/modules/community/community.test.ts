import { describe, it, expect, beforeEach } from '@jest/globals';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { Request, Response } from 'express';

describe('Community Module', () => {
    let service: CommunityService;
    let controller: CommunityController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        service = new CommunityService();
        controller = new CommunityController(service);
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe('Post Management', () => {
        it('should create a post', async () => {
            const post = await service.createPost('user1', {
                content: 'Great class today!',
                type: 'achievement',
                visibility: 'public'
            });

            expect(post.postId).toBeDefined();
            expect(post.content).toBe('Great class today!');
            expect(post.likes).toBe(0);
        });

        it('should get a post', async () => {
            const created = await service.createPost('user1', {
                content: 'Test post',
                type: 'discussion',
                visibility: 'public'
            });

            const retrieved = await service.getPost(created.postId);
            expect(retrieved).toBeDefined();
            expect(retrieved!.content).toBe('Test post');
        });

        it('should get all posts', async () => {
            await service.createPost('user1', { content: 'Post 1', type: 'discussion', visibility: 'public' });
            await service.createPost('user2', { content: 'Post 2', type: 'achievement', visibility: 'public' });

            const posts = await service.getAllPosts();
            expect(posts.length).toBe(2);
        });

        it('should update a post', async () => {
            const created = await service.createPost('user1', {
                content: 'Original content',
                type: 'discussion',
                visibility: 'public'
            });

            const updated = await service.updatePost(created.postId, {
                content: 'Updated content'
            });

            expect(updated.content).toBe('Updated content');
        });

        it('should delete a post', async () => {
            const created = await service.createPost('user1', {
                content: 'To delete',
                type: 'discussion',
                visibility: 'public'
            });

            const deleted = await service.deletePost(created.postId);
            expect(deleted).toBe(true);

            const retrieved = await service.getPost(created.postId);
            expect(retrieved).toBeUndefined();
        });
    });

    describe('Comment Management', () => {
        it('should create a comment', async () => {
            const post = await service.createPost('user1', {
                content: 'Main post',
                type: 'discussion',
                visibility: 'public'
            });

            const comment = await service.createComment(post.postId, 'user2', 'Great post!');
            expect(comment.commentId).toBeDefined();
            expect(comment.content).toBe('Great post!');
        });

        it('should get comments for a post', async () => {
            const post = await service.createPost('user1', {
                content: 'Main post',
                type: 'discussion',
                visibility: 'public'
            });

            await service.createComment(post.postId, 'user2', 'Comment 1');
            await service.createComment(post.postId, 'user3', 'Comment 2');

            const comments = await service.getComments(post.postId);
            expect(comments.length).toBe(2);
        });

        it('should delete a comment', async () => {
            const post = await service.createPost('user1', {
                content: 'Main post',
                type: 'discussion',
                visibility: 'public'
            });

            const comment = await service.createComment(post.postId, 'user2', 'Comment');
            const deleted = await service.deleteComment(comment.commentId);

            expect(deleted).toBe(true);
        });
    });

    describe('Reaction Management', () => {
        it('should add a reaction', async () => {
            const post = await service.createPost('user1', {
                content: 'Post',
                type: 'achievement',
                visibility: 'public'
            });

            const reaction = await service.addReaction(post.postId, 'user2', 'like');
            expect(reaction.reactionId).toBeDefined();
            expect(reaction.type).toBe('like');
        });

        it('should get reactions for a post', async () => {
            const post = await service.createPost('user1', {
                content: 'Post',
                type: 'achievement',
                visibility: 'public'
            });

            await service.addReaction(post.postId, 'user2', 'like');
            await service.addReaction(post.postId, 'user3', 'love');

            const reactions = await service.getReactions(post.postId);
            expect(reactions.length).toBe(2);
        });

        it('should remove a reaction', async () => {
            const post = await service.createPost('user1', {
                content: 'Post',
                type: 'achievement',
                visibility: 'public'
            });

            const reaction = await service.addReaction(post.postId, 'user2', 'like');
            const deleted = await service.removeReaction(reaction.reactionId);

            expect(deleted).toBe(true);
        });
    });

    describe('Event Management', () => {
        it('should create an event', async () => {
            const event = await service.createEvent('user1', {
                title: 'Yoga Workshop',
                description: 'Learn yoga basics',
                type: 'workshop',
                startDate: new Date(),
                endDate: new Date(),
                location: 'Studio A',
                capacity: 20
            });

            expect(event.eventId).toBeDefined();
            expect(event.title).toBe('Yoga Workshop');
            expect(event.registrations).toBe(0);
        });

        it('should register for an event', async () => {
            const event = await service.createEvent('user1', {
                title: 'Yoga Workshop',
                description: 'Learn yoga basics',
                type: 'workshop',
                startDate: new Date(),
                endDate: new Date(),
                location: 'Studio A',
                capacity: 20
            });

            const registration = await service.registerForEvent(event.eventId, 'user2');
            expect(registration.registrationId).toBeDefined();
            expect(registration.status).toBe('registered');
        });

        it('should not allow registration when event is full', async () => {
            const event = await service.createEvent('user1', {
                title: 'Small Event',
                description: 'Limited capacity',
                type: 'workshop',
                startDate: new Date(),
                endDate: new Date(),
                location: 'Studio A',
                capacity: 1
            });

            await service.registerForEvent(event.eventId, 'user2');

            await expect(service.registerForEvent(event.eventId, 'user3')).rejects.toThrow('Event is full');
        });

        it('should get event registrations', async () => {
            const event = await service.createEvent('user1', {
                title: 'Event',
                description: 'Desc',
                type: 'workshop',
                startDate: new Date(),
                endDate: new Date(),
                location: 'Location',
                capacity: 20
            });

            await service.registerForEvent(event.eventId, 'user2');
            await service.registerForEvent(event.eventId, 'user3');

            const registrations = await service.getEventRegistrations(event.eventId);
            expect(registrations.length).toBe(2);
        });
    });

    describe('Group Management', () => {
        it('should create a group', async () => {
            const group = await service.createGroup('user1', {
                name: 'Yoga Parents',
                description: 'Parents of yoga students',
                type: 'program-based'
            });

            expect(group.groupId).toBeDefined();
            expect(group.name).toBe('Yoga Parents');
            expect(group.members).toBe(1);
        });

        it('should join a group', async () => {
            const group = await service.createGroup('user1', {
                name: 'Yoga Parents',
                description: 'Parents of yoga students',
                type: 'program-based'
            });

            const membership = await service.joinGroup(group.groupId, 'user2');
            expect(membership.membershipId).toBeDefined();
            expect(membership.role).toBe('member');
        });

        it('should get group members', async () => {
            const group = await service.createGroup('user1', {
                name: 'Yoga Parents',
                description: 'Parents of yoga students',
                type: 'program-based'
            });

            await service.joinGroup(group.groupId, 'user2');
            await service.joinGroup(group.groupId, 'user3');

            const members = await service.getGroupMembers(group.groupId);
            expect(members.length).toBe(3);
        });
    });

    describe('Recognition Management', () => {
        it('should create a recognition', async () => {
            const recognition = await service.createRecognition('admin1', {
                recipientId: 'user1',
                type: 'student_of_month',
                title: 'Student of the Month',
                description: 'Excellent progress'
            });

            expect(recognition.recognitionId).toBeDefined();
            expect(recognition.type).toBe('student_of_month');
        });

        it('should get recognitions for a user', async () => {
            await service.createRecognition('admin1', {
                recipientId: 'user1',
                type: 'student_of_month',
                title: 'Student of the Month',
                description: 'Excellent progress'
            });

            const recognitions = await service.getRecognitions('user1');
            expect(recognitions.length).toBe(1);
        });
    });

    describe('Badge Management', () => {
        it('should create a badge', async () => {
            const badge = await service.createBadge({
                name: 'Yoga Master',
                description: 'Completed 50 yoga classes',
                icon: 'yoga-icon',
                criteria: '50 classes',
                rarity: 'rare'
            });

            expect(badge.badgeId).toBeDefined();
            expect(badge.name).toBe('Yoga Master');
        });

        it('should award a badge to a user', async () => {
            const badge = await service.createBadge({
                name: 'Yoga Master',
                description: 'Completed 50 yoga classes',
                icon: 'yoga-icon',
                criteria: '50 classes',
                rarity: 'rare'
            });

            const userBadge = await service.awardBadge('user1', badge.badgeId);
            expect(userBadge.userBadgeId).toBeDefined();
            expect(userBadge.userId).toBe('user1');
        });

        it('should get user badges', async () => {
            const badge1 = await service.createBadge({
                name: 'Badge 1',
                description: 'Desc',
                icon: 'icon',
                criteria: 'criteria',
                rarity: 'common'
            });

            const badge2 = await service.createBadge({
                name: 'Badge 2',
                description: 'Desc',
                icon: 'icon',
                criteria: 'criteria',
                rarity: 'uncommon'
            });

            await service.awardBadge('user1', badge1.badgeId);
            await service.awardBadge('user1', badge2.badgeId);

            const badges = await service.getUserBadges('user1');
            expect(badges.length).toBe(2);
        });
    });

    describe('Volunteer Management', () => {
        it('should register a volunteer', async () => {
            const event = await service.createEvent('user1', {
                title: 'Event',
                description: 'Desc',
                type: 'social',
                startDate: new Date(),
                endDate: new Date(),
                location: 'Location',
                capacity: 20
            });

            const volunteer = await service.registerVolunteer('user2', event.eventId, 'Setup');
            expect(volunteer.volunteerId).toBeDefined();
            expect(volunteer.role).toBe('Setup');
        });

        it('should complete volunteer shift', async () => {
            const event = await service.createEvent('user1', {
                title: 'Event',
                description: 'Desc',
                type: 'social',
                startDate: new Date(),
                endDate: new Date(),
                location: 'Location',
                capacity: 20
            });

            const volunteer = await service.registerVolunteer('user2', event.eventId, 'Setup');
            const completed = await service.completeVolunteerShift(volunteer.volunteerId, 3);

            expect(completed.status).toBe('completed');
            expect(completed.hoursContributed).toBe(3);
        });
    });

    describe('Notifications', () => {
        it('should create a notification', async () => {
            const notification = await service.createNotification('user1', 'post_like', 'post123', 'Someone liked your post');
            expect(notification.notificationId).toBeDefined();
            expect(notification.read).toBe(false);
        });

        it('should get user notifications', async () => {
            await service.createNotification('user1', 'post_like', 'post123', 'Someone liked your post');
            await service.createNotification('user1', 'comment_reply', 'comment456', 'Someone replied to your comment');

            const notifications = await service.getUserNotifications('user1');
            expect(notifications.length).toBe(2);
        });

        it('should mark notification as read', async () => {
            const notification = await service.createNotification('user1', 'post_like', 'post123', 'Someone liked your post');
            const marked = await service.markNotificationAsRead(notification.notificationId);

            expect(marked.read).toBe(true);
        });
    });

    describe('Statistics', () => {
        it('should get community stats', async () => {
            await service.createPost('user1', { content: 'Post', type: 'discussion', visibility: 'public' });
            const event = await service.createEvent('user1', {
                title: 'Event',
                description: 'Desc',
                type: 'social',
                startDate: new Date(),
                endDate: new Date(),
                location: 'Location',
                capacity: 20
            });

            const stats = await service.getCommunityStats();
            expect(stats.totalPosts).toBeGreaterThan(0);
            expect(stats.totalEvents).toBeGreaterThan(0);
        });

        it('should get group stats', async () => {
            const group = await service.createGroup('user1', {
                name: 'Group',
                description: 'Desc',
                type: 'program-based'
            });

            await service.joinGroup(group.groupId, 'user2');

            const stats = await service.getGroupStats(group.groupId);
            expect(stats.totalMembers).toBe(2);
        });
    });

    describe('Controller Integration', () => {
        it('should handle createPost endpoint', async () => {
            mockRequest.params = { userId: 'user1' };
            mockRequest.body = {
                content: 'Test post',
                type: 'discussion',
                visibility: 'public'
            };

            await controller.createPost(mockRequest as Request, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalled();
        });

        it('should handle getAllPosts endpoint', async () => {
            mockRequest.query = { limit: '10', offset: '0' };
            await controller.getAllPosts(mockRequest as Request, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalled();
        });
    });
});
