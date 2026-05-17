'use client';

import { useState, useTransition } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Users, Calendar, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ItineraryDay, TrekDeparture } from '@/lib/types';
import { bookTrek } from '@/actions/auth';

interface DetailHeroProps {
  name: string;
  region: string;
  image: string;
  elevation: string;
  duration: string;
  price: string;
  overview: string;
  itinerary: ItineraryDay[];
  departures: TrekDeparture[];
  isLoggedIn: boolean;
}

export default function DetailHero({
  name,
  region,
  image,
  elevation,
  duration,
  price,
  overview,
  itinerary,
  departures,
  isLoggedIn,
}: DetailHeroProps) {
  const router = useRouter();
  const [selectedDepartureId, setSelectedDepartureId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  // Sort itinerary by dayNumber just to be safe
  const sortedItinerary = [...itinerary].sort((a, b) => a.dayNumber - b.dayNumber);

  const handleBookNow = () => {
    if (!selectedDepartureId) return;
    
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    startTransition(async () => {
      await bookTrek(selectedDepartureId);
    });
  };

  let buttonContent;
  let isButtonDisabled = isPending;

  const isSoldOut = departures.length === 0 || departures.every(d => d.availableSeats === 0 || d.status.toLowerCase() === 'full');

  if (isPending) {
    buttonContent = (
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full"
      />
    );
  } else if (isSoldOut) {
    buttonContent = 'Sold Out';
    isButtonDisabled = true;
  } else if (!selectedDepartureId) {
    buttonContent = 'Select a Date';
    isButtonDisabled = true;
  } else if (!isLoggedIn) {
    buttonContent = 'Log in to Book';
  } else {
    buttonContent = (
      <>
        Request Booking <ArrowRight className="w-5 h-5" />
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32"
    >
      {/* Detail Hero */}
      <section className="relative h-[70vh] flex items-end">
        <div className="absolute inset-0 z-0">
          <img
            src={image}
            className="w-full h-full object-cover"
            alt={name}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pb-20">
          <Link
            href="/treks"
            className="flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Expeditions
          </Link>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <span className="text-cyan-400 font-bold uppercase tracking-[0.3em] text-xs mb-4 block">
                {region}
              </span>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter">
                {name}
              </h1>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl flex gap-12">
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-1">
                  Max Elevation
                </span>
                <span className="text-2xl font-light">{elevation}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-1">
                  Duration
                </span>
                <span className="text-2xl font-light">{duration}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 mt-20 grid grid-cols-1 lg:grid-cols-3 gap-20">
        <div className="lg:col-span-2 space-y-16">
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
              Overview
            </h2>
            <p className="text-xl text-zinc-400 leading-relaxed font-light">
              {overview}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
              Itinerary
            </h2>
            
            {sortedItinerary.length > 0 ? (
              <div className="space-y-8">
                {sortedItinerary.map((day) => (
                  <div key={day.dayNumber} className="flex gap-8 group">
                    <span className="text-3xl font-light text-zinc-600 group-hover:text-cyan-400 transition-colors">
                      {String(day.dayNumber).padStart(2, '0')}
                    </span>
                    <div className="space-y-2 pb-8 border-b border-white/5 w-full">
                      <h4 className="text-lg font-semibold">
                        {day.title}
                      </h4>
                      <p className="text-zinc-500 text-sm leading-relaxed">
                        {day.description}
                      </p>
                      {(day.altitudeMeters > 0 || day.accommodationType) && (
                        <div className="flex gap-4 pt-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          {day.altitudeMeters > 0 && <span>Max: {day.altitudeMeters}m</span>}
                          {day.accommodationType && <span>Stay: {day.accommodationType}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex items-center gap-4 text-zinc-400">
                <Info className="w-5 h-5 text-cyan-400" />
                <p>Detailed day-by-day itinerary coming soon.</p>
              </div>
            )}
          </section>
        </div>

        {/* Sticky CTA */}
        <div className="relative">
          <div className="sticky top-32 bg-zinc-900 border border-white/10 p-10 rounded-3xl space-y-8 shadow-2xl shadow-cyan-500/5">
            <div>
              <span className="text-sm uppercase tracking-widest text-zinc-500 block mb-2">
                Expedition Cost
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{price}</span>
                <span className="text-zinc-500 font-medium">/ person</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Group Size
                </span>
                <span className="font-semibold text-white">4 - 8 people</span>
              </div>
              
              <div className="space-y-3">
                <span className="text-zinc-400 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" /> Available Dates
                </span>
                
                {departures.length > 0 ? (
                  <div className="space-y-2">
                    {departures.map((dep) => {
                      const isFull = dep.availableSeats === 0 || dep.status.toLowerCase() === 'full';
                      const isSelected = selectedDepartureId === dep.id;
                      
                      return (
                        <div 
                          key={dep.id} 
                          onClick={() => !isFull && setSelectedDepartureId(dep.id)}
                          className={`p-4 rounded-xl border flex flex-col gap-1 transition-colors ${
                            isFull 
                              ? 'bg-zinc-950/50 border-white/5 opacity-50 cursor-not-allowed' 
                              : isSelected
                                ? 'bg-cyan-500/10 border-cyan-500 cursor-pointer'
                                : 'bg-white/5 border-white/10 hover:border-cyan-500/50 hover:bg-white/10 cursor-pointer'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-white">
                              {new Date(dep.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(dep.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className={`text-xs font-bold uppercase ${isFull ? 'text-red-400' : 'text-cyan-400'}`}>
                              {isFull ? 'Full' : `${dep.availableSeats} Left`}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                            Status: {dep.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500 italic p-4 bg-white/5 rounded-xl border border-white/5">
                    No upcoming departures scheduled yet.
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleBookNow}
              className="w-full py-5 bg-cyan-500 text-slate-950 font-bold rounded-2xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isButtonDisabled}
            >
              {buttonContent}
            </button>
            <p className="text-[10px] text-center text-zinc-500 uppercase tracking-widest font-bold">
              Secure booking portal protected by Altis Guard
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
