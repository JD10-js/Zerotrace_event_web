import { getCurrentAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import AdminSidebar from '@/components/AdminSidebar';
import { prisma } from '@/lib/db';
import SettingsClient from './SettingsClient';

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdminSession();
  if (!admin) redirect('/admin/login');

  const settingsRecords = await prisma.eventSetting.findMany();
  const settingsMap: Record<string, string> = {};
  settingsRecords.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return (
    <div className="min-h-screen bg-[#05070A] text-[#FFFFFF] flex flex-col">
      <AdminNavbar admin={admin} />

      <div className="flex flex-1">
        <AdminSidebar admin={admin} />

        <main className="flex-1 p-8 space-y-6 overflow-y-auto">
          <SettingsClient initialSettings={settingsMap} admin={admin} />
        </main>
      </div>
    </div>
  );
}
