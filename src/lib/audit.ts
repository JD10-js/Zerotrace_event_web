import { prisma } from './db';

export async function logAudit({
  action,
  adminId,
  adminEmail,
  relatedTeamId,
  details,
}: {
  action: string;
  adminId?: string;
  adminEmail?: string;
  relatedTeamId?: string;
  details?: Record<string, any> | string;
}) {
  try {
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;
    await prisma.auditLog.create({
      data: {
        action,
        adminId: adminId || null,
        adminEmail: adminEmail || null,
        relatedTeamId: relatedTeamId || null,
        details: detailsStr || null,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
