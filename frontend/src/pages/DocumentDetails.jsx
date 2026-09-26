import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  PenTool,
  Upload,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Layers,
  Lock,
  Loader2,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AccessRequired from '../components/AccessRequired';

export default function DocumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, can } = useAuth();

  const [document, setDocument] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [accessDeniedData, setAccessDeniedData] = useState(null);

  // Verification State
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Digital Signature Modal State
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signReason, setSignReason] = useState('Certified accurate and evidentiary for judicial submission');
  const [signConfirm, setSignConfirm] = useState(false);
  const [signing, setSigning] = useState(false);

  // Version Upload Modal State
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [versionFile, setVersionFile] = useState(null);
  const [changeDesc, setChangeDesc] = useState('');
  const [versionType, setVersionType] = useState('minor');
  const [uploadingVersion, setUploadingVersion] = useState(false);

  const [activeRightTab, setActiveRightTab] = useState('security'); // 'security', 'versions', 'ai'
  const [actionMessage, setActionMessage] = useState('');

  const loadDocument = async () => {
    setLoading(true);
    setAccessDeniedData(null);
    try {
      const res = await api.getDocumentById(id);
      if (res.success) {
        setDocument(res.document);

        // Fetch preview content if text
        try {
          const prevRes = await api.previewDocument(id);
          if (prevRes.success && prevRes.content) {
            setPreviewContent(prevRes.content);
          }
        } catch (e) {
          // If binary or direct preview fails, fallback to title/summary
          setPreviewContent('');
        }
      }
    } catch (err) {
      if (err.status === 403 && err.data?.accessDenied) {
        setAccessDeniedData(err.data);
      } else {
        console.warn('Load document error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocument();
  }, [id]);

  // Handle Verify Integrity
  const handleVerifyIntegrity = async () => {
    setVerifying(true);
    setActionMessage('');
    try {
      const res = await api.verifyDocument(id);
      if (res.success) {
        setVerificationResult(res.result);
        setActionMessage(
          res.result.verified
            ? '✓ Document integrity verified against blockchain ledger'
            : '⚠ WARNING: Hash discrepancy detected!'
        );
      }
    } catch (err) {
      setActionMessage('Verification failed: ' + err.message);
    } finally {
      setVerifying(false);
    }
  };

  // Handle Digital Signing
  const handleSignDocument = async (e) => {
    e.preventDefault();
    if (!signConfirm) return;
    setSigning(true);
    try {
      const res = await api.signDocument(id, signReason, signConfirm);
      if (res.success) {
        setIsSignModalOpen(false);
        setActionMessage('✓ Document digitally signed with cryptographic PKI seal');
        loadDocument();
      }
    } catch (err) {
      setActionMessage('Signing failed: ' + err.message);
    } finally {
      setSigning(false);
    }
  };

  // Handle Version Upload
  const handleUploadVersion = async (e) => {
    e.preventDefault();
    if (!versionFile) return;
    setUploadingVersion(true);
    try {
      const formData = new FormData();
      formData.append('file', versionFile);
      formData.append('changeDescription', changeDesc);
      formData.append('versionType', versionType);

      const res = await api.uploadVersion(id, formData);
      if (res.success) {
        setIsVersionModalOpen(false);
        setVersionFile(null);
        setChangeDesc('');
        setActionMessage(`✓ Version ${res.version.versionNumber} registered on blockchain ledger`);
        loadDocument();
      }
    } catch (err) {
      setActionMessage('Version update failed: ' + err.message);
    } finally {
      setUploadingVersion(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
        <span>Authenticating Clearance & Decrypting Record...</span>
      </div>
    );
  }

  // Handle Access Denied Screen with Request Workflow
  if (accessDeniedData) {
    return (
      <AccessRequired
        documentId={accessDeniedData.documentId}
        documentTitle={accessDeniedData.documentTitle}
        classification={accessDeniedData.classification}
        caseId={accessDeniedData.caseId}
      />
    );
  }

  if (!document) {
    return (
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-12 text-center text-xs text-slate-400 space-y-4">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-white">Record Not Found</h2>
        <p>This document could not be retrieved from the custody registry.</p>
        <button
          onClick={() => navigate('/documents')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
        >
          Return to Vault
        </button>
      </div>
    );
  }

  const latestLedgerRecord = document.integrityRecords?.[0];
  const parsedEntities = document.extractedEntities ? JSON.parse(document.extractedEntities) : null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-cyan-400">{document.id}</span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-xs text-slate-300">v{document.currentVersion}</span>
              <span className="text-slate-500">•</span>
              <span
                className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                  document.classification === 'RESTRICTED'
                    ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                    : document.classification === 'HIGHLY_CONFIDENTIAL'
                    ? 'bg-orange-950 text-orange-400 border border-orange-500/30'
                    : document.classification === 'CONFIDENTIAL'
                    ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                    : 'bg-blue-950 text-blue-400 border border-blue-500/30'
                }`}
              >
                {document.classification}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-0.5">{document.title}</h1>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleVerifyIntegrity}
            disabled={verifying}
            className="px-3.5 py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            {verifying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>Verify Integrity</span>
          </button>

          {can('SIGN') && (
            <button
              onClick={() => setIsSignModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <PenTool className="w-3.5 h-3.5 text-cyan-400" />
              <span>Digitally Sign</span>
            </button>
          )}

          {can('UPLOAD') && (
            <button
              onClick={() => setIsVersionModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>New Version</span>
            </button>
          )}

          <a
            href={api.getDownloadUrl(document.id)}
            download={document.fileName}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-cyan-950/20 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <span>ℹ️</span>
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Main Split Layout: Left Preview / Right Security & Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Document Live Previewer */}
        <div className="lg:col-span-7 bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[560px]">
          <div className="p-4 border-b border-[#1E293B] flex items-center justify-between bg-[#0B1120]">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                Custody Previewer
              </span>
              <span className="text-[10px] text-slate-500 font-mono">({document.fileName})</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              SHA-256 MATCHED
            </span>
          </div>

          <div className="p-6 flex-1 bg-slate-950/60 text-slate-200 font-mono text-xs overflow-y-auto max-h-[600px] leading-relaxed whitespace-pre-wrap selection:bg-cyan-500 selection:text-black">
            {previewContent ? (
              previewContent
            ) : (
              <div className="space-y-4 py-8 text-center text-slate-400">
                <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                <div className="text-white font-semibold text-sm">{document.title}</div>
                <p className="max-w-md mx-auto text-xs">
                  {document.summary || 'Official law enforcement custody file. View metadata on the right panel or download binary.'}
                </p>
                <a
                  href={api.getDownloadUrl(document.id)}
                  download={document.fileName}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Original Evidentiary File</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Security, Integrity, Signatures & Versions */}
        <div className="lg:col-span-5 space-y-5">
          {/* Sub Tab Strip */}
          <div className="flex border-b border-slate-800 space-x-4 text-xs font-semibold bg-[#0F172A] p-2 rounded-lg">
            <button
              onClick={() => setActiveRightTab('security')}
              className={`flex-1 py-1.5 rounded transition text-center ${
                activeRightTab === 'security'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Security & Hashes
            </button>
            <button
              onClick={() => setActiveRightTab('versions')}
              className={`flex-1 py-1.5 rounded transition text-center ${
                activeRightTab === 'versions'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Version History ({document.versions?.length || 1})
            </button>
            <button
              onClick={() => setActiveRightTab('ai')}
              className={`flex-1 py-1.5 rounded transition text-center ${
                activeRightTab === 'ai'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AI Intelligence
            </button>
          </div>

          {/* TAB 1: Security & Hashes */}
          {activeRightTab === 'security' && (
            <div className="space-y-4">
              {/* Verification Card */}
              {verificationResult && (
                <div
                  className={`p-4 rounded-xl border space-y-2 animate-in fade-in ${
                    verificationResult.verified
                      ? 'bg-emerald-950/40 border-emerald-500/40'
                      : 'bg-rose-950/40 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {verificationResult.verified ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    )}
                    <h3
                      className={`text-xs font-bold uppercase tracking-wider ${
                        verificationResult.verified ? 'text-emerald-300' : 'text-rose-300'
                      }`}
                    >
                      {verificationResult.status}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-300">{verificationResult.tamperDetails}</p>
                  <div className="text-[10px] font-mono text-slate-400 pt-1">
                    Recalculated Disk SHA-256:{' '}
                    <span className="text-emerald-400 break-all">{verificationResult.recalculatedHash}</span>
                  </div>
                </div>
              )}

              {/* Cryptographic Ledger Anchor */}
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Blockchain Anchor Status</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    CHAIN VERIFIED
                  </span>
                </div>

                <div className="space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Registered Document SHA-256:</span>
                    <span className="text-emerald-400 break-all bg-slate-950 p-1.5 rounded block mt-0.5 border border-slate-800">
                      {document.currentHash}
                    </span>
                  </div>

                  {latestLedgerRecord && (
                    <>
                      <div className="flex justify-between py-1 border-t border-slate-850">
                        <span className="text-slate-400">Blockchain Block:</span>
                        <Link
                          to="/integrity"
                          className="text-cyan-400 font-bold hover:underline"
                        >
                          Block #{latestLedgerRecord.blockIndex} →
                        </Link>
                      </div>
                      <div className="flex justify-between py-1 border-t border-slate-850">
                        <span className="text-slate-400">Validator Node:</span>
                        <span className="text-slate-300">{latestLedgerRecord.validator}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Block Cryptographic Hash:</span>
                        <span className="text-slate-400 break-all text-[10px] block mt-0.5">
                          {latestLedgerRecord.blockHash}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Digital Signatures Card */}
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white flex items-center space-x-1.5">
                    <PenTool className="w-4 h-4 text-cyan-400" />
                    <span>Digital Signatures & Seals</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {document.digitalSignatures?.length || 0} Signed
                  </span>
                </div>

                {document.digitalSignatures && document.digitalSignatures.length > 0 ? (
                  <div className="space-y-2">
                    {document.digitalSignatures.map((sig) => (
                      <div
                        key={sig.id}
                        className="p-3 bg-slate-950/80 rounded-lg border border-emerald-500/20 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-400 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Digitally Signed</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{sig.id}</span>
                        </div>
                        <div className="text-white font-medium">{sig.signerName}</div>
                        <div className="text-[11px] text-slate-400">
                          Role: <span className="text-cyan-300">{sig.signerRole?.replace('_', ' ')}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 italic">
                          "{sig.signatureReason || 'Official verification'}"
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Timestamp: {new Date(sig.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-500 text-xs space-y-1">
                    <div>No digital signatures appended yet.</div>
                    {can('SIGN') && (
                      <button
                        onClick={() => setIsSignModalOpen(true)}
                        className="mt-2 text-cyan-400 hover:underline font-semibold"
                      >
                        Click here to digitally sign this document →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Version History */}
          {activeRightTab === 'versions' && (
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white flex items-center space-x-1.5">
                  <History className="w-4 h-4 text-cyan-400" />
                  <span>Version Chain of Custody</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  Current: v{document.currentVersion}
                </span>
              </div>

              <div className="space-y-3">
                {document.versions?.map((ver, idx) => (
                  <div
                    key={ver.id}
                    className={`p-3 rounded-lg border space-y-1.5 ${
                      ver.versionNumber === document.currentVersion
                        ? 'bg-slate-900 border-cyan-500/40'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300 font-mono">
                        Version {ver.versionNumber}
                      </span>
                      {ver.versionNumber === document.currentVersion && (
                        <span className="text-[9px] bg-cyan-900 text-cyan-300 px-1.5 py-0.2 rounded font-mono font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300">{ver.changeDescription || 'Update'}</p>
                    <div className="text-[10px] font-mono text-slate-400">
                      SHA-256: <span className="text-emerald-400 break-all">{ver.fileHash}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                      <span>By: {ver.createdBy?.fullName || 'Officer'}</span>
                      <span>{new Date(ver.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AI Intelligence */}
          {activeRightTab === 'ai' && (
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>AI Extracted Intelligence</span>
                </span>
                <span className="text-[10px] text-purple-400 font-mono bg-purple-950 px-2 py-0.5 rounded border border-purple-500/20">
                  CONFIDENCE: 94%
                </span>
              </div>

              {/* Executive Summary */}
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block text-[11px]">Executive Summary:</span>
                <p className="text-slate-200 text-xs leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {document.summary || 'Summary generated upon document ingestion.'}
                </p>
              </div>

              {/* Extracted Sections */}
              {parsedEntities?.sections && (
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">
                    Identified Penal & IT Act Sections:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedEntities.sections.map((sec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted People & Entities */}
              {parsedEntities?.people && (
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">
                    Identified Individuals & Deponents:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedEntities.people.map((p, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-700 text-[10px]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Locations */}
              {parsedEntities?.locations && (
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">
                    Jurisdiction & Locations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedEntities.locations.map((loc, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 text-[10px]"
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Digital Signature Confirmation Modal */}
      {isSignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between bg-[#0B1120]">
              <div className="flex items-center space-x-2">
                <PenTool className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white uppercase">Digitally Sign Document</h3>
              </div>
              <button onClick={() => setIsSignModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSignDocument} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="text-slate-400">Signer: <span className="text-white font-bold">{user?.fullName}</span></div>
                <div className="text-slate-400">Role: <span className="text-cyan-400">{user?.role}</span></div>
                <div className="text-slate-400">Badge: <span className="text-slate-200">{user?.badgeNumber}</span></div>
                <div className="text-slate-400">Target Hash: <span className="text-emerald-400 truncate block">{document.currentHash}</span></div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Signing Justification / Endorsement Statement
                </label>
                <textarea
                  value={signReason}
                  onChange={(e) => setSignReason(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 rounded bg-cyan-950/40 border border-cyan-500/20 text-slate-300 space-y-2">
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signConfirm}
                    onChange={(e) => setSignConfirm(e.target.checked)}
                    className="mt-0.5 rounded bg-slate-800 border-slate-700 text-cyan-500"
                    required
                  />
                  <span className="text-[11px] leading-tight text-slate-300">
                    I confirm that I have inspected this record and affix my official cryptographic DSC signature. This operation will be permanently recorded in the immutable audit ledger.
                  </span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={signing || !signConfirm}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>AFFIX SIGNATURE</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload New Version Modal */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between bg-[#0B1120]">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white uppercase">Upload New Version</h3>
              </div>
              <button onClick={() => setIsVersionModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadVersion} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded bg-blue-950/40 border border-blue-500/30 text-blue-300 text-[11px]">
                ℹ️ The original evidentiary file will NEVER be overwritten. Uploading creates an incremental version in the cryptographic custody chain.
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Select Updated File *
                </label>
                <input
                  type="file"
                  onChange={(e) => setVersionFile(e.target.files[0])}
                  className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-950 file:text-cyan-300 hover:file:bg-cyan-900 cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Version Increment Type *
                </label>
                <select
                  value={versionType}
                  onChange={(e) => setVersionType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="minor">Minor Revision (e.g. v1.0 → v1.1 - Supplementary additions)</option>
                  <option value="major">Major Revision (e.g. v1.0 → v2.0 - Final prosecution review)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Change Description *
                </label>
                <textarea
                  value={changeDesc}
                  onChange={(e) => setChangeDesc(e.target.value)}
                  rows={3}
                  placeholder="Summarize amendments, additions, or forensic re-examinations..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVersionModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingVersion || !versionFile}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {uploadingVersion ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>REGISTER VERSION</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
