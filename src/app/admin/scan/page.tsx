import { getCurrentAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import AdminSidebar from '@/components/AdminSidebar';
import QrScannerComponent from '@/components/QrScannerComponent';

export default async function AdminScanPage() {
  const admin = await getCurrentAdminSession();
  if (!admin) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col w-full max-w-full overflow-x-hidden">
      <AdminNavbar admin={admin} />

      <div className="flex flex-1 flex-col md:flex-row w-full max-w-full overflow-x-hidden">
        <AdminSidebar admin={admin} />

        <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto w-full max-w-full overflow-x-hidden">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide">ADMIN QR CHECK-IN SCANNER</h1>
            <p className="text-xs text-[#AAB4C3]">
              Scan entry tickets at venue doors using device camera or manual verification code.
            </p>
          </div>

          <QrScannerComponent isAdmin={true} />
        </main>
      </div>
    </div>
  );
}
