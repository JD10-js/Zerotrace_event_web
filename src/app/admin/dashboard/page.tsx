import { getCurrentAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import AdminSidebar from '@/components/AdminSidebar';
import { prisma } from '@/lib/db';
import { Users, CheckCircle2, Clock, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdminSession();
  if (!admin) {
    redirect('/admin/login');
  }

  // Calculate Metrics
  const totalTeams = await prisma.team.count();
  const checkedInCount = await prisma.checkIn.count();
  const pendingCheckIn = totalTeams - checkedInCount;

  // Registrations today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const registrationsToday = await prisma.team.count({
    where: { createdAt: { gte: startOfDay } },
  });

  // Recent 5 Teams
  const recentTeams = await prisma.team.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { checkIn: true },
  });

  // Recent 5 Check-ins
  const recentCheckIns = await prisma.checkIn.findMany({
    take: 5,
    orderBy: { checkedInAt: 'desc' },
    include: { team: true },
  });

  // College breakdown
  const collegeGroups = await prisma.team.groupBy({
    by: ['college'],
    _count: { college: true },
    orderBy: { _count: { college: 'desc' } },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col">
      <AdminNavbar admin={admin} />

      <div className="flex flex-1">
        <AdminSidebar admin={admin} />

        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wide">ADMINISTRATOR DASHBOARD</h1>
              <p className="text-xs text-[#AAB4C3]">
                Overview metrics and real-time check-in stats for EUREKA! 2026.
              </p>
            </div>
            <Link
              href="/admin/scan"
              className="px-4 py-2.5 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-xs text-white rounded-xl shadow-lg shadow-[#147BFF]/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              OPEN QR SCANNER
            </Link>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-[#1E293B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#AAB4C3]">TOTAL TEAMS</span>
                <Users className="w-5 h-5 text-[#147BFF]" />
              </div>
              <div className="text-3xl font-black text-white">{totalTeams}</div>
              <p className="text-[11px] text-[#AAB4C3]">Registered on platform</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-[#1E293B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#AAB4C3]">CHECKED IN</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400">{checkedInCount}</div>
              <p className="text-[11px] text-[#AAB4C3]">Venue entry confirmed</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-[#1E293B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#AAB4C3]">PENDING CHECK-IN</span>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400">{pendingCheckIn}</div>
              <p className="text-[11px] text-[#AAB4C3]">Awaiting arrival</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-[#1E293B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#AAB4C3]">REGISTRATIONS TODAY</span>
                <TrendingUp className="w-5 h-5 text-[#147BFF]" />
              </div>
              <div className="text-3xl font-black text-white">{registrationsToday}</div>
              <p className="text-[11px] text-[#AAB4C3]">Since midnight</p>
            </div>
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recent Registrations Table */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">RECENT REGISTRATIONS</h3>
                <Link href="/admin/teams" className="text-xs text-[#147BFF] hover:underline">
                  View All Teams →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#AAB4C3]">
                  <thead className="bg-[#05070A] uppercase text-[10px] font-bold text-[#147BFF]">
                    <tr>
                      <th className="p-3">Team ID</th>
                      <th className="p-3">Team Name</th>
                      <th className="p-3">College</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {recentTeams.map((team) => (
                      <tr key={team.id} className="hover:bg-[#071426]/50">
                        <td className="p-3 font-mono font-bold text-white">{team.teamId}</td>
                        <td className="p-3 font-semibold text-white">{team.name}</td>
                        <td className="p-3 max-w-[150px] truncate">{team.college}</td>
                        <td className="p-3">
                          <StatusBadge status={team.checkIn ? 'CHECKED_IN' : team.status} type={team.checkIn ? 'checkin' : 'team'} />
                        </td>
                        <td className="p-3 text-right">
                          <Link href={`/admin/teams/${team.teamId}`} className="text-[#147BFF] hover:underline font-bold">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {recentTeams.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-[#AAB4C3]">
                          No team registrations found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* College breakdown */}
            <div className="glass-panel p-6 rounded-2xl border border-[#1E293B] space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-[#1E293B] pb-3">
                TEAMS BY COLLEGE
              </h3>

              <div className="space-y-3">
                {collegeGroups.map((g, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#05070A] rounded-xl border border-[#1E293B] text-xs">
                    <span className="font-semibold text-white truncate max-w-[180px]">{g.college}</span>
                    <span className="px-2.5 py-1 bg-[#147BFF]/20 text-[#147BFF] font-bold rounded-lg border border-[#147BFF]/30">
                      {g._count.college} Teams
                    </span>
                  </div>
                ))}
                {collegeGroups.length === 0 && (
                  <p className="text-xs text-[#AAB4C3] text-center">No college statistics available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Check-ins */}
          <div className="glass-panel p-6 rounded-2xl border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">RECENT VENUE CHECK-INS</h3>
              <Link href="/admin/check-ins" className="text-xs text-[#147BFF] hover:underline">
                View Check-in Logs →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentCheckIns.map((ci) => (
                <div key={ci.id} className="bg-[#05070A] p-4 rounded-xl border border-[#1E293B] space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-[#147BFF]">{ci.team.teamId}</span>
                    <span className="text-[10px] text-[#AAB4C3]">{new Date(ci.checkedInAt).toLocaleTimeString()}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{ci.team.name}</h4>
                  <p className="text-[#AAB4C3] truncate">{ci.team.college}</p>
                  <div className="pt-2 border-t border-[#1E293B] flex justify-between text-[11px] text-[#AAB4C3]">
                    <span>Checked in by:</span>
                    <span className="text-white font-medium">{ci.checkedInByAdminName}</span>
                  </div>
                </div>
              ))}
              {recentCheckIns.length === 0 && (
                <p className="text-xs text-[#AAB4C3] col-span-3 text-center py-4">No check-ins performed yet.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
