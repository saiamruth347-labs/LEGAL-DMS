const crypto = require('crypto');
const fs = require('fs');

/**
 * Calculates SHA-256 hash from a Buffer or string
 * @param {Buffer|string} data
 * @returns {string} hex hash
 */
function calculateSHA256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Calculates SHA-256 hash directly from a file path
 * @param {string} filePath
 * @returns {Promise<string>}
 */
function calculateFileSHA256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
}

/**
 * Calculates cryptographic hash for a blockchain ledger block
 * @param {number} blockIndex
 * @param {string} documentHash
 * @param {string} previousHash
 * @param {string|Date} timestamp
 * @param {string} validator
 * @returns {string} block hash
 */
function calculateBlockHash(blockIndex, documentHash, previousHash, timestamp, validator) {
  const payload = `${blockIndex}|${documentHash}|${previousHash}|${new Date(timestamp).toISOString()}|${validator}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Generates simulated digital signature token for document
 * @param {string} docHash
 * @param {string} userId
 * @param {string} role
 * @param {string} reason
 * @returns {{ signatureId: string, signatureHash: string, certificateInfo: string }}
 */
function generateDigitalSignature(docHash, userId, role, reason) {
  const signatureId = `SIG-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const timestamp = new Date().toISOString();
  const rawSignatureData = `${signatureId}:${docHash}:${userId}:${role}:${timestamp}:${reason || ''}`;
  const signatureHash = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'ncrb-pki-secret')
    .update(rawSignatureData)
    .digest('hex');

  const certificateInfo = JSON.stringify({
    issuer: 'National Crime Records Bureau (NCRB) Sub-CA',
    certType: 'Class 3 Digital Signature Certificate (DSC - Demo)',
    algorithm: 'SHA256withRSA-Simulation',
    validFrom: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    validTo: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    keyLength: '2048-bit',
  });

  return { signatureId, signatureHash, certificateInfo, timestamp };
}

module.exports = {
  calculateSHA256,
  calculateFileSHA256,
  calculateBlockHash,
  generateDigitalSignature,
};
