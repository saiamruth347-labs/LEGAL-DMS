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
  Radio,
  Flame,
  Shield,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CyberBentoCard from '../components/CyberBentoCard';

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

  const riskScore = overview?.riskScore || 12;
  const circumference = 2 * Math.PI * 28; // r=28
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              NATIONAL CYBER THREAT MONITORING
            </span>
            <span className="text-[10px] bg-rose-950/80 text-rose-300 px-2.5 py-0.5 rounded-full font-mono border border-rose-500/40">
              C-DOC ACTIVE
            </span>
            <span className="text-[10px] bg-cyan-950/80 text-cyan-300 px-2.5 py-0.5 rounded-full font-mono border border-cyan-500/40">
              5FA ENFORCED
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1.5">Cybersecurity & Threat Operations</h1>
          <p className="text-xs text-slate-400">
            Real-time brute-force mitigation, IP geofencing, passkey attestation, and cryptographic anomaly response
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={loadSecurityData}
          className="p-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-bold flex items-center space-x-2 transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Threat Feed</span>
        </motion.button>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 text-xs flex items-center space-x-2.5 shadow-sm">
          <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Threat Metrics & Risk Score Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Risk Score Meter */}
        <CyberBentoCard glow="cyan" className="p-5 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Security Risk Score
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-extrabold text-cyan-400 font-mono">{riskScore}</span>
              <span className="text-xs text-slate-500 font-mono">/ 100</span>
            </div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{overview?.riskLevel || 'LOW RISK'}</span>
            </div>
          </div>

          {/* Circular SVG Gauge */}
          <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="5"
                fill="transparent"
                className="text-slate-800"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - riskScore / 100)}
                strokeLinecap="round"
                className="text-cyan-400 transition-all duration-1000 ease-out"
              />
            </svg>
            <Shield className="w-5 h-5 text-cyan-400 absolute" />
          </div>
        </CyberBentoCard>

        {/* Unresolved Threats */}
        <CyberBentoCard glow="crimson" className="p-5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Threats</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400 font-mono">
            {overview?.totalUnresolvedThreats || 0}
          </div>
          <div className="text-xs text-rose-600 dark:text-rose-300 font-semibold">Requiring supervisory action</div>
        </CyberBentoCard>

        {/* Failed Login Attempts */}
        <CyberBentoCard glow="amber" className="p-5 space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Failed Logins Monitored</span>
          <div className="text-3xl font-extrabold text-amber-500 dark:text-amber-400 font-mono">
            {overview?.failedLoginsCount || 0}
          </div>
          <div className="text-xs text-amber-700 dark:text-amber-300 font-semibold">Locked after 5 attempts</div>
        </CyberBentoCard>

        {/* Account Lockouts */}
        <CyberBentoCard glow="purple" className="p-5 space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Locked Consoles</span>
          <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-300 font-mono">
            {overview?.lockedUsersCount || 0}
          </div>
          <div className="text-xs text-purple-700 dark:text-purple-300 font-semibold">Lockout auto-expires in 15m</div>
        </CyberBentoCard>
      </div>

      {/* AI Anomaly Insights Banner */}
      {overview?.anomalies && overview.anomalies.length > 0 && (
        <CyberBentoCard glow="crimson" className="p-5 space-y-2.5">
          <div className="flex items-center space-x-2 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
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
        </CyberBentoCard>
      )}

      {/* Incident Log Table */}
      <CyberBentoCard glow="crimson" className="p-0 overflow-hidden space-y-0">
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
      </CyberBentoCard>
    </div>
  );
}
