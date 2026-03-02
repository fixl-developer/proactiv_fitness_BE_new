import { Request, Response } from 'express';
import { CommunityService } from './community.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { sendSuccess } from '../../shared/utils/response.util';

const communityService = new CommunityService();

// Feed Management
export const createPost = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || 'system';
    const userName = (req as any).user?.userName || 'System User';
    const userType = (req as any).user?.role || 'admin';

    const post = await communityService.createPost(req.body, userId, userName, userType);
    sendSuccess(res, post, 'Post created successfully', 201);
});

export const getFeed = asyncHandler(async (req: Request, res: Response) => {
    const posts = await communityService.getFeed(req.query);
    sendSuccess(res, posts, 'Feed retrieved successfully');
});

export const addComment = asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = (req as any).user?.userId || 'system';
    const userName = (req as any).user?.userName || 'System User';
    const userType = (req as any).user?.role || 'admin';

    const comment = await communityService.addComment(postId, content, userId, userName, userType);
    sendSuccess(res, comment, 'Comment added successfully', 201);
});

export const reactToPost = asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { reactionType } = req.body;

    const post = await communityService.reactToPost(postId, reactionType);
    sendSuccess(res, post, 'Reaction added successfully');
});

// Event Management
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || 'system';
    const userName = (req as any).user?.userName || 'System User';

    const event = await communityService.createEvent(req.body, userId, userName);
    sendSuccess(res, event, 'Event created successfully', 201);
});

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
    const events = await communityService.getEvents(req.query);
    sendSuccess(res, events, 'Events retrieved successfully');
});

export const registerForEvent = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || 'system';
    const userName = (req as any).user?.userName || 'System User';
    const email = (req as any).user?.email || 'user@example.com';

    const registration = await communityService.registerForEvent(req.body, userId, userName, email);
    sendSuccess(res, registration, 'Registered for event successfully', 201);
});

// Parent Groups
export const createGroup = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || 'system';
    const userName = (req as any).user?.userName || 'System User';

    const group = await communityService.createGroup(req.body, userId, userName);
    sendSuccess(res, group, 'Group created successfully', 201);
});

export const getGroups = asyncHandler(async (req: Request, res: Response) => {
    const groups = await communityService.getGroups(req.query);
    sendSuccess(res, groups, 'Groups retrieved successfully');
});

export const joinGroup = asyncHandler(async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const userId = (req as any).user?.userId || 'system';
    const userName = (req as any).user?.userName || 'System User';

    const group = await communityService.joinGroup(groupId, userId, userName);
    sendSuccess(res, group, 'Joined group successfully');
});

// Recognition
export const createRecognition = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || 'system';
    const userName = (req as any).user?.userName || 'System User';

    const recognition = await communityService.createRecognition(req.body, userId, userName);
    sendSuccess(res, recognition, 'Recognition created successfully', 201);
});

export const getRecognitions = asyncHandler(async (req: Request, res: Response) => {
    const recognitions = await communityService.getRecognitions(req.query);
    sendSuccess(res, recognitions, 'Recognitions retrieved successfully');
});
