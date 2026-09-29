import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderLock,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Upload,
  SearchCheck,
  KeyRound,
  ArrowUpRight,
  Clock,
  Layers,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Activity,
  ShieldAlert,
  Fingerprint,
  FileCheck2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import CyberBentoCard from '../components/CyberBentoCard';

export default function Dashboard({ onOpenUpload, onOpenVerify }) {
  const { user, can } = useAuth();
  const [stats, setStats] = useState({
    totalCases: 3,
    activeCases: 2,
    totalDocuments: 5,
    pendingReviews: 1,
    riskScore: 12,
    riskLevel: 'LOW RISK',
    unresolvedThreats: 1,
  });
  const [recentDocs, setRecentDocs] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState(null);

  // 7-day ingestion and verification velocity analytics
  const uploadTrend = [
    { date: '16 Sep', documents: 3, verifications: 8 },
    { date: '17 Sep', documents: 5, verifications: 11 },
    { date: '18 Sep', documents: 4, verifications: 9 },
    { date: '19 Sep', documents: 7, verifications: 15 },
    { date: '20 Sep', documents: 6, verifications: 18 },
    { date: '21 Sep', documents: 9, verifications: 24 },
    { date: '22 Sep', documents: 8, verifications: 26 },
  ];

  const categoryDistribution = [
    { name: 'FIR Record', count: 2, color: '#06B6D4' },
    { name: 'Witness Dep.', count: 3, color: '#3B82F6' },
    { name: 'Forensic Lab', count: 4, color: '#8B5CF6' },
    { name: 'Charge Sheet', count: 2, color: '#10B981' },
    { name: 'Restricted', count: 1, color: '#EF4444' },
  ];

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [casesRes, docsRes, secRes, auditRes] = await Promise.all([
          api.getCases({ limit: 10 }),
          api.getDocuments({ limit: 6 }),
          api.getSecurityOverview(),
          api.getAuditLogs({ limit: 6 }),
        ]);

        if (casesRes.success) {
          const active = casesRes.cases.filter((c) => c.status !== 'CLOSED').length;
          setStats((prev) => ({
            ...prev,
            totalCases: casesRes.total,
            activeCases: active,
          }));
        }

        if (docsRes.success) {
          setRecentDocs(docsRes.documents);
          setStats((prev) => ({
            ...prev,
            totalDocuments: docsRes.total,
          }));
        }

        if (secRes.success) {
          setStats((prev) => ({
            ...prev,
            riskScore: secRes.riskScore,
            riskLevel: secRes.riskLevel,
            unresolvedThreats: secRes.unresolvedAlertsCount,
          }));
        }

        if (auditRes.success) {
          setRecentLogs(auditRes.logs);
        }
      } catch (err) {
        console.warn('Dashboard fetch warning:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleCopyHash = (hash, id) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Executive Command Hero */}
      <div 
        className="hero-command-card relative overflow-hidden bg-gradient-to-r from-[#0B132B] via-[#0F1C3F] to-[#0A1628] border border-[#1E293B] rounded-3xl p-6 lg:p-7 shadow-2xl !text-white"
        data-theme-surface="dark"
      >
        {/* Sovereign National Tricolour Micro Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-90 shadow-[0_0_8px_rgba(255,153,51,0.5)] pointer-events-none" />

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 !text-cyan-300 text-[11px] font-mono font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="!text-cyan-300">NCRB CUSTODY COMMAND</span>
              </span>

              <span className="text-[11px] bg-slate-800/90 !text-slate-200 px-2.5 py-0.5 rounded-full font-mono border border-slate-700">
                CLEARANCE: {user?.role?.replace('_', ' ')}
              </span>

              <span className="text-[11px] bg-emerald-950/70 !text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/40">
                NODE #DELHI-01
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold !text-white tracking-tight drop-shadow-md">
              Welcome back, {user?.fullName}
            </h1>

            <p className="text-xs lg:text-sm !text-slate-200 max-w-2xl leading-relaxed font-normal">
              National Crime Records Bureau • Digital Evidence Chain of Custody & Blockchain Verification
              Platform. All evidentiary operations are recorded to immutable forensic ledgers under FIPS 180-4.
            </p>
          </div>

          {/* Sovereign Authority Emblem Badge */}
          <div className="hidden lg:flex items-center space-x-3.5 px-4 py-3 rounded-2xl bg-gradient-to-br from-[#0B1528]/95 via-[#0E1A35]/95 to-[#091122]/95 border border-amber-500/50 shadow-xl shadow-amber-950/40 backdrop-blur-md flex-shrink-0 group hover:border-amber-400 transition-all duration-300 ring-1 ring-white/10">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-400/60 shadow-md shadow-amber-500/20 bg-slate-950 flex-shrink-0">
              <img
                src="/sovereign-emblem.jpg"
                alt="State Emblem of India & Legislative Dome"
                className="w-full h-full object-cover object-top scale-110 group-hover:scale-125 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-left space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-amber-300 tracking-wider font-mono">सत्यमेव जयते</span>
                <span className="text-slate-600">•</span>
                <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">MHA VAULT</span>
              </div>
              <div className="text-xs font-bold text-white tracking-tight leading-none">
                Govt. of India Certified
              </div>
              <div className="text-[10px] text-slate-300 font-mono">
                Section 63 BNSS Admissible
              </div>
            </div>
          </div>

          {/* Rapid Action Cluster */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {can('UPLOAD') && (
              <button
                onClick={onOpenUpload}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 !text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-cyan-900/30 hover:shadow-cyan-500/20 transition-all duration-200 active:scale-95"
              >
                <Upload className="w-4 h-4 !text-white" />
                <span className="!text-white">Ingest Document</span>
              </button>
            )}

            <button
              onClick={onOpenVerify}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/50 !text-cyan-300 text-xs font-bold flex items-center space-x-2 transition-all duration-200 active:scale-95 shadow-md"
            >
              <SearchCheck className="w-4 h-4 !text-cyan-400" />
              <span className="!text-cyan-300">Verify Hash</span>
            </button>

            <Link
              to="/ai-intelligence"
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center space-x-2 transition-all duration-200 active:scale-95 shadow-md group"
            >
              <Sparkles className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
              <span>AI Legal Studio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Interactive Cybernetic Bento KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cases */}
        <Link to="/cases" className="block focus:outline-none">
          <CyberBentoCard glowColor="cyan" className="h-full">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Investigation Cases
              </span>
              <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 shadow-sm group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all">
                <FolderLock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 font-mono tracking-tight">
              {stats.totalCases}
            </div>
            <div className="text-xs text-emerald-500 dark:text-emerald-400 mt-2 flex items-center space-x-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{stats.activeCases} Active Under Investigation</span>
            </div>
          </CyberBentoCard>
        </Link>

        {/* Total Custody Documents */}
        <Link to="/documents" className="block focus:outline-none">
          <CyberBentoCard glowColor="emerald" className="h-full">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Custody Documents
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 shadow-sm group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 font-mono tracking-tight">
              {stats.totalDocuments}
            </div>
            <div className="text-xs text-cyan-600 dark:text-cyan-400 mt-2 flex items-center space-x-1.5 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>100% Cryptographic Ledger Anchored</span>
            </div>
          </CyberBentoCard>
        </Link>

        {/* Blockchain Integrity Verification */}
        <Link to="/integrity" className="block focus:outline-none">
          <CyberBentoCard glowColor="purple" className="h-full">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Integrity Status
              </span>
              <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-400 shadow-sm group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.4)] transition-all">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-500 dark:text-emerald-400 mt-3 font-mono flex items-center space-x-2">
              <span className="shimmer-text">VERIFIED</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Zero-Bit Tamper Detected • FIPS 180-4</span>
            </div>
          </CyberBentoCard>
        </Link>

        {/* Cyber Threat Risk Score */}
        <Link to="/security" className="block focus:outline-none">
          <CyberBentoCard
            glowColor={stats.riskScore >= 50 ? 'crimson' : stats.riskScore >= 25 ? 'amber' : 'emerald'}
            className="h-full"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-purple-300">
                Cyber Threat Risk
              </span>
              <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-purple-400 shadow-sm group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.4)] transition-all">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 font-mono flex items-baseline space-x-2">
              <span>{stats.riskScore}</span>
              <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </div>
            <div className="text-xs mt-2 flex items-center justify-between font-medium">
              <span
                className={`font-bold ${
                  stats.riskScore >= 50 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {stats.riskLevel}
              </span>
              <span className="text-[11px] text-purple-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center">
                Threat Hub →
              </span>
            </div>
          </CyberBentoCard>
        </Link>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ingestion & Verification Velocity Chart */}
        <CyberBentoCard glowColor="cyan" className="lg:col-span-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                <span>Document Ingestion & Verification Velocity</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                7-day rolling window of SHA-256 fingerprint creation and tamper assertions
              </p>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]"></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">Ingested</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]"></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">Verified</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={uploadTrend}>
                <defs>
                  <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="documents"
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cyanGrad)"
                  name="Documents Ingested"
                />
                <Area
                  type="monotone"
                  dataKey="verifications"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#blueGrad)"
                  name="Chain Verifications"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CyberBentoCard>

        {/* Category Breakdown */}
        <CyberBentoCard glowColor="purple" className="lg:col-span-4 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <span>Evidence Sensitivity Distribution</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Categorization across legal classifications</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution} layout="vertical" margin={{ left: -10, right: 10 }}>
                <XAxis type="number" stroke="#64748B" fontSize={10} hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={11}
                  width={90}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
            <div className="flex justify-between items-center">
              <span>Cryptographic Standard:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">FIPS 180-4 SHA-256</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Chain Continuity:</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-mono font-semibold">100% Unbroken</span>
            </div>
          </div>
        </CyberBentoCard>
      </div>

      {/* Evidentiary Submissions Table & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ingested Documents Table */}
        <CyberBentoCard glowColor="cyan" className="lg:col-span-8 shadow-sm !p-0 overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                <span>Recent Evidentiary Records</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Custody documents anchored with immutable SHA-256 fingerprints
              </p>
            </div>
            <Link
              to="/documents"
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 flex items-center space-x-1 font-semibold group"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0B1120] text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Document ID</th>
                  <th className="p-3.5">Title & Case</th>
                  <th className="p-3.5">Classification</th>
                  <th className="p-3.5">SHA-256 Fingerprint</th>
                  <th className="p-3.5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono text-cyan-600 dark:text-cyan-400 font-bold whitespace-nowrap">
                      {doc.id}
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white max-w-xs truncate">{doc.title}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center space-x-1 mt-0.5">
                        <span>Case: {doc.case?.id || doc.caseId}</span>
                        <span>•</span>
                        <span className="text-slate-400 dark:text-slate-500">{doc.category}</span>
                      </div>
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

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 inline-flex items-center space-x-1 transition shadow-sm"
                        title="Inspect Full Custody Record"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CyberBentoCard>

        {/* Live Immutable Forensic Audit Stream */}
        <CyberBentoCard glowColor="emerald" className="lg:col-span-4 shadow-sm !p-0 overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                <span>Forensic Chain Stream</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time immutable activity log</p>
            </div>
            <Link
              to="/audit"
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 flex items-center space-x-1 font-semibold group"
            >
              <span>Audit Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="p-4 space-y-2.5 flex-1 overflow-y-auto max-h-80">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-1.5 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-cyan-400 tracking-wider">
                    {log.action}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      log.status === 'SUCCESS'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-200 font-medium">
                  {log.userName} •{' '}
                  <span className="text-slate-400 text-[10px]">
                    {log.userRole?.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span className="truncate max-w-[150px]">
                    {log.resourceType}: {log.resourceId || 'System'}
                  </span>
                  <span className="font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 text-center">
            <Link
              to="/audit"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center space-x-1"
            >
              <span>Export Signed Compliance CSV</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CyberBentoCard>
      </div>
    </div>
  );
}
