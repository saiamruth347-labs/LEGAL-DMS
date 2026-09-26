const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { createAuditLog } = require('./audit');

/**
 * Authenticate JWT Bearer Token
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Authentication token required',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ncrb_super_secure_jwt_secret_key_2026_sih26190');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { department: true },
    });

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account inactive or revoked. Contact Super Admin.',
      });
    }

    if (user.isLocked && user.lockoutUntil && new Date() < new Date(user.lockoutUntil)) {
      return res.status(403).json({
        success: false,
        message: `Account is temporarily locked until ${user.lockoutUntil.toLocaleTimeString()} due to security violations.`,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid cryptographic token',
    });
  }
}

/**
 * Role-Based Access Control middleware
 * @param  {...string} allowedRoles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (req.user.role === 'SUPER_ADMIN' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    // Log security violation
    createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'UNAUTHORIZED_ROLE_ACCESS',
      resourceType: 'ROUTE',
      resourceId: req.originalUrl,
      status: 'DENIED',
      details: `Role ${req.user.role} attempted access to restricted endpoint requiring: ${allowedRoles.join(', ')}`,
    });

    return res.status(403).json({
      success: false,
      message: `Access Forbidden: Your role (${req.user.role}) does not possess necessary clearance.`,
    });
  };
}

/**
 * Checks document access permissions based on classification and approved access requests
 */
async function checkDocumentAccess(req, res, next) {
  const documentId = req.params.id || req.body.documentId;
  if (!documentId) return next();

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { case: true },
  });

  if (!doc) {
    return res.status(404).json({ success: false, message: 'Document not found in registry' });
  }

  req.targetDocument = doc;

  // Super Admin has universal clearance
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  // If Public or Internal, any logged in officer can access
  if (doc.classification === 'PUBLIC' || doc.classification === 'INTERNAL') {
    return next();
  }

  // If Uploader or assigned officer on the case
  if (doc.uploadedById === req.user.id || doc.case.assignedOfficerId === req.user.id) {
    return next();
  }

  // If Auditor or Legal Officer accessing for audit/legal review (CONFIDENTIAL level)
  if (
    (req.user.role === 'AUDITOR' || req.user.role === 'LEGAL_OFFICER') &&
    doc.classification !== 'RESTRICTED' &&
    doc.classification !== 'HIGHLY_CONFIDENTIAL'
  ) {
    return next();
  }

  // Check if an approved AccessRequest exists for this user and document
  const approvedRequest = await prisma.accessRequest.findFirst({
    where: {
      documentId: doc.id,
      requesterUserId: req.user.id,
      status: 'APPROVED',
    },
  });

  if (approvedRequest) {
    return next();
  }

  // Access denied - log audit event
  await createAuditLog({
    req,
    userId: req.user.id,
    userName: req.user.fullName,
    userRole: req.user.role,
    action: 'DOCUMENT_ACCESS_DENIED',
    resourceType: 'DOCUMENT',
    resourceId: doc.id,
    status: 'DENIED',
    details: `Classification ${doc.classification} blocked access for ${req.user.fullName} (${req.user.role})`,
  });

  // Record security event
  await prisma.securityEvent.create({
    data: {
      eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      severity: doc.classification === 'RESTRICTED' ? 'HIGH' : 'MEDIUM',
      description: `User ${req.user.fullName} (${req.user.role}) attempted unauthorized access to classified file ${doc.id} (${doc.classification}).`,
      userId: req.user.id,
      userName: req.user.fullName,
      ipAddress: req.ip || '127.0.0.1',
    },
  });

  return res.status(403).json({
    success: false,
    accessDenied: true,
    documentId: doc.id,
    documentTitle: doc.title,
    classification: doc.classification,
    caseId: doc.caseId,
    message: 'ACCESS REQUIRED: You do not currently possess clearance for this classified record.',
  });
}

module.exports = {
  authenticateToken,
  requireRole,
  checkDocumentAccess,
};
