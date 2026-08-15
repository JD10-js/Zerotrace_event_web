import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

const ALL_PERMISSIONS = [
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
];

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Initial Sequence Counter
  await prisma.sequenceCounter.upsert({
    where: { name: 'team_id' },
    update: {},
    create: { name: 'team_id', currentValue: 1 },
  });

  // 2. Default Event Settings
  const defaultSettings = [
    { key: 'eventName', value: 'EUREKA! – Road To Enterprise 2026' },
    { key: 'organizerName', value: 'ZeroTrace' },
    { key: 'eventDescription', value: 'The ultimate entrepreneurship and innovation roadmap competition organized by ZeroTrace.' },
    { key: 'registrationOpen', value: 'true' },
    { key: 'minTeamSize', value: '1' },
    { key: 'maxTeamSize', value: '15' },
    { key: 'teamIdPrefix', value: 'ERE26' },
    { key: 'startingSequence', value: '1001' },
    { key: 'eventVenue', value: 'Main Auditorium, Innovation Block' },
    { key: 'eventDate', value: 'August 17, 2026' },
    { key: 'importantDates', value: 'Registration Closes: March 1, 2026 | Round 1: March 15 | Grand Finale: March 16' },
    { key: 'contactEmail', value: 'contact@zerotrace.org' },
    { key: 'contactPhone', value: '+1 (800) 555-0199' },
  ];

  for (const s of defaultSettings) {
    await prisma.eventSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // 3. Super Admin User
  const superAdminEmail = 'admin@zerotrace.org';
  const superAdminPassword = await bcrypt.hash('Admin@Eureka2026', 10);

  const superAdmin = await prisma.adminUser.upsert({
    where: { email: superAdminEmail },
    update: {
      name: 'ZeroTrace Super Admin',
      passwordHash: superAdminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
    create: {
      name: 'ZeroTrace Super Admin',
      email: superAdminEmail,
      passwordHash: superAdminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  // Assign all permissions to Super Admin
  await prisma.permission.deleteMany({ where: { adminId: superAdmin.id } });
  await prisma.permission.createMany({
    data: ALL_PERMISSIONS.map((p) => ({
      adminId: superAdmin.id,
      permission: p,
    })),
  });

  // 4. Sample Teams & Tickets for Dev / Testing
  const existingTeamsCount = await prisma.team.count();
  if (existingTeamsCount === 0) {
    const sampleTeams = [
      {
        teamId: 'ERE26-1001',
        name: 'Nexus Innovators',
        college: 'Stanford University',
        department: 'Computer Science',
        city: 'Palo Alto',
        leaderName: 'Alex Rivera',
        leaderEmail: 'alex.rivera@stanford.edu',
        leaderPhone: '+1-555-0142',
        verificationToken: crypto.randomBytes(16).toString('hex'),
        members: [
          { fullName: 'Sarah Chen', department: 'Computer Science', year: '3rd Year' },
          { fullName: 'Michael Vance', department: 'Electrical Engineering', year: '4th Year' },
        ],
      },
      {
        teamId: 'ERE26-1002',
        name: 'Quantum Leap Solutions',
        college: 'MIT',
        department: 'School of Engineering',
        city: 'Cambridge',
        leaderName: 'Elena Rostova',
        leaderEmail: 'elena@mit.edu',
        leaderPhone: '+1-555-0188',
        verificationToken: crypto.randomBytes(16).toString('hex'),
        members: [
          { fullName: 'David Kim', department: 'Physics', year: '2nd Year' },
          { fullName: 'Priyah Sharma', department: 'MBA', year: 'Post Graduate' },
          { fullName: 'Lucas Rossi', department: 'AI Dept', year: '3rd Year' },
        ],
      },
    ];

    for (const tData of sampleTeams) {
      const { members, ...teamFields } = tData;
      const team = await prisma.team.create({
        data: {
          ...teamFields,
          members: {
            create: members,
          },
          tickets: {
            create: {
              ticketNumber: `TCK-${teamFields.teamId}-${Date.now().toString().slice(-4)}`,
              status: 'ACTIVE',
            },
          },
        },
      });

      console.log(`Created sample team: ${team.teamId} (${team.name})`);
    }

    // Update sequence counter to match next available
    await prisma.sequenceCounter.update({
      where: { name: 'team_id' },
      data: { currentValue: 1003 },
    });
  }

  // Log Audit
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_SEED',
      adminId: superAdmin.id,
      adminEmail: superAdmin.email,
      details: JSON.stringify({ message: 'Database initialized and seeded successfully.' }),
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`🔑 Super Admin Email: ${superAdminEmail}`);
  console.log('🔑 Super Admin Password: Admin@Eureka2026');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
