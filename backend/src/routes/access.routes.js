const express = require('express');
const router = express.Router();
const accessController = require('../controllers/access.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/request', accessController.requestAccess);
router.get('/requests', accessController.listAccessRequests);
router.patch(
  '/requests/:id',
  requireRole('REVIEWER', 'SUPER_ADMIN'),
  accessController.reviewAccessRequest
);

module.exports = router;
