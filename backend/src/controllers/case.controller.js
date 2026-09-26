const prisma = require('../config/db');
const { createAuditLog } = require('../middleware/audit');

/**
 * List cases with filters and search
 */
async function listCases(req, res) {
  try {
    const { status, priority, caseType, search, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (caseType) where.caseType = caseType;
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } },
        { firNumber: { contains: search } },
      ];
    }

    const [total, cases] = await Promise.all([
      prisma.case.count({ where }),
      prisma.case.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          assignedOfficer: {
            select: { id: true, fullName: true, badgeNumber: true, role: true },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: { documents: true },
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      cases,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('List cases error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve cases' });
  }
}

/**
 * Get case details by ID including documents and timeline
 */
async function getCaseById(req, res) {
  try {
    const { id } = req.params;

    const caseItem = await prisma.case.findUnique({
      where: { id },
      include: {
        assignedOfficer: {
          select: { id: true, fullName: true, badgeNumber: true, email: true, role: true },
        },
        creator: {
          select: { id: true, fullName: true, badgeNumber: true, role: true },
        },
        department: true,
        documents: {
          include: {
            uploadedBy: { select: { fullName: true, badgeNumber: true, role: true } },
            digitalSignatures: true,
            integrityRecords: { take: 1, orderBy: { blockIndex: 'desc' } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Fetch related audit trail events for case timeline
    const timeline = await prisma.auditLog.findMany({
      where: {
        OR: [
          { resourceId: id },
          { details: { contains: id } },
        ],
      },
      orderBy: { timestamp: 'desc' },
      take: 25,
    });

    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'CASE_VIEW',
      resourceType: 'CASE',
      resourceId: id,
      status: 'SUCCESS',
      details: `Viewed case dossier: ${caseItem.title}`,
    });

    return res.json({
      success: true,
      case: caseItem,
      timeline,
    });
  } catch (err) {
    console.error('Get case error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve case dossier' });
  }
}

/**
 * Create new case
 */
async function createCase(req, res) {
  try {
    const { title, caseType, description, priority, firNumber, departmentId, assignedOfficerId } = req.body;

    if (!title || !description || !caseType) {
      return res.status(400).json({ success: false, message: 'Title, Case Type, and Description are required' });
    }

    // Generate unique Case ID
    const count = await prisma.case.count();
    const caseId = `CASE-2026-${String(count + 1).padStart(3, '0')}`;

    const newCase = await prisma.case.create({
      data: {
        id: caseId,
        title,
        caseType,
        description,
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        firNumber: firNumber || `FIR-NCRB-${Date.now().toString().slice(-6)}`,
        incidentDate: new Date(),
        createdById: req.user.id,
        departmentId: departmentId || req.user.departmentId,
        assignedOfficerId: assignedOfficerId || req.user.id,
      },
      include: {
        assignedOfficer: { select: { fullName: true, badgeNumber: true } },
        department: true,
      },
    });

    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'CASE_CREATE',
      resourceType: 'CASE',
      resourceId: caseId,
      status: 'SUCCESS',
      details: `Initialized new investigation dossier: ${title} (${caseType})`,
    });

    return res.status(201).json({
      success: true,
      message: `Case ${caseId} created successfully`,
      case: newCase,
    });
  } catch (err) {
    console.error('Create case error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create case' });
  }
}

/**
 * Update case status
 */
async function updateCaseStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ['OPEN', 'UNDER_INVESTIGATION', 'LEGAL_REVIEW', 'COURT_SUBMITTED', 'CLOSED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid case status' });
    }

    const updatedCase = await prisma.case.update({
      where: { id },
      data: { status },
    });

    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'CASE_STATUS_UPDATE',
      resourceType: 'CASE',
      resourceId: id,
      status: 'SUCCESS',
      details: `Status transitioned to ${status}. Remarks: ${remarks || 'None'}`,
    });

    return res.json({
      success: true,
      message: `Case status updated to ${status}`,
      case: updatedCase,
    });
  } catch (err) {
    console.error('Update case status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update case status' });
  }
}

module.exports = {
  listCases,
  getCaseById,
  createCase,
  updateCaseStatus,
};
