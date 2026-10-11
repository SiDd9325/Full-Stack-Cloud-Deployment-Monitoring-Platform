import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Rocket, RotateCcw, AlertTriangle, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { fetchApi } from '../api/client';
import { Deployment } from '@devopshub/shared';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export const DeploymentsPage: React.FC = () => {
  const [envFilter, setEnvFilter] = useState<string>('');
  const [rollbackTarget, setRollbackTarget] = useState<Deployment | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: deployments, isLoading } = useQuery({
    queryKey: ['deployments', envFilter],
    queryFn: () => fetchApi<Deployment[]>(`/deployments?environment=${encodeURIComponent(envFilter)}`),
  });

  const rollbackMutation = useMutation({
    mutationFn: (deploymentId: string) =>
      fetchApi<Deployment>(`/deployments/${deploymentId}/rollback`, {
        method: 'POST',
        body: JSON.stringify({ reason: rollbackReason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      setRollbackTarget(null);
      setRollbackReason('');
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Deployment Operations & History</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Track immutable container image tags deployed across Development, Staging, and Production AWS EKS clusters.
          </p>
        </div>
      </div>

      {/* Environment Filter Tabs */}
      <div className="glass-card p-4 rounded-xl flex items-center gap-2">
        <span className="text-xs text-slate-400 font-mono uppercase mr-2">Environment:</span>
        {['', 'DEVELOPMENT', 'STAGING', 'PRODUCTION'].map((env) => (
          <button
            key={env}
            onClick={() => setEnvFilter(env)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              envFilter === env
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {env === '' ? 'All Environments' : env}
          </button>
        ))}
      </div>

      {/* Deployments History Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-xs text-slate-400 uppercase font-mono border-b border-slate-800">
                <th className="py-3.5 px-4 font-semibold">Service / Project</th>
                <th className="py-3.5 px-4 font-semibold">Environment</th>
                <th className="py-3.5 px-4 font-semibold">Version & Image Tag</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Deployed By</th>
                <th className="py-3.5 px-4 font-semibold">Time / Duration</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm text-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading deployment history...
                  </td>
                </tr>
              ) : deployments && deployments.length > 0 ? (
                deployments.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{dep.projectName || 'ecommerce-service'}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={dep.environment} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                      <div>{dep.version}</div>
                      <div className="text-slate-500 text-[11px] truncate max-w-[180px]">{dep.imageTag}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={dep.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {dep.deployedBy?.name || 'Automated Pipeline'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">
                      <div>{new Date(dep.startedAt).toLocaleTimeString()}</div>
                      <div className="text-slate-500">{dep.durationMs > 0 ? `${(dep.durationMs / 1000).toFixed(1)}s` : '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {dep.status === 'SUCCESS' && user?.role === 'ADMIN' && (
                        <button
                          onClick={() => setRollbackTarget(dep)}
                          className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-lg transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Rollback
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No deployment records found for this environment filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rollback Confirmation Modal */}
      {rollbackTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-amber-500/40 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
              <h2 className="text-lg font-bold text-white">Confirm Immutable Image Rollback</h2>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are initiating a production-impacting rollback for{' '}
              <strong className="text-white">{rollbackTarget.projectName}</strong> on environment{' '}
              <strong className="text-amber-400">{rollbackTarget.environment}</strong>. This operation will redeploy
              a prior immutable image tag to the Kubernetes cluster.
            </p>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Rollback Audit Reason</label>
              <textarea
                rows={2}
                required
                placeholder="Reason for triggering rollback (e.g. elevated 500 error rates)..."
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRollbackTarget(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => rollbackMutation.mutate(rollbackTarget.id)}
                disabled={rollbackMutation.isPending}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-glow transition-all"
              >
                {rollbackMutation.isPending ? 'Executing Rollback...' : 'Confirm Rollback Operation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
