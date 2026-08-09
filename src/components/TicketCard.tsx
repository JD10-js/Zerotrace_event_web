'use client';

import { useState, useEffect } from 'react';
import { Download, Mail, CheckCircle2 } from 'lucide-react';
import { generateQrCodeDataUrl } from '@/lib/qrcode';
import { generateTicketPdf, TicketData } from '@/lib/ticket-generator';
import { resendTicketEmailAction } from '@/actions/team-actions';
import ZeroTraceLogo from './ZeroTraceLogo';

export default function TicketCard({ data }: { data: TicketData }) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [emailing, setEmailing] = useState(false);
  const [emailSentMsg, setEmailSentMsg] = useState('');

  useEffect(() => {
    generateQrCodeDataUrl(data.verificationToken).then((url) => setQrUrl(url));
  }, [data.verificationToken]);

  async function handleDownloadPdf() {
    const doc = await generateTicketPdf(data);
    doc.save(`EUREKA_Ticket_${data.teamId}.pdf`);
  }

  async function handleEmailTicket() {
    setEmailing(true);
    setEmailSentMsg('');
    const res = await resendTicketEmailAction(data.teamId);
    setEmailing(false);

    if (res.success) {
      setEmailSentMsg('Ticket email sent successfully!');
    } else {
      setEmailSentMsg(res.error || 'Email failed.');
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      
      {/* Visual Digital Ticket Pass Card */}
      <div className="relative bg-gradient-to-b from-[#071426] to-[#05070A] border border-[#147BFF]/40 rounded-3xl p-6 shadow-2xl space-y-6 overflow-hidden">
        
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#147BFF]/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-2.5">
            <ZeroTraceLogo size={32} />
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#147BFF] uppercase block">ZeroTrace Pass</span>
              <h3 className="text-sm font-bold text-white leading-tight">EUREKA! 2026</h3>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#147BFF]/20 text-[#147BFF] border border-[#147BFF]/40">
            OFFICIAL ENTRY
          </span>
        </div>

        {/* Prominent Team ID Box */}
        <div className="bg-[#147BFF] p-4 rounded-2xl text-center text-white shadow-lg">
          <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase block">TEAM ID</span>
          <h1 className="text-3xl font-black tracking-widest mt-0.5">{data.teamId}</h1>
        </div>

        {/* Details List */}
        <div className="bg-[#081629] p-4 rounded-xl border border-[#1E293B] space-y-2.5 text-xs">
          <div className="flex justify-between border-b border-[#1E293B] pb-2">
            <span className="text-[#AAB4C3]">Team Name:</span>
            <span className="font-bold text-white text-right">{data.name}</span>
          </div>
          <div className="flex justify-between border-b border-[#1E293B] pb-2">
            <span className="text-[#AAB4C3]">College / Institution:</span>
            <span className="font-semibold text-white text-right max-w-[200px] truncate">{data.college}</span>
          </div>
          <div className="flex justify-between border-b border-[#1E293B] pb-2">
            <span className="text-[#AAB4C3]">Team Leader:</span>
            <span className="font-medium text-white">{data.leaderName}</span>
          </div>
          <div className="flex justify-between border-b border-[#1E293B] pb-2">
            <span className="text-[#AAB4C3]">Total Members:</span>
            <span className="font-medium text-white">{data.memberCount} Members</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#AAB4C3]">Registration Status:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {data.status}
            </span>
          </div>
        </div>

        {/* QR Code Canvas */}
        <div className="bg-white p-3 rounded-2xl max-w-[180px] mx-auto text-center shadow-inner">
          {qrUrl ? (
            <img src={qrUrl} alt="QR Code Ticket" className="w-full h-auto mx-auto rounded-lg" />
          ) : (
            <div className="w-36 h-36 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
              Generating QR...
            </div>
          )}
          <span className="text-[9px] font-bold text-gray-700 tracking-wider block mt-1.5 uppercase">
            SCAN TO VERIFY ENTRY
          </span>
        </div>

        {/* Card Stub Divider */}
        <div className="border-t-2 border-dashed border-[#1E293B] pt-4 text-center">
          <p className="text-[10px] text-[#AAB4C3]">
            Present this digital ticket at the venue check-in desk.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleDownloadPdf}
          className="w-full py-3.5 px-4 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-xs text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#147BFF]/25 transition-all"
        >
          <Download className="w-4 h-4" />
          DOWNLOAD ENTRY TICKET (PDF)
        </button>

        <button
          onClick={handleEmailTicket}
          disabled={emailing}
          className="w-full py-3 px-4 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] hover:border-[#147BFF]/50 font-semibold text-xs text-white rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Mail className="w-4 h-4 text-[#147BFF]" />
          {emailing ? 'SENDING EMAIL...' : 'EMAIL TICKET PASS TO LEADER'}
        </button>

        {emailSentMsg && (
          <p className="text-center text-xs text-emerald-400 font-medium">{emailSentMsg}</p>
        )}
      </div>
    </div>
  );
}
