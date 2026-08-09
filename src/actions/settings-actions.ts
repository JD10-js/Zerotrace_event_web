'use server';

import { prisma } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

export async function updateEventSettingsAction(settings: Record<string, string>) {
  try {
    const admin = await getCurrentAdminSession();
    if (!admin) return { success: false, error: 'Unauthorized.' };

    if (!hasPermission(admin, 'MANAGE_SETTINGS')) {
      return { success: false, error: 'Forbidden: Missing MANAGE_SETTINGS permission.' };
    }

    for (const [key, value] of Object.entries(settings)) {
      await prisma.eventSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    await logAudit({
      action: 'EVENT_SETTINGS_UPDATED',
      adminId: admin.id,
      adminEmail: admin.email,
      details: settings,
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update settings.' };
  }
}
