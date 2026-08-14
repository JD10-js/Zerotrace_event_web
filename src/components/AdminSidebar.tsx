'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Ticket,
  QrCode,
  CheckCircle,
  UserCheck,
  FileText,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { AdminSession, hasPermission } from '@/lib/permissions';

export default function AdminSidebar({ admin }: { admin: AdminSession }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      permission: 'VIEW_DASHBOARD' as const,
    },
    {
      name: 'Teams',
      href: '/admin/teams',
      icon: Users,
      permission: 'VIEW_TEAMS' as const,
    },
    {
      name: 'Tickets',
      href: '/admin/tickets',
      icon: Ticket,
      permission: 'VIEW_TICKETS' as const,
    },
    {
      name: 'QR Scanner',
      href: '/admin/scan',
      icon: QrCode,
      permission: 'SCAN_QR' as const,
    },
    {
      name: 'Check-ins',
      href: '/admin/check-ins',
      icon: CheckCircle,
      permission: 'CHECK_IN' as const,
    },
    {
      name: 'Administrators',
      href: '/admin/admins',
      icon: UserCheck,
      permission: 'MANAGE_ADMINS' as const,
    },
    {
      name: 'Audit Logs',
      href: '/admin/audit-logs',
      icon: FileText,
      permission: 'VIEW_AUDIT_LOGS' as const,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      permission: 'MANAGE_SETTINGS' as const,
    },
  ];

  return (
    <div className="w-full md:w-64 shrink-0 bg-[#05070A] border-b md:border-b-0 md:border-r border-[#1E293B]">
      {/* Mobile Ratio Menu Toggle Bar */}
      <div className="md:hidden bg-[#071426] px-4 py-3 flex items-center justify-between border-b border-[#1E293B]">
        <span className="text-xs font-bold text-[#147BFF] uppercase tracking-wider">ADMIN NAVIGATION</span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="px-3 py-1.5 bg-[#05070A] border border-[#1E293B] rounded-lg text-white font-bold flex items-center gap-1.5 text-xs shadow"
        >
          {mobileOpen ? <X className="w-4 h-4 text-rose-400" /> : <Menu className="w-4 h-4 text-[#147BFF]" />}
          {mobileOpen ? 'Close Menu' : 'Menu'}
        </button>
      </div>

      {/* Sidebar Content (Always visible on desktop, toggleable on mobile) */}
      <aside
        className={`${
          mobileOpen ? 'flex' : 'hidden md:flex'
        } flex-col justify-between p-4 space-y-6 md:min-h-[calc(100vh-73px)] w-full`}
      >
        <div className="space-y-4">
          <div className="px-3 py-1 hidden md:block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#147BFF]">ADMIN NAVIGATION</p>
          </div>

          <nav className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-1 gap-1.5">
            {navItems.map((item) => {
              if (!hasPermission(admin, item.permission)) return null;

              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#147BFF] text-white shadow-lg shadow-[#147BFF]/20'
                      : 'text-[#AAB4C3] hover:text-white hover:bg-[#071426]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#147BFF]'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 bg-[#071426] rounded-xl border border-[#1E293B] mt-4">
          <p className="text-[10px] font-bold text-[#147BFF] uppercase">ZEROTRACE SECURE RBAC</p>
          <p className="text-[11px] text-[#AAB4C3] truncate">
            Logged in as <strong className="text-white">{admin.email}</strong>
          </p>
        </div>
      </aside>
    </div>
  );
}
