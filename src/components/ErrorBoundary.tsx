'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || 'Unexpected application error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-[#DC2626] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A] mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-600 mb-5">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#059669] text-white font-semibold text-sm hover:bg-emerald-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
