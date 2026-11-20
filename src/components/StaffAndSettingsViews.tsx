'use client';

import React, { useState } from 'react';
import { UserPlus, RotateCcw, Save } from 'lucide-react';
import { usePosStore } from '@/store/usePosStore';
import { UserRole } from '@/types/pos';

export function StaffManagementView() {
  const { staff, addStaffMember, toggleStaffActive, switchRole } = usePosStore();
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Waiter');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addStaffMember({ name: name.trim(), role, phone, email, active: true });
    setName('');
    setPhone('');
    setEmail('');
  };

  return (
    <div className="grid lg:grid-cols-12 gap-5">
      <form
        onSubmit={handleAdd}
        className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 h-fit"
      >
        <h3 className="font-extrabold text-base text-[#0F172A] flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#059669]" /> Add Staff Member
        </h3>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
        >
          <option value="Admin">Admin</option>
          <option value="Cashier">Cashier</option>
          <option value="Waiter">Waiter</option>
          <option value="Kitchen">Kitchen</option>
        </select>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
        />
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-sm"
        >
          Add Staff
        </button>
      </form>

      <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <th className="p-3.5">Name</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Contact</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Demo Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((st) => (
              <tr key={st.id}>
                <td className="p-3.5 font-bold text-[#0F172A]">{st.name}</td>
                <td className="p-3.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                    {st.role}
                  </span>
                </td>
                <td className="p-3.5 text-slate-600">{st.phone}</td>
                <td className="p-3.5">
                  <button
                    onClick={() => toggleStaffActive(st.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      st.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {st.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-3.5 text-right">
                  <button
                    onClick={() => switchRole(st.role)}
                    className="px-3 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-bold"
                  >
                    Switch Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SettingsView() {
  const { settings, updateSettings, resetDemoData } = usePosStore();
  const [form, setForm] = useState(settings);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  return (
    <div className="max-w-2xl space-y-5">
      <form
        onSubmit={handleSave}
        className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4"
      >
        <h3 className="font-extrabold text-lg text-[#0F172A]">Restaurant & POS Settings</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Restaurant Name</label>
            <input
              type="text"
              value={form.restaurantName}
              onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
            <input
              type="text"
              disabled
              value="LKR"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-100 font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tax (%)</label>
            <input
              type="number"
              min={0}
              max={30}
              value={form.taxRate}
              onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Service Charge (%)</label>
            <input
              type="number"
              min={0}
              max={25}
              value={form.serviceChargeRate}
              onChange={(e) => setForm({ ...form, serviceChargeRate: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Footer</label>
          <input
            type="text"
            value={form.receiptFooter}
            onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-sm"
        >
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </form>

      <div className="bg-white rounded-3xl border border-red-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-[#DC2626]">Reset Demo Environment</h4>
          <p className="text-xs text-slate-500">
            Restore all 20 tables, 44 menu items, orders, and seed history to defaults.
          </p>
        </div>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 rounded-xl border border-red-300 text-[#DC2626] text-xs font-bold hover:bg-red-50 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Reset Demo Data
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                resetDemoData();
                setConfirmReset(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#DC2626] text-white text-xs font-bold"
            >
              Confirm Reset
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-3 py-2 rounded-xl bg-slate-100 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
