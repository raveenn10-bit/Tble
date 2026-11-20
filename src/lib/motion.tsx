'use client';

import React from 'react';
import { motion, AnimatePresence, MotionConfig, type Variants } from 'motion/react';

export { motion, AnimatePresence, MotionConfig };

/** Shared easing — a soft "expo out" that feels snappy on touchscreens. */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const SPRING = { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 } as const;

/** Parent variant that staggers its children in. */
export const stagger = (step = 0.045, delay = 0.04): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});

/** Child variant: fade + rise. */
export const riseItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

/** Child variant: fade + gentle scale (good for cards & tiles). */
export const popItem: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
};

/** Page-level transition used when switching sections. */
export function PageTransition({
  pageKey,
  children,
  cssStagger = false,
}: {
  pageKey: string;
  children: React.ReactNode;
  /** Stagger the page's panels & table rows in with CSS (for views without bespoke Motion choreography). */
  cssStagger?: boolean;
}) {
  // Enter-only transition (keyed remount). Deliberately no exit/"wait" phase: nested presence
  // groups inside a page (e.g. the POS menu grid) can otherwise stall the exit and block navigation.
  return (
    <motion.div
      key={pageKey}
      // Only opacity + translate: no filter, so fixed-position modals inside pages are never trapped
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      data-page={pageKey}
      className={`h-full ${cssStagger ? 'page-stagger' : ''}`}
    >
      {children}
    </motion.div>
  );
}

/** Backdrop + animated dialog panel. Wrap the conditional render in <AnimatePresence> for exit animations. */
export function ModalBackdrop({
  children,
  className = 'fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        if (onClick && e.target === e.currentTarget) onClick();
      }}
    >
      {children}
    </motion.div>
  );
}

export const modalPanel = {
  initial: { opacity: 0, scale: 0.94, y: 18 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { ...SPRING } },
  exit: { opacity: 0, scale: 0.96, y: 10, transition: { duration: 0.15 } },
};
