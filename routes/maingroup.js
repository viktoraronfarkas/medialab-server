// routes/maingroup.js
const express = require('express');

const router = express.Router();
const maingroupController = require('../controllers/maingroupController');

router.get('/', maingroupController.getMainGroupsWithSubgroups);
router.post('/:group_id/add-svg', maingroupController.addImageToMainGroup);

module.exports = router;
