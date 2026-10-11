import React from 'react';

type BadgeVariant =
  | 'SUCCESS'
  | 'FAILED'
  | 'RUNNING'
  | 'IN_PROGRESS'
  | 'QUEUED'
  | 'CANCELLED'
  | 'ROLLED_BACK'
  | 'ACTIVE'
  | 'DEGRADED'
  | 'ARCHIVED'
  | 'DEVELOPMENT'
  | 'STAGING'
  | 'PRODUCTION'
  | 'ADMIN'
  | 'DEVELOPER'
  | 'GITHUB_ACTIONS'
  | 'JENKINS';

interface BadgeProps {
  variant: BadgeVariant | string;
  label?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, label, className = '' }) => {
  const text = label || variant;

  const styles: Record<string, string> = {
    SUCCESS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    PRODUCTION: 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-semibold',
    
    FAILED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    DEGRADED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    
    RUNNING: 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse',
    IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse',
    
    QUEUED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    STAGING: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    DEVELOPMENT: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    
    CANCELLED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    ARCHIVED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    ROLLED_BACK: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    
    ADMIN: 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-semibold',
    DEVELOPER: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    
    GITHUB_ACTIONS: 'bg-slate-800 text-slate-300 border-slate-700',
    JENKINS: 'bg-red-950/40 text-red-300 border-red-800/40',
  };

  const defaultStyle = 'bg-slate-800 text-slate-300 border-slate-700';
  const badgeStyle = styles[variant] || defaultStyle;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}
    >
      {text}
    </span>
  );
};
