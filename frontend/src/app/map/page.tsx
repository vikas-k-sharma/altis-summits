import MapWrapper from '@/components/MapWrapper';

export const metadata = {
  title: 'Expedition Map — Altis Summits',
  description: 'Interactive global map of our high-altitude expeditions.',
};

export default function MapPage() {
  return (
    <main className="pt-20">
      <div className="h-[calc(100vh-80px)] w-full relative z-0 border-t border-white/10">
        <MapWrapper />
      </div>
    </main>
  );
}
