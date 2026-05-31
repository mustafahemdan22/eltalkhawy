'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Shield, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminSetupPage() {
  const router = useRouter();
  const hasAnyAdmin = useQuery(api.users.hasAnyAdmin);
  const bootstrap = useMutation(api.users.bootstrap);
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasAnyAdmin === false) return;
    if (hasAnyAdmin === true) router.push('/admin');
  }, [hasAnyAdmin, router]);

  if (hasAnyAdmin === undefined) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (hasAnyAdmin) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    setStatus('loading');
    setError('');
    try {
      await bootstrap({ bootstrapKey: key.trim() });
      setStatus('success');
      setTimeout(() => router.push('/admin'), 1500);
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Failed to authenticate');
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-gold-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-cream-100">Admin Setup</h1>
          <p className="text-charcoal-300 text-sm mt-2">
            No admin account found. Enter the bootstrap key to designate yourself as the first admin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-charcoal-900 rounded-xl border border-charcoal-800 p-6 space-y-4">
          <div>
            <label className="block text-xs text-charcoal-400 uppercase tracking-wider mb-1.5">Bootstrap Key</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <input
                type="password"
                value={key}
                onChange={(e) => { setKey(e.target.value); setStatus('idle'); }}
                placeholder="Enter the admin bootstrap key..."
                className="w-full pl-10 pr-4 h-11 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 placeholder:text-charcoal-500 text-sm focus:outline-none focus:border-gold-500"
                autoFocus
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 rounded-lg px-4 py-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Admin access granted! Redirecting...
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || !key.trim()}
            className="w-full h-11 rounded-lg bg-gold-500 text-charcoal-900 font-semibold text-sm hover:bg-gold-400 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {status === 'loading' ? (
              <span className="w-4 h-4 border-2 border-charcoal-900/30 border-t-charcoal-900 rounded-full animate-spin" />
            ) : (
              'Activate Admin'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
