'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Grid2x2,
  ChefHat,
  CalendarClock,
  ReceiptText,
  BookOpen,
  Package,
  Users,
  BarChart3,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { usePosStore } from '@/store/usePosStore';
import { UserRole } from '@/types/pos';
import { motion, AnimatePresence, SPRING, EASE } from '@/lib/motion';

export type NavPage =
  | 'dashboard'
  | 'pos'
  | 'tables'
  | 'kitchen'
  | 'reservations'
  | 'orders'
  | 'menu'
  | 'inventory'
  | 'customers'
  | 'reports'
  | 'staff'
  | 'settings';

interface NavItem {
  id: NavPage;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard, roles: ['Admin', 'Cashier', 'Waiter', 'Kitchen'] },
  { id: 'pos', label: 'Restaurant POS', shortLabel: 'POS', icon: UtensilsCrossed, roles: ['Admin', 'Cashier', 'Waiter'] },
  { id: 'tables', label: 'Table Management', shortLabel: 'Tables', icon: Grid2x2, roles: ['Admin', 'Cashier', 'Waiter'] },
  { id: 'kitchen', label: 'Kitchen Display', shortLabel: 'KDS', icon: ChefHat, roles: ['Admin', 'Waiter', 'Kitchen'] },
  { id: 'reservations', label: 'Reservations', shortLabel: 'Bookings', icon: CalendarClock, roles: ['Admin', 'Cashier', 'Waiter'] },
  { id: 'orders', label: 'Orders', shortLabel: 'Orders', icon: ReceiptText, roles: ['Admin', 'Cashier', 'Waiter'] },
  { id: 'menu', label: 'Menu Management', shortLabel: 'Menu', icon: BookOpen, roles: ['Admin'] },
  { id: 'inventory', label: 'Inventory', shortLabel: 'Stock', icon: Package, roles: ['Admin', 'Kitchen'] },
  { id: 'customers', label: 'Customers', shortLabel: 'Guests', icon: Users, roles: ['Admin', 'Cashier'] },
  { id: 'reports', label: 'Reports & Analytics', shortLabel: 'Reports', icon: BarChart3, roles: ['Admin', 'Cashier'] },
  { id: 'staff', label: 'Staff Management', shortLabel: 'Staff', icon: UserCog, roles: ['Admin'] },
  { id: 'settings', label: 'Settings', shortLabel: 'Settings', icon: Settings, roles: ['Admin'] },
];

interface AppShellProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  children: React.ReactNode;
}

export function AppShell({ activePage, onNavigate, children }: AppShellProps) {
  const { currentRole, currentUserName, switchRole, logoutDemo, kitchenTickets, tables, settings } =
    usePosStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(currentRole));
  const bottomNavIds: NavPage[] = ['dashboard', 'tables', 'pos', 'kitchen'];
  const mobileBottomNav = visibleNav.filter((item) => bottomNavIds.includes(item.id)).slice(0, 4);

  const activeKotCount = kitchenTickets.filter((t) => t.status === 'New' || t.status === 'Preparing').length;
  const occupiedCount = tables.filter((t) => t.status === 'Occupied' || t.status === 'Payment Pending').length;

  const handleNav = (page: NavPage) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#0F172A] overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-[#0F172A] text-white transition-all duration-200 shrink-0 no-print ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img src="/images/icon.png" alt="Restro Pro" className="w-9 h-9 rounded-lg bg-white p-0.5 shrink-0" />
            {!collapsed && (
              <div className="leading-tight truncate">
                <div className="font-extrabold text-sm tracking-tight text-white">Restro Pro POS</div>
                <div className="text-[10px] text-emerald-400 font-semibold truncate">
                  {settings.restaurantName}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 py-3 px-2.5 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                data-testid={`nav-${item.id}`}
                title={collapsed ? item.label : undefined}
                className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'text-white' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-xl bg-[#059669] shadow-sm shadow-emerald-900/40"
                    transition={SPRING}
                  />
                )}
                <Icon className="relative w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                {!collapsed && <span className="relative flex-1 text-left truncate">{item.label}</span>}
                {!collapsed && item.id === 'kitchen' && activeKotCount > 0 && (
                  <motion.span
                    key={activeKotCount}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    className="relative px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#F59E0B] text-slate-950"
                  >
                    {activeKotCount}
                  </motion.span>
                )}
                {!collapsed && item.id === 'tables' && (
                  <span className="relative px-2 py-0.5 text-[11px] font-bold rounded-full bg-slate-800 text-slate-200">
                    {occupiedCount}/{tables.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-2">
          {!collapsed && (
            <div className="text-[11px] text-slate-400 px-1">
              Developed by <span className="text-slate-200 font-semibold">Harsh Apex Digital Solutions</span>
            </div>
          )}
          <button
            onClick={logoutDemo}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Exit Demo</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <motion.div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="relative w-72 max-w-[85vw] bg-[#0F172A] text-white flex flex-col h-full z-10 shadow-2xl"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <img src="/images/icon.png" alt="Restro Pro" className="w-8 h-8 rounded-lg bg-white p-0.5" />
                <div className="leading-tight">
                  <div className="font-extrabold text-sm">Restro Pro POS</div>
                  <div className="text-[10px] text-emerald-400">{settings.restaurantName}</div>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close mobile menu"
                className="p-2 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <motion.nav
              className="flex-1 py-3 px-3 space-y-1 overflow-y-auto"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03, delayChildren: 0.1 } } }}
            >
              {visibleNav.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.id;
                return (
                  <motion.button
                    variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    data-testid={`mobile-nav-${item.id}`}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition min-h-[44px] ${
                      active ? 'bg-[#059669] text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.id === 'kitchen' && activeKotCount > 0 && (
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#F59E0B] text-slate-950">
                        {activeKotCount}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </motion.nav>
            <div className="p-4 border-t border-slate-800 space-y-2">
              <button
                onClick={logoutDemo}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Exit Demo
              </button>
              <div className="text-[11px] text-slate-400 text-center">
                Developed by Harsh Apex Digital Solutions
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="min-h-16 py-2 bg-white border-b border-slate-200 px-3 sm:px-4 lg:px-6 flex flex-wrap items-center justify-between gap-2 sm:gap-3 shrink-0 no-print">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              data-testid="mobile-menu-btn"
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.h1
                  key={activePage}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="text-sm sm:text-base lg:text-lg font-bold text-[#0F172A] truncate"
                >
                  {NAV_ITEMS.find((n) => n.id === activePage)?.label || 'Restro Pro POS'}
                </motion.h1>
              </AnimatePresence>
              <p className="text-xs text-slate-500 hidden sm:block truncate">
                {settings.restaurantName} • {settings.address}
              </p>
            </div>
          </div>

          {/* Demo Role Switcher — horizontally scrollable on small mobile */}
          <div className="flex items-center gap-2 sm:gap-3 max-w-full overflow-x-auto">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              {(['Admin', 'Cashier', 'Waiter', 'Kitchen'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => switchRole(role)}
                  data-testid={`role-switch-${role.toLowerCase()}`}
                  className={`relative px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap ${
                    currentRole === role ? 'text-[#059669]' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {currentRole === role && (
                    <motion.span
                      layoutId="role-switch-pill"
                      className="absolute inset-0 rounded-lg bg-white shadow-sm"
                      transition={SPRING}
                    />
                  )}
                  <span className="relative">{role}</span>
                </button>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 shrink-0">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#059669] font-bold text-xs flex items-center justify-center">
                {currentUserName
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="text-xs leading-tight">
                <div className="font-semibold text-slate-800">{currentUserName}</div>
                <div className="text-slate-500">{currentRole} (Demo)</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 lg:p-6 pb-24 lg:pb-6 overflow-y-auto">{children}</main>

        <footer className="hidden lg:flex bg-white border-t border-slate-200 px-6 py-2.5 text-xs text-slate-500 flex-wrap items-center justify-between gap-2 no-print">
          <span>Restro Pro POS — Demo Environment (LocalStorage Persistence)</span>
          <span>
            Developed by <strong className="text-slate-700">Harsh Apex Digital Solutions</strong>
          </span>
        </footer>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_16px_rgba(15,23,42,0.06)] no-print">
          {mobileBottomNav.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`relative flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl text-[11px] font-bold transition-colors ${
                  active ? 'text-[#059669]' : 'text-slate-500'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="bottom-nav-pill"
                    className="absolute inset-0 rounded-xl bg-emerald-50"
                    transition={SPRING}
                  />
                )}
                <motion.span
                  className="relative"
                  animate={active ? { y: [0, -3, 0] } : { y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                </motion.span>
                <span className="relative">{item.shortLabel}</span>
                {item.id === 'kitchen' && activeKotCount > 0 && (
                  <span className="absolute top-0.5 right-1.5 w-4 h-4 rounded-full bg-[#F59E0B] text-slate-950 text-[9px] font-extrabold flex items-center justify-center">
                    {activeKotCount}
                  </span>
                )}
              </button>
            );
          })}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl text-[11px] font-bold text-slate-500"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span>More</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
