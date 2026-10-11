import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Terminal, Search, Filter, AlertCircle, Info, AlertTriangle, ShieldAlert } from 'lucide-react';
import { fetchApi } from '../api/client';
import { ApplicationLog } from '@devopshub/shared';
import { Badge } from '../components/ui/Badge';

export const LogsPage: React.FC = () => {
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<ApplicationLog | null>(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['logs', levelFilter, search],
    queryFn: () =>
      fetchApi<ApplicationLog[]>(
        `/logs?level=${encodeURIComponent(levelFilter)}&search=${encodeURIComponent(search)}`
      ),
    refetchInterval: 4000,
  });

  const getLogBadge = (level: string) => {
    switch (level) {
      case 'FATAL':
      case 'ERROR':
        return <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-mono font-semibold">ERROR</span>;
      case 'WARN':
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-mono font-semibold">WARN</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[11px] font-mono font-semibold">INFO</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Centralized Logs Engine</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Real-time log ingestion, search, time-range filtering, and structured JSON metadata inspection.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search log messages or service names..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-mono uppercase">Level:</span>
          {['', 'INFO', 'WARN', 'ERROR', 'FATAL'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                levelFilter === lvl
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {lvl === '' ? 'ALL' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Viewer Panel */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden font-mono">
        <div className="bg-[#050811] p-4 border-b border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-300 font-semibold">
            <Terminal className="w-4 h-4 text-blue-400" /> Streamed Application Logs ({logs?.length || 0})
          </span>
          <span>Buffer: PostgreSQL Encrypted Log Store</span>
        </div>

        <div className="bg-[#050811] divide-y divide-slate-900 max-h-[600px] overflow-y-auto text-xs">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">Connecting to log ingestion engine...</div>
          ) : logs && logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="p-3 hover:bg-slate-900/60 cursor-pointer transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-slate-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  {getLogBadge(log.level)}
                  <span className="text-blue-400 font-semibold shrink-0">[{log.service}]</span>
                  <span className="text-slate-300 truncate">{log.message}</span>
                </div>
                <span className="text-slate-500 text-[11px] shrink-0 font-sans">{log.projectName || 'system'}</span>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500">No log entries matched your filter query.</div>
          )}
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-slate-200">Log Event Details</span>
              {getLogBadge(selectedLog.level)}
            </div>

            <div className="space-y-2 text-slate-300">
              <div><strong className="text-slate-500">Timestamp:</strong> {selectedLog.timestamp}</div>
              <div><strong className="text-slate-500">Service:</strong> {selectedLog.service}</div>
              <div><strong className="text-slate-500">Project:</strong> {selectedLog.projectName}</div>
              <div className="pt-2 border-t border-slate-800">
                <strong className="text-slate-500 block mb-1">Message:</strong>
                <div className="p-3 bg-slate-950 rounded-lg text-emerald-400 font-mono leading-relaxed">
                  {selectedLog.message}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-sans"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
