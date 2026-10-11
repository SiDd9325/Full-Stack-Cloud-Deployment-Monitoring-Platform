import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderGit2,
  GitPullRequest,
  Rocket,
  Users,
  Play,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { fetchApi } from '../api/client';
import { Project, PipelineRun } from '@devopshub/shared';
import { Badge } from '../components/ui/Badge';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'pipelines' | 'deployments' | 'members'>('overview');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchApi<Project>(`/projects/${id}`),
    enabled: !!id,
  });

  const triggerRunMutation = useMutation({
    mutationFn: (pipelineId: string) =>
      fetchApi<PipelineRun>(`/pipelines/${pipelineId}/runs`, {
        method: 'POST',
        body: JSON.stringify({ commitMessage: 'Manual console trigger' }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: (email: string) =>
      fetchApi(`/projects/${id}/members`, {
        method: 'POST',
        body: JSON.stringify({ email, role: 'DEVELOPER' }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setNewMemberEmail('');
    },
  });

  if (isLoading) {
    return <div className="glass-card p-12 rounded-2xl skeleton h-96"></div>;
  }

  if (!project) {
    return <div className="text-center py-12 text-slate-400">Project not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
              <Badge variant={project.status} />
            </div>
            <p className="text-slate-400 text-sm mt-1">{project.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-xl border border-slate-700 transition-colors"
            >
              <FolderGit2 className="w-4 h-4 text-blue-400" />
              <span>Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {project.pipelines && project.pipelines.length > 0 && (
              <button
                onClick={() => triggerRunMutation.mutate(project.pipelines![0].id)}
                disabled={triggerRunMutation.isPending}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-xl shadow-glow transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{triggerRunMutation.isPending ? 'Triggering...' : 'Trigger Pipeline'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80">
          {(['overview', 'pipelines', 'deployments', 'members'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipelines Overview */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-blue-400" /> Configured Pipelines
            </h2>
            <div className="space-y-3">
              {project.pipelines?.map((pipe: any) => (
                <div key={pipe.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-200">{pipe.name}</span>
                    <Badge variant={pipe.provider} />
                  </div>
                  <div className="text-xs text-slate-400 font-mono">Branch: {pipe.gitBranch}</div>

                  {pipe.runs && pipe.runs.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Last Run: <span className="font-mono text-slate-300">{pipe.runs[0].commitSha}</span>
                      </span>
                      <Badge variant={pipe.runs[0].status} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Deployments */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Rocket className="w-4 h-4 text-emerald-400" /> Recent Deployments
            </h2>
            <div className="space-y-3">
              {project.deployments?.map((dep: any) => (
                <div key={dep.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-200">{dep.version}</span>
                      <Badge variant={dep.environment} />
                    </div>
                    <span className="text-xs text-slate-400 font-mono mt-1 block">{dep.imageTag}</span>
                  </div>
                  <Badge variant={dep.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Project Members & Access</h2>
              <p className="text-xs text-slate-400">Team members authorized to view and trigger builds for this project</p>
            </div>
          </div>

          {/* Add member form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newMemberEmail) addMemberMutation.mutate(newMemberEmail);
            }}
            className="flex items-center gap-3 max-w-md"
          >
            <input
              type="email"
              placeholder="developer@company.com"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none"
            />
            <button
              type="submit"
              disabled={addMemberMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Add Member
            </button>
          </form>

          {/* Members list */}
          <div className="space-y-3">
            {project.members?.map((member: any) => (
              <div key={member.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={member.user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                    alt="Member"
                    className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-200">{member.user?.name}</div>
                    <div className="text-xs text-slate-400">{member.user?.email}</div>
                  </div>
                </div>
                <Badge variant={member.role} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
