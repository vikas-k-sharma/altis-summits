'use server';

import { cookies } from 'next/headers';

export interface RescueFacility {
  facilityName: string;
  facilityType: string;
  distanceInMeters: number;
  contactNumber: string;
  latitude: number;
  longitude: number;
}

export async function requestRescue(lat: number, lon: number): Promise<RescueFacility> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Unauthorized');
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/emergency/sos?lat=${lat}&lon=${lon}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Rescue request failed with status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Emergency SOS Error:', error);
    throw error;
  }
}
