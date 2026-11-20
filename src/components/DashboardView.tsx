'use client';

import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Grid2x2,
  ChefHat,
  Clock,
  CreditCard,
  Utensils,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { usePosStore } from '@/store/usePosStore';
import { formatLKRCompact, getOrderTotals } from '@/lib/currency';
import { NavPage } from './AppShell';
import { motion, riseItem, popItem, stagger, EASE } from '@/lib/motion';

export function DashboardView({ onNavigate }: { onNavigate: (p: NavPage) => void }) {
  const { orders, tables, payments, kitchenTickets } = usePosStore();

  const completedOrders = orders.filter((o) => o.status === 'Completed');
  const todaySalesCents = payments.reduce((sum, p) => sum + p.amountCents, 0);
  const avgOrderCents =
    completedOrders.length > 0
      ? Math.round(
          completedOrders.reduce((sum, o) => sum + getOrderTotals(o).totalCents, 0) /
            completedOrders.length
        )
      : 0;

  const availableTables = tables.filter((t) => t.status === 'Available').length;
  const occupiedTables = tables.filter((t) => t.status === 'Occupied').length;
  const reservedTables = tables.filter((t) => t.status === 'Reserved').length;
  const pendingPayTables = tables.filter((t) => t.status === 'Payment Pending').length;
  const activeKot = kitchenTickets.filter((t) => t.status === 'New' || t.status === 'Preparing').length;

  // Revenue Chart Data (sample presentation history + live today total)
  const revenueData = [
    { day: 'Mon', revenue: 142000 },
    { day: 'Tue', revenue: 168500 },
    { day: 'Wed', revenue: 154000 },
    { day: 'Thu', revenue: 189000 },
    { day: 'Fri', revenue: 245000 },
    { day: 'Sat', revenue: 288000 },
    { day: 'Today', revenue: Math.max(25000, Math.round(todaySalesCents / 100)) },
  ];

  // Category Breakdown from actual orders
  const catMap: Record<string, number> = {};
  for (const ord of orders) {
    if (ord.status === 'Cancelled') continue;
    for (const item of ord.items) {
      catMap[item.category] = (catMap[item.category] || 0) + Math.round((item.unitPriceCents * item.quantity) / 100);
    }
  }
  const categoryData = Object.entries(catMap)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 6);

  // Popular menu items
  const itemCounts: Record<string, { name: string; qty: number; revCents: number }> = {};
  for (const ord of orders) {
    for (const it of ord.items) {
      if (!itemCounts[it.menuItemId]) {
        itemCounts[it.menuItemId] = { name: it.name, qty: 0, revCents: 0 };
      }
      itemCounts[it.menuItemId].qty += it.quantity;
      itemCounts[it.menuItemId].revCents += it.unitPriceCents * it.quantity;
    }
  }
  const popularItems = Object.values(itemCounts).sort((a, b) => b.qty - a.qty).slice(0, 5);

  const kpis = [
    {
      label: "Today's Sales",
      value: formatLKRCompact(todaySalesCents),
      icon: TrendingUp,
      color: 'text-[#059669] bg-emerald-50',
    },
    {
      label: 'Total Orders',
      value: String(orders.length),
      icon: ShoppingBag,
      color: 'text-slate-800 bg-slate-100',
    },
    {
      label: 'Avg Order Value',
      value: formatLKRCompact(avgOrderCents),
      icon: Utensils,
      color: 'text-indigo-700 bg-indigo-50',
    },
    {
      label: 'Available Tables',
      value: `${availableTables} / ${tables.length}`,
      icon: Grid2x2,
      color: 'text-emerald-700 bg-emerald-50',
    },
    {
      label: 'Occupied Tables',
      value: String(occupiedTables),
      icon: Clock,
      color: 'text-[#DC2626] bg-red-50',
    },
    {
      label: 'Reserved Tables',
      value: String(reservedTables),
      icon: Clock,
      color: 'text-amber-700 bg-amber-50',
    },
    {
      label: 'Pending Payments',
      value: String(pendingPayTables),
      icon: CreditCard,
      color: 'text-purple-700 bg-purple-50',
    },
    {
      label: 'Active Kitchen Orders',
      value: String(activeKot),
      icon: ChefHat,
      color: 'text-amber-700 bg-amber-50',
    },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={stagger(0.08, 0.02)} className="space-y-6">
      {/* KPI Grid */}
      <motion.div variants={stagger(0.06)} className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <motion.div variants={popItem}
              whileHover={{ y: -4, boxShadow: '0 12px 28px -12px rgba(15,23,42,0.25)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              key={k.label}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500 truncate">{k.label}</div>
                <div className="text-lg lg:text-xl font-extrabold text-[#0F172A] mt-1 truncate">
                  {k.value}
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${k.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts */}
      <motion.div variants={riseItem} className="grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-[#0F172A]">Weekly Revenue Trend (LKR)</h3>
              <p className="text-xs text-slate-500">Live today figure combined with 6-day history</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `LKR ${v.toLocaleString()}`} />
                <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-sm text-[#0F172A] mb-4">Sales by Category (LKR)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `LKR ${v.toLocaleString()}`} />
                <Bar dataKey="sales" fill="#0F172A" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Bottom Tables: Popular Items & Recent Transactions */}
      <motion.div variants={riseItem} className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-[#0F172A]">Popular Menu Items</h3>
            <button onClick={() => onNavigate('pos')} className="text-xs font-bold text-[#059669] hover:underline">
              Open POS →
            </button>
          </div>
          <div className="space-y-2.5">
            {popularItems.map((it, idx) => (
              <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + idx * 0.06, ease: EASE }} key={it.name} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#0F172A] text-white font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-[#0F172A]">{it.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#059669]">{it.qty} sold</div>
                  <div className="text-[11px] text-slate-500">{formatLKRCompact(it.revCents)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-[#0F172A]">Recent Transactions</h3>
            <button onClick={() => onNavigate('orders')} className="text-xs font-bold text-[#059669] hover:underline">
              View All →
            </button>
          </div>
          <div className="space-y-2.5">
            {payments.slice(0, 5).map((p) => (
              <motion.div layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ ease: EASE }} key={p.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50">
                <div>
                  <div className="font-bold text-[#0F172A]">
                    {p.invoiceNumber} • {p.orderNumber}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {p.method} {p.tableNumber ? `• Table ${p.tableNumber}` : ''} • {new Date(p.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <div className="font-extrabold text-[#059669]">{formatLKRCompact(p.amountCents)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
