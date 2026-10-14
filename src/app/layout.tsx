import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'Vajra Stone & Pebble Management ERP | Quarry & Trading System',
  description: 'Enterprise resource planning software for Indian quarry operations, pebble trading, lorry transport logistics, and load-wise profit management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="min-h-full flex flex-col font-sans antialiased text-slate-900">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
