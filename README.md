# NCRB Secure Digital Document Management System (SIH26190)

**Problem Statement ID:** SIH26190  
**Title:** Secure Digital Document Management System for Legal and Investigation Documents  
**Organization:** Ministry of Home Affairs, Government of India  
**Department:** National Crime Records Bureau (NCRB), Women Safety Division  
**Theme:** Blockchain & Cybersecurity  
**Category:** Software  

---

## 🛡️ Executive Summary
A production-grade, full-stack cybersecurity document management and chain-of-custody platform built for the **National Crime Records Bureau (NCRB)**, law-enforcement agencies, forensic laboratories, and judicial bodies.

The platform safeguards sensitive legal records, First Information Reports (FIRs), witness depositions, and forensic evidence using:
1. **FIPS 180-4 SHA-256 Cryptographic Fingerprinting** on every uploaded document.
2. **Tamper-Evident Blockchain-Style Hash Chain Ledger** where every block cryptographically chains `DocumentHash`, `PreviousBlockHash`, `CurrentBlockHash`, and `ValidatorNode`.
3. **Dynamic Integrity Recalculation**: On-demand file recalculation comparing disk binaries with the registered ledger.
4. **Digital Signature Workflow** simulating Class 3 PKI / DSC seals with signer role stamps and verifiable signature certificates.
5. **Multi-Tier Role-Based Access Control (RBAC)** across 5 roles: `Super Admin`, `Investigating Officer`, `Legal Officer`, `Reviewer`, and `Compliance Auditor`.
6. **Classified Document Clearance & Access Request System**: Users without clearance are blocked with an "Access Required" screen and can submit formal clearance requests that supervisors approve or reject.
7. **AI Document Intelligence**:
   - Natural Language Smart Search (e.g., *"Show witness statements related to Case 102 uploaded in August"*)
   - Extractive Summarizer & Legal Entity Extraction (detects BNS/IPC legal sections, suspects, locations, dates)
   - Automated Document Classification (FIR, Witness Statement, Forensic Report, Charge Sheet, Court Filing)
   - Behavioral Anomaly & Threat Detection
8. **Forensic Audit Trail**: Immutable-style activity log capturing every login, document view, download, digital signature, and security event with CSV export for court submission.
9. **Cybersecurity Center**: Dynamic Risk Score (0–100), brute-force account lockout protection, and threat mitigation.
10. **Official Form 65B / Section 63 BNSS Evidence Certificate Generation**.

---

## 🔑 Demo Login Credentials

All demo accounts share the universal password: **`Demo@2026`**  
*(Note: A **Quick Demo Switcher** is also embedded directly on the login portal and navigation header for 1-click evaluation by judges!)*

| Role | Official Email / ID | Default Password | Clearance & Capabilities |
| :--- | :--- | :--- | :--- |
| **Chief Super Admin** | `ganesh@ncrb-demo.gov` *(or `ganesh`)* | `Ganesh@2026` | Master Command Access: All cases, blockchain ledger, AI studio, threat center |
| **Super Admin** | `admin@ncrb-demo.gov` | `Demo@2026` | Complete oversight, user directory, system security configuration |
| **Investigating Officer** | `officer@ncrb-demo.gov` | `Demo@2026` | Case creation, FIR upload, evidence ingestion, document versioning |
| **Legal Officer** | `legal@ncrb-demo.gov` | `Demo@2026` | Case legal review, court filings, official digital signing |
| **Reviewer / Dy. SP** | `reviewer@ncrb-demo.gov` | `Demo@2026` | Supervisory review, triage & approve/reject access clearance requests |
| **Compliance Auditor** | `auditor@ncrb-demo.gov` | `Demo@2026` | Blockchain chain validation, immutable audit log explorer, CSV export |

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Startup
```powershell
# Navigate to backend directory
cd backend

# Install dependencies (Express, Prisma, Bcrypt, JWT, Helmet, Multer)
npm install

# Initialize SQLite database and seed demo cases, files, and blockchain ledger
npx prisma db push
node prisma/seed.js

# Start backend API server (runs on http://localhost:5000)
npm start
```

### 2. Frontend Setup & Startup
```powershell
# In a separate terminal, navigate to frontend directory
cd frontend

# Install dependencies (React, Vite, Tailwind CSS, Lucide Icons, Recharts)
npm install

# Start Vite dev server (runs on http://localhost:5173 with proxy to backend)
npm run dev
```

---

## ⛓️ How the Blockchain / Integrity Ledger Works

1. **SHA-256 Fingerprinting:**  
   When a document is uploaded, its binary stream is passed through Node's `crypto.createHash('sha256')`, producing an irreversible 64-character hexadecimal fingerprint (e.g. `9b88c42a...`).
2. **Hash Chaining:**  
   Each ledger block is appended to the chain using the formula:  
   $$\text{BlockHash} = \text{SHA256}(\text{BlockIndex} \parallel \text{DocumentHash} \parallel \text{PreviousBlockHash} \parallel \text{Timestamp} \parallel \text{ValidatorNode})$$  
   This ensures that any retrospective tampering with a past document or block invalidates all subsequent block hashes.
3. **Verification Engine:**  
   When "VERIFY INTEGRITY" is clicked, the backend reads the stored disk file, recalculates the SHA-256 hash in real time, and asserts equality against both the database record and the blockchain ledger block.
4. **Hyperledger Fabric Architecture Readiness:**  
   The `blockchain.service.js` module is decoupled behind a service interface, ready to swap the local simulated ledger with an RPC client connecting to Hyperledger Fabric chaincode or an Ethereum private network.

---

## 🤖 How the AI Intelligence Engine Works

1. **Natural Language Semantic Search:**  
   Interprets unstructured queries like *"Show witness statements related to Case 102 uploaded in August"*, isolating legal entity tokens, matching case IDs, filtering document classifications, and querying the database with weighted relevance.
2. **Statutory Entity Extractor:**  
   Parses legal texts to automatically extract references to the **Bharatiya Nyaya Sanhita (BNS)** (e.g., Sec 74, Sec 103, Sec 318), the **Bharatiya Nagarik Suraksha Sanhita (BNSS)**, the **Information Technology Act** (Sec 66C, 66D), as well as names of complainants, witnesses, accused, and territorial jurisdictions.
3. **Heuristic Document Classifier:**  
   Analyzes document lexical markers to classify raw files into legal categories (*FIR*, *Witness Statement*, *Forensic Report*, *Charge Sheet*, *Court Filing*).
4. **Behavioral Anomaly & Risk Detection:**  
   Evaluates access frequency, failed authentications, and unauthorized access attempts on classified files to dynamically calculate a 0–100 System Risk Score.
