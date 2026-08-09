export const PERMISSIONS = {
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  VIEW_TEAMS: 'VIEW_TEAMS',
  CREATE_TEAM: 'CREATE_TEAM',
  EDIT_TEAM: 'EDIT_TEAM',
  DELETE_TEAM: 'DELETE_TEAM',
  VIEW_TICKETS: 'VIEW_TICKETS',
  GENERATE_TICKET: 'GENERATE_TICKET',
  DOWNLOAD_TICKET: 'DOWNLOAD_TICKET',
  SEND_TICKET: 'SEND_TICKET',
  SCAN_QR: 'SCAN_QR',
  CHECK_IN: 'CHECK_IN',
  EXPORT_DATA: 'EXPORT_DATA',
  MANAGE_ADMINS: 'MANAGE_ADMINS',
  MANAGE_PERMISSIONS: 'MANAGE_PERMISSIONS',
  MANAGE_SETTINGS: 'MANAGE_SETTINGS',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export const ROLE_PRESETS: Record<string, PermissionKey[]> = {
  SUPER_ADMIN: [
    'VIEW_DASHBOARD',
    'VIEW_TEAMS',
    'CREATE_TEAM',
    'EDIT_TEAM',
    'DELETE_TEAM',
    'VIEW_TICKETS',
    'GENERATE_TICKET',
    'DOWNLOAD_TICKET',
    'SEND_TICKET',
    'SCAN_QR',
    'CHECK_IN',
    'EXPORT_DATA',
    'MANAGE_ADMINS',
    'MANAGE_PERMISSIONS',
    'MANAGE_SETTINGS',
    'VIEW_AUDIT_LOGS',
  ],
  REGISTRATION_ADMIN: [
    'VIEW_DASHBOARD',
    'VIEW_TEAMS',
    'CREATE_TEAM',
    'EDIT_TEAM',
    'VIEW_TICKETS',
    'GENERATE_TICKET',
    'DOWNLOAD_TICKET',
    'SEND_TICKET',
  ],
  CHECK_IN_ADMIN: [
    'VIEW_DASHBOARD',
    'VIEW_TEAMS',
    'SCAN_QR',
    'CHECK_IN',
    'VIEW_TICKETS',
  ],
  DATA_ADMIN: [
    'VIEW_DASHBOARD',
    'VIEW_TEAMS',
    'EXPORT_DATA',
    'VIEW_TICKETS',
  ],
  CUSTOM: [],
};

export interface AdminSession {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export function hasPermission(admin: AdminSession | null, permission: PermissionKey): boolean {
  if (!admin) return false;
  if (admin.role === 'SUPER_ADMIN') return true;
  return admin.permissions.includes(permission);
}

export function hasAnyPermission(admin: AdminSession | null, permissions: PermissionKey[]): boolean {
  if (!admin) return false;
  if (admin.role === 'SUPER_ADMIN') return true;
  return permissions.some((p) => admin.permissions.includes(p));
}
