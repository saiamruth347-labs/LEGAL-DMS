const express = require('express');
const router = express.Router();
const securityController = require('../controllers/security.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/overview', securityController.getSecurityOverview);
router.get('/events', securityController.listSecurityEvents);
router.patch('/events/:id/resolve', requireRole('SUPER_ADMIN', 'AUDITOR'), securityController.resolveSecurityEvent);

module.exports = router;
