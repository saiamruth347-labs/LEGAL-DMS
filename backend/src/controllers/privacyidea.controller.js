const privacyideaService = require('../services/privacyidea.service');
const { createAuditLog } = require('../middleware/audit');

/**
 * Trigger privacyIDEA Challenge (SMS Phone OTP or Authenticator Push)
 */
async function triggerChallenge(req, res) {
  try {
    const { user, phone, type = 'sms' } = req.body;
    if (!phone && !user) {
      return res.status(400).json({ success: false, message: 'User or phone number is required.' });
    }

    const result = await privacyideaService.triggerChallenge({ user, phone, type });

    await createAuditLog({
      req,
      action: 'PRIVACYIDEA_CHALLENGE_TRIGGERED',
      resourceType: 'AUTH',
      status: 'SUCCESS',
      details: `privacyIDEA OTP challenge initiated for ${user || phone}. Mode: ${result.mode}. Txn: ${result.transaction_id}`,
    });

    return res.json(result);
  } catch (error) {
    console.error('privacyIDEA triggerChallenge error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Validate privacyIDEA Check (Verify OTP with transaction_id)
 */
async function validateCheck(req, res) {
  try {
    const { user, pass, transaction_id, realm } = req.body;
    if (!pass) {
      return res.status(400).json({ success: false, message: 'Passcode / OTP is required.' });
    }

    const result = await privacyideaService.validateCheck({ user, pass, transaction_id, realm });

    await createAuditLog({
      req,
      action: result.verified ? 'PRIVACYIDEA_VERIFY_SUCCESS' : 'PRIVACYIDEA_VERIFY_FAILED',
      resourceType: 'AUTH',
      status: result.verified ? 'SUCCESS' : 'FAILED',
      details: `privacyIDEA OTP verification attempt for txn ${transaction_id}. Status: ${result.verified ? 'VERIFIED' : 'FAILED'}`,
    });

    if (result.verified) {
      return res.json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('privacyIDEA validateCheck error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * privacyIDEA System Status
 */
async function getStatus(req, res) {
  try {
    const status = await privacyideaService.getSystemStatus();
    return res.json({ success: true, ...status });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  triggerChallenge,
  validateCheck,
  getStatus,
};
