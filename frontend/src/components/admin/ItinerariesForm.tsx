'use client';

import { useState, useEffect } from 'react';
import { Loader2, Compass, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast, Toaster } from '@/components/ui/toast';
import type { ItineraryDay, Trek } from '@/lib/types';

const INITIAL_TREKS = [
  { slug: 'everest-circuit', title: 'Everest Circuit' },
  { slug: 'annapurna-sanctuary', title: 'Annapurna Sanctuary' },
  { slug: 'k2-base-camp', title: 'K2 Base Camp' },
];

const PRE_POPULATED_DAYS: ItineraryDay[] = [
  {
    dayNumber: 1,
    title: 'Flight to Lukla & Trek to Phakding',
    description: 'Thrilling flight to Lukla and immediate short descent and river-walk to Phakding.',
    altitudeMeters: 2610,
    accommodationType: 'Teahouse',
  },
  {
    dayNumber: 2,
    title: 'Namche Bazaar Climb',
    description: 'Ascend through pine forest, crossing high suspension bridges to the Sherpa capital Namche.',
    altitudeMeters: 3440,
    accommodationType: 'Teahouse',
  },
  {
    dayNumber: 3,
    title: 'Namche Acclimatization Day',
    description: 'Hike to Everest View Hotel for stunning panoramas of Ama Dablam, Lhotse and Everest.',
    altitudeMeters: 3880,
    accommodationType: 'Teahouse',
  },
  {
    dayNumber: 4,
    title: 'Namche to Tengboche',
    description: 'Scenic trail descending to Phunki Tenga, then a steep climb to the spiritual monastery at Tengboche.',
    altitudeMeters: 3860,
    accommodationType: 'Teahouse',
  },
  {
    dayNumber: 5,
    title: 'Tengboche to Dingboche',
    description: 'Ascend higher past Pangboche to the high stone-walled farming village of Dingboche.',
    altitudeMeters: 4410,
    accommodationType: 'Teahouse',
  },
];

export default function ItinerariesForm() {
  const [treks, setTreks] = useState<{ slug: string; title: string }[]>(INITIAL_TREKS);
  const [selectedTrek, setSelectedTrek] = useState('everest-circuit');
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>(PRE_POPULATED_DAYS);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pending, setPending] = useState(false);

  // Load treks from database to populate dropdown dynamically
  useEffect(() => {
    async function loadTreks() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/treks`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map((t: Trek) => ({
              slug: t.slug,
              title: t.title,
            }));
            setTreks(formatted);
            setSelectedTrek(formatted[0].slug);
          }
        }
      } catch (err) {
        console.error('Failed to load treks:', err);
      }
    }
    loadTreks();
  }, []);

  const handleAppendPhase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim() || !description.trim()) {
      toast({
        kind: 'error',
        title: 'Validation Error',
        message: 'Please complete the phase title and tactical guidance description.',
      });
      return;
    }

    const newDay: ItineraryDay = {
      dayNumber: itineraryDays.length + 1,
      title: milestoneTitle.trim(),
      description: description.trim(),
      altitudeMeters: 0,
      accommodationType: 'Camp',
    };

    setItineraryDays([...itineraryDays, newDay]);
    setMilestoneTitle('');
    setDescription('');

    toast({
      kind: 'success',
      title: 'Milestone Added',
      message: `Day ${newDay.dayNumber} appended to the course itinerary.`,
    });
  };

  const handleDeleteDay = (indexToDelete: number) => {
    const filtered = itineraryDays.filter((_, idx) => idx !== indexToDelete);
    // Re-sequence day numbers
    const resequenced = filtered.map((day, idx) => ({
      ...day,
      dayNumber: idx + 1,
    }));
    setItineraryDays(resequenced);

    toast({
      kind: 'success',
      title: 'Milestone Removed',
      message: 'Expedition milestones re-indexed successfully.',
    });
  };

  const handleSaveItinerary = async () => {
    setPending(true);
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPending(false);

    toast({
      kind: 'success',
      title: 'Course Itinerary Saved',
      message: `All ${itineraryDays.length} milestones successfully linked to ${
        treks.find((t) => t.slug === selectedTrek)?.title || selectedTrek
      }.`,
    });
  };

  return (
    <>
      <Toaster />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)]">
        {/* Left Column - Append Milestones Form */}
        <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-slate-950/30">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">Append Expedition Milestones</h1>
            <p className="mt-1 text-xs text-zinc-400">
              Create progressive acclimatization, high camps, and strategic summit phases.
            </p>
          </div>

          <form onSubmit={handleAppendPhase} className="grid gap-5">
            <label className="block">
              <span className="mb-2 block text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                Target Expedition
              </span>
              <Select
                name="targetTrek"
                value={selectedTrek}
                onChange={(e) => setSelectedTrek(e.target.value)}
                required
              >
                {treks.map((trek) => (
                  <option key={trek.slug} value={trek.slug}>
                    {trek.title}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                Target Day
              </span>
              <div className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-zinc-400 text-sm font-semibold cursor-not-allowed select-none">
                Day {itineraryDays.length + 1} (Auto-Incremented)
              </div>
              <span className="mt-1.5 block text-[10px] italic text-zinc-500">
                Altis systems automatically bind days sequentially.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                Phase Milestone Title
              </span>
              <Input
                type="text"
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
                placeholder="e.g. Ascent to High Camp III"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                Tactical Guidance Description
              </span>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Establish camp criteria, medical checkups, and terrain advice..."
                rows={4}
                required
              />
            </label>

            <Button
              type="submit"
              className="mt-2 w-full py-4 bg-[#06b6d4] hover:bg-[#0891b2] text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/10 cursor-pointer"
            >
              + Append Phase Day
            </Button>
          </form>
        </section>

        {/* Right Column - Milestone Timeline Preview */}
        <aside className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-slate-950/30 flex flex-col justify-between">
          <div>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Milestone Timeline Preview</h2>
                <p className="mt-1 text-xs text-zinc-400">Live manifest feed of the active course itinerary.</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <Compass className="h-5 w-5" />
              </div>
            </div>

            {/* Timeline scroll area */}
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
              {itineraryDays.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-xl p-6 bg-white/5">
                  <span className="text-zinc-500 text-xs block">No milestones added yet.</span>
                  <span className="text-zinc-600 text-[10px] block mt-1">
                    Fill the console to append course phases.
                  </span>
                </div>
              ) : (
                itineraryDays.map((day, idx) => (
                  <div key={idx} className="relative pl-8 group">
                    {/* Vertical connecting line */}
                    {idx < itineraryDays.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-[-16px] w-[1px] bg-white/10 group-hover:bg-cyan-500/30 transition-colors" />
                    )}

                    {/* Circular Day Badge */}
                    <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full border border-[#06b6d4]/50 bg-slate-950 text-[11px] font-bold text-cyan-300 flex items-center justify-center shadow-md shadow-cyan-500/5 group-hover:border-[#06b6d4] transition-colors">
                      {day.dayNumber}
                    </div>

                    {/* Timeline Content Block */}
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4 pl-5 transition-all group-hover:bg-white/[0.08] relative">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-zinc-100 line-clamp-1">
                          {day.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleDeleteDay(idx)}
                          className="text-zinc-500 hover:text-red-400 transition-colors"
                          aria-label="Delete milestone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="mt-1.5 text-[10px] leading-relaxed text-zinc-400">
                        {day.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSaveItinerary}
            disabled={pending || itineraryDays.length === 0}
            className="mt-6 w-full py-4 border border-[#06b6d4]/30 bg-cyan-950/10 hover:bg-cyan-950/30 text-cyan-400 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {pending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving Itinerary
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Save Itinerary Details
              </>
            )}
          </Button>
        </aside>
      </div>
    </>
  );
}
