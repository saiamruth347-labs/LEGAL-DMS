import React, { useState, useEffect } from 'react';
import {
  History,
  Download,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AuditTrail() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25 };
      if (actionFilter) params.action = actionFilter;
      if (roleFilter) params.userRole = roleFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.getAuditLogs(params);
      if (res.success) {
        setLogs(res.logs);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [page, actionFilter, roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadAuditLogs();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              IMMUTABLE EVIDENCE LEDGER
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono border border-slate-700">
              TOTAL RECORDS: {total}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Forensic Audit Trail</h1>
          <p className="text-xs text-slate-400">
            Cryptographically sealed activity log compliant with Indian Evidence Act & BNSS Section 173
          </p>
        </div>

        <a
          href={api.getExportCsvUrl()}
          download="NCRB_Audit_Trail.csv"
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center space-x-2 shadow-sm transition active:scale-95"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Compliance CSV</span>
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="cyber-card rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, action, IP, resource..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none font-medium"
          >
            <option value="">All Operational Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="DOCUMENT_UPLOAD">DOCUMENT_UPLOAD</option>
            <option value="DOCUMENT_VIEW">DOCUMENT_VIEW</option>
            <option value="DOCUMENT_DOWNLOAD">DOCUMENT_DOWNLOAD</option>
            <option value="DIGITAL_SIGN">DIGITAL_SIGN</option>
            <option value="INTEGRITY_VERIFY">INTEGRITY_VERIFY</option>
            <option value="ACCESS_REQUEST">ACCESS_REQUEST</option>
            <option value="ACCESS_APPROVE">ACCESS_APPROVE</option>
            <option value="DOCUMENT_ACCESS_DENIED">DOCUMENT_ACCESS_DENIED</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none font-medium"
          >
            <option value="">All Agency Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="INVESTIGATING_OFFICER">Investigating Officer</option>
            <option value="LEGAL_OFFICER">Legal Officer</option>
            <option value="REVIEWER">Reviewer</option>
            <option value="AUDITOR">Auditor</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none font-medium"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="DENIED">DENIED</option>
            <option value="FAILED">FAILED</option>
            <option value="WARNING">WARNING</option>
          </select>

          <button
            onClick={loadAuditLogs}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
            title="Refresh Log"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="cyber-card rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="font-mono">Retrieving immutable audit records...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-400 space-y-2">
            <History className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="font-bold text-white text-sm">No Audit Records Found</div>
            <p>No audit records match the query filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1120] text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Officer / User</th>
                  <th className="p-3.5">Agency Role</th>
                  <th className="p-3.5">Action Type</th>
                  <th className="p-3.5">Resource Target</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Result</th>
                  <th className="p-3.5">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-semibold text-white whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded-full border border-cyan-500/30">
                        {log.userRole?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-white whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                      {log.resourceType}: {log.resourceId || 'System'}
                    </td>
                    <td className="p-3.5 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                      {log.ipAddress}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 text-[11px] max-w-xs truncate">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
