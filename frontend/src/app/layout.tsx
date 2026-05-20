import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Header } from '@/components/header';

export const metadata: Metadata = {
  title: 'Primetrade — Trade Journal',
  description: 'A small trade journal app, built for the Primetrade assignment.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        <AuthProvider>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
