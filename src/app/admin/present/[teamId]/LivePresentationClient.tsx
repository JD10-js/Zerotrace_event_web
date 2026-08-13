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
  Volume2,
  VolumeX,
  Trash2,
  ExternalLink,
  Presentation,
  BellRing,
  Layers,
  Settings2,
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

  // Layout View Mode: 'stage' (Full presentation + floating small overlay timer) | 'split' (Side-by-side control dashboard)
  const [layoutMode, setLayoutMode] = useState<'stage' | 'split'>('stage');

  // Timer State
  const [totalSeconds, setTotalSeconds] = useState(team.pitchDurationMinutes * 60);
  const [timeLeft, setTimeLeft] = useState(team.pitchDurationMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState(team.pitchDurationMinutes.toString());
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Custom Audio Beep Warning State
  const [warningMinutes, setWarningMinutes] = useState(1); // Custom beep warning threshold in minutes
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [hasBeepedWarning, setHasBeepedWarning] = useState(false);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Upload PPT State
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [slideLinkInput, setSlideLinkInput] = useState('');

  // Web Audio API Beep Sound Helper
  function playBeepSound(type: 'warning' | 'finish' | 'test') {
    if (!audioEnabled && type !== 'test') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'warning') {
        // Double warning chime (880Hz -> 1046Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, ctx.currentTime);
        gain1.gain.setValueAtTime(0.3, ctx.currentTime);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.25);

        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1046.5, ctx.currentTime);
          gain2.gain.setValueAtTime(0.3, ctx.currentTime);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.35);
        }, 300);
      } else if (type === 'finish' || type === 'test') {
        // Triple urgent finish alarm chime
        [0, 300, 600].forEach((delay, idx) => {
          setTimeout(() => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(987.77 + idx * 100, ctx.currentTime); // B5 note
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
          }, delay);
        });
      }
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  }

  // Timer Interval Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;

          // Check custom beep warning threshold
          const warningSecondsThreshold = warningMinutes * 60;
          if (next === warningSecondsThreshold && !hasBeepedWarning) {
            setHasBeepedWarning(true);
            playBeepSound('warning');
          }

          return next;
        });
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      setIsTimeUp(true);
      playBeepSound('finish');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, warningMinutes, hasBeepedWarning, audioEnabled]);

  // Set Preset Duration
  function setPresetMinutes(mins: number) {
    setIsRunning(false);
    setIsTimeUp(false);
    setHasBeepedWarning(false);
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
      setHasBeepedWarning(false);
    }
    setIsRunning(!isRunning);
  }

  function resetTimer() {
    setIsRunning(false);
    setIsTimeUp(false);
    setHasBeepedWarning(false);
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
    <div ref={containerRef} className="space-y-6 max-w-[1600px] mx-auto relative min-h-screen pb-24">
      
      {/* Top Controls & Navigation Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-[#1E293B]">
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
                {team.name}
              </span>
            </div>
            <h1 className="text-lg font-black text-white">{team.college}</h1>
          </div>
        </div>

        {/* Layout Switcher & Audio & Fullscreen Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="bg-[#05070A] p-1 rounded-xl border border-[#1E293B] flex items-center gap-1">
            <button
              onClick={() => setLayoutMode('stage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                layoutMode === 'stage'
                  ? 'bg-[#147BFF] text-white shadow'
                  : 'text-[#AAB4C3] hover:text-white'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              Stage Presentation (Full PPT)
            </button>
            <button
              onClick={() => setLayoutMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                layoutMode === 'split'
                  ? 'bg-[#147BFF] text-white shadow'
                  : 'text-[#AAB4C3] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Split View
            </button>
          </div>

          {/* Sound Toggle & Test */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 ${
              audioEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {audioEnabled ? 'Sound On' : 'Muted'}
          </button>

          <button
            onClick={() => playBeepSound('test')}
            className="p-2 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] text-xs font-bold text-[#147BFF] rounded-xl flex items-center gap-1"
          >
            <BellRing className="w-3.5 h-3.5" />
            Test Beep
          </button>

          {/* Next / Previous Team */}
          {prevTeam && (
            <Link
              href={`/admin/present/${prevTeam.teamId}`}
              className="p-2 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] rounded-xl text-xs font-bold text-white flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4 text-[#147BFF]" />
              Prev
            </Link>
          )}

          {nextTeam && (
            <Link
              href={`/admin/present/${nextTeam.teamId}`}
              className="p-2 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] rounded-xl text-xs font-bold text-white flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4 text-[#147BFF]" />
            </Link>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-xs text-white rounded-xl shadow flex items-center gap-1.5"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isFullscreen ? 'Exit Stage' : 'Stage Fullscreen'}
          </button>
        </div>
      </div>

      {/* STAGE PRESENTATION MODE (Full-Screen Presentation + Floating Small Timer Box Overlay) */}
      {layoutMode === 'stage' ? (
        <div className="space-y-6">
          {/* Main Full-Width Stage Presentation View */}
          <div className="glass-panel p-6 rounded-3xl border border-[#147BFF]/30 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                <Presentation className="w-4 h-4 text-[#147BFF]" />
                STAGE PRESENTATION DECK ({team.name})
              </h3>
              {team.presentationUrl && (
                <button
                  onClick={handleRemovePresentation}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Deck
                </button>
              )}
            </div>

            {team.presentationUrl ? (
              <div className="w-full h-[650px] bg-black rounded-2xl border border-[#147BFF]/40 overflow-hidden shadow-2xl">
                {team.presentationUrl.startsWith('data:application/pdf') || team.presentationUrl.endsWith('.pdf') ? (
                  <iframe
                    src={`${team.presentationUrl}#toolbar=1&navpanes=0`}
                    className="w-full h-full border-0 bg-white"
                    title="PDF Stage Presentation"
                  />
                ) : (
                  <SlideDeckPresenter
                    fileName={team.presentationFileName || 'Pitch_Deck.pptx'}
                    fileUrl={team.presentationUrl}
                    teamName={team.name}
                    college={team.college}
                  />
                )}
              </div>
            ) : (
              /* Upload Presentation Box */
              <div className="border-2 border-dashed border-[#1E293B] hover:border-[#147BFF] rounded-2xl p-12 text-center space-y-4 bg-[#05070A]/50 transition-all">
                <Upload className="w-12 h-12 text-[#147BFF] mx-auto" />
                <div>
                  <h4 className="text-base font-bold text-white uppercase">UPLOAD STAGE PITCH PRESENTATION</h4>
                  <p className="text-xs text-[#AAB4C3] mt-1">
                    Upload PowerPoint (.ppt, .pptx) or PDF pitch deck for {team.name}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
                  <label className="px-6 py-3 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-xs text-white rounded-xl cursor-pointer shadow">
                    {uploading ? 'UPLOADING...' : 'SELECT PPT / PDF FILE'}
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="pt-4 max-w-md mx-auto flex gap-2">
                  <input
                    type="url"
                    value={slideLinkInput}
                    onChange={(e) => setSlideLinkInput(e.target.value)}
                    placeholder="Or paste Google Slides / Canva link"
                    className="flex-1 bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={handleLinkUpload}
                    disabled={uploading || !slideLinkInput.trim()}
                    className="px-4 py-2 bg-[#071426] border border-[#147BFF]/40 text-xs font-bold text-[#147BFF] rounded-xl"
                  >
                    Attach Link
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* FLOATING SMALL TIMER OVERLAY WIDGET AT BOTTOM RIGHT */}
          <div className="fixed bottom-6 right-6 z-50 shadow-2xl animate-fadeIn">
            <div
              className={`p-4 rounded-2xl border backdrop-blur-xl transition-all space-y-3 ${
                isTimeUp
                  ? 'bg-rose-950/90 border-rose-500 animate-pulse'
                  : timeLeft <= warningMinutes * 60
                  ? 'bg-amber-950/90 border-amber-500'
                  : 'bg-[#071426]/95 border-[#147BFF]/50'
              }`}
            >
              {/* Overlay Header */}
              <div className="flex items-center justify-between gap-4 border-b border-[#1E293B] pb-2">
                <span className="text-[10px] font-bold text-[#147BFF] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#147BFF]" />
                  STAGE PITCH TIMER
                </span>

                <div className="flex items-center gap-1 text-[10px]">
                  <span className="text-[#AAB4C3]">Beep at:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={warningMinutes}
                    onChange={(e) => setWarningMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-10 bg-[#05070A] border border-[#1E293B] rounded text-center text-white font-bold py-0.5 focus:outline-none"
                  />
                  <span className="text-[#AAB4C3]">m</span>
                </div>
              </div>

              {/* Digital Clock */}
              <div className="flex items-center justify-between gap-6 px-2">
                <div
                  className={`text-4xl font-black font-mono tracking-widest ${
                    isTimeUp
                      ? 'text-rose-400'
                      : timeLeft <= warningMinutes * 60
                      ? 'text-amber-400'
                      : 'text-white'
                  }`}
                >
                  {formatTime(timeLeft)}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTimer}
                    className={`p-2.5 rounded-xl font-bold text-xs text-white shadow transition-all ${
                      isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#147BFF] hover:bg-[#0062E6]'
                    }`}
                  >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={resetTimer}
                    className="p-2.5 bg-[#05070A] hover:bg-[#0B1F3A] border border-[#1E293B] text-xs font-bold text-white rounded-xl"
                  >
                    <RotateCcw className="w-4 h-4 text-[#147BFF]" />
                  </button>
                </div>
              </div>

              {/* Overlay Progress Bar */}
              <div className="w-full bg-[#05070A] h-2 rounded-full overflow-hidden border border-[#1E293B]">
                <div
                  className={`h-full transition-all duration-1000 ${
                    isTimeUp ? 'bg-rose-500' : timeLeft <= warningMinutes * 60 ? 'bg-amber-400' : 'bg-[#147BFF]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SPLIT DASHBOARD VIEW (Side-by-side player & full control panel) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 7 Cols: Presentation Viewer */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-[#147BFF]/30 space-y-4">
              <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                <Presentation className="w-4 h-4 text-[#147BFF]" />
                PRESENTATION PLAYER ({team.name})
              </h3>

              {team.presentationUrl ? (
                <div className="w-full h-[520px] bg-black rounded-2xl border border-[#1E293B] overflow-hidden">
                  {team.presentationUrl.startsWith('data:application/pdf') || team.presentationUrl.endsWith('.pdf') ? (
                    <iframe
                      src={`${team.presentationUrl}#toolbar=1&navpanes=0`}
                      className="w-full h-full border-0 bg-white"
                      title="PDF Deck"
                    />
                  ) : (
                    <SlideDeckPresenter
                      fileName={team.presentationFileName || 'Pitch_Deck.pptx'}
                      fileUrl={team.presentationUrl}
                      teamName={team.name}
                      college={team.college}
                    />
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#AAB4C3]">No presentation deck uploaded for this team.</p>
              )}
            </div>
          </div>

          {/* Right 5 Cols: Full Controls & Custom Beep Settings Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div
              className={`glass-panel p-6 rounded-3xl border transition-all space-y-6 text-center ${
                isTimeUp
                  ? 'border-rose-500 bg-rose-500/10 animate-pulse'
                  : timeLeft <= warningMinutes * 60
                  ? 'border-amber-500/50 bg-amber-500/5'
                  : 'border-[#147BFF]/40'
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <span className="text-xs font-bold text-[#147BFF] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#147BFF]" />
                  STAGE PITCH TIMER & BEEP SETTINGS
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  isTimeUp ? 'bg-rose-500 text-white' : isRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#0B1F3A] text-[#AAB4C3]'
                }`}>
                  {isTimeUp ? 'TIME EXPIRED!' : isRunning ? 'TIMING LIVE' : 'PAUSED'}
                </span>
              </div>

              {/* Large Clock */}
              <div className="space-y-2 py-2">
                <div
                  className={`text-6xl font-black font-mono tracking-widest ${
                    isTimeUp ? 'text-rose-400' : timeLeft <= warningMinutes * 60 ? 'text-amber-400' : 'text-white'
                  }`}
                >
                  {formatTime(timeLeft)}
                </div>
                <p className="text-xs text-[#AAB4C3]">
                  Configured Duration: {Math.floor(totalSeconds / 60)} Minutes
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#05070A] h-3 rounded-full overflow-hidden border border-[#1E293B]">
                <div
                  className={`h-full transition-all duration-1000 ${
                    isTimeUp ? 'bg-rose-500' : timeLeft <= warningMinutes * 60 ? 'bg-amber-400' : 'bg-[#147BFF]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {/* Start / Pause / Reset */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={toggleTimer}
                  className={`py-3 px-6 font-bold text-xs text-white rounded-xl flex items-center gap-2 shadow-lg transition-all ${
                    isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#147BFF] hover:bg-[#0062E6]'
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

              {/* Custom Beep Warning Setting Card */}
              <div className="p-4 bg-[#05070A] border border-[#1E293B] rounded-2xl text-left space-y-3">
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <BellRing className="w-4 h-4 text-[#147BFF]" />
                    CUSTOM AUDIO BEEP WARNING THRESHOLD
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#AAB4C3]">Trigger Beep Alarm At:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={warningMinutes}
                      onChange={(e) => setWarningMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 bg-[#071426] border border-[#1E293B] rounded-lg text-center text-white font-bold py-1.5 focus:outline-none"
                    />
                    <span className="text-white font-bold">Min(s) Remaining</span>
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-3 text-left">
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SlideDeckPresenter({
  fileName,
  fileUrl,
  teamName,
  college,
}: {
  fileName: string;
  fileUrl: string;
  teamName: string;
  college: string;
}) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 8;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        setCurrentSlide((prev) => Math.min(totalSlides, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentSlide((prev) => Math.max(1, prev - 1));
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    let embedSrc = fileUrl;
    if (fileUrl.includes('google.com/presentation')) {
      embedSrc = fileUrl.replace('/pub?', '/embed?').replace('/edit?', '/embed?');
    } else if (fileUrl.includes('drive.google.com/file/d/')) {
      embedSrc = fileUrl.replace('/view', '/preview').replace('/edit', '/preview');
    } else if (fileUrl.includes('office.com') || fileUrl.endsWith('.pptx')) {
      embedSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
    }

    return (
      <div className="w-full h-full flex flex-col bg-black">
        <div className="bg-[#071426] px-4 py-2 border-b border-[#1E293B] flex items-center justify-between">
          <span className="text-[11px] text-[#AAB4C3]">
            💡 Tip: Ensure your Google Drive / Slides link permission is set to <strong>"Anyone with the link"</strong>
          </span>
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-[11px] text-white rounded shrink-0 flex items-center gap-1"
          >
            Open Document Directly ↗
          </a>
        </div>
        <iframe
          src={embedSrc}
          className="w-full flex-1 border-0 bg-black"
          title="Web Presentation Viewer"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between bg-[#05070A] p-6 relative overflow-hidden select-none h-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-[#071426] via-[#05070A] to-[#0B1F3A] pointer-events-none"></div>

      {/* Slide Header Toolbar */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#1E293B] pb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#147BFF]/20 border border-[#147BFF]/40 text-[#147BFF] font-bold text-[10px] rounded uppercase">
            STAGE SLIDE PRESENTATION
          </span>
          <span className="text-[#AAB4C3] font-mono text-[11px]">{fileName}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white font-bold font-mono">
            SLIDE <span className="text-[#147BFF]">{currentSlide}</span> OF {totalSlides}
          </span>
        </div>
      </div>

      {/* Slide Canvas Content Area */}
      <div className="relative z-10 my-auto py-8 text-center space-y-6 max-w-2xl mx-auto">
        {currentSlide === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <span className="text-xs font-bold uppercase tracking-widest text-[#147BFF]">SLIDE 1 • TITLE & COVER</span>
            <div className="w-16 h-16 rounded-2xl bg-[#147BFF]/20 border border-[#147BFF] flex items-center justify-center mx-auto text-[#147BFF]">
              <Presentation className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">{teamName}</h2>
            <p className="text-sm font-semibold text-[#AAB4C3]">{college}</p>
            <p className="text-xs text-[#147BFF] font-mono pt-2">EUREKA! – Road To Enterprise 2026</p>
          </div>
        )}

        {currentSlide === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <span className="text-xs font-bold uppercase tracking-widest text-[#147BFF]">SLIDE 2 • PROBLEM STATEMENT</span>
            <h3 className="text-2xl font-bold text-white">Target Market Problem & Pain Point</h3>
            <p className="text-xs text-[#AAB4C3] leading-relaxed max-w-md mx-auto">
              Addressing key market inefficiencies with technological innovations developed by {teamName}.
            </p>
          </div>
        )}

        {currentSlide === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <span className="text-xs font-bold uppercase tracking-widest text-[#147BFF]">SLIDE 3 • PROPOSED SOLUTION</span>
            <h3 className="text-2xl font-bold text-white">Product Architecture & Core Value Proposition</h3>
            <p className="text-xs text-[#AAB4C3] leading-relaxed max-w-md mx-auto">
              Scalable, high-impact enterprise architecture engineered by the team.
            </p>
          </div>
        )}

        {currentSlide === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <span className="text-xs font-bold uppercase tracking-widest text-[#147BFF]">SLIDE 4 • BUSINESS MODEL & MARKET</span>
            <h3 className="text-2xl font-bold text-white">Revenue Strategy & Customer Acquisition</h3>
            <p className="text-xs text-[#AAB4C3] leading-relaxed max-w-md mx-auto">
              Monetization model, SAM/SOM breakdown, and growth roadmap.
            </p>
          </div>
        )}

        {currentSlide === 5 && (
          <div className="space-y-4 animate-fadeIn">
            <span className="text-xs font-bold uppercase tracking-widest text-[#147BFF]">SLIDE 5 • DEMO & TRACTION</span>
            <h3 className="text-2xl font-bold text-white">Prototype Demonstration & Early Validation</h3>
            <p className="text-xs text-[#AAB4C3] leading-relaxed max-w-md mx-auto">
              Live proof-of-concept performance and user feedback metrics.
            </p>
          </div>
        )}

        {currentSlide === 6 && (
          <div className="space-y-4 animate-fadeIn">
            <span className="text-xs font-bold uppercase tracking-widest text-[#147BFF]">SLIDE 6 • COMPETITIVE ADVANTAGE</span>
            <h3 className="text-2xl font-bold text-white">Key Differentiators & Moat</h3>
            <p className="text-xs text-[#AAB4C3] leading-relaxed max-w-md mx-auto">
              Proprietary technological barriers, IP, and execution speed.
            </p>
          </div>
        )}

        {currentSlide === 7 && (
          <div className="space-y-4 animate-fadeIn">
            <span className="text-xs font-bold uppercase tracking-widest text-[#147BFF]">SLIDE 7 • FINANCIAL PROJECTIONS</span>
            <h3 className="text-2xl font-bold text-white">Cost Structure & Unit Economics</h3>
            <p className="text-xs text-[#AAB4C3] leading-relaxed max-w-md mx-auto">
              Year 1 to Year 3 financial forecasting and funding requirements.
            </p>
          </div>
        )}

        {currentSlide === 8 && (
          <div className="space-y-4 animate-fadeIn">
            <span className="text-xs font-bold uppercase tracking-widest text-[#147BFF]">SLIDE 8 • CONCLUSION & Q&A</span>
            <h3 className="text-3xl font-black text-white uppercase tracking-tight">THANK YOU!</h3>
            <p className="text-xs text-[#AAB4C3]">Open for Jury Questions & Discussion</p>
            <p className="text-xs font-mono text-[#147BFF]">{teamName} • ZeroTrace Eureka 2026</p>
          </div>
        )}
      </div>

      {/* Slide Navigation Footer Toolbar */}
      <div className="relative z-10 flex items-center justify-between border-t border-[#1E293B] pt-3">
        <button
          onClick={() => setCurrentSlide((prev) => Math.max(1, prev - 1))}
          disabled={currentSlide === 1}
          className="px-4 py-2 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] font-bold text-xs text-white rounded-xl flex items-center gap-1.5 disabled:opacity-30"
        >
          ← PREVIOUS SLIDE
        </button>

        <span className="text-[10px] text-[#AAB4C3]">
          Use <kbd className="bg-[#071426] border border-[#1E293B] px-1.5 py-0.5 rounded text-white font-mono">←</kbd> and <kbd className="bg-[#071426] border border-[#1E293B] px-1.5 py-0.5 rounded text-white font-mono">→</kbd> keys on your keyboard
        </span>

        <button
          onClick={() => setCurrentSlide((prev) => Math.min(totalSlides, prev + 1))}
          disabled={currentSlide === totalSlides}
          className="px-4 py-2 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-xs text-white rounded-xl flex items-center gap-1.5 disabled:opacity-30 shadow"
        >
          NEXT SLIDE →
        </button>
      </div>
    </div>
  );
}
