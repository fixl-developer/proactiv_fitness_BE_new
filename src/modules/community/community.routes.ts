import { Router } from 'express';
import { container } from 'tsyringe';
import { CommunityController } from './community.controller';

const router = Router();
const controller = container.resolve(CommunityController);

// Post Management
router.post('/users/:userId/posts', (req, res) => controller.createPost(req, res));
router.get('/posts/:postId', (req, res) => controller.getPost(req, res));
router.get('/posts', (req, res) => controller.getAllPosts(req, res));
router.put('/posts/:postId', (req, res) => controller.updatePost(req, res));
router.delete('/posts/:postId', (req, res) => controller.deletePost(req, res));

// Comment Management
router.post('/posts/:postId/users/:userId/comments', (req, res) => controller.createComment(req, res));
router.get('/posts/:postId/comments', (req, res) => controller.getComments(req, res));
router.delete('/comments/:commentId', (req, res) => controller.deleteComment(req, res));

// Reaction Management
router.post('/posts/:postId/users/:userId/reactions', (req, res) => controller.addReaction(req, res));
router.delete('/reactions/:reactionId', (req, res) => controller.removeReaction(req, res));
router.get('/posts/:postId/reactions', (req, res) => controller.getReactions(req, res));

// Event Management
router.post('/users/:userId/events', (req, res) => controller.createEvent(req, res));
router.get('/events/:eventId', (req, res) => controller.getEvent(req, res));
router.get('/events', (req, res) => controller.getAllEvents(req, res));
router.post('/events/:eventId/users/:userId/register', (req, res) => controller.registerForEvent(req, res));
router.get('/events/:eventId/registrations', (req, res) => controller.getEventRegistrations(req, res));

// Group Management
router.post('/users/:userId/groups', (req, res) => controller.createGroup(req, res));
router.get('/groups/:groupId', (req, res) => controller.getGroup(req, res));
router.get('/groups', (req, res) => controller.getAllGroups(req, res));
router.post('/groups/:groupId/users/:userId/join', (req, res) => controller.joinGroup(req, res));
router.get('/groups/:groupId/members', (req, res) => controller.getGroupMembers(req, res));

// Recognition Management
router.post('/users/:userId/recognitions', (req, res) => controller.createRecognition(req, res));
router.get('/users/:userId/recognitions', (req, res) => controller.getRecognitions(req, res));

// Badge Management
router.post('/badges', (req, res) => controller.createBadge(req, res));
router.post('/users/:userId/badges/:badgeId/award', (req, res) => controller.awardBadge(req, res));
router.get('/users/:userId/badges', (req, res) => controller.getUserBadges(req, res));

// Volunteer Management
router.post('/events/:eventId/users/:userId/volunteer', (req, res) => controller.registerVolunteer(req, res));
router.get('/events/:eventId/volunteers', (req, res) => controller.getEventVolunteers(req, res));
router.put('/volunteers/:volunteerId/complete', (req, res) => controller.completeVolunteerShift(req, res));

// Notifications
router.get('/users/:userId/notifications', (req, res) => controller.getUserNotifications(req, res));
router.put('/notifications/:notificationId/read', (req, res) => controller.markNotificationAsRead(req, res));

// Statistics
router.get('/stats', (req, res) => controller.getCommunityStats(req, res));
router.get('/groups/:groupId/stats', (req, res) => controller.getGroupStats(req, res));

// Moderation
router.post('/content/:contentId/:contentType/flag/:moderatorId', (req, res) => controller.flagContent(req, res));
router.delete('/content/:contentId/:contentType/remove/:moderatorId', (req, res) => controller.removeContent(req, res));

export default router;
