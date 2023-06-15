// routes/user.js
const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');

router.get('/:userId/subscribed-groups', userController.getSubscribedGroups);
// router.get('/:userId/subscribed-maingroups', userController.getSubscribedMainGroups);
// router.get('/:userId/subscribed-subgroups', userController.getSubscribedSubGroups);
router.post('/subscribe/maingroup', userController.subscribeToMainGroups);
router.post('/subscribe/subgroup', userController.subscribeToSubgroup);
router.post(
  '/:userId/unsubscribe/maingroup',
  userController.unsubscribeFromMainGroup
);
router.post(
  '/:userId/unsubscribe/subgroup',
  userController.unsubscribeFromSubGroup
);
// router.post('/signup', userController.signup);
router.get('/:userId', userController.getUserById); // New route
router.put('/:userId', userController.updateUserById); // New route
router.get('/:userId/feed', userController.fetchFeed);

module.exports = router;
