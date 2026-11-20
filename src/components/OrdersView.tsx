'use client';

import React, { useState } from 'react';
import { CreditCard, UtensilsCrossed } from 'lucide-react';
import { usePosStore } from '@/store/usePosStore';
import { formatLKR, getOrderTotals } from '@/lib/currency';
import { CheckoutModal } from './CheckoutModal';
import { NavPage } from './AppShell';

export function OrdersView({ onNavigate }: { onNavigate: (p: NavPage) => void }) {
  const { orders, setActiveOrder } = usePosStore();
  const [statusFilter, setStatusFilter] = useState('All');
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  const filtered = orders.filter((o) => statusFilter === 'All' || o.status === statusFilter);
  const checkoutOrder = checkoutId ? orders.find((o) => o.id === checkoutId) : undefined;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-2">
        {['All', 'Draft', 'Sent to Kitchen', 'Preparing', 'Ready', 'Served', 'Payment Pending', 'Completed', 'Held'].map(
          (st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                statusFilter === st
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              {st}
            </button>
          )
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase">
              <th className="p-4">Order #</th>
              <th className="p-4">Type / Table</th>
              <th className="p-4">Items</th>
              <th className="p-4">Status</th>
              <th className="p-4">Total</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((ord) => {
              const totals = getOrderTotals(ord);
              return (
                <tr key={ord.id} className="hover:bg-slate-50/70">
                  <td className="p-4 font-bold text-[#0F172A]">{ord.orderNumber}</td>
                  <td className="p-4">
                    {ord.type} {ord.tableNumber ? `• ${ord.tableNumber}` : ''}
                  </td>
                  <td className="p-4">{ord.items.reduce((a, b) => a + b.quantity, 0)} items</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-[#059669]">{formatLKR(totals.totalCents)}</td>
                  <td className="p-4 text-right space-x-2">
                    {ord.status !== 'Completed' && (
                      <>
                        <button
                          onClick={() => {
                            setActiveOrder(ord.id);
                            onNavigate('pos');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold"
                        >
                          <UtensilsCrossed className="w-3.5 h-3.5" /> POS
                        </button>
                        <button
                          onClick={() => setCheckoutId(ord.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Pay
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {checkoutOrder && <CheckoutModal order={checkoutOrder} onClose={() => setCheckoutId(null)} />}
    </div>
  );
}
