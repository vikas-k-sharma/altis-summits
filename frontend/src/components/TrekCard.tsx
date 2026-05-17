'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Clock, Mountain } from 'lucide-react';

interface TrekCardProps {
  slug: string;
  name: string;
  image: string;
  price: string;
  elevation: string;
  duration: string;
  difficulty: string;
}

export default function TrekCard({
  slug,
  name,
  image,
  price,
  elevation,
  duration,
  difficulty,
}: TrekCardProps) {
  return (
    <motion.div whileHover={{ y: -10 }} className="group cursor-pointer">
      <Link href={`/treks/${slug}`}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-6">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-colors" />
          <div className="absolute top-4 right-4 px-3 py-1 bg-slate-950/60 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
            {elevation}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h4 className="text-xl font-semibold tracking-tight">{name}</h4>
            <span className="text-cyan-400 font-bold">{price}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500 uppercase tracking-widest font-semibold">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {duration}
            </span>
            <span className="flex items-center gap-1">
              <Mountain className="w-3 h-3" /> {difficulty}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
