'use client';

import { useState } from 'react';
import {
  Download,
  Mail,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Edit,
  ArrowLeft,
  Shield,
  FileText,
  User,
  Users,
  Presentation,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import TicketCard from '@/components/TicketCard';
import Link from 'next/link';
import {
  updateTeamAction,
  revokeTicketAction,
  regenerateTicketAction,
  resendTicketEmailAction,
} from '@/actions/team-actions';
import { confirmCheckInAction } from '@/actions/checkin-actions';
import { hasPermission } from '@/lib/permissions';

export default function TeamDetailClient({ team, admin }: { team: any; admin: any }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [name, setName] = useState(team.name);
  const [college, setCollege] = useState(team.college);
  const [department, setDepartment] = useState(team.department);
  const [city, setCity] = useState(team.city);
  const [leaderName, setLeaderName] = useState(team.leaderName);
  const [leaderEmail, setLeaderEmail] = useState(team.leaderEmail);
  const [leaderPhone, setLeaderPhone] = useState(team.leaderPhone);

  async function handleUpdateTeam(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const res = await updateTeamAction(team.teamId, {
      name,
      college,
      department,
      city,
      leaderName,
      leaderEmail,
      leaderPhone,
    });

    setLoading(false);
    if (res.success) {
      setMsg('Team details updated successfully!');
      setIsEditing(false);
    } else {
      setMsg(res.error || 'Update failed.');
    }
  }

  async function handleRevoke() {
    if (!confirm(`Are you sure you want to REVOKE the ticket for ${team.teamId}?`)) return;
    setLoading(true);
    const res = await revokeTicketAction(team.teamId);
    setLoading(false);
    if (res.success) {
      setMsg('Ticket revoked.');
      window.location.reload();
    } else {
      alert(res.error);
    }
  }

  async function handleRegenerate() {
    setLoading(true);
    const res = await regenerateTicketAction(team.teamId);
    setLoading(false);
    if (res.success) {
      setMsg('New ticket regenerated successfully!');
      window.location.reload();
    } else {
      alert(res.error);
    }
  }

  async function handleManualCheckIn() {
    setLoading(true);
    const res = await confirmCheckInAction(team.teamId, 'Manual Admin Check-in');
    setLoading(false);
    if (res.success) {
      setMsg('Team checked in successfully!');
      window.location.reload();
    } else {
      alert(res.error);
    }
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
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/teams"
            className="p-2 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] rounded-xl text-[#147BFF]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#147BFF] uppercase">{team.teamId}</span>
              <StatusBadge status={team.status} />
              <StatusBadge status={team.checkIn ? 'CHECKED_IN' : 'NOT_CHECKED_IN'} type="checkin" />
            </div>
            <h1 className="text-2xl font-black text-white mt-1">{team.name}</h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/present/${team.teamId}`}
            className="px-4 py-2 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-xs text-white rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#147BFF]/20"
          >
            <Presentation className="w-4 h-4" />
            STAGE PRESENTATION & TIMER ↗
          </Link>

          {hasPermission(admin, 'CHECK_IN') && !team.checkIn && team.status === 'CONFIRMED' && (
            <button
              onClick={handleManualCheckIn}
              disabled={loading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-white rounded-xl flex items-center gap-1.5 shadow"
            >
              <CheckCircle2 className="w-4 h-4" />
              CONFIRM CHECK-IN
            </button>
          )}

          {hasPermission(admin, 'EDIT_TEAM') && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] font-bold text-xs text-white rounded-xl flex items-center gap-1.5"
            >
              <Edit className="w-4 h-4 text-[#147BFF]" />
              {isEditing ? 'CANCEL EDIT' : 'EDIT DETAILS'}
            </button>
          )}

          {hasPermission(admin, 'GENERATE_TICKET') && (
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="px-4 py-2 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] font-bold text-xs text-white rounded-xl flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4 text-[#147BFF]" />
              REGENERATE TICKET
            </button>
          )}

          {hasPermission(admin, 'EDIT_TEAM') && team.status === 'CONFIRMED' && (
            <button
              onClick={handleRevoke}
              disabled={loading}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              REVOKE TICKET
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-[#147BFF]/10 border border-[#147BFF]/30 rounded-xl text-xs text-[#147BFF] font-bold">
          {msg}
        </div>
      )}

      {/* Edit Details Form Modal/Section */}
      {isEditing && (
        <form onSubmit={handleUpdateTeam} className="glass-panel p-6 rounded-2xl border border-[#147BFF]/40 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase">EDIT TEAM REGISTRATION DETAILS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-[#AAB4C3] block mb-1">Team Name</label>
              <input type="text" value={name} onChange={(e)=>setName(e.target.value)} className="w-full bg-[#05070A] border border-[#1E293B] rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="text-[#AAB4C3] block mb-1">College</label>
              <input type="text" value={college} onChange={(e)=>setCollege(e.target.value)} className="w-full bg-[#05070A] border border-[#1E293B] rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="text-[#AAB4C3] block mb-1">Department</label>
              <input type="text" value={department} onChange={(e)=>setDepartment(e.target.value)} className="w-full bg-[#05070A] border border-[#1E293B] rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="text-[#AAB4C3] block mb-1">City</label>
              <input type="text" value={city} onChange={(e)=>setCity(e.target.value)} className="w-full bg-[#05070A] border border-[#1E293B] rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="text-[#AAB4C3] block mb-1">Leader Name</label>
              <input type="text" value={leaderName} onChange={(e)=>setLeaderName(e.target.value)} className="w-full bg-[#05070A] border border-[#1E293B] rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="text-[#AAB4C3] block mb-1">Leader Email</label>
              <input type="email" value={leaderEmail} onChange={(e)=>setLeaderEmail(e.target.value)} className="w-full bg-[#05070A] border border-[#1E293B] rounded-lg p-2 text-white" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-[#147BFF] font-bold text-xs text-white rounded-lg">
            SAVE CHANGES
          </button>
        </form>
      )}

      {/* Main Grid: Details + Ticket Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Information Cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Team Info Card */}
          <div className="glass-panel p-6 rounded-2xl border border-[#1E293B] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-[#1E293B] pb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#147BFF]" />
              TEAM & INSTITUTION INFO
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#AAB4C3]">Team Name:</span>
                <p className="font-bold text-white text-sm mt-0.5">{team.name}</p>
              </div>
              <div>
                <span className="text-[#AAB4C3]">College / Institution:</span>
                <p className="font-semibold text-white mt-0.5">{team.college}</p>
              </div>
              <div>
                <span className="text-[#AAB4C3]">Department:</span>
                <p className="font-medium text-white mt-0.5">{team.department}</p>
              </div>
              <div>
                <span className="text-[#AAB4C3]">City:</span>
                <p className="font-medium text-white mt-0.5">{team.city}</p>
              </div>
              <div>
                <span className="text-[#AAB4C3]">Registered On:</span>
                <p className="font-medium text-white mt-0.5">{new Date(team.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Leader & Members Card */}
          <div className="glass-panel p-6 rounded-2xl border border-[#1E293B] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-[#1E293B] pb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#147BFF]" />
              TEAM LEADER & MEMBERS ({1 + team.members.length} Total)
            </h3>

            <div className="bg-[#05070A] p-4 rounded-xl border border-[#1E293B] space-y-1 text-xs">
              <span className="text-[10px] font-bold text-[#147BFF] uppercase">TEAM LEADER</span>
              <p className="text-sm font-bold text-white">{team.leaderName}</p>
              <p className="text-[#AAB4C3]">Email: {team.leaderEmail} | Phone: {team.leaderPhone}</p>
            </div>

            <div className="space-y-3">
              {team.members.map((m: any, idx: number) => (
                <div key={m.id} className="p-3 bg-[#05070A] rounded-xl border border-[#1E293B] text-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#AAB4C3]">MEMBER #{idx + 1}</span>
                  <p className="font-semibold text-white">{m.fullName}</p>
                  <p className="text-[#AAB4C3]">Dept: {m.department || 'N/A'} | Year: {m.year || '1st Year'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail for Team */}
          <div className="glass-panel p-6 rounded-2xl border border-[#1E293B] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-[#1E293B] pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#147BFF]" />
              AUDIT HISTORY FOR THIS TEAM
            </h3>

            <div className="space-y-2 text-xs">
              {team.auditLogs.map((log: any) => (
                <div key={log.id} className="p-3 bg-[#05070A] rounded-lg border border-[#1E293B] flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-[#147BFF]">{log.action}</span>
                    <p className="text-[10px] text-[#AAB4C3]">By: {log.adminEmail || 'System'}</p>
                  </div>
                  <span className="text-[10px] text-[#AAB4C3]">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))}
              {team.auditLogs.length === 0 && (
                <p className="text-xs text-[#AAB4C3]">No prior audit history recorded for this team.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Card Preview */}
        <div className="space-y-6">
          <TicketCard data={ticketData} />
        </div>
      </div>
    </div>
  );
}
