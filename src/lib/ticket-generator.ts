import { jsPDF } from 'jspdf';
import { generateQrCodeDataUrl } from './qrcode';

export interface TicketData {
  teamId: string;
  name: string;
  college: string;
  leaderName: string;
  memberCount: number;
  status: string;
  verificationToken: string;
  eventName?: string;
  organizer?: string;
}

export async function generateTicketPdf(data: TicketData): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [105, 148], // A6 Pass Size
  });

  const eventName = data.eventName || 'EUREKA! – Road To Enterprise 2026';
  const organizer = data.organizer || 'ZeroTrace';
  const qrDataUrl = await generateQrCodeDataUrl(data.verificationToken);

  // Background: Deep Navy (#05070A / #071426)
  doc.setFillColor(5, 7, 10); // #05070A
  doc.rect(0, 0, 105, 148, 'F');

  // Header Banner Card (#071426)
  doc.setFillColor(7, 20, 38); // #071426
  doc.roundedRect(4, 4, 97, 28, 3, 3, 'F');
  
  // Electric Blue Accent Line
  doc.setFillColor(20, 123, 255); // #147BFF
  doc.rect(4, 30, 97, 2, 'F');

  // Brand Header
  doc.setTextColor(20, 123, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`ORGANIZED BY ${organizer.toUpperCase()}`, 52.5, 11, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('EUREKA!', 52.5, 18, { align: 'center' });

  doc.setTextColor(170, 180, 195);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Road To Enterprise 2026', 52.5, 23, { align: 'center' });

  // Entry Pass Badge Container
  doc.setFillColor(11, 31, 58); // #0B1F3A
  doc.roundedRect(4, 35, 97, 12, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('OFFICIAL ENTRY PASS', 52.5, 42.5, { align: 'center' });

  // Team ID Prominent Box
  doc.setFillColor(20, 123, 255);
  doc.roundedRect(12, 50, 81, 14, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('TEAM IDENTIFIER', 52.5, 54.5, { align: 'center' });
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(data.teamId, 52.5, 61, { align: 'center' });

  // Details Box Container
  doc.setFillColor(8, 22, 41);
  doc.roundedRect(4, 67, 97, 36, 2, 2, 'F');
  doc.setDrawColor(30, 41, 59);
  doc.roundedRect(4, 67, 97, 36, 2, 2, 'S');

  // Key/Value Details
  const startY = 73;
  const lineHeight = 6.5;

  const details = [
    { label: 'Team Name:', value: data.name },
    { label: 'Institution:', value: data.college },
    { label: 'Team Leader:', value: data.leaderName },
    { label: 'Total Members:', value: `${data.memberCount} Members` },
    { label: 'Pass Status:', value: data.status.toUpperCase() },
  ];

  details.forEach((item, idx) => {
    const y = startY + idx * lineHeight;
    doc.setTextColor(170, 180, 195);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(item.label, 8, y);

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    if (item.label === 'Pass Status:') {
      doc.setTextColor(34, 197, 94); // Green for CONFIRMED
      doc.setFont('helvetica', 'bold');
    }
    const truncatedVal = item.value.length > 32 ? item.value.substring(0, 30) + '...' : item.value;
    doc.text(truncatedVal, 36, y);
  });

  // QR Code Section
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(36.5, 106, 32, 32, 2, 2, 'F');
  doc.addImage(qrDataUrl, 'PNG', 37.5, 107, 30, 30);

  doc.setTextColor(170, 180, 195);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('SCAN TO VERIFY ENTRY AT VENUE', 52.5, 142, { align: 'center' });

  // Security Footer Watermark
  doc.setFontSize(5.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`SECURITY TOKEN: ${data.verificationToken.substring(0, 16)}...`, 52.5, 146, { align: 'center' });

  return doc;
}
