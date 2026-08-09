import { getCurrentAdminSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import AdminSidebar from '@/components/AdminSidebar';
import { prisma } from '@/lib/db';
import TeamDetailClient from './TeamDetailClient';

export default async function TeamDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = await getCurrentAdminSession();
  if (!admin) redirect('/admin/login');

  const team = await prisma.team.findUnique({
    where: { teamId: params.id },
    include: {
      members: true,
      tickets: true,
      checkIn: true,
    },
  });

  if (!team) notFound();

  // Fetch audit logs related to this team
  const auditLogs = await prisma.auditLog.findMany({
    where: { relatedTeamId: team.teamId },
    orderBy: { createdAt: 'desc' },
  });

  const formattedTeam = {
    id: team.id,
    teamId: team.teamId,
    name: team.name,
    college: team.college,
    department: team.department,
    city: team.city,
    leaderName: team.leaderName,
    leaderEmail: team.leaderEmail,
    leaderPhone: team.leaderPhone,
    status: team.status,
    verificationToken: team.verificationToken,
    createdAt: team.createdAt.toISOString(),
    members: team.members.map((m) => ({
      id: m.id,
      fullName: m.fullName,
      department: m.department,
      year: m.year,
      email: m.email,
      phone: m.phone,
    })),
    tickets: team.tickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      status: t.status,
      generatedAt: t.generatedAt.toISOString(),
    })),
    checkIn: team.checkIn
      ? {
          checkedInAt: team.checkIn.checkedInAt.toISOString(),
          checkedInByAdminName: team.checkIn.checkedInByAdminName,
          notes: team.checkIn.notes,
        }
      : null,
    auditLogs: auditLogs.map((a) => ({
      id: a.id,
      action: a.action,
      adminEmail: a.adminEmail,
      createdAt: a.createdAt.toISOString(),
      details: a.details,
    })),
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col">
      <AdminNavbar admin={admin} />

      <div className="flex flex-1">
        <AdminSidebar admin={admin} />

        <main className="flex-1 p-8 space-y-6 overflow-y-auto">
          <TeamDetailClient team={formattedTeam} admin={admin} />
        </main>
      </div>
    </div>
  );
}
