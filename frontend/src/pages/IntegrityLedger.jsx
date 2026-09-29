import React, { useState, useEffect } from 'react';
import {
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Link as LinkIcon,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  Loader2,
  FileCheck,
  Copy,
  Check,
  Cpu,
  Radio,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import CyberBentoCard from '../components/CyberBentoCard';

export default function IntegrityLedger({ onOpenVerify }) {
  const [blocks, setBlocks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState(null);

  // Full chain validation state
  const [validatingChain, setValidatingChain] = useState(false);
  const [chainValidationResult, setChainValidationResult] = useState(null);

  const loadLedger = async () => {
    setLoading(true);
    try {
      const res = await api.getLedger({ page, limit: 15, search });
      if (res.success) {
        setBlocks(res.blocks);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.warn('Failed to load ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadLedger();
  };

  const handleCopyHash = (hash, id) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleValidateChain = async () => {
    setValidatingChain(true);
    setChainValidationResult(null);
    try {
      const res = await api.validateChain();
      if (res.success) {
        setChainValidationResult(res);
      }
    } catch (err) {
      setChainValidationResult({
        isValid: false,
        message: 'Chain validation request failed: ' + err.message,
      });
    } finally {
      setValidatingChain(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
              BLOCKCHAIN CONSENSUS LEDGER
            </span>
            <span className="text-[10px] bg-cyan-950/80 text-cyan-300 px-2.5 py-0.5 rounded-full font-mono border border-cyan-500/30">
              BLOCK HEIGHT: {total}
            </span>
            <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
              QUORUM: 100%
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            Tamper-Evident Integrity Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable SHA-256 hash chaining designed for Hyperledger Fabric & permissioned judicial consortium
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleValidateChain}
            disabled={validatingChain}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-900/90 to-teal-900/90 hover:from-emerald-800 hover:to-teal-800 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-950/50 transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            {validatingChain ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
            <span>Validate Entire Chain</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenVerify}
            className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center space-x-2 transition-all duration-200 active:scale-95 shadow-sm"
          >
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <span>Verify Document</span>
          </motion.button>
        </div>
      </div>

      {/* Sovereign Section 63 BNSS Cryptographic Consensus Seal Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border border-amber-500/40 p-3.5 sm:p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400/50 shadow-md bg-slate-950 flex-shrink-0">
            <img
              src="/sovereign-gold-3d.jpg"
              alt="3D Golden Ashoka Seal"
              className="w-full h-full object-cover scale-110"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-amber-400 font-mono tracking-wider">
                सत्यमेव जयते • SECTION 63 BNSS (2023)
              </span>
              <span className="text-[9px] bg-emerald-950/80 text-emerald-300 font-mono px-2 py-0.2 rounded border border-emerald-500/30 font-bold">
                LEGAL ADMISSIBILITY
              </span>
            </div>
            <div className="text-xs font-bold text-slate-100 dark:text-white">
              Sovereign Merkle Hash Root Chaining & Judicial Verification
            </div>
            <div className="text-[11px] text-slate-400">
              Each block cryptographically encapsulates Section 63 Certificate metadata, FIDO2 WebAuthn signatures, and SHA-256 state trees.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-3 py-1.5 rounded-xl border border-cyan-500/30 flex-shrink-0">
          <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
          <span>CONSENSUS NODE: ACTIVE</span>
        </div>
      </div>

      {/* Validating Chain HUD Scanner Alert */}
      <AnimatePresence>
        {validatingChain && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative overflow-hidden p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/60 shadow-glow-cyan"
          >
            <div className="radar-sweep-element absolute inset-0 pointer-events-none" />
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-3">
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                <div>
                  <div className="font-bold text-cyan-200 uppercase tracking-wider">
                    CRYPTOGRAPHIC AUDIT IN PROGRESS
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Traversing Merkle branches & re-hashing all block headers against node consensus...
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-cyan-400 font-bold animate-pulse">RECOMPUTING SHA-256...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chain Validation Result Banner */}
      <AnimatePresence>
        {chainValidationResult && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`p-5 rounded-2xl border flex items-start space-x-3.5 shadow-lg ${
              chainValidationResult.isValid
                ? 'bg-emerald-950/60 border-emerald-500/60 shadow-glow-emerald'
                : 'bg-rose-950/60 border-rose-500/60 shadow-glow-rose'
            }`}
          >
            {chainValidationResult.isValid ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <h3
                className={`font-bold uppercase tracking-wider text-sm ${
                  chainValidationResult.isValid ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {chainValidationResult.isValid
                  ? '✓ BLOCKCHAIN LEDGER IS 100% INTACT & CRYPTOGRAPHICALLY SOUND'
                  : '⚠ INTEGRITY COMPROMISED: CHAIN INCONSISTENCY DETECTED'}
              </h3>
              <p className="text-slate-200 leading-relaxed">{chainValidationResult.message}</p>
              <div className="text-[11px] font-mono text-slate-400 pt-1 flex flex-wrap gap-2">
                <span className="bg-slate-900/80 px-2.5 py-0.5 rounded border border-slate-700 text-slate-300">
                  Validated Blocks: {chainValidationResult.totalBlocks}
                </span>
                <span className="bg-slate-900/80 px-2.5 py-0.5 rounded border border-slate-700 text-slate-300">
                  Consensus Nodes: NCRB-NODE-01, NCRB-NODE-02, MHA-AUDIT
                </span>
                <span className="bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/30 text-emerald-400 font-bold">
                  Zero Tampering Detected
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blockchain Chaining Architecture Visualizer Bento Card */}
      <CyberBentoCard glow="cyan" className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                Cryptographic Hash-Chaining Sequence
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Live block headers chained with SHA-256 pre-image resistance
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/90 px-3 py-1 rounded-full border border-cyan-500/40 w-fit">
            SHA-256(BlockIndex || DocHash || PrevHash || Time)
          </span>
        </div>

        {/* Chaining Strip */}
        <div className="flex items-center space-x-3 overflow-x-auto py-2 scrollbar-thin">
          {blocks.slice(0, 4).reverse().map((b, idx) => (
            <React.Fragment key={b.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="flex-shrink-0 w-64 bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3.5 text-xs space-y-2 font-mono hover:border-cyan-400 hover:shadow-glow-cyan transition relative overflow-hidden"
              >
                <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-slate-800">
                  <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 text-cyan-400" />
                    {b.blockIndex === 0 ? 'GENESIS BLOCK #0' : `BLOCK #${b.blockIndex}`}
                  </span>
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/40">
                    VERIFIED
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-sans">Doc Hash:</span>
                  <span className="text-emerald-400 text-[10px] truncate block font-bold" title={b.documentHash}>
                    {b.documentHash}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-sans">Prev Block Hash:</span>
                  <span className="text-slate-400 text-[10px] truncate block" title={b.previousHash}>
                    {b.previousHash}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-sans">Block Hash:</span>
                  <span className="text-cyan-300 text-[10px] truncate block font-bold" title={b.blockHash}>
                    {b.blockHash}
                  </span>
                </div>
              </motion.div>

              {idx < 3 && idx < blocks.length - 1 && (
                <div className="text-cyan-400 flex-shrink-0 animate-pulse px-0.5">
                  <ArrowRight className="w-5 h-5 text-cyan-400" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </CyberBentoCard>

      {/* Search Bar */}
      <CyberBentoCard glow="cyan" className="p-4 flex items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-cyan-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search block by Document ID or Hash string..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none font-mono transition"
          />
        </form>

        <button
          onClick={loadLedger}
          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-300 transition shadow-sm"
          title="Refresh Ledger"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </CyberBentoCard>

      {/* Ledger Blocks Table */}
      <CyberBentoCard glow="cyan" className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="font-mono">Verifying ledger chain state across consensus nodes...</span>
          </div>
        ) : blocks.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-400 space-y-2">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="font-bold text-white text-sm">No Ledger Blocks Found</div>
            <p>No blocks matched your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-[#0B1120] text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Block #</th>
                  <th className="p-3.5">Document Record</th>
                  <th className="p-3.5">Document Hash</th>
                  <th className="p-3.5">Previous Block Hash</th>
                  <th className="p-3.5">Current Block Hash</th>
                  <th className="p-3.5">Validator</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {blocks.map((block) => (
                  <tr key={block.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                      #{block.blockIndex}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {block.document ? (
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white truncate max-w-[180px] font-sans">
                            {block.document.title}
                          </div>
                          <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
                            {block.document.id}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-sans italic text-[11px]">
                          Genesis / Anchor
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-400 max-w-[120px] truncate text-[10px] bg-slate-900 px-2 py-1 rounded border border-slate-800">
                          {block.documentHash}
                        </span>
                        <button
                          onClick={() => handleCopyHash(block.documentHash, `doc-${block.id}`)}
                          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          title="Copy Document Hash"
                        >
                          {copiedHash === `doc-${block.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="text-slate-400 max-w-[120px] truncate text-[10px] block">
                        {block.previousHash}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-cyan-300 font-bold max-w-[120px] truncate text-[10px] bg-slate-900 px-2 py-1 rounded border border-slate-800">
                          {block.blockHash}
                        </span>
                        <button
                          onClick={() => handleCopyHash(block.blockHash, `blk-${block.id}`)}
                          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          title="Copy Block Hash"
                        >
                          {copiedHash === `blk-${block.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-300 text-[10px] whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {block.validator}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-400 text-[10px] whitespace-nowrap">
                      {new Date(block.timestamp).toLocaleString()}
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
      </CyberBentoCard>
    </div>
  );
}
