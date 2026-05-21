'use client';

import { motion } from 'motion/react';
import { ArrowRight, Mountain } from 'lucide-react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { loginUser } from '@/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit"
      disabled={pending}
      className="w-full py-5 bg-white text-slate-950 font-bold rounded-2xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
    >
      {pending ? (
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full"
        />
      ) : (
        <>
          Sign In
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-28 pb-12 px-6 bg-slate-950 relative">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&q=80&w=2600" 
          className="w-full h-full object-cover opacity-30 grayscale"
          alt="Auth Background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/80 to-transparent" />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 w-full max-w-md bg-zinc-900 shadow-2xl rounded-3xl overflow-hidden border border-white/10"
      >
        <div className="p-10">
          <div className="flex justify-between items-center mb-10">
            <Link href="/" className="text-lg font-bold tracking-tighter flex items-center gap-2">
              <Mountain className="w-5 h-5 text-cyan-400" />
              ALTIS
            </Link>
          </div>

          <motion.div
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Welcome Back
              </h2>
              <p className="text-zinc-400 text-sm">
                Access your private climbs and logistics.
              </p>
            </div>

            <form action={loginUser} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Email Address</label>
                <input 
                  required
                  name="email"
                  type="email" 
                  placeholder="explorer@altis.com"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Password</label>
                <input 
                  required
                  name="password"
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <SubmitButton />
            </form>
          </motion.div>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <Link 
              href="/register"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Don't have an account? Register
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
