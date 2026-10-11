import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  GitPullRequest,
  Rocket,
  Terminal,
  Activity,
  Server,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderGit2 },
    { name: 'Pipelines', path: '/pipelines', icon: GitPullRequest },
    { name: 'Deployments', path: '/deployments', icon: Rocket },
    { name: 'Logs', path: '/logs', icon: Terminal },
    { name: 'Monitoring', path: '/monitoring', icon: Activity },
    { name: 'Infrastructure', path: '/infrastructure', icon: Server },
    { name: 'Team & Access', path: '/team', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#0d1322] border-r border-slate-800/80 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-800/80 flex items-center justify-between px-4">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-glow">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-wide text-white">DevOps<span className="text-blue-500">Hub</span></span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-mono">v1.0.0 Enterprise</span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold mx-auto shadow-glow">
            <Rocket className="w-5 h-5 text-white" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800/60 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation items */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </div>

      {/* Demo Mode / User Footer */}
      {!collapsed && user && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <img
              src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
              alt={user.name}
              className="w-9 h-9 rounded-full border border-slate-700 bg-slate-800 shrink-0"
            />
            <div className="overflow-hidden">
              <div className="text-sm font-medium text-slate-200 truncate">{user.name}</div>
              <div className="text-xs text-slate-400 truncate mb-1">{user.email}</div>
              <Badge variant={user.role} />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
