import './globals.css';
import type { Metadata } from 'next';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';
import Header from '@/components/Header';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin Dashboard for System Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased bg-linear-to-br from-black min-h-screen text-white`}>
        <SessionProviderWrapper>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="grow">
              {children}
            </main>
          </div>
          <Toaster position="top-right" richColors />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}