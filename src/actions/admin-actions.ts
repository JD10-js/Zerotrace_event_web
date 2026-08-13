'use server';

import { prisma } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth';
import { hasPermission, ROLE_PRESETS } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';
import { headers } from 'next/headers';

export async function inviteAdminAction({
  email,
  role,
  permissions,
}: {
  email: string;
  role: string;
  permissions: string[];
}) {
  try {
    const currentAdmin = await getCurrentAdminSession();
    if (!currentAdmin) {
      return { success: false, error: 'Unauthorized.' };
    }

    if (!hasPermission(currentAdmin, 'MANAGE_ADMINS')) {
      return { success: false, error: 'Forbidden: You do not have permission to manage administrators.' };
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.adminUser.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return { success: false, error: 'An administrator account with this email already exists.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 Hours expiration

    // Ensure permissions array is populated (use preset if role selected and permissions array is empty)
    const effectivePermissions =
      permissions && permissions.length > 0
        ? permissions
        : ROLE_PRESETS[role] || [];

    const invitation = await prisma.adminInvitation.create({
      data: {
        email: cleanEmail,
        token,
        role,
        permissions: JSON.stringify(effectivePermissions),
        invitedBy: currentAdmin.email,
        expiresAt,
      },
    });

    await logAudit({
      action: 'ADMIN_INVITATION_SENT',
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      details: { invitedEmail: cleanEmail, role, permissions: effectivePermissions },
    });

    // Dynamic Domain Detection from Request Headers
    const headerList = headers();
    const host = headerList.get('host');
    const proto = headerList.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (host ? `${proto}://${host}` : 'http://localhost:3000');
    const inviteLink = `${appUrl}/admin/accept-invitation?token=${token}`;

    await sendEmail({
      to: cleanEmail,
      subject: "You're invited to manage EUREKA! – Road To Enterprise 2026",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #05070A; color: #FFFFFF; padding: 30px; border-radius: 8px;">
          <h2 style="color: #147BFF;">EUREKA! – Road To Enterprise 2026</h2>
          <p>Organized by <strong>ZeroTrace</strong></p>
          <hr style="border-color: #1E293B;" />
          <h3>ADMINISTRATOR INVITATION</h3>
          <p>You have been invited by <strong>${currentAdmin.name} (${currentAdmin.email})</strong> to access the EUREKA! event management platform as a <strong>${role}</strong>.</p>
          <p>Please click the button below to setup your password and activate your account:</p>
          <a href="${inviteLink}" style="display: inline-block; background-color: #147BFF; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 10px;">ACCEPT INVITATION</a>
          <br/><br/>
          <p style="color: #AAB4C3; font-size: 12px;">This invitation link will expire in 48 hours.</p>
        </div>
      `,
    });

    return { success: true, token, inviteLink };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to send invitation.' };
  }
}

export async function updateAdminPermissionsAction({
  adminId,
  role,
  permissions,
  isActive,
}: {
  adminId: string;
  role: string;
  permissions: string[];
  isActive?: boolean;
}) {
  try {
    const currentAdmin = await getCurrentAdminSession();
    if (!currentAdmin) return { success: false, error: 'Unauthorized.' };

    if (!hasPermission(currentAdmin, 'MANAGE_PERMISSIONS')) {
      return { success: false, error: 'Forbidden: You do not have permission to manage permissions.' };
    }

    const targetAdmin = await prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!targetAdmin) return { success: false, error: 'Admin user not found.' };

    // Prevent non-super-admins from editing Super Admins
    if (targetAdmin.role === 'SUPER_ADMIN' && currentAdmin.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Only Super Admins can modify another Super Admin account.' };
    }

    // Update Role & Active status
    await prisma.adminUser.update({
      where: { id: adminId },
      data: {
        role,
        isActive: isActive !== undefined ? isActive : targetAdmin.isActive,
      },
    });

    // Replace Permissions
    await prisma.permission.deleteMany({ where: { adminId } });
    if (permissions && permissions.length > 0) {
      await prisma.permission.createMany({
        data: permissions.map((p) => ({
          adminId,
          permission: p,
        })),
      });
    }

    await logAudit({
      action: 'ADMIN_PERMISSIONS_UPDATED',
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      details: { targetAdminEmail: targetAdmin.email, newRole: role, newPermissions: permissions },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update permissions.' };
  }
}

export async function deleteAdminAction(adminId: string) {
  try {
    const currentAdmin = await getCurrentAdminSession();
    if (!currentAdmin) return { success: false, error: 'Unauthorized.' };

    if (!hasPermission(currentAdmin, 'MANAGE_ADMINS')) {
      return { success: false, error: 'Forbidden: Missing MANAGE_ADMINS permission.' };
    }

    const targetAdmin = await prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!targetAdmin) return { success: false, error: 'Admin not found.' };

    // Check if target is Super Admin and if it's the last Super Admin
    if (targetAdmin.role === 'SUPER_ADMIN') {
      const superAdminCount = await prisma.adminUser.count({ where: { role: 'SUPER_ADMIN' } });
      if (superAdminCount <= 1) {
        return { success: false, error: 'Cannot delete the last Super Admin account in the system.' };
      }
    }

    await prisma.adminUser.delete({ where: { id: adminId } });

    await logAudit({
      action: 'ADMIN_DELETED',
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      details: { deletedEmail: targetAdmin.email },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete admin.' };
  }
}
