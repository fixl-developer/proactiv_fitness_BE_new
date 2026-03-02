import { Router } from 'express';
import * as communityController from './community.controller';

const router = Router();

// Feed Routes
router.post('/posts', communityController.createPost);
router.get('/posts', communityController.getFeed);
router.post('/posts/:postId/comments', communityController.addComment);
router.post('/posts/:postId/react', communityController.reactToPost);

// Event Routes
router.post('/events', communityController.createEvent);
router.get('/events', communityController.getEvents);
router.post('/events/register', communityController.registerForEvent);

// Group Routes
router.post('/groups', communityController.createGroup);
router.get('/groups', communityController.getGroups);
router.post('/groups/:groupId/join', communityController.joinGroup);

// Recognition Routes
router.post('/recognitions', communityController.createRecognition);
router.get('/recognitions', communityController.getRecognitions);

export default router;
