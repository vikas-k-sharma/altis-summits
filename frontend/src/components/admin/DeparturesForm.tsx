'use client';

import { useState, useEffect } from 'react';
import { Loader2, Calendar, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast, Toaster } from '@/components/ui/toast';
import type { Trek } from '@/lib/types';

interface DepartureItem {
  id: number;
  startDate: string;
  endDate: string;
  loadStr: string; // e.g. "6/8"
  status: 'FILLING' | 'GUARANTEED' | 'CANCELLED';
}

const INITIAL_TREKS = [
  { slug: 'k2-base-camp', title: 'K2 Base Camp' },
  { slug: 'everest-circuit', title: 'Everest Circuit' },
  { slug: 'annapurna-sanctuary', title: 'Annapurna Sanctuary' },
];

const PRE_POPULATED_DEPARTURES: DepartureItem[] = [
  {
    id: 1,
    startDate: 'July 15, 2026',
    endDate: 'August 05, 2026',
    loadStr: '6/8',
    status: 'FILLING',
  },
  {
    id: 2,
    startDate: 'August 10, 2026',
    endDate: 'August 31, 2026',
    loadStr: '4/8',
    status: 'GUARANTEED',
  },
];

export default function DeparturesForm() {
  const [treks, setTreks] = useState<{ slug: string; title: string }[]>(INITIAL_TREKS);
  const [selectedTrek, setSelectedTrek] = useState('k2-base-camp');
  const [departures, setDepartures] = useState<DepartureItem[]>(PRE_POPULATED_DEPARTURES);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loadInput, setLoadInput] = useState('4/8');
  const [windowStatus, setWindowStatus] = useState<'FILLING' | 'GUARANTEED' | 'CANCELLED'>('FILLING');
  const [pending, setPending] = useState(false);

  // Fetch treks list from database to populate target dropdown
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

  const handleDeployDeparture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate.trim() || !endDate.trim() || !loadInput.trim()) {
      toast({
        kind: 'error',
        title: 'Validation Error',
        message: 'Please complete all departure manifest fields.',
      });
      return;
    }

    // Basic format check for Fills Registered e.g. "X/Y"
    if (!/^\d+\/\d+$/.test(loadInput.trim())) {
      toast({
        kind: 'error',
        title: 'Format Error',
        message: 'Fills Registered must be in X/Y format, e.g. 4/8.',
      });
      return;
    }

    const newItem: DepartureItem = {
      id: Date.now(),
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      loadStr: loadInput.trim(),
      status: windowStatus,
    };

    setDepartures([...departures, newItem]);
    setStartDate('');
    setEndDate('');
    setLoadInput('4/8');
    setWindowStatus('FILLING');

    toast({
      kind: 'success',
      title: 'Departure Deployed',
      message: `New run successfully scheduled: ${newItem.startDate} to ${newItem.endDate}`,
    });
  };

  const handleDeleteDeparture = (idToDelete: number) => {
    setDepartures(departures.filter((item) => item.id !== idToDelete));
    toast({
      kind: 'success',
      title: 'Departure Purged',
      message: 'Run successfully removed from active deployment ledger.',
    });
  };

  const handleSaveAllDepartures = async () => {
    setPending(true);
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPending(false);

    toast({
      kind: 'success',
      title: 'Ledger Successfully Saved',
      message: `All ${departures.length} scheduled runs for ${
        treks.find((t) => t.slug === selectedTrek)?.title || selectedTrek
      } are locked in the database.`,
    });
  };

  // Helper to parse X/Y load and calculate percentage
  const calculateProgress = (loadStr: string) => {
    const parts = loadStr.split('/');
    if (parts.length === 2) {
      const current = Number(parts[0]);
      const limit = Number(parts[1]);
      if (!isNaN(current) && !isNaN(limit) && limit > 0) {
        return Math.min((current / limit) * 100, 100);
      }
    }
    return 0;
  };

  return (
    <>
      <Toaster />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)]">
        {/* Left Column - Register Departure Manifests Form */}
        <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-slate-950/30">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">Register Departure Manifests</h1>
            <p className="mt-1 text-xs text-zinc-400">
              Configure calendar limits, filling progress, and status tiers.
            </p>
          </div>

          <form onSubmit={handleDeployDeparture} className="grid gap-5">
            <label className="block">
              <span className="mb-2 block text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                Select Expedition
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

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                  Start Date
                </span>
                <Input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Sept 10, 2026"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                  End Date
                </span>
                <Input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Sept 28, 2026"
                  required
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                  Fills Registered (Current/Limit)
                </span>
                <Input
                  type="text"
                  value={loadInput}
                  onChange={(e) => setLoadInput(e.target.value)}
                  placeholder="4/8"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                  Window Status
                </span>
                <Select
                  name="windowStatus"
                  value={windowStatus}
                  onChange={(e) => setWindowStatus(e.target.value as DepartureItem['status'])}
                  required
                >
                  <option value="FILLING">Filling</option>
                  <option value="GUARANTEED">Guaranteed (Run verified)</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
              </label>
            </div>

            <Button
              type="submit"
              className="mt-2 w-full py-4 bg-[#06b6d4] hover:bg-[#0891b2] text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/10 cursor-pointer"
            >
              + Deploy Departure Window
            </Button>
          </form>
        </section>

        {/* Right Column - Active Deployment Manifests List */}
        <aside className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-slate-950/30 flex flex-col justify-between">
          <div>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Active Deployment Manifests</h2>
                <p className="mt-1 text-xs text-zinc-400">Scheduled runs configured on the booking ledger.</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <Calendar className="h-5 w-5" />
              </div>
            </div>

            {/* List scroll area */}
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
              {departures.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-xl p-6 bg-white/5">
                  <span className="text-zinc-500 text-xs block">No departure manifests deployed.</span>
                  <span className="text-zinc-600 text-[10px] block mt-1">
                    Fill the form to configure a new run window.
                  </span>
                </div>
              ) : (
                departures.map((item, idx) => {
                  const progress = calculateProgress(item.loadStr);
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/[0.08]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {/* Run Dates */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-100">{item.startDate}</span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">to</span>
                            <span className="text-xs font-bold text-zinc-100">{item.endDate}</span>
                          </div>

                          {/* Progress bar container */}
                          <div className="mt-4 flex flex-col gap-1.5 w-64">
                            {/* Horizontal progress track */}
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[8px] font-bold tracking-widest text-zinc-500 uppercase">
                              Manifest Load: {item.loadStr} Climbers Booked
                            </span>
                          </div>
                        </div>

                        {/* Status Badge & Trash Icon */}
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border
                              ${
                                item.status === 'FILLING'
                                  ? 'border-cyan-500/30 text-cyan-400 bg-cyan-950/20'
                                  : item.status === 'GUARANTEED'
                                  ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20'
                                  : 'border-red-500/30 text-red-400 bg-red-950/20'
                              }`}
                          >
                            {item.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteDeparture(item.id)}
                            className="text-zinc-500 hover:text-red-400 transition-colors"
                            aria-label="Delete departure"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSaveAllDepartures}
            disabled={pending || departures.length === 0}
            className="mt-6 w-full py-4 border border-[#06b6d4]/30 bg-cyan-950/10 hover:bg-cyan-950/30 text-cyan-400 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {pending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving Schedule
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Save Departure Schedule
              </>
            )}
          </Button>
        </aside>
      </div>
    </>
  );
}
