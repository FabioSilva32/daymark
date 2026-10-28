import type { Metadata, Viewport } from 'next';
import './globals.css';
import { DaymarkProvider } from '@/context/DaymarkContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Daymark — Personal Command Centre',
  description: 'All-in-One Personal Operating System: Productivity, Health, Finances, Organisation & Everyday Utilities',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#000000] text-[#FFFFFF] min-h-screen antialiased selection:bg-[#E50914] selection:text-white font-sans">
        <DaymarkProvider>
          <AppShell>{children}</AppShell>
        </DaymarkProvider>
      </body>
    </html>
  );
}
