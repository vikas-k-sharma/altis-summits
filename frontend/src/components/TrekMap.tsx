'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';

interface MapTrek {
  title: string;
  slug: string;
  latitude: number;
  longitude: number;
}

export default function TrekMap() {
  const [treks, setTreks] = useState<MapTrek[]>([]);

  useEffect(() => {
    // Fix Leaflet's default marker icons in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    const fetchMapData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/treks/map`);
        if (res.ok) {
          const data = await res.json();
          setTreks(data);
        }
      } catch (error) {
        console.error('Failed to fetch map data:', error);
      }
    };

    fetchMapData();
  }, []);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={[28.3, 84.0]} 
        zoom={6} 
        className="w-full h-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {treks.map((trek) => (
          <Marker key={trek.slug} position={[trek.latitude, trek.longitude]}>
            <Popup>
              <div className="text-center font-sans p-1">
                <h3 className="font-bold text-slate-900 mb-3 text-sm">{trek.title}</h3>
                <Link 
                  href={`/treks/${trek.slug}`}
                  className="inline-block px-4 py-2 bg-cyan-500 text-white font-bold rounded hover:bg-cyan-600 transition-colors text-xs"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
