import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Organa',
  description: 'One platform for all your businesses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
