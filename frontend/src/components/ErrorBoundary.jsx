import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050810] flex items-center justify-center p-8 font-bebas text-center">
          <div className="glass-panel p-12 rounded-3xl max-w-lg border-red-500/20">
            <ShieldAlert size={64} className="text-red-500 mb-6 mx-auto animate-pulse" />
            <h2 className="text-3xl tracking-[4px] text-white mb-4">SYSTEM BREACH DETECTED</h2>
            <p className="text-[11px] font-mono-sport text-white/40 tracking-[1px] uppercase leading-relaxed">
              We encountered a critical failure in the neural stream. <br/>
              The dashboard session has been terminated for safety.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-8 px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[11px] font-mono-sport tracking-[2px] rounded-full transition-all"
            >
              REBOOT SYSTEM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
