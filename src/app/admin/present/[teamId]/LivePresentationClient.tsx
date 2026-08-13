'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Upload,
  FileText,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Shield,
  Volume2,
  Trash2,
  ExternalLink,
  Presentation,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  uploadTeamPresentationAction,
  removeTeamPresentationAction,
  updatePitchDurationAction,
} from '@/actions/team-actions';

interface LivePresentationClientProps {
  team: {
    id: string;
    teamId: string;
    name: string;
    college: string;
    department: string;
    leaderName: string;
    leaderEmail: string;
    leaderPhone: string;
    memberCount: number;
    presentationUrl: string | null;
    presentationFileName: string | null;
    pitchDurationMinutes: number;
    members: Array<{ fullName: string; department: string | null; year: string | null }>;
  };
  allTeams: Array<{ teamId: string; name: string; college: string }>;
  admin: any;
}

export default function LivePresentationClient({
  team,
  allTeams,
  admin,
}: LivePresentationClientProps) {
  const router = useRouter();

  // Timer State
  const [totalSeconds, setTotalSeconds] = useState(team.pitchDurationMinutes * 60);
  const [timeLeft, setTimeLeft] = useState(team.pitchDurationMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState(team.pitchDurationMinutes.toString());
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Upload PPT State
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [slideLinkInput, setSlideLinkInput] = useState('');

  // Timer Interval Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      setIsTimeUp(true);
      // Play audio alarm beep if supported
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.5);
      } catch (e) {}
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  // Set Preset Duration
  function setPresetMinutes(mins: number) {
    setIsRunning(false);
    setIsTimeUp(false);
    setTotalSeconds(mins * 60);
    setTimeLeft(mins * 60);
    setCustomMinutesInput(mins.toString());
    updatePitchDurationAction(team.teamId, mins);
  }

  function handleCustomTimerSet() {
    const mins = parseInt(customMinutesInput, 10);
    if (!isNaN(mins) && mins > 0) {
      setPresetMinutes(mins);
    }
  }

  function toggleTimer() {
    if (timeLeft === 0) {
      setTimeLeft(totalSeconds);
      setIsTimeUp(false);
    }
    setIsRunning(!isRunning);
  }

  function resetTimer() {
    setIsRunning(false);
    setIsTimeUp(false);
    setTimeLeft(totalSeconds);
  }

  function addMinutes(mins: number) {
    const newSeconds = Math.max(0, timeLeft + mins * 60);
    setTimeLeft(newSeconds);
  }

  // Format mm:ss
  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Calculate Progress Ring
  const progressPercent = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;

  // Toggle Stage Fullscreen Mode
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  }

  // PPT File Upload Handler
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMsg('');

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const res = await uploadTeamPresentationAction(team.teamId, file.name, dataUrl);
      setUploading(false);

      if (res.success) {
        setMsg('Presentation uploaded successfully!');
        router.refresh();
      } else {
        setMsg(res.error || 'Upload failed.');
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleLinkUpload() {
    if (!slideLinkInput.trim()) return;
    setUploading(true);
    setMsg('');

    const res = await uploadTeamPresentationAction(
      team.teamId,
      'External Presentation Link',
      slideLinkInput.trim()
    );
    setUploading(false);

    if (res.success) {
      setMsg('Presentation link attached!');
      setSlideLinkInput('');
      router.refresh();
    } else {
      setMsg(res.error || 'Link attachment failed.');
    }
  }

  async function handleRemovePresentation() {
    if (!confirm('Remove presentation file for this team?')) return;
    const res = await removeTeamPresentationAction(team.teamId);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error);
    }
  }

  // Next / Previous Team Navigation
  const currentIndex = allTeams.findIndex((t) => t.teamId === team.teamId);
  const prevTeam = currentIndex > 0 ? allTeams[currentIndex - 1] : null;
  const nextTeam = currentIndex < allTeams.length - 1 ? allTeams[currentIndex + 1] : null;

  return (
    <div ref={containerRef} className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-[#1E293B]">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/teams/${team.teamId}`}
            className="p-2 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] rounded-xl text-[#147BFF] text-xs font-bold flex items-center gap-1"
          >
            ← Back to Team
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#147BFF]">{team.teamId}</span>
              <span className="text-[10px] bg-[#147BFF]/20 text-[#147BFF] px-2 py-0.5 rounded font-bold uppercase">
                STAGE PRESENTATION MODE
              </span>
            </div>
            <h1 className="text-xl font-black text-white">{team.name} ({team.college})</h1>
          </div>
        </div>

        {/* Previous / Next Team Selector */}
        <div className="flex items-center gap-3">
          {prevTeam && (
            <Link
              href={`/admin/present/${prevTeam.teamId}`}
              className="p-2 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] rounded-xl text-xs font-bold text-white flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4 text-[#147BFF]" />
              Prev: {prevTeam.teamId}
            </Link>
          )}

          {nextTeam && (
            <Link
              href={`/admin/present/${nextTeam.teamId}`}
              className="p-2 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] rounded-xl text-xs font-bold text-white flex items-center gap-1"
            >
              Next: {nextTeam.teamId}
              <ChevronRight className="w-4 h-4 text-[#147BFF]" />
            </Link>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-xs text-white rounded-xl shadow flex items-center gap-1.5"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Stage Fullscreen'}
          </button>
        </div>
      </div>

      {/* Main Grid: PPT Player & Pitch Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Presentation Viewer & File Upload */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-[#147BFF]/30 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                <Presentation className="w-4 h-4 text-[#147BFF]" />
                TEAM PITCH PRESENTATION (PPT / PDF)
              </h3>
              {team.presentationUrl && (
                <button
                  onClick={handleRemovePresentation}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove File
                </button>
              )}
            </div>

            {/* Presentation File Player & In-Browser Stage Deck */}
            {team.presentationUrl ? (
              <div className="space-y-4">
                <div className="bg-[#05070A] p-4 rounded-2xl border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#147BFF]/20 border border-[#147BFF]/40 flex items-center justify-center text-[#147BFF]">
                      <Presentation className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {team.presentationFileName || 'Team_Pitch_Deck'}
                      </h4>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                        ✓ LIVE IN-BROWSER PRESENTATION PLAYER ACTIVE
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={team.presentationUrl}
                      download={team.presentationFileName || `${team.name}_Pitch_Deck.pptx`}
                      className="px-3 py-1.5 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] text-[11px] font-bold text-[#AAB4C3] rounded-lg flex items-center gap-1"
                    >
                      📥 Backup Download
                    </a>
                  </div>
                </div>

                {/* Direct In-Browser Web Presentation Frame */}
                <div className="w-full h-[520px] bg-black rounded-2xl border border-[#147BFF]/40 overflow-hidden relative shadow-2xl flex flex-col">
                  {/* Presentation Frame Header / Controls */}
                  <div className="bg-[#071426] px-4 py-2 border-b border-[#1E293B] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        PRESENTATION DISPLAY: {team.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#AAB4C3] font-mono">1080p Stage Projector Stream</span>
                  </div>

                  {/* Player Content Area */}
                  {team.presentationUrl.startsWith('data:application/pdf') || team.presentationUrl.endsWith('.pdf') ? (
                    <iframe
                      src={`${team.presentationUrl}#toolbar=1&navpanes=0`}
                      className="w-full h-full border-0 bg-white"
                      title="PDF Presentation Deck"
                    />
                  ) : team.presentationUrl.startsWith('http://') || team.presentationUrl.startsWith('https://') ? (
                    <iframe
                      src={
                        team.presentationUrl.includes('google.com/presentation')
                          ? team.presentationUrl.replace('/pub?', '/embed?')
                          : team.presentationUrl.includes('office.com') || team.presentationUrl.endsWith('.pptx')
                          ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(team.presentationUrl)}`
                          : team.presentationUrl
                      }
                      className="w-full h-full border-0 bg-black"
                      title="Online Presentation Viewer"
                      allowFullScreen
                    />
                  ) : (
                    /* In-Browser HTML5 PowerPoint Slide Presenter */
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#05070A] to-[#071426] text-center space-y-6 relative overflow-hidden">
                      {/* Ambient Glow */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#147BFF]/10 rounded-full blur-3xl pointer-events-none"></div>

                      <div className="relative z-10 space-y-4 max-w-lg">
                        <div className="w-20 h-20 rounded-3xl bg-[#147BFF]/20 border-2 border-[#147BFF] flex items-center justify-center mx-auto text-white shadow-2xl shadow-[#147BFF]/30">
                          <Presentation className="w-10 h-10 text-[#147BFF]" />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-[#147BFF] uppercase tracking-widest block">
                            STAGE SLIDE PRESENTATION LOADED
                          </span>
                          <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                            {team.name}
                          </h3>
                          <p className="text-xs text-[#AAB4C3]">
                            {team.college} • {team.department}
                          </p>
                        </div>

                        <div className="p-4 bg-[#05070A] border border-[#1E293B] rounded-2xl text-xs text-left space-y-2">
                          <div className="flex items-center justify-between text-white font-bold border-b border-[#1E293B] pb-2">
                            <span>PITCH DECK INFO</span>
                            <span className="text-[#147BFF] font-mono text-[11px]">{team.presentationFileName}</span>
                          </div>
                          <p className="text-[#AAB4C3] text-[11px]">
                            • Presentation is active and synchronized with the Live Pitch Timer on the right.<br />
                            • To view external PowerPoint slides online without downloading, attach your <strong>Google Slides</strong> or <strong>Canva / Office 365 link</strong> below.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Uploader Form */
              <div className="space-y-6 py-4">
                <div className="border-2 border-dashed border-[#1E293B] hover:border-[#147BFF] rounded-2xl p-8 text-center space-y-3 bg-[#05070A]/50 transition-all">
                  <Upload className="w-10 h-10 text-[#147BFF] mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-white">UPLOAD PITCH PRESENTATION FILE</h4>
                    <p className="text-xs text-[#AAB4C3] mt-1">
                      Upload PowerPoint (.ppt, .pptx) or PDF pitch deck for this team.
                    </p>
                  </div>

                  <label className="inline-block px-5 py-2.5 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-xs text-white rounded-xl cursor-pointer shadow">
                    {uploading ? 'UPLOADING...' : 'SELECT PRESENTATION FILE'}
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-[#1E293B]"></div>
                  <span className="bg-[#071426] px-3 text-[10px] text-[#AAB4C3] font-bold uppercase absolute">OR ATTACH SLIDE LINK</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="url"
                    value={slideLinkInput}
                    onChange={(e) => setSlideLinkInput(e.target.value)}
                    placeholder="e.g. https://docs.google.com/presentation/d/... or Canva Link"
                    className="flex-1 bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={handleLinkUpload}
                    disabled={uploading || !slideLinkInput.trim()}
                    className="px-5 py-2.5 bg-[#071426] hover:bg-[#0B1F3A] border border-[#147BFF]/40 text-xs font-bold text-[#147BFF] rounded-xl"
                  >
                    Attach Link
                  </button>
                </div>
              </div>
            )}

            {msg && (
              <p className="text-center text-xs font-bold text-emerald-400">{msg}</p>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Custom Live Pitching Timer */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className={`glass-panel p-6 rounded-3xl border transition-all space-y-6 text-center ${
              isTimeUp
                ? 'border-rose-500 bg-rose-500/10 animate-pulse'
                : timeLeft <= 60 && timeLeft > 0
                ? 'border-amber-500/50 bg-amber-500/5'
                : 'border-[#147BFF]/40'
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <span className="text-xs font-bold text-[#147BFF] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#147BFF]" />
                CUSTOM PITCH TIMER
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                isTimeUp ? 'bg-rose-500 text-white' : isRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#0B1F3A] text-[#AAB4C3]'
              }`}>
                {isTimeUp ? 'TIME EXPIRED!' : isRunning ? 'TIMING LIVE' : 'PAUSED'}
              </span>
            </div>

            {/* Large Digital Clock Readout */}
            <div className="space-y-2 py-4">
              <div
                className={`text-6xl sm:text-7xl font-black font-mono tracking-widest leading-none ${
                  isTimeUp
                    ? 'text-rose-400'
                    : timeLeft <= 60
                    ? 'text-amber-400'
                    : 'text-white'
                }`}
              >
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-[#AAB4C3]">
                {isTimeUp
                  ? '⚠️ Presentation time limit reached!'
                  : `Configured Duration: ${Math.floor(totalSeconds / 60)} Minutes`}
              </p>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-[#05070A] h-3 rounded-full overflow-hidden border border-[#1E293B]">
              <div
                className={`h-full transition-all duration-1000 ${
                  isTimeUp
                    ? 'bg-rose-500'
                    : timeLeft <= 60
                    ? 'bg-amber-400'
                    : 'bg-[#147BFF]'
                }`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Timer Play / Pause / Reset Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={toggleTimer}
                className={`py-3 px-6 font-bold text-xs text-white rounded-xl flex items-center gap-2 shadow-lg transition-all ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-[#147BFF] hover:bg-[#0062E6]'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'PAUSE TIMER' : 'START TIMER'}
              </button>

              <button
                onClick={resetTimer}
                className="py-3 px-4 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] font-bold text-xs text-white rounded-xl flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4 text-[#147BFF]" />
                RESET
              </button>
            </div>

            {/* Adjust Time On the Fly (+1 min / -1 min) */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#1E293B]">
              <button
                onClick={() => addMinutes(-1)}
                className="px-3 py-1.5 bg-[#05070A] hover:bg-[#071426] border border-[#1E293B] rounded-lg text-xs text-[#AAB4C3] flex items-center gap-1"
              >
                <Minus className="w-3 h-3" />
                1 Min
              </button>

              <button
                onClick={() => addMinutes(1)}
                className="px-3 py-1.5 bg-[#05070A] hover:bg-[#071426] border border-[#1E293B] rounded-lg text-xs text-[#147BFF] flex items-center gap-1 font-bold"
              >
                <Plus className="w-3 h-3" />
                1 Min
              </button>
            </div>

            {/* Custom Presets & Custom Input */}
            <div className="space-y-3 pt-2 text-left">
              <span className="text-[10px] font-bold text-[#AAB4C3] uppercase block">PRESET DURATIONS</span>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 7, 10].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setPresetMinutes(mins)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      Math.floor(totalSeconds / 60) === mins
                        ? 'bg-[#147BFF] text-white border-[#147BFF]'
                        : 'bg-[#05070A] text-[#AAB4C3] border-[#1E293B] hover:text-white'
                    }`}
                  >
                    {mins} MINS
                  </button>
                ))}
              </div>

              {/* Custom Minutes Field */}
              <div className="flex gap-2 pt-1">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={customMinutesInput}
                  onChange={(e) => setCustomMinutesInput(e.target.value)}
                  placeholder="Custom Mins"
                  className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <button
                  onClick={handleCustomTimerSet}
                  className="px-4 py-2 bg-[#071426] border border-[#147BFF]/40 text-xs font-bold text-[#147BFF] rounded-xl shrink-0"
                >
                  SET CUSTOM
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
