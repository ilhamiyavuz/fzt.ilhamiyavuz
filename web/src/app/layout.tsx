import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fizyoterapist Paneli',
  description: 'Türkçe fizyoterapi takip ve reçeteleme paneli',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
