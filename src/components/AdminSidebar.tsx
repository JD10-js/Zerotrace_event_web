'use client';

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
} from 'lucide-react';
import { AdminSession, hasPermission } from '@/lib/permissions';

export default function AdminSidebar({ admin }: { admin: AdminSession }) {
  const pathname = usePathname();

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
    <aside className="w-64 bg-[#05070A] border-r border-[#1E293B] min-h-[calc(100vh-73px)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#147BFF]">ADMIN NAVIGATION</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            if (!hasPermission(admin, item.permission)) return null;
            
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#147BFF] text-white shadow-lg shadow-[#147BFF]/20'
                    : 'text-[#AAB4C3] hover:text-white hover:bg-[#071426]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#147BFF]'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-[#071426] rounded-xl border border-[#1E293B] space-y-1">
        <p className="text-[10px] font-semibold text-[#147BFF]">ZEROTRACE SECURE RBAC</p>
        <p className="text-[11px] text-[#AAB4C3]">Logged in as <span className="text-white font-mono">{admin.email}</span></p>
      </div>
    </aside>
  );
}
