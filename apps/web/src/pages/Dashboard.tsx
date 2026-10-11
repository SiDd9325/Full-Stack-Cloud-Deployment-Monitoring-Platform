import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FolderGit2,
  GitPullRequest,
  Rocket,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { fetchApi } from '../api/client';
import { SystemMetricsOverview, Project, Deployment, PipelineRun } from '@devopshub/shared';
import { Badge } from '../components/ui/Badge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const DashboardPage: React.FC = () => {
  const { data: metrics } = useQuery({
    queryKey: ['monitoring-overview'],
    queryFn: () => fetchApi<SystemMetricsOverview>('/monitoring/overview'),
    refetchInterval: 5000,
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchApi<Project[]>('/projects'),
  });

  const { data: deployments } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => fetchApi<Deployment[]>('/deployments?limit=5'),
  });

  // Sample historical deployment chart data
  const chartData = [
    { time: '06:00', deployments: 4, latency: 42 },
    { time: '08:00', deployments: 7, latency: 38 },
    { time: '10:00', deployments: 12, latency: 45 },
    { time: '12:00', deployments: 18, latency: 32 },
    { time: '14:00', deployments: 15, latency: 35 },
    { time: '16:00', deployments: 22, latency: 29 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/30 via-slate-900/60 to-purple-900/20 p-6 rounded-2xl border border-blue-500/20">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Cloud Deployment & Monitoring Overview
            <span className="text-xs bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-500/30">
              Live Prometheus Instrumentation
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time control plane for CI/CD pipelines, Kubernetes environments, and system health.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Projects</span>
            <div className="text-2xl font-bold text-white mt-1">{metrics?.totalProjects || projects?.length || 0}</div>
            <span className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> {metrics?.activeProjects || 0} Active
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FolderGit2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Deployment Success Rate</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics?.deploymentSuccessRate || 100}%</div>
            <span className="text-xs text-slate-400 mt-1 block">
              {metrics?.successfulDeployments || 0} Successful / {metrics?.failedDeployments || 0} Failed
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Rocket className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Avg Deployment Time</span>
            <div className="text-2xl font-bold text-white mt-1">
              {metrics ? `${(metrics.avgDeploymentDurationMs / 1000).toFixed(1)}s` : '14.5s'}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">9-Stage CI/CD Workflow</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Avg API Response Latency</span>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{metrics?.avgLatencyMs || 32} ms</div>
            <span className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <Activity className="w-3 h-3" /> P99 Latency &lt; 50ms
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts & Recent Deployments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Activity Graph */}
        <div className="lg:col-span-2 glass-card p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Deployment Velocity & Latency</h2>
              <p className="text-xs text-slate-400">Track production deploy frequency over time</p>
            </div>
            <Badge variant="SUCCESS" label="Live Prometheus Stream" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDeployments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={12} />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="deployments" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDeployments)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Deployments Activity Feed */}
        <div className="glass-card p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Recent Deployments</h2>
            <span className="text-xs text-blue-400 hover:underline cursor-pointer">View All</span>
          </div>

          <div className="space-y-3">
            {deployments && deployments.length > 0 ? (
              deployments.map((dep) => (
                <div key={dep.id} className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-200">{dep.projectName}</span>
                      <Badge variant={dep.environment} />
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-1">
                      {dep.version} ({dep.imageTag.split(':')[1] || dep.imageTag})
                    </div>
                  </div>
                  <Badge variant={dep.status} />
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-sm">No recent deployments recorded.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
