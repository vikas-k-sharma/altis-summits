'use client';

import dynamic from 'next/dynamic';
import { useActionState, useEffect, useRef, useState } from 'react';
import { Loader2, MapPin, Mountain, Plus } from 'lucide-react';
import { createTrek, type CreateTrekState } from '@/actions/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Toaster, toast } from '@/components/ui/toast';

const AddTrekMap = dynamic(() => import('@/components/admin/AddTrekMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-80 items-center justify-center bg-slate-900">
      <Loader2 className="h-7 w-7 animate-spin text-cyan-300" />
    </div>
  ),
});

const initialState: CreateTrekState = {
  status: 'idle',
  message: '',
};

const difficulties = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'CHALLENGING', label: 'Challenging' },
  { value: 'EXPERT', label: 'Expert' },
  { value: 'EXPEDITION_LEVEL', label: 'Expedition Level' },
];

export default function AddTrekForm() {
  const [state, formAction, pending] = useActionState(createTrek, initialState);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [latInput, setLatInput] = useState('');
  const [lonInput, setLonInput] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const lastMessageRef = useRef('');

  useEffect(() => {
    if (!state.message || lastMessageRef.current === state.message) {
      return;
    }

    lastMessageRef.current = state.message;
    toast({
      kind: state.status === 'success' ? 'success' : 'error',
      title: state.status === 'success' ? 'Trek published' : 'Could not publish trek',
      message: state.message,
    });

    if (state.status === 'success') {
      formRef.current?.reset();
      window.setTimeout(() => {
        setPosition(null);
        setLatInput('');
        setLonInput('');
      }, 0);
    }
  }, [state]);

  const handleMapChange = (newPos: [number, number]) => {
    setPosition(newPos);
    setLatInput(newPos[0].toFixed(6));
    setLonInput(newPos[1].toFixed(6));
  };

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLatInput(val);
    const lat = parseFloat(val);
    const lon = parseFloat(lonInput);
    if (!isNaN(lat) && !isNaN(lon)) {
      setPosition([lat, lon]);
    } else {
      if (val === '' && lonInput === '') {
        setPosition(null);
      }
    }
  };

  const handleLonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLonInput(val);
    const lat = parseFloat(latInput);
    const lon = parseFloat(val);
    if (!isNaN(lat) && !isNaN(lon)) {
      setPosition([lat, lon]);
    } else {
      if (latInput === '' && val === '') {
        setPosition(null);
      }
    }
  };

  return (
    <>
      <Toaster />
      <form ref={formRef} action={formAction} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)]">

        <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-slate-950/30">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <Mountain className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Add Trek</h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-400">
                Create a new expedition listing with pricing, difficulty, regional metadata, and a mapped trailhead.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Title" className="md:col-span-2">
              <Input name="title" placeholder="Annapurna Sanctuary Traverse" required />
            </Field>

            <Field label="Region">
              <Input name="region" placeholder="Nepal Himalaya" required />
            </Field>

            <Field label="Difficulty">
              <Select name="difficulty" defaultValue="MODERATE" required>
                {difficulties.map((difficulty) => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Duration">
              <Input name="durationDays" type="number" min="1" step="1" placeholder="12" required />
            </Field>

            <Field label="Price">
              <Input name="price" type="number" min="0" step="0.01" placeholder="2499" required />
            </Field>

            <Field label="Max Altitude">
              <Input name="maxAltitudeMeters" type="number" min="0" step="1" placeholder="5416" required />
            </Field>

            <Field label="Description" className="md:col-span-2">
              <Textarea
                name="description"
                placeholder="Describe the route, terrain, logistics, and summit experience."
                required
              />
            </Field>
          </div>
        </section>

        <aside className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-slate-950/30">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Start Location</h2>
              <p className="mt-1 text-sm text-zinc-400">Click the map to place the trek marker.</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <MapPin className="h-5 w-5" />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10">
            <div className="h-[420px]">
              <AddTrekMap position={position} onChange={handleMapChange} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 focus-within:border-cyan-500 transition-colors">
              <label htmlFor="startLat" className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Latitude</label>
              <input
                id="startLat"
                name="startLat"
                type="number"
                step="any"
                value={latInput}
                onChange={handleLatChange}
                placeholder="e.g. 28.3949"
                className="mt-1 block w-full bg-transparent border-0 p-0 text-sm font-semibold text-zinc-200 focus:outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 focus-within:border-cyan-500 transition-colors">
              <label htmlFor="startLon" className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Longitude</label>
              <input
                id="startLon"
                name="startLon"
                type="number"
                step="any"
                value={lonInput}
                onChange={handleLonChange}
                placeholder="e.g. 84.1240"
                className="mt-1 block w-full bg-transparent border-0 p-0 text-sm font-semibold text-zinc-200 focus:outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>

          <Button type="submit" disabled={pending} className="mt-6 w-full">
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Publish Trek
              </>
            )}
          </Button>

          {state.status === 'error' && (
            <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
              {state.message}
            </p>
          )}
        </aside>
      </form>
    </>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
