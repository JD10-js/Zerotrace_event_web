import { getCurrentAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import AdminSidebar from '@/components/AdminSidebar';
import { prisma } from '@/lib/db';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';

export default async function AdminCheckInsPage() {
  const admin = await getCurrentAdminSession();
  if (!admin) redirect('/admin/login');

  const totalRegistered = await prisma.team.count();
  const checkIns = await prisma.checkIn.findMany({
    include: { team: true },
    orderBy: { checkedInAt: 'desc' },
  });

  const totalCheckedIn = checkIns.length;
  const remaining = totalRegistered - totalCheckedIn;

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col">
      <AdminNavbar admin={admin} />

      <div className="flex flex-1">
        <AdminSidebar admin={admin} />

        <main className="flex-1 p-8 space-y-6 overflow-y-auto">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wide">VENUE CHECK-IN MANAGEMENT</h1>
              <p className="text-xs text-[#AAB4C3]">Real-time attendance logs and administrator audit.</p>
            </div>
            <Link
              href="/admin/scan"
              className="px-4 py-2 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-xs text-white rounded-xl shadow"
            >
              LAUNCH QR SCANNER →
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-[#1E293B]">
              <span className="text-[10px] font-bold text-[#AAB4C3] uppercase block">TOTAL REGISTERED</span>
              <p className="text-3xl font-black text-white mt-1">{totalRegistered}</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-[#1E293B]">
              <span className="text-[10px] font-bold text-[#AAB4C3] uppercase block">TOTAL CHECKED IN</span>
              <p className="text-3xl font-black text-emerald-400 mt-1">{totalCheckedIn}</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-[#1E293B]">
              <span className="text-[10px] font-bold text-[#AAB4C3] uppercase block">REMAINING TEAMS</span>
              <p className="text-3xl font-black text-amber-400 mt-1">{remaining}</p>
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel rounded-2xl border border-[#1E293B] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#AAB4C3]">
                <thead className="bg-[#05070A] uppercase text-[10px] font-bold text-[#147BFF] border-b border-[#1E293B]">
                  <tr>
                    <th className="p-4">Team ID</th>
                    <th className="p-4">Team Name</th>
                    <th className="p-4">College</th>
                    <th className="p-4">Checked In At</th>
                    <th className="p-4">Checked In By Admin</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {checkIns.map((ci) => (
                    <tr key={ci.id} className="hover:bg-[#071426]/50">
                      <td className="p-4 font-mono font-bold text-[#147BFF]">{ci.team.teamId}</td>
                      <td className="p-4 font-bold text-white">{ci.team.name}</td>
                      <td className="p-4">{ci.team.college}</td>
                      <td className="p-4 text-[11px] text-white font-medium">
                        {new Date(ci.checkedInAt).toLocaleString()}
                      </td>
                      <td className="p-4 font-semibold text-white">{ci.checkedInByAdminName}</td>
                      <td className="p-4">
                        <StatusBadge status="CHECKED_IN" type="checkin" />
                      </td>
                    </tr>
                  ))}
                  {checkIns.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#AAB4C3]">
                        No check-ins performed yet.
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
