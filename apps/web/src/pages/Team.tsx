import React, { useState } from 'react';
import { Users, UserPlus, Shield, Key } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export const TeamPage: React.FC = () => {
  const { user } = useAuth();

  const members = [
    {
      id: '1',
      name: 'Alex Rivera',
      email: 'admin@devopshub.io',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      projectsCount: 4,
      joinedAt: '2026-01-10',
    },
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'dev@devopshub.io',
      role: 'DEVELOPER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      projectsCount: 2,
      joinedAt: '2026-02-14',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Team & Access Control (RBAC)</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Role-Based Access Control enforcing ADMIN vs DEVELOPER permissions for project deployments.
          </p>
        </div>
      </div>

      {/* Role Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">ADMIN Role Capabilities</h2>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li>Manage all organization projects & repositories</li>
            <li>Execute production deployments & immutable image rollbacks</li>
            <li>Invite and configure team access roles</li>
            <li>Access security audit logs & Prometheus scraping configuration</li>
          </ul>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-blue-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">DEVELOPER Role Capabilities</h2>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li>Trigger build pipelines on authorized repositories</li>
            <li>Inspect live application build logs & telemetry metrics</li>
            <li>View deployment history and environment statuses</li>
            <li>Prohibited from modifying organization security policies</li>
          </ul>
        </div>
      </div>

      {/* Team Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Organization Members ({members.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-200">
            <thead>
              <tr className="bg-slate-900/80 text-xs text-slate-400 font-mono border-b border-slate-800">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Assigned Projects</th>
                <th className="py-3.5 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={m.avatarUrl} alt={m.name} className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700" />
                      <div>
                        <div className="font-semibold text-white">{m.name}</div>
                        <div className="text-xs text-slate-400">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4"><Badge variant={m.role} /></td>
                  <td className="py-3.5 px-4 text-xs font-mono">{m.projectsCount} Projects</td>
                  <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">{m.joinedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
