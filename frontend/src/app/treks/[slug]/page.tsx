import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import DetailHero from '@/components/DetailHero';
import {
  type Trek,
  type TrekDeparture,
  formatPrice,
  formatElevation,
  formatDuration,
  getTrekImage,
} from '@/lib/types';

async function getTrek(slug: string): Promise<Trek | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/treks/${slug}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getDepartures(trekId: number): Promise<TrekDeparture[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/treks/${trekId}/departures`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trek = await getTrek(slug);

  if (!trek) {
    return { title: 'Trek Not Found — Altis Summits' };
  }

  return {
    title: `${trek.title} — Altis Summits`,
    description: `Join our ${formatDuration(trek.durationDays)} expedition to ${trek.title} in the ${trek.region}. Max elevation ${formatElevation(trek.maxAltitudeMeters)}. Starting at ${formatPrice(trek.basePrice)}.`,
  };
}

export default async function TrekDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trek = await getTrek(slug);

  if (!trek) {
    notFound();
  }

  const departures = await getDepartures(trek.id);

  const overview = `This expedition takes you through the heart of the ${trek.region}, offering unparalleled views of some of the highest peaks on Earth. Designed for experienced trekkers who demand both challenge and sophistication.`;

  return (
    <DetailHero
      name={trek.title}
      region={trek.region}
      image={getTrekImage(trek.slug)}
      elevation={formatElevation(trek.maxAltitudeMeters)}
      duration={formatDuration(trek.durationDays)}
      price={formatPrice(trek.basePrice)}
      overview={overview}
      itinerary={trek.itinerary || []}
      departures={departures || []}
    />
  );
}
