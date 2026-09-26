// Automated Verification Test for NCRB Secure Document Management System (SIH26190)

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${endpoint}`);
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let postData = null;
    if (body) {
      postData = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('===============================================================');
  console.log('  STARTING AUTOMATED VERIFICATION: SIH26190 SYSTEM              ');
  console.log('===============================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const health = await apiRequest('/health');
    assert(health.status === 200 && health.data.status === 'OPERATIONAL', 'API Health Check returns OPERATIONAL');

    // 2. Authentication: Investigator Login
    const officerLogin = await apiRequest('/auth/login', 'POST', {
      email: 'officer@ncrb-demo.gov',
      password: 'Demo@2026',
    });
    assert(officerLogin.status === 200 && officerLogin.data.token, 'Investigating Officer successfully authenticates');
    const officerToken = officerLogin.data.token;

    // 3. Cases List
    const cases = await apiRequest('/cases', 'GET', null, officerToken);
    assert(cases.status === 200 && cases.data.cases.length >= 3, `Cases retrieved successfully (Found ${cases.data.cases.length})`);

    // 4. Create New Case
    const newCase = await apiRequest(
      '/cases',
      'POST',
      {
        title: 'Verifiable Dark Web Narcotics Syndicate',
        caseType: 'NARCOTICS',
        description: 'Automated test investigation into contraband shipments via encrypted messenger groups.',
        priority: 'CRITICAL',
        firNumber: 'FIR-2026-AUTOTEST-01',
      },
      officerToken
    );
    assert(newCase.status === 201 && newCase.data.case.id, `New Case initialized: ${newCase.data.case?.id}`);
    const testCaseId = newCase.data.case.id;

    // 5. Document List
    const docs = await apiRequest('/documents', 'GET', null, officerToken);
    assert(docs.status === 200 && docs.data.documents.length >= 5, `Documents retrieved (Found ${docs.data.documents.length})`);

    // 6. Verify Existing Document Integrity
    const sampleDocId = docs.data.documents[0].id;
    const verifyDoc = await apiRequest(`/documents/${sampleDocId}/verify`, 'POST', {}, officerToken);
    assert(
      verifyDoc.status === 200 && verifyDoc.data.result?.verified === true,
      `Document ${sampleDocId} SHA-256 integrity verified against Blockchain Ledger`
    );

    // 7. Digital Signature Flow
    const signDoc = await apiRequest(
      `/documents/${sampleDocId}/sign`,
      'POST',
      {
        reason: 'Automated test judicial attestation under Section 173 BNSS',
        signatureConfirmation: true,
      },
      officerToken
    );
    assert(signDoc.status === 200 && signDoc.data.signature?.id, `Digital signature affixed: ${signDoc.data.signature?.id}`);

    // 8. Blockchain Ledger Validation
    const chainValidation = await apiRequest('/integrity/validate-chain', 'POST', {}, officerToken);
    assert(
      chainValidation.status === 200 && chainValidation.data.isValid === true,
      `Entire Blockchain Hash Chain validated: 100% intact (${chainValidation.data.totalBlocks} blocks checked)`
    );

    // 9. AI Smart Search Test
    const aiSearch = await apiRequest(
      '/ai/search',
      'POST',
      { query: 'Show witness statements related to Case 102 uploaded in August' },
      officerToken
    );
    assert(
      aiSearch.status === 200 && aiSearch.data.interpretedQuery?.detectedCategory === 'WITNESS_STATEMENT',
      'AI Smart Search correctly interpreted NLP query category and parameters'
    );

    // 10. AI Document Summarizer & Entity Extractor
    const aiSum = await apiRequest(
      '/ai/summarize',
      'POST',
      {
        text: 'Complainant Priya Sen filed complaint under Section 74 and Section 318 BNS regarding extortion in New Delhi.',
        title: 'Deposition Test',
      },
      officerToken
    );
    assert(
      aiSum.status === 200 && aiSum.data.analysis?.entities?.sections?.length > 0,
      'AI Engine successfully extracted statutory BNS/IPC sections and entities'
    );

    // 11. RBAC & Access Request Security Enforcement
    // Ensure clean state for test document access request
    try {
      const { PrismaClient } = require('@prisma/client');
      const testPrisma = new PrismaClient();
      await testPrisma.accessRequest.deleteMany({
        where: { documentId: 'DOC-2026-000184' },
      });
      await testPrisma.$disconnect();
    } catch (e) {}

    // Login as Auditor
    const auditorLogin = await apiRequest('/auth/login', 'POST', {
      email: 'auditor@ncrb-demo.gov',
      password: 'Demo@2026',
    });
    const auditorToken = auditorLogin.data.token;

    // Auditor attempts to access restricted file DOC-2026-000184
    const restrictedDocId = 'DOC-2026-000184';
    const accessBlocked = await apiRequest(`/documents/${restrictedDocId}`, 'GET', null, auditorToken);
    assert(
      accessBlocked.status === 403 && accessBlocked.data.accessDenied === true,
      'RBAC Security Guard correctly blocked unauthorized access to RESTRICTED document'
    );

    // Auditor submits Access Request
    const accessReq = await apiRequest(
      '/access/request',
      'POST',
      {
        documentId: restrictedDocId,
        reason: 'Statutory compliance verification for judicial presentation',
      },
      auditorToken
    );
    assert(
      accessReq.status === 201 && accessReq.data.request?.id,
      `Access request successfully submitted (Request ID: ${accessReq.data.request?.id})`
    );
    const requestId = accessReq.data.request.id;

    // Reviewer logs in to approve request
    const reviewerLogin = await apiRequest('/auth/login', 'POST', {
      email: 'reviewer@ncrb-demo.gov',
      password: 'Demo@2026',
    });
    const reviewerToken = reviewerLogin.data.token;

    const approveReq = await apiRequest(
      `/access/requests/${requestId}`,
      'PATCH',
      {
        status: 'APPROVED',
        reviewRemarks: 'Clearance approved under Section 91 BNSS',
      },
      reviewerToken
    );
    assert(
      approveReq.status === 200 && approveReq.data.request?.status === 'APPROVED',
      'Reviewer successfully reviewed and APPROVED access request'
    );

    // Auditor now re-attempts access -> should be unlocked!
    const accessGranted = await apiRequest(`/documents/${restrictedDocId}`, 'GET', null, auditorToken);
    assert(
      accessGranted.status === 200 && accessGranted.data.document?.id === restrictedDocId,
      'Auditor can now access previously RESTRICTED document following supervisory approval'
    );

    // 12. Security Center Overview
    const secOverview = await apiRequest('/security/overview', 'GET', null, officerToken);
    assert(
      secOverview.status === 200 && secOverview.data.riskScore !== undefined,
      `Security Center threat assessment verified (Risk Score: ${secOverview.data.riskScore} / 100)`
    );

    // 13. Audit Trail Verification
    const auditLogs = await apiRequest('/audit', 'GET', null, officerToken);
    assert(
      auditLogs.status === 200 && auditLogs.data.logs.length > 5,
      `Immutable Audit Trail confirmed active (Found ${auditLogs.data.total} recorded operations)`
    );

    console.log('===============================================================');
    console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED     `);
    console.log('===============================================================');

    if (failed === 0) {
      console.log('✓ ALL SMART INDIA HACKATHON DEMONSTRATION REQUIREMENTS MET!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  }
}

runTests();
