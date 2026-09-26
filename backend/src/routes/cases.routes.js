const express = require('express');
const router = express.Router();
const caseController = require('../controllers/case.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', caseController.listCases);
router.get('/:id', caseController.getCaseById);
router.post('/', requireRole('INVESTIGATING_OFFICER', 'SUPER_ADMIN'), caseController.createCase);
router.patch('/:id/status', requireRole('INVESTIGATING_OFFICER', 'LEGAL_OFFICER', 'SUPER_ADMIN'), caseController.updateCaseStatus);

module.exports = router;
