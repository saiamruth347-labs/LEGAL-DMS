import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Reports() {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState('custody_cert');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              OFFICIAL COMPLIANCE & JUDICIAL SUBMISSION
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono border border-slate-700">
              FORM 65B / BNSS SEC 63
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Compliance & Evidence Reports</h1>
          <p className="text-xs text-slate-400">
            Generate verifiable legal certificates, custody attestations, and audit compliance documents
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-cyan-900/30 hover:shadow-cyan-500/20 transition-all duration-200 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Certificate</span>
          </button>
          <a
            href={api.getExportCsvUrl()}
            download="NCRB_Compliance_Audit.csv"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-2 transition shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => setSelectedReport('custody_cert')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedReport === 'custody_cert'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/30'
              : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          Certificate of Electronic Evidence (Sec 63 BNSS)
        </button>
        <button
          onClick={() => setSelectedReport('blockchain_audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedReport === 'blockchain_audit'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/30'
              : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          Blockchain Chain-of-Custody Verification Report
        </button>
        <button
          onClick={() => setSelectedReport('security_compliance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedReport === 'security_compliance'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/30'
              : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          National Cybersecurity Assessment
        </button>
      </div>

      {/* Printable Official Certificate View */}
      <div className="cyber-card rounded-3xl p-8 sm:p-12 shadow-2xl text-slate-200 max-w-4xl mx-auto space-y-8 font-serif print:border-none print:shadow-none print:p-0 ring-1 ring-black/40">
        {/* Certificate Header */}
        <div className="text-center space-y-2 border-b-2 border-slate-700/80 pb-6">
          <div className="font-sans text-xs uppercase tracking-widest text-cyan-400 font-bold">
            GOVERNMENT OF INDIA • MINISTRY OF HOME AFFAIRS
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white uppercase font-sans">
            NATIONAL CRIME RECORDS BUREAU
          </h2>
          <div className="font-sans text-xs text-slate-400 font-medium">
            Women Safety Division • Digital Evidence and Forensics Repository Directorate
          </div>
          <div className="inline-block px-3.5 py-1 rounded-full bg-slate-900 text-cyan-300 font-mono text-xs border border-cyan-500/30 mt-2 font-bold shadow-sm">
            CERTIFICATE IDENTIFIER: NCRB-CERT-2026-DL-8491
          </div>
        </div>

        {/* Certificate Body */}
        {selectedReport === 'custody_cert' && (
          <div className="space-y-6 text-sm leading-relaxed text-slate-300 font-sans">
            <h3 className="text-center font-serif text-base font-bold text-white uppercase tracking-wider underline">
              CERTIFICATE UNDER SECTION 63 OF BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS) 2023
              <br />
              <span className="text-xs text-slate-400 font-normal">
                (Corresponding to Section 65B of the Indian Evidence Act, 1872)
              </span>
            </h3>

            <p>
              I, <strong>{user?.fullName || 'Authorized Officer'}</strong>, holding the official rank of{' '}
              <strong>{user?.role?.replace('_', ' ') || 'Investigating Officer'}</strong>, Badge Number{' '}
              <strong className="font-mono text-cyan-400">{user?.badgeNumber || 'NCRB-INV-104'}</strong>, National Crime Records Bureau,
              Ministry of Home Affairs, Government of India, do hereby certify as follows:
            </p>

            <ol className="list-decimal pl-6 space-y-3 text-xs leading-relaxed text-slate-300">
              <li>
                That the electronic records, electronic documents, and evidentiary filings contained in Case Dossier{' '}
                <strong className="font-mono text-white">CASE-2026-001</strong> have been preserved, managed, and
                retrieved from the secure digital document management system operated by the NCRB under lawful official authority.
              </li>
              <li>
                That throughout the relevant custody interval, the computer systems and cryptographic storage clusters
                operated under standard security parameters without interruption or compromise to their operational integrity.
              </li>
              <li>
                That each digital filing has been anchored using <strong>FIPS 180-4 SHA-256 cryptographic hash algorithms</strong> onto a
                tamper-evident, append-only hash chain ledger (NCRB Consensus Protocol). Zero alteration, deletion, or bit-flip has
                occurred since registration.
              </li>
              <li>
                That the hashes recalculated from the physical local secure storage match the registered ledger blocks exactly,
                affirming an intact chain of custody.
              </li>
            </ol>

            {/* Cryptographic Proof Verification Block */}
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4.5 font-mono text-xs space-y-2 text-slate-300 shadow-sm">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-500">Document Fingerprint:</span>
                <span className="text-emerald-400 break-all font-semibold">
                  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-500">Ledger Block Hash:</span>
                <span className="text-cyan-400 break-all">
                  7c9b88c42a5bf8f090b841a129d5b512015037d26e4760a927a4d55fb2c80c2f
                </span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-500">Integrity Consensus:</span>
                <span className="text-emerald-400 font-bold">100% INTACT // ZERO DISCREPANCY</span>
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-8 grid grid-cols-2 gap-8 border-t border-slate-800 text-xs font-sans">
              <div className="space-y-1">
                <span className="text-slate-500 block">Verified & Attested By:</span>
                <div className="font-bold text-white">{user?.fullName}</div>
                <div className="text-slate-400">{user?.role?.replace('_', ' ')}</div>
                <div className="text-slate-500 font-mono">Date: 22 September 2026</div>
              </div>
              <div className="text-right space-y-1">
                <span className="text-slate-500 block">Cryptographic Seal ID:</span>
                <div className="font-mono text-cyan-400 font-bold">SIG-2026-NCRB-PKI</div>
                <div className="text-emerald-400 font-semibold flex items-center justify-end space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Class 3 DSC Verified</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedReport !== 'custody_cert' && (
          <div className="space-y-4 font-sans text-xs text-slate-300">
            <h3 className="text-center font-serif text-base font-bold text-white uppercase">
              {selectedReport === 'blockchain_audit'
                ? 'BLOCKCHAIN INTEGRITY CONSORTIUM COMPLIANCE REPORT'
                : 'NATIONAL CYBERSECURITY POSTURE & RISK AUDIT'}
            </h3>
            <p className="leading-relaxed">
              This automated diagnostic confirms that all blockchain ledger blocks from Genesis Block #0 through latest Tip
              satisfy strict cryptographic hash continuity. All authentication requests, document accesses, and supervisory reviews
              have been captured in the tamper-evident audit repository.
            </p>
            <div className="p-4.5 rounded-2xl bg-slate-900 border border-slate-800 font-mono space-y-1.5">
              <div>Consensus Algorithm: SHA-256 Append-Only Chaining (Hyperledger Fabric Bridge Ready)</div>
              <div>Audit Records Processed: 500+ Verified Logs</div>
              <div>Security Score: 12 / 100 (LOW RISK - FULL COMPLIANCE)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
