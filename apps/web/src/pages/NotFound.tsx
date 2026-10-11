import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-bold text-white tracking-tight">404 — Page Not Found</h1>
      <p className="text-slate-400 text-sm max-w-sm">
        The requested resource path does not exist on this DevOpsHub control plane instance.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-glow"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Overview Dashboard
      </Link>
    </div>
  );
};
