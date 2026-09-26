const prisma = require('../config/db');

/**
 * Creates an immutable-style audit log entry
 */
async function createAuditLog({
  req,
  userId,
  userName,
  userRole,
  action,
  resourceType,
  resourceId = null,
  status = 'SUCCESS',
  details = null,
}) {
  try {
    const ipAddress =
      (req && (req.headers['x-forwarded-for'] || req.socket.remoteAddress)) || '127.0.0.1';
    const userAgent = req && req.headers ? req.headers['user-agent'] : 'Internal System';

    let validUserId = null;
    if (userId && typeof userId === 'string' && userId.length === 36 && !userId.startsWith('citizen-')) {
      validUserId = userId;
    }

    const logEntry = await prisma.auditLog.create({
      data: {
        userId: validUserId,
        userName: userName || (req && req.user ? req.user.fullName : 'System'),
        userRole: userRole || (req && req.user ? req.user.role : 'SYSTEM'),
        action,
        resourceType,
        resourceId,
        ipAddress: String(ipAddress),
        userAgent: String(userAgent),
        status,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
      },
    });

    return logEntry;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Never crash caller on audit log failure
    return null;
  }
}

module.exports = { createAuditLog };
