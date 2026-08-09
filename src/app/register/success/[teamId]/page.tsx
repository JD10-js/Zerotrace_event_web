import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TicketCard from '@/components/TicketCard';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

export default async function RegistrationSuccessPage({
  params,
}: {
  params: { teamId: string };
}) {
  const team = await prisma.team.findUnique({
    where: { teamId: params.teamId },
    include: { members: true },
  });

  if (!team) {
    notFound();
  }

  const ticketData = {
    teamId: team.teamId,
    name: team.name,
    college: team.college,
    leaderName: team.leaderName,
    memberCount: 1 + team.members.length,
    status: team.status,
    verificationToken: team.verificationToken,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#05070A] subtle-grid-bg">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-10">
        
        {/* Banner */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#071426] border border-[#147BFF]/30 text-[#147BFF] text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            ZeroTrace Entry Pass Generated
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            REGISTRATION SUCCESSFUL
          </h1>

          <p className="text-sm text-[#AAB4C3]">
            Your team has been successfully registered for <strong>EUREKA! – Road To Enterprise 2026</strong>
          </p>

          <div className="inline-block bg-[#071426] border border-[#147BFF] px-6 py-3 rounded-2xl">
            <span className="text-[10px] font-bold text-[#AAB4C3] uppercase block">YOUR OFFICIAL TEAM ID</span>
            <h2 className="text-3xl font-black text-[#147BFF] tracking-widest mt-1">{team.teamId}</h2>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-amber-300 text-xs max-w-2xl mx-auto">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <p>
            <strong>IMPORTANT:</strong> Keep your Team ID and QR ticket safe. You will need to present the QR code for event entry and venue check-in.
          </p>
        </div>

        {/* Digital Ticket Pass Preview & Downloads */}
        <TicketCard data={ticketData} />

      </main>

      <Footer />
    </div>
  );
}
