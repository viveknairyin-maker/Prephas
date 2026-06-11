import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-center items-center p-6 text-center select-none font-body-md">
          <div className="max-w-md border border-primary p-8 bg-white block-shadow space-y-6">
            <span className="material-symbols-outlined text-error text-[48px]" data-icon="warning">warning</span>
            <h1 className="font-display text-headline-lg uppercase tracking-tight text-primary">Application Error</h1>
            <p className="text-secondary font-body-lg">
              Something went wrong during startup. This is often caused by missing environment variables (e.g. Firebase or Gemini API keys).
            </p>
            <div className="text-left bg-zinc-50 border border-primary p-4 overflow-x-auto text-xs font-mono max-h-40 no-scrollbar">
              {this.state.error?.toString() || "Unknown startup error"}
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-primary text-on-primary py-3 font-label-sm uppercase tracking-widest hover:opacity-90"
            >
              Retry Load
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
