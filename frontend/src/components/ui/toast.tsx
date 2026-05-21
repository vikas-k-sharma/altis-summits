'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastKind = 'success' | 'error';

interface ToastState {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}

let pushToast: ((toast: Omit<ToastState, 'id'>) => void) | null = null;

export function toast(toast: Omit<ToastState, 'id'>) {
  pushToast?.(toast);
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    pushToast = (nextToast) => {
      const id = Date.now();
      setToasts((current) => [...current, { ...nextToast, id }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 4500);
    };

    return () => {
      pushToast = null;
    };
  }, []);

  return (
    <div className="fixed right-4 top-20 z-[2000] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((item) => {
        const Icon = item.kind === 'success' ? CheckCircle2 : XCircle;

        return (
          <div
            key={item.id}
            className={cn(
              'rounded-xl border bg-zinc-950/95 p-4 shadow-2xl backdrop-blur',
              item.kind === 'success' ? 'border-emerald-400/30' : 'border-red-400/30'
            )}
          >
            <div className="flex gap-3">
              <Icon
                className={cn(
                  'mt-0.5 h-5 w-5 shrink-0',
                  item.kind === 'success' ? 'text-emerald-400' : 'text-red-400'
                )}
              />
              <div>
                <p className="text-sm font-bold text-white">{item.title}</p>
                {item.message && <p className="mt-1 text-sm text-zinc-400">{item.message}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
