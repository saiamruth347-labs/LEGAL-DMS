import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  Building,
  Shield,
  Unlock,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Check,
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('users'); // users, departments, settings
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, deptsRes, setRes] = await Promise.all([
        api.getUsers(),
        api.getDepartments(),
        api.getSystemSettings(),
      ]);

      if (usersRes.success) setUsers(usersRes.users);
      if (deptsRes.success) setDepartments(deptsRes.departments);
      if (setRes.success) setSettings(setRes.settings);
    } catch (err) {
      console.warn('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await api.toggleUserStatus(id, !currentStatus);
      if (res.success) {
        setMessage(`User status updated to ${!currentStatus ? 'Active' : 'Inactive'}`);
        loadAdminData();
      }
    } catch (err) {
      setMessage('Status update failed: ' + err.message);
    }
  };

  const handleResetLockout = async (id) => {
    try {
      const res = await api.resetLockout(id);
      if (res.success) {
        setMessage(res.message);
        loadAdminData();
      }
    } catch (err) {
      setMessage('Reset lockout failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              CENTRAL ADMINISTRATOR CONSOLE
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono border border-slate-700">
              ROOT CLEARANCE
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">System Administration & RBAC</h1>
          <p className="text-xs text-slate-400">
            Manage law enforcement personnel, departmental divisions, and system security thresholds
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="p-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-2 transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Records</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 text-xs flex items-center space-x-2.5 shadow-sm">
          <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3.5 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'users'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Personnel Directory ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3.5 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'departments'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Departmental Divisions ({departments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3.5 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'settings'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security & Blockchain Settings</span>
        </button>
      </div>

      {/* TAB 1: Users */}
      {activeTab === 'users' && (
        <div className="cyber-card rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-24 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="font-mono">Loading personnel directory...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B1120] text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Personnel Name</th>
                    <th className="p-3.5">Official Email</th>
                    <th className="p-3.5">Badge ID</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Lockout Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-white whitespace-nowrap">
                        {u.fullName}
                      </td>
                      <td className="p-3.5 font-mono text-slate-300 whitespace-nowrap">
                        {u.email}
                      </td>
                      <td className="p-3.5 font-mono text-cyan-400 font-bold whitespace-nowrap">
                        {u.badgeNumber}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="text-[10px] font-mono text-slate-200 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-300">
                        {u.department?.name || 'NCRB HQ'}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            u.isActive
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Revoked'}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {u.isLocked ? (
                          <span className="text-rose-400 font-bold text-[10px] flex items-center space-x-1 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            <span>LOCKED (5 Failed Attempts)</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Normal ({u.failedLoginAttempts}/5)</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                        {u.isLocked && (
                          <button
                            onClick={() => handleResetLockout(u.id)}
                            className="px-3 py-1.5 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-300 font-bold text-[11px] transition border border-amber-500/40"
                            title="Clear lockout"
                          >
                            Unlock Console
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(u.id, u.isActive)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition ${
                            u.isActive
                              ? 'bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border border-slate-700 hover:border-rose-500/40'
                              : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/40'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Departments */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((d) => (
            <div
              key={d.id}
              className="cyber-card rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  {d.code}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {d._count?.users || 0} Officers Assigned
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{d.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{d.description}</p>
              </div>
              <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800 flex justify-between items-center font-medium">
                <span>Active Cases: {d._count?.cases || 0}</span>
                <span className="text-emerald-400 font-mono">Jurisdiction Operational</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: System Settings */}
      {activeTab === 'settings' && settings && (
        <div className="cyber-card rounded-2xl p-6 lg:p-8 shadow-sm max-w-2xl mx-auto space-y-4 text-xs">
          <h2 className="text-base font-bold text-white">System Security Policies</h2>

          <div className="space-y-3 font-mono">
            <div className="flex justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-sans font-medium">Standard Hashing Algorithm:</span>
              <span className="text-emerald-400 font-bold">{settings.hashingAlgorithm}</span>
            </div>
            <div className="flex justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-sans font-medium">Blockchain Protocol:</span>
              <span className="text-cyan-400 font-bold">{settings.blockchainProtocol}</span>
            </div>
            <div className="flex justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-sans font-medium">Max Failed Logins Before Lockout:</span>
              <span className="text-white font-bold">{settings.maxFailedLogins} Attempts</span>
            </div>
            <div className="flex justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-sans font-medium">Lockout Timeout Duration:</span>
              <span className="text-white font-bold">{settings.lockoutDurationMinutes} Minutes</span>
            </div>
            <div className="flex justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-sans font-medium">Storage Architecture:</span>
              <span className="text-white font-bold">{settings.storageEngine}</span>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-400 block font-sans font-medium">Consensus Network Validator Nodes:</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {settings.activeNodes?.map((node, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold"
                  >
                    ● {node}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
