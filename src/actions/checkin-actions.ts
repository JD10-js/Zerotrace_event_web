'use server';

import { prisma } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

export async function verifyTokenAction(tokenOrTeamId: string) {
  try {
    if (!tokenOrTeamId) {
      return { success: false, error: 'No verification token or Team ID provided.' };
    }

    const queryStr = tokenOrTeamId.trim();

    const team = await prisma.team.findFirst({
      where: {
        OR: [
          { verificationToken: queryStr },
          { teamId: queryStr.toUpperCase() },
        ],
      },
      include: {
        members: true,
        checkIn: true,
        tickets: true,
      },
    });

    if (!team) {
      return {
        success: false,
        error: 'INVALID TICKET: No registered team found for this verification code or Team ID.',
      };
    }

    if (team.status === 'REVOKED' || team.status === 'CANCELLED') {
      return {
        success: false,
        status: 'REVOKED',
        error: 'INVALID / REVOKED TICKET: This entry pass has been revoked by the event administration.',
        team: {
          teamId: team.teamId,
          name: team.name,
          college: team.college,
          status: team.status,
        },
      };
    }

    const activeTicket = team.tickets.find((t) => t.status === 'ACTIVE');
    if (!activeTicket) {
      return {
        success: false,
        status: 'REVOKED',
        error: 'INVALID TICKET: Ticket pass is inactive or revoked.',
        team: {
          teamId: team.teamId,
          name: team.name,
          college: team.college,
          status: team.status,
        },
      };
    }

    return {
      success: true,
      team: {
        id: team.id,
        teamId: team.teamId,
        name: team.name,
        college: team.college,
        department: team.department,
        leaderName: team.leaderName,
        leaderEmail: team.leaderEmail,
        memberCount: 1 + team.members.length,
        status: team.status,
        verificationToken: team.verificationToken,
        checkIn: team.checkIn
          ? {
              checkedInAt: team.checkIn.checkedInAt.toISOString(),
              checkedInByAdminName: team.checkIn.checkedInByAdminName,
              notes: team.checkIn.notes,
            }
          : null,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error processing verification.' };
  }
}

export async function confirmCheckInAction(teamId: string, notes?: string) {
  try {
    const admin = await getCurrentAdminSession();
    if (!admin) {
      return { success: false, error: 'Unauthorized: You must be logged in as an administrator.' };
    }

    if (!hasPermission(admin, 'CHECK_IN')) {
      return { success: false, error: 'Forbidden: You do not have CHECK_IN permissions.' };
    }

    const team = await prisma.team.findUnique({
      where: { teamId },
      include: { checkIn: true },
    });

    if (!team) {
      return { success: false, error: 'Team not found.' };
    }

    if (team.status === 'REVOKED' || team.status === 'CANCELLED') {
      return { success: false, error: 'Cannot check in: Team ticket is revoked or cancelled.' };
    }

    if (team.checkIn) {
      return {
        success: false,
        alreadyCheckedIn: true,
        checkedInAt: team.checkIn.checkedInAt.toISOString(),
        checkedInByAdminName: team.checkIn.checkedInByAdminName,
        error: `ALREADY CHECKED IN on ${new Date(team.checkIn.checkedInAt).toLocaleString()} by ${team.checkIn.checkedInByAdminName}.`,
      };
    }

    const checkInRecord = await prisma.checkIn.create({
      data: {
        teamDbId: team.id,
        checkedInByAdminId: admin.id,
        checkedInByAdminName: admin.name,
        notes: notes || null,
      },
    });

    await logAudit({
      action: 'TEAM_CHECKED_IN',
      adminId: admin.id,
      adminEmail: admin.email,
      relatedTeamId: team.teamId,
      details: {
        teamName: team.name,
        checkedInAt: checkInRecord.checkedInAt,
        adminName: admin.name,
      },
    });

    return {
      success: true,
      teamId: team.teamId,
      teamName: team.name,
      checkedInAt: checkInRecord.checkedInAt.toISOString(),
      checkedInByAdminName: admin.name,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Check-in failed.' };
  }
}
