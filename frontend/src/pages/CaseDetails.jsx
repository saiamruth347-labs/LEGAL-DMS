import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FolderLock,
  ArrowLeft,
  FileText,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  Building,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Download,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CaseDetails({ onOpenUpload, onOpenVerify }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, can } = useAuth();

  const [caseItem, setCaseItem] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [activeTab, setActiveTab] = useState('documents'); // documents, timeline, overview
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const loadCase = async () => {
    try {
      const res = await api.getCaseById(id);
      if (res.success) {
        setCaseItem(res.case);
        setTimeline(res.timeline || []);
      }
    } catch (err) {
      console.warn('Failed to load case:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    setStatusMessage('');
    try {
      const res = await api.updateCaseStatus(id, newStatus, 'Status updated via Case Console');
      if (res.success) {
        setCaseItem(res.case);
        setStatusMessage(`Status transitioned to ${newStatus}`);
        loadCase();
      }
    } catch (err) {
      setStatusMessage('Status update failed: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
        <span>Decrypting Case Dossier...</span>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-12 text-center text-xs text-slate-400 space-y-4">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-white">Case Dossier Not Found</h2>
        <p>The requested file does not exist in the National Crime Records Bureau repository.</p>
        <button
          onClick={() => navigate('/cases')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
        >
          Return to Case Vault
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/cases')}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-cyan-400">{caseItem.id}</span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">{caseItem.caseType?.replace(/_/g, ' ')}</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-0.5">{caseItem.title}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {can('UPLOAD') && (
            <button
              onClick={() => onOpenUpload && onOpenUpload(caseItem.id)}
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-cyan-900/20 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Ingest Document</span>
            </button>
          )}

          {/* Status Workflow Selector */}
          <select
            value={caseItem.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updatingStatus}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-cyan-300 focus:border-cyan-500 focus:outline-none cursor-pointer"
          >
            <option value="OPEN">Status: OPEN</option>
            <option value="UNDER_INVESTIGATION">Status: UNDER INVESTIGATION</option>
            <option value="LEGAL_REVIEW">Status: LEGAL REVIEW</option>
            <option value="COURT_SUBMITTED">Status: COURT SUBMITTED</option>
            <option value="CLOSED">Status: CLOSED</option>
          </select>
        </div>
      </div>

      {statusMessage && (
        <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs flex items-center space-x-2">
          <span>ℹ️</span>
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Case Overview Metadata Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 text-xs">
        <div>
          <span className="text-slate-500 block text-[11px]">FIR Number</span>
          <span className="font-mono font-semibold text-white mt-0.5 block">
            {caseItem.firNumber || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Priority</span>
          <span
            className={`font-semibold mt-0.5 inline-block text-[10px] px-2 py-0.2 rounded ${
              caseItem.priority === 'CRITICAL'
                ? 'bg-rose-950 text-rose-400'
                : caseItem.priority === 'HIGH'
                ? 'bg-orange-950 text-orange-400'
                : 'bg-blue-950 text-blue-400'
            }`}
          >
            {caseItem.priority}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Lead Investigator</span>
          <span className="font-medium text-slate-200 mt-0.5 block">
            {caseItem.assignedOfficer?.fullName || 'Unassigned'} ({caseItem.assignedOfficer?.badgeNumber})
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Custodian Department</span>
          <span className="font-medium text-slate-200 mt-0.5 block">
            {caseItem.department?.name || 'NCRB WSD'}
          </span>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'documents'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Case Documents ({caseItem.documents?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'timeline'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Case Timeline & Audit Trail</span>
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderLock className="w-4 h-4" />
          <span>Investigation Facts</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'documents' && (
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Secure Case Document Repository</h2>
            <span className="text-xs text-slate-400">All files anchored to tamper-evident ledger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1120] text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Doc ID</th>
                  <th className="p-3">Document Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Classification</th>
                  <th className="p-3">SHA-256 Fingerprint</th>
                  <th className="p-3">Version</th>
                  <th className="p-3">Signature</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {caseItem.documents?.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono text-cyan-400 font-bold whitespace-nowrap">
                      {doc.id}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-white max-w-xs truncate">{doc.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{doc.fileName}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {doc.category}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          doc.classification === 'RESTRICTED'
                            ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                            : doc.classification === 'HIGHLY_CONFIDENTIAL'
                            ? 'bg-orange-950 text-orange-400 border border-orange-500/30'
                            : doc.classification === 'CONFIDENTIAL'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-950 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {doc.classification}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-emerald-400 max-w-[120px] truncate">
                      {doc.currentHash}
                    </td>
                    <td className="p-3 font-mono text-slate-300 whitespace-nowrap">
                      v{doc.currentVersion}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {doc.digitalSignatures && doc.digitalSignatures.length > 0 ? (
                        <span className="text-[10px] text-emerald-400 flex items-center space-x-1 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Signed</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Unsigned</span>
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 inline-flex items-center space-x-1 font-semibold text-xs transition"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white">Immutable Case Timeline</h2>
          <div className="space-y-4 pl-4 border-l-2 border-slate-800">
            {timeline.length === 0 ? (
              <div className="text-xs text-slate-400 py-4">No audit events recorded for this case yet.</div>
            ) : (
              timeline.map((event) => (
                <div key={event.id} className="relative space-y-1">
                  <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-cyan-400 border-2 border-[#0F172A]"></div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-mono font-bold text-cyan-300">{event.action}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{new Date(event.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-200">{event.details}</p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Executed By: {event.userName} ({event.userRole})
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white">Investigation Dossier Summary</h2>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
            {caseItem.description}
          </p>
        </div>
      )}
    </div>
  );
}
