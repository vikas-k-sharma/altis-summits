export interface ItineraryDay {
  dayNumber: number;
  title: string;
  description: string;
  altitudeMeters: number;
  accommodationType: string;
}

export interface TrekDeparture {
  id: number;
  startDate: string;
  endDate: string;
  totalSeats: number;
  availableSeats: number;
  status: string;
}

/** API response interface matching the backend contract */
export interface Trek {
  id: number;
  slug: string;
  title: string;
  region: string;
  difficulty: string;
  durationDays: number;
  maxAltitudeMeters: number;
  basePrice: number;
  itinerary: ItineraryDay[];
}

/** Placeholder image map keyed by slug, falls back to a default */
export const TREK_IMAGES: Record<string, string> = {
  'k2-base-camp':
    'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80&w=1200',
  'everest-circuit':
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
  'annapurna-sanctuary':
    'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&q=80&w=1200',
};

export const DEFAULT_TREK_IMAGE =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200';

/** Format a number as USD currency */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(cents);
}

/** Format meters with comma separators */
export function formatElevation(meters: number): string {
  return `${meters.toLocaleString('en-US')}m`;
}

/** Format duration days */
export function formatDuration(days: number): string {
  return `${days} Days`;
}

/** Get the placeholder image for a trek */
export function getTrekImage(slug: string): string {
  return TREK_IMAGES[slug] ?? DEFAULT_TREK_IMAGE;
}
