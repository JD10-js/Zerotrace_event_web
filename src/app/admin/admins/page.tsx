import { getCurrentAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import AdminSidebar from '@/components/AdminSidebar';
import { prisma } from '@/lib/db';
import AdminsClient from './AdminsClient';

export default async function AdminManagementPage() {
  const admin = await getCurrentAdminSession();
  if (!admin) redirect('/admin/login');

  const adminUsers = await prisma.adminUser.findMany({
    include: { permissions: true },
    orderBy: { createdAt: 'desc' },
  });

  const invitations = await prisma.adminInvitation.findMany({
    where: { usedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  const formattedAdmins = adminUsers.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    role: a.role,
    isActive: a.isActive,
    lastLogin: a.lastLogin ? a.lastLogin.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    permissions: a.permissions.map((p) => p.permission),
  }));

  const formattedInvitations = invitations.map((i) => ({
    id: i.id,
    email: i.email,
    role: i.role,
    invitedBy: i.invitedBy,
    expiresAt: i.expiresAt.toISOString(),
    createdAt: i.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col w-full max-w-full overflow-x-hidden">
      <AdminNavbar admin={admin} />

      <div className="flex flex-1 flex-col md:flex-row w-full max-w-full overflow-x-hidden">
        <AdminSidebar admin={admin} />

        <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto w-full max-w-full overflow-x-hidden">
          <AdminsClient
            initialAdmins={formattedAdmins}
            initialInvitations={formattedInvitations}
            admin={admin}
          />
        </main>
      </div>
    </div>
  );
}
