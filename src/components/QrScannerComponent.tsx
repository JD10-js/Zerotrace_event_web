'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { QrCode, Search, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { verifyTokenAction, confirmCheckInAction } from '@/actions/checkin-actions';
import StatusBadge from './StatusBadge';

interface QrScannerComponentProps {
  isAdmin?: boolean;
}

export default function QrScannerComponent({ isAdmin = false }: QrScannerComponentProps) {
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [checkInSuccess, setCheckInSuccess] = useState<any>(null);
  const [scannerActive, setScannerActive] = useState(true);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (scannerActive) {
      const scanner = new Html5QrcodeScanner(
        'reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          // Extract token from URL if URL was scanned
          let token = decodedText;
          if (decodedText.includes('/verify/')) {
            token = decodedText.split('/verify/').pop() || decodedText;
          }
          handleVerify(token);
        },
        (error) => {
          // Silent scan error handling while active
        }
      );

      scannerRef.current = scanner;

      return () => {
        scanner.clear().catch((err) => console.error('Failed to clear scanner:', err));
      };
    }
  }, [scannerActive]);

  async function handleVerify(query: string) {
    if (!query) return;
    setLoading(true);
    setErrorMsg('');
    setCheckInSuccess(null);

    const res = await verifyTokenAction(query);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Verification failed');
      setScanResult(res.team || null);
    } else {
      setScanResult(res.team);
    }
  }

  async function handleConfirmCheckIn() {
    if (!scanResult) return;
    setLoading(true);
    setErrorMsg('');

    const res = await confirmCheckInAction(scanResult.teamId);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Check-in failed');
    } else {
      setCheckInSuccess(res);
      setScanResult((prev: any) => ({
        ...prev,
        checkIn: {
          checkedInAt: res.checkedInAt,
          checkedInByAdminName: res.checkedInByAdminName,
        },
      }));
    }
  }

  function resetScan() {
    setScanResult(null);
    setCheckInSuccess(null);
    setErrorMsg('');
    setManualCode('');
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      {/* Scanner & Search Toggle Container */}
      <div className="glass-panel p-6 rounded-2xl border border-[#147BFF]/30 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#147BFF]" />
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              {isAdmin ? 'ADMIN QR CHECK-IN SCANNER' : 'ENTRY TICKET VERIFICATION'}
            </h3>
          </div>
          <button
            onClick={() => setScannerActive(!scannerActive)}
            className="text-xs text-[#147BFF] hover:underline"
          >
            {scannerActive ? 'Pause Camera' : 'Activate Camera'}
          </button>
        </div>

        {/* Live HTML5 Camera Scanner Area */}
        {scannerActive && (
          <div className="bg-[#05070A] p-4 rounded-xl border border-[#1E293B] overflow-hidden">
            <div id="reader" className="w-full"></div>
            <p className="text-center text-xs text-[#AAB4C3] mt-3">
              Point your camera at the entry ticket QR code to verify.
            </p>
          </div>
        )}

        {/* Manual Code Input Form */}
        <div className="space-y-2 pt-2 border-t border-[#1E293B]">
          <label className="text-xs font-semibold text-[#AAB4C3] block">
            MANUAL VERIFICATION CODE / TEAM ID
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#AAB4C3] absolute left-3 top-3" />
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. ERE26-0001 or Verification Token"
                className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>
            <button
              onClick={() => handleVerify(manualCode)}
              disabled={loading || !manualCode.trim()}
              className="px-5 py-2.5 bg-[#147BFF] hover:bg-[#0062E6] disabled:opacity-50 font-bold text-xs text-white rounded-lg transition-all"
            >
              {loading ? 'VERIFYING...' : 'VERIFY'}
            </button>
          </div>
        </div>
      </div>

      {/* Error / Alert Message Box */}
      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300">
          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold">VERIFICATION ISSUE</h4>
            <p className="text-xs mt-1">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Check-in Success Banner */}
      {checkInSuccess && (
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 text-emerald-300">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h3 className="text-base font-bold text-emerald-400">CHECK-IN SUCCESSFUL!</h3>
            <p className="text-xs text-emerald-200 mt-1">
              Team <strong>{checkInSuccess.teamId}</strong> has been checked in by{' '}
              <strong>{checkInSuccess.checkedInByAdminName}</strong> at{' '}
              {new Date(checkInSuccess.checkedInAt).toLocaleTimeString()}.
            </p>
          </div>
        </div>
      )}

      {/* Verification Details Result Card */}
      {scanResult && (
        <div className="glass-panel p-6 rounded-2xl border border-[#1E293B] space-y-6">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
            <div>
              <span className="text-[10px] font-bold text-[#147BFF] uppercase tracking-wider block">TEAM IDENTIFIER</span>
              <h2 className="text-2xl font-black text-white">{scanResult.teamId}</h2>
            </div>
            <StatusBadge status={scanResult.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#05070A] p-3 rounded-lg border border-[#1E293B]">
              <span className="text-[#AAB4C3] block">TEAM NAME</span>
              <span className="text-sm font-bold text-white mt-1 block">{scanResult.name}</span>
            </div>

            <div className="bg-[#05070A] p-3 rounded-lg border border-[#1E293B]">
              <span className="text-[#AAB4C3] block">INSTITUTION / COLLEGE</span>
              <span className="text-sm font-semibold text-white mt-1 block">{scanResult.college}</span>
            </div>

            {scanResult.leaderName && (
              <div className="bg-[#05070A] p-3 rounded-lg border border-[#1E293B]">
                <span className="text-[#AAB4C3] block">TEAM LEADER</span>
                <span className="text-sm font-semibold text-white mt-1 block">{scanResult.leaderName}</span>
              </div>
            )}

            <div className="bg-[#05070A] p-3 rounded-lg border border-[#1E293B]">
              <span className="text-[#AAB4C3] block">TEAM SIZE</span>
              <span className="text-sm font-semibold text-white mt-1 block">{scanResult.memberCount} Members</span>
            </div>
          </div>

          {/* Check-In Status Box */}
          <div className="p-4 bg-[#05070A] rounded-xl border border-[#1E293B] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-[#AAB4C3] block">VENUE CHECK-IN STATUS</span>
              <StatusBadge status={scanResult.checkIn ? 'CHECKED_IN' : 'NOT_CHECKED_IN'} type="checkin" />
            </div>

            {scanResult.checkIn && (
              <div className="text-right text-[11px] text-[#AAB4C3]">
                <p>Checked in at: <span className="text-white font-medium">{new Date(scanResult.checkIn.checkedInAt).toLocaleString()}</span></p>
                <p>Checked in by: <span className="text-[#147BFF] font-medium">{scanResult.checkIn.checkedInByAdminName}</span></p>
              </div>
            )}
          </div>

          {/* Action Buttons for Admin Check-in */}
          <div className="flex gap-3 pt-2">
            {isAdmin && !scanResult.checkIn && scanResult.status === 'CONFIRMED' && (
              <button
                onClick={handleConfirmCheckIn}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-white rounded-lg transition-all shadow-lg shadow-emerald-500/20"
              >
                {loading ? 'CONFIRMING...' : '✓ CONFIRM CHECK-IN'}
              </button>
            )}

            <button
              onClick={resetScan}
              className="py-3 px-5 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] font-bold text-xs text-white rounded-lg flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4 text-[#147BFF]" />
              SCAN ANOTHER TICKET
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
