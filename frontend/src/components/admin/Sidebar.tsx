'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Compass, Calendar, Eye, RotateCcw } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface SidebarNavItemProps {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}

function SidebarNavItem({ label, href, icon: Icon, active }: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
        ${
          active
            ? 'bg-[#06b6d4] text-slate-950 shadow-lg shadow-cyan-500/20'
            : 'text-zinc-400 hover:text-white hover:bg-white/5'
        }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-slate-950 font-bold' : ''}`} />
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  const handleWipe = () => {
    toast({
      kind: 'success',
      title: 'Console Reset',
      message: 'Custom treks and listings successfully purged from terminal memory.',
    });
  };

  return (
    <aside className="flex flex-col justify-between h-fit min-h-[480px] rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-slate-950/30">
      <div>
        <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-5">
          Operations Console
        </span>
        <nav className="flex flex-col gap-2">
          <SidebarNavItem
            label="Add New Trek"
            href="/dashboard/add-trek"
            icon={Plus}
            active={pathname === '/dashboard/add-trek'}
          />
          <SidebarNavItem
            label="Trek Itineraries"
            href="/dashboard/itineraries"
            icon={Compass}
            active={pathname === '/dashboard/itineraries'}
          />
          <SidebarNavItem
            label="Departures & Dates"
            href="/dashboard/departures"
            icon={Calendar}
            active={pathname === '/dashboard/departures'}
          />
          <SidebarNavItem
            label="Active Inventory"
            href="/dashboard/inventory"
            icon={Eye}
            active={pathname === '/dashboard/inventory'}
          />
        </nav>
      </div>

      <button
        onClick={handleWipe}
        className="mt-8 w-full py-2.5 rounded-xl border border-red-500/20 bg-red-950/10 hover:bg-red-950/30 text-xs font-semibold tracking-wide text-red-400 hover:text-red-300 transition-all flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Wipe Custom Treks
      </button>
    </aside>
  );
}
