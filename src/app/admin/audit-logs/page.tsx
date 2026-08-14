import { getCurrentAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import AdminSidebar from '@/components/AdminSidebar';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';

export default async function AuditLogsPage() {
  const admin = await getCurrentAdminSession();
  if (!admin) redirect('/admin/login');

  if (!hasPermission(admin, 'VIEW_AUDIT_LOGS')) {
    return (
      <div className="min-h-screen bg-[#05070A] text-white flex flex-col">
        <AdminNavbar admin={admin} />
        <div className="flex flex-1">
          <AdminSidebar admin={admin} />
          <main className="flex-1 p-8">
            <div className="glass-panel p-8 rounded-2xl border border-rose-500/30 text-rose-300">
              <h2 className="text-lg font-bold">ACCESS FORBIDDEN</h2>
              <p className="text-xs mt-1">You do not have VIEW_AUDIT_LOGS permissions.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col w-full max-w-full overflow-x-hidden">
      <AdminNavbar admin={admin} />

      <div className="flex flex-1 flex-col md:flex-row w-full max-w-full overflow-x-hidden">
        <AdminSidebar admin={admin} />

        <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto w-full max-w-full overflow-x-hidden">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wide">SYSTEM AUDIT LOGS</h1>
            <p className="text-xs text-[#AAB4C3]">Complete audit trail of all security, check-in, and administration actions.</p>
          </div>

          <div className="glass-panel rounded-2xl border border-[#1E293B] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#AAB4C3]">
                <thead className="bg-[#05070A] uppercase text-[10px] font-bold text-[#147BFF] border-b border-[#1E293B]">
                  <tr>
                    <th className="p-4">Action</th>
                    <th className="p-4">Administrator</th>
                    <th className="p-4">Team ID</th>
                    <th className="p-4">Metadata</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#071426]/50">
                      <td className="p-4 font-mono font-bold text-[#147BFF]">{log.action}</td>
                      <td className="p-4 font-medium text-white">{log.adminEmail || 'System'}</td>
                      <td className="p-4 font-mono text-white">{log.relatedTeamId || '—'}</td>
                      <td className="p-4 max-w-xs truncate text-[11px] font-mono text-[#AAB4C3]">
                        {log.details || '—'}
                      </td>
                      <td className="p-4 text-[11px]">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#AAB4C3]">
                        No system audit entries logged yet.
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
