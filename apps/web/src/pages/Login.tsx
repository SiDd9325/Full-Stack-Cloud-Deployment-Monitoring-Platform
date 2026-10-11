import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Rocket, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'ADMIN' | 'DEVELOPER') => {
    setLoading(true);
    try {
      await quickDemoLogin(role);
      navigate('/');
    } catch (err: any) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white mx-auto shadow-glow">
            <Rocket className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">DevOps<span className="text-blue-500">Hub</span></h1>
          <p className="text-slate-400 text-sm">Sign in to access your cloud deployment control plane</p>
        </div>

        {/* Quick Demo Fill Banner */}
        <div className="glass-card p-4 rounded-2xl border border-blue-500/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            <Sparkles className="w-4 h-4 text-amber-400" /> Instant Demo Mode Login
          </div>
          <p className="text-[11px] text-slate-400">Click below to auto-authenticate with pre-configured demo roles:</p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickLogin('ADMIN')}
              className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-xl transition-all"
            >
              Demo Admin User
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('DEVELOPER')}
              className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold rounded-xl transition-all"
            >
              Demo Developer User
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Work Email</label>
              <input
                type="email"
                required
                placeholder="admin@devopshub.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-glow flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:underline font-medium">
              Register new account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
