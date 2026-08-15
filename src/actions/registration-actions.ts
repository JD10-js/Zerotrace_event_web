'use server';

import { prisma } from '@/lib/db';
import { generateUniqueTeamId } from '@/lib/team-id-generator';
import { sendEmail } from '@/lib/email';
import { logAudit } from '@/lib/audit';
import crypto from 'crypto';

export interface RegisterTeamInput {
  name: string;
  college: string;
  department: string;
  city: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  members: Array<{
    fullName: string;
    department?: string;
    year?: string;
  }>;
}

export async function registerTeamAction(input: RegisterTeamInput) {
  try {
    // 1. Check if Registration is Open
    const regOpenSetting = await prisma.eventSetting.findUnique({ where: { key: 'registrationOpen' } });
    if (regOpenSetting && regOpenSetting.value === 'false') {
      return { success: false, error: 'Registration is currently closed by the organizers.' };
    }

    // 2. Validate Team Size
    const minSetting = await prisma.eventSetting.findUnique({ where: { key: 'minTeamSize' } });
    const maxSetting = await prisma.eventSetting.findUnique({ where: { key: 'maxTeamSize' } });
    const minSize = minSetting ? parseInt(minSetting.value, 10) : 1;
    const maxSize = maxSetting ? parseInt(maxSetting.value, 10) : 15;

    const totalMembersCount = 1 + (input.members ? input.members.length : 0);
    if (totalMembersCount < minSize) {
      return { success: false, error: `Minimum required team size is ${minSize} members.` };
    }
    if (totalMembersCount > maxSize) {
      return { success: false, error: `Maximum allowed team size is ${maxSize} members.` };
    }

    // 3. Basic Input Validations
    if (!input.name || !input.college || !input.leaderName || !input.leaderEmail || !input.leaderPhone) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    // 4. Duplicate Checks (Team Name & Leader Email)
    const existingLeader = await prisma.team.findFirst({
      where: { leaderEmail: { equals: input.leaderEmail.trim().toLowerCase() } },
    });
    if (existingLeader) {
      return { success: false, error: 'A team with this leader email address is already registered.' };
    }

    const existingName = await prisma.team.findFirst({
      where: { name: { equals: input.name.trim() } },
    });
    if (existingName) {
      return { success: false, error: 'A team with this Team Name is already registered.' };
    }

    // 5. Generate Server-Side Unique Team ID & Secure Verification Token
    const teamId = await generateUniqueTeamId();
    const verificationToken = crypto.randomBytes(24).toString('hex');
    const ticketNumber = `TCK-${teamId}-${Date.now().toString().slice(-4)}`;

    // 6. DB Transaction to Save Team, Members & Ticket
    const newTeam = await prisma.team.create({
      data: {
        teamId,
        name: input.name.trim(),
        college: input.college.trim() || '',
        department: input.department.trim(),
        city: input.city.trim(),
        leaderName: input.leaderName.trim(),
        leaderEmail: input.leaderEmail.trim().toLowerCase(),
        leaderPhone: input.leaderPhone.trim(),
        verificationToken,
        members: {
          create: input.members.map((m) => ({
            fullName: m.fullName.trim(),
            department: m.department ? m.department.trim() : null,
            year: m.year ? m.year.trim() : null,
          })),
        },
        tickets: {
          create: {
            ticketNumber,
            status: 'ACTIVE',
          },
        },
      },
      include: {
        members: true,
      },
    });

    // 7. Log Audit
    await logAudit({
      action: 'PUBLIC_TEAM_REGISTERED',
      relatedTeamId: newTeam.teamId,
      details: {
        teamName: newTeam.name,
        leaderEmail: newTeam.leaderEmail,
        memberCount: totalMembersCount,
      },
    });

    // 8. Trigger Email Confirmation
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const ticketUrl = `${appUrl}/register/success/${newTeam.teamId}`;

    await sendEmail({
      to: newTeam.leaderEmail,
      subject: `Registration Confirmed - ${newTeam.teamId} | EUREKA! 2026`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #05070A; color: #FFFFFF; padding: 30px; border-radius: 8px;">
          <h2 style="color: #147BFF;">EUREKA! – Road To Enterprise 2026</h2>
          <p>Organized by <strong>ZeroTrace</strong></p>
          <hr style="border-color: #1E293B;" />
          <h3>REGISTRATION SUCCESSFUL!</h3>
          <p>Dear ${newTeam.leaderName},</p>
          <p>Your team <strong>${newTeam.name}</strong> has been successfully registered for EUREKA! 2026.</p>
          <div style="background-color: #071426; border: 1px solid #147BFF; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #AAB4C3;">YOUR OFFICIAL TEAM ID:</p>
            <h1 style="margin: 5px 0 0 0; color: #147BFF; letter-spacing: 2px;">${newTeam.teamId}</h1>
          </div>
          <p>Please click the link below to view and download your entry pass & QR ticket:</p>
          <a href="${ticketUrl}" style="display: inline-block; background-color: #147BFF; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 10px;">VIEW ENTRY TICKET</a>
          <br/><br/>
          <p style="color: #AAB4C3; font-size: 12px;">Keep your Team ID and QR code safe. You will be required to present the QR ticket for check-in at the venue.</p>
        </div>
      `,
    });

    return {
      success: true,
      teamId: newTeam.teamId,
      verificationToken: newTeam.verificationToken,
    };
  } catch (error: any) {
    console.error('Registration action error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during registration. Please try again.',
    };
  }
}
