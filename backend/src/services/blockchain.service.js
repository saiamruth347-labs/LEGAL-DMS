const prisma = require('../config/db');
const { calculateBlockHash, calculateFileSHA256 } = require('../utils/crypto');
const storageService = require('./storage.service');

class BlockchainService {
  /**
   * Initializes genesis block if ledger is empty
   */
  async ensureGenesisBlock() {
    const count = await prisma.integrityLedger.count();
    if (count === 0) {
      const genesisIndex = 0;
      const genesisDocHash = '0000000000000000000000000000000000000000000000000000000000000000';
      const previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
      const timestamp = new Date('2026-01-01T00:00:00.000Z');
      const validator = 'NCRB-GENESIS-ANCHOR-00';
      const blockHash = calculateBlockHash(
        genesisIndex,
        genesisDocHash,
        previousHash,
        timestamp,
        validator
      );

      await prisma.integrityLedger.create({
        data: {
          blockIndex: genesisIndex,
          documentId: null,
          documentHash: genesisDocHash,
          previousHash,
          blockHash,
          timestamp,
          validator,
          status: 'VERIFIED',
          merkleRoot: blockHash,
          notes: 'GENESIS_BLOCK: National Crime Records Bureau Digital Custody Ledger Established',
        },
      });
    }
  }

  /**
   * Registers a document hash onto the tamper-evident ledger
   * @param {string} documentId
   * @param {string} documentHash
   * @param {string} validator
   * @param {string} notes
   */
  async registerDocumentHash(documentId, documentHash, validator = 'NCRB-NODE-01', notes = '') {
    await this.ensureGenesisBlock();

    // Fetch the latest block
    const latestBlock = await prisma.integrityLedger.findFirst({
      orderBy: { blockIndex: 'desc' },
    });

    const newIndex = latestBlock ? latestBlock.blockIndex + 1 : 1;
    const previousHash = latestBlock ? latestBlock.blockHash : '0'.repeat(64);
    const timestamp = new Date();
    const blockHash = calculateBlockHash(newIndex, documentHash, previousHash, timestamp, validator);

    const newBlock = await prisma.integrityLedger.create({
      data: {
        blockIndex: newIndex,
        documentId,
        documentHash,
        previousHash,
        blockHash,
        timestamp,
        validator,
        status: 'VERIFIED',
        merkleRoot: blockHash,
        notes: notes || `Document registered: ${documentId}`,
      },
    });

    return newBlock;
  }

  /**
   * Verifies the integrity of a specific document
   * Recalculates file hash from disk and matches against DB and ledger
   * @param {string} documentId
   */
  async verifyDocumentIntegrity(documentId) {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        versions: { orderBy: { createdAt: 'desc' }, take: 1 },
        integrityRecords: { orderBy: { blockIndex: 'desc' }, take: 1 },
      },
    });

    if (!doc) {
      throw new Error('Document not found');
    }

    // Recalculate file hash from disk
    let diskHash = null;
    let fileFound = false;
    try {
      const actualPath = storageService.resolveFilePath(doc);
      diskHash = await calculateFileSHA256(actualPath);
      fileFound = true;
    } catch (e) {
      fileFound = false;
    }

    const recordedHash = doc.currentHash;
    const ledgerRecord = doc.integrityRecords[0] || null;
    const ledgerHash = ledgerRecord ? ledgerRecord.documentHash : null;

    const isMatch = fileFound && diskHash === recordedHash && (ledgerHash === null || diskHash === ledgerHash);

    return {
      documentId: doc.id,
      title: doc.title,
      currentVersion: doc.currentVersion,
      fileFound,
      recalculatedHash: diskHash || 'FILE_UNREADABLE',
      registeredHash: recordedHash,
      ledgerHash: ledgerHash || 'NO_LEDGER_RECORD',
      blockIndex: ledgerRecord ? ledgerRecord.blockIndex : null,
      blockHash: ledgerRecord ? ledgerRecord.blockHash : null,
      previousHash: ledgerRecord ? ledgerRecord.previousHash : null,
      timestamp: ledgerRecord ? ledgerRecord.timestamp : doc.updatedAt,
      verified: isMatch,
      status: isMatch ? 'VERIFIED' : 'TAMPERED_COMPROMISED',
      tamperDetails: isMatch
        ? 'Document cryptographic signature matches ledger records perfectly. Zero bit alteration detected.'
        : 'DISCREPANCY DETECTED: Recalculated file hash does not match original registered ledger fingerprint!',
    };
  }

  /**
   * Validates the entire blockchain hash chain
   */
  async validateEntireChain() {
    await this.ensureGenesisBlock();

    const blocks = await prisma.integrityLedger.findMany({
      orderBy: { blockIndex: 'asc' },
    });

    let isValid = true;
    let corruptedIndex = null;
    let reason = '';

    for (let i = 1; i < blocks.length; i++) {
      const current = blocks[i];
      const previous = blocks[i - 1];

      // Check chaining link
      if (current.previousHash !== previous.blockHash) {
        isValid = false;
        corruptedIndex = current.blockIndex;
        reason = `Broken link at Block #${current.blockIndex}: previousHash mismatch.`;
        break;
      }

      // Check current block hash calculation
      const computedHash = calculateBlockHash(
        current.blockIndex,
        current.documentHash,
        current.previousHash,
        current.timestamp,
        current.validator
      );

      if (computedHash !== current.blockHash) {
        isValid = false;
        corruptedIndex = current.blockIndex;
        reason = `Hash recalculation mismatch at Block #${current.blockIndex}.`;
        break;
      }
    }

    return {
      isValid,
      totalBlocks: blocks.length,
      corruptedBlockIndex: corruptedIndex,
      message: isValid
        ? 'Cryptographic hash chain is 100% intact. All blocks validated against previous link.'
        : reason,
      validatedAt: new Date(),
    };
  }

  /**
   * Retrieves ledger blocks with pagination and search
   */
  async getLedgerBlocks(page = 1, limit = 20, search = '') {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { documentId: { contains: search } },
            { documentHash: { contains: search } },
            { blockHash: { contains: search } },
          ],
        }
      : {};

    const [total, blocks] = await Promise.all([
      prisma.integrityLedger.count({ where }),
      prisma.integrityLedger.findMany({
        where,
        orderBy: { blockIndex: 'desc' },
        skip,
        take: limit,
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
      }),
    ]);

    return {
      blocks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}

module.exports = new BlockchainService();
