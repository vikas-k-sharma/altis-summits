'use client';

import { motion } from 'motion/react';
import { ArrowRight, Star, Users, Wind } from 'lucide-react';
import Link from 'next/link';

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-3xl font-light tracking-tighter text-white">
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
        {label}
      </span>
    </div>
  );
}

export default function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-20"
    >
      {/* Hero */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2600"
            className="w-full h-full object-cover opacity-60"
            alt="Mountain panorama"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl"
          >
            <span className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
              Exclusive Expeditions 2026/27
            </span>
            <h1 className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.9] mb-8">
              Purity in <br />
              <span className="font-bold italic">Elevation</span>
            </h1>
            <p className="text-xl text-zinc-300 mb-10 max-w-lg leading-relaxed font-light">
              We define the pinnacle of mountain adventure. Bespoke journeys
              through the world&apos;s most formidable alpine landscapes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/treks"
                className="px-10 py-5 bg-white text-slate-950 font-bold rounded-full hover:bg-cyan-400 transition-all transform hover:scale-105 flex items-center gap-2"
              >
                Explore Expeditions <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="px-10 py-5 border border-white/20 rounded-full hover:bg-white/5 transition-colors font-medium">
                Our Philosophy
              </button>
            </div>
          </motion.div>
        </div>

        {/* Stats Strip */}
        <div className="absolute bottom-0 left-0 w-full border-t border-white/10 bg-slate-950/50 backdrop-blur-sm py-8 px-6 hidden md:block">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <HeroStat label="Active Summits" value="12" />
            <HeroStat label="Expert Guides" value="34" />
            <HeroStat label="Summit Rate" value="92%" />
            <HeroStat label="Safe Days" value="4.2k" />
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <div className="w-12 h-12 flex items-center justify-center bg-cyan-500/10 rounded-xl">
              <Star className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Luxury Logistics
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              High-altitude doesn&apos;t mean low comfort. Premium base camps,
              heated tents, and chef-curated nutrition.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 flex items-center justify-center bg-cyan-500/10 rounded-xl">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Small Groups
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Intimate experiences capped at 8 climbers. Personalized attention
              and faster, safer movement in the mountains.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 flex items-center justify-center bg-cyan-500/10 rounded-xl">
              <Wind className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Weather Intelligence
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Real-time satellite tracking and dedicated meteorological support
              for every single team on the mountain.
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
