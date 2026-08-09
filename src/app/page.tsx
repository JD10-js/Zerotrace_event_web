import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  Rocket,
  ShieldCheck,
  Target,
  Trophy,
  Calendar,
  MapPin,
  ArrowRight,
  Ticket,
  HelpCircle,
  Sparkles,
  Users,
  CheckCircle,
} from 'lucide-react';
import { prisma } from '@/lib/db';

export const revalidate = 60; // Refresh dynamic event settings every minute

export default async function HomePage() {
  // Read dynamic event settings from DB with fallback for build-time static generation
  const settingsMap: Record<string, string> = {};
  try {
    if (process.env.DATABASE_URL) {
      const settingsRecords = await prisma.eventSetting.findMany();
      settingsRecords.forEach((s) => {
        settingsMap[s.key] = s.value;
      });
    }
  } catch (err) {
    console.warn('Database query skipped during static build generation:', err);
  }

  const eventName = settingsMap.eventName || 'EUREKA! – Road To Enterprise 2026';
  const organizer = settingsMap.organizerName || 'ZeroTrace';
  const eventVenue = settingsMap.eventVenue || 'Auditorium Hall, Innovation Campus';
  const eventDate = settingsMap.eventDate || 'March 15-16, 2026';
  const importantDatesText = settingsMap.importantDates || 'Registration Closes: March 1, 2026';
  const contactEmail = settingsMap.contactEmail || 'contact@zerotrace.org';
  const regOpen = settingsMap.registrationOpen !== 'false';

  return (
    <div className="min-h-screen flex flex-col bg-[#05070A] subtle-grid-bg">
      <Navbar />

      <main className="flex-1">
        
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-28 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            
            {/* Top Branding Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#071426] border border-[#147BFF]/30 text-[#147BFF] text-xs font-bold uppercase tracking-widest mb-8">
              <Sparkles className="w-4 h-4 text-[#147BFF]" />
              ORGANIZED BY {organizer.toUpperCase()}
            </div>

            <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight uppercase leading-none">
              EUREKA!
            </h1>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#147BFF] mt-3 tracking-wide">
              Road To Enterprise 2026
            </h2>

            <p className="mt-6 text-xl sm:text-2xl text-[#AAB4C3] italic font-serif max-w-2xl mx-auto">
              "From Idea to Enterprise."
            </p>

            <p className="mt-6 text-sm sm:text-base text-[#AAB4C3] max-w-3xl mx-auto leading-relaxed">
              Join the premier college startup roadmap competition. Pitch your technological breakthrough, construct viable business models, and secure direct mentorship from industry founders.
            </p>

            {/* Quick Event Details Bar */}
            <div className="mt-8 max-w-xl mx-auto flex flex-wrap items-center justify-center gap-6 bg-[#071426]/80 p-4 rounded-xl border border-[#1E293B] text-xs text-[#AAB4C3]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#147BFF]" />
                <span>{eventDate}</span>
              </div>
              <div className="w-px h-4 bg-[#1E293B] hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#147BFF]" />
                <span>{eventVenue}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {regOpen ? (
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-sm text-white rounded-xl flex items-center justify-center gap-3 shadow-xl shadow-[#147BFF]/25 transition-all transform hover:-translate-y-0.5"
                >
                  REGISTER YOUR TEAM
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <span className="px-8 py-4 bg-[#0B1F3A] border border-rose-500/30 text-rose-400 font-bold text-sm rounded-xl">
                  REGISTRATION CLOSED
                </span>
              )}

              <Link
                href="/verify"
                className="w-full sm:w-auto px-8 py-4 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] hover:border-[#147BFF]/40 font-bold text-sm text-white rounded-xl flex items-center justify-center gap-3 transition-all"
              >
                <Ticket className="w-5 h-5 text-[#147BFF]" />
                VERIFY ENTRY TICKET
              </Link>
            </div>
          </div>
        </section>

        {/* EVENT OVERVIEW SECTION */}
        <section className="py-20 bg-[#071426]/40 border-y border-[#1E293B]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#147BFF]">EVENT OVERVIEW</h2>
              <h3 className="text-3xl font-extrabold text-white">What is EUREKA! 2026?</h3>
              <p className="text-sm text-[#AAB4C3] leading-relaxed">
                EUREKA! is a high-stakes entrepreneurship and technology innovation hackathon designed to transition promising student innovations into venture-backed market enterprises. Hosted under the strict governance of <strong>ZeroTrace</strong>, teams compete through multiple rounds of business modeling, prototype validation, and live venture capitalist pitching.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-panel p-8 rounded-2xl border border-[#1E293B] space-y-4 hover:border-[#147BFF]/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#147BFF]/10 border border-[#147BFF]/30 flex items-center justify-center text-[#147BFF]">
                  <Rocket className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Venture Ideation</h4>
                <p className="text-xs text-[#AAB4C3] leading-relaxed">
                  Transform raw technological prototypes into structured business models with validated market fit and financial projections.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-2xl border border-[#1E293B] space-y-4 hover:border-[#147BFF]/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#147BFF]/10 border border-[#147BFF]/30 flex items-center justify-center text-[#147BFF]">
                  <Trophy className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Industry Pitching</h4>
                <p className="text-xs text-[#AAB4C3] leading-relaxed">
                  Pitch live in front of angel investors, venture capitalists, and tech founders with real funding and incubation opportunities.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-2xl border border-[#1E293B] space-y-4 hover:border-[#147BFF]/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#147BFF]/10 border border-[#147BFF]/30 flex items-center justify-center text-[#147BFF]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">ZeroTrace Certification</h4>
                <p className="text-xs text-[#AAB4C3] leading-relaxed">
                  All registered teams receive verified QR entry passes, digital credentials, and formal mentorship certificates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* WHY PARTICIPATE SECTION */}
        <section id="why-participate" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-[#147BFF]">BENEFITS</span>
                <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  Why Register Your Team for EUREKA!?
                </h3>
                <p className="text-sm text-[#AAB4C3] leading-relaxed">
                  Whether you are building AI platforms, hardware robotics, clean tech, or web3 infrastructure, EUREKA! provides the resources and network required to accelerate your enterprise journey.
                </p>

                <div className="space-y-3 pt-2">
                  {[
                    'Direct access to corporate mentors and seed funding opportunities',
                    'ZeroTrace official startup credentialing & entry pass',
                    'Live workshops on term sheet negotiations, IP, and scaling',
                    'Networking with top engineering & business talent across institutions',
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#147BFF] shrink-0 mt-0.5" />
                      <span className="text-sm text-white font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-8 rounded-3xl border border-[#147BFF]/30 bg-gradient-to-b from-[#071426] to-[#05070A] space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#147BFF] flex items-center justify-center font-bold text-white text-lg">
                    ZT
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">ZeroTrace Security Protocol</h4>
                    <p className="text-xs text-[#AAB4C3]">Automated Entry Management</p>
                  </div>
                </div>

                <div className="bg-[#05070A] p-4 rounded-xl border border-[#1E293B] space-y-2 text-xs">
                  <p className="text-[#147BFF] font-mono font-bold">✓ AUTOMATIC TEAM ID: ERE26-XXXX</p>
                  <p className="text-[#AAB4C3]">Instant encrypted QR ticket pass generation upon registration.</p>
                  <p className="text-[#AAB4C3]">Seamless venue check-in verification via device cameras.</p>
                </div>

                <Link
                  href="/register"
                  className="block w-full text-center py-3 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-xs text-white rounded-xl shadow-lg transition-all"
                >
                  START TEAM REGISTRATION NOW
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* REGISTRATION PROCESS SECTION */}
        <section id="process" className="py-20 bg-[#071426]/30 border-t border-[#1E293B]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#147BFF]">STEP-BY-STEP</span>
              <h3 className="text-3xl font-extrabold text-white">Registration Process</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Team Details', desc: 'Enter Team Name, College/Institution, Department, and City.' },
                { step: '02', title: 'Leader Info', desc: 'Provide contact details for the Team Leader (Email & Phone).' },
                { step: '03', title: 'Add Members', desc: 'Dynamically add your co-founders and team members.' },
                { step: '04', title: 'Get QR Pass', desc: 'Instantly receive your server-generated Team ID & PDF Pass.' },
              ].map((s) => (
                <div key={s.step} className="glass-panel p-6 rounded-2xl border border-[#1E293B] relative">
                  <span className="text-3xl font-black text-[#147BFF]/30 block font-mono">{s.step}</span>
                  <h4 className="text-base font-bold text-white mt-2">{s.title}</h4>
                  <p className="text-xs text-[#AAB4C3] mt-2 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IMPORTANT DATES SECTION */}
        <section id="dates" className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#147BFF]">SCHEDULE</span>
              <h3 className="text-3xl font-extrabold text-white">Important Event Dates</h3>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-[#1E293B] text-left space-y-4">
              <div className="flex items-center gap-3 text-white font-bold text-lg">
                <Calendar className="w-6 h-6 text-[#147BFF]" />
                <span>{importantDatesText}</span>
              </div>
              <p className="text-xs text-[#AAB4C3]">
                Event Venue: <strong className="text-white">{eventVenue}</strong>
              </p>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-20 bg-[#071426]/30 border-t border-[#1E293B]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#147BFF]">ANSWERS</span>
              <h3 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h3>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'What is the team size requirement for EUREKA! 2026?',
                  a: 'Teams can range from 2 to 5 members including the team leader. Exact bounds are governed by event settings.',
                },
                {
                  q: 'How do I receive my team entry ticket?',
                  a: 'Upon completing the registration form, your unique Team ID (e.g. ERE26-0001) and digital entry ticket PDF with QR code are automatically generated on the server.',
                },
                {
                  q: 'How does venue check-in work?',
                  a: 'Present your PDF or mobile entry pass at the event entrance. Organizer staff will scan your QR code using the ZeroTrace admin scanner.',
                },
                {
                  q: 'Is there a registration fee?',
                  a: 'Check official announcement details from ZeroTrace or contact support@zerotrace.org.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="glass-panel p-6 rounded-2xl border border-[#1E293B] space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#147BFF]" />
                    {faq.q}
                  </h4>
                  <p className="text-xs text-[#AAB4C3] pl-6 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h3 className="text-3xl font-extrabold text-white">Need Support or Have Questions?</h3>
            <p className="text-sm text-[#AAB4C3]">
              Contact the ZeroTrace organizing committee directly at <a href={`mailto:${contactEmail}`} className="text-[#147BFF] underline">{contactEmail}</a>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
