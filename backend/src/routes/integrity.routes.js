const express = require('express');
const router = express.Router();
const multer = require('multer');
const os = require('os');
const integrityController = require('../controllers/integrity.controller');
const { authenticateToken } = require('../middleware/auth');

const upload = multer({ dest: os.tmpdir() });

router.use(authenticateToken);

router.get('/ledger', integrityController.getLedger);
router.post('/validate-chain', integrityController.validateChain);
router.post('/verify-hash', upload.single('file'), integrityController.verifyRawHash);

module.exports = router;
