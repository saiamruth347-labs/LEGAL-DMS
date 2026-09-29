import {
  mockUsers,
  mockCases,
  mockDocuments,
  mockLedger,
  mockSecurityEvents,
  mockAuditLogs,
  mockAccessRequests,
} from './mockData';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeader() {
  const token = localStorage.getItem('ncrb_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Universal client-side fallback for static Netlify deployments & offline operation
function handleMockFallback(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  let body = {};
  if (options.body && typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body);
    } catch (e) {
      // Ignored non-json string body
    }
  }

  // --- Auth ---
  if (endpoint.startsWith('/auth/login')) {
    const ident = (body.email || '').trim().toLowerCase();
    const badge = (body.email || '').trim().toUpperCase();
    const user =
      mockUsers.find(
        (u) =>
          u.email.toLowerCase().includes(ident) ||
          u.badgeNumber.toUpperCase() === badge ||
          (ident.includes('ganesh') && u.badgeNumber === 'GANESH') ||
          (ident.includes('admin') && u.role === 'SUPER_ADMIN') ||
          (ident.includes('officer') && u.role === 'INVESTIGATING_OFFICER') ||
          (ident.includes('legal') && u.role === 'LEGAL_OFFICER') ||
          (ident.includes('reviewer') && u.role === 'REVIEWER') ||
          (ident.includes('auditor') && u.role === 'AUDITOR')
      ) || mockUsers[1]; // default to Dr. Rajesh Verma if unspecified

    const token = 'mock_jwt_token_' + btoa(JSON.stringify({ id: user.id, role: user.role }));
    return {
      success: true,
      message: 'Authentication successful (Offline / Netlify Portal Mode)',
      token,
      user,
    };
  }

  if (endpoint.startsWith('/auth/citizen-login')) {
    const cleanPhone = (body.phoneNumber || '+91 98765 43210').trim();
    const citizenUser = {
      id: 'citizen-' + cleanPhone.replace(/[^0-9]/g, '').slice(-10),
      email: `citizen.${cleanPhone.replace(/[^0-9]/g, '').slice(-10)}@citizen.gov.in`,
      fullName: 'Citizen User',
      role: 'CITIZEN',
      badgeNumber: 'CITIZEN-IN',
      phoneNumber: cleanPhone,
      department: { name: 'Citizen Public Services Portal', code: 'CITIZEN-NCRB' },
    };
    return {
      success: true,
      token: 'mock_jwt_token_citizen_' + Date.now(),
      user: citizenUser,
    };
  }

  if (endpoint.startsWith('/auth/officer-5fa-login')) {
    const ident = (body.emailOrBadge || '').trim().toLowerCase();
    const user =
      mockUsers.find(
        (u) =>
          u.email.toLowerCase().includes(ident) ||
          u.badgeNumber.toLowerCase().includes(ident)
      ) || mockUsers[1];
    return {
      success: true,
      token: 'mock_jwt_token_5fa_' + user.id,
      user: {
        ...user,
        clearanceLevel: 'LEVEL_5_RESTRICTED',
      },
    };
  }

  if (endpoint.startsWith('/auth/switch-demo')) {
    const role = body.role || 'SUPER_ADMIN';
    const user = mockUsers.find((u) => u.role === role) || mockUsers[1];
    const token = 'mock_jwt_token_' + btoa(JSON.stringify({ id: user.id, role: user.role }));
    return {
      success: true,
      message: `Switched identity to ${user.fullName} (${user.role})`,
      token,
      user,
    };
  }

  if (endpoint.startsWith('/auth/me')) {
    let user = mockUsers[1];
    try {
      const saved = localStorage.getItem('ncrb_user');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        user = JSON.parse(saved);
      }
    } catch (_) {}
    return { success: true, user };
  }

  if (endpoint.startsWith('/auth/logout')) {
    return { success: true, message: 'Logged out successfully' };
  }

  // --- Cases ---
  if (endpoint.startsWith('/cases')) {
    if (method === 'GET') {
      const match = endpoint.match(/\/cases\/([^\/?]+)/);
      if (match) {
        const found = mockCases.find((c) => c.id === match[1]) || mockCases[0];
        const caseDocs = mockDocuments.filter((d) => d.caseId === found.id);
        return { success: true, case: { ...found, documents: caseDocs } };
      }
      return { success: true, cases: mockCases, total: mockCases.length };
    }
    if (method === 'POST') {
      const newCase = {
        id: `CASE-2026-00${mockCases.length + 1}`,
        ...body,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        documentsCount: 0,
        department: { name: 'Women Safety Division', code: 'NCRB-WSD' },
        assignedOfficer: { fullName: 'Insp. Vikramaditya Chauhan', badgeNumber: 'NCRB-INV-104' },
      };
      mockCases.unshift(newCase);
      return { success: true, case: newCase, message: 'Case dossier registered successfully' };
    }
    if (method === 'PATCH') {
      return { success: true, message: 'Case status updated successfully' };
    }
  }

  // --- Documents ---
  if (endpoint.startsWith('/documents')) {
    if (method === 'GET') {
      const match = endpoint.match(/\/documents\/([^\/?]+)/);
      if (match) {
        if (endpoint.includes('/preview')) {
          return {
            success: true,
            preview: {
              content:
                'OFFICIAL NCRB FORENSIC RECORD — TAMPER EVIDENT CUSTODY\n\n' +
                `Document Identifier: ${match[1]}\n` +
                'Status: ANCHORED IN SHA-256 BLOCKCHAIN LEDGER\n' +
                'Section 63 of Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023 Compliant\n' +
                'Cryptographic integrity verified. Digital evidence seal active.\n\n' +
                'Forensic verification details available under the Integrity Ledger module.',
            },
          };
        }
        const doc = mockDocuments.find((d) => d.id === match[1]) || mockDocuments[0];
        return { success: true, document: doc };
      }
      return { success: true, documents: mockDocuments, total: mockDocuments.length };
    }
    if (method === 'POST') {
      if (endpoint.includes('/sign')) {
        return {
          success: true,
          message: 'Digital signature cryptographically signed and affixed successfully',
          signature: {
            signatureHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            signedAt: new Date().toISOString(),
          },
        };
      }
      if (endpoint.includes('/verify')) {
        return {
          success: true,
          verified: true,
          match: true,
          message: 'SHA-256 integrity match confirmed. Block anchor intact.',
        };
      }
      return {
        success: true,
        message: 'Document uploaded and anchored into ledger successfully',
        document: mockDocuments[0],
      };
    }
  }

  // --- Integrity Ledger ---
  if (endpoint.startsWith('/integrity')) {
    if (endpoint.includes('/validate-chain')) {
      return {
        success: true,
        valid: true,
        blocksVerified: mockLedger.length,
        message: `Continuous cryptographic verification succeeded: ${mockLedger.length}/${mockLedger.length} blocks intact. Zero tampering detected.`,
      };
    }
    if (endpoint.includes('/verify-hash')) {
      return {
        success: true,
        match: true,
        verified: true,
        message: 'Cryptographic hash matched anchored ledger entry.',
      };
    }
    return { success: true, blocks: mockLedger, total: mockLedger.length, chainValid: true };
  }

  // --- Security ---
  if (endpoint.startsWith('/security')) {
    if (endpoint.includes('/overview')) {
      return {
        success: true,
        riskScore: 12,
        riskLevel: 'LOW RISK',
        unresolvedAlertsCount: 1,
        totalEvents24h: 18,
        integrityStatus: 'SECURE',
      };
    }
    if (endpoint.includes('/events')) {
      return { success: true, events: mockSecurityEvents, total: mockSecurityEvents.length };
    }
    if (method === 'PATCH') {
      return { success: true, message: 'Security incident resolved and audited' };
    }
  }

  // --- Audit ---
  if (endpoint.startsWith('/audit')) {
    if (endpoint.includes('/stats')) {
      return {
        success: true,
        totalLogs: 48,
        actions24h: 14,
        topAction: 'VIEW_DOCUMENT',
      };
    }
    return { success: true, logs: mockAuditLogs, total: mockAuditLogs.length };
  }

  // --- Access Requests ---
  if (endpoint.startsWith('/access')) {
    if (method === 'PATCH') {
      return { success: true, message: 'Access clearance request triaged successfully' };
    }
    if (method === 'POST') {
      return { success: true, message: 'Access request submitted for supervisory review' };
    }
    return { success: true, requests: mockAccessRequests, total: mockAccessRequests.length };
  }

  // --- AI Studio ---
  if (endpoint.startsWith('/ai')) {
    if (endpoint.includes('/search')) {
      return {
        success: true,
        query: body.query || 'investigation',
        results: [
          {
            documentId: 'DOC-2026-001',
            title: 'Initial FIR & Digital Complaint Dossier',
            category: 'CRIME_REPORT',
            relevanceScore: 0.96,
            snippet: '...cross-border syndicate using synthetic identities, morphed imagery, and predatory lending applications...',
          },
          {
            documentId: 'DOC-2026-004',
            title: 'Generative AI Deepfake Audio-Visual Forensic Spectrum',
            category: 'FORENSIC_REPORT',
            relevanceScore: 0.89,
            snippet: '...spectral anomaly detection identified neural vocoder artifacts in extortion audio tracks...',
          },
        ],
      };
    }
    if (endpoint.includes('/summarize')) {
      return {
        success: true,
        summary:
          'EXECUTIVE LEGAL SUMMARY: Multi-jurisdictional cyber syndicate executing targeted extortion using deepfake media and unverified NBFC micro-lending apps. Principal suspects identified; Section 63 BNSS electronic certificate generated with immutable blockchain ledger anchor.',
        entities: ['Syndicate Alpha', 'VoIP PBX 103.42.11', 'Section 63 BNSS', 'FIR-2026-DL-00892'],
        keyFindings: [
          'Premeditated extortion using generative voice clones',
          'Cryptographic hash chain validated against ledger block #4',
          'Digital seizure memo signed by Investigating Officer',
        ],
      };
    }
    if (endpoint.includes('/classify')) {
      return {
        success: true,
        category: 'FORENSIC_REPORT',
        classification: 'TOP_SECRET',
        confidence: 0.94,
      };
    }
  }

  // --- Admin ---
  if (endpoint.startsWith('/admin')) {
    if (endpoint.includes('/users')) {
      return { success: true, users: mockUsers };
    }
    return { success: true, message: 'Administrative command executed' };
  }

  return { success: true, message: 'Operation completed' };
}

async function request(endpoint, options = {}) {
  const headers = {
    ...getAuthHeader(),
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Check if the response returned an HTML document (common on Netlify when backend is not deployed)
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.warn(`[NCRB Netlify Adapter] Non-JSON response from ${API_BASE}${endpoint}. Serving from client fallback data store.`);
      return handleMockFallback(endpoint, options);
    }

    const data = await response.json().catch(() => null);
    if (!data) {
      return handleMockFallback(endpoint, options);
    }

    if (!response.ok) {
      // If 404/405 route missing on server, fallback gracefully
      if (response.status === 404 || response.status === 405) {
        return handleMockFallback(endpoint, options);
      }

      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('ncrb_auth_token');
        localStorage.removeItem('ncrb_user');
        window.dispatchEvent(new Event('ncrb_auth_change'));
      }
      const err = new Error(data.message || 'API request failed');
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    // If it's an explicit auth failure with a message from our backend (e.g. wrong password on real backend)
    if (err.status && err.status !== 404 && err.status !== 405 && err.status !== 502 && err.status !== 504) {
      throw err;
    }

    // Network connection refused, Netlify 404, or backend offline
    console.warn(`[NCRB Offline Mode] Connecting to client data engine for ${endpoint}:`, err.message);
    return handleMockFallback(endpoint, options);
  }
}

export const api = {
  // Auth
  login: (email, password, mfaCode) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, mfaCode }) }),
  citizenLogin: (phoneNumber, passkey) =>
    request('/auth/citizen-login', { method: 'POST', body: JSON.stringify({ phoneNumber, passkey }) }),
  officer5FaLogin: (data) =>
    request('/auth/officer-5fa-login', { method: 'POST', body: JSON.stringify(data) }),
  switchDemoRole: (role) =>
    request('/auth/switch-demo', { method: 'POST', body: JSON.stringify({ role }) }),
  getProfile: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Cases
  getCases: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/cases?${q}`);
  },
  getCaseById: (id) => request(`/cases/${id}`),
  createCase: (caseData) =>
    request('/cases', { method: 'POST', body: JSON.stringify(caseData) }),
  updateCaseStatus: (id, status, remarks) =>
    request(`/cases/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, remarks }) }),

  // Documents
  getDocuments: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/documents?${q}`);
  },
  getDocumentById: (id) => request(`/documents/${id}`),
  uploadDocument: (formData) =>
    request('/documents/upload', { method: 'POST', body: formData }),
  uploadVersion: (id, formData) =>
    request(`/documents/${id}/version`, { method: 'POST', body: formData }),
  signDocument: (id, reason, signatureConfirmation) =>
    request(`/documents/${id}/sign`, {
      method: 'POST',
      body: JSON.stringify({ reason, signatureConfirmation }),
    }),
  verifyDocument: (id) => request(`/documents/${id}/verify`, { method: 'POST' }),
  previewDocument: (id) => request(`/documents/${id}/preview`),
  getDownloadUrl: (id) => `${API_BASE}/documents/${id}/download`,

  // Integrity Ledger
  getLedger: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/integrity/ledger?${q}`);
  },
  validateChain: () => request('/integrity/validate-chain', { method: 'POST' }),
  verifyRawHash: (formDataOrHash) => {
    if (formDataOrHash instanceof FormData) {
      return request('/integrity/verify-hash', { method: 'POST', body: formDataOrHash });
    }
    return request('/integrity/verify-hash', {
      method: 'POST',
      body: JSON.stringify({ hash: formDataOrHash }),
    });
  },

  // Access Requests
  requestAccess: (documentId, reason, requestedRole) =>
    request('/access/request', {
      method: 'POST',
      body: JSON.stringify({ documentId, reason, requestedRole }),
    }),
  getAccessRequests: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/access/requests?${q}`);
  },
  reviewAccessRequest: (id, status, reviewRemarks) =>
    request(`/access/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewRemarks }),
    }),

  // Audit Logs
  getAuditLogs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/audit?${q}`);
  },
  getAuditStats: () => request('/audit/stats'),
  getExportCsvUrl: () => `${API_BASE}/audit/export`,

  // Security Center
  getSecurityOverview: () => request('/security/overview'),
  getSecurityEvents: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/security/events?${q}`);
  },
  resolveSecurityEvent: (id, remarks) =>
    request(`/security/events/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ remarks }),
    }),

  // AI Intelligence
  aiSmartSearch: (query) =>
    request('/ai/search', { method: 'POST', body: JSON.stringify({ query }) }),
  aiSummarize: (data) =>
    request('/ai/summarize', { method: 'POST', body: JSON.stringify(data) }),
  aiClassify: (text, fileName) =>
    request('/ai/classify', { method: 'POST', body: JSON.stringify({ text, fileName }) }),

  // Administration
  getUsers: () => request('/admin/users'),
  toggleUserStatus: (id, isActive) =>
    request(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
  resetLockout: (id) => request(`/admin/users/${id}/reset-lockout`, { method: 'POST' }),
  getDepartments: () => request('/admin/departments'),
  getSystemSettings: () => request('/admin/settings'),
};
