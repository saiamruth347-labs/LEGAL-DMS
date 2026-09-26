const blockchainService = require('../services/blockchain.service');
const prisma = require('../config/db');
const { calculateFileSHA256 } = require('../utils/crypto');
const { createAuditLog } = require('../middleware/audit');

/**
 * Get blockchain ledger blocks
 */
async function getLedger(req, res) {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await blockchainService.getLedgerBlocks(
      parseInt(page),
      parseInt(limit),
      search
    );
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('Get ledger error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve integrity ledger' });
  }
}

/**
 * Validate the entire cryptographic hash chain
 */
async function validateChain(req, res) {
  try {
    const result = await blockchainService.validateEntireChain();

    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'LEDGER_FULL_VALIDATION',
      resourceType: 'LEDGER',
      status: result.isValid ? 'SUCCESS' : 'WARNING',
      details: result.message,
    });

    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('Validate chain error:', err);
    return res.status(500).json({ success: false, message: 'Failed to validate blockchain chain' });
  }
}

/**
 * Verify arbitrary hash or file against the ledger
 */
async function verifyRawHash(req, res) {
  try {
    let hashToVerify = req.body.hash;

    // If a file was uploaded in this verification form
    if (req.file) {
      hashToVerify = await calculateFileSHA256(req.file.path);
    }

    if (!hashToVerify) {
      return res.status(400).json({ success: false, message: 'Hash string or file is required' });
    }

    const cleanHash = hashToVerify.trim().toLowerCase();

    const block = await prisma.integrityLedger.findFirst({
      where: {
        OR: [{ documentHash: cleanHash }, { blockHash: cleanHash }],
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            category: true,
            caseId: true,
            classification: true,
          },
        },
      },
    });

    const isMatch = !!block;

    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'HASH_LOOKUP_VERIFY',
      resourceType: 'LEDGER',
      status: isMatch ? 'SUCCESS' : 'FAILED',
      details: `Queried hash: ${cleanHash.slice(0, 16)}... Found: ${isMatch}`,
    });

    return res.json({
      success: true,
      verified: isMatch,
      queriedHash: cleanHash,
      message: isMatch
        ? `Cryptographic proof verified. Anchored in Block #${block.blockIndex}.`
        : 'Hash NOT registered on National Crime Records Bureau Integrity Ledger.',
      block: block || null,
    });
  } catch (err) {
    console.error('Verify raw hash error:', err);
    return res.status(500).json({ success: false, message: 'Failed to verify hash' });
  }
}

module.exports = {
  getLedger,
  validateChain,
  verifyRawHash,
};
