import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (
      error.message?.includes('MetaMask') ||
      error.stack?.includes('chrome-extension://') ||
      error.stack?.includes('inpage.js')
    ) {
      console.warn('Ignored external browser extension error:', error);
      this.setState({ hasError: false, error: null });
      return;
    }
    console.error('Uncaught application error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-slate-200 shadow-sm rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-600 rounded-xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Temporary Interface Glitch</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              An unexpected event occurred while rendering. You can safely reload the dashboard.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Platform</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
