const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRole('SUPER_ADMIN'));

router.get('/users', adminController.listUsers);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.post('/users/:id/reset-lockout', adminController.resetLockout);
router.get('/departments', adminController.listDepartments);
router.get('/settings', adminController.getSystemSettings);

module.exports = router;
