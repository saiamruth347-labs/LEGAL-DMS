const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const prisma = new PrismaClient();

function calculateSHA256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function calculateBlockHash(blockIndex, documentHash, previousHash, timestamp, validator) {
  const payload = `${blockIndex}|${documentHash}|${previousHash}|${new Date(timestamp).toISOString()}|${validator}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

async function main() {
  console.log('--- Seeding NCRB Secure Digital Document Management System ---');

  const uploadDir = path.resolve(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Clear existing records in correct foreign key order
  await prisma.notification.deleteMany();
  await prisma.securityEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.digitalSignature.deleteMany();
  await prisma.integrityLedger.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.accessRequest.deleteMany();
  await prisma.document.deleteMany();
  await prisma.case.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // 1. Create Departments
  const deptWSD = await prisma.department.create({
    data: {
      name: 'Women Safety Division',
      code: 'NCRB-WSD',
      description: 'National Crime Records Bureau - Women Safety and Cyber Crime against Women Unit',
    },
  });

  const deptCyber = await prisma.department.create({
    data: {
      name: 'Cyber Crime Investigation Cell',
      code: 'CYBER-CELL',
      description: 'Specialized unit for cyber forensics, data exfiltration, and extortion investigations',
    },
  });

  const deptFSL = await prisma.department.create({
    data: {
      name: 'Forensic Science Division',
      code: 'FSL-DELHI',
      description: 'Central Forensic Science Laboratory - Digital Evidence and Ballistics Verification',
    },
  });

  const deptLegal = await prisma.department.create({
    data: {
      name: 'Prosecution & Legal Advisory Directorate',
      code: 'LEGAL-PROS',
      description: 'State Prosecution Directorate handling charge sheets, bail hearings, and court filings',
    },
  });

  console.log('✓ Departments created');

  // 2. Create Users
  const defaultPasswordHash = await bcrypt.hash('Demo@2026', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@ncrb-demo.gov',
      fullName: 'Dr. Rajesh Verma',
      badgeNumber: 'NCRB-ADM-001',
      role: 'SUPER_ADMIN',
      passwordHash: defaultPasswordHash,
      departmentId: deptWSD.id,
    },
  });

  const officerUser = await prisma.user.create({
    data: {
      email: 'officer@ncrb-demo.gov',
      fullName: 'Insp. Vikram Rathore',
      badgeNumber: 'NCRB-INV-104',
      role: 'INVESTIGATING_OFFICER',
      passwordHash: defaultPasswordHash,
      departmentId: deptWSD.id,
    },
  });

  const legalUser = await prisma.user.create({
    data: {
      email: 'legal@ncrb-demo.gov',
      fullName: 'Adv. Meera Sen',
      badgeNumber: 'NCRB-LEG-202',
      role: 'LEGAL_OFFICER',
      passwordHash: defaultPasswordHash,
      departmentId: deptLegal.id,
    },
  });

  const reviewerUser = await prisma.user.create({
    data: {
      email: 'reviewer@ncrb-demo.gov',
      fullName: 'Dy. SP Anita Deshmukh',
      badgeNumber: 'NCRB-REV-305',
      role: 'REVIEWER',
      passwordHash: defaultPasswordHash,
      departmentId: deptCyber.id,
    },
  });

  const auditorUser = await prisma.user.create({
    data: {
      email: 'auditor@ncrb-demo.gov',
      fullName: 'Auditor R. K. Iyer',
      badgeNumber: 'NCRB-AUD-401',
      role: 'AUDITOR',
      passwordHash: defaultPasswordHash,
      departmentId: deptWSD.id,
    },
  });

  console.log('✓ Users created with password: Demo@2026');

  // 3. Create Sample Cases
  const case1 = await prisma.case.create({
    data: {
      id: 'CASE-2026-001',
      title: 'Inter-State Online Financial Syndicate & Cyber Harassment',
      caseType: 'WOMEN_SAFETY',
      description:
        'Investigation into an organized cross-border racket targeting female entrepreneurs with predatory loan apps, morphed imagery, and extortion calls.',
      priority: 'CRITICAL',
      status: 'UNDER_INVESTIGATION',
      firNumber: 'FIR-2026-DL-00892',
      incidentDate: new Date('2026-08-12T10:00:00Z'),
      createdById: officerUser.id,
      assignedOfficerId: officerUser.id,
      departmentId: deptWSD.id,
    },
  });

  const case2 = await prisma.case.create({
    data: {
      id: 'CASE-2026-002',
      title: 'Deepfake Audio-Video Impersonation and Extortion',
      caseType: 'CYBER_CRIME',
      description:
        'Syndicate deploying generative artificial intelligence voice clones to deceive senior bank executives and defame judicial officials.',
      priority: 'HIGH',
      status: 'LEGAL_REVIEW',
      firNumber: 'FIR-2026-MH-00412',
      incidentDate: new Date('2026-08-20T14:30:00Z'),
      createdById: officerUser.id,
      assignedOfficerId: officerUser.id,
      departmentId: deptCyber.id,
    },
  });

  const case3 = await prisma.case.create({
    data: {
      id: 'CASE-2026-003',
      title: 'Corporate Data Exfiltration & Insider Sabotage',
      caseType: 'FINANCIAL_FRAUD',
      description:
        'Unauthorized unauthorized exfiltration of proprietary transaction records and encrypted credential leaks from critical financial infrastructure.',
      priority: 'MEDIUM',
      status: 'COURT_SUBMITTED',
      firNumber: 'FIR-2026-KA-00175',
      incidentDate: new Date('2026-07-28T09:15:00Z'),
      createdById: officerUser.id,
      assignedOfficerId: officerUser.id,
      departmentId: deptWSD.id,
    },
  });

  console.log('✓ Cases initialized');

  // 4. Initialize Blockchain Genesis Block
  const genesisTimestamp = new Date('2026-01-01T00:00:00.000Z');
  const genesisBlockHash = calculateBlockHash(
    0,
    '0'.repeat(64),
    '0'.repeat(64),
    genesisTimestamp,
    'NCRB-GENESIS-ANCHOR-00'
  );

  let currentBlockIndex = 0;
  let previousBlockHash = genesisBlockHash;

  await prisma.integrityLedger.create({
    data: {
      blockIndex: 0,
      documentId: null,
      documentHash: '0'.repeat(64),
      previousHash: '0'.repeat(64),
      blockHash: genesisBlockHash,
      timestamp: genesisTimestamp,
      validator: 'NCRB-GENESIS-ANCHOR-00',
      status: 'VERIFIED',
      merkleRoot: genesisBlockHash,
      notes: 'GENESIS_BLOCK: National Crime Records Bureau Digital Custody Ledger Established',
    },
  });

  // Helper to create document and anchor to ledger
  async function seedDocument({
    id,
    caseId,
    title,
    fileName,
    category,
    classification,
    content,
    uploadedBy,
    date,
    signedBy = null,
  }) {
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, content, 'utf8');
    const hash = calculateSHA256(content);
    const stat = fs.statSync(filePath);

    // Create Document
    const doc = await prisma.document.create({
      data: {
        id,
        caseId,
        title,
        fileName,
        filePath,
        mimeType: 'text/plain',
        fileSize: stat.size,
        category,
        classification,
        currentHash: hash,
        currentVersion: '1.0',
        uploadedById: uploadedBy.id,
        createdAt: new Date(date),
        updatedAt: new Date(date),
        summary: `Verified official legal custody record for ${title} under ${caseId}. Anchored with cryptographic hash on NCRB ledger.`,
        extractedEntities: JSON.stringify({
          sections: ['BNS Sec 74', 'IT Act Sec 66D', 'BNSS Sec 173'],
          people: ['Insp. Vikram Rathore', 'Complainant Priya Sen', 'Suspect Karan Malhotra'],
          locations: ['NCR Cyber Cell New Delhi', 'Dwarka Sector 14'],
          dates: [date],
        }),
      },
    });

    // Create Version 1.0
    await prisma.documentVersion.create({
      data: {
        documentId: id,
        versionNumber: '1.0',
        filePath,
        fileHash: hash,
        fileSize: stat.size,
        changeDescription: 'Initial verified evidentiary submission',
        createdById: uploadedBy.id,
        createdAt: new Date(date),
      },
    });

    // Anchor to Blockchain Ledger
    currentBlockIndex++;
    const blockTime = new Date(new Date(date).getTime() + 1000 * 60 * 2);
    const blockHash = calculateBlockHash(
      currentBlockIndex,
      hash,
      previousBlockHash,
      blockTime,
      `NCRB-NODE-${uploadedBy.badgeNumber}`
    );

    await prisma.integrityLedger.create({
      data: {
        blockIndex: currentBlockIndex,
        documentId: id,
        documentHash: hash,
        previousHash: previousBlockHash,
        blockHash,
        timestamp: blockTime,
        validator: `NCRB-NODE-${uploadedBy.badgeNumber}`,
        status: 'VERIFIED',
        merkleRoot: blockHash,
        notes: `Document registration: ${id} (${title})`,
      },
    });

    previousBlockHash = blockHash;

    // Digital Signature if requested
    if (signedBy) {
      const sigId = `SIG-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      await prisma.digitalSignature.create({
        data: {
          id: sigId,
          documentId: id,
          signerUserId: signedBy.id,
          signerName: signedBy.fullName,
          signerRole: signedBy.role,
          signatureHash: calculateSHA256(`${sigId}:${hash}:${signedBy.id}`),
          signatureReason: 'Certified authentic for submission before the Learned Special Judge',
          certificateInfo: JSON.stringify({
            issuer: 'NCRB Sub-CA',
            keyLength: '2048-bit',
            algorithm: 'SHA256withRSA',
          }),
          timestamp: new Date(new Date(date).getTime() + 1000 * 60 * 15),
          isValid: true,
        },
      });
    }

    return doc;
  }

  // 5. Create Sample Documents
  const doc1 = await seedDocument({
    id: 'DOC-2026-000181',
    caseId: case1.id,
    title: 'First Information Report (FIR No. DL-00892/2026)',
    fileName: 'FIR_DL_00892_2026_Certified.txt',
    category: 'FIR',
    classification: 'INTERNAL',
    content: `GOVERNMENT OF INDIA - MINISTRY OF HOME AFFAIRS
NATIONAL CRIME RECORDS BUREAU (WOMEN SAFETY DIVISION)
FIRST INFORMATION REPORT (Under Section 173 BNSS / 154 CrPC)

FIR Number: FIR-2026-DL-00892
Police Station: NCR Cyber Crime Cell, Dwarka District, New Delhi
Date & Time of Occurrence: 12 August 2026, 09:30 AM IST
Date & Time Reported: 12 August 2026, 11:45 AM IST

COMPLAINANT DETAILS:
Name: Ms. Priya Sen, Age: 29
Occupation: Proprietor, Sen Crafts Enterprise
Address: Sector 14, Dwarka, New Delhi

ACCUSED DETAILS:
Unknown administrators of illicit instant-loan mobile application "RupeeInstant247"
Syndicate operating multiple VoIP phone lines originating from overseas proxies.

ACTS & SECTIONS:
- Bharatiya Nyaya Sanhita (BNS) 2023: Section 318(4) (Cheating and dishonestly inducing delivery of property)
- Bharatiya Nyaya Sanhita (BNS) 2023: Section 74 (Assault or use of criminal force to woman with intent to outrage her modesty)
- Information Technology Act 2000: Section 66C & 66D (Identity theft and cheating by personation)

BRIEF FACTS OF COMPLAINT:
Complainant states she downloaded the app upon receiving unsolicited SMS. Application demanded invasive device permissions including photo gallery and contact list access. Within 48 hours, altered morphed photographs were transmitted to family contacts along with extortion demands for INR 3,50,000.

Investigating Officer: Insp. Vikram Rathore (Badge: NCRB-INV-104)
Digital Custody Anchor: SHA-256 Registered`,
    uploadedBy: officerUser,
    date: '2026-08-12T12:00:00Z',
    signedBy: officerUser,
  });

  const doc2 = await seedDocument({
    id: 'DOC-2026-000182',
    caseId: case1.id,
    title: 'Sworn Witness Deposition of Bank Manager S. K. Nambiar',
    fileName: 'Witness_Statement_SK_Nambiar.txt',
    category: 'WITNESS_STATEMENT',
    classification: 'CONFIDENTIAL',
    content: `CENTRAL POLICE INVESTIGATION RECORD
DEPOSITION UNDER SECTION 180 BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS)

Statement of Shri S. K. Nambiar, Branch Manager, State Apex Bank, Connaught Place Branch.
Recorded on 14 August 2026 by Insp. Vikram Rathore in Case CASE-2026-001.

STATEMENT:
"I am producing official server transaction logs regarding mule account #40918230018 maintained in the name of M/s Delta Horizon Logistics. Between August 10 and August 13, 2026, over 42 Micro-UPI deposits totaling INR 18.4 Lakhs were received and immediately transferred via RTGS to an offshore wallet gateway. Account frozen upon receipt of Section 91 notice."

Verification: Statement voluntarily made without coercion.
Deponent Signature Verified.`,
    uploadedBy: officerUser,
    date: '2026-08-14T15:30:00Z',
  });

  const doc3 = await seedDocument({
    id: 'DOC-2026-000183',
    caseId: case1.id,
    title: 'Digital Forensic Extraction & IMEI Analysis Report',
    fileName: 'FSL_Digital_Forensics_Report_IMEI.txt',
    category: 'FORENSIC_REPORT',
    classification: 'HIGHLY_CONFIDENTIAL',
    content: `CENTRAL FORENSIC SCIENCE LABORATORY (CFSL)
DIRECTORATE OF FORENSIC SCIENCE SERVICES, MHA
CYBER FORENSICS & REVERSE ENGINEERING DIVISION

EXAMINATION REPORT NO: CFSL-DL-2026-CY-941
Reference: Request from NCRB WSD in FIR-2026-DL-00892

EVIDENCE RECEIVED:
Item 1: 01 Samsung Galaxy S24 Ultra (Gold), IMEI: 359182049182740 (Tamper-seal intact)
Item 2: 01 SanDisk Extreme 256GB MicroSD Card

LABORATORY FINDINGS:
1. Extraction of APK 'RupeeInstant247.apk' reveals hardcoded command & control (C2) server IP addresses routing to 185.220.101.42.
2. Background service silently uploaded 1,482 image thumbnails to an encrypted Telegram bot channel without user consent.
3. Metadata logs matched complainant's contact synchronization events.

CONCLUSION: Malicious spyware behavior confirmed beyond reasonable doubt.
Forensic Analyst: Dr. A. K. Sundaram, Senior Scientific Officer`,
    uploadedBy: officerUser,
    date: '2026-08-18T11:00:00Z',
    signedBy: legalUser,
  });

  const doc4 = await seedDocument({
    id: 'DOC-2026-000184',
    caseId: case1.id,
    title: 'Secret Intercept & Offshore Informant Intelligence Wire',
    fileName: 'RESTRICTED_Wiretap_Intelligence_Brief.txt',
    category: 'INVESTIGATION_RECORD',
    classification: 'RESTRICTED',
    content: `SECRET // LAW ENFORCEMENT RESTRICTED EYES ONLY
NATIONAL CRIME RECORDS BUREAU & SPECIAL OPERATIONS GROUP

SUBJECT: INTERCEPTED COMMUNICATIONS OF PRIMARY KINGPIN
CLEARANCE REQUIRED: RESTRICTED ACCESS AUTHORIZATION ONLY

OPERATIONAL BRIEFING:
Target identifier 'Hydra-9' intercepted communicating with overseas coordinator regarding laundering proceeds across decentralized crypto exchanges. Three domestic bank accounts in Mumbai and Kolkata targeted for coordinated dawn raids on 15 September 2026.

ANY UNAUTHORIZED DISCLOSURE JEOPARDIZES WITNESS SAFETY AND STATE SECURITY PROTOCOLS.
Access strictly monitored under Section 69 Information Technology Act.`,
    uploadedBy: officerUser,
    date: '2026-08-25T08:00:00Z',
  });

  const doc5 = await seedDocument({
    id: 'DOC-2026-000185',
    caseId: case2.id,
    title: 'Deepfake Video Spectrographic Analysis Report',
    fileName: 'Spectrographic_Deepfake_Analysis.txt',
    category: 'FORENSIC_REPORT',
    classification: 'CONFIDENTIAL',
    content: `NATIONAL FORENSIC CYBER WING
REPORT ON SYNTHETIC AUDIO-VISUAL MEDIA VERIFICATION

CASE: CASE-2026-002 (Deepfake Audio-Video Impersonation)
MEDIA ANALYZED: 42-second MP4 file circulated on social messaging applications.

SPECTROGRAPHIC FINDINGS:
- Facial landmark jitter score: 0.88 (Artificial boundary blending identified)
- Audio spectral discontinuity at 4.2 kHz indicates neural voice synthesis (RVC/DiffSinger artifact)
- Video frame rate inconsistency at frames 240-360 indicates spliced generative frames.

VERDICT: Spliced AI-generated deepfake media designed for defamation.`,
    uploadedBy: officerUser,
    date: '2026-08-28T16:00:00Z',
    signedBy: legalUser,
  });

  console.log('✓ Sample Documents & Blockchain Blocks seeded');

  // 6. Create realistic sample Audit Logs
  const auditEntries = [
    {
      action: 'LOGIN',
      userId: adminUser.id,
      userName: adminUser.fullName,
      userRole: adminUser.role,
      resourceType: 'AUTH',
      status: 'SUCCESS',
      details: 'Super Admin login session initialized from Headquarters console',
      timestamp: new Date('2026-09-07T08:30:00Z'),
    },
    {
      action: 'LOGIN',
      userId: officerUser.id,
      userName: officerUser.fullName,
      userRole: officerUser.role,
      resourceType: 'AUTH',
      status: 'SUCCESS',
      details: 'Investigating Officer session started (Biometric + Token)',
      timestamp: new Date('2026-09-07T09:00:00Z'),
    },
    {
      action: 'DOCUMENT_UPLOAD',
      userId: officerUser.id,
      userName: officerUser.fullName,
      userRole: officerUser.role,
      resourceType: 'DOCUMENT',
      resourceId: doc1.id,
      status: 'SUCCESS',
      details: 'FIR DL-00892 uploaded and registered on blockchain block #1',
      timestamp: new Date('2026-08-12T12:00:00Z'),
    },
    {
      action: 'DIGITAL_SIGN',
      userId: officerUser.id,
      userName: officerUser.fullName,
      userRole: officerUser.role,
      resourceType: 'DOCUMENT',
      resourceId: doc1.id,
      status: 'SUCCESS',
      details: 'Digital signature SIG-2026-001 appended to FIR',
      timestamp: new Date('2026-08-12T12:15:00Z'),
    },
    {
      action: 'INTEGRITY_VERIFY',
      userId: auditorUser.id,
      userName: auditorUser.fullName,
      userRole: auditorUser.role,
      resourceType: 'DOCUMENT',
      resourceId: doc1.id,
      status: 'SUCCESS',
      details: 'Auditor verified document SHA-256 matches blockchain ledger perfectly',
      timestamp: new Date('2026-09-06T14:10:00Z'),
    },
    {
      action: 'DOCUMENT_ACCESS_DENIED',
      userId: auditorUser.id,
      userName: auditorUser.fullName,
      userRole: auditorUser.role,
      resourceType: 'DOCUMENT',
      resourceId: doc4.id,
      status: 'DENIED',
      details: 'Access blocked for RESTRICTED wiretap briefing (Security clearance required)',
      timestamp: new Date('2026-09-07T10:15:00Z'),
    },
  ];

  for (const entry of auditEntries) {
    await prisma.auditLog.create({
      data: {
        ...entry,
        ipAddress: '10.24.18.92',
        userAgent: 'NCRB-SecureBrowser/4.2 (Windows 11 Enterprise)',
      },
    });
  }

  console.log('✓ Audit logs seeded');

  // 7. Create Sample Security Events
  await prisma.securityEvent.create({
    data: {
      eventType: 'FAILED_LOGIN',
      severity: 'LOW',
      description: 'Single failed login attempt recorded for badge NCRB-AUD-401 (Incorrect password)',
      userId: auditorUser.id,
      userName: auditorUser.fullName,
      ipAddress: '192.168.1.104',
      timestamp: new Date('2026-09-07T07:45:00Z'),
      resolved: true,
      resolvedAt: new Date('2026-09-07T08:00:00Z'),
      metadata: JSON.stringify({ reason: 'Typo by user, subsequent login succeeded' }),
    },
  });

  await prisma.securityEvent.create({
    data: {
      eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      severity: 'HIGH',
      description: `User Auditor R. K. Iyer attempted access to RESTRICTED file ${doc4.id} without prior clearance.`,
      userId: auditorUser.id,
      userName: auditorUser.fullName,
      ipAddress: '10.24.18.92',
      timestamp: new Date('2026-09-07T10:15:00Z'),
      resolved: false,
    },
  });

  console.log('✓ Security events seeded');

  // 8. Create Sample Pending Access Request
  await prisma.accessRequest.create({
    data: {
      documentId: doc4.id,
      caseId: case1.id,
      requesterUserId: legalUser.id,
      requestedRole: 'LEGAL_OFFICER',
      reason: 'Required for drafting ex-parte seizure warrant under Section 94 BNSS before Judicial Magistrate.',
      status: 'PENDING',
      createdAt: new Date('2026-09-07T11:00:00Z'),
    },
  });

  console.log('✓ Sample access request seeded');

  // 9. Notifications
  await prisma.notification.create({
    data: {
      userId: reviewerUser.id,
      title: 'New Access Request Pending',
      message: 'Adv. Meera Sen has requested clearance for RESTRICTED document DOC-2026-000184.',
      type: 'ACCESS',
      isRead: false,
      linkUrl: '/access-requests',
    },
  });

  await prisma.notification.create({
    data: {
      userId: officerUser.id,
      title: 'Chain-of-Custody Verified',
      message: 'All 5 ledger blocks confirmed intact across NCRB network nodes.',
      type: 'SUCCESS',
      isRead: true,
      linkUrl: '/integrity',
    },
  });

  console.log('✓ Notifications seeded');
  console.log('--- SEED COMPLETED SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
