const prisma = require('../config/db');

/**
 * Get audit logs with comprehensive filters
 */
async function getAuditLogs(req, res) {
  try {
    const {
      action,
      userRole,
      status,
      resourceType,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (action) where.action = action;
    if (userRole) where.userRole = userRole;
    if (status) where.status = status;
    if (resourceType) where.resourceType = resourceType;

    if (search) {
      where.OR = [
        { userName: { contains: search } },
        { action: { contains: search } },
        { resourceId: { contains: search } },
        { details: { contains: search } },
        { ipAddress: { contains: search } },
      ];
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: { id: true, fullName: true, badgeNumber: true, email: true },
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      logs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('Get audit logs error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit trail' });
  }
}

/**
 * Export audit logs as CSV for court submission and compliance audit
 */
async function exportAuditCsv(req, res) {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 500,
    });

    const headers = ['Timestamp', 'Action', 'Officer / User', 'Role', 'Resource Type', 'Resource ID', 'Status', 'IP Address', 'Details'];
    const rows = logs.map((log) => [
      `"${log.timestamp.toISOString()}"`,
      `"${log.action}"`,
      `"${log.userName.replace(/"/g, '""')}"`,
      `"${log.userRole}"`,
      `"${log.resourceType}"`,
      `"${log.resourceId || 'N/A'}"`,
      `"${log.status}"`,
      `"${log.ipAddress}"`,
      `"${(log.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="NCRB_Audit_Trail_${Date.now()}.csv"`);
    return res.send(csvContent);
  } catch (err) {
    console.error('Export audit CSV error:', err);
    return res.status(500).json({ success: false, message: 'Failed to export audit report' });
  }
}

/**
 * Quick audit stats for dashboard
 */
async function getAuditStats(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayCount, totalCount, actionBreakdown] = await Promise.all([
      prisma.auditLog.count({ where: { timestamp: { gte: today } } }),
      prisma.auditLog.count(),
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 8,
      }),
    ]);

    return res.json({
      success: true,
      todayCount,
      totalCount,
      actionBreakdown,
    });
  } catch (err) {
    console.error('Get audit stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit stats' });
  }
}

module.exports = {
  getAuditLogs,
  exportAuditCsv,
  getAuditStats,
};
