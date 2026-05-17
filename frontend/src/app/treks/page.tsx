import type { Metadata } from 'next';
import TrekCard from '@/components/TrekCard';
import FilterButton from '@/components/FilterButton';
import {
  type Trek,
  formatPrice,
  formatElevation,
  formatDuration,
  getTrekImage,
} from '@/lib/types';

export const metadata: Metadata = {
  title: 'All Expeditions — Altis Summits',
  description:
    'Browse our full catalogue of curated high-altitude expeditions across the Himalayas, Karakoram, Andes, and Alps.',
};

async function getAllTreks(): Promise<Trek[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/treks`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function TreksPage() {
  const treks = await getAllTreks();

  return (
    <div className="pt-40 pb-32 px-6 max-w-7xl mx-auto">
      <div className="mb-20">
        <h1 className="text-5xl md:text-7xl font-light tracking-tighter mb-8">
          All <span className="font-bold">Expeditions</span>
        </h1>
        <div className="flex flex-wrap gap-4 border-b border-white/10 pb-8">
          <FilterButton label="All Regions" active />
          <FilterButton label="Himalayas" />
          <FilterButton label="Karakoram" />
          <FilterButton label="Andes" />
          <FilterButton label="Alps" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-20 gap-x-12">
        {treks.map((trek) => (
          <TrekCard
            key={trek.slug}
            slug={trek.slug}
            name={trek.title}
            image={getTrekImage(trek.slug)}
            price={formatPrice(trek.basePrice)}
            elevation={formatElevation(trek.maxAltitudeMeters)}
            duration={formatDuration(trek.durationDays)}
            difficulty={trek.difficulty}
          />
        ))}
      </div>
    </div>
  );
}
