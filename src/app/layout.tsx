import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EUREKA! – Road To Enterprise 2026 | Organized by ZeroTrace',
  description: 'Official event registration, entry pass management, and QR check-in portal for EUREKA! – Road To Enterprise 2026, organized by ZeroTrace.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#05070A] text-white antialiased selection:bg-[#147BFF] selection:text-white">
        {children}
      </body>
    </html>
  );
}
