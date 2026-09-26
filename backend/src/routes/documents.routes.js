const express = require('express');
const router = express.Router();
const multer = require('multer');
const os = require('os');
const documentController = require('../controllers/document.controller');
const { authenticateToken, requireRole, checkDocumentAccess } = require('../middleware/auth');

// Multer upload config
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
});

router.use(authenticateToken);

// List all documents (with filter query)
router.get('/', documentController.listDocuments);

// Upload new document
router.post(
  '/upload',
  requireRole('INVESTIGATING_OFFICER', 'LEGAL_OFFICER', 'SUPER_ADMIN'),
  upload.single('file'),
  documentController.uploadDocument
);

// Get document details
router.get('/:id', checkDocumentAccess, documentController.getDocumentById);

// Download document binary
router.get('/:id/download', checkDocumentAccess, documentController.downloadDocument);

// Preview document content
router.get('/:id/preview', checkDocumentAccess, documentController.previewDocument);

// Upload new version
router.post(
  '/:id/version',
  checkDocumentAccess,
  requireRole('INVESTIGATING_OFFICER', 'LEGAL_OFFICER', 'SUPER_ADMIN'),
  upload.single('file'),
  documentController.uploadNewVersion
);

// Digitally sign document
router.post(
  '/:id/sign',
  checkDocumentAccess,
  requireRole('LEGAL_OFFICER', 'INVESTIGATING_OFFICER', 'SUPER_ADMIN'),
  documentController.signDocument
);

// Verify document integrity
router.post('/:id/verify', checkDocumentAccess, documentController.verifyDocumentIntegrity);

module.exports = router;
