import nodemailer from 'nodemailer';
import { prisma } from '@/lib/db';

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: Buffer | string; contentType?: string }>;
}) {
  let host = process.env.SMTP_HOST;
  let port = parseInt(process.env.SMTP_PORT || '587', 10);
  let user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS;
  let from = process.env.SMTP_FROM || 'ZeroTrace <noreply@zerotrace.org>';

  // Fallback to Database EventSettings if process.env is missing
  if (!host || !user || !pass) {
    try {
      const dbSettings = await prisma.eventSetting.findMany({
        where: { key: { in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'] } },
      });
      const map: Record<string, string> = {};
      dbSettings.forEach((s) => (map[s.key] = s.value));

      if (map.SMTP_HOST) host = map.SMTP_HOST;
      if (map.SMTP_PORT) port = parseInt(map.SMTP_PORT, 10);
      if (map.SMTP_USER) user = map.SMTP_USER;
      if (map.SMTP_PASS) pass = map.SMTP_PASS;
      if (map.SMTP_FROM) from = map.SMTP_FROM;
    } catch (e) {
      console.error('Error loading DB SMTP settings:', e);
    }
  }

  if (!host || !user || !pass) {
    console.log('\n📧 [EMAIL SIMULATOR - DEV MODE]');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${html.replace(/<[^>]*>?/gm, '')}`);
    if (attachments) {
      console.log(`Attachments: ${attachments.map((a) => a.filename).join(', ')}`);
    }
    console.log('--------------------------------------------------\n');
    return { success: true, simulated: true, error: 'SMTP credentials not configured. Email simulated.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      attachments,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message || 'SMTP transport error' };
  }
}
