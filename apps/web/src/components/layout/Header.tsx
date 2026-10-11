import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Activity, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, quickDemoLogin } = useAuth();

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return ['Overview'];
    return paths.map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-[#0d1322]/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className="text-slate-500 font-mono">devopshub</span>
        <span>/</span>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb}>
            {idx > 0 && <span>/</span>}
            <span className={idx === breadcrumbs.length - 1 ? 'text-slate-200 font-medium' : 'text-slate-400'}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Top Header Actions */}
      <div className="flex items-center gap-4">
        {/* System Health Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <Activity className="w-3.5 h-3.5" />
          <span>System Healthy (100% Uptime)</span>
        </div>

        {/* Quick Demo Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
          <span className="text-slate-400 px-1 text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Switch Role:
          </span>
          <button
            onClick={() => quickDemoLogin('ADMIN')}
            className={`px-2 py-0.5 rounded transition-colors ${
              user?.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => quickDemoLogin('DEVELOPER')}
            className={`px-2 py-0.5 rounded transition-colors ${
              user?.role === 'DEVELOPER' ? 'bg-blue-500/20 text-blue-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Developer
          </button>
        </div>

        {/* User Account Controls */}
        {user ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => logout().then(() => navigate('/login'))}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-rose-900/50"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium px-3 py-1.5 rounded-lg transition-all"
          >
            <UserIcon className="w-3.5 h-3.5" /> Log In
          </button>
        )}
      </div>
    </header>
  );
};
