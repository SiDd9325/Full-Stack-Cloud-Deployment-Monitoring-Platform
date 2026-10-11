import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FolderGit2, Plus, Search, ExternalLink, GitBranch, Calendar, ShieldCheck, Trash2 } from 'lucide-react';
import { fetchApi } from '../api/client';
import { Project, CreateProjectDto } from '@devopshub/shared';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export const ProjectsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<CreateProjectDto>({
    name: '',
    description: '',
    repoUrl: '',
  });

  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', search, statusFilter],
    queryFn: () =>
      fetchApi<Project[]>(
        `/projects?search=${encodeURIComponent(search)}&status=${encodeURIComponent(statusFilter)}`
      ),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectDto) =>
      fetchApi<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setNewProject({ name: '', description: '', repoUrl: '' });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) =>
      fetchApi<Project>(`/projects/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.repoUrl) return;
    createMutation.mutate(newProject);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Project Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage repository integrations, build pipelines, and environment deployments.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-glow shrink-0"
        >
          <Plus className="w-4 h-4" /> Create New Project
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 uppercase font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DEGRADED">Degraded</option>
            <option value="ARCHIVED">Archived</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 rounded-2xl h-48 skeleton"></div>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Link
                    to={`/projects/${project.id}`}
                    className="font-bold text-lg text-white hover:text-blue-400 transition-colors truncate"
                  >
                    {project.name}
                  </Link>
                  <Badge variant={project.status} />
                </div>
                <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              {/* Repo & Deployment Status */}
              <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs">
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 truncate"
                >
                  <FolderGit2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">{project.repoUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 ml-auto" />
                </a>

                <div className="flex items-center justify-between text-slate-400 pt-1">
                  <span>Pipelines: {project.pipelinesCount || 1}</span>
                  {project.lastDeploymentStatus && (
                    <div className="flex items-center gap-1">
                      <span>Last deploy:</span>
                      <Badge variant={project.lastDeploymentStatus} />
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  to={`/projects/${project.id}`}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                >
                  View Control Plane &rarr;
                </Link>

                {user?.role === 'ADMIN' && project.status !== 'ARCHIVED' && (
                  <button
                    onClick={() => archiveMutation.mutate(project.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                    title="Archive Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center rounded-2xl space-y-3">
          <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-200">No Projects Found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Get started by associating a Git repository and configuring your CI/CD workflow.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" /> Create First Project
          </button>
        </div>
      )}

      {/* Create Project Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Create New DevOps Project</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Project Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. auth-service-api"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Repository URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/org/repo"
                  value={newProject.repoUrl}
                  onChange={(e) => setNewProject({ ...newProject, repoUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of service functionality..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg transition-all"
                >
                  {createMutation.isPending ? 'Creating...' : 'Initialize Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
