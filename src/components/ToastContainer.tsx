'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { usePosStore } from '@/store/usePosStore';
import { motion, AnimatePresence } from '@/lib/motion';

export function ToastContainer() {
  const { toasts, dismissToast } = usePosStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print">
      <AnimatePresence initial={false}>
      {toasts.map((t) => {
        const styles =
          t.type === 'success'
            ? 'bg-emerald-950 text-white border-emerald-700'
            : t.type === 'error'
            ? 'bg-red-950 text-white border-red-700'
            : t.type === 'warning'
            ? 'bg-amber-950 text-white border-amber-700'
            : 'bg-[#0F172A] text-white border-slate-700';

        const Icon =
          t.type === 'success'
            ? CheckCircle2
            : t.type === 'error'
            ? AlertCircle
            : t.type === 'warning'
            ? AlertTriangle
            : Info;

        return (
          <motion.div
            key={t.id}
            role="status"
            layout
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${styles}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="opacity-70 hover:opacity-100 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        );
      })}
      </AnimatePresence>
    </div>
  );
}
