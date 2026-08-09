'use client';

import { LogOut, User } from 'lucide-react';
import { logoutAdminAction } from '@/actions/auth-actions';
import { useRouter } from 'next/navigation';
import { AdminSession } from '@/lib/permissions';
import ZeroTraceLogo from './ZeroTraceLogo';

export default function AdminNavbar({ admin }: { admin: AdminSession }) {
  const router = useRouter();

  async function handleLogout() {
    await logoutAdminAction();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-[#071426] border-b border-[#1E293B] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ZeroTraceLogo size={32} />
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">ZEROTRACE EVENT MANAGEMENT</h2>
          <p className="text-[11px] text-[#AAB4C3]">EUREKA! – Road To Enterprise 2026</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-[#05070A] px-3.5 py-1.5 rounded-lg border border-[#1E293B]">
          <div className="w-7 h-7 rounded-full bg-[#0B1F3A] flex items-center justify-center text-[#147BFF] font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-white leading-none">{admin.name}</p>
            <p className="text-[10px] text-[#147BFF] leading-none mt-1 font-mono uppercase">{admin.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </header>
  );
}
