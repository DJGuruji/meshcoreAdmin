import './globals.css';
import type { Metadata } from 'next';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';

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
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}