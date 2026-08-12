'use client';

import { useState } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import { updateEventSettingsAction } from '@/actions/settings-actions';

export default function SettingsClient({
  initialSettings,
  admin,
}: {
  initialSettings: Record<string, string>;
  admin: any;
}) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const [eventName, setEventName] = useState(initialSettings.eventName || 'EUREKA! – Road To Enterprise 2026');
  const [organizerName, setOrganizerName] = useState(initialSettings.organizerName || 'ZeroTrace');
  const [registrationOpen, setRegistrationOpen] = useState(initialSettings.registrationOpen !== 'false');
  const [minTeamSize, setMinTeamSize] = useState(initialSettings.minTeamSize || '2');
  const [maxTeamSize, setMaxTeamSize] = useState(initialSettings.maxTeamSize || '5');
  const [teamIdPrefix, setTeamIdPrefix] = useState(initialSettings.teamIdPrefix || 'ERE26');
  const [startingSequence, setStartingSequence] = useState(initialSettings.startingSequence || '1001');
  const [eventVenue, setEventVenue] = useState(initialSettings.eventVenue || 'Main Auditorium, Innovation Block');
  const [eventDate, setEventDate] = useState(initialSettings.eventDate || 'August 17, 2026');
  const [importantDates, setImportantDates] = useState(initialSettings.importantDates || 'Registration Closes: March 1, 2026');
  const [contactEmail, setContactEmail] = useState(initialSettings.contactEmail || 'contact@zerotrace.org');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const res = await updateEventSettingsAction({
      eventName,
      organizerName,
      registrationOpen: registrationOpen ? 'true' : 'false',
      minTeamSize,
      maxTeamSize,
      teamIdPrefix,
      startingSequence,
      eventVenue,
      eventDate,
      importantDates,
      contactEmail,
    });

    setLoading(false);
    if (res.success) {
      setMsg('Event settings updated successfully!');
    } else {
      setMsg(res.error || 'Failed to save settings.');
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-wide">EVENT & PLATFORM SETTINGS</h1>
        <p className="text-xs text-[#AAB4C3]">Configure global parameters, registration bounds, dates, and Team ID formats.</p>
      </div>

      {msg && (
        <div className="p-4 bg-[#147BFF]/10 border border-[#147BFF]/30 rounded-xl text-xs font-bold text-[#147BFF] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl border border-[#1E293B] space-y-8">
        
        {/* Toggle Registration */}
        <div className="p-4 bg-[#05070A] rounded-2xl border border-[#1E293B] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase">PUBLIC TEAM REGISTRATION STATUS</h3>
            <p className="text-xs text-[#AAB4C3]">Toggle whether public users can register new teams.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={registrationOpen}
              onChange={(e) => setRegistrationOpen(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#071426] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#147BFF]"></div>
          </label>
        </div>

        {/* Section 1: Event Identity */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#147BFF] uppercase tracking-wider border-b border-[#1E293B] pb-2">
            EVENT BRANDING & IDENTITY
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[#AAB4C3] block mb-1 font-semibold">EVENT NAME</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-4 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-[#AAB4C3] block mb-1 font-semibold font-semibold">ORGANIZER NAME</label>
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-4 py-2.5 text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Team Rules & Prefixes */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#147BFF] uppercase tracking-wider border-b border-[#1E293B] pb-2">
            TEAM RULES & UNIQUE ID FORMAT
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-[#AAB4C3] block mb-1 font-semibold">MIN TEAM SIZE</label>
              <input
                type="number"
                value={minTeamSize}
                onChange={(e) => setMinTeamSize(e.target.value)}
                className="w-full bg-[#05070A] border border-[#1E293B] rounded-xl px-4 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-[#AAB4C3] block mb-1 font-semibold">MAX TEAM SIZE</label>
              <input
                type="number"
                value={maxTeamSize}
                onChange={(e) => setMaxTeamSize(e.target.value)}
                className="w-full bg-[#05070A] border border-[#1E293B] rounded-xl px-4 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-[#AAB4C3] block mb-1 font-semibold">TEAM ID PREFIX</label>
              <input
                type="text"
                value={teamIdPrefix}
                onChange={(e) => setTeamIdPrefix(e.target.value)}
                placeholder="ERE26"
                className="w-full bg-[#05070A] border border-[#1E293B] font-mono text-white rounded-xl px-4 py-2.5"
              />
            </div>

            <div>
              <label className="text-[#AAB4C3] block mb-1 font-semibold">START SEQUENCE</label>
              <input
                type="number"
                value={startingSequence}
                onChange={(e) => setStartingSequence(e.target.value)}
                className="w-full bg-[#05070A] border border-[#1E293B] font-mono text-white rounded-xl px-4 py-2.5"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Logistics */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#147BFF] uppercase tracking-wider border-b border-[#1E293B] pb-2">
            EVENT LOGISTICS & VENUE
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[#AAB4C3] block mb-1 font-semibold">EVENT VENUE</label>
              <input
                type="text"
                value={eventVenue}
                onChange={(e) => setEventVenue(e.target.value)}
                className="w-full bg-[#05070A] border border-[#1E293B] rounded-xl px-4 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-[#AAB4C3] block mb-1 font-semibold">EVENT DATES</label>
              <input
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-[#05070A] border border-[#1E293B] rounded-xl px-4 py-2.5 text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[#AAB4C3] block mb-1 font-semibold">IMPORTANT DATES / DEADLINES</label>
              <input
                type="text"
                value={importantDates}
                onChange={(e) => setImportantDates(e.target.value)}
                className="w-full bg-[#05070A] border border-[#1E293B] rounded-xl px-4 py-2.5 text-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-xs text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#147BFF]/20"
        >
          <Save className="w-4 h-4" />
          {loading ? 'SAVING SETTINGS...' : 'SAVE EVENT SETTINGS'}
        </button>
      </form>
    </div>
  );
}
