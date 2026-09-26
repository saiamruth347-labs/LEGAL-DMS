import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderLock,
  FileText,
  Sparkles,
  Link2,
  KeyRound,
  History,
  ShieldAlert,
  FileSpreadsheet,
  Settings,
  Upload,
  SearchCheck,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ onOpenUpload, onOpenVerify }) {
  const { user, hasRole, can } = useAuth();

  const isCitizen = user?.role === 'CITIZEN';

  const navSections = isCitizen
    ? [
        {
          title: 'Citizen Services Portal',
          items: [
            { to: '/', label: 'Citizen Services & FIRs', icon: LayoutDashboard },
            { to: '/integrity', label: 'Public Chain Ledger', icon: Link2, badge: 'BC' },
            { to: '/reports', label: 'Section 63 BNSS Rules', icon: FileSpreadsheet },
          ],
        },
      ]
    : [
        {
          title: 'Custody Operations',
          items: [
            { to: '/', label: 'Command Dashboard', icon: LayoutDashboard },
            { to: '/cases', label: 'Case Management', icon: FolderLock },
            { to: '/documents', label: 'Document Vault', icon: FileText },
          ],
        },
        {
          title: 'Chain & Intelligence',
          items: [
            { to: '/integrity', label: 'Blockchain Ledger', icon: Link2, badge: 'BC' },
            { to: '/ai-intelligence', label: 'AI Intelligence Studio', icon: Sparkles, badge: 'AI' },
          ],
        },
        {
          title: 'Compliance & Defense',
          items: [
            { to: '/access-requests', label: 'Access Clearances', icon: KeyRound },
            { to: '/audit', label: 'Forensic Audit Trail', icon: History },
            { to: '/security', label: 'Cyber Threat Center', icon: ShieldAlert, badge: 'SEC' },
            { to: '/reports', label: 'Section 63 BNSS Reports', icon: FileSpreadsheet },
          ],
        },
      ];

  if (!isCitizen && hasRole('SUPER_ADMIN')) {
    navSections.push({
      title: 'Supervisory Control',
      items: [{ to: '/admin', label: 'Master Administration', icon: Settings }],
    });
  }

  return (
    <aside className="w-64 bg-[#0B1120] border-r border-[#1E293B] flex flex-col flex-shrink-0 h-[calc(100vh-4rem)] select-none shadow-xl">
      {/* Quick Action Buttons */}
      <div className="p-3.5 border-b border-[#1E293B] space-y-2">
        {can('UPLOAD') && (
          <button
            onClick={onOpenUpload}
            className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-950/40 hover:shadow-cyan-500/20 transition-all duration-200 group active:scale-[0.98]"
          >
            <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            <span>Ingest Document</span>
          </button>
        )}
        <button
          onClick={onOpenVerify}
          className="w-full flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:border-cyan-400 hover:text-white transition-all duration-200 active:scale-[0.98]"
        >
          <SearchCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>Verify Integrity</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1 flex items-center justify-between">
              <span>{section.title}</span>
            </div>

            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/50 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10 font-semibold'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-2.5">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] bg-cyan-950/90 text-cyan-300 font-mono px-1.5 py-0.2 rounded font-bold border border-cyan-500/30">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Security Badge */}
      <div className="p-3.5 border-t border-[#1E293B] bg-[#080D18]">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>FIPS 180-4 Standard</span>
          </span>
          <span className="font-mono text-emerald-400 text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
            COMPLIANT
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Hash Chaining</span>
          <span className="text-cyan-400 font-semibold">SHA-256 Tamper-Proof</span>
        </div>
      </div>
    </aside>
  );
}
