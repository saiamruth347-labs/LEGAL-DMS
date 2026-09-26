const fs = require('fs');
const path = require('path');
const prisma = require('../config/db');
const storageService = require('../services/storage.service');
const blockchainService = require('../services/blockchain.service');
const aiService = require('../services/ai.service');
const { createAuditLog } = require('../middleware/audit');
const { generateDigitalSignature } = require('../utils/crypto');

/**
 * List documents with filters
 */
async function listDocuments(req, res) {
  try {
    const { caseId, category, classification, search, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (caseId) where.caseId = caseId;
    if (category) where.category = category;
    if (classification) where.classification = classification;
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { title: { contains: search } },
        { fileName: { contains: search } },
        { currentHash: { contains: search } },
      ];
    }

    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          case: { select: { id: true, title: true, status: true } },
          uploadedBy: { select: { id: true, fullName: true, badgeNumber: true, role: true } },
          digitalSignatures: { select: { id: true, signerName: true, signerRole: true, timestamp: true } },
          integrityRecords: { take: 1, orderBy: { blockIndex: 'desc' } },
        },
      }),
    ]);

    return res.json({
      success: true,
      documents,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('List documents error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve documents' });
  }
}

/**
 * Upload a new document into secure repository & register on blockchain
 */
async function uploadDocument(req, res) {
  try {
    const { caseId, title, category, classification } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }
    if (!caseId || !title || !category) {
      return res.status(400).json({ success: false, message: 'Case ID, Title, and Category are required' });
    }

    // Check case exists
    const caseItem = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseItem) {
      return res.status(404).json({ success: false, message: `Case ${caseId} does not exist` });
    }

    // Save file via secure storage abstraction
    const stored = await storageService.storeMulterFile(file, 'ncrb');

    // Generate Document ID: DOC-2026-XXXX
    const count = await prisma.document.count();
    const docId = `DOC-2026-${String(count + 101).padStart(6, '0')}`;

    // Read content snippet for AI intelligence extraction if text/pdf
    let textSample = title + ' ' + file.originalname;
    try {
      if (file.mimetype.includes('text')) {
        textSample = (await fs.promises.readFile(stored.filePath, 'utf8')).slice(0, 3000);
      }
    } catch (e) {
      // Use filename/title
    }

    // Run AI analysis
    const aiAnalysis = await aiService.summarizeDocument(textSample, {
      title,
      category,
      caseId,
    });

    // Create Document record
    const document = await prisma.document.create({
      data: {
        id: docId,
        caseId,
        title,
        fileName: file.originalname,
        filePath: stored.filePath,
        mimeType: file.mimetype,
        fileSize: stored.size,
        category,
        classification: classification || 'CONFIDENTIAL',
        currentHash: stored.hash,
        currentVersion: '1.0',
        uploadedById: req.user.id,
        summary: aiAnalysis.summary,
        extractedEntities: JSON.stringify(aiAnalysis.entities),
      },
    });

    // Create initial DocumentVersion (1.0)
    await prisma.documentVersion.create({
      data: {
        documentId: docId,
        versionNumber: '1.0',
        filePath: stored.filePath,
        fileHash: stored.hash,
        fileSize: stored.size,
        changeDescription: 'Initial evidentiary submission into custody repository',
        createdById: req.user.id,
      },
    });

    // Register on Blockchain Ledger
    const ledgerBlock = await blockchainService.registerDocumentHash(
      docId,
      stored.hash,
      `NCRB-NODE-${req.user.badgeNumber || '01'}`,
      `Initial registration of ${title} (${category}) for Case ${caseId}`
    );

    // Create Audit Log
    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'DOCUMENT_UPLOAD',
      resourceType: 'DOCUMENT',
      resourceId: docId,
      status: 'SUCCESS',
      details: {
        title,
        category,
        classification: classification || 'CONFIDENTIAL',
        hash: stored.hash,
        blockIndex: ledgerBlock.blockIndex,
        caseId,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Document successfully registered and anchored to blockchain ledger',
      document: {
        id: document.id,
        title: document.title,
        caseId: document.caseId,
        category: document.category,
        classification: document.classification,
        sha256: stored.hash,
        version: '1.0',
        ledgerBlockIndex: ledgerBlock.blockIndex,
        ledgerBlockHash: ledgerBlock.blockHash,
        timestamp: ledgerBlock.timestamp,
        uploadedBy: req.user.fullName,
      },
    });
  } catch (err) {
    console.error('Upload document error:', err);
    return res.status(500).json({ success: false, message: 'Failed to securely upload and anchor document' });
  }
}

/**
 * Get document details with versions, signatures, and ledger records
 */
async function getDocumentById(req, res) {
  try {
    const { id } = req.params;

    const doc = await prisma.document.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            caseType: true,
            assignedOfficer: { select: { fullName: true, badgeNumber: true } },
          },
        },
        uploadedBy: {
          select: { id: true, fullName: true, badgeNumber: true, role: true, email: true },
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: { select: { fullName: true, badgeNumber: true, role: true } },
            digitalSignatures: true,
          },
        },
        digitalSignatures: {
          orderBy: { timestamp: 'desc' },
          include: {
            signer: { select: { fullName: true, badgeNumber: true, role: true } },
          },
        },
        integrityRecords: {
          orderBy: { blockIndex: 'desc' },
        },
      },
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'DOCUMENT_VIEW',
      resourceType: 'DOCUMENT',
      resourceId: id,
      status: 'SUCCESS',
      details: `Accessed document metadata and inspection viewer: ${doc.title}`,
    });

    return res.json({
      success: true,
      document: doc,
    });
  } catch (err) {
    console.error('Get document error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve document details' });
  }
}

/**
 * Download document binary with stream
 */
async function downloadDocument(req, res) {
  try {
    const { id } = req.params;

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const actualFilePath = storageService.resolveFilePath(doc);
    if (!fs.existsSync(actualFilePath)) {
      return res.status(404).json({ success: false, message: 'Physical file not found on secure storage' });
    }

    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'DOCUMENT_DOWNLOAD',
      resourceType: 'DOCUMENT',
      resourceId: id,
      status: 'SUCCESS',
      details: `File downloaded: ${doc.fileName} (${doc.fileSize} bytes)`,
    });

    res.setHeader('Content-Disposition', `attachment; filename="${doc.fileName}"`);
    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');

    const fileStream = fs.createReadStream(actualFilePath);
    fileStream.pipe(res);
  } catch (err) {
    console.error('Download document error:', err);
    return res.status(500).json({ success: false, message: 'Failed to download document' });
  }
}

/**
 * Preview document content (supports raw text / html preview or metadata summary)
 */
async function previewDocument(req, res) {
  try {
    const { id } = req.params;
    const doc = await prisma.document.findUnique({ where: { id } });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const actualFilePath = storageService.resolveFilePath(doc);
    if (!fs.existsSync(actualFilePath)) {
      return res.status(404).json({ success: false, message: 'Physical file not found' });
    }

    // If text file or json, return contents
    if (doc.mimeType.includes('text') || doc.mimeType.includes('json')) {
      const content = await fs.promises.readFile(actualFilePath, 'utf8');
      return res.json({ success: true, previewType: 'text', content });
    }

    // For PDF or binary, send file inline
    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${doc.fileName}"`);
    fs.createReadStream(actualFilePath).pipe(res);
  } catch (err) {
    console.error('Preview document error:', err);
    return res.status(500).json({ success: false, message: 'Failed to preview document' });
  }
}

/**
 * Upload a new version for an existing document (never overwrites original!)
 */
async function uploadNewVersion(req, res) {
  try {
    const { id } = req.params;
    const { changeDescription, versionType = 'minor' } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'New version file is required' });
    }

    const doc = await prisma.document.findUnique({
      where: { id },
      include: { versions: { orderBy: { createdAt: 'desc' } } },
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Compute new version string (e.g. 1.0 -> 1.1 or 2.0)
    const currentVer = parseFloat(doc.currentVersion) || 1.0;
    const nextVer = versionType === 'major' ? (Math.floor(currentVer) + 1.0).toFixed(1) : (currentVer + 0.1).toFixed(1);

    // Save file
    const stored = await storageService.storeMulterFile(file, `v${nextVer}`);

    // Create DocumentVersion entry
    const newVersion = await prisma.documentVersion.create({
      data: {
        documentId: doc.id,
        versionNumber: nextVer,
        filePath: stored.filePath,
        fileHash: stored.hash,
        fileSize: stored.size,
        changeDescription: changeDescription || `Version ${nextVer} update`,
        createdById: req.user.id,
      },
    });

    // Update document record current version and current hash
    await prisma.document.update({
      where: { id: doc.id },
      data: {
        currentVersion: nextVer,
        currentHash: stored.hash,
        filePath: stored.filePath,
        fileSize: stored.size,
      },
    });

    // Register new block on blockchain ledger
    const ledgerBlock = await blockchainService.registerDocumentHash(
      doc.id,
      stored.hash,
      `NCRB-NODE-${req.user.badgeNumber || '01'}`,
      `Version ${nextVer} registered: ${changeDescription || 'No description provided'}`
    );

    // Create Audit Log
    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'DOCUMENT_VERSION_NEW',
      resourceType: 'DOCUMENT',
      resourceId: doc.id,
      status: 'SUCCESS',
      details: {
        previousVersion: doc.currentVersion,
        newVersion: nextVer,
        previousHash: doc.currentHash,
        newHash: stored.hash,
        blockIndex: ledgerBlock.blockIndex,
        changeDescription,
      },
    });

    return res.status(201).json({
      success: true,
      message: `Version ${nextVer} successfully registered and anchored to blockchain`,
      version: newVersion,
      ledgerBlock,
    });
  } catch (err) {
    console.error('Upload new version error:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload new document version' });
  }
}

/**
 * Digitally sign a document
 */
async function signDocument(req, res) {
  try {
    const { id } = req.params;
    const { reason, signatureConfirmation } = req.body;

    if (!signatureConfirmation) {
      return res.status(400).json({ success: false, message: 'Signature confirmation checkbox is required' });
    }

    const doc = await prisma.document.findUnique({
      where: { id },
      include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const { signatureId, signatureHash, certificateInfo, timestamp } = generateDigitalSignature(
      doc.currentHash,
      req.user.id,
      req.user.role,
      reason
    );

    const latestVersion = doc.versions[0];

    const digitalSignature = await prisma.digitalSignature.create({
      data: {
        id: signatureId,
        documentId: doc.id,
        versionId: latestVersion ? latestVersion.id : null,
        signerUserId: req.user.id,
        signerName: req.user.fullName,
        signerRole: req.user.role,
        signatureHash,
        signatureReason: reason || 'Official verification and endorsement for judicial/investigative record',
        certificateInfo,
        timestamp: new Date(timestamp),
        isValid: true,
      },
    });

    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'DIGITAL_SIGN',
      resourceType: 'DOCUMENT',
      resourceId: doc.id,
      status: 'SUCCESS',
      details: {
        signatureId,
        signerRole: req.user.role,
        documentHash: doc.currentHash,
        reason,
      },
    });

    return res.json({
      success: true,
      message: 'Document digitally signed and cryptographic seal anchored',
      signature: digitalSignature,
    });
  } catch (err) {
    console.error('Sign document error:', err);
    return res.status(500).json({ success: false, message: 'Failed to digitally sign document' });
  }
}

/**
 * Verify document integrity dynamically against registered hash & blockchain ledger
 */
async function verifyDocumentIntegrity(req, res) {
  try {
    const { id } = req.params;

    const verificationResult = await blockchainService.verifyDocumentIntegrity(id);

    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'INTEGRITY_VERIFY',
      resourceType: 'DOCUMENT',
      resourceId: id,
      status: verificationResult.verified ? 'SUCCESS' : 'WARNING',
      details: {
        verified: verificationResult.verified,
        recalculatedHash: verificationResult.recalculatedHash,
        registeredHash: verificationResult.registeredHash,
        blockIndex: verificationResult.blockIndex,
      },
    });

    if (!verificationResult.verified) {
      // Record critical security event
      await prisma.securityEvent.create({
        data: {
          eventType: 'INTEGRITY_MISMATCH',
          severity: 'CRITICAL',
          description: `CRITICAL ALERT: File integrity compromised for ${id}. Stored disk hash does not match blockchain ledger!`,
          userId: req.user.id,
          userName: req.user.fullName,
          ipAddress: req.ip || '127.0.0.1',
        },
      });
    }

    return res.json({
      success: true,
      result: verificationResult,
    });
  } catch (err) {
    console.error('Verify document integrity error:', err);
    return res.status(500).json({ success: false, message: 'Failed to verify document integrity' });
  }
}

module.exports = {
  listDocuments,
  uploadDocument,
  getDocumentById,
  downloadDocument,
  previewDocument,
  uploadNewVersion,
  signDocument,
  verifyDocumentIntegrity,
};
