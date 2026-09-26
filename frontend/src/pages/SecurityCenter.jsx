import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  UserX,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Eye,
  Loader2,
  Activity,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SecurityCenter() {
  const { user, can } = useAuth();
  const [overview, setOverview] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const [ovRes, evRes] = await Promise.all([
        api.getSecurityOverview(),
        api.getSecurityEvents({ limit: 25 }),
      ]);

      if (ovRes.success) setOverview(ovRes);
      if (evRes.success) setEvents(evRes.events);
    } catch (err) {
      console.warn('Load security data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  const handleResolve = async (id) => {
    setResolvingId(id);
    setMessage('');
    try {
      const res = await api.resolveSecurityEvent(id, 'Threat verified and cleared by cybersecurity team');
      if (res.success) {
        setMessage('Incident marked as mitigated and resolved');
        loadSecurityData();
      }
    } catch (err) {
      setMessage('Resolution failed: ' + err.message);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
              NATIONAL CYBER THREAT MONITORING
            </span>
            <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full font-mono border border-rose-500/30">
              LIVE DEFENSE ACTIVE
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Cybersecurity & Threat Center</h1>
          <p className="text-xs text-slate-400">
            Real-time brute-force mitigation, unauthorized access tracking, and cryptographic audit monitoring
          </p>
        </div>

        <button
          onClick={loadSecurityData}
          className="p-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-bold flex items-center space-x-2 transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Threat Feed</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 text-xs flex items-center space-x-2.5 shadow-sm">
          <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Threat Metrics & Risk Score Meter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Risk Score Meter */}
        <div className="cyber-card rounded-2xl p-5 shadow-sm space-y-2 border-cyan-500/30">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security Risk Score</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono">{overview?.riskScore || 12}</span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="text-xs font-bold text-emerald-400">
            {overview?.riskLevel || 'LOW RISK'}
          </div>
        </div>

        {/* Unresolved Threats */}
        <div className="cyber-card rounded-2xl p-5 shadow-sm space-y-2 border-rose-500/20">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Threats</span>
          <div className="text-3xl font-extrabold text-rose-400 font-mono">
            {overview?.totalUnresolvedThreats || 0}
          </div>
          <div className="text-xs text-slate-400 font-medium">Requiring supervisory action</div>
        </div>

        {/* Failed Login Attempts */}
        <div className="cyber-card rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Failed Logins Monitored</span>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            {overview?.failedLoginsCount || 0}
          </div>
          <div className="text-xs text-slate-400 font-medium">Locked after 5 attempts</div>
        </div>

        {/* Account Lockouts */}
        <div className="cyber-card rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Locked Consoles</span>
          <div className="text-3xl font-extrabold text-white font-mono">
            {overview?.lockedUsersCount || 0}
          </div>
          <div className="text-xs text-emerald-400 font-medium">Lockout auto-expires in 15m</div>
        </div>
      </div>

      {/* AI Anomaly Insights Banner */}
      {overview?.anomalies && overview.anomalies.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-5 space-y-2.5 shadow-glow-rose">
          <div className="flex items-center space-x-2 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Automated Behavioral Anomaly Alerts</span>
          </div>
          <div className="space-y-1.5">
            {overview.anomalies.map((a, i) => (
              <div key={i} className="text-xs text-slate-200 flex items-start space-x-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>{a.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incident Log Table */}
      <div className="cyber-card rounded-2xl shadow-sm overflow-hidden space-y-3">
        <div className="p-5 border-b border-[#1E293B] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-rose-400" />
              <span>Security Incident Log</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Audit of security flags, unauthorized attempts, and threat detections</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-bold bg-slate-900 px-2.5 py-1 rounded-full border border-slate-700">
            {events.length} Incidents
          </span>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="font-mono">Scanning security telemetry...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-400 space-y-2">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="font-bold text-white text-sm">No Security Incidents Recorded</div>
            <p>All operational telemetry is normal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1120] text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Incident Type</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">User & IP</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          ev.severity === 'CRITICAL'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                            : ev.severity === 'HIGH'
                            ? 'bg-orange-950/80 text-orange-300 border border-orange-500/40'
                            : ev.severity === 'MEDIUM'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                            : 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                        }`}
                      >
                        {ev.severity}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-white font-bold whitespace-nowrap">
                      {ev.eventType}
                    </td>

                    <td className="p-3.5 text-slate-300 max-w-sm">
                      {ev.description}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div className="text-white font-semibold">{ev.userName || 'Unauthenticated'}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ev.ipAddress}</div>
                    </td>

                    <td className="p-3.5 text-slate-400 whitespace-nowrap text-[10px] font-mono">
                      {new Date(ev.timestamp).toLocaleString()}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {ev.resolved ? (
                        <span className="text-emerald-400 flex items-center space-x-1 text-[10px] font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Resolved</span>
                        </span>
                      ) : (
                        <span className="text-rose-400 text-[10px] font-bold bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/30">
                          ● Active
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      {!ev.resolved && can('RESOLVE_SECURITY') ? (
                        <button
                          onClick={() => handleResolve(ev.id)}
                          disabled={resolvingId === ev.id}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 text-slate-200 rounded-xl font-bold text-[11px] transition border border-slate-700 hover:border-emerald-500/40 disabled:opacity-50"
                        >
                          {resolvingId === ev.id ? 'Mitigating...' : 'Mitigate & Resolve'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">-</span>
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
