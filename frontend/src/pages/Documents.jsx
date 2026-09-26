import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Download,
  ShieldCheck,
  CheckCircle2,
  Upload,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Loader2,
  Copy,
  Check,
  FileCheck2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Documents({ onOpenUpload, onOpenVerify }) {
  const { user, can } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('');
  const [copiedHash, setCopiedHash] = useState(null);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (classificationFilter) params.classification = classificationFilter;

      const res = await api.getDocuments(params);
      if (res.success) {
        setDocuments(res.documents);
      }
    } catch (err) {
      console.warn('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [categoryFilter, classificationFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDocuments();
  };

  const handleCopyHash = (hash, id) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              NATIONAL EVIDENTIARY REPOSITORY
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono border border-slate-700">
              RECORDS: {documents.length}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Classified Document Vault</h1>
          <p className="text-xs text-slate-400">
            Cryptographically anchored investigation records, forensic reports, and court filings
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {can('UPLOAD') && (
            <button
              onClick={() => onOpenUpload && onOpenUpload()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-cyan-900/30 hover:shadow-cyan-500/20 transition-all duration-200 active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Ingest Document</span>
            </button>
          )}
          <button
            onClick={onOpenVerify}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center space-x-1.5 transition-all duration-200 active:scale-95 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Verify Fingerprint</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="cyber-card rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Document ID, Title, Hash..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none font-medium"
          >
            <option value="">All Categories</option>
            <option value="FIR">First Information Report (FIR)</option>
            <option value="WITNESS_STATEMENT">Witness Statement</option>
            <option value="FORENSIC_REPORT">Forensic Report</option>
            <option value="CHARGE_SHEET">Charge Sheet</option>
            <option value="COURT_FILING">Court Filing</option>
            <option value="EVIDENCE_RECORD">Evidence Record</option>
            <option value="INVESTIGATION_RECORD">Investigation Record</option>
          </select>

          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none font-medium"
          >
            <option value="">All Classifications</option>
            <option value="PUBLIC">Public</option>
            <option value="INTERNAL">Internal Law Enforcement</option>
            <option value="CONFIDENTIAL">Confidential</option>
            <option value="HIGHLY_CONFIDENTIAL">Highly Confidential</option>
            <option value="RESTRICTED">Restricted</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="cyber-card rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="font-mono">Scanning cryptographic custody registry...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-400 space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="font-bold text-white text-sm">No Custody Records Found</div>
            <p>Try resetting filters or searching with a different term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1120] text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Doc ID</th>
                  <th className="p-3.5">Title & Evidence File</th>
                  <th className="p-3.5">Case ID</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Classification</th>
                  <th className="p-3.5">SHA-256 Fingerprint</th>
                  <th className="p-3.5">Version</th>
                  <th className="p-3.5">Signature</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono text-cyan-400 font-bold whitespace-nowrap">
                      {doc.id}
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-white max-w-xs truncate">{doc.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{doc.fileName}</div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <Link
                        to={`/cases/${doc.caseId}`}
                        className="font-mono text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
                      >
                        {doc.caseId}
                      </Link>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                        {doc.category}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                          doc.classification === 'RESTRICTED'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                            : doc.classification === 'HIGHLY_CONFIDENTIAL'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                            : doc.classification === 'CONFIDENTIAL'
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {doc.classification}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="font-mono text-[10px] text-emerald-400 max-w-[130px] truncate bg-slate-900 px-2 py-1 rounded border border-slate-800"
                          title={doc.currentHash}
                        >
                          {doc.currentHash}
                        </span>
                        <button
                          onClick={() => handleCopyHash(doc.currentHash, doc.id)}
                          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          title="Copy Full SHA-256 Hash"
                        >
                          {copiedHash === doc.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-300 whitespace-nowrap font-bold">
                      v{doc.currentVersion}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {doc.digitalSignatures && doc.digitalSignatures.length > 0 ? (
                        <span className="text-[10px] text-emerald-400 flex items-center space-x-1 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Sec. 63 Signed</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">Unsigned</span>
                      )}
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 inline-flex items-center space-x-1 font-bold text-xs transition border border-slate-700/60 hover:border-cyan-500/40"
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
        )}
      </div>
    </div>
  );
}
