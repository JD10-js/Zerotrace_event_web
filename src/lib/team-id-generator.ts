import { prisma } from './db';

/**
 * Server-side transaction-safe unique Team ID generator.
 * Format: ERE26-0001, ERE26-0002, etc.
 */
export async function generateUniqueTeamId(): Promise<string> {
  return await prisma.$transaction(async (tx) => {
    // Fetch prefix setting or default to 'ERE26'
    const prefixSetting = await tx.eventSetting.findUnique({ where: { key: 'teamIdPrefix' } });
    const prefix = prefixSetting?.value || 'ERE26';

    // Fetch or create sequence counter for 'team_id'
    let counter = await tx.sequenceCounter.findUnique({ where: { name: 'team_id' } });
    
    if (!counter) {
      // Check starting sequence setting or default to 1
      const startSetting = await tx.eventSetting.findUnique({ where: { key: 'startingSequence' } });
      const initialVal = startSetting ? parseInt(startSetting.value, 10) : 1;
      
      counter = await tx.sequenceCounter.create({
        data: { name: 'team_id', currentValue: initialVal },
      });
    }

    const currentVal = counter.currentValue;

    // Format with leading zeroes (minimum 4 digits: ERE26-0001)
    const formattedNumber = currentVal.toString().padStart(4, '0');
    const teamId = `${prefix}-${formattedNumber}`;

    // Increment counter for next registration
    await tx.sequenceCounter.update({
      where: { name: 'team_id' },
      data: { currentValue: currentVal + 1 },
    });

    return teamId;
  });
}
