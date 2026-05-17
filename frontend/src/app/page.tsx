import type { Metadata } from 'next';
import HeroSection from '@/components/HeroSection';
import FeaturedSection from '@/components/FeaturedSection';
import TrekCard from '@/components/TrekCard';
import {
  type Trek,
  formatPrice,
  formatElevation,
  formatDuration,
  getTrekImage,
} from '@/lib/types';

export const metadata: Metadata = {
  title: 'Altis Summits — Purity in Elevation',
  description:
    'We define the pinnacle of mountain adventure. Explore curated high-altitude expeditions across the Himalayas, Karakoram, and beyond.',
};

async function getFeaturedTreks(): Promise<Trek[]> {
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

export default async function HomePage() {
  const treks = await getFeaturedTreks();
  // Show up to 3 featured treks
  const featured = treks.slice(0, 3);

  return (
    <>
      <HeroSection />

      <FeaturedSection>
        {featured.map((trek) => (
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
      </FeaturedSection>
    </>
  );
}
