import mongoose, { Schema } from 'mongoose';
import { IFeedPost, IComment, ICommunityEvent, IEventRegistration, IParentGroup, IRecognition } from './community.interface';

const FeedPostSchema = new Schema<IFeedPost>(
    {
        postId: { type: String, required: true, unique: true },
        postType: { type: String, enum: ['announcement', 'achievement', 'event', 'discussion', 'photo', 'video'], required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },

        author: {
            userId: { type: String, required: true },
            userName: { type: String, required: true },
            userType: { type: String, enum: ['admin', 'staff', 'parent', 'student'], required: true },
            avatar: String
        },

        media: [{
            type: { type: String, enum: ['image', 'video', 'document'] },
            url: String,
            thumbnail: String
        }],

        tags: [String],
        visibility: { type: String, enum: ['public', 'parents_only', 'staff_only', 'specific_group'], default: 'public' },
        targetGroups: [String],

        reactions: {
            like: { type: Number, default: 0 },
            love: { type: Number, default: 0 },
            celebrate: { type: Number, default: 0 },
            support: { type: Number, default: 0 }
        },

        comments: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        isPinned: { type: Boolean, default: false },
        isModerated: { type: Boolean, default: false },
        moderationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
        moderatedBy: String,
        moderatedAt: Date,

        businessUnitId: { type: String, required: true, index: true },
        locationId: { type: String, index: true },

        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'feed_posts' }
);

const CommentSchema = new Schema<IComment>(
    {
        commentId: { type: String, required: true, unique: true },
        postId: { type: String, required: true, index: true },
        parentCommentId: { type: String, index: true },
        content: { type: String, required: true },

        author: {
            userId: { type: String, required: true },
            userName: { type: String, required: true },
            userType: { type: String, enum: ['admin', 'staff', 'parent', 'student'], required: true },
            avatar: String
        },

        reactions: {
            like: { type: Number, default: 0 },
            love: { type: Number, default: 0 }
        },

        isModerated: { type: Boolean, default: false },
        moderationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },

        createdBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'comments' }
);

const CommunityEventSchema = new Schema<ICommunityEvent>(
    {
        eventId: { type: String, required: true, unique: true },
        eventType: { type: String, enum: ['competition', 'workshop', 'social', 'fundraiser', 'volunteer', 'other'], required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        startDate: { type: Date, required: true, index: true },
        endDate: { type: Date, required: true },

        location: {
            type: { type: String, enum: ['physical', 'virtual', 'hybrid'], required: true },
            address: String,
            virtualLink: String
        },

        organizer: {
            userId: { type: String, required: true },
            userName: { type: String, required: true },
            userType: String
        },

        capacity: {
            total: { type: Number, required: true },
            registered: { type: Number, default: 0 },
            waitlist: { type: Number, default: 0 }
        },

        registrationDeadline: { type: Date, required: true },
        requiresApproval: { type: Boolean, default: false },
        isPublic: { type: Boolean, default: true },
        tags: [String],

        media: {
            coverImage: String,
            gallery: [String]
        },

        volunteers: {
            required: { type: Number, default: 0 },
            registered: { type: Number, default: 0 }
        },

        businessUnitId: { type: String, required: true, index: true },
        locationId: { type: String, index: true },

        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'community_events' }
);

const EventRegistrationSchema = new Schema<IEventRegistration>(
    {
        registrationId: { type: String, required: true, unique: true },
        eventId: { type: String, required: true, index: true },

        participant: {
            userId: { type: String, required: true },
            userName: { type: String, required: true },
            userType: String,
            email: String,
            phone: String
        },

        registrationType: { type: String, enum: ['participant', 'volunteer', 'both'], required: true },
        status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled', 'attended'], default: 'pending' },
        volunteerRole: String,
        notes: String,
        registeredAt: { type: Date, default: Date.now },
        approvedBy: String,
        approvedAt: Date,

        createdBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'event_registrations' }
);

const ParentGroupSchema = new Schema<IParentGroup>(
    {
        groupId: { type: String, required: true, unique: true },
        groupName: { type: String, required: true },
        description: { type: String, required: true },
        groupType: { type: String, enum: ['program_based', 'age_based', 'location_based', 'interest_based', 'custom'], required: true },

        criteria: {
            programIds: [String],
            ageRange: {
                min: Number,
                max: Number
            },
            locationIds: [String],
            interests: [String]
        },

        privacy: { type: String, enum: ['public', 'private', 'secret'], default: 'public' },

        members: [{
            userId: { type: String, required: true },
            userName: { type: String, required: true },
            role: { type: String, enum: ['admin', 'moderator', 'member'], default: 'member' },
            joinedAt: { type: Date, default: Date.now }
        }],

        memberCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },

        businessUnitId: { type: String, required: true, index: true },

        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'parent_groups' }
);

const RecognitionSchema = new Schema<IRecognition>(
    {
        recognitionId: { type: String, required: true, unique: true },
        recognitionType: { type: String, enum: ['student_of_month', 'parent_volunteer', 'staff_excellence', 'achievement', 'milestone', 'custom'], required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },

        recipient: {
            userId: { type: String, required: true },
            userName: { type: String, required: true },
            userType: String,
            avatar: String
        },

        awardedBy: {
            userId: { type: String, required: true },
            userName: { type: String, required: true }
        },

        category: String,

        badge: {
            name: String,
            icon: String,
            color: String
        },

        isPublic: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },
        awardDate: { type: Date, default: Date.now },

        businessUnitId: { type: String, required: true, index: true },
        locationId: { type: String, index: true },

        createdBy: { type: String, required: true }
    },
    { timestamps: true, collection: 'recognitions' }
);

FeedPostSchema.index({ businessUnitId: 1, createdAt: -1 });
FeedPostSchema.index({ postType: 1, createdAt: -1 });
CommunityEventSchema.index({ startDate: 1, endDate: 1 });
ParentGroupSchema.index({ groupType: 1, isActive: 1 });

export const FeedPost = mongoose.model<IFeedPost>('FeedPost', FeedPostSchema);
export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
export const CommunityEvent = mongoose.model<ICommunityEvent>('CommunityEvent', CommunityEventSchema);
export const EventRegistration = mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema);
export const ParentGroup = mongoose.model<IParentGroup>('ParentGroup', ParentGroupSchema);
export const Recognition = mongoose.model<IRecognition>('Recognition', RecognitionSchema);
