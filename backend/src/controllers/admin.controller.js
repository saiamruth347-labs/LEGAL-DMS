const prisma = require('../config/db');
const { createAuditLog } = require('../middleware/audit');

/**
 * List all registered users
 */
async function listUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        badgeNumber: true,
        role: true,
        isActive: true,
        isLocked: true,
        failedLoginAttempts: true,
        lockoutUntil: true,
        createdAt: true,
        department: { select: { id: true, name: true, code: true } },
        _count: {
          select: { uploadedDocs: true, digitalSignatures: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.json({ success: true, users });
  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users' });
  }
}

/**
 * Toggle user active status
 */
async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: isActive ? 'USER_ACTIVATE' : 'USER_DEACTIVATE',
      resourceType: 'USER',
      resourceId: id,
      status: 'SUCCESS',
      details: `${isActive ? 'Re-activated' : 'Revoked'} access for ${user.fullName} (${user.badgeNumber})`,
    });

    return res.json({ success: true, message: 'User status updated', user: updated });
  } catch (err) {
    console.error('Toggle user status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
}

/**
 * Reset account lockout for a user
 */
async function resetLockout(req, res) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await prisma.user.update({
      where: { id },
      data: { isLocked: false, failedLoginAttempts: 0, lockoutUntil: null },
    });

    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'USER_LOCKOUT_RESET',
      resourceType: 'USER',
      resourceId: id,
      status: 'SUCCESS',
      details: `Account lockout cleared for ${user.fullName} (${user.email}) by Administrator`,
    });

    return res.json({ success: true, message: `Lockout cleared for ${user.fullName}` });
  } catch (err) {
    console.error('Reset lockout error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reset lockout' });
  }
}

/**
 * List departments
 */
async function listDepartments(req, res) {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: { select: { users: true, cases: true } },
      },
    });
    return res.json({ success: true, departments });
  } catch (err) {
    console.error('List departments error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve departments' });
  }
}

/**
 * Get system security settings
 */
async function getSystemSettings(req, res) {
  return res.json({
    success: true,
    settings: {
      systemTitle: 'National Crime Records Bureau - Secure Digital Document System',
      jurisdiction: 'Ministry of Home Affairs, Government of India',
      securityLevel: 'RESTRICTED / LAW ENFORCEMENT SENSITIVE',
      maxFailedLogins: 5,
      lockoutDurationMinutes: 15,
      hashingAlgorithm: 'SHA-256 (FIPS 180-4 compliant)',
      blockchainProtocol: 'Tamper-Evident Hash Chain / Hyperledger Fabric Ready',
      pkiStandard: 'Class 3 Digital Signature Certificate (DSC) Simulation',
      storageEngine: 'Local Hardened Custody Storage (S3 / Azure Blob Ready)',
      activeNodes: ['NCRB-INTEGRITY-NODE-01', 'NCRB-INTEGRITY-NODE-02', 'MHA-AUDIT-NODE-01'],
    },
  });
}

module.exports = {
  listUsers,
  toggleUserStatus,
  resetLockout,
  listDepartments,
  getSystemSettings,
};
