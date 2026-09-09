import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside Jardinains App:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div id="error-boundary-screen" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />
          
          <div className="relative z-10 w-full max-w-md p-6 sm:p-8 bg-[#04280e] rounded-2xl border-2 border-rose-500/80 shadow-[0_10px_50px_rgba(239,68,68,0.15)] flex flex-col items-center text-center font-['Sniglet']">
            <div className="p-4 bg-rose-950/80 rounded-full border-2 border-rose-500 text-rose-400 mb-4 animate-bounce">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-rose-400 tracking-wider mb-2 uppercase drop-shadow-[0_2px_0_#000]">
              System Defect Detected
            </h1>
            
            <p className="text-xs sm:text-sm text-emerald-300 font-bold mb-4 leading-relaxed">
              Jardinains encountered a fatal runtime exception. Do not panic—the mischievous gnomes have been contained!
            </p>

            <div className="w-full bg-black/60 border border-emerald-500/25 rounded-xl p-3 mb-6 text-left font-mono text-[11px] sm:text-xs text-rose-300 max-h-32 overflow-y-auto scrollbar-thin">
              <p className="font-bold text-rose-400 mb-1">Error Message:</p>
              <p className="break-all">{this.state.error?.message || 'Unknown runtime crash.'}</p>
              {this.state.error?.stack && (
                <p className="text-[10px] text-slate-400 mt-2 whitespace-pre-wrap border-t border-slate-800 pt-1">
                  {this.state.error.stack}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-gradient-to-b from-[#4ade80] to-[#16a34a] hover:from-[#86efac] hover:to-[#22c55e] text-black font-extrabold text-sm rounded-xl transition shadow-[0_4px_10px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 border border-emerald-900 cursor-pointer active:translate-y-0.5"
              >
                <RotateCcw className="w-4 h-4" /> Restart Arcade
              </button>
              
              <button
                onClick={() => { window.location.href = './'; }}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-emerald-300 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer active:translate-y-0.5"
              >
                <Home className="w-4 h-4" /> Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
