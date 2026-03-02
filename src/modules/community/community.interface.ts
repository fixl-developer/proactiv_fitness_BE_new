import { Document } from 'mongoose';

// Feed Post Interface
export interface IFeedPost extends Document {
    postId: string;
    postType: 'announcement' | 'achievement' | 'event' | 'discussion' | 'photo' | 'video';
    title: string;
    content: string;
    author: {
        userId: string;
        userName: string;
        userType: 'admin' | 'staff' | 'parent' | 'student';
        avatar?: string;
    };
    media?: {
        type: 'image' | 'video' | 'document';
        url: string;
        thumbnail?: string;
    }[];
    tags: string[];
    visibility: 'public' | 'parents_only' | 'staff_only' | 'specific_group';
    targetGroups?: string[];
    reactions: {
        like: number;
        love: number;
        celebrate: number;
        support: number;
    };
    comments: number;
    shares: number;
    isPinned: boolean;
    isModerated: boolean;
    moderationStatus: 'pending' | 'approved' | 'rejected';
    moderatedBy?: string;
    moderatedAt?: Date;
    businessUnitId: string;
    locationId?: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Comment Interface
export interface IComment extends Document {
    commentId: string;
    postId: string;
    parentCommentId?: string;
    content: string;
    author: {
        userId: string;
        userName: string;
        userType: 'admin' | 'staff' | 'parent' | 'student';
        avatar?: string;
    };
    reactions: {
        like: number;
        love: number;
    };
    isModerated: boolean;
    moderationStatus: 'pending' | 'approved' | 'rejected';
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Event Interface
export interface ICommunityEvent extends Document {
    eventId: string;
    eventType: 'competition' | 'workshop' | 'social' | 'fundraiser' | 'volunteer' | 'other';
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: {
        type: 'physical' | 'virtual' | 'hybrid';
        address?: string;
        virtualLink?: string;
    };
    organizer: {
        userId: string;
        userName: string;
        userType: string;
    };
    capacity: {
        total: number;
        registered: number;
        waitlist: number;
    };
    registrationDeadline: Date;
    requiresApproval: boolean;
    isPublic: boolean;
    tags: string[];
    media?: {
        coverImage?: string;
        gallery?: string[];
    };
    volunteers: {
        required: number;
        registered: number;
    };
    businessUnitId: string;
    locationId?: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Event Registration Interface
export interface IEventRegistration extends Document {
    registrationId: string;
    eventId: string;
    participant: {
        userId: string;
        userName: string;
        userType: string;
        email: string;
        phone: string;
    };
    registrationType: 'participant' | 'volunteer' | 'both';
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'attended';
    volunteerRole?: string;
    notes?: string;
    registeredAt: Date;
    approvedBy?: string;
    approvedAt?: Date;
    createdBy: string;
    createdAt: Date;
}

// Parent Group Interface
export interface IParentGroup extends Document {
    groupId: string;
    groupName: string;
    description: string;
    groupType: 'program_based' | 'age_based' | 'location_based' | 'interest_based' | 'custom';
    criteria?: {
        programIds?: string[];
        ageRange?: { min: number; max: number };
        locationIds?: string[];
        interests?: string[];
    };
    privacy: 'public' | 'private' | 'secret';
    members: {
        userId: string;
        userName: string;
        role: 'admin' | 'moderator' | 'member';
        joinedAt: Date;
    }[];
    memberCount: number;
    isActive: boolean;
    businessUnitId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Recognition Interface
export interface IRecognition extends Document {
    recognitionId: string;
    recognitionType: 'student_of_month' | 'parent_volunteer' | 'staff_excellence' | 'achievement' | 'milestone' | 'custom';
    title: string;
    description: string;
    recipient: {
        userId: string;
        userName: string;
        userType: string;
        avatar?: string;
    };
    awardedBy: {
        userId: string;
        userName: string;
    };
    category?: string;
    badge?: {
        name: string;
        icon: string;
        color: string;
    };
    isPublic: boolean;
    isFeatured: boolean;
    awardDate: Date;
    businessUnitId: string;
    locationId?: string;
    createdBy: string;
    createdAt: Date;
}

// Request Interfaces
export interface ICreatePostRequest {
    postType: string;
    title: string;
    content: string;
    media?: any[];
    tags?: string[];
    visibility?: string;
    targetGroups?: string[];
}

export interface ICreateEventRequest {
    eventType: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: any;
    capacity: number;
    registrationDeadline: Date;
    requiresApproval?: boolean;
    isPublic?: boolean;
}

export interface IRegisterEventRequest {
    eventId: string;
    registrationType: string;
    volunteerRole?: string;
    notes?: string;
}

export interface ICreateGroupRequest {
    groupName: string;
    description: string;
    groupType: string;
    criteria?: any;
    privacy?: string;
}

export interface ICreateRecognitionRequest {
    recognitionType: string;
    title: string;
    description: string;
    recipientId: string;
    category?: string;
    isPublic?: boolean;
    isFeatured?: boolean;
}
