'use server';

import { prisma } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function exportTeamsCsvAction() {
  try {
    const admin = await getCurrentAdminSession();
    if (!admin) return { success: false, error: 'Unauthorized.' };

    if (!hasPermission(admin, 'EXPORT_DATA')) {
      return { success: false, error: 'Forbidden: Missing EXPORT_DATA permission.' };
    }

    const teams = await prisma.team.findMany({
      include: {
        members: true,
        checkIn: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Team ID',
      'Team Name',
      'College',
      'Department',
      'City',
      'Leader Name',
      'Leader Email',
      'Leader Phone',
      'Member Count',
      'Member 1 Name',
      'Member 1 Dept',
      'Member 1 Year',
      'Member 2 Name',
      'Member 2 Dept',
      'Member 2 Year',
      'Member 3 Name',
      'Member 3 Dept',
      'Member 3 Year',
      'Member 4 Name',
      'Member 4 Dept',
      'Member 4 Year',
      'Status',
      'Check-in Status',
      'Checked-in At',
      'Checked-in By',
      'Registered At',
    ];

    const csvRows = [headers.join(',')];

    for (const t of teams) {
      const totalMembers = 1 + t.members.length;
      const checkInStatus = t.checkIn ? 'CHECKED_IN' : 'NOT_CHECKED_IN';
      const checkedInAt = t.checkIn ? t.checkIn.checkedInAt.toISOString() : '';
      const checkedInBy = t.checkIn ? t.checkIn.checkedInByAdminName : '';

      const m1 = t.members[0] || {};
      const m2 = t.members[1] || {};
      const m3 = t.members[2] || {};
      const m4 = t.members[3] || {};

      const row = [
        `"${t.teamId}"`,
        `"${t.name.replace(/"/g, '""')}"`,
        `"${t.college.replace(/"/g, '""')}"`,
        `"${t.department.replace(/"/g, '""')}"`,
        `"${t.city.replace(/"/g, '""')}"`,
        `"${t.leaderName.replace(/"/g, '""')}"`,
        `"${t.leaderEmail}"`,
        `"${t.leaderPhone}"`,
        totalMembers,
        `"${(m1.fullName || '').replace(/"/g, '""')}"`,
        `"${(m1.department || '').replace(/"/g, '""')}"`,
        `"${m1.year || ''}"`,
        `"${(m2.fullName || '').replace(/"/g, '""')}"`,
        `"${(m2.department || '').replace(/"/g, '""')}"`,
        `"${m2.year || ''}"`,
        `"${(m3.fullName || '').replace(/"/g, '""')}"`,
        `"${(m3.department || '').replace(/"/g, '""')}"`,
        `"${m3.year || ''}"`,
        `"${(m4.fullName || '').replace(/"/g, '""')}"`,
        `"${(m4.department || '').replace(/"/g, '""')}"`,
        `"${m4.year || ''}"`,
        `"${t.status}"`,
        `"${checkInStatus}"`,
        `"${checkedInAt}"`,
        `"${checkedInBy.replace(/"/g, '""')}"`,
        `"${t.createdAt.toISOString()}"`,
      ];

      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    return { success: true, csvContent, filename: `eureka_teams_export_${Date.now()}.csv` };
  } catch (error: any) {
    return { success: false, error: error.message || 'Export failed.' };
  }
}
