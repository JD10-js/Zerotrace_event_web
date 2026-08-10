'use client';

import Link from 'next/link';
import { Shield, Ticket, ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import ZeroTraceLogo from './ZeroTraceLogo';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#05070A]/90 backdrop-blur-md border-b border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <ZeroTraceLogo size={42} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#147BFF]">ZeroTrace</span>
                <span className="text-[10px] bg-[#0B1F3A] text-[#AAB4C3] px-1.5 py-0.5 rounded border border-[#1E293B]">PRESENTS</span>
              </div>
              <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                EUREKA! <span className="text-xs font-normal text-[#AAB4C3]">2026</span>
              </h1>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#AAB4C3]">
            <Link href="/" className="hover:text-white transition-colors">Overview</Link>
            <Link href="#why-participate" className="hover:text-white transition-colors">Why Participate</Link>
            <Link href="#process" className="hover:text-white transition-colors">Process</Link>
            <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="#contact" className="hover:text-white transition-colors">Contact</Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/verify"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#071426] border border-[#1E293B] hover:border-[#147BFF]/50 rounded-lg transition-all"
            >
              <Ticket className="w-4 h-4 text-[#147BFF]" />
              VERIFY ENTRY TICKET
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#147BFF] hover:bg-[#0062E6] rounded-lg transition-all shadow-lg shadow-[#147BFF]/20"
            >
              REGISTER YOUR TEAM
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#AAB4C3] hover:text-white focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#071426] border-b border-[#1E293B] px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-white py-2 hover:text-[#147BFF]"
          >
            Overview
          </Link>
          <Link
            href="#why-participate"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#AAB4C3] py-2 hover:text-white"
          >
            Why Participate
          </Link>
          <Link
            href="#process"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#AAB4C3] py-2 hover:text-white"
          >
            Process
          </Link>
          <Link
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#AAB4C3] py-2 hover:text-white"
          >
            FAQ
          </Link>
          <Link
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#AAB4C3] py-2 hover:text-white"
          >
            Contact
          </Link>
          <div className="pt-4 border-t border-[#1E293B] space-y-2">
            <Link
              href="/verify"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold text-white bg-[#0B1F3A] border border-[#1E293B] rounded-lg"
            >
              <Ticket className="w-4 h-4 text-[#147BFF]" />
              VERIFY ENTRY TICKET
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-white bg-[#147BFF] rounded-lg shadow-md"
            >
              REGISTER YOUR TEAM
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
