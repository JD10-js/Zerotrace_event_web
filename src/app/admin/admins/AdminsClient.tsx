'use client';

import { useState } from 'react';
import { UserPlus, Shield, Edit, Trash2, Mail, Check, X, AlertCircle } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { PERMISSIONS, ROLE_PRESETS } from '@/lib/permissions';
import {
  inviteAdminAction,
  updateAdminPermissionsAction,
  deleteAdminAction,
} from '@/actions/admin-actions';

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  permissions: string[];
}

export default function AdminsClient({
  initialAdmins,
  initialInvitations,
  admin,
}: {
  initialAdmins: AdminUserRow[];
  initialInvitations: any[];
  admin: any;
}) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<AdminUserRow | null>(null);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('REGISTRATION_ADMIN');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    ROLE_PRESETS.REGISTRATION_ADMIN || []
  );
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [inviteLinkCreated, setInviteLinkCreated] = useState('');

  // Handle Role Change -> Pre-fill Preset Checkboxes
  function handleRoleChange(newRole: string) {
    setInviteRole(newRole);
    if (ROLE_PRESETS[newRole]) {
      setSelectedPermissions(ROLE_PRESETS[newRole]);
    }
  }

  function togglePermission(p: string) {
    if (selectedPermissions.includes(p)) {
      setSelectedPermissions(selectedPermissions.filter((item) => item !== p));
    } else {
      setSelectedPermissions([...selectedPermissions, p]);
    }
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setInviteLinkCreated('');

    const res = await inviteAdminAction({
      email: inviteEmail,
      role: inviteRole,
      permissions: selectedPermissions,
    });

    setLoading(false);
    if (res.success) {
      setMsg('Invitation sent successfully!');
      if (res.inviteLink) {
        setInviteLinkCreated(res.inviteLink);
      }
      setInviteEmail('');
    } else {
      setMsg(res.error || 'Failed to send invitation.');
    }
  }

  async function handleSaveEditedPermissions(e: React.FormEvent) {
    e.preventDefault();
    if (!showEditModal) return;
    setLoading(true);

    const res = await updateAdminPermissionsAction({
      adminId: showEditModal.id,
      role: showEditModal.role,
      permissions: showEditModal.permissions,
      isActive: showEditModal.isActive,
    });

    setLoading(false);
    if (res.success) {
      alert('Admin permissions updated.');
      setShowEditModal(null);
      window.location.reload();
    } else {
      alert(res.error);
    }
  }

  async function handleDelete(adminId: string) {
    if (!confirm('Are you sure you want to remove this administrator?')) return;
    const res = await deleteAdminAction(adminId);
    if (res.success) {
      setAdmins(admins.filter((a) => a.id !== adminId));
    } else {
      alert(res.error);
    }
  }

  return (
    <div className="space-y-8">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wide">ADMINISTRATOR MANAGEMENT</h1>
          <p className="text-xs text-[#AAB4C3]">Assign roles, granular permissions, and send email invitations.</p>
        </div>

        <button
          onClick={() => {
            setShowInviteModal(true);
            setMsg('');
            setInviteLinkCreated('');
          }}
          className="px-4 py-2.5 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-xs text-white rounded-xl shadow flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          + ADD ADMIN
        </button>
      </div>

      {/* Admin Users Table */}
      <div className="glass-panel rounded-2xl border border-[#1E293B] overflow-hidden">
        <div className="p-4 border-b border-[#1E293B] bg-[#05070A]">
          <h3 className="text-xs font-bold text-[#147BFF] uppercase tracking-wider">ACTIVE ADMINISTRATORS</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#AAB4C3]">
            <thead className="bg-[#05070A] uppercase text-[10px] font-bold text-[#147BFF] border-b border-[#1E293B]">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Permissions</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {admins.map((a) => (
                <tr key={a.id} className="hover:bg-[#071426]/50">
                  <td className="p-4 font-bold text-white">{a.name}</td>
                  <td className="p-4 font-mono">{a.email}</td>
                  <td className="p-4 font-bold text-[#147BFF] font-mono">{a.role}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-[#071426] rounded border border-[#1E293B] text-[11px]">
                      {a.role === 'SUPER_ADMIN' ? 'ALL (16 Permissions)' : `${a.permissions.length} Permissions`}
                    </span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={a.isActive ? 'ENABLED' : 'DISABLED'} />
                  </td>
                  <td className="p-4 text-[11px]">
                    {a.lastLogin ? new Date(a.lastLogin).toLocaleString() : 'Never'}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setShowEditModal(a)}
                      className="px-2.5 py-1 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] text-white rounded font-bold text-[11px]"
                    >
                      Permissions
                    </button>
                    {a.id !== admin.id && (
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded font-bold text-[11px]"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations Table */}
      {invitations.length > 0 && (
        <div className="glass-panel rounded-2xl border border-[#1E293B] overflow-hidden">
          <div className="p-4 border-b border-[#1E293B] bg-[#05070A]">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">PENDING EMAIL INVITATIONS</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#AAB4C3]">
              <thead className="bg-[#05070A] uppercase text-[10px] font-bold text-[#AAB4C3] border-b border-[#1E293B]">
                <tr>
                  <th className="p-4">Invited Email</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Invited By</th>
                  <th className="p-4">Expires At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {invitations.map((inv) => (
                  <tr key={inv.id}>
                    <td className="p-4 font-mono text-white">{inv.email}</td>
                    <td className="p-4 font-bold text-[#147BFF] font-mono">{inv.role}</td>
                    <td className="p-4">{inv.invitedBy}</td>
                    <td className="p-4 text-[11px]">{new Date(inv.expiresAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD ADMIN INVITATION MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl border border-[#147BFF]/40 max-w-xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
              <h2 className="text-lg font-bold text-white uppercase flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#147BFF]" />
                INVITE NEW ADMINISTRATOR
              </h2>
              <button onClick={() => setShowInviteModal(false)} className="text-[#AAB4C3] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {msg && (
              <div className="p-3 bg-[#147BFF]/10 border border-[#147BFF]/30 rounded-xl text-xs text-[#147BFF] font-bold">
                {msg}
              </div>
            )}

            {inviteLinkCreated && (
              <div className="p-4 bg-[#05070A] border border-[#147BFF] rounded-xl space-y-2 text-xs">
                <span className="text-[10px] font-bold text-[#147BFF] block uppercase">INVITATION LINK CREATED</span>
                <p className="font-mono text-white break-all text-[11px] bg-[#071426] p-2 rounded">{inviteLinkCreated}</p>
                <p className="text-[10px] text-[#AAB4C3]">Pass this link directly to the admin or check local simulated email logs.</p>
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#AAB4C3] block mb-1">
                  ADMIN EMAIL ADDRESS *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="newadmin@zerotrace.org"
                  className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#AAB4C3] block mb-1">
                  ROLE PRESET *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                >
                  <option value="REGISTRATION_ADMIN">REGISTRATION ADMIN</option>
                  <option value="CHECK_IN_ADMIN">CHECK-IN ADMIN</option>
                  <option value="DATA_ADMIN">DATA ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN (FULL ACCESS)</option>
                  <option value="CUSTOM">CUSTOM PERMISSIONS</option>
                </select>
              </div>

              {/* Granular Permission Checkboxes */}
              <div>
                <label className="text-xs font-semibold text-[#AAB4C3] block mb-2">
                  GRANULAR PERMISSIONS ({selectedPermissions.length} SELECTED)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#05070A] p-4 rounded-2xl border border-[#1E293B] max-h-48 overflow-y-auto">
                  {Object.keys(PERMISSIONS).map((pKey) => {
                    const isChecked = selectedPermissions.includes(pKey);
                    return (
                      <label key={pKey} className="flex items-center gap-2 text-xs text-white cursor-pointer p-1 rounded hover:bg-[#071426]">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(pKey)}
                          className="w-4 h-4 rounded accent-[#147BFF]"
                        />
                        <span className="font-mono text-[11px]">{pKey}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-xs text-white rounded-xl shadow"
                >
                  {loading ? 'SENDING INVITATION...' : 'SEND INVITATION EMAIL'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="py-3 px-5 bg-[#071426] text-xs font-bold text-white rounded-xl border border-[#1E293B]"
                >
                  CLOSE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PERMISSIONS MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl border border-[#147BFF]/40 max-w-xl w-full space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
              <h2 className="text-lg font-bold text-white uppercase">
                EDIT PERMISSIONS: {showEditModal.email}
              </h2>
              <button onClick={() => setShowEditModal(null)} className="text-[#AAB4C3] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedPermissions} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#AAB4C3] block mb-1">ROLE</label>
                <select
                  value={showEditModal.role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setShowEditModal({
                      ...showEditModal,
                      role: newRole,
                      permissions: ROLE_PRESETS[newRole] || showEditModal.permissions,
                    });
                  }}
                  className="w-full bg-[#05070A] border border-[#1E293B] rounded-xl px-4 py-2 text-sm text-white"
                >
                  <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  <option value="REGISTRATION_ADMIN">REGISTRATION ADMIN</option>
                  <option value="CHECK_IN_ADMIN">CHECK-IN ADMIN</option>
                  <option value="DATA_ADMIN">DATA ADMIN</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#AAB4C3] block mb-2">PERMISSIONS</label>
                <div className="grid grid-cols-2 gap-2 bg-[#05070A] p-4 rounded-2xl border border-[#1E293B] max-h-48 overflow-y-auto">
                  {Object.keys(PERMISSIONS).map((pKey) => {
                    const isChecked = showEditModal.permissions.includes(pKey);
                    return (
                      <label key={pKey} className="flex items-center gap-2 text-xs text-white cursor-pointer p-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const updated = isChecked
                              ? showEditModal.permissions.filter((p) => p !== pKey)
                              : [...showEditModal.permissions, pKey];
                            setShowEditModal({ ...showEditModal, permissions: updated });
                          }}
                          className="w-4 h-4 accent-[#147BFF]"
                        />
                        <span className="font-mono text-[11px]">{pKey}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#147BFF] font-bold text-xs text-white rounded-xl">
                  SAVE PERMISSIONS
                </button>
                <button type="button" onClick={() => setShowEditModal(null)} className="py-3 px-5 bg-[#071426] text-xs font-bold text-white rounded-xl">
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
