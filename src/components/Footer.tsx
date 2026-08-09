import Link from 'next/link';
import { Lock } from 'lucide-react';
import ZeroTraceLogo from './ZeroTraceLogo';

export default function Footer() {
  return (
    <footer className="bg-[#05070A] border-t border-[#1E293B] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#1E293B]">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <ZeroTraceLogo size={36} />
              <span className="text-xl font-bold text-white tracking-wider">ZeroTrace</span>
            </div>
            <p className="text-sm text-[#AAB4C3] leading-relaxed max-w-md">
              Organized by <strong>ZeroTrace</strong>. EUREKA! – Road To Enterprise 2026 is the flagship entrepreneurship and technology innovation competition for college founders and tech pioneers.
            </p>
            <p className="text-xs text-[#AAB4C3]/70">
              © {new Date().getFullYear()} ZeroTrace. All rights reserved. Official Entry Pass Platform.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#147BFF]">Platform Links</h4>
            <ul className="space-y-2 text-sm text-[#AAB4C3]">
              <li><Link href="/" className="hover:text-white transition-colors">Event Overview</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Team Registration</Link></li>
              <li><Link href="/verify" className="hover:text-white transition-colors">Public QR Verification</Link></li>
              <li><Link href="#faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
            </ul>
          </div>

          {/* Administration & Help */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#147BFF]">Organizer & Admin</h4>
            <ul className="space-y-2 text-sm text-[#AAB4C3]">
              <li>
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-2 text-xs text-[#147BFF] hover:underline bg-[#071426] px-3 py-1.5 rounded border border-[#147BFF]/30"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Admin Control Panel
                </Link>
              </li>
              <li>
                <span className="text-xs text-[#AAB4C3] block mt-2">Support Email:</span>
                <span className="text-xs text-white">support@zerotrace.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#AAB4C3]">
          <p>EUREKA! – Road To Enterprise 2026 • ZeroTrace Security Verification System</p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer">Terms & Conditions</span>
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Code of Conduct</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
