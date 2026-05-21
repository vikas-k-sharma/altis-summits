'use server';

import { cookies } from 'next/headers';

export interface CreateTrekState {
  status: 'idle' | 'success' | 'error';
  message: string;
  trek?: {
    id?: number;
    title?: string;
    slug?: string;
  };
}

const REQUIRED_FIELDS = [
  'title',
  'description',
  'durationDays',
  'price',
  'difficulty',
  'region',
  'startLat',
  'startLon',
  'maxAltitudeMeters',
];

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

export async function createTrek(
  _prevState: CreateTrekState,
  formData: FormData
 ): Promise<CreateTrekState> {
  const missingField = REQUIRED_FIELDS.find((field) => !readString(formData, field));

  if (missingField) {
    return {
      status: 'error',
      message:
        missingField === 'startLat' || missingField === 'startLon'
          ? 'Choose a start location on the map before publishing.'
          : 'Complete all required trek fields before publishing.',
    };
  }

  const payload = {
    title: readString(formData, 'title'),
    description: readString(formData, 'description'),
    durationDays: Number(readString(formData, 'durationDays')),
    price: Number(readString(formData, 'price')),
    difficulty: readString(formData, 'difficulty'),
    region: readString(formData, 'region'),
    startLat: Number(readString(formData, 'startLat')),
    startLon: Number(readString(formData, 'startLon')),
    maxAltitudeMeters: Number(readString(formData, 'maxAltitudeMeters')),
  };

  if (
    !Number.isFinite(payload.durationDays) ||
    !Number.isFinite(payload.price) ||
    !Number.isFinite(payload.startLat) ||
    !Number.isFinite(payload.startLon) ||
    !Number.isFinite(payload.maxAltitudeMeters)
  ) {
    return {
      status: 'error',
      message: 'Duration, price, latitude, longitude, and max altitude must be valid numbers.',
    };
  }

  const token = (await cookies()).get('token')?.value;

  if (!token) {
    return {
      status: 'error',
      message: 'You must be signed in as an admin to create a trek.',
    };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/treks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let message = `Trek creation failed with status ${res.status}.`;

      try {
        const errorBody = await res.json();
        message = errorBody.message ?? errorBody.error ?? message;
      } catch {
        const text = await res.text();
        message = text || message;
      }

      return { status: 'error', message };
    }

    const trek = await res.json();

    return {
      status: 'success',
      message: `${trek.title ?? payload.title} has been added to the trek catalog.`,
      trek: {
        id: trek.id,
        title: trek.title,
        slug: trek.slug,
      },
    };
  } catch (error) {
    console.error('Create trek error:', error);
    return {
      status: 'error',
      message: 'Unable to reach the trek service. Please try again.',
    };
  }
}
