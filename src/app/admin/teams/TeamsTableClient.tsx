'use client';

import { useState } from 'react';
import { Search, Download, Eye, Ticket, CheckCircle2, Filter } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [checkInFilter, setCheckInFilter] = useState('ALL');
  const [exporting, setExporting] = useState(false);

  const filteredTeams = initialTeams.filter((team) => {
    const matchesSearch =
      team.teamId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leaderName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || team.status === statusFilter;
    const matchesCheckIn =
      checkInFilter === 'ALL' ||
      (checkInFilter === 'CHECKED_IN' && team.isCheckedIn) ||
      (checkInFilter === 'NOT_CHECKED_IN' && !team.isCheckedIn);

    return matchesSearch && matchesStatus && matchesCheckIn;
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
          <p className="text-xs text-[#AAB4C3]">Manage registered teams, tickets, and check-in statuses.</p>
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

      {/* Filter Controls Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-[#1E293B] flex flex-col sm:flex-row items-center gap-4">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#AAB4C3] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Team ID, Team Name, College, or Leader Name..."
            className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#05070A] border border-[#1E293B] text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="REVOKED">REVOKED</option>
          </select>

          <select
            value={checkInFilter}
            onChange={(e) => setCheckInFilter(e.target.value)}
            className="bg-[#05070A] border border-[#1E293B] text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Check-in States</option>
            <option value="CHECKED_IN">CHECKED IN</option>
            <option value="NOT_CHECKED_IN">NOT CHECKED IN</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl border border-[#1E293B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#AAB4C3]">
            <thead className="bg-[#05070A] uppercase text-[10px] font-bold text-[#147BFF] border-b border-[#1E293B]">
              <tr>
                <th className="p-4">Team ID</th>
                <th className="p-4">Team Name</th>
                <th className="p-4">College</th>
                <th className="p-4">Leader</th>
                <th className="p-4">Members</th>
                <th className="p-4">Reg. Date</th>
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
                  <td className="p-4 max-w-[160px] truncate">{team.college}</td>
                  <td className="p-4">
                    <p className="font-medium text-white">{team.leaderName}</p>
                    <p className="text-[10px] text-[#AAB4C3]">{team.leaderEmail}</p>
                  </td>
                  <td className="p-4 font-semibold text-white">{team.memberCount}</td>
                  <td className="p-4 text-[11px]">{new Date(team.createdAt).toLocaleDateString()}</td>
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
                  <td colSpan={9} className="p-8 text-center text-[#AAB4C3]">
                    No teams found matching search criteria.
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
