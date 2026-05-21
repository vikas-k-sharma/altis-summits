'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Mountain, Menu, X } from 'lucide-react';
import { logoutUser } from '@/actions/auth';

function NavItem({
  label,
  href,
  active,
}: {
  label: string;
  href?: string;
  active?: boolean;
}) {
  const inner = (
    <span
      className={`text-sm font-medium tracking-wide transition-colors relative group py-2 cursor-pointer
        ${active ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
    >
      {label}
      <span
        className={`absolute bottom-0 left-0 w-full h-px bg-cyan-400 transition-transform origin-left
        ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
      />
    </span>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}

export default function Navbar({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      id="main-nav"
      className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tighter flex items-center gap-2 group"
        >
          <div className="w-8 h-8 bg-cyan-500 rounded-sm rotate-45 flex items-center justify-center transition-transform group-hover:rotate-90">
            <Mountain className="w-5 h-5 text-slate-950 -rotate-45 group-hover:-rotate-90 transition-transform" />
          </div>
          <span>ALTIS SUMMITS</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <NavItem
            label="Expeditions"
            href="/treks"
            active={pathname.startsWith('/treks')}
          />
          <NavItem label="Regions" />
          {isLoggedIn && (
            <NavItem
              label="Admin Portal"
              href="/dashboard/add-trek"
              active={pathname.startsWith('/dashboard')}
            />
          )}
          {isLoggedIn ? (
            <button 
              onClick={() => logoutUser()}
              className="text-sm font-medium tracking-wide text-zinc-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <Link 
              href="/login"
              className="text-sm font-medium tracking-wide text-zinc-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          )}
          <Link
            href="/treks"
            className="px-6 py-2 bg-white text-slate-950 text-sm font-semibold rounded-full hover:bg-cyan-400 transition-colors"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-md px-6 py-6 space-y-4">
          <Link
            href="/treks"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Expeditions
          </Link>
          <span className="block text-sm font-medium text-zinc-500 cursor-default">
            Regions
          </span>
          {isLoggedIn && (
            <Link
              href="/dashboard/add-trek"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Admin Portal
            </Link>
          )}
          {isLoggedIn ? (
            <button
              onClick={() => logoutUser()}
              className="block text-sm font-medium text-zinc-300 hover:text-white transition-colors text-left"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          )}
          <Link
            href="/treks"
            onClick={() => setMobileOpen(false)}
            className="inline-block mt-2 px-6 py-2 bg-white text-slate-950 text-sm font-semibold rounded-full hover:bg-cyan-400 transition-colors"
          >
            Book Now
          </Link>
        </div>
      )}
    </nav>
  );
}
