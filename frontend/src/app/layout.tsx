import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Altis Summits — Curated High-Altitude Expeditions',
  description:
    'Bespoke journeys through the world\'s most formidable alpine landscapes. Premium, expert-led mountain expeditions with luxury logistics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen selection:bg-cyan-500/30">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
