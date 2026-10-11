import React, { useState } from 'react';
import { Settings as SettingsIcon, Key, ShieldCheck, Save, Lock, Terminal } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const SettingsPage: React.FC = () => {
  const [jenkinsUrl, setJenkinsUrl] = useState('');
  const [jenkinsUser, setJenkinsUser] = useState('');
  const [jenkinsToken, setJenkinsToken] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('devopshub_webhook_secret_key');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const auditEvents = [
    { id: '1', user: 'Alex Rivera (Admin)', action: 'PROJECT_CREATED', details: 'Created project ecommerce-microservice', ip: '127.0.0.1', time: '10 mins ago' },
    { id: '2', user: 'Sarah Chen (Dev)', action: 'PIPELINE_TRIGGERED', details: 'Triggered run a7b3c9f2 on main branch', ip: '192.168.1.45', time: '25 mins ago' },
    { id: '3', user: 'Alex Rivera (Admin)', action: 'DEPLOYMENT_ROLLBACK', details: 'Rolled back payment-gateway-api on STAGING to tag v2.3.9', ip: '127.0.0.1', time: '1 hour ago' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Settings & Integrations</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Configure GitHub Actions webhooks, Jenkins API adapters, and review security audit logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jenkins & GitHub Configuration Form */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-400" /> CI/CD Server Integrations
            </h2>
            <Badge variant="STAGING" label="Demo Adapter Active" />
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Jenkins Server URL</label>
              <input
                type="url"
                placeholder="http://jenkins.company.internal:8080"
                value={jenkinsUrl}
                onChange={(e) => setJenkinsUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Leave empty to run in simulated Demo Pipeline mode.</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Jenkins User</label>
                <input
                  type="text"
                  placeholder="admin"
                  value={jenkinsUser}
                  onChange={(e) => setJenkinsUser(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">API Token</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={jenkinsToken}
                  onChange={(e) => setJenkinsToken(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono">GitHub Webhook HMAC Secret</label>
              <input
                type="password"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              {saved && <span className="text-emerald-400 text-xs font-semibold">Settings updated successfully!</span>}
              <button
                type="submit"
                className="ml-auto flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-glow"
              >
                <Save className="w-3.5 h-3.5" /> Save Configuration
              </button>
            </div>
          </form>
        </div>

        {/* Audit Log Table */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Security Audit Log
          </h2>

          <div className="space-y-3 font-mono text-xs">
            {auditEvents.map((ev) => (
              <div key={ev.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-semibold">{ev.action}</span>
                  <span className="text-slate-500 text-[11px]">{ev.time}</span>
                </div>
                <div className="text-slate-300">{ev.details}</div>
                <div className="text-[11px] text-slate-500">By {ev.user} &bull; IP: {ev.ip}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
