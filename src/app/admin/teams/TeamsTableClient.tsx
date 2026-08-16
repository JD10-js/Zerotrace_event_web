'use client';

import { useState, useMemo } from 'react';
import { Search, Download, Eye, Ticket, CheckCircle2, Filter, Trophy, Layers } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import { exportTeamsCsvAction } from '@/actions/export-actions';
import { hasPermission } from '@/lib/permissions';

interface TeamRow {
  id: string;
  teamId: string;
  name: string;
  college: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  memberCount: number;
  status: string;
  createdAt: string;
  isCheckedIn: boolean;
  isPresented: boolean;
  checkedInAt: string | null;
  checkedInBy: string | null;
}

export default function TeamsTableClient({
  initialTeams,
  admin,
}: {
  initialTeams: TeamRow[];
  admin: any;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryTab, setCategoryTab] = useState<'ALL' | 'PRESENTED' | 'CHECKED_IN' | 'CONFIRMED'>('ALL');
  const [exporting, setExporting] = useState(false);

  const presentedCount = useMemo(() => initialTeams.filter((t) => t.isPresented).length, [initialTeams]);
  const checkedInCount = useMemo(() => initialTeams.filter((t) => t.isCheckedIn).length, [initialTeams]);

  const filteredTeams = initialTeams.filter((team) => {
    const matchesSearch =
      team.teamId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leaderName.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesCategory = true;
    if (categoryTab === 'PRESENTED') {
      matchesCategory = team.isPresented;
    } else if (categoryTab === 'CHECKED_IN') {
      matchesCategory = team.isCheckedIn;
    } else if (categoryTab === 'CONFIRMED') {
      matchesCategory = team.status === 'CONFIRMED';
    }

    return matchesSearch && matchesCategory;
  });

  async function handleExportCsv() {
    setExporting(true);
    const res = await exportTeamsCsvAction();
    setExporting(false);

    if (res.success && res.csvContent) {
      const blob = new Blob([res.csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', res.filename || 'eureka_teams.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(res.error || 'Export failed.');
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wide">TEAM REGISTRATIONS</h1>
          <p className="text-xs text-[#AAB4C3]">Manage registered teams, presentation status, and check-ins.</p>
        </div>

        {hasPermission(admin, 'EXPORT_DATA') && (
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="px-4 py-2.5 bg-[#071426] hover:bg-[#0B1F3A] border border-[#147BFF]/40 text-xs font-bold text-white rounded-xl flex items-center gap-2 shadow transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-[#147BFF]" />
            {exporting ? 'EXPORTING CSV...' : 'EXPORT REGISTRATION DATA (CSV)'}
          </button>
        )}
      </div>

      {/* SEPARATE CATEGORY FILTER TABS BAR */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1E293B] pb-3">
        <button
          onClick={() => setCategoryTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            categoryTab === 'ALL'
              ? 'bg-[#147BFF] text-white shadow-lg shadow-[#147BFF]/20'
              : 'bg-[#071426] text-[#AAB4C3] border border-[#1E293B] hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          ALL TEAMS ({initialTeams.length})
        </button>

        {/* Dedicated Presentation Finished Category */}
        <button
          onClick={() => setCategoryTab('PRESENTED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            categoryTab === 'PRESENTED'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-[#071426] text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          PRESENTATION FINISHED ({presentedCount})
        </button>

        <button
          onClick={() => setCategoryTab('CHECKED_IN')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            categoryTab === 'CHECKED_IN'
              ? 'bg-[#147BFF] text-white shadow'
              : 'bg-[#071426] text-[#AAB4C3] border border-[#1E293B] hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#147BFF]" />
          CHECKED IN ({checkedInCount})
        </button>

        <button
          onClick={() => setCategoryTab('CONFIRMED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            categoryTab === 'CONFIRMED'
              ? 'bg-[#147BFF] text-white shadow'
              : 'bg-[#071426] text-[#AAB4C3] border border-[#1E293B] hover:text-white'
          }`}
        >
          CONFIRMED REGISTRATIONS
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-[#1E293B]">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#AAB4C3] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Team ID, Team Name, or Leader Name..."
            className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl border border-[#1E293B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#AAB4C3] min-w-[700px]">
            <thead className="bg-[#05070A] uppercase text-[10px] font-bold text-[#147BFF] border-b border-[#1E293B]">
              <tr>
                <th className="p-4">Team ID</th>
                <th className="p-4">Team Name</th>
                <th className="p-4">Leader</th>
                <th className="p-4">Members</th>
                <th className="p-4">Presentation</th>
                <th className="p-4">Status</th>
                <th className="p-4">Check-in</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {filteredTeams.map((team) => (
                <tr key={team.id} className="hover:bg-[#071426]/50">
                  <td className="p-4 font-mono font-bold text-white">{team.teamId}</td>
                  <td className="p-4 font-bold text-white">{team.name}</td>
                  <td className="p-4">
                    <p className="font-medium text-white">{team.leaderName}</p>
                    <p className="text-[10px] text-[#AAB4C3]">{team.leaderEmail}</p>
                  </td>
                  <td className="p-4 font-semibold text-white">{team.memberCount}</td>
                  
                  {/* Presentation Finished Badge */}
                  <td className="p-4">
                    {team.isPresented ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> PRESENTED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#071426] text-[#AAB4C3] border border-[#1E293B]">
                        NOT PRESENTED
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <StatusBadge status={team.status} />
                  </td>
                  <td className="p-4">
                    <StatusBadge status={team.isCheckedIn ? 'CHECKED_IN' : 'NOT_CHECKED_IN'} type="checkin" />
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link
                      href={`/admin/teams/${team.teamId}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] rounded text-white font-semibold text-[11px]"
                    >
                      <Eye className="w-3 h-3 text-[#147BFF]" />
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredTeams.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#AAB4C3]">
                    No teams found in category <strong className="text-white">"{categoryTab}"</strong> matching search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
