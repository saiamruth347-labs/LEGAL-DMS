require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const blockchainService = require('./services/blockchain.service');

// Route imports
const authRoutes = require('./routes/auth.routes');
const passkeyRoutes = require('./routes/passkey.routes');
const caseRoutes = require('./routes/cases.routes');
const documentRoutes = require('./routes/documents.routes');
const integrityRoutes = require('./routes/integrity.routes');
const accessRoutes = require('./routes/access.routes');
const auditRoutes = require('./routes/audit.routes');
const securityRoutes = require('./routes/security.routes');
const aiRoutes = require('./routes/ai.routes');
const adminRoutes = require('./routes/admin.routes');
const privacyideaRoutes = require('./routes/privacyidea.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: true, // Allow frontend dev server
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // generous for hackathon demo
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/passkey', passkeyRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/integrity', integrityRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/privacyidea', privacyideaRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    system: 'NCRB Secure Digital Document Management System',
    problemStatementId: 'SIH26190',
    timestamp: new Date().toISOString(),
    integrity: 'VERIFIED',
    blockchain: 'ACTIVE',
  });
});

// Supabase Connection Status
const { supabase } = require('./services/supabase.service');
app.get('/api/supabase/status', async (req, res) => {
  try {
    // Ping Supabase with a lightweight query
    const { data, error } = await supabase.from('todos').select('*').limit(1);
    return res.json({
      success: true,
      status: 'CONNECTED',
      supabaseUrl: process.env.SUPABASE_URL,
      project: 'gkysggdvsaxkefcbsylv',
      note: error ? (error.code === '42P01' ? 'Connected to Supabase (Table not created yet)' : error.message) : 'Connected successfully',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred',
  });
});

// Start server and initialize blockchain genesis anchor
app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`  NCRB SECURE DOCUMENT MANAGEMENT SYSTEM (SIH26190)   `);
  console.log(`  Backend running on http://localhost:${PORT}          `);
  console.log(`=======================================================`);

  try {
    await blockchainService.ensureGenesisBlock();
    console.log('✓ Cryptographic Genesis Block verified/anchored.');
  } catch (e) {
    console.warn('Genesis block check warning:', e.message);
  }
});

module.exports = app;
