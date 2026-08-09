import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { verifyTokenAction } from '@/actions/checkin-actions';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import { CheckCircle2, XCircle, Clock, ShieldCheck, ArrowLeft } from 'lucide-react';

export default async function VerifyTokenPage({
  params,
}: {
  params: { token: string };
}) {
  const result = await verifyTokenAction(params.token);

  return (
    <div className="min-h-screen flex flex-col bg-[#05070A] subtle-grid-bg">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#071426] border border-[#147BFF]/30 text-[#147BFF] text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            ZeroTrace Ticket Verification
          </div>
        </div>

        {/* Verification Result Card */}
        {result.success && result.team ? (
          <div className="glass-panel p-8 rounded-3xl border border-[#147BFF]/40 space-y-6">
            
            {/* Status Header */}
            <div className="text-center space-y-3 border-b border-[#1E293B] pb-6">
              {result.team.checkIn ? (
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <Clock className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              )}

              <h2 className="text-2xl font-black text-white uppercase tracking-wider">
                {result.team.checkIn ? 'ALREADY CHECKED IN' : 'VALID ENTRY PASS'}
              </h2>

              <p className="text-xs text-[#AAB4C3]">
                {result.team.checkIn
                  ? `Checked in on ${new Date(result.team.checkIn.checkedInAt).toLocaleString()}`
                  : 'Ticket verified for EUREKA! – Road To Enterprise 2026'}
              </p>
            </div>

            {/* Team Details Table */}
            <div className="space-y-4 text-xs">
              <div className="bg-[#05070A] p-4 rounded-xl border border-[#1E293B] flex items-center justify-between">
                <span className="text-[#AAB4C3]">TEAM ID:</span>
                <span className="text-lg font-mono font-black text-[#147BFF]">{result.team.teamId}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#05070A] p-3 rounded-xl border border-[#1E293B]">
                  <span className="text-[#AAB4C3] block">TEAM NAME</span>
                  <span className="text-sm font-bold text-white mt-1 block">{result.team.name}</span>
                </div>

                <div className="bg-[#05070A] p-3 rounded-xl border border-[#1E293B]">
                  <span className="text-[#AAB4C3] block">INSTITUTION</span>
                  <span className="text-sm font-semibold text-white mt-1 block truncate">{result.team.college}</span>
                </div>

                <div className="bg-[#05070A] p-3 rounded-xl border border-[#1E293B]">
                  <span className="text-[#AAB4C3] block">MEMBERS</span>
                  <span className="text-sm font-semibold text-white mt-1 block">{result.team.memberCount} Members</span>
                </div>

                <div className="bg-[#05070A] p-3 rounded-xl border border-[#1E293B]">
                  <span className="text-[#AAB4C3] block">PASS STATUS</span>
                  <div className="mt-1">
                    <StatusBadge status={result.team.status} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 text-center">
              <Link
                href="/verify"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] text-xs font-bold text-white rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 text-[#147BFF]" />
                SCAN ANOTHER TICKET
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-3xl border border-rose-500/30 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <XCircle className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-rose-400 uppercase">INVALID OR REVOKED TICKET</h2>
            <p className="text-xs text-[#AAB4C3] max-w-md mx-auto">
              {result.error || 'The verification code provided is invalid, expired, or has been revoked.'}
            </p>

            <Link
              href="/verify"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#071426] border border-[#1E293B] text-xs font-bold text-white rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 text-[#147BFF]" />
              RETURN TO VERIFICATION PORTAL
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
