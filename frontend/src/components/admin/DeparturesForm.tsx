'use client';

import { useState, useEffect } from 'react';
import { Loader2, Calendar, Trash2, Check, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast, Toaster } from '@/components/ui/toast';
import type { TrekDeparture } from '@/lib/types';
import {
  getTrekOptions,
  getTrekDepartures,
  saveTrekDepartures,
  deleteTrekDeparture,
  type TrekOption,
} from '@/actions/admin';

const STATUS_OPTIONS = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function DeparturesForm() {
  const [treks, setTreks] = useState<TrekOption[]>([]);
  const [selectedTrek, setSelectedTrek] = useState('');
  const [departures, setDepartures] = useState<TrekDeparture[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [loadingDepartures, setLoadingDepartures] = useState(false);

  // 1. Fetch trek options on mount and select the first one
  useEffect(() => {
    async function loadTreks() {
      setLoadingDepartures(true);
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
        setLoadingDepartures(false);
      }
    }
    loadTreks();
  }, []);

  // 2. Fetch departures when selectedTrek changes
  useEffect(() => {
    if (!selectedTrek) return;

    async function loadDepartures() {
      setLoadingDepartures(true);
      setErrors([]);
      try {
        const data = await getTrekDepartures(selectedTrek);
        // Sort chronologically by start date
        const sorted = [...data].sort((a, b) => a.startDate.localeCompare(b.startDate));
        setDepartures(sorted);
      } catch (err) {
        console.error('Failed to load departures:', err);
        toast({
          kind: 'error',
          title: 'Database Load Error',
          message: `Unable to retrieve departure manifests for the trek: ${selectedTrek}.`,
        });
      } finally {
        setLoadingDepartures(false);
      }
    }
    loadDepartures();
  }, [selectedTrek]);

  // 3. Handle inline editing of fields inside the repeatable cards
  const handleFieldChange = (index: number, field: keyof TrekDeparture, value: any) => {
    const updated = [...departures];

    // Parse numeric fields properly
    let parsedValue = value;
    if (field === 'totalSeats' || field === 'availableSeats') {
      parsedValue = value === '' ? '' : parseInt(value, 10);
    }

    updated[index] = {
      ...updated[index],
      [field]: parsedValue,
    };
    setDepartures(updated);
  };

  // 4. Add a new row to the timeline
  const handleAddRow = () => {
    const today = new Date().toISOString().split('T')[0];

    // Build next logical date (e.g. 1 month from now)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const defaultStart = nextMonth.toISOString().split('T')[0];

    const nextWeek = new Date(nextMonth);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const defaultEnd = nextWeek.toISOString().split('T')[0];

    const newDep: TrekDeparture = {
      // Temporary negative id to avoid key collisions on unsaved items
      id: -Date.now(),
      startDate: defaultStart,
      endDate: defaultEnd,
      totalSeats: 20,
      availableSeats: 20,
      status: 'SCHEDULED',
    };

    setDepartures([...departures, newDep]);
    toast({
      kind: 'success',
      title: 'Run Appended',
      message: 'Appended draft departure manifest row to the workspace.',
    });
  };

  // 5. Delete a specific departure
  const handleDeleteRow = async (indexToDelete: number) => {
    const target = departures[indexToDelete];
    const hasBeenSaved = target.id > 0;

    if (hasBeenSaved) {
      setPending(true);
      try {
        const res = await deleteTrekDeparture(selectedTrek, target.id);
        if (res.status === 'success') {
          toast({
            kind: 'success',
            title: 'Departure Pruned',
            message: 'Successfully deleted the scheduled run from database.',
          });
          setDepartures(departures.filter((_, idx) => idx !== indexToDelete));
        } else {
          toast({
            kind: 'error',
            title: 'Delete Failed',
            message: res.message,
          });
        }
      } catch (err) {
        console.error('Delete error:', err);
        toast({
          kind: 'error',
          title: 'Operation Failed',
          message: 'Unable to reach backend services to delete this departure.',
        });
      } finally {
        setPending(false);
      }
    } else {
      // Item is only a local draft, prune it from state immediately
      setDepartures(departures.filter((_, idx) => idx !== indexToDelete));
      toast({
        kind: 'success',
        title: 'Draft Removed',
        message: 'Deleted the draft departure row from your workspace.',
      });
    }
  };

  // 6. Validation before submitting
  const validateDepartures = (list: TrekDeparture[]): string[] => {
    const errs: string[] = [];

    list.forEach((dep, idx) => {
      const label = `Departure Card #${idx + 1}`;

      // Date validations
      if (!dep.startDate) {
        errs.push(`${label}: Start Date is required.`);
      }
      if (!dep.endDate) {
        errs.push(`${label}: End Date is required.`);
      }

      if (dep.startDate && dep.endDate) {
        const start = new Date(dep.startDate);
        const end = new Date(dep.endDate);
        if (end < start) {
          errs.push(`${label}: End Date cannot be earlier than Start Date.`);
        }
      }

      // Seat validations
      if (dep.totalSeats === undefined || dep.totalSeats === null || (dep.totalSeats as any) === '' || isNaN(dep.totalSeats)) {
        errs.push(`${label}: Total Seats count is required.`);
      } else if (dep.totalSeats <= 0) {
        errs.push(`${label}: Total Seats must be greater than zero.`);
      }

      if (dep.availableSeats === undefined || dep.availableSeats === null || (dep.availableSeats as any) === '' || isNaN(dep.availableSeats)) {
        errs.push(`${label}: Available Seats count is required.`);
      } else if (dep.availableSeats < 0) {
        errs.push(`${label}: Available Seats cannot be negative.`);
      } else if (dep.availableSeats > dep.totalSeats) {
        errs.push(`${label}: Available Seats (${dep.availableSeats}) cannot exceed Total Seats (${dep.totalSeats}).`);
      }

      // Status validation
      if (!dep.status) {
        errs.push(`${label}: Window status is required.`);
      } else if (!['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(dep.status)) {
        errs.push(`${label}: Invalid status value.`);
      }
    });

    return errs;
  };

  // 7. Save entire schedule using the PUT endpoint
  const handleSaveAll = async () => {
    const validationErrors = validateDepartures(departures);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast({
        kind: 'error',
        title: 'Validation Failure',
        message: 'Correct date calendar order or seat count issues before saving.',
      });
      return;
    }

    setErrors([]);
    setPending(true);

    try {
      // Strip negative temporary IDs from payload
      const payload = departures.map((dep) => {
        const { id, ...rest } = dep;
        return id > 0 ? dep : rest;
      });

      const res = await saveTrekDepartures(selectedTrek, payload);

      if (res.status === 'success') {
        toast({
          kind: 'success',
          title: 'Ledger Synchronized',
          message: res.message,
        });
        if (res.data) {
          const sorted = [...res.data].sort((a, b) => a.startDate.localeCompare(b.startDate));
          setDepartures(sorted);
        }
      } else {
        toast({
          kind: 'error',
          title: 'Database Sync Failed',
          message: res.message,
        });
        setErrors([res.message]);
      }
    } catch (err) {
      console.error('Save all departures error:', err);
      toast({
        kind: 'error',
        title: 'Save Operation Aborted',
        message: 'Could not connect to the departure service. Please verify server status.',
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
              <Calendar className="h-5 w-5 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Departure Console</h1>
            <p className="mt-1 text-xs text-zinc-400">
              Select an expedition target and configure its progressive calendar runs.
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
                disabled={loadingDepartures || pending}
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
                  <span className="text-zinc-500">Scheduled Runs:</span>
                  <span className="font-bold text-cyan-300 font-mono">{departures.length} Runs</span>
                </div>
              </div>
            )}

            <div className="h-[1px] bg-white/10 my-1" />

            <Button
              type="button"
              onClick={handleAddRow}
              disabled={loadingDepartures || pending || !selectedTrek}
              className="py-4 border border-cyan-400/20 hover:border-cyan-400/40 bg-cyan-950/10 hover:bg-cyan-950/30 text-cyan-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5" />
              Add Departure Row
            </Button>

            <Button
              type="button"
              onClick={handleSaveAll}
              disabled={pending || loadingDepartures || departures.length === 0}
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
                  Save Departure Schedule
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
              <h2 className="text-lg font-bold text-white">Calendar Runs & Seat Limits</h2>
              <p className="mt-1 text-xs text-zinc-400">Chronological list of expedition bookings, schedules, and active windows.</p>
            </div>
            <div className="text-[9px] font-black tracking-widest text-zinc-500 uppercase border border-white/5 rounded-lg px-3 py-1.5 bg-white/5">
              Live Feed
            </div>
          </div>

          {loadingDepartures ? (
            <div className="flex-1 flex flex-col gap-3 items-center justify-center">
              <Loader2 className="h-9 w-9 animate-spin text-cyan-300" />
              <span className="text-zinc-500 text-xs font-semibold">Loading departures calendar...</span>
            </div>
          ) : departures.length === 0 ? (
            <div className="flex-1 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-white/5 my-auto">
              <div className="h-12 w-12 rounded-2xl bg-cyan-400/5 text-cyan-300 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-zinc-300 font-bold text-sm">Calendar Empty</span>
              <span className="text-zinc-500 text-xs max-w-xs mt-1 block leading-relaxed">
                There are no scheduled runs listed. Click **Add Departure Row** on the sidebar to draft the manifest.
              </span>
            </div>
          ) : (
            <div className="space-y-6 max-h-[750px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
              {departures.map((dep, idx) => (
                <div key={dep.id} className="relative pl-8 group animate-in fade-in duration-300">
                  
                  {/* Visual timeline chronological connector */}
                  {idx < departures.length - 1 && (
                    <div className="absolute left-[15px] top-12 bottom-[-24px] w-[2px] bg-white/10 group-hover:bg-cyan-500/20 transition-colors border-dashed" />
                  )}

                  {/* Date icon chronological indicator */}
                  <div className="absolute left-0 top-3.5 w-8 h-8 rounded-full border border-cyan-400/40 bg-zinc-950 text-xs font-extrabold text-cyan-300 flex items-center justify-center shadow-lg group-hover:border-cyan-400 transition-colors">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  </div>

                  {/* Repeatable Form Card */}
                  <div className="rounded-xl border border-white/5 bg-white/5 p-5 transition-all group-hover:bg-white/[0.08] relative">
                    
                    {/* Header: Date Range & Trash Pruning Button */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_40px] gap-4 mb-4 items-center">
                      
                      {/* Start Date */}
                      <div className="rounded-xl border border-white/10 bg-zinc-950 p-2.5 transition-colors focus-within:border-cyan-500">
                        <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-500">Start Date (YYYY-MM-DD)</label>
                        <input
                          type="date"
                          value={dep.startDate}
                          onChange={(e) => handleFieldChange(idx, 'startDate', e.target.value)}
                          className="mt-0.5 block w-full bg-transparent border-0 p-0 text-sm font-bold text-zinc-200 focus:outline-none focus:ring-0 cursor-pointer font-mono [&::-webkit-calendar-picker-indicator]:invert"
                          required
                        />
                      </div>

                      {/* End Date */}
                      <div className="rounded-xl border border-white/10 bg-zinc-950 p-2.5 transition-colors focus-within:border-cyan-500">
                        <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-500">End Date (YYYY-MM-DD)</label>
                        <input
                          type="date"
                          value={dep.endDate}
                          onChange={(e) => handleFieldChange(idx, 'endDate', e.target.value)}
                          className="mt-0.5 block w-full bg-transparent border-0 p-0 text-sm font-bold text-zinc-200 focus:outline-none focus:ring-0 cursor-pointer font-mono [&::-webkit-calendar-picker-indicator]:invert"
                          required
                        />
                      </div>

                      {/* Trash action button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(idx)}
                        disabled={pending}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-white/5 disabled:opacity-40"
                        aria-label="Delete departure"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Secondary details grid (Seats Booked/Status) */}
                    <div className="grid gap-4 md:grid-cols-3 items-center">
                      
                      {/* Total Seats */}
                      <div className="rounded-xl border border-white/10 bg-zinc-950 p-2.5 transition-colors focus-within:border-cyan-500">
                        <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-500">Total Seats Capacity</label>
                        <input
                          type="number"
                          min="1"
                          value={dep.totalSeats === undefined ? '' : dep.totalSeats}
                          onChange={(e) => handleFieldChange(idx, 'totalSeats', e.target.value)}
                          placeholder="e.g. 20"
                          className="mt-0.5 block w-full bg-transparent border-0 p-0 text-sm font-bold text-zinc-200 focus:outline-none focus:ring-0 placeholder-zinc-700 font-mono"
                          required
                        />
                      </div>

                      {/* Available Seats */}
                      <div className="rounded-xl border border-white/10 bg-zinc-950 p-2.5 transition-colors focus-within:border-cyan-500">
                        <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-500">Available Bookable Seats</label>
                        <input
                          type="number"
                          min="0"
                          value={dep.availableSeats === undefined ? '' : dep.availableSeats}
                          onChange={(e) => handleFieldChange(idx, 'availableSeats', e.target.value)}
                          placeholder="e.g. 12"
                          className="mt-0.5 block w-full bg-transparent border-0 p-0 text-sm font-bold text-zinc-200 focus:outline-none focus:ring-0 placeholder-zinc-700 font-mono"
                          required
                        />
                      </div>

                      {/* Window Status */}
                      <div className="rounded-xl border border-white/10 bg-zinc-950 p-2.5 transition-colors focus-within:border-cyan-500">
                        <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-500">Lifecycle Phase Status</label>
                        <select
                          value={dep.status}
                          onChange={(e) => handleFieldChange(idx, 'status', e.target.value)}
                          className="mt-0.5 block w-full bg-transparent border-0 p-0 text-sm font-bold text-zinc-200 focus:outline-none focus:ring-0 select-dropdown-custom cursor-pointer"
                          required
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-zinc-950 text-zinc-300">
                              {opt.label}
                            </option>
                          ))}
                        </select>
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
