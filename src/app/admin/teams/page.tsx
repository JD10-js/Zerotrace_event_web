import { getCurrentAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import AdminSidebar from '@/components/AdminSidebar';
import { prisma } from '@/lib/db';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import TeamsTableClient from './TeamsTableClient';

export default async function AdminTeamsPage() {
  const admin = await getCurrentAdminSession();
  if (!admin) redirect('/admin/login');

  const teams = await prisma.team.findMany({
    include: {
      members: true,
      checkIn: true,
      tickets: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedTeams = teams.map((t) => ({
    id: t.id,
    teamId: t.teamId,
    name: t.name,
    college: t.college,
    leaderName: t.leaderName,
    leaderEmail: t.leaderEmail,
    leaderPhone: t.leaderPhone,
    memberCount: 1 + t.members.length,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    isCheckedIn: !!t.checkIn,
    checkedInAt: t.checkIn ? t.checkIn.checkedInAt.toISOString() : null,
    checkedInBy: t.checkIn ? t.checkIn.checkedInByAdminName : null,
  }));

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col">
      <AdminNavbar admin={admin} />

      <div className="flex flex-1">
        <AdminSidebar admin={admin} />

        <main className="flex-1 p-8 space-y-6 overflow-y-auto">
          <TeamsTableClient initialTeams={formattedTeams} admin={admin} />
        </main>
      </div>
    </div>
  );
}
