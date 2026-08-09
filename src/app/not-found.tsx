import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#05070A] subtle-grid-bg text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-[#147BFF]/30 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#071426] border border-[#147BFF]/30 flex items-center justify-center mx-auto text-[#147BFF]">
            <Shield className="w-8 h-8" />
          </div>

          <h1 className="text-4xl font-black uppercase text-white tracking-wide">404</h1>
          <h2 className="text-lg font-bold text-white">PAGE NOT FOUND</h2>

          <p className="text-xs text-[#AAB4C3]">
            The page or verification route you are looking for does not exist or has been moved.
          </p>

          <Link
            href="/"
            className="inline-block w-full py-3 px-4 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-xs text-white rounded-xl shadow-lg transition-all"
          >
            RETURN TO HOME
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
