import React from 'react';
import { X, Bell, CheckCircle2, ShieldAlert, KeyRound, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const mockNotifications = [
    {
      id: '1',
      title: 'Access Authorization Request Pending',
      message: 'Adv. Meenakshi Sundaram submitted clearance request for RESTRICTED wiretap brief.',
      time: '12 mins ago',
      type: 'ACCESS',
      link: '/access-requests',
    },
    {
      id: '2',
      title: 'Cryptographic Ledger Re-anchored',
      message: 'Block #5 validated across NCRB and CFSL consensus nodes.',
      time: '1 hour ago',
      type: 'SUCCESS',
      link: '/integrity',
    },
    {
      id: '3',
      title: 'Threat Shield Advisory',
      message: 'Shri R. K. Swaminathan (Auditor) clearance check flagged on Case #CASE-2026-001.',
      time: '3 hours ago',
      type: 'SECURITY',
      link: '/security',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0F172A] border border-cyan-500/30 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden mt-2 ring-1 ring-black/40">
        <div className="p-3.5 border-b border-[#1E293B] flex items-center justify-between bg-[#0B1120]">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white tracking-wider uppercase">
              Operational Notifications
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80 max-h-80 overflow-y-auto">
          {mockNotifications.map((n) => (
            <div key={n.id} className="p-3.5 hover:bg-slate-800/50 transition flex items-start space-x-3">
              {n.type === 'ACCESS' && (
                <div className="p-1.5 rounded-lg bg-amber-950/70 border border-amber-500/30 text-amber-400 mt-0.5 flex-shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
              )}
              {n.type === 'SUCCESS' && (
                <div className="p-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 mt-0.5 flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {n.type === 'SECURITY' && (
                <div className="p-1.5 rounded-lg bg-rose-950/70 border border-rose-500/30 text-rose-400 mt-0.5 flex-shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              )}
              <div className="space-y-1 text-xs">
                <Link
                  to={n.link}
                  onClick={onClose}
                  className="font-semibold text-slate-200 hover:text-cyan-300 block transition-colors"
                >
                  {n.title}
                </Link>
                <p className="text-[11px] text-slate-400 leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-slate-500 font-mono block">{n.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold transition"
          >
            Mark all acknowledged
          </button>
        </div>
      </div>
    </div>
  );
}
