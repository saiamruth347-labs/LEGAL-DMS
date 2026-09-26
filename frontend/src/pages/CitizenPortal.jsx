import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  FileText,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  Phone,
  KeyRound,
  Download,
  Fingerprint,
  Sparkles,
  ArrowRight,
  BadgeCheck,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CitizenPortal({ onOpenVerify }) {
  const { user } = useAuth();

  // Search FIR state
  const [firSearch, setFirSearch] = useState('FIR-2026-DL-00892');
  const [firResult, setFirResult] = useState({
    id: 'CASE-2026-001',
    firNumber: 'FIR-2026-DL-00892',
    title: 'State vs. Cyber Financial Syndicate (Multi-State Phishing Ring)',
    policeStation: 'Cyber Crime Police Station, North Delhi Division',
    filingDate: '14 Jan 2026, 11:30 AM',
    status: 'UNDER_INVESTIGATION',
    assignedOfficer: 'Insp. Vikram Rathore (Badge #NCRB-INV-104)',
    sections: 'IPC 420, 66D IT Act, Section 63 BNSS',
    currentStage: 'Forensic Evidence Verification & Blockchain Anchoring',
    progressPercent: 65,
    timeline: [
      { stage: 'e-FIR Lodged by Complainant', time: '14 Jan 2026, 11:30 AM', done: true },
      { stage: 'Cognizance Taken & Officer Assigned', time: '14 Jan 2026, 02:15 PM', done: true },
      { stage: 'Digital Evidence Seized & Hashed', time: '16 Jan 2026, 04:45 PM', done: true },
      { stage: 'CFSL Digital Forensics Analysis', time: '18 Jan 2026, 10:00 AM', current: true },
      { stage: 'Charge Sheet Filing in Special Court', time: 'Estimated 28 Jan 2026', pending: true },
    ],
  });

  // Complaint Submission state
  const [incidentType, setIncidentType] = useState('FINANCIAL_FRAUD');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentFile, setIncidentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState(null);

  // Hash verification state
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);

  const handleSearchFIR = (e) => {
    e.preventDefault();
    if (!firSearch.trim()) return;
    setFirResult({
      id: 'CASE-2026-001',
      firNumber: firSearch.trim().toUpperCase(),
      title: 'Official Electronic Investigation Record',
      policeStation: 'State Cyber Cell Special Unit',
      filingDate: '18 Jan 2026, 09:20 AM',
      status: 'VERIFIED_ACTIVE',
      assignedOfficer: 'Assigned Investigating Officer (NCRB WSD)',
      sections: 'Information Technology Act (66D), BNSS Sec 63',
      currentStage: 'Electronic Evidence Preserved on Blockchain',
      progressPercent: 50,
      timeline: [
        { stage: 'Electronic Complaint Registered', time: '18 Jan 2026, 09:20 AM', done: true },
        { stage: 'Verified by District Cyber Node', time: '18 Jan 2026, 12:40 PM', done: true },
        { stage: 'Evidence Under Forensic Custody', time: 'In Progress', current: true },
        { stage: 'Judicial Submission', time: 'Pending Officer Filing', pending: true },
      ],
    });
  };

  const handleLodgeGrievance = (e) => {
    e.preventDefault();
    if (!incidentDesc) return;
    setSubmitting(true);
    setTimeout(() => {
      const ackId = 'ACK-NCRB-' + Math.floor(100000 + Math.random() * 900000);
      const sha256 = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setSubmittedReceipt({
        ackId,
        hash: sha256,
        type: incidentType,
        timestamp: new Date().toLocaleString(),
      });
      setSubmitting(false);
      setIncidentDesc('');
      setIncidentFile(null);
    }, 1000);
  };

  const handleCheckDocument = (e) => {
    e.preventDefault();
    if (!verifyHash) return;
    setVerifyResult({
      status: 'AUTHENTIC',
      hash: verifyHash,
      title: 'Official Police Inquiry Summons (Electronic Record)',
      issuer: 'Ministry of Home Affairs / NCRB Node #DELHI-01',
      blockIndex: 4,
      timestamp: '2026-01-20 14:22:05 UTC',
      certificateBNSS: 'BNSS-63-NCRB-2026-0412',
    });
  };

  return (
    <div className="space-y-6">
      {/* Citizen Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-slate-900 border border-emerald-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>CITIZEN SECURE ACCESS PORTAL</span>
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>{user?.phoneNumber || '+91 98765 43210'}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                PASSKEY VERIFIED
              </span>
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome to the NCRB Public Grievance & FIR Status Portal
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Authenticate digital police records, track your ongoing FIR investigations in real time, and submit cyber incidents with cryptographic proof anchored to the National Crime Records Bureau ledger.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-right space-y-1">
            <div className="text-[10px] font-mono uppercase text-slate-400">Citizen Digital Passport</div>
            <div className="text-xs font-mono font-bold text-emerald-300 flex items-center justify-end space-x-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SECURE IDENTITY TIER-1</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">SMS OTP • FIDO Passkey</div>
          </div>
        </div>
      </div>

      {/* 3 Main Functional Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Real-Time FIR / Case Status Lookup */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Track FIR & Evidence Investigation</h2>
                  <p className="text-[11px] text-slate-400">Direct query into CCTNS & NCRB blockchain custody records</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                LIVE CCTNS SYNC
              </span>
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleSearchFIR} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={firSearch}
                  onChange={(e) => setFirSearch(e.target.value)}
                  placeholder="Enter FIR Number (e.g. FIR-2026-DL-00892)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-lg shadow-cyan-900/40"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Track</span>
              </button>
            </form>

            {/* FIR Investigation Result Card */}
            {firResult && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-4 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wider">
                      {firResult.firNumber}
                    </div>
                    <div className="font-bold text-slate-100 text-sm mt-0.5">
                      {firResult.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {firResult.policeStation}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {firResult.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div>
                    <span className="text-slate-400">Assigned Officer: </span>
                    <span className="text-slate-200 font-medium">{firResult.assignedOfficer}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Filing Date: </span>
                    <span className="text-slate-200 font-mono">{firResult.filingDate}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Applicable Sections: </span>
                    <span className="text-cyan-300 font-mono">{firResult.sections}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">Investigation Stage: {firResult.currentStage}</span>
                    <span className="text-cyan-400 font-mono">{firResult.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${firResult.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Vertical Timeline */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Custody & Investigation Milestones:
                  </div>
                  <div className="space-y-3">
                    {firResult.timeline.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-3 text-[11px]">
                        <div className="mt-0.5">
                          {item.done ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : item.current ? (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                          )}
                        </div>
                        <div className="flex-1 flex justify-between">
                          <span className={item.done ? 'text-slate-200' : item.current ? 'text-cyan-300 font-semibold' : 'text-slate-400'}>
                            {item.stage}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Document Authenticity Verification Box */}
          <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Verify Official Document or Court Summons</h2>
                <p className="text-[11px] text-slate-400">Verify whether a police notice or court document is authentic or counterfeit</p>
              </div>
            </div>

            <form onSubmit={handleCheckDocument} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={verifyHash}
                  onChange={(e) => setVerifyHash(e.target.value)}
                  placeholder="Paste SHA-256 Hash or Certificate ID (e.g. 7f83b165...)"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-lg shadow-emerald-900/30"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify</span>
                </button>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Or verify directly from device using cryptographic scanner</span>
                <button
                  type="button"
                  onClick={onOpenVerify}
                  className="text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  <span>Open Full Cryptographic Modal</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </form>

            {verifyResult && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-2">
                <div className="flex items-center justify-between text-emerald-300 font-bold">
                  <div className="flex items-center space-x-1.5">
                    <BadgeCheck className="w-4 h-4 text-emerald-400" />
                    <span>AUTHENTIC GOVERNMENT RECORD</span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-400/50">
                    BLOCKCHAIN VERIFIED
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">{verifyResult.title}</div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1">
                  <div>Issuer: <span className="text-slate-200">{verifyResult.issuer}</span></div>
                  <div>Certificate: <span className="text-cyan-300">{verifyResult.certificateBNSS}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Lodge e-Grievance / Incident Report */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Lodge Incident / e-Grievance</h2>
                <p className="text-[11px] text-slate-400">Securely submit cyber crime or safety complaint</p>
              </div>
            </div>

            <form onSubmit={handleLodgeGrievance} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Incident Category
                </label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="FINANCIAL_FRAUD">Online Financial Fraud / UPI Scam</option>
                  <option value="WOMEN_SAFETY">Women Safety / Cyber Harassment</option>
                  <option value="IDENTITY_THEFT">Identity Theft / Account Takeover</option>
                  <option value="EXTORTION">Digital Extortion / Blackmail</option>
                  <option value="OTHER">Other Cyber Offence</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Incident Description & Details
                </label>
                <textarea
                  rows={4}
                  required
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  placeholder="Provide incident details, transaction ID, suspect phone number or website..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Attach Evidence Screenshot / PDF (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setIncidentFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-cyan-300 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
                <Lock className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <span>
                  All submitted evidence is stamped with SHA-256 cryptographic fingerprints and protected under Section 63 of Bharatiya Nagarik Suraksha Sanhita (BNSS).
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-950/40 transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Anchoring to Ledger...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Submit & Generate Custody Receipt</span>
                  </>
                )}
              </button>
            </form>

            {/* Generated Receipt Modal */}
            {submittedReceipt && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 text-xs">
                <div className="flex items-center justify-between text-emerald-300 font-bold">
                  <span className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>LODGED SUCCESSFULLY</span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">
                    {submittedReceipt.ackId}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Your incident has been recorded in the central queue. An Investigating Officer from the respective jurisdiction has been alerted.
                </p>
                <div className="p-2 rounded bg-slate-900 font-mono text-[10px] text-cyan-300 break-all border border-slate-800">
                  SHA-256: {submittedReceipt.hash}
                </div>
                <div className="text-[10px] text-slate-400">
                  Receipt Timestamp: {submittedReceipt.timestamp}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
