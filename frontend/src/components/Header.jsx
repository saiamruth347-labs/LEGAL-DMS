import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Bell,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ChevronDown,
  ShieldAlert,
  Clock,
  Radio,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Header({ onOpenNotifications }) {
  const { user, logout, switchDemoRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      const dateStr = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      });
      setCurrentTime(`${dateStr} • ${timeStr} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const roles = [
    {
      key: 'CHIEF_ADMIN',
      email: 'ganesh@ncrb-demo.gov',
      label: 'Chief Super Admin (Master)',
      name: 'IPS Manoj Kumar Sharma (DG, NCRB)',
      badge: 'NCRB-DG-001',
      desc: 'Master Command: All cases, blockchain ledger, threat center',
      color: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/40',
    },
    {
      key: 'SUPER_ADMIN',
      email: 'admin@ncrb-demo.gov',
      label: 'Super Admin',
      name: 'IPS Rajiv Ranjan (Joint Director)',
      badge: 'NCRB-ADM-001',
      desc: 'System settings, user directory, global oversight',
      color: 'border-purple-500/50 text-purple-400 bg-purple-950/40',
    },
    {
      key: 'INVESTIGATING_OFFICER',
      email: 'officer@ncrb-demo.gov',
      label: 'Investigating Officer',
      name: 'Insp. Vikramaditya Chauhan',
      badge: 'NCRB-INV-104',
      desc: 'Case creation, FIR upload, evidence custody',
      color: 'border-blue-500/50 text-blue-400 bg-blue-950/40',
    },
    {
      key: 'LEGAL_OFFICER',
      email: 'legal@ncrb-demo.gov',
      label: 'Legal Officer',
      name: 'Adv. Meenakshi Sundaram',
      badge: 'NCRB-LEG-202',
      desc: 'Case legal review, court filings, digital signature',
      color: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/40',
    },
    {
      key: 'REVIEWER',
      email: 'reviewer@ncrb-demo.gov',
      label: 'Reviewer / Dy. SP',
      name: 'Dy. SP Anita Deshmukh, SPS',
      badge: 'NCRB-REV-305',
      desc: 'Supervisory review, approve/reject clearance requests',
      color: 'border-amber-500/50 text-amber-400 bg-amber-950/40',
    },
    {
      key: 'AUDITOR',
      email: 'auditor@ncrb-demo.gov',
      label: 'Compliance Auditor',
      name: 'Shri R. K. Swaminathan (Auditor)',
      badge: 'NCRB-AUD-401',
      desc: 'Blockchain ledger verification, immutable audit trail, CSV export',
      color: 'border-indigo-500/50 text-indigo-400 bg-indigo-950/40',
    },
  ];

  const handleRoleSwitch = async (r) => {
    setRoleMenuOpen(false);
    try {
      if (r.key === 'CHIEF_ADMIN') {
        await switchDemoRole('SUPER_ADMIN');
      } else {
        await switchDemoRole(r.key);
      }
    } catch (e) {
      alert('Role switch failed: ' + e.message);
    }
  };

  return (
    <header className="h-16 bg-[#0B1120] border-b border-[#1E293B] px-4 lg:px-6 flex items-center justify-between z-30 sticky top-0 backdrop-blur-md shadow-md relative">
      {/* Sovereign National Tricolour Micro Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-90 shadow-[0_0_6px_rgba(255,153,51,0.4)] pointer-events-none" />

      {/* Left: Sovereign Emblem & Agency Title */}
      <div className="flex items-center space-x-3.5">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-500/60 shadow-md shadow-amber-900/30 group-hover:border-amber-400 group-hover:shadow-amber-500/30 group-hover:scale-105 transition-all duration-300 bg-slate-900 flex items-center justify-center ring-1 ring-white/10">
              <img
                src="/sovereign-emblem.jpg"
                alt="State Emblem of India & Legislative Dome"
                className="w-full h-full object-cover object-top scale-110 group-hover:scale-125 transition-transform duration-500"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#0B1120] rounded-full animate-pulse shadow-[0_0_6px_#10B981]"></span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300 drop-shadow-sm flex items-center space-x-1">
                <span>सत्यमेव जयते</span>
                <span className="text-slate-400 dark:text-slate-500 font-normal">|</span>
                <span className="text-cyan-700 dark:text-cyan-400 font-semibold">NCRB • MHA</span>
              </span>
              <span className="text-[10px] bg-cyan-100 dark:bg-gradient-to-r dark:from-cyan-950 dark:to-blue-950 text-cyan-800 dark:text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-300 dark:border-cyan-500/30 font-mono font-bold shadow-sm">
                SIH26190
              </span>
            </div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-200 transition-colors">
              Secure Digital Custody & Investigation Platform
            </h1>
          </div>
        </Link>
      </div>

      {/* Center: Live Clock & System Status Badges */}
      <div className="hidden xl:flex items-center space-x-2.5 text-xs">
        {/* Live IST Clock */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 font-mono text-[11px] shadow-sm">
          <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="font-semibold">{currentTime || 'IST Live'}</span>
        </div>

        {/* Operational Status */}
        <Link
          to="/"
          className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-400 hover:opacity-90 transition shadow-sm group"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-[11px]">System: Operational</span>
        </Link>

        {/* Blockchain Status */}
        <Link
          to="/integrity"
          className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-300 dark:bg-cyan-950/60 dark:border-cyan-500/40 dark:text-cyan-300 hover:opacity-90 transition shadow-sm group"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-sky-700 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-[11px]">Chain: Verified</span>
        </Link>

        {/* Security Risk Center Link */}
        <Link
          to="/security"
          className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/50 dark:border-rose-500/40 dark:text-rose-300 hover:opacity-90 transition shadow-sm"
          title="Open Dedicated Security Center"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
          <span className="font-bold text-[11px]">Risk: Active Threat Mitigation</span>
        </Link>
      </div>

      {/* Right: Demo Role Switcher, Profile, Theme Toggle & Controls */}
      <div className="flex items-center space-x-2.5">
        {/* Quick Demo Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-900/90 dark:border-cyan-500/40 dark:text-cyan-300 dark:hover:bg-slate-800 text-xs transition-all duration-200 shadow-sm group"
            title="Fast switch identity for Hackathon Demo evaluation"
          >
            <UserCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline font-semibold text-slate-600 dark:text-slate-300 text-[11px]">Demo Role:</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-xs tracking-wide">
              {user?.role?.replace('_', ' ')}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${roleMenuOpen ? 'rotate-180 text-cyan-600 dark:text-cyan-400' : ''}`} />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0F172A] border border-cyan-500/30 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 ring-1 ring-black/40">
              <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>SIH Demo Identity Switcher</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Click any persona to test RBAC clearances</div>
                </div>
                <span className="text-[9px] bg-cyan-950 text-cyan-300 font-mono px-1.5 py-0.5 rounded border border-cyan-500/30">
                  1-Click
                </span>
              </div>

              <div className="max-h-96 overflow-y-auto p-1.5 space-y-1">
                {roles.map((r) => {
                  const isActive =
                    user?.role === r.key || (r.key === 'CHIEF_ADMIN' && (user?.fullName?.includes('Ganesh') || user?.fullName?.includes('Manoj') || user?.badgeNumber?.includes('DG') || user?.badgeNumber === 'GANESH'));
                  return (
                    <button
                      key={r.key}
                      onClick={() => handleRoleSwitch(r)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-start justify-between transition-all ${
                        isActive
                          ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-200 shadow-sm'
                          : 'hover:bg-slate-800/70 text-slate-300 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="space-y-0.5 pr-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-white">{r.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({r.badge})</span>
                        </div>
                        <div className="text-[11px] font-medium text-cyan-400">{r.label}</div>
                        <div className="text-[10px] text-slate-400 leading-tight">{r.desc}</div>
                      </div>
                      {isActive && (
                        <span className="flex-shrink-0 text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                          ACTIVE
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="hidden lg:flex items-center space-x-2.5 border-l border-slate-300 dark:border-slate-800/80 pl-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 border border-cyan-400/40 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {user?.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'OF'}
          </div>
          <div className="text-left text-xs">
            <div className="font-bold text-slate-900 dark:text-slate-200 leading-tight truncate max-w-[120px]">{user?.fullName}</div>
            <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-mono font-bold tracking-tight">{user?.badgeNumber || 'NCRB-SEC'}</div>
          </div>
        </div>

        {/* Theme Mode Toggle (Light/Dark) */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors shadow-sm"
          title="Agency System Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400 ring-2 ring-white dark:ring-[#0B1120]"></span>
        </button>

        {/* Secure Logout */}
        <button
          onClick={logout}
          className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition-colors shadow-sm"
          title="Secure Officer Logout"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
