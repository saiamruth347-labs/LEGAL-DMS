import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  KeyRound,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Sparkles,
  Globe,
  Fingerprint,
  CheckCircle2,
  Smartphone,
  Phone,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import {
  setupRecaptcha,
  sendPhoneVerification,
  verifyPhoneOtp,
} from '../services/firebase';
import {
  registerDevicePasskey,
  authenticateDevicePasskey,
} from '../services/passkey';

export default function Login() {
  const navigate = useNavigate();
  const { login, citizenLogin } = useAuth();

  // Active Main Tab: 'OFFICER' or 'CITIZEN'
  const [activeTab, setActiveTab] = useState('OFFICER');

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // -------------------------------------------------------------------------
  // 1. CITIZEN SEQUENTIAL WIZARD (Step 1: Phone OTP -> Step 2: Microsoft Passkey)
  // -------------------------------------------------------------------------
  const [citizenStep, setCitizenStep] = useState(1); // 1 = Phone, 2 = Passkey
  const [citizenPhone, setCitizenPhone] = useState('+91 98765 43210');
  const [citizenOtp, setCitizenOtp] = useState('');
  const [citizenOtpSent, setCitizenOtpSent] = useState(false);
  const [citizenConfirmation, setCitizenConfirmation] = useState(null);
  const [citizenTestCode, setCitizenTestCode] = useState(null);

  // -------------------------------------------------------------------------
  // 2. OFFICER SEQUENTIAL WIZARD (Stage 1: JWT -> Stage 2: Passkey -> Stage 3: Phone)
  // -------------------------------------------------------------------------
  const [officerStage, setOfficerStage] = useState(1); // 1 = JWT, 2 = Passkey, 3 = Phone
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerPassword, setOfficerPassword] = useState('');
  const [verifiedOfficerUser, setVerifiedOfficerUser] = useState(null);
  const [officerTempToken, setOfficerTempToken] = useState(null);
  const [officerPhone, setOfficerPhone] = useState('+91 91111 22222');
  const [officerOtp, setOfficerOtp] = useState('849201');
  const [officerOtpSent, setOfficerOtpSent] = useState(false);
  const [officerConfirmation, setOfficerConfirmation] = useState(null);

  // Demo Officer Passports for SIH Evaluation
  const demoAccounts = [
    {
      role: 'Chief Super Admin (Master)',
      email: 'ganesh@ncrb-demo.gov',
      name: 'Director Ganesh Yelchuri',
      badge: 'GANESH-001',
      phone: '+91 90000 00001',
      desc: 'Master Command Access: All cases, blockchain ledger, AI studio',
      color: 'border-cyan-400 text-cyan-300 bg-cyan-950/40 ring-1 ring-cyan-500/40',
    },
    {
      role: 'Super Admin',
      email: 'admin@ncrb-demo.gov',
      name: 'Dr. Rajesh Verma',
      badge: 'NCRB-ADM-001',
      phone: '+91 90000 00002',
      desc: 'System settings, user management, global oversight',
      color: 'border-purple-500/50 text-purple-300 bg-purple-950/30',
    },
    {
      role: 'Investigating Officer',
      email: 'officer@ncrb-demo.gov',
      name: 'Insp. Vikram Rathore',
      badge: 'NCRB-INV-104',
      phone: '+91 90000 00003',
      desc: 'Create cases, upload FIRs, versioning, evidence handling',
      color: 'border-sky-500/50 text-sky-300 bg-sky-950/30',
    },
    {
      role: 'Legal Officer / Prosecutor',
      email: 'legal@ncrb-demo.gov',
      name: 'Adv. Meera Sen',
      badge: 'NCRB-LEG-202',
      phone: '+91 90000 00004',
      desc: 'Review legal briefs, court filings, apply Section 63 BNSS signature',
      color: 'border-emerald-500/50 text-emerald-300 bg-emerald-950/30',
    },
    {
      role: 'Reviewer / Dy. SP',
      email: 'reviewer@ncrb-demo.gov',
      name: 'Dy. SP Anita Deshmukh',
      badge: 'NCRB-REV-305',
      phone: '+91 90000 00005',
      desc: 'Supervisory review, triage & approve classified access requests',
      color: 'border-amber-500/50 text-amber-300 bg-amber-950/30',
    },
    {
      role: 'Compliance Auditor',
      email: 'auditor@ncrb-demo.gov',
      name: 'Auditor R. K. Iyer',
      badge: 'NCRB-AUD-401',
      phone: '+91 90000 00006',
      desc: 'Verify blockchain integrity, immutable audit trails, export BNSS CSV',
      color: 'border-indigo-500/50 text-indigo-300 bg-indigo-950/30',
    },
  ];

  // =========================================================================
  // CITIZEN FLOW LOGIC (Step 1 -> Step 2)
  // =========================================================================
  const handleSendCitizenOtp = async (e) => {
    if (e) e.preventDefault();
    if (!citizenPhone.trim()) {
      setError('Please provide a valid mobile number with country code (e.g. +91 98765 43210)');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const appVerifier = setupRecaptcha('recaptcha-container-citizen', { size: 'invisible' });
      const res = await sendPhoneVerification(citizenPhone, appVerifier);
      setCitizenConfirmation(res.confirmationResult);
      setCitizenOtpSent(true);
      if (res.isTest && res.testCode) {
        setCitizenTestCode(res.testCode);
        setCitizenOtp(res.testCode);
      }
      setSuccessMsg('SMS verification code dispatched via Firebase Phone Gateway.');
    } catch (err) {
      setError(err.message || 'Failed to dispatch SMS verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCitizenPhone = async (e) => {
    e.preventDefault();
    if (!citizenOtp) {
      setError('Please enter the 6-digit SMS OTP code');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (citizenConfirmation) {
        await verifyPhoneOtp(citizenConfirmation, citizenOtp);
      }
      // Step 1 Passed! Advance to Step 2 (Microsoft Passkey)
      setCitizenStep(2);
      setSuccessMsg('Phone verified! Please register or tap your Microsoft Passkey to complete authentication.');
    } catch (err) {
      setError(err.message || 'Invalid SMS verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleCitizenPasskey = async () => {
    setError('');
    setLoading(true);
    try {
      // Register or authenticate Microsoft Passkey
      await registerDevicePasskey({
        username: citizenPhone,
        userType: 'CITIZEN',
        citizenPhone,
      });

      // Complete citizen login and save to Supabase
      await citizenLogin(citizenPhone, '1234');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Passkey verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCitizenDemoBypass = async () => {
    setLoading(true);
    try {
      await citizenLogin('+91 98765 43210', '1234');
      navigate('/');
    } catch (e) {
      setError('Citizen demo login failed');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // OFFICER FLOW LOGIC (Stage 1 JWT -> Stage 2 Passkey -> Stage 3 Phone)
  // =========================================================================

  // Stage 1: JWT Authentication
  const handleOfficerJwtSubmit = async (e) => {
    e.preventDefault();
    if (!officerEmail || !officerPassword) {
      setError('Please provide your Badge Number / Email and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.login(officerEmail, officerPassword, '849201');
      if (res && res.user) {
        setVerifiedOfficerUser(res.user);
        setOfficerTempToken(res.token);
        setOfficerStage(2); // Advance to Stage 2: Microsoft Passkey!
        setSuccessMsg(`Identity verified! [${res.user.fullName} • ${res.user.role}]. Proceed to Microsoft Passkey.`);
      }
    } catch (err) {
      setError(err.message || 'Invalid badge credentials or password.');
    } finally {
      setLoading(false);
    }
  };

  // Stage 2: Microsoft Passkey Authentication
  const handleOfficerPasskeySubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const user = verifiedOfficerUser;
      const res = await authenticateDevicePasskey({
        userId: user ? user.id : undefined,
        emailOrBadge: officerEmail,
      });

      if (res.verified || res.success) {
        setOfficerStage(3); // Advance to Stage 3: Official Phone Verification!
        setSuccessMsg('Microsoft Passkey signature authenticated! Proceeding to Official Phone SMS verification.');
      } else {
        throw new Error(res.message || 'Passkey authentication failed.');
      }
    } catch (err) {
      setError(err.message || 'Passkey verification failed. Ensure Windows Hello is enabled.');
    } finally {
      setLoading(false);
    }
  };

  // Stage 3: Firebase Official Phone SMS Verification
  const handleSendOfficerPhoneOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const appVerifier = setupRecaptcha('recaptcha-container-officer', { size: 'invisible' });
      const res = await sendPhoneVerification(officerPhone, appVerifier);
      setOfficerConfirmation(res.confirmationResult);
      setOfficerOtpSent(true);
      if (res.isTest && res.testCode) {
        setOfficerOtp(res.testCode);
      }
      setSuccessMsg(`Official SMS OTP dispatched to ${officerPhone}`);
    } catch (err) {
      setError(err.message || 'Failed to dispatch official SMS code');
    } finally {
      setLoading(false);
    }
  };

  const handleOfficerPhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (officerConfirmation) {
        await verifyPhoneOtp(officerConfirmation, officerOtp);
      }
      // All 3 Stages Cleared! Commit session to AuthContext & localStorage
      if (officerTempToken && verifiedOfficerUser) {
        localStorage.setItem('ncrb_auth_token', officerTempToken);
        localStorage.setItem('ncrb_user', JSON.stringify(verifiedOfficerUser));
        window.dispatchEvent(new Event('ncrb_auth_change'));
      } else {
        await login(officerEmail, officerPassword, '849201');
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to verify phone OTP');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for demo evaluation
  const handleSelectDemoOfficer = (demo) => {
    setOfficerEmail(demo.email);
    const pwd = demo.email.includes('ganesh') ? 'Ganesh@2026' : 'Demo@2026';
    setOfficerPassword(pwd);
    setOfficerPhone(demo.phone);
    setError('');
    setSuccessMsg(`Preloaded credentials for ${demo.name}. Click "Authenticate Credentials" to begin Stage 1.`);
    setOfficerStage(1);
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col justify-between items-center p-4 lg:p-8 relative overflow-hidden text-slate-100">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle showLabel={true} />
      </div>

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Banner */}
      <div className="w-full max-w-6xl text-center mb-5 space-y-3 z-10 pt-2">
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-sans pb-1">
          <a
            href="https://www.mha.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-300 flex items-center space-x-1 transition"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ministry of Home Affairs (MHA)</span>
          </a>
          <span className="text-slate-700">•</span>
          <a
            href="https://ncrb.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-300 flex items-center space-x-1 transition"
          >
            <span>National Crime Records Bureau</span>
          </a>
          <span className="text-slate-700">•</span>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-300 flex items-center space-x-1 transition"
          >
            <span>CyberCrime.gov.in</span>
          </a>
        </div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-wider shadow-sm">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>MINISTRY OF HOME AFFAIRS • GOVERNMENT OF INDIA</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          National Crime Records Bureau (NCRB)
        </h1>
        <p className="text-xs sm:text-sm text-cyan-400 font-medium max-w-3xl mx-auto">
          Secure Digital Document Custody & Blockchain Chain-of-Custody Platform (SIH26190)
        </p>

        {/* Portal Switcher Tabs */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('OFFICER');
              setError('');
              setSuccessMsg('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'OFFICER'
                ? 'bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 text-white shadow-lg shadow-cyan-950/50 border border-cyan-400/50 ring-2 ring-cyan-500/30'
                : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Law Enforcement & Judiciary (Sequential 3-Stage Clearance)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('CITIZEN');
              setError('');
              setSuccessMsg('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'CITIZEN'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/50 ring-2 ring-emerald-500/30'
                : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Citizen Portal (Phone OTP + Microsoft Passkey)</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 items-start my-auto">
        
        {/* LEFT COLUMN: SEQUENTIAL STEP-BY-STEP WIZARD */}
        <div className="lg:col-span-6 cyber-card rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
          
          {/* Messages */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 flex items-start space-x-2.5 text-xs text-rose-300 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/50 flex items-start space-x-2.5 text-xs text-emerald-300 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* =============================================================== */}
          {/* FLOW 1: CITIZEN SEQUENTIAL WIZARD                              */}
          {/* =============================================================== */}
          {activeTab === 'CITIZEN' && (
            <div className="space-y-4">
              {/* Step Tracker */}
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Citizen Verification Wizard</span>
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                    STEP {citizenStep} OF 2
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div
                    className={`p-2 rounded-lg border text-center transition ${
                      citizenStep === 1
                        ? 'bg-emerald-950 border-emerald-400 text-emerald-300 font-bold'
                        : citizenStep > 1
                        ? 'bg-emerald-900/40 border-emerald-600/50 text-emerald-400'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    {citizenStep > 1 ? '✓ Step 1: Phone Verified' : 'Step 1: Firebase Phone SMS'}
                  </div>

                  <div
                    className={`p-2 rounded-lg border text-center transition ${
                      citizenStep === 2
                        ? 'bg-emerald-950 border-emerald-400 text-emerald-300 font-bold'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    Step 2: Microsoft Passkey
                  </div>
                </div>
              </div>

              {/* Citizen Step 1: Phone Number & SMS OTP */}
              {citizenStep === 1 && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Registered Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Phone className="w-4 h-4 text-emerald-400" />
                      </div>
                      <input
                        type="tel"
                        required
                        disabled={citizenOtpSent}
                        value={citizenPhone}
                        onChange={(e) => setCitizenPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div id="recaptcha-container-citizen" />

                  {!citizenOtpSent ? (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSendCitizenOtp}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Dispatching SMS OTP via Firebase...</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4" />
                          <span>Send SMS Verification Code</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <form onSubmit={handleVerifyCitizenPhone} className="space-y-3 pt-2 border-t border-slate-800">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-semibold text-slate-300">
                            Enter 6-Digit SMS Code
                          </label>
                          {citizenTestCode && (
                            <span className="text-[10px] font-mono text-emerald-400">
                              Auto-filled Test Code: {citizenTestCode}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={citizenOtp}
                          onChange={(e) => setCitizenOtp(e.target.value)}
                          placeholder="123456"
                          className="w-full bg-slate-900/90 border border-emerald-500/50 rounded-xl p-2 text-center text-sm text-white font-mono tracking-widest focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Verify Code & Proceed to Step 2</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">SIH Judges Fast Pass:</span>
                    <button
                      type="button"
                      onClick={handleCitizenDemoBypass}
                      className="px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] hover:bg-emerald-900/80 transition"
                    >
                      ⚡ 1-Click Fast Pass
                    </button>
                  </div>
                </div>
              )}

              {/* Citizen Step 2: Microsoft Passkey Creation & Verification */}
              {citizenStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 space-y-1">
                    <div className="font-bold flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Phone Authenticated: {citizenPhone}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Now register or tap your **Microsoft Passkey / Windows Hello** to anchor your citizen public key directly into the Supabase database.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleCitizenPasskey}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 text-white font-bold text-xs shadow-xl transition flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Awaiting Microsoft Passkey / Windows Hello...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 text-yellow-300" />
                        <span>Trigger Microsoft Passkey / Windows Hello</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCitizenStep(1)}
                    className="w-full text-center text-[11px] text-slate-400 hover:text-white transition"
                  >
                    ← Back to Phone Number
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* FLOW 2: OFFICER SEQUENTIAL WIZARD (Stage 1 -> Stage 2 -> Stage 3)*/}
          {/* =============================================================== */}
          {activeTab === 'OFFICER' && (
            <div className="space-y-4">
              {/* Stage Progress Tracker */}
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Officer Sequential Clearance</span>
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    STAGE {officerStage} OF 3
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                  <div
                    className={`p-2 rounded-lg border text-center transition ${
                      officerStage === 1
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                        : officerStage > 1
                        ? 'bg-cyan-900/40 border-cyan-600/50 text-cyan-400'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    {officerStage > 1 ? '✓ 1. JWT Verified' : '1. JWT Identity'}
                  </div>

                  <div
                    className={`p-2 rounded-lg border text-center transition ${
                      officerStage === 2
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                        : officerStage > 2
                        ? 'bg-cyan-900/40 border-cyan-600/50 text-cyan-400'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    {officerStage > 2 ? '✓ 2. Passkey Cleared' : '2. Microsoft Passkey'}
                  </div>

                  <div
                    className={`p-2 rounded-lg border text-center transition ${
                      officerStage === 3
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    3. Official Phone OTP
                  </div>
                </div>
              </div>

              {/* STAGE 1: REAL JWT AUTHENTICATION */}
              {officerStage === 1 && (
                <form onSubmit={handleOfficerJwtSubmit} className="space-y-3.5 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Government Badge ID or Police Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4 text-cyan-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={officerEmail}
                        onChange={(e) => setOfficerEmail(e.target.value)}
                        placeholder="e.g. officer@ncrb-demo.gov or NCRB-INV-104"
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Cryptographic Password (JWT Auth)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4 text-cyan-400" />
                      </div>
                      <input
                        type="password"
                        required
                        value={officerPassword}
                        onChange={(e) => setOfficerPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying with Supabase PostgreSQL...</span>
                      </>
                    ) : (
                      <>
                        <span>Authenticate JWT Identity & Proceed to Stage 2</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STAGE 2: REAL MICROSOFT PASSKEY CHALLENGE */}
              {officerStage === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-300 space-y-1">
                    <div className="font-bold flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>Stage 1 Cleared: {verifiedOfficerUser?.fullName}</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Clearance: <span className="font-mono text-cyan-300">{verifiedOfficerUser?.role}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">
                    Verify your **Microsoft Windows Hello / FIDO2 Hardware Passkey** challenge to prove physical custody of an authorized government device.
                  </p>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleOfficerPasskeySubmit}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 text-white font-bold text-xs shadow-xl transition flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Awaiting Microsoft Windows Hello / Passkey...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 text-cyan-300" />
                        <span>Authenticate with Microsoft Passkey / Windows Hello</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOfficerStage(1)}
                    className="w-full text-center text-[11px] text-slate-400 hover:text-white transition"
                  >
                    ← Back to Stage 1 (Credentials)
                  </button>
                </div>
              )}

              {/* STAGE 3: FIREBASE OFFICIAL PHONE SMS VERIFICATION */}
              {officerStage === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-300 space-y-1">
                    <div className="font-bold flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>Stage 2 Cleared: Microsoft Passkey Verified</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Final Stage: Confirm the one-time SMS verification token sent to your registered official SIM.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Registered Official Mobile SIM
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Phone className="w-4 h-4 text-cyan-400" />
                      </div>
                      <input
                        type="tel"
                        value={officerPhone}
                        onChange={(e) => setOfficerPhone(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div id="recaptcha-container-officer" />

                  {!officerOtpSent ? (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSendOfficerPhoneOtp}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Phone className="w-4 h-4" />
                          <span>Dispatch Official SMS Token</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <form onSubmit={handleOfficerPhoneSubmit} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Enter 6-Digit Official SMS Code
                        </label>
                        <input
                          type="text"
                          required
                          value={officerOtp}
                          onChange={(e) => setOfficerOtp(e.target.value)}
                          placeholder="849201"
                          className="w-full bg-slate-900/90 border border-cyan-500/50 rounded-xl p-2 text-center text-sm text-white font-mono tracking-widest focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Confirm 3-Stage Clearance & Enter Command Center</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Security Stamp */}
          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Lock className="w-3 h-3 text-cyan-400" />
              <span>TLS 1.3 • FIPS 180-4 • WebAuthn / FIDO2</span>
            </span>
            <span className="font-mono text-cyan-400">NODE #DELHI-01</span>
          </div>
        </div>

        {/* RIGHT COLUMN: 1-CLICK DEMO PASSPORTS */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>1-Click Evaluation Passports for Hackathon Judges</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Click any officer to preload credentials and test the 3-stage clearance pipeline
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              6 ROLES
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {demoAccounts.map((demo) => (
              <button
                key={demo.badge}
                type="button"
                onClick={() => handleSelectDemoOfficer(demo)}
                className={`text-left p-3 rounded-2xl border transition-all duration-200 group relative overflow-hidden active:scale-[0.98] ${demo.color} hover:border-cyan-400/80 hover:shadow-lg`}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded border bg-slate-900/90 text-white">
                    {demo.badge}
                  </span>
                  <span className="text-[10px] font-semibold text-cyan-400">
                    STAGE 1 → 3
                  </span>
                </div>

                <div className="font-bold text-xs text-white group-hover:text-cyan-200 transition-colors">
                  {demo.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate mb-1">
                  {demo.role}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                  {demo.desc}
                </p>

                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-cyan-400 font-mono">
                  <span>{demo.phone}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="w-full max-w-6xl text-center text-[11px] text-slate-500 py-3 border-t border-slate-800/60 mt-6 z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span>Official Portal: National Crime Records Bureau</span>
          <span>•</span>
          <span>Women Safety Division</span>
        </div>
        <div>
          <span>Smart India Hackathon 2024–2026 • Problem ID: SIH26190</span>
        </div>
      </footer>
    </div>
  );
}
