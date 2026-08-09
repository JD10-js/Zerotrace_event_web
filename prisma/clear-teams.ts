import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing all teams, tickets, check-ins, and resetting sequence counter...');

  // Delete all check-ins, tickets, team members, and teams
  await prisma.checkIn.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();

  // Reset Team ID sequence counter
  const startSetting = await prisma.eventSetting.findUnique({ where: { key: 'startingSequence' } });
  const initialSequence = startSetting ? parseInt(startSetting.value, 10) : 1;

  await prisma.sequenceCounter.upsert({
    where: { name: 'team_id' },
    update: { currentValue: initialSequence },
    create: { name: 'team_id', currentValue: initialSequence },
  });

  // Log clean-up audit
  const superAdmin = await prisma.adminUser.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (superAdmin) {
    await prisma.auditLog.create({
      data: {
        action: 'DATABASE_TEAMS_CLEARED',
        adminId: superAdmin.id,
        adminEmail: superAdmin.email,
        details: JSON.stringify({ message: 'All test teams, tickets, and check-in records cleared. Sequence counter reset.' }),
      },
    });
  }

  console.log('✨ All teams & tickets cleared successfully!');
  console.log(`🔢 Team ID sequence counter reset to: ${initialSequence}`);
}

main()
  .catch((e) => {
    console.error('❌ Error clearing teams:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
