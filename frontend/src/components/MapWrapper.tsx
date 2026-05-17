'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/TrekMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-950">
      <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
});

export default function MapWrapper() {
  return <Map />;
}
