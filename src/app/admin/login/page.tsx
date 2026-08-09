'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdminAction } from '@/actions/auth-actions';
import { Shield, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const res = await loginAdminAction(formData);

    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Login failed.');
    } else {
      router.push('/admin/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070A] subtle-grid-bg px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#147BFF] to-[#0B1F3A] border border-[#147BFF]/40 flex items-center justify-center mx-auto text-white shadow-lg">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#147BFF] block">ZEROTRACE CONTROL PANEL</span>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">ADMINISTRATOR LOGIN</h1>
          <p className="text-xs text-[#AAB4C3]">
            EUREKA! – Road To Enterprise 2026
          </p>
        </div>

        {/* Login Form Panel */}
        <div className="glass-panel p-8 rounded-3xl border border-[#147BFF]/30 space-y-6">
          
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#AAB4C3] block mb-1.5">
                ADMIN EMAIL ADDRESS
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="admin@example.com"
                className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#AAB4C3] block mb-1.5">
                PASSWORD
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••••••"
                className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-xs text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#147BFF]/20 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'AUTHENTICATING...' : 'LOG IN TO DASHBOARD'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-[#AAB4C3]">
          <Link href="/" className="hover:text-white transition-colors">← Return to Public Website</Link>
        </div>
      </div>
    </div>
  );
}
