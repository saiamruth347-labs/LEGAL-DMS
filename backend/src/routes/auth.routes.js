const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/citizen-login', authController.citizenLogin);
router.post('/officer-5fa-login', authController.officer5FaLogin);
router.post('/switch-demo', authController.switchDemoRole);
router.get('/me', authenticateToken, authController.getProfile);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
