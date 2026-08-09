'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { acceptInvitationAction } from '@/actions/auth-actions';
import { Shield, Lock, AlertCircle, ArrowRight } from 'lucide-react';

function AcceptInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await acceptInvitationAction(token, password, name);

    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to accept invitation.');
    } else {
      router.push('/admin/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="glass-panel p-8 rounded-3xl border border-[#147BFF]/30 space-y-6">
      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-[#AAB4C3] block mb-1">
            YOUR FULL NAME
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Marcus Vance"
            className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#AAB4C3] block mb-1">
            CREATE PASSWORD
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#AAB4C3] block mb-1">
            CONFIRM PASSWORD
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full py-3.5 px-4 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-xs text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#147BFF]/20 transition-all disabled:opacity-50 mt-2"
        >
          {loading ? 'ACTIVATING ACCOUNT...' : 'ACCEPT & ACCESS DASHBOARD'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070A] subtle-grid-bg px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#147BFF] to-[#0B1F3A] border border-[#147BFF]/40 flex items-center justify-center mx-auto text-white">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#147BFF] block">ZeroTrace Invitation</span>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">ACCEPT ADMIN INVITATION</h1>
          <p className="text-xs text-[#AAB4C3]">Create your administrator account password</p>
        </div>

        <Suspense fallback={
          <div className="glass-panel p-8 rounded-3xl border border-[#147BFF]/30 text-center text-xs text-[#AAB4C3]">
            Loading invitation form...
          </div>
        }>
          <AcceptInvitationForm />
        </Suspense>
      </div>
    </div>
  );
}
