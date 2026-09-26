const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', auditController.getAuditLogs);
router.get('/stats', auditController.getAuditStats);
router.get('/export', requireRole('AUDITOR', 'SUPER_ADMIN', 'LEGAL_OFFICER'), auditController.exportAuditCsv);

module.exports = router;
