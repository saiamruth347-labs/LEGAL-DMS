import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import UploadModal from './components/UploadModal';
import VerificationModal from './components/VerificationModal';
import NotificationModal from './components/NotificationModal';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import CaseDetails from './pages/CaseDetails';
import Documents from './pages/Documents';
import DocumentDetails from './pages/DocumentDetails';
import IntegrityLedger from './pages/IntegrityLedger';
import AIIntelligence from './pages/AIIntelligence';
import SecurityCenter from './pages/SecurityCenter';
import AccessRequests from './pages/AccessRequests';
import AuditTrail from './pages/AuditTrail';
import Reports from './pages/Reports';
import AdminPanel from './pages/AdminPanel';
import CitizenPortal from './pages/CitizenPortal';

export default function App() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Global Modals State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-xs text-slate-400">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto"></div>
          <div className="font-mono text-cyan-400">NCRB SECURE PLATFORM LOADING...</div>
        </div>
      </div>
    );
  }

  // Unauthenticated Route Handler
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2F6] dark:bg-[#071525] text-slate-900 dark:text-[#F1F5F9] flex flex-col selection:bg-cyan-500 selection:text-black relative transition-colors duration-200">
      {/* 3D Atmospheric Panoramic Monument & Security HUD Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-20 dark:opacity-25 scale-100 transition-all duration-700"
        style={{
          backgroundImage: "url('/gov-cyber-monument.jpg')",
          filter: 'blur(1.5px)',
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-sky-500/10 via-slate-200/60 to-slate-200/90 dark:from-[#0878D1]/15 dark:via-[#071525]/45 dark:to-[#071525]/80 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(#0284C7_1px,transparent_1px)] dark:bg-[radial-gradient(#19C6E8_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none" />

      {/* Top Government Cyber Header */}
      <Header onOpenNotifications={() => setIsNotificationsOpen(true)} />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenVerify={() => setIsVerifyOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto pb-10">
            <Routes>
              <Route
                path="/"
                element={
                  user?.role === 'CITIZEN' ? (
                    <CitizenPortal onOpenVerify={() => setIsVerifyOpen(true)} />
                  ) : (
                    <Dashboard
                      onOpenUpload={() => setIsUploadOpen(true)}
                      onOpenVerify={() => setIsVerifyOpen(true)}
                    />
                  )
                }
              />
              <Route
                path="/citizen"
                element={<CitizenPortal onOpenVerify={() => setIsVerifyOpen(true)} />}
              />
              <Route path="/cases" element={<Cases />} />
              <Route
                path="/cases/:id"
                element={
                  <CaseDetails
                    onOpenUpload={() => setIsUploadOpen(true)}
                    onOpenVerify={() => setIsVerifyOpen(true)}
                  />
                }
              />
              <Route
                path="/documents"
                element={
                  <Documents
                    onOpenUpload={() => setIsUploadOpen(true)}
                    onOpenVerify={() => setIsVerifyOpen(true)}
                  />
                }
              />
              <Route path="/documents/:id" element={<DocumentDetails />} />
              <Route
                path="/integrity"
                element={<IntegrityLedger onOpenVerify={() => setIsVerifyOpen(true)} />}
              />
              <Route path="/ai-intelligence" element={<AIIntelligence />} />
              <Route path="/security" element={<SecurityCenter />} />
              <Route path="/access-requests" element={<AccessRequests />} />
              <Route path="/audit" element={<AuditTrail />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(doc) => {
          setIsUploadOpen(false);
          navigate(`/documents/${doc.id}`);
        }}
      />

      <VerificationModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
      />

      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
