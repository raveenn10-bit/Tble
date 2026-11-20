'use client';

import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastContainer } from '@/components/ToastContainer';
import { LoginScreen } from '@/components/LoginScreen';
import { AppShell, NavPage } from '@/components/AppShell';
import { DashboardView } from '@/components/DashboardView';
import { PosView } from '@/components/PosView';
import { TableManagementView } from '@/components/TableManagementView';
import { KitchenDisplayView } from '@/components/KitchenDisplayView';
import { ReservationsView } from '@/components/ReservationsView';
import { OrdersView } from '@/components/OrdersView';
import { MenuManagementView } from '@/components/MenuManagementView';
import { InventoryView } from '@/components/InventoryView';
import { CustomersView } from '@/components/CustomersView';
import { ReportsView } from '@/components/ReportsView';
import { StaffManagementView, SettingsView } from '@/components/StaffAndSettingsViews';
import { usePosStore } from '@/store/usePosStore';
import { AnimatePresence, MotionConfig, PageTransition, motion, EASE } from '@/lib/motion';

export default function HomePage() {
  const { isAuthenticated } = usePosStore();
  const [mounted, setMounted] = useState(false);
  const [activePage, setActivePage] = useState<NavPage>('dashboard');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <img src="/images/icon.png" alt="Restro Pro POS" className="w-12 h-12 animate-pulse" />
          <div className="text-sm font-semibold text-slate-600">Loading Restro Pro POS...</div>
        </div>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
    <ErrorBoundary>
      <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <motion.div key="login" exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: 0.3, ease: EASE }}>
          <LoginScreen />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
        <AppShell activePage={activePage} onNavigate={setActivePage}>
          <PageTransition pageKey={activePage} cssStagger={!['dashboard', 'pos', 'tables', 'kitchen'].includes(activePage)}>
          {activePage === 'dashboard' && <DashboardView onNavigate={setActivePage} />}
          {activePage === 'pos' && <PosView />}
          {activePage === 'tables' && <TableManagementView onNavigate={setActivePage} />}
          {activePage === 'kitchen' && <KitchenDisplayView />}
          {activePage === 'reservations' && <ReservationsView onNavigate={setActivePage} />}
          {activePage === 'orders' && <OrdersView onNavigate={setActivePage} />}
          {activePage === 'menu' && <MenuManagementView />}
          {activePage === 'inventory' && <InventoryView />}
          {activePage === 'customers' && <CustomersView />}
          {activePage === 'reports' && <ReportsView />}
          {activePage === 'staff' && <StaffManagementView />}
          {activePage === 'settings' && <SettingsView />}
          </PageTransition>
        </AppShell>
        </motion.div>
      )}
      </AnimatePresence>
      <ToastContainer />
    </ErrorBoundary>
    </MotionConfig>
  );
}
