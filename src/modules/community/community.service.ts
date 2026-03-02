import { FeedPost, Comment, CommunityEvent, EventRegistration, ParentGroup, Recognition } from './community.model';
import { ICreatePostRequest, ICreateEventRequest, IRegisterEventRequest, ICreateGroupRequest, ICreateRecognitionRequest } from './community.interface';
import { AppError } from '../../shared/utils/app-error.util';
import { v4 as uuidv4 } from 'uuid';

export class CommunityService {
    // Feed Management
    async createPost(data: ICreatePostRequest, userId: string, userName: string, userType: string): Promise<any> {
        const postId = uuidv4();

        const post = new FeedPost({
            postId,
            postType: data.postType,
            title: data.title,
            content: data.content,
            author: {
                userId,
                userName,
                userType
            },
            media: data.media || [],
            tags: data.tags || [],
            visibility: data.visibility || 'public',
            targetGroups: data.targetGroups || [],
            businessUnitId: 'bu-001',
            createdBy: userId,
            updatedBy: userId
        });

        return await post.save();
    }

    async getFeed(filters: any): Promise<any[]> {
        const query: any = { moderationStatus: 'approved' };

        if (filters.postType) query.postType = filters.postType;
        if (filters.visibility) query.visibility = filters.visibility;
        if (filters.businessUnitId) query.businessUnitId = filters.businessUnitId;

        return await FeedPost.find(query)
            .sort({ isPinned: -1, createdAt: -1 })
            .limit(filters.limit || 20);
    }

    async addComment(postId: string, content: string, userId: string, userName: string, userType: string): Promise<any> {
        const commentId = uuidv4();

        const comment = new Comment({
            commentId,
            postId,
            content,
            author: {
                userId,
                userName,
                userType
            },
            createdBy: userId
        });

        await comment.save();

        // Update comment count
        await FeedPost.findOneAndUpdate(
            { postId },
            { $inc: { comments: 1 } }
        );

        return comment;
    }

    async reactToPost(postId: string, reactionType: 'like' | 'love' | 'celebrate' | 'support'): Promise<any> {
        const updateField = `reactions.${reactionType}`;

        return await FeedPost.findOneAndUpdate(
            { postId },
            { $inc: { [updateField]: 1 } },
            { new: true }
        );
    }

    // Event Management
    async createEvent(data: ICreateEventRequest, userId: string, userName: string): Promise<any> {
        const eventId = uuidv4();

        const event = new CommunityEvent({
            eventId,
            eventType: data.eventType,
            title: data.title,
            description: data.description,
            startDate: data.startDate,
            endDate: data.endDate,
            location: data.location,
            organizer: {
                userId,
                userName,
                userType: 'admin'
            },
            capacity: {
                total: data.capacity,
                registered: 0,
                waitlist: 0
            },
            registrationDeadline: data.registrationDeadline,
            requiresApproval: data.requiresApproval || false,
            isPublic: data.isPublic !== false,
            businessUnitId: 'bu-001',
            createdBy: userId,
            updatedBy: userId
        });

        return await event.save();
    }

    async getEvents(filters: any): Promise<any[]> {
        const query: any = {};

        if (filters.eventType) query.eventType = filters.eventType;
        if (filters.startDate) query.startDate = { $gte: new Date(filters.startDate) };
        if (filters.isPublic !== undefined) query.isPublic = filters.isPublic;

        return await CommunityEvent.find(query)
            .sort({ startDate: 1 })
            .limit(filters.limit || 50);
    }

    async registerForEvent(data: IRegisterEventRequest, userId: string, userName: string, email: string): Promise<any> {
        const registrationId = uuidv4();

        // Check capacity
        const event = await CommunityEvent.findOne({ eventId: data.eventId });
        if (!event) {
            throw new AppError('Event not found', 404);
        }

        if (event.capacity.registered >= event.capacity.total) {
            throw new AppError('Event is full', 400);
        }

        const registration = new EventRegistration({
            registrationId,
            eventId: data.eventId,
            participant: {
                userId,
                userName,
                userType: 'parent',
                email,
                phone: ''
            },
            registrationType: data.registrationType,
            volunteerRole: data.volunteerRole,
            notes: data.notes,
            status: event.requiresApproval ? 'pending' : 'approved',
            createdBy: userId
        });

        await registration.save();

        // Update event capacity
        if (!event.requiresApproval) {
            await CommunityEvent.findOneAndUpdate(
                { eventId: data.eventId },
                { $inc: { 'capacity.registered': 1 } }
            );
        }

        return registration;
    }

    // Parent Groups
    async createGroup(data: ICreateGroupRequest, userId: string, userName: string): Promise<any> {
        const groupId = uuidv4();

        const group = new ParentGroup({
            groupId,
            groupName: data.groupName,
            description: data.description,
            groupType: data.groupType,
            criteria: data.criteria,
            privacy: data.privacy || 'public',
            members: [{
                userId,
                userName,
                role: 'admin',
                joinedAt: new Date()
            }],
            memberCount: 1,
            businessUnitId: 'bu-001',
            createdBy: userId,
            updatedBy: userId
        });

        return await group.save();
    }

    async getGroups(filters: any): Promise<any[]> {
        const query: any = { isActive: true };

        if (filters.groupType) query.groupType = filters.groupType;
        if (filters.privacy) query.privacy = filters.privacy;

        return await ParentGroup.find(query).sort({ memberCount: -1 });
    }

    async joinGroup(groupId: string, userId: string, userName: string): Promise<any> {
        const group = await ParentGroup.findOne({ groupId });

        if (!group) {
            throw new AppError('Group not found', 404);
        }

        // Check if already a member
        const isMember = group.members.some(m => m.userId === userId);
        if (isMember) {
            throw new AppError('Already a member', 400);
        }

        return await ParentGroup.findOneAndUpdate(
            { groupId },
            {
                $push: {
                    members: {
                        userId,
                        userName,
                        role: 'member',
                        joinedAt: new Date()
                    }
                },
                $inc: { memberCount: 1 }
            },
            { new: true }
        );
    }

    // Recognition
    async createRecognition(data: ICreateRecognitionRequest, userId: string, userName: string): Promise<any> {
        const recognitionId = uuidv4();

        const recognition = new Recognition({
            recognitionId,
            recognitionType: data.recognitionType,
            title: data.title,
            description: data.description,
            recipient: {
                userId: data.recipientId,
                userName: 'Recipient Name',
                userType: 'student'
            },
            awardedBy: {
                userId,
                userName
            },
            category: data.category,
            isPublic: data.isPublic !== false,
            isFeatured: data.isFeatured || false,
            businessUnitId: 'bu-001',
            createdBy: userId
        });

        return await recognition.save();
    }

    async getRecognitions(filters: any): Promise<any[]> {
        const query: any = { isPublic: true };

        if (filters.recognitionType) query.recognitionType = filters.recognitionType;
        if (filters.recipientId) query['recipient.userId'] = filters.recipientId;
        if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;

        return await Recognition.find(query)
            .sort({ awardDate: -1 })
            .limit(filters.limit || 20);
    }
}
