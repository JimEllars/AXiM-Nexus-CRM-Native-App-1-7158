import React from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Log error cleanly for Cloudflare Pages analytics, asynchronously to not block the main thread
    setTimeout(async () => {
      // Attempt to retrieve user UUID from supabase if possible, or from local storage if standard session exists.
      let userUUID = 'unknown';
      try {
        const sbStr = localStorage.getItem('sb-' + 'supabase-project-ref' + '-auth-token') || localStorage.getItem('supabase.auth.token'); // Fallback or standard parse isn't fully reliable here, better to just rely on userUUID passed via props, but ErrorBoundary is at top level.
        // Let's use a simpler approach. We will just check if we can get it from supabase client.
      } catch (e) { /* ignore */ }

      console.error('[AXiM-Edge-Telemetry-Capture] ' + JSON.stringify({
        level: 'error',
        message: error.message || 'Unknown error',
        stack: error.stack,
        componentStack: errorInfo?.componentStack || '',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        userUUID: window.AXIM_USER_UUID || 'unknown'
      }, null, 2));
    }, 0);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col h-full items-center justify-center p-8 bg-slate-50 min-h-screen">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-lg w-full">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
              <SafeIcon icon={FiIcons.FiAlertTriangle} className="text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Unexpected System Error</h2>
            <p className="text-sm text-slate-500 mb-6">
              Our edge nodes encountered an unexpected fault. Telemetry has been logged for review.
            </p>
            <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-auto max-h-48 mb-6">
              <code className="text-[10px] text-slate-600 font-mono whitespace-pre-wrap">
                {this.state.error && this.state.error.toString()}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-slate-900 hover:bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg flex justify-center items-center space-x-2"
            >
              <SafeIcon icon={FiIcons.FiRefreshCw} />
              <span>Reinitialize Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
