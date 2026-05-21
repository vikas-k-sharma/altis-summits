import { Calendar } from 'lucide-react';

export default function DeparturesPage() {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-12 shadow-2xl shadow-slate-950/30 text-center flex flex-col items-center justify-center min-h-[460px]">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
        <Calendar className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Departures & Dates Console</h2>
      <p className="max-w-md text-sm text-zinc-400">
        This sub-module enables admins to schedule departures, configure available seats, and monitor client bookings.
      </p>
      <div className="mt-6 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-zinc-500 font-semibold tracking-wider uppercase select-none">
        Future Pipeline Integration
      </div>
    </section>
  );
}
