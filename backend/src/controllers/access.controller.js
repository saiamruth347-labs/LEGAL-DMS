const prisma = require('../config/db');
const { createAuditLog } = require('../middleware/audit');

/**
 * Submit an access request for a classified document
 */
async function requestAccess(req, res) {
  try {
    const { documentId, reason, requestedRole } = req.body;

    if (!documentId || !reason) {
      return res.status(400).json({ success: false, message: 'Document ID and reason are required' });
    }

    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: { case: true },
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Check if an existing pending request is already waiting
    const existing = await prisma.accessRequest.findFirst({
      where: {
        documentId: doc.id,
        requesterUserId: req.user.id,
        status: 'PENDING',
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An access request for this document is already pending supervisory review',
      });
    }

    const newRequest = await prisma.accessRequest.create({
      data: {
        documentId: doc.id,
        caseId: doc.caseId,
        requesterUserId: req.user.id,
        requestedRole: requestedRole || req.user.role,
        reason,
        status: 'PENDING',
      },
      include: {
        document: { select: { title: true, classification: true } },
        case: { select: { title: true } },
      },
    });

    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'ACCESS_REQUEST',
      resourceType: 'DOCUMENT',
      resourceId: doc.id,
      status: 'SUCCESS',
      details: {
        requestId: newRequest.id,
        documentTitle: doc.title,
        classification: doc.classification,
        reason,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Access authorization request submitted for supervisor approval',
      request: newRequest,
    });
  } catch (err) {
    console.error('Request access error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit access request' });
  }
}

/**
 * List access requests (for Reviewer / Admin triage or user's own requests)
 */
async function listAccessRequests(req, res) {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;

    // If user is neither ADMIN nor REVIEWER, only show requests they made
    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'REVIEWER') {
      where.requesterUserId = req.user.id;
    }

    const [total, requests] = await Promise.all([
      prisma.accessRequest.count({ where }),
      prisma.accessRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          document: {
            select: {
              id: true,
              title: true,
              classification: true,
              category: true,
              currentVersion: true,
            },
          },
          case: {
            select: {
              id: true,
              title: true,
            },
          },
          requester: {
            select: {
              id: true,
              fullName: true,
              badgeNumber: true,
              role: true,
              department: { select: { name: true } },
            },
          },
          reviewedBy: {
            select: {
              fullName: true,
              badgeNumber: true,
              role: true,
            },
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      requests,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('List access requests error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve access requests' });
  }
}

/**
 * Review an access request (Approve or Reject)
 */
async function reviewAccessRequest(req, res) {
  try {
    const { id } = req.params;
    const { status, reviewRemarks } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED' });
    }

    const request = await prisma.accessRequest.findUnique({
      where: { id },
      include: {
        document: true,
        requester: true,
      },
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Access request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    const updated = await prisma.accessRequest.update({
      where: { id },
      data: {
        status,
        reviewedById: req.user.id,
        reviewedAt: new Date(),
        reviewRemarks: reviewRemarks || `Request ${status.toLowerCase()} by supervisor`,
      },
      include: {
        document: true,
        requester: true,
      },
    });

    // Notify requester
    await prisma.notification.create({
      data: {
        userId: request.requesterUserId,
        title: `Access Request ${status}: ${request.document.title}`,
        message: `Your request to access ${request.document.id} was ${status.toLowerCase()} by ${req.user.fullName}. Remarks: ${reviewRemarks || 'Approved'}`,
        type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
        linkUrl: `/documents/${request.documentId}`,
      },
    });

    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: status === 'APPROVED' ? 'ACCESS_APPROVE' : 'ACCESS_REJECT',
      resourceType: 'ACCESS_REQUEST',
      resourceId: id,
      status: 'SUCCESS',
      details: {
        targetDocumentId: request.documentId,
        targetUser: request.requester.fullName,
        decision: status,
        remarks: reviewRemarks,
      },
    });

    return res.json({
      success: true,
      message: `Access request ${status.toLowerCase()} successfully`,
      request: updated,
    });
  } catch (err) {
    console.error('Review access request error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process access request review' });
  }
}

module.exports = {
  requestAccess,
  listAccessRequests,
  reviewAccessRequest,
};
