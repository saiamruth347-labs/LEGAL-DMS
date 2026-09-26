const fs = require('fs');
const path = require('path');
const { calculateFileSHA256 } = require('../utils/crypto');

class StorageService {
  constructor() {
    this.uploadDir = path.resolve(process.env.STORAGE_PATH || './uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Sanitizes filename and ensures no directory traversal
   */
  sanitizeFileName(fileName) {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  /**
   * Stores a file buffer securely on disk
   * @param {Buffer} buffer
   * @param {string} originalName
   * @param {string} prefix
   * @returns {Promise<{ filePath: string, fileName: string, size: number, hash: string }>}
   */
  async saveBuffer(buffer, originalName, prefix = 'doc') {
    const cleanName = this.sanitizeFileName(originalName);
    const uniqueName = `${prefix}_${Date.now()}_${cleanName}`;
    const destinationPath = path.join(this.uploadDir, uniqueName);

    // Prevent path traversal
    if (!destinationPath.startsWith(this.uploadDir)) {
      throw new Error('Path traversal attempt detected');
    }

    await fs.promises.writeFile(destinationPath, buffer);
    const hash = await calculateFileSHA256(destinationPath);
    const stat = await fs.promises.stat(destinationPath);

    return {
      filePath: destinationPath,
      fileName: uniqueName,
      size: stat.size,
      hash,
    };
  }

  /**
   * Moves a multer temp file to permanent secure storage
   * @param {Object} multerFile
   * @param {string} prefix
   */
  async storeMulterFile(multerFile, prefix = 'doc') {
    const cleanName = this.sanitizeFileName(multerFile.originalname);
    const uniqueName = `${prefix}_${Date.now()}_${cleanName}`;
    const destinationPath = path.join(this.uploadDir, uniqueName);

    if (!destinationPath.startsWith(this.uploadDir)) {
      throw new Error('Path traversal attempt detected');
    }

    await fs.promises.copyFile(multerFile.path, destinationPath);
    // Remove temp file
    try {
      await fs.promises.unlink(multerFile.path);
    } catch (e) {
      // Ignore cleanup error
    }

    const hash = await calculateFileSHA256(destinationPath);
    const stat = await fs.promises.stat(destinationPath);

    return {
      filePath: destinationPath,
      fileName: uniqueName,
      size: stat.size,
      hash,
    };
  }

  /**
   * Resolves the actual file path on disk, supporting relative paths and fallback to uploadDir
   * @param {string|Object} docOrPath - file path string or document object with filePath and fileName
   * @param {string} [fileName]
   * @returns {string}
   */
  resolveFilePath(docOrPath, fileName = null) {
    let filePath = typeof docOrPath === 'string' ? docOrPath : docOrPath?.filePath;
    const name = fileName || (typeof docOrPath === 'object' ? docOrPath?.fileName : null);

    if (filePath && fs.existsSync(filePath)) {
      return filePath;
    }

    if (name) {
      const fallback = path.join(this.uploadDir, name);
      if (fs.existsSync(fallback)) {
        return fallback;
      }
    }

    if (filePath) {
      const basenameFallback = path.join(this.uploadDir, path.basename(filePath));
      if (fs.existsSync(basenameFallback)) {
        return basenameFallback;
      }
    }

    return filePath;
  }

  /**
   * Returns a readable stream for a file
   */
  getStream(filePath) {
    const resolved = this.resolveFilePath(filePath);
    if (!fs.existsSync(resolved)) {
      throw new Error('File not found on secure storage');
    }
    return fs.createReadStream(resolved);
  }

  /**
   * Checks if file exists
   */
  exists(filePath) {
    return fs.existsSync(this.resolveFilePath(filePath));
  }
}

module.exports = new StorageService();
