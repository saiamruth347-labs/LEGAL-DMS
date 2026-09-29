import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[NCRB Platform Recovery] Uncaught UI error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.removeItem('ncrb_auth_token');
      localStorage.removeItem('ncrb_user');
      sessionStorage.clear();
    } catch (e) {}
    window.location.href = '/login';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-cyan-500 selection:text-black">
          <div className="w-full max-w-lg bg-[#0F172A] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 ring-1 ring-cyan-500/20 space-y-5 text-center">
            {/* Header Icon */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                NCRB Platform Recovery Engine • SIH26190
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Authentication / UI State Recovered
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                The session or component encountered a state synchronization boundary. Click below to enter the portal cleanly.
              </p>
            </div>

            {/* Error Diagnostics Box */}
            <div className="bg-[#020617] border border-slate-800 rounded-xl p-3 text-left overflow-hidden">
              <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                <span>Diagnostic Error:</span>
                <span className="text-rose-400 font-bold">RECOVERABLE</span>
              </div>
              <pre className="text-xs font-mono text-rose-300 whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                {this.state.error?.message || String(this.state.error)}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition active:scale-95"
              >
                Reload Platform
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition active:scale-95"
              >
                Reset Session & Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
