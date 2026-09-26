const express = require('express');
const router = express.Router();
const privacyideaController = require('../controllers/privacyidea.controller');

router.post('/trigger-challenge', privacyideaController.triggerChallenge);
router.post('/validate-check', privacyideaController.validateCheck);
router.get('/status', privacyideaController.getStatus);

module.exports = router;
