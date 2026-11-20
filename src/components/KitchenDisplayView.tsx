'use client';

import React, { useState } from 'react';
import { Flame, Clock, Printer, ChefHat, Coffee, CheckCircle2 } from 'lucide-react';
import { usePosStore } from '@/store/usePosStore';
import { KitchenStatus, KitchenTicket } from '@/types/pos';
import { formatElapsedMinutes } from '@/lib/currency';
import { motion, AnimatePresence } from '@/lib/motion';

const NEXT_STATUS: Record<KitchenStatus, KitchenStatus | null> = {
  New: 'Preparing',
  Preparing: 'Ready',
  Ready: 'Served',
  Served: null,
};

const STATUS_BADGE: Record<KitchenStatus, string> = {
  New: 'bg-red-100 text-red-800 border-red-300',
  Preparing: 'bg-amber-100 text-amber-800 border-amber-300',
  Ready: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Served: 'bg-slate-100 text-slate-600 border-slate-300',
};

export function KitchenDisplayView() {
  const { kitchenTickets, advanceKitchenTicket, toggleTicketUrgent } = usePosStore();
  const [stationFilter, setStationFilter] = useState<'All' | 'Kitchen' | 'Beverage'>('All');
  const [statusFilter, setStatusFilter] = useState<'Active' | 'All' | KitchenStatus>('Active');
  const [printingTicket, setPrintingTicket] = useState<KitchenTicket | null>(null);

  const filtered = kitchenTickets.filter((t) => {
    const matchStation = stationFilter === 'All' || t.station === stationFilter;
    const matchStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Active'
        ? t.status !== 'Served'
        : t.status === statusFilter;
    return matchStation && matchStatus;
  });

  const handlePrintKot = (ticket: KitchenTicket) => {
    setPrintingTicket(ticket);
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Kitchen', 'Beverage'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStationFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                stationFilter === st ? 'bg-[#0F172A] text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {st === 'Kitchen' && <ChefHat className="w-3.5 h-3.5" />}
              {st === 'Beverage' && <Coffee className="w-3.5 h-3.5" />}
              {st}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(['Active', 'New', 'Preparing', 'Ready', 'Served', 'All'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                statusFilter === st
                  ? 'bg-[#059669] text-white border-[#059669]'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <div className="font-bold text-[#0F172A]">All caught up!</div>
          <div className="text-xs mt-1">No kitchen tickets matching the selected filters.</div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
          {filtered.map((ticket) => {
            const next = NEXT_STATUS[ticket.status];
            return (
              <motion.div layout
                initial={{ opacity: 0, y: -20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, x: 60, transition: { duration: 0.25 } }}
                transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                key={ticket.id}
                data-testid={`kot-card-${ticket.ticketNumber}`}
                className={`bg-white rounded-2xl border-2 shadow-sm flex flex-col overflow-hidden ${
                  ticket.urgent ? 'border-[#DC2626] animate-urgent' : 'border-slate-200'
                }`}
              >
                <div
                  className={`px-4 py-3 flex items-center justify-between ${
                    ticket.urgent ? 'bg-red-50' : 'bg-slate-50'
                  } border-b border-slate-200`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#0F172A]">
                        {ticket.ticketNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#0F172A] text-white text-[10px] font-bold">
                        {ticket.tableNumber}
                      </span>
                      {ticket.station === 'Beverage' && (
                        <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold">
                          BAR
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {ticket.orderNumber} • Waiter: {ticket.waiterName}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      STATUS_BADGE[ticket.status]
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>

                <div className="p-4 flex-1 space-y-2">
                  {ticket.items.map((it) => (
                    <div key={it.id} className="border-b border-dashed border-slate-200 pb-2 last:border-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-extrabold text-base text-[#059669]">{it.quantity}x</span>
                        <span className="font-bold text-sm text-[#0F172A]">{it.name}</span>
                      </div>
                      {it.customizations && it.customizations.length > 0 && (
                        <div className="text-xs text-amber-700 pl-6">{it.customizations.join(', ')}</div>
                      )}
                      {it.notes && (
                        <div className="text-xs bg-amber-50 text-amber-900 px-2 py-1 rounded mt-1 ml-6">
                          Note: {it.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatElapsedMinutes(ticket.createdAt)}</span>
                    <button
                      onClick={() => toggleTicketUrgent(ticket.id)}
                      title="Toggle Urgent"
                      className={`p-1 rounded-lg ${
                        ticket.urgent ? 'bg-red-100 text-[#DC2626]' : 'hover:bg-slate-200 text-slate-400'
                      }`}
                    >
                      <Flame className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePrintKot(ticket)}
                      title="Print KOT"
                      className="p-1 rounded-lg hover:bg-slate-200 text-slate-600"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>

                  {next && (
                    <button
                      onClick={() => advanceKitchenTicket(ticket.id, next)}
                      data-testid={`advance-kot-${ticket.ticketNumber}`}
                      className="px-3.5 py-2 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold transition"
                    >
                      Mark {next}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </div>
      )}

      {/* Hidden Printable KOT */}
      {printingTicket && (
        <div id="printable-kot" className="hidden print:block p-4 font-mono text-xs w-[280px]">
          <div className="text-center font-bold text-sm border-b border-dashed border-black pb-2 mb-2">
            KITCHEN ORDER TICKET ({printingTicket.station.toUpperCase()})
          </div>
          <div>Ticket: {printingTicket.ticketNumber}</div>
          <div>Order: {printingTicket.orderNumber}</div>
          <div>Table: {printingTicket.tableNumber}</div>
          <div>Waiter: {printingTicket.waiterName}</div>
          <div>Time: {new Date(printingTicket.createdAt).toLocaleTimeString()}</div>
          <div className="border-t border-dashed border-black my-2 pt-2 space-y-1">
            {printingTicket.items.map((i) => (
              <div key={i.id}>
                <strong>{i.quantity}x</strong> {i.name}
                {i.notes && <div>  * {i.notes}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
