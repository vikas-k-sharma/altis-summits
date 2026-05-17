'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface FeaturedSectionProps {
  children: ReactNode;
}

export default function FeaturedSection({ children }: FeaturedSectionProps) {
  return (
    <section className="py-32 px-6 bg-zinc-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
              Featured <span className="font-bold">Regions</span>
            </h2>
            <p className="text-zinc-400">
              The most sought-after routes of the season.
            </p>
          </div>
          <Link
            href="/treks"
            className="hidden md:flex items-center gap-2 text-cyan-400 font-semibold hover:text-white transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{children}</div>
      </div>
    </section>
  );
}
