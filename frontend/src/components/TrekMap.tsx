'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { requestRescue, type RescueFacility } from '@/actions/emergency';
import { AlertTriangle, CheckCircle, PhoneCall, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MapTrek {
  title: string;
  slug: string;
  latitude: number;
  longitude: number;
}

type SOSState = 'IDLE' | 'LOCATING' | 'FOUND';

const UserMarkerIcon = new L.DivIcon({
  html: '<div class="w-4 h-4 bg-red-500 rounded-full animate-ping absolute top-0 left-0"></div><div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white absolute top-0 left-0"></div>',
  className: 'custom-user-marker relative',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function RescueVisualizer({ 
  userLocation, 
  facilityLocation 
}: { 
  userLocation: [number, number]; 
  facilityLocation: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (userLocation && facilityLocation) {
      map.fitBounds([userLocation, facilityLocation], { padding: [50, 50], animate: true });
    }
  }, [map, userLocation, facilityLocation]);

  return (
    <>
      <Marker position={userLocation} icon={UserMarkerIcon} />
      <Marker position={facilityLocation}>
        <Popup>Rescue Facility</Popup>
      </Marker>
      <Polyline 
        positions={[userLocation, facilityLocation]} 
        color="#ef4444" 
        dashArray="5, 10" 
        weight={3}
      />
    </>
  );
}

export default function TrekMap() {
  const [treks, setTreks] = useState<MapTrek[]>([]);
  const [sosState, setSosState] = useState<SOSState>('IDLE');
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const [facility, setFacility] = useState<RescueFacility | null>(null);

  useEffect(() => {
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

  const handleSOSClick = () => {
    setSosState('LOCATING');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setUserLoc([lat, lon]);

          try {
            const data = await requestRescue(lat, lon);
            setFacility(data);
            setSosState('FOUND');
          } catch (error) {
            console.error('Failed to request rescue:', error);
            alert('Failed to connect to rescue services. Please try again or use alternative comms.');
            setSosState('IDLE');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Could not determine your location. Please ensure location services are enabled.');
          setSosState('IDLE');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setSosState('IDLE');
    }
  };

  const handleDismiss = () => {
    setSosState('IDLE');
    setUserLoc(null);
    setFacility(null);
  };

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={[28.3, 84.0]} 
        zoom={6} 
        className="w-full h-full z-0"
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

        {sosState === 'FOUND' && userLoc && facility && (
          <RescueVisualizer 
            userLocation={userLoc} 
            facilityLocation={[facility.latitude, facility.longitude]} 
          />
        )}
      </MapContainer>

      {/* Floating UI Layer */}
      <div className="absolute top-6 right-6 z-[1000]">
        {sosState === 'IDLE' && (
          <motion.button 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={handleSOSClick}
            className="flex items-center gap-2 px-6 py-4 bg-red-600 text-white font-bold rounded-full shadow-2xl hover:bg-red-500 transition-colors border-2 border-red-400"
          >
            <AlertTriangle className="w-6 h-6 animate-pulse" />
            <span>EMERGENCY SOS</span>
          </motion.button>
        )}

        {sosState === 'LOCATING' && (
          <motion.button 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            disabled
            className="flex items-center gap-3 px-6 py-4 bg-zinc-900 text-zinc-300 font-bold rounded-full shadow-2xl border-2 border-zinc-700 cursor-not-allowed opacity-90"
          >
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
            <span>Acquiring GPS...</span>
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {sosState === 'FOUND' && facility && (
          <motion.div 
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-6 left-0 right-0 mx-auto w-full max-w-md z-[1000] px-6"
          >
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl shadow-red-900/20 backdrop-blur-xl">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Extraction Point Located</h3>
                    <p className="text-sm text-green-400 font-medium">Rescue teams notified</p>
                  </div>
                </div>
                <button 
                  onClick={handleDismiss}
                  className="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 mb-6 space-y-3">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 block mb-1">Facility</span>
                  <span className="text-base font-medium text-zinc-200 block">{facility.facilityName}</span>
                  <span className="text-xs text-zinc-400 block">{facility.facilityType}</span>
                </div>
                <div className="h-px w-full bg-white/10" />
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 block mb-1">Distance</span>
                  <span className="text-lg font-bold text-white">{(facility.distanceInMeters / 1000).toFixed(1)} km away</span>
                </div>
              </div>

              <a 
                href={`tel:${facility.contactNumber}`}
                className="w-full py-4 bg-red-600 text-white font-bold text-lg rounded-2xl hover:bg-red-500 transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-600/20"
              >
                <PhoneCall className="w-5 h-5" />
                Call Rescue Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
