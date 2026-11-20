'use client';

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { usePosStore } from '@/store/usePosStore';
import { formatLKRCompact } from '@/lib/currency';

export function CustomersView() {
  const { customers, orders, addCustomer } = usePosStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(customers[0]?.id || null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const id = addCustomer({ name, phone, email });
    setSelectedId(id);
    setName('');
    setPhone('');
    setEmail('');
  };

  const selected = customers.find((c) => c.id === selectedId);
  const customerOrders = selected ? orders.filter((o) => o.customerId === selected.id) : [];

  return (
    <div className="grid lg:grid-cols-12 gap-5">
      <form
        onSubmit={handleCreate}
        className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3.5 h-fit"
      >
        <h3 className="font-extrabold text-base text-[#0F172A] flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#059669]" /> Register Customer
        </h3>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
        />
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (+94 77 ...)"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional)"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
        />
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-sm"
        >
          Save Customer
        </button>
      </form>

      <div className="lg:col-span-8 space-y-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">Visits</th>
                <th className="p-3.5 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`cursor-pointer hover:bg-slate-50 ${
                    selectedId === c.id ? 'bg-emerald-50/60' : ''
                  }`}
                >
                  <td className="p-3.5 font-bold text-[#0F172A]">{c.name}</td>
                  <td className="p-3.5 text-slate-600">{c.phone}</td>
                  <td className="p-3.5">{c.visits}</td>
                  <td className="p-3.5 text-right font-bold text-[#059669]">
                    {formatLKRCompact(c.totalSpentCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h4 className="font-bold text-sm text-[#0F172A] mb-2">
              Order History — {selected.name}
            </h4>
            {customerOrders.length === 0 ? (
              <p className="text-xs text-slate-500">No recorded orders yet in this session.</p>
            ) : (
              <div className="space-y-1.5 text-xs">
                {customerOrders.map((o) => (
                  <div key={o.id} className="flex justify-between p-2 rounded-xl bg-slate-50">
                    <span className="font-bold">{o.orderNumber}</span>
                    <span>{o.status}</span>
                    <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
