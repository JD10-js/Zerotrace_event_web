'use server';

import { prisma } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

export async function updateTeamAction(teamId: string, data: {
  name?: string;
  college?: string;
  department?: string;
  city?: string;
  leaderName?: string;
  leaderEmail?: string;
  leaderPhone?: string;
  status?: string;
}) {
  try {
    const admin = await getCurrentAdminSession();
    if (!admin) return { success: false, error: 'Unauthorized.' };

    if (!hasPermission(admin, 'EDIT_TEAM')) {
      return { success: false, error: 'Forbidden: Missing EDIT_TEAM permission.' };
    }

    const team = await prisma.team.findUnique({ where: { teamId } });
    if (!team) return { success: false, error: 'Team not found.' };

    const updated = await prisma.team.update({
      where: { teamId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.college && { college: data.college.trim() }),
        ...(data.department && { department: data.department.trim() }),
        ...(data.city && { city: data.city.trim() }),
        ...(data.leaderName && { leaderName: data.leaderName.trim() }),
        ...(data.leaderEmail && { leaderEmail: data.leaderEmail.trim().toLowerCase() }),
        ...(data.leaderPhone && { leaderPhone: data.leaderPhone.trim() }),
        ...(data.status && { status: data.status }),
      },
    });

    await logAudit({
      action: 'TEAM_UPDATED',
      adminId: admin.id,
      adminEmail: admin.email,
      relatedTeamId: teamId,
      details: data,
    });

    return { success: true, team: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update team.' };
  }
}

export async function revokeTicketAction(teamId: string) {
  try {
    const admin = await getCurrentAdminSession();
    if (!admin) return { success: false, error: 'Unauthorized.' };

    if (!hasPermission(admin, 'EDIT_TEAM')) {
      return { success: false, error: 'Forbidden: Missing EDIT_TEAM permission.' };
    }

    const team = await prisma.team.findUnique({ where: { teamId } });
    if (!team) return { success: false, error: 'Team not found.' };

    // Update Team Status & Tickets to REVOKED
    await prisma.team.update({
      where: { teamId },
      data: { status: 'REVOKED' },
    });

    await prisma.ticket.updateMany({
      where: { teamDbId: team.id },
      data: { status: 'REVOKED' },
    });

    await logAudit({
      action: 'TICKET_REVOKED',
      adminId: admin.id,
      adminEmail: admin.email,
      relatedTeamId: teamId,
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to revoke ticket.' };
  }
}

export async function regenerateTicketAction(teamId: string) {
  try {
    const admin = await getCurrentAdminSession();
    if (!admin) return { success: false, error: 'Unauthorized.' };

    if (!hasPermission(admin, 'GENERATE_TICKET')) {
      return { success: false, error: 'Forbidden: Missing GENERATE_TICKET permission.' };
    }

    const team = await prisma.team.findUnique({ where: { teamId } });
    if (!team) return { success: false, error: 'Team not found.' };

    const newVerificationToken = crypto.randomBytes(24).toString('hex');
    const newTicketNumber = `TCK-${teamId}-${Date.now().toString().slice(-4)}`;

    await prisma.team.update({
      where: { teamId },
      data: {
        verificationToken: newVerificationToken,
        status: 'CONFIRMED',
      },
    });

    // Create new active ticket
    await prisma.ticket.create({
      data: {
        ticketNumber: newTicketNumber,
        teamDbId: team.id,
        status: 'ACTIVE',
      },
    });

    await logAudit({
      action: 'TICKET_REGENERATED',
      adminId: admin.id,
      adminEmail: admin.email,
      relatedTeamId: teamId,
      details: { newTicketNumber },
    });

    return { success: true, verificationToken: newVerificationToken };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to regenerate ticket.' };
  }
}

export async function resendTicketEmailAction(teamId: string) {
  try {
    const admin = await getCurrentAdminSession();
    if (!admin) return { success: false, error: 'Unauthorized.' };

    if (!hasPermission(admin, 'SEND_TICKET')) {
      return { success: false, error: 'Forbidden: Missing SEND_TICKET permission.' };
    }

    const team = await prisma.team.findUnique({
      where: { teamId },
      include: { members: true },
    });
    if (!team) return { success: false, error: 'Team not found.' };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const ticketUrl = `${appUrl}/register/success/${team.teamId}`;

    await sendEmail({
      to: team.leaderEmail,
      subject: `Entry Pass & Ticket - ${team.teamId} | EUREKA! 2026`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #05070A; color: #FFFFFF; padding: 30px; border-radius: 8px;">
          <h2 style="color: #147BFF;">EUREKA! – Road To Enterprise 2026</h2>
          <p>Organized by <strong>ZeroTrace</strong></p>
          <hr style="border-color: #1E293B;" />
          <h3>YOUR ENTRY TICKET PASS</h3>
          <p>Dear ${team.leaderName},</p>
          <p>Your ticket for <strong>${team.name}</strong> (${team.teamId}) has been re-sent by the organizers.</p>
          <a href="${ticketUrl}" style="display: inline-block; background-color: #147BFF; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 10px;">ACCESS TICKET & QR CODE</a>
        </div>
      `,
    });

    await logAudit({
      action: 'TICKET_EMAIL_RESENT',
      adminId: admin.id,
      adminEmail: admin.email,
      relatedTeamId: teamId,
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to resend ticket.' };
  }
}

export async function uploadTeamPresentationAction(
  teamId: string,
  fileName: string,
  fileUrlOrData: string
) {
  try {
    const admin = await getCurrentAdminSession();
    if (!admin) return { success: false, error: 'Unauthorized.' };

    if (!hasPermission(admin, 'EDIT_TEAM')) {
      return { success: false, error: 'Forbidden: Missing EDIT_TEAM permission.' };
    }

    const team = await prisma.team.findUnique({ where: { teamId } });
    if (!team) return { success: false, error: 'Team not found.' };

    await prisma.team.update({
      where: { teamId },
      data: {
        presentationUrl: fileUrlOrData,
        presentationFileName: fileName,
      },
    });

    await logAudit({
      action: 'TEAM_PRESENTATION_UPLOADED',
      adminId: admin.id,
      adminEmail: admin.email,
      relatedTeamId: teamId,
      details: { fileName },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to upload presentation.' };
  }
}

export async function removeTeamPresentationAction(teamId: string) {
  try {
    const admin = await getCurrentAdminSession();
    if (!admin) return { success: false, error: 'Unauthorized.' };

    if (!hasPermission(admin, 'EDIT_TEAM')) {
      return { success: false, error: 'Forbidden: Missing EDIT_TEAM permission.' };
    }

    await prisma.team.update({
      where: { teamId },
      data: {
        presentationUrl: null,
        presentationFileName: null,
      },
    });

    await logAudit({
      action: 'TEAM_PRESENTATION_REMOVED',
      adminId: admin.id,
      adminEmail: admin.email,
      relatedTeamId: teamId,
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove presentation.' };
  }
}

export async function updatePitchDurationAction(teamId: string, durationMinutes: number) {
  try {
    const admin = await getCurrentAdminSession();
    if (!admin) return { success: false, error: 'Unauthorized.' };

    await prisma.team.update({
      where: { teamId },
      data: {
        pitchDurationMinutes: durationMinutes,
      },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update pitch duration.' };
  }
}
