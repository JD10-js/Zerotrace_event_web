import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'team' | 'checkin' | 'ticket' | 'admin';
}

export default function StatusBadge({ status, type = 'team' }: StatusBadgeProps) {
  const normalized = status?.toUpperCase() || '';

  if (type === 'checkin') {
    if (normalized === 'CHECKED_IN' || normalized === 'CONFIRMED' || normalized === 'TRUE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          CHECKED IN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
        <Clock className="w-3.5 h-3.5" />
        NOT CHECKED IN
      </span>
    );
  }

  if (normalized === 'CONFIRMED' || normalized === 'ACTIVE' || normalized === 'ENABLED' || normalized === 'SUPER_ADMIN') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#147BFF]/10 text-[#147BFF] border border-[#147BFF]/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {normalized}
      </span>
    );
  }

  if (normalized === 'REVOKED' || normalized === 'CANCELLED' || normalized === 'DISABLED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <XCircle className="w-3.5 h-3.5" />
        {normalized}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
      <AlertTriangle className="w-3.5 h-3.5" />
      {normalized}
    </span>
  );
}
