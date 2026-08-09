import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QrScannerComponent from '@/components/QrScannerComponent';
import { Shield } from 'lucide-react';

export default function PublicVerifyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#05070A] subtle-grid-bg">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#071426] border border-[#147BFF]/30 text-[#147BFF] text-xs font-bold uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" />
            ZeroTrace Public Verification
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
            VERIFY ENTRY TICKET
          </h1>
          <p className="text-xs text-[#AAB4C3]">
            Scan ticket QR code or manually enter verification token / Team ID to check entry validity.
          </p>
        </div>

        <QrScannerComponent isAdmin={false} />
      </main>

      <Footer />
    </div>
  );
}
