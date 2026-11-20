'use client';

import React, { useState } from 'react';
import { Lock, Mail, Play, ShieldAlert, Sparkles } from 'lucide-react';
import { usePosStore } from '@/store/usePosStore';
import { UserRole } from '@/types/pos';
import { motion, AnimatePresence, EASE, riseItem } from '@/lib/motion';

export function LoginScreen() {
  const { loginDemo } = usePosStore();
  const [email, setEmail] = useState('admin@restropro.demo');
  const [password, setPassword] = useState('Demo123');
  const [role, setRole] = useState<UserRole>('Admin');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your demo email and password.');
      return;
    }
    if (email.trim() !== 'admin@restropro.demo' || password !== 'Demo123') {
      setError('Invalid demo credentials. Use admin@restropro.demo / Demo123 or click Enter Live Demo.');
      return;
    }
    setError('');
    loginDemo(email, role);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0F172A] via-slate-900 to-emerald-950 flex flex-col items-center justify-center p-4">
      {/* Ambient animated glows */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-emerald-500/20 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-24 w-[30rem] h-[30rem] rounded-full bg-amber-400/10 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-8"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0, y: 30, scale: 0.96 },
          show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.6, ease: EASE, staggerChildren: 0.07, delayChildren: 0.15 },
          },
        }}
      >
        <motion.div variants={riseItem} className="flex flex-col items-center text-center mb-6">
          <motion.img
            src="/images/logo.png"
            alt="Restro Pro POS Logo"
            className="h-20 w-auto object-contain mb-3"
            initial={{ rotate: -8, scale: 0.7, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.2 }}
          />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#059669] text-xs font-semibold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Client Presentation Demo
          </span>
        </motion.div>

        <motion.button
          variants={riseItem}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => loginDemo('admin@restropro.demo', role)}
          data-testid="enter-live-demo-btn"
          className="relative overflow-hidden w-full py-3.5 px-4 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-base shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-colors mb-5"
        >
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg]"
            animate={{ x: ['0%', '420%'] }}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
          />
          <Play className="relative w-5 h-5 fill-current" />
          <span className="relative">Enter Live Demo ({role})</span>
        </motion.button>

        <motion.div variants={riseItem} className="relative flex py-2 items-center mb-5">
          <div className="flex-grow border-t border-slate-200" />
          <span className="flex-shrink mx-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Or sign in with demo credentials
          </span>
          <div className="flex-grow border-t border-slate-200" />
        </motion.div>

        <motion.form variants={riseItem} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Demo Role</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Admin', 'Cashier', 'Waiter', 'Kitchen'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold border transition ${
                    role === r
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                placeholder="admin@restropro.demo"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                placeholder="Demo123"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                key={error}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto', x: [0, -8, 8, -5, 5, 0] }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#DC2626] text-xs font-medium overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-sm transition"
          >
            Sign In
          </button>
        </motion.form>

        <motion.div variants={riseItem} className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
          <span>
            <strong>Demo Mode Only:</strong> Authentication, role switching, and payment terminals are
            simulated locally in your browser via LocalStorage.
          </span>
        </motion.div>

        <motion.p variants={riseItem} className="mt-5 text-center text-xs text-slate-400 font-medium">
          Developed by <span className="text-slate-600 font-semibold">Harsh Apex Digital Solutions</span>
        </motion.p>
      </motion.div>
    </div>
  );
}
