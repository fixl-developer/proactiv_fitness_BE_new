// Community Models

export interface IPost {
    postId: string;
    userId: string;
    content: string;
    type: 'announcement' | 'achievement' | 'discussion' | 'event' | 'media';
    mediaUrls?: string[];
    likes: number;
    comments: number;
    shares: number;
    visibility: 'public' | 'private' | 'group';
    groupId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IComment {
    commentId: string;
    postId: string;
    userId: string;
    content: string;
    parentCommentId?: string;
    likes: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IReaction {
    reactionId: string;
    postId: string;
    userId: string;
    type: 'like' | 'love' | 'celebrate' | 'support';
    createdAt: Date;
}

export interface ICommunityEvent {
    eventId: string;
    title: string;
    description: string;
    type: 'competition' | 'workshop' | 'social' | 'fundraiser';
    startDate: Date;
    endDate: Date;
    location: string;
    capacity: number;
    registrations: number;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IEventRegistration {
    registrationId: string;
    eventId: string;
    userId: string;
    status: 'registered' | 'attended' | 'cancelled' | 'pending_approval';
    registeredAt: Date;
    attendedAt?: Date;
}

export interface IParentGroup {
    groupId: string;
    name: string;
    description: string;
    type: 'program-based' | 'age-based' | 'location-based' | 'interest-based';
    members: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IGroupMembership {
    membershipId: string;
    groupId: string;
    userId: string;
    role: 'admin' | 'moderator' | 'member';
    joinedAt: Date;
}

export interface IRecognition {
    recognitionId: string;
    recipientId: string;
    type: 'student_of_month' | 'parent_volunteer' | 'staff_excellence' | 'achievement';
    title: string;
    description: string;
    awardedBy: string;
    awardedAt: Date;
    createdAt: Date;
}

export interface IBadge {
    badgeId: string;
    name: string;
    description: string;
    icon: string;
    criteria: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    createdAt: Date;
}

export interface IUserBadge {
    userBadgeId: string;
    userId: string;
    badgeId: string;
    earnedAt: Date;
}

export interface IFeed {
    feedId: string;
    userId: string;
    feedType: 'announcement' | 'achievement' | 'event' | 'discussion' | 'media';
    content: string;
    metadata: Record<string, any>;
    createdAt: Date;
}

export interface IModerationLog {
    logId: string;
    contentId: string;
    contentType: 'post' | 'comment' | 'event';
    action: 'flagged' | 'removed' | 'approved' | 'warned';
    reason: string;
    moderatorId: string;
    createdAt: Date;
}

export interface ICommunityStats {
    statsId: string;
    totalPosts: number;
    totalComments: number;
    totalEvents: number;
    totalMembers: number;
    activeMembers: number;
    engagementRate: number;
    period: string;
    createdAt: Date;
}

export interface IVolunteer {
    volunteerId: string;
    userId: string;
    eventId: string;
    role: string;
    status: 'registered' | 'confirmed' | 'completed' | 'cancelled';
    hoursContributed: number;
    registeredAt: Date;
    completedAt?: Date;
}

export interface ICommunityNotification {
    notificationId: string;
    userId: string;
    type: 'post_like' | 'comment_reply' | 'event_update' | 'group_invite' | 'recognition';
    relatedId: string;
    message: string;
    read: boolean;
    createdAt: Date;
}
