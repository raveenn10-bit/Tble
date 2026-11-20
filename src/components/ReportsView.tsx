'use client';

import React, { useState } from 'react';
import { Download, Printer, Plus } from 'lucide-react';
import { usePosStore } from '@/store/usePosStore';
import { formatLKR, formatLKRCompact, toCents } from '@/lib/currency';

export function ReportsView() {
  const { payments, orders, expenses, addExpense } = usePosStore();
  const [period, setPeriod] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [expTitle, setExpTitle] = useState('');
  const [expCat, setExpCat] = useState('Ingredients');
  const [expAmt, setExpAmt] = useState('');

  const totalSalesCents = payments.reduce((s, p) => s + p.amountCents, 0);
  const totalExpensesCents = expenses.reduce((s, e) => s + e.amountCents, 0);

  const methodTotals: Record<string, number> = {};
  for (const p of payments) {
    methodTotals[p.method] = (methodTotals[p.method] || 0) + p.amountCents;
  }

  const handleExportCsv = () => {
    const rows = [
      ['Invoice', 'Order', 'Table', 'Method', 'Amount (LKR)', 'Date'],
      ...payments.map((p) => [
        p.invoiceNumber,
        p.orderNumber,
        p.tableNumber || '-',
        p.method,
        (p.amountCents / 100).toFixed(2),
        p.createdAt,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restro-pro-sales-${period.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expAmt) return;
    addExpense({
      title: expTitle.trim(),
      category: expCat,
      amountCents: toCents(Number(expAmt) || 0),
      date: new Date().toISOString().slice(0, 10),
    });
    setExpTitle('');
    setExpAmt('');
  };

  return (
    <div id="printable-report" className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex gap-2">
          {(['Daily', 'Weekly', 'Monthly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
                period === p ? 'bg-[#0F172A] text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-[#059669] text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">{period} Collected Revenue</div>
          <div className="text-2xl font-extrabold text-[#059669] mt-1">{formatLKR(totalSalesCents)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Recorded Expenses</div>
          <div className="text-2xl font-extrabold text-[#DC2626] mt-1">{formatLKR(totalExpensesCents)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Total Orders Tracked</div>
          <div className="text-2xl font-extrabold text-[#0F172A] mt-1">{orders.length}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm text-[#0F172A]">Payment Method Breakdown</h3>
          <div className="space-y-2 text-xs">
            {Object.entries(methodTotals).map(([method, amt]) => (
              <div key={method} className="flex justify-between p-3 rounded-xl bg-slate-50 font-semibold">
                <span>{method}</span>
                <span className="text-[#059669]">{formatLKR(amt)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm text-[#0F172A]">Expense Records</h3>
          <form onSubmit={handleAddExpense} className="flex flex-wrap gap-2 no-print">
            <input
              type="text"
              required
              value={expTitle}
              onChange={(e) => setExpTitle(e.target.value)}
              placeholder="Expense title..."
              className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
            <input
              type="number"
              required
              value={expAmt}
              onChange={(e) => setExpAmt(e.target.value)}
              placeholder="LKR"
              className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-[#059669] text-white text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </form>
          <div className="space-y-2 text-xs max-h-56 overflow-y-auto">
            {expenses.map((ex) => (
              <div key={ex.id} className="flex justify-between p-2.5 rounded-xl bg-slate-50">
                <div>
                  <div className="font-bold">{ex.title}</div>
                  <div className="text-slate-500">{ex.category} • {ex.date}</div>
                </div>
                <div className="font-bold text-[#DC2626]">{formatLKRCompact(ex.amountCents)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
