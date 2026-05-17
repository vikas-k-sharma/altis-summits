export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <div className="text-xl font-bold tracking-tighter mb-6">
            ALTIS SUMMITS
          </div>
          <p className="text-zinc-400 max-w-sm mb-8 leading-relaxed">
            Curated high-altitude expeditions for the modern explorer. Experience
            the raw beauty of the world&apos;s most formidable peaks with
            expert-led logistics and premium comfort.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest mb-6">
            Explore
          </h4>
          <div className="space-y-4 text-zinc-400 text-sm">
            <p className="hover:text-white cursor-pointer transition-colors">
              Himalayas
            </p>
            <p className="hover:text-white cursor-pointer transition-colors">
              Karakoram
            </p>
            <p className="hover:text-white cursor-pointer transition-colors">
              Andes
            </p>
            <p className="hover:text-white cursor-pointer transition-colors">
              Alps
            </p>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest mb-6">
            Connect
          </h4>
          <div className="space-y-4 text-zinc-400 text-sm">
            <p className="hover:text-white cursor-pointer transition-colors">
              Instagram
            </p>
            <p className="hover:text-white cursor-pointer transition-colors">
              Expedition Log
            </p>
            <p className="hover:text-white cursor-pointer transition-colors">
              Contact
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
