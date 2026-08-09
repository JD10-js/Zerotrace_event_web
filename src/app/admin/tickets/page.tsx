import { getCurrentAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import AdminSidebar from '@/components/AdminSidebar';
import { prisma } from '@/lib/db';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';

export default async function AdminTicketsPage() {
  const admin = await getCurrentAdminSession();
  if (!admin) redirect('/admin/login');

  const tickets = await prisma.ticket.findMany({
    include: {
      team: true,
    },
    orderBy: { generatedAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col">
      <AdminNavbar admin={admin} />

      <div className="flex flex-1">
        <AdminSidebar admin={admin} />

        <main className="flex-1 p-8 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wide">TICKET MANAGEMENT</h1>
              <p className="text-xs text-[#AAB4C3]">Monitor, regenerate, and verify digital ticket passes.</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-[#1E293B] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#AAB4C3]">
                <thead className="bg-[#05070A] uppercase text-[10px] font-bold text-[#147BFF] border-b border-[#1E293B]">
                  <tr>
                    <th className="p-4">Ticket Number</th>
                    <th className="p-4">Team ID</th>
                    <th className="p-4">Team Name</th>
                    <th className="p-4">College</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Generated At</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-[#071426]/50">
                      <td className="p-4 font-mono font-bold text-white">{t.ticketNumber}</td>
                      <td className="p-4 font-mono text-[#147BFF] font-bold">{t.team.teamId}</td>
                      <td className="p-4 font-bold text-white">{t.team.name}</td>
                      <td className="p-4 max-w-[160px] truncate">{t.team.college}</td>
                      <td className="p-4">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="p-4 text-[11px]">{new Date(t.generatedAt).toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/teams/${t.team.teamId}`}
                          className="px-3 py-1 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] rounded text-xs text-white font-bold"
                        >
                          Manage Ticket
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#AAB4C3]">
                        No entry tickets generated yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
