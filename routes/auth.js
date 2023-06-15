// routes/subgroup.js
const express = require('express');

const router = express.Router();
const signUpController = require('../controllers/authController');

router.post('/signup', signUpController.signup);
router.post('/login', signUpController.login);
router.post('/checkEmailExists', signUpController.checkEmailExists);

module.exports = router;
