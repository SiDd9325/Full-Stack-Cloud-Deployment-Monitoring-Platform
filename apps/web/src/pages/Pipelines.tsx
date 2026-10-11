import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GitPullRequest,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import { fetchApi } from '../api/client';
import { PipelineRun, PipelineStage } from '@devopshub/shared';
import { Badge } from '../components/ui/Badge';

export const PipelinesPage: React.FC = () => {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: runs, isLoading } = useQuery({
    queryKey: ['pipeline-runs'],
    queryFn: () => fetchApi<PipelineRun[]>('/pipelines/1/runs'), // Defaults to run history
    refetchInterval: 3000, // Polls every 3 seconds for live stage updates
  });

  const { data: activeRun } = useQuery({
    queryKey: ['pipeline-run-detail', selectedRunId],
    queryFn: () => fetchApi<PipelineRun>(`/pipeline-runs/${selectedRunId}`),
    enabled: !!selectedRunId,
    refetchInterval: 2000,
  });

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-rose-400" />;
      case 'RUNNING':
        return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CI/CD Pipeline Engine</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Visualize 9-stage build, security scan, containerization, and AWS Kubernetes deployment workflows.
          </p>
        </div>
      </div>

      {/* Main Execution View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Runs History List */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center justify-between">
            <span>Execution History</span>
            <Badge variant="LIVE" label="Auto Refresh" />
          </h2>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {runs && runs.length > 0 ? (
              runs.map((run) => (
                <div
                  key={run.id}
                  onClick={() => setSelectedRunId(run.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedRunId === run.id
                      ? 'bg-blue-600/15 border-blue-500/50 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-blue-400 font-bold">{run.commitSha}</span>
                    <Badge variant={run.status} />
                  </div>
                  <p className="text-slate-300 text-xs mt-2 line-clamp-1 font-medium">{run.commitMessage}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800/80">
                    <span>Branch: {run.branch}</span>
                    <span>{run.durationMs > 0 ? `${(run.durationMs / 1000).toFixed(1)}s` : 'Queued'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">No pipeline execution runs found.</div>
            )}
          </div>
        </div>

        {/* Selected Pipeline Run Stage Visualizer */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-6">
          {activeRun ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">Pipeline Execution Visualizer</h2>
                    <Badge variant={activeRun.provider} />
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Commit: {activeRun.commitSha} &bull; Triggered by {activeRun.triggeredBy?.name || 'System'}
                  </p>
                </div>
                <Badge variant={activeRun.status} />
              </div>

              {/* 9 Stage Flow Diagram */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase text-slate-400 font-mono font-semibold tracking-wider">
                  Sequential Build Stages (9/9)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeRun.stages.map((stage) => (
                    <div
                      key={stage.id}
                      className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center gap-3"
                    >
                      {getStageIcon(stage.status)}
                      <div className="overflow-hidden">
                        <div className="text-xs font-semibold text-slate-200 truncate">{stage.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {stage.durationMs > 0 ? `${stage.durationMs}ms` : stage.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage Execution Logs Panel */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <Terminal className="w-4 h-4 text-emerald-400" /> Build Log Output
                  </span>
                  <span>Exit Code 0</span>
                </div>

                <div className="bg-[#050811] p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-emerald-400 h-48 overflow-y-auto space-y-1">
                  {activeRun.stages.map((stage) => (
                    <div key={stage.id} className="leading-relaxed">
                      <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>{' '}
                      <span className="text-blue-400">[{stage.name}]</span>{' '}
                      <span className="text-slate-300">{stage.logOutput || 'Stage queued...'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-24 text-slate-500">
              <GitPullRequest className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm">Select a pipeline run from the left panel to inspect live stage execution.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
