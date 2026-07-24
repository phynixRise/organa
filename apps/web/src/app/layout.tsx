import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Organa',
  description: 'Une plateforme pour toutes vos entreprises',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-[#0A0A0F] text-[#F8F8F2] antialiased font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
