'use client';

import { useState, useEffect } from 'react';
import { Loader2, Compass, Trash2, Check, Plus, AlertCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast, Toaster } from '@/components/ui/toast';
import type { ItineraryDay } from '@/lib/types';
import { getTrekOptions, getItineraryDays, saveItineraryDays, type TrekOption } from '@/actions/admin';

const ACCOMMODATION_OPTIONS = [
  { value: 'Teahouse', label: 'Teahouse' },
  { value: 'Tent', label: 'Tent' },
  { value: 'Lodge', label: 'Lodge' },
  { value: 'Guesthouse', label: 'Guesthouse' },
  { value: 'Hotel', label: 'Hotel' },
  { value: 'Camp', label: 'Camp' },
  { value: 'Mountain Hut', label: 'Mountain Hut' },
];

export default function ItinerariesForm() {
  const [treks, setTreks] = useState<TrekOption[]>([]);
  const [selectedTrek, setSelectedTrek] = useState('');
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [loadingDays, setLoadingDays] = useState(false);

  // 1. Fetch trek options on mount and select the first one
  useEffect(() => {
    async function loadTreks() {
      setLoadingDays(true);
      try {
        const options = await getTrekOptions();
        setTreks(options);
        if (options.length > 0) {
          setSelectedTrek(options[0].slug);
        }
      } catch (err) {
        console.error('Failed to load treks:', err);
        toast({
          kind: 'error',
          title: 'Database Connection Error',
          message: 'Unable to retrieve trek dropdown options from the database.',
        });
      } finally {
        setLoadingDays(false);
      }
    }
    loadTreks();
  }, []);

  // 2. Fetch itinerary days when selectedTrek changes
  useEffect(() => {
    if (!selectedTrek) return;

    async function loadItinerary() {
      setLoadingDays(true);
      setErrors([]);
      try {
        const days = await getItineraryDays(selectedTrek);
        // Ensure chronological ordering by default day number
        const sorted = [...days].sort((a, b) => a.dayNumber - b.dayNumber);
        setItineraryDays(sorted);
      } catch (err) {
        console.error('Failed to load itinerary:', err);
        toast({
          kind: 'error',
          title: 'Database Load Error',
          message: `Unable to retrieve itinerary days for the trek: ${selectedTrek}.`,
        });
      } finally {
        setLoadingDays(false);
      }
    }
    loadItinerary();
  }, [selectedTrek]);

  // 3. Handle inline editing of fields inside the repeatable cards
  const handleFieldChange = (index: number, field: keyof ItineraryDay, value: any) => {
    const updated = [...itineraryDays];
    
    // Parse numeric fields properly
    let parsedValue = value;
    if (field === 'dayNumber') {
      parsedValue = value === '' ? '' : parseInt(value, 10);
    } else if (field === 'altitudeMeters') {
      parsedValue = value === '' ? '' : parseInt(value, 10);
    }

    updated[index] = {
      ...updated[index],
      [field]: parsedValue,
    };
    setItineraryDays(updated);
  };

  // 4. Add a new row to the timeline
  const handleAddRow = () => {
    // Generate a default progressive day number
    const nextDayNum = itineraryDays.length > 0
      ? Math.max(...itineraryDays.map(d => typeof d.dayNumber === 'number' ? d.dayNumber : 0)) + 1
      : 1;

    const newDay: ItineraryDay = {
      dayNumber: nextDayNum,
      title: '',
      description: '',
      altitudeMeters: 0,
      accommodationType: 'Teahouse',
    };

    setItineraryDays([...itineraryDays, newDay]);
    toast({
      kind: 'success',
      title: 'Row Added',
      message: `Appended Day ${newDay.dayNumber} placeholder to the workspace.`,
    });
  };

  // 5. Delete a specific day row
  const handleDeleteRow = (indexToDelete: number) => {
    const deletedDay = itineraryDays[indexToDelete]?.dayNumber;
    const updated = itineraryDays.filter((_, idx) => idx !== indexToDelete);
    setItineraryDays(updated);

    toast({
      kind: 'success',
      title: 'Row Removed',
      message: `Deleted day row ${deletedDay || indexToDelete + 1} from your active workspace.`,
    });
  };

  // 6. Validation before submitting
  const validateItinerary = (days: ItineraryDay[]): string[] => {
    const errs: string[] = [];
    const dayNumbers = new Set<number>();

    days.forEach((day, idx) => {
      const label = `Milestone Card #${idx + 1}`;

      // dayNumber checks
      if (day.dayNumber === undefined || day.dayNumber === null || (day.dayNumber as any) === '' || isNaN(day.dayNumber)) {
        errs.push(`${label}: Day Number is required.`);
      } else if (day.dayNumber <= 0) {
        errs.push(`${label}: Day Number must be a positive integer (> 0).`);
      } else if (dayNumbers.has(day.dayNumber)) {
        errs.push(`${label}: Duplicate Day Number ${day.dayNumber} detected. Each day must be unique.`);
      } else {
        dayNumbers.add(day.dayNumber);
      }

      // title checks
      if (!day.title || !day.title.trim()) {
        errs.push(`${label}: Title is required.`);
      }

      // altitudeMeters checks
      if (day.altitudeMeters === undefined || day.altitudeMeters === null || (day.altitudeMeters as any) === '' || isNaN(day.altitudeMeters)) {
        errs.push(`${label}: Elevation (altitude) is required.`);
      } else if (day.altitudeMeters < 0) {
        errs.push(`${label}: Elevation (altitude) cannot be negative.`);
      }
    });

    return errs;
  };

  // 7. Save entire itinerary using the PUT endpoint
  const handleSaveItinerary = async () => {
    const validationErrors = validateItinerary(itineraryDays);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast({
        kind: 'error',
        title: 'Validation Failure',
        message: 'Verify all card parameters. Correct duplicate day indices or empty title fields.',
      });
      return;
    }

    setErrors([]);
    setPending(true);

    try {
      const res = await saveItineraryDays(selectedTrek, itineraryDays);
      if (res.status === 'success') {
        toast({
          kind: 'success',
          title: 'Expedition Route Synchronized',
          message: res.message,
        });
        if (res.data) {
          // Sync with clean API response data
          const sorted = [...res.data].sort((a, b) => a.dayNumber - b.dayNumber);
          setItineraryDays(sorted);
        }
      } else {
        toast({
          kind: 'error',
          title: 'Database Synchronization Failed',
          message: res.message,
        });
        setErrors([res.message]);
      }
    } catch (err) {
      console.error('Save error:', err);
      toast({
        kind: 'error',
        title: 'Save Operation Aborted',
        message: 'Could not connect to the itinerary service. Please verify server status.',
      });
    } finally {
      setPending(false);
    }
  };

  const activeTrekDetails = treks.find((t) => t.slug === selectedTrek);

  return (
    <>
      <Toaster />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        
        {/* Left Column - Console Controls Panel */}
        <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-slate-950/30 self-start">
          <div className="mb-6">
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <Compass className="h-5 w-5 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Route Console</h1>
            <p className="mt-1 text-xs text-zinc-400">
              Select an expedition target and configure its progressive timeline milestones.
            </p>
          </div>

          <div className="grid gap-5">
            <label className="block">
              <span className="mb-2 block text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                Target Expedition Listing
              </span>
              <Select
                name="targetTrek"
                value={selectedTrek}
                onChange={(e) => setSelectedTrek(e.target.value)}
                required
                disabled={loadingDays || pending}
              >
                {treks.length === 0 ? (
                  <option value="">Loading treks...</option>
                ) : (
                  treks.map((trek) => (
                    <option key={trek.slug} value={trek.slug}>
                      {trek.title}
                    </option>
                  ))
                )}
              </Select>
            </label>

            {activeTrekDetails && (
              <div className="rounded-xl border border-white/5 bg-white/5 p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Region:</span>
                  <span className="font-semibold text-zinc-300">{activeTrekDetails.region}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${activeTrekDetails.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'}`}>
                    {activeTrekDetails.isActive ? 'Active Catalog' : 'Draft'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Total Milestones:</span>
                  <span className="font-bold text-cyan-300 font-mono">{itineraryDays.length} Days</span>
                </div>
              </div>
            )}

            <div className="h-[1px] bg-white/10 my-1" />

            <Button
              type="button"
              onClick={handleAddRow}
              disabled={loadingDays || pending || !selectedTrek}
              className="py-4 border border-cyan-400/20 hover:border-cyan-400/40 bg-cyan-950/10 hover:bg-cyan-950/30 text-cyan-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5" />
              Add Day Row
            </Button>

            <Button
              type="button"
              onClick={handleSaveItinerary}
              disabled={pending || loadingDays || itineraryDays.length === 0}
              className="py-4 bg-[#06b6d4] hover:bg-[#0891b2] text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {pending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Synchronizing Ledger
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Save Itinerary Details
                </>
              )}
            </Button>

            {/* Validation warning alerts */}
            {errors.length > 0 && (
              <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-4">
                <div className="flex items-center gap-2 mb-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Validation Alerts ({errors.length})</span>
                </div>
                <ul className="text-[10px] leading-relaxed text-red-200 list-disc pl-4 space-y-1 max-h-40 overflow-y-auto font-medium">
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Right Column - Timeline Workspace Panel */}
        <aside className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-slate-950/30 min-h-[500px] flex flex-col">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white">Route Milestones & Logistics</h2>
              <p className="mt-1 text-xs text-zinc-400">Chronological day-by-day mapping of altitude and accommodations.</p>
            </div>
            <div className="text-[9px] font-black tracking-widest text-zinc-500 uppercase border border-white/5 rounded-lg px-3 py-1.5 bg-white/5">
              Live Feed
            </div>
          </div>

          {loadingDays ? (
            <div className="flex-1 flex flex-col gap-3 items-center justify-center">
              <Loader2 className="h-9 w-9 animate-spin text-cyan-300" />
              <span className="text-zinc-500 text-xs font-semibold">Loading trek timelines...</span>
            </div>
          ) : itineraryDays.length === 0 ? (
            <div className="flex-1 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-white/5 my-auto">
              <div className="h-12 w-12 rounded-2xl bg-cyan-400/5 text-cyan-300 flex items-center justify-center mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-zinc-300 font-bold text-sm">Workspace Empty</span>
              <span className="text-zinc-500 text-xs max-w-xs mt-1 block leading-relaxed">
                There are no day-wise checkpoints listed. Click **Add Day Row** on the sidebar to begin drafting.
              </span>
            </div>
          ) : (
            <div className="space-y-6 max-h-[750px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
              {itineraryDays.map((day, idx) => (
                <div key={idx} className="relative pl-8 group">
                  
                  {/* Timeline chronological connector */}
                  {idx < itineraryDays.length - 1 && (
                    <div className="absolute left-[15px] top-12 bottom-[-24px] w-[2px] bg-white/10 group-hover:bg-cyan-500/20 transition-colors border-dashed" />
                  )}

                  {/* Circle Chrono Day indicator */}
                  <div className="absolute left-0 top-3.5 w-8 h-8 rounded-full border border-cyan-400/40 bg-zinc-950 text-xs font-extrabold text-cyan-300 flex items-center justify-center shadow-lg group-hover:border-cyan-400 transition-colors">
                    {day.dayNumber || idx + 1}
                  </div>

                  {/* Repeatable Form Card */}
                  <div className="rounded-xl border border-white/5 bg-white/5 p-5 transition-all group-hover:bg-white/[0.08] relative">
                    
                    {/* Header: Title and Day # config */}
                    <div className="grid grid-cols-[100px_1fr_40px] gap-4 mb-4 items-center">
                      
                      {/* Editable Day Index */}
                      <div className="rounded-xl border border-white/10 bg-zinc-950 p-2.5 transition-colors focus-within:border-cyan-500">
                        <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-500">Day #</label>
                        <input
                          type="number"
                          min="1"
                          value={day.dayNumber === undefined ? '' : day.dayNumber}
                          onChange={(e) => handleFieldChange(idx, 'dayNumber', e.target.value)}
                          className="mt-0.5 block w-full bg-transparent border-0 p-0 text-sm font-bold text-cyan-300 focus:outline-none focus:ring-0 font-mono"
                          required
                        />
                      </div>

                      {/* Editable Milestone title */}
                      <div className="rounded-xl border border-white/10 bg-zinc-950 p-2.5 transition-colors focus-within:border-cyan-500">
                        <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-500">Phase Milestone Title</label>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => handleFieldChange(idx, 'title', e.target.value)}
                          placeholder="e.g. Ascent to High Camp III"
                          className="mt-0.5 block w-full bg-transparent border-0 p-0 text-sm font-bold text-zinc-200 focus:outline-none focus:ring-0 placeholder-zinc-700"
                          required
                          autoComplete="off"
                        />
                      </div>

                      {/* Trash action button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(idx)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-white/5"
                        aria-label="Delete milestone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Secondary details grid (Altitude, Accommodations, Description) */}
                    <div className="grid gap-4 md:grid-cols-2 items-start">
                      
                      {/* Elevation details */}
                      <div className="rounded-xl border border-white/10 bg-zinc-950 p-2.5 transition-colors focus-within:border-cyan-500">
                        <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-500">Target Altitude / Elevation (meters)</label>
                        <input
                          type="number"
                          min="0"
                          value={day.altitudeMeters === undefined ? '' : day.altitudeMeters}
                          onChange={(e) => handleFieldChange(idx, 'altitudeMeters', e.target.value)}
                          placeholder="e.g. 3440"
                          className="mt-0.5 block w-full bg-transparent border-0 p-0 text-sm font-bold text-zinc-200 focus:outline-none focus:ring-0 placeholder-zinc-700 font-mono"
                          required
                        />
                      </div>

                      {/* Accommodation Type */}
                      <div className="rounded-xl border border-white/10 bg-zinc-950 p-2.5 transition-colors focus-within:border-cyan-500">
                        <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-500">Accommodation Type</label>
                        <select
                          value={day.accommodationType}
                          onChange={(e) => handleFieldChange(idx, 'accommodationType', e.target.value)}
                          className="mt-0.5 block w-full bg-transparent border-0 p-0 text-sm font-bold text-zinc-200 focus:outline-none focus:ring-0 placeholder-zinc-700 select-dropdown-custom cursor-pointer"
                          required
                        >
                          {ACCOMMODATION_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-zinc-950 text-zinc-300">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Chrono Guidance Description */}
                      <div className="rounded-xl border border-white/10 bg-zinc-950 p-2.5 transition-colors focus-within:border-cyan-500 md:col-span-2">
                        <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-500">Tactical Guidance Description</label>
                        <textarea
                          value={day.description}
                          onChange={(e) => handleFieldChange(idx, 'description', e.target.value)}
                          placeholder="Establish camp criteria, medical checkpoints, acclimatization advice..."
                          className="mt-1 block w-full bg-transparent border-0 p-0 text-xs font-semibold text-zinc-400 focus:outline-none focus:ring-0 placeholder-zinc-700 min-h-16 resize-none"
                          rows={2}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
