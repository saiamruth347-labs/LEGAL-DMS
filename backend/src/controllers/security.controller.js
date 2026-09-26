const prisma = require('../config/db');
const aiService = require('../services/ai.service');
const { createAuditLog } = require('../middleware/audit');

/**
 * Get Security Center Overview & Risk Score
 */
async function getSecurityOverview(req, res) {
  try {
    const analysis = await aiService.detectAnomalies();

    const [failedLoginsCount, lockedUsersCount, totalThreats] = await Promise.all([
      prisma.securityEvent.count({ where: { eventType: 'FAILED_LOGIN' } }),
      prisma.user.count({ where: { isLocked: true } }),
      prisma.securityEvent.count({ where: { resolved: false } }),
    ]);

    return res.json({
      success: true,
      ...analysis,
      failedLoginsCount,
      lockedUsersCount,
      totalUnresolvedThreats: totalThreats,
    });
  } catch (err) {
    console.error('Security overview error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve security metrics' });
  }
}

/**
 * List security events
 */
async function listSecurityEvents(req, res) {
  try {
    const { severity, resolved, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (severity) where.severity = severity;
    if (resolved !== undefined) where.resolved = resolved === 'true';

    const [total, events] = await Promise.all([
      prisma.securityEvent.count({ where }),
      prisma.securityEvent.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: parseInt(limit),
      }),
    ]);

    return res.json({
      success: true,
      events,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('List security events error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve security events' });
  }
}

/**
 * Mark a security event as resolved
 */
async function resolveSecurityEvent(req, res) {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const event = await prisma.securityEvent.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Security event not found' });
    }

    const updated = await prisma.securityEvent.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        metadata: JSON.stringify({
          resolvedBy: req.user.fullName,
          resolvedRole: req.user.role,
          remarks: remarks || 'Threat mitigated and reviewed by cybersecurity officer',
        }),
      },
    });

    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'SECURITY_INCIDENT_RESOLVE',
      resourceType: 'SECURITY_EVENT',
      resourceId: id,
      status: 'SUCCESS',
      details: `Mitigated security incident: ${event.eventType} (${event.severity})`,
    });

    return res.json({
      success: true,
      message: 'Security incident resolved',
      event: updated,
    });
  } catch (err) {
    console.error('Resolve security event error:', err);
    return res.status(500).json({ success: false, message: 'Failed to resolve security incident' });
  }
}

module.exports = {
  getSecurityOverview,
  listSecurityEvents,
  resolveSecurityEvent,
};
