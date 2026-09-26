const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/search', aiController.smartSearch);
router.post('/summarize', aiController.summarize);
router.post('/classify', aiController.classify);

module.exports = router;
