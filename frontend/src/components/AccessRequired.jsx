import React, { useState } from 'react';
import { ShieldAlert, KeyRound, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function AccessRequired({ documentId, documentTitle, classification, caseId }) {
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState('');

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide an official operational justification.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.requestAccess(documentId, reason);
      if (res.success) {
        setRequested(true);
      } else {
        setError(res.message || 'Failed to submit request');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with clearance server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#0F172A] border border-rose-500/40 rounded-3xl p-8 max-w-lg w-full shadow-2xl shadow-rose-950/30 text-center space-y-6 ring-1 ring-black/40">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/70 border border-rose-500/50 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
          <ShieldAlert className="w-8 h-8 text-rose-400 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400 text-xs font-mono font-bold tracking-widest uppercase">
            SECURITY CLEARANCE RESTRICTED
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">ACCESS REQUIRED</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            You do not currently possess clearance to inspect or download this classified record under the Official Secrets & Evidence Custody Act.
          </p>
        </div>

        <div className="bg-slate-950/80 rounded-2xl p-4.5 border border-slate-800 text-left text-xs font-mono space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Document ID:</span>
            <span className="text-cyan-400 font-bold">{documentId}</span>
          </div>
          {documentTitle && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Record Name:</span>
              <span className="text-slate-300 truncate max-w-[240px] font-sans font-medium">{documentTitle}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Classification:</span>
            <span className="text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
              {classification || 'RESTRICTED'}
            </span>
          </div>
          {caseId && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Case Dossier:</span>
              <span className="text-white font-bold">{caseId}</span>
            </div>
          )}
        </div>

        {requested ? (
          <div className="p-5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs space-y-2.5 text-left shadow-glow-emerald">
            <div className="flex items-center space-x-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>ACCESS AUTHORIZATION REQUEST DISPATCHED</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Your request has been routed to the Supervisory Reviewer & Super Admin queue. Once approved, the document will unlock automatically. All access requests are logged in the tamper-evident audit trail.
            </p>
            <button
              onClick={() => navigate('/cases')}
              className="mt-2 w-full py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-center text-xs font-bold text-white border border-slate-700 transition"
            >
              Return to Case Vault
            </button>
          </div>
        ) : (
          <form onSubmit={handleRequest} className="space-y-4 text-left">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official Operational Justification *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Explain the statutory requirement or case nexus necessitating access to this classified material..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go Back</span>
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-lg shadow-rose-900/30 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>REQUEST ACCESS</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
