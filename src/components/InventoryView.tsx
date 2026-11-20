'use client';

import React, { useState } from 'react';
import { AlertTriangle, Plus, Minus } from 'lucide-react';
import { usePosStore } from '@/store/usePosStore';
import { formatLKRCompact } from '@/lib/currency';

export function InventoryView() {
  const { inventory, stockMovements, adjustInventory } = usePosStore();
  const [reason, setReason] = useState('Manual restock / audit');

  return (
    <div className="grid lg:grid-cols-12 gap-5">
      <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <h3 className="font-extrabold text-base text-[#0F172A]">Ingredient Stock</h3>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Adjustment reason..."
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs w-56"
          />
        </div>
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <th className="p-3.5">Ingredient</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">In Stock</th>
              <th className="p-3.5">Unit Cost</th>
              <th className="p-3.5 text-right">Adjust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map((ing) => {
              const low = ing.stock <= ing.minStock;
              return (
                <tr key={ing.id}>
                  <td className="p-3.5 font-bold text-[#0F172A] flex items-center gap-2">
                    {ing.name}
                    {low && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-[#DC2626] text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3" /> Low
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-600">{ing.category}</td>
                  <td className="p-3.5 font-bold">
                    {ing.stock} {ing.unit}
                  </td>
                  <td className="p-3.5 text-slate-600">{formatLKRCompact(ing.costPerUnitCents)}</td>
                  <td className="p-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => adjustInventory(ing.id, -1, reason)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => adjustInventory(ing.id, 5, reason)}
                      className="p-1.5 rounded-lg bg-[#059669] text-white hover:bg-emerald-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 h-fit">
        <h3 className="font-extrabold text-base text-[#0F172A]">Stock Movement History</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {stockMovements.map((m) => (
            <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex justify-between font-bold">
                <span>{m.ingredientName}</span>
                <span className={m.delta >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'}>
                  {m.delta >= 0 ? `+${m.delta}` : m.delta}
                </span>
              </div>
              <div className="text-slate-500 mt-0.5">{m.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
