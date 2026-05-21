import type { Metadata } from 'next';
import Link from 'next/link';
import Sidebar from '@/components/admin/Sidebar';
import DashboardStats from '@/components/admin/DashboardStats';

export const metadata: Metadata = {
  title: 'Command Dashboard — Altis Summits',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#030712] text-zinc-100 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <span className="text-[10px] tracking-[0.25em] font-bold text-cyan-400 uppercase block mb-1">
              High-Altitude Command Terminal
            </span>
            <h1 className="text-4xl md:text-5xl font-extralight tracking-tight text-white">
              Command <span className="font-bold">Dashboard</span>
            </h1>
          </div>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-800 text-xs font-semibold tracking-wide text-zinc-400 hover:text-white transition-all shadow-md"
          >
            Exit Terminal
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Console Grid */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Sidebar />
          <div className="min-w-0">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
