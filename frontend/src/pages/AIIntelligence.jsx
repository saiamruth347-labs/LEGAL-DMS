import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  FileText,
  ShieldAlert,
  ArrowRight,
  BrainCircuit,
  Tag,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api';

export default function AIIntelligence() {
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'summarizer', 'classifier'

  // Smart Search State
  const [nlpQuery, setNlpQuery] = useState(
    'Show witness statements related to Case 102 uploaded in August'
  );
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  // Summarizer State
  const [sampleText, setSampleText] = useState(
    `COMPLAINANT STATEMENT: Ms. Priya Sen, residing at Sector 14 Dwarka New Delhi, states that administrators of the instant-loan app RupeeInstant247 demanded INR 3,50,000 using morphed media transmitted to her family. Offenses involve Section 74 and Section 318(4) Bharatiya Nyaya Sanhita (BNS) along with Section 66D IT Act. Lead investigator Insp. Vikram Rathore seized device containing spyware APK communicating with overseas IP addresses.`
  );
  const [summarizing, setSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState(null);

  // Classifier State
  const [classifyText, setClassifyText] = useState(
    'CENTRAL FORENSIC SCIENCE LABORATORY: Examination of mobile device reveals APK extraction and hardcoded command & control IP addresses routing to foreign server. Audio spectral analysis confirms AI voice cloning.'
  );
  const [classifying, setClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState(null);

  const sampleQueries = [
    'Show witness statements related to Case 102 uploaded in August',
    'Find confidential forensic reports regarding deepfake extortion',
    'Show FIR complaints in Women Safety division',
    'Find restricted intelligence wiretaps',
  ];

  const handleNlpSearch = async (queryText) => {
    const q = queryText || nlpQuery;
    setNlpQuery(q);
    setSearching(true);
    try {
      const res = await api.aiSmartSearch(q);
      if (res.success) {
        setSearchResults(res);
      }
    } catch (err) {
      console.warn('AI search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const res = await api.aiSummarize({
        text: sampleText,
        title: 'Evidentiary Record Analysis',
        category: 'INVESTIGATION_RECORD',
        caseId: 'CASE-2026-001',
      });
      if (res.success) {
        setSummaryResult(res.analysis);
      }
    } catch (err) {
      console.warn('AI summarize error:', err);
    } finally {
      setSummarizing(false);
    }
  };

  const handleClassify = async () => {
    setClassifying(true);
    try {
      const res = await api.aiClassify(classifyText, 'Sample_Filing.txt');
      if (res.success) {
        setClassificationResult(res.classification);
      }
    } catch (err) {
      console.warn('AI classify error:', err);
    } finally {
      setClassifying(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">
            NATURAL LANGUAGE & HEURISTIC ENGINE
          </span>
          <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full font-mono border border-purple-500/30">
            FIPS-COMPLIANT AI
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white mt-1">AI Document Intelligence Studio</h1>
        <p className="text-xs text-slate-400">
          Semantic natural-language retrieval, automated legal section extraction, and document classification
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('search')}
          className={`pb-3.5 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'search'
              ? 'border-purple-400 text-purple-300 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Semantic Smart Search</span>
        </button>
        <button
          onClick={() => setActiveTab('summarizer')}
          className={`pb-3.5 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'summarizer'
              ? 'border-purple-400 text-purple-300 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Summarizer & Entity Extractor</span>
        </button>
        <button
          onClick={() => setActiveTab('classifier')}
          className={`pb-3.5 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'classifier'
              ? 'border-purple-400 text-purple-300 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Automated Classification</span>
        </button>
      </div>

      {/* TAB 1: Smart Search */}
      {activeTab === 'search' && (
        <div className="space-y-5">
          <div className="cyber-card rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Natural Language Legal Query</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={nlpQuery}
                  onChange={(e) => setNlpQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNlpSearch()}
                  placeholder="e.g. Show witness statements related to Case 102 uploaded in August"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-3 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleNlpSearch()}
                disabled={searching}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-md"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Semantic Search</span>
              </button>
            </div>

            {/* Query Chips */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] text-slate-400 font-semibold block">Try sample natural queries:</span>
              <div className="flex flex-wrap gap-2">
                {sampleQueries.map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => handleNlpSearch(sq)}
                    className="text-[11px] bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-purple-400/50 rounded-full px-3.5 py-1.5 transition text-left"
                  >
                    "{sq}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Interpretation and Results */}
          {searchResults && (
            <div className="space-y-4 animate-in fade-in">
              {/* Query Interpretation Card */}
              <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-4.5 text-xs space-y-2">
                <span className="font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Query Intent Interpretation</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px] pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Filter Category:</span>
                    <span className="text-cyan-400 font-bold">{searchResults.interpretedQuery.detectedCategory}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Target Case:</span>
                    <span className="text-emerald-400 font-bold">{searchResults.interpretedQuery.detectedCaseId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Classification Filter:</span>
                    <span className="text-amber-400 font-bold">{searchResults.interpretedQuery.detectedClassification}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Semantic Matches:</span>
                    <span className="text-white font-bold">{searchResults.totalResults} Found</span>
                  </div>
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.results.map((doc) => (
                  <div
                    key={doc.id}
                    className="cyber-card rounded-2xl p-5 shadow-sm space-y-3 transition hover:border-purple-400/40"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold text-cyan-400">{doc.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          doc.classification === 'RESTRICTED'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {doc.classification}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">{doc.title}</h3>
                      <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{doc.summary}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="font-mono text-slate-500 text-[10px]">
                        Case: {doc.case?.id}
                      </span>
                      <Link
                        to={`/documents/${doc.id}`}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-bold"
                      >
                        <span>Inspect Record</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Summarizer & Entity Extractor */}
      {activeTab === 'summarizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 cyber-card rounded-2xl p-5 lg:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <BrainCircuit className="w-4 h-4 text-purple-400" />
              <span>Input Evidentiary Text</span>
            </h2>
            <textarea
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              rows={8}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-xs text-white font-mono focus:border-purple-400 focus:outline-none leading-relaxed"
            />
            <button
              onClick={handleSummarize}
              disabled={summarizing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-md"
            >
              {summarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
              <span>EXTRACT SUMMARY & LEGAL ENTITIES</span>
            </button>
          </div>

          <div className="lg:col-span-6 cyber-card rounded-2xl p-5 lg:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white">Extracted Analysis</h2>
              {summaryResult && (
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  CONFIDENCE: {(summaryResult.confidenceScore * 100).toFixed(0)}%
                </span>
              )}
            </div>

            {summaryResult ? (
              <div className="space-y-4 text-xs animate-in fade-in">
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-semibold block text-[11px]">Executive Summary:</span>
                  <p className="text-slate-200 bg-slate-950 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                    {summaryResult.summary}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-slate-400 font-semibold block text-[11px]">Key Procedural Takeaways:</span>
                  <ul className="space-y-1 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-slate-300">
                    {summaryResult.keyPoints?.map((kp, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {summaryResult.entities?.sections && (
                  <div className="space-y-1.5">
                    <span className="text-slate-400 font-semibold block text-[11px]">Identified Statutory Sections:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {summaryResult.entities.sections.map((sec, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 text-xs">
                Click extract to process legal text through the AI intelligence engine.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Classifier */}
      {activeTab === 'classifier' && (
        <div className="cyber-card rounded-2xl p-6 lg:p-8 shadow-sm max-w-2xl mx-auto space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Tag className="w-5 h-5 text-purple-400" />
            <span>Automated Document Classification</span>
          </h2>
          <p className="text-xs text-slate-400">
            Paste unclassified document text to test our automatic legal classification model:
          </p>

          <textarea
            value={classifyText}
            onChange={(e) => setClassifyText(e.target.value)}
            rows={4}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-xs text-white font-mono focus:border-purple-400 focus:outline-none"
          />

          <button
            onClick={handleClassify}
            disabled={classifying}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all duration-200 active:scale-95"
          >
            {classifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
            <span>PREDICT CLASSIFICATION CATEGORY</span>
          </button>

          {classificationResult && (
            <div className="p-4.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2.5 animate-in fade-in shadow-glow-purple">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Predicted Category:</span>
                <span className="font-mono font-bold text-cyan-300 text-sm">
                  {classificationResult.category}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Confidence Score:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {(classificationResult.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-[11px] text-slate-300 pt-2 border-t border-purple-500/20 leading-relaxed">
                Reasoning: {classificationResult.reasoning}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
