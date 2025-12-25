import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import Navbar from '@/components/Navbar';
import SessionProvider from '@/components/SessionProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'RCCIIT SWC | Student Welfare Committee',
    template: '%s | RCCIIT SWC',
  },
  description: 'Official admin panel for RCCIIT Student Welfare Committee - Manage events, registrations, and access control',
  keywords: ['RCCIIT', 'SWC', 'Student Welfare Committee', 'Events', 'Admin Panel'],
  authors: [{ name: 'RCCIIT SWC' }],
  openGraph: {
    title: 'RCCIIT SWC | Student Welfare Committee',
    description: 'Official admin panel for RCCIIT Student Welfare Committee',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider />
        <Navbar />
        <div className="pt-[73px]">{children}</div>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
