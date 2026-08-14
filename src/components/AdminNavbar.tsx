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
    <header className="sticky top-0 z-40 bg-[#071426] border-b border-[#1E293B] px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between w-full max-w-full overflow-x-hidden">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <ZeroTraceLogo size={28} />
        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">ZEROTRACE EVENT</h2>
          <p className="text-[10px] text-[#AAB4C3] hidden sm:block">EUREKA! – Road To Enterprise 2026</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 bg-[#05070A] px-2.5 sm:px-3.5 py-1.5 rounded-lg border border-[#1E293B]">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0B1F3A] flex items-center justify-center text-[#147BFF] font-bold text-xs">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-white leading-none truncate max-w-[120px]">{admin.name}</p>
            <p className="text-[10px] text-[#147BFF] leading-none mt-1 font-mono uppercase">{admin.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
