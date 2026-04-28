// Request DTOs
export interface CreatePostRequest {
    content: string;
    type: 'announcement' | 'achievement' | 'discussion' | 'event' | 'media';
    mediaUrls?: string[];
    visibility: 'public' | 'private' | 'group';
    groupId?: string;
}

export interface UpdatePostRequest {
    content?: string;
    visibility?: string;
}

export interface CreateCommentRequest {
    content: string;
    parentCommentId?: string;
}

export interface AddReactionRequest {
    type: 'like' | 'love' | 'celebrate' | 'support';
}

export interface CreateEventRequest {
    title: string;
    description: string;
    type: 'competition' | 'workshop' | 'social' | 'fundraiser';
    startDate: Date;
    endDate: Date;
    location: string;
    capacity: number;
}

export interface CreateGroupRequest {
    name: string;
    description: string;
    type: 'program-based' | 'age-based' | 'location-based' | 'interest-based';
}

export interface CreateRecognitionRequest {
    recipientId: string;
    type: 'student_of_month' | 'parent_volunteer' | 'staff_excellence' | 'achievement';
    title: string;
    description: string;
}

export interface CreateBadgeRequest {
    name: string;
    description: string;
    icon: string;
    criteria: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface RegisterVolunteerRequest {
    role: string;
}

export interface FlagContentRequest {
    reason: string;
}

// Response DTOs
export interface PostResponse {
    postId: string;
    userId: string;
    content: string;
    type: string;
    mediaUrls?: string[];
    likes: number;
    comments: number;
    shares: number;
    visibility: string;
    groupId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CommentResponse {
    commentId: string;
    postId: string;
    userId: string;
    content: string;
    parentCommentId?: string;
    likes: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReactionResponse {
    reactionId: string;
    postId: string;
    userId: string;
    type: string;
    createdAt: Date;
}

export interface EventResponse {
    eventId: string;
    title: string;
    description: string;
    type: string;
    startDate: Date;
    endDate: Date;
    location: string;
    capacity: number;
    registrations: number;
    status: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface EventRegistrationResponse {
    registrationId: string;
    eventId: string;
    userId: string;
    status: string;
    registeredAt: Date;
    attendedAt?: Date;
}

export interface GroupResponse {
    groupId: string;
    name: string;
    description: string;
    type: string;
    members: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface GroupMembershipResponse {
    membershipId: string;
    groupId: string;
    userId: string;
    role: string;
    joinedAt: Date;
}

export interface RecognitionResponse {
    recognitionId: string;
    recipientId: string;
    type: string;
    title: string;
    description: string;
    awardedBy: string;
    awardedAt: Date;
    createdAt: Date;
}

export interface BadgeResponse {
    badgeId: string;
    name: string;
    description: string;
    icon: string;
    criteria: string;
    rarity: string;
    createdAt: Date;
}

export interface UserBadgeResponse {
    userBadgeId: string;
    userId: string;
    badgeId: string;
    earnedAt: Date;
}

export interface VolunteerResponse {
    volunteerId: string;
    userId: string;
    eventId: string;
    role: string;
    status: string;
    hoursContributed: number;
    registeredAt: Date;
    completedAt?: Date;
}

export interface NotificationResponse {
    notificationId: string;
    userId: string;
    type: string;
    relatedId: string;
    message: string;
    read: boolean;
    createdAt: Date;
}

export interface CommunityStatsResponse {
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

export interface GroupStatsResponse {
    groupId: string;
    totalMembers: number;
    totalPosts: number;
    totalComments: number;
    totalLikes: number;
    createdAt: Date;
}

export interface ModerationLogResponse {
    logId: string;
    contentId: string;
    contentType: string;
    action: string;
    reason: string;
    moderatorId: string;
    createdAt: Date;
}

// Generic Response Wrapper
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
