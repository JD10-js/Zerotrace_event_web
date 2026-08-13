import { getCurrentAdminSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import { prisma } from '@/lib/db';
import LivePresentationClient from './LivePresentationClient';

export default async function LivePresentationPage({
  params,
}: {
  params: { teamId: string };
}) {
  const admin = await getCurrentAdminSession();
  if (!admin) redirect('/admin/login');

  const team = await prisma.team.findUnique({
    where: { teamId: params.teamId },
    include: {
      members: true,
    },
  });

  if (!team) notFound();

  // Get all teams for stage navigation dropdown
  const allTeams = await prisma.team.findMany({
    select: { teamId: true, name: true, college: true },
    orderBy: { teamId: 'asc' },
  });

  const formattedTeam = {
    id: team.id,
    teamId: team.teamId,
    name: team.name,
    college: team.college,
    department: team.department,
    leaderName: team.leaderName,
    leaderEmail: team.leaderEmail,
    leaderPhone: team.leaderPhone,
    memberCount: 1 + team.members.length,
    presentationUrl: team.presentationUrl,
    presentationFileName: team.presentationFileName,
    pitchDurationMinutes: team.pitchDurationMinutes || 5,
    members: team.members.map((m) => ({
      fullName: m.fullName,
      department: m.department,
      year: m.year,
    })),
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col">
      <AdminNavbar admin={admin} />

      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <LivePresentationClient
          team={formattedTeam}
          allTeams={allTeams}
          admin={admin}
        />
      </main>
    </div>
  );
}
