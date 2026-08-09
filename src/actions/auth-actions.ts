'use server';

import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signAdminToken, setAdminSessionCookie, clearAdminSessionCookie, getCurrentAdminSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

export async function loginAdminAction(formData: FormData) {
  try {
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email },
      include: { permissions: true },
    });

    if (!admin) {
      return { success: false, error: 'Invalid email or password.' };
    }

    if (!admin.isActive) {
      return { success: false, error: 'Your admin account has been disabled. Please contact Super Admin.' };
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Update last login timestamp
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    // Create session JWT token
    const token = signAdminToken({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    });

    await setAdminSessionCookie(token);

    await logAudit({
      action: 'ADMIN_LOGIN',
      adminId: admin.id,
      adminEmail: admin.email,
      details: { role: admin.role },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Login failed.' };
  }
}

export async function logoutAdminAction() {
  const admin = await getCurrentAdminSession();
  if (admin) {
    await logAudit({
      action: 'ADMIN_LOGOUT',
      adminId: admin.id,
      adminEmail: admin.email,
    });
  }
  await clearAdminSessionCookie();
  return { success: true };
}

export async function acceptInvitationAction(token: string, password: string, name: string) {
  try {
    if (!token || !password || !name) {
      return { success: false, error: 'All fields are required.' };
    }

    const invitation = await prisma.adminInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return { success: false, error: 'Invalid invitation link.' };
    }

    if (invitation.usedAt) {
      return { success: false, error: 'This invitation link has already been used.' };
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      return { success: false, error: 'This invitation link has expired. Request a new invitation.' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const permissionsList: string[] = JSON.parse(invitation.permissions || '[]');

    // Create Admin User & Assign Permissions
    const newAdmin = await prisma.adminUser.create({
      data: {
        name: name.trim(),
        email: invitation.email.toLowerCase(),
        passwordHash,
        role: invitation.role,
        isActive: true,
        permissions: {
          create: permissionsList.map((p) => ({ permission: p })),
        },
      },
    });

    // Mark invitation as used
    await prisma.adminInvitation.update({
      where: { id: invitation.id },
      data: { usedAt: new Date() },
    });

    // Auto-login the new admin
    const jwtToken = signAdminToken({
      sub: newAdmin.id,
      email: newAdmin.email,
      role: newAdmin.role,
    });
    await setAdminSessionCookie(jwtToken);

    await logAudit({
      action: 'ADMIN_INVITATION_ACCEPTED',
      adminId: newAdmin.id,
      adminEmail: newAdmin.email,
      details: { role: newAdmin.role },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Invitation acceptance failed.' };
  }
}
