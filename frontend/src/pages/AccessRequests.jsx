import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  FileText,
  User,
  AlertCircle,
  Loader2,
  ExternalLink,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AccessRequests() {
  const { user, can } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.getAccessRequests({ status: statusFilter });
      if (res.success) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.warn('Failed to load access requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const handleReview = async (id, status) => {
    setProcessingId(id);
    setMessage('');
    try {
      const remarks = prompt(
        `Enter review remarks for ${status === 'APPROVED' ? 'APPROVAL' : 'REJECTION'}:`,
        status === 'APPROVED' ? 'Operational necessity verified under Section 91 BNSS' : 'Insufficient statutory grounds'
      );
      if (remarks === null) {
        setProcessingId(null);
        return;
      }

      const res = await api.reviewAccessRequest(id, status, remarks);
      if (res.success) {
        setMessage(`Access request ${status.toLowerCase()} successfully`);
        loadRequests();
      }
    } catch (err) {
      setMessage('Failed to process review: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              CLEARANCE & PRIVILEGE MANAGEMENT
            </span>
            <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
              RBAC ENFORCED
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Access Authorization Requests</h1>
          <p className="text-xs text-slate-400">
            Supervisory queue for reviewing classified document access requests
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none font-medium"
        >
          <option value="">All Request Statuses</option>
          <option value="PENDING">Pending Supervisory Review</option>
          <option value="APPROVED">Approved Clearances</option>
          <option value="REJECTED">Denied / Revoked</option>
        </select>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 text-xs flex items-center space-x-2.5 shadow-sm">
          <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Requests Table */}
      <div className="cyber-card rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="font-mono">Scanning clearance requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-400 space-y-2">
            <KeyRound className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="font-bold text-white text-sm">No Clearance Requests</div>
            <p>No document authorization requests currently pending in this queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1120] text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Requester Officer</th>
                  <th className="p-3.5">Target Document</th>
                  <th className="p-3.5">Classification</th>
                  <th className="p-3.5">Operational Justification</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-white">{req.requester?.fullName}</div>
                      <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                        {req.requester?.badgeNumber} ({req.requester?.role?.replace('_', ' ')})
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-white max-w-xs truncate">
                        {req.document?.title}
                      </div>
                      <Link
                        to={`/documents/${req.documentId}`}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono inline-flex items-center space-x-1 mt-0.5"
                      >
                        <span>{req.documentId}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          req.document?.classification === 'RESTRICTED'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {req.document?.classification}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-300 max-w-xs text-xs italic">
                      "{req.reason}"
                      {req.reviewRemarks && (
                        <div className="text-[10px] text-slate-400 mt-1 not-italic font-mono bg-slate-900/60 p-1.5 rounded border border-slate-800">
                          Reviewer Note: {req.reviewRemarks}
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                            : req.status === 'REJECTED'
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-950/80 text-amber-400 animate-pulse border border-amber-500/30'
                        }`}
                      >
                        ● {req.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-400 whitespace-nowrap text-[10px] font-mono">
                      {new Date(req.createdAt).toLocaleString()}
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      {req.status === 'PENDING' && can('APPROVE_ACCESS') ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleReview(req.id, 'APPROVED')}
                            disabled={processingId === req.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-[11px] flex items-center space-x-1 shadow-sm transition active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReview(req.id, 'REJECTED')}
                            disabled={processingId === req.id}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-[11px] flex items-center space-x-1 shadow-sm transition active:scale-95"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">
                          {req.reviewedBy ? `Reviewed by ${req.reviewedBy.fullName}` : 'No Action Required'}
                        </span>
                      )}
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
