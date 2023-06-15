// routes/subgroup.js
const express = require('express');

const router = express.Router();
const subgroupController = require('../controllers/subgroupController');

router.get('/:subgroupId/posts', subgroupController.getPostsBySubgroupId);
router.get('/:subgroupId/events', subgroupController.getEventsBySubgroupId);
router.post('/add', subgroupController.createSubgroup);
router.delete(
  '/:subgroupId/delete-from-joined',
  subgroupController.deleteSubgroupFromJoined
);
router.delete(
  '/:subgroupId/delete-posts',
  subgroupController.deletePostsFromSubgroup
);
router.delete('/:subgroupId/delete', subgroupController.deleteSubgroup);
router.post('/posts/add', subgroupController.createPost);
router.delete('/posts/:postId/delete', subgroupController.deletePost);
router.post('/events/add', subgroupController.createEvent);
router.delete('/events/delete', subgroupController.deleteEvent);

module.exports = router;
