const express = require('express');
const router = express.Router();
const passkeyController = require('../controllers/passkey.controller');

router.post('/register/options', passkeyController.getRegistrationOptions);
router.post('/register/verify', passkeyController.verifyRegistration);
router.post('/authenticate/options', passkeyController.getAuthenticationOptions);
router.post('/authenticate/verify', passkeyController.verifyAuthentication);

module.exports = router;
