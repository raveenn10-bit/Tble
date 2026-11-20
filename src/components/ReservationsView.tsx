'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Users, Clock, CheckCircle2, XCircle, UtensilsCrossed } from 'lucide-react';
import { usePosStore } from '@/store/usePosStore';
import { NavPage } from './AppShell';

export function ReservationsView({ onNavigate }: { onNavigate: (p: NavPage) => void }) {
  const { reservations, tables, addReservation, updateReservationStatus, convertReservationToOrder } =
    usePosStore();

  const today = new Date().toISOString().slice(0, 10);
  const [filterDate, setFilterDate] = useState(today);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('19:00');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [guestCount, setGuestCount] = useState(4);
  const [tableId, setTableId] = useState(tables[1]?.id || tables[0]?.id || '');
  const [specialRequests, setSpecialRequests] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addReservation({
      customerName,
      phone,
      date,
      time,
      durationMinutes,
      guestCount,
      tableId,
      specialRequests,
    });
    if (!res.ok) {
      setFormError(res.error || 'Could not create reservation.');
      return;
    }
    setFormError('');
    setCustomerName('');
    setPhone('');
    setSpecialRequests('');
  };

  const visibleReservations = reservations.filter((r) => !filterDate || r.date === filterDate);

  return (
    <div className="grid lg:grid-cols-12 gap-5">
      {/* Left: New Reservation Form */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3.5 h-fit"
      >
        <div className="flex items-center gap-2 font-extrabold text-base text-[#0F172A]">
          <Plus className="w-5 h-5 text-[#059669]" /> New Reservation
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g., Kamal Perera"
            data-testid="res-name-input"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+94 77 123 4567"
            data-testid="res-phone-input"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              data-testid="res-time-input"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Guests</label>
            <input
              type="number"
              min={1}
              max={20}
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (min)</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
            >
              <option value={60}>60 min</option>
              <option value={90}>90 min</option>
              <option value={120}>120 min</option>
              <option value={180}>180 min</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Table</label>
          <select
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
            data-testid="res-table-select"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
          >
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.number} — {t.section} ({t.capacity} seats)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Special Requests</label>
          <input
            type="text"
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Birthday, high chair, quiet corner..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        {formError && (
          <div data-testid="res-error-box" className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#DC2626] text-xs font-semibold">
            {formError}
          </div>
        )}

        <button
          type="submit"
          data-testid="create-reservation-btn"
          className="w-full py-3 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-sm"
        >
          Confirm Reservation
        </button>
      </form>

      {/* Right: Reservation Calendar & List */}
      <div className="lg:col-span-8 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-sm text-[#0F172A]">
            <Calendar className="w-4 h-4 text-[#059669]" /> Reservation Schedule
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold"
            />
            <button
              onClick={() => setFilterDate('')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold hover:bg-slate-200"
            >
              Show All
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {visibleReservations.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[#0F172A]">{r.customerName}</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#0F172A] text-white text-[11px] font-bold">
                    Table {r.tableNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      r.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.status === 'Seated'
                        ? 'bg-blue-100 text-blue-800'
                        : r.status === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                  <span>{r.phone}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {r.date} at {r.time} ({r.durationMinutes}m)
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {r.guestCount} guests
                  </span>
                </div>
                {r.specialRequests && (
                  <div className="text-xs text-amber-700 font-medium">Note: {r.specialRequests}</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {r.status === 'Confirmed' && (
                  <>
                    <button
                      onClick={() => {
                        const ordId = convertReservationToOrder(r.id);
                        if (ordId) onNavigate('pos');
                      }}
                      className="px-3 py-2 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" /> Seat & Order
                    </button>
                    <button
                      onClick={() => updateReservationStatus(r.id, 'Cancelled')}
                      className="p-2 rounded-xl border border-slate-200 text-[#DC2626] hover:bg-red-50"
                      title="Cancel Reservation"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
                {r.status === 'Seated' && (
                  <button
                    onClick={() => updateReservationStatus(r.id, 'Completed')}
                    className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
