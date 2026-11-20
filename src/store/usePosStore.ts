'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Customer,
  DiscountType,
  ExpenseRecord,
  InventoryItem,
  KitchenStatus,
  KitchenTicket,
  MenuCategory,
  MenuItem,
  Order,
  OrderItem,
  OrderType,
  PaymentMethod,
  PaymentRecord,
  Reservation,
  ReservationStatus,
  RestaurantSettings,
  RestaurantTable,
  StaffMember,
  StockMovement,
  TableSection,
  TableShape,
  TableStatus,
  UserRole,
} from '@/types/pos';
import {
  SEED_CUSTOMERS,
  SEED_EXPENSES,
  SEED_INVENTORY,
  SEED_KITCHEN_TICKETS,
  SEED_MENU,
  SEED_ORDERS,
  SEED_PAYMENTS,
  SEED_RESERVATIONS,
  SEED_SETTINGS,
  SEED_STAFF,
  SEED_STOCK_MOVEMENTS,
  SEED_TABLES,
} from '@/data/seed';
import { getOrderTotals } from '@/lib/currency';

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface PosState {
  // Auth & Demo Role
  isAuthenticated: boolean;
  currentRole: UserRole;
  currentUserName: string;

  // Navigation & Active Context
  activeOrderId: string | null;
  selectedTableId: string | null;

  // Core Data
  tables: RestaurantTable[];
  menu: MenuItem[];
  orders: Order[];
  kitchenTickets: KitchenTicket[];
  payments: PaymentRecord[];
  reservations: Reservation[];
  customers: Customer[];
  staff: StaffMember[];
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  expenses: ExpenseRecord[];
  settings: RestaurantSettings;

  // Sequences
  orderSeq: number;
  kotSeq: number;
  invoiceSeq: number;

  // Ephemeral UI Toasts
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], message: string) => void;
  dismissToast: (id: string) => void;

  // Auth Actions
  loginDemo: (email?: string, role?: UserRole) => boolean;
  logoutDemo: () => void;
  switchRole: (role: UserRole) => void;

  // Table Management Actions
  selectTable: (tableId: string | null) => void;
  startTableOrder: (tableId: string, guestCount: number, waiterId: string, customerId?: string) => string | null;
  updateTableStatus: (tableId: string, status: TableStatus) => void;
  updateTablePosition: (tableId: string, x: number, y: number) => void;
  addTable: (payload: { number: string; section: TableSection; capacity: number; shape: TableShape }) => boolean;
  editTable: (tableId: string, payload: Partial<Pick<RestaurantTable, 'number' | 'section' | 'capacity' | 'shape'>>) => void;
  deleteTable: (tableId: string) => boolean;
  transferTableOrder: (fromTableId: string, toTableId: string) => boolean;
  mergeTables: (primaryTableId: string, secondaryTableId: string) => boolean;

  // POS & Order Actions
  setActiveOrder: (orderId: string | null) => void;
  createTakeawayOrDeliveryOrder: (type: 'Takeaway' | 'Delivery', customerId?: string) => string;
  addItemToOrder: (orderId: string, menuItem: MenuItem, customizations?: string[], notes?: string) => void;
  updateOrderItemQty: (orderId: string, orderItemId: string, delta: number) => void;
  updateOrderItemNotes: (orderId: string, orderItemId: string, notes: string) => void;
  removeOrderItem: (orderId: string, orderItemId: string) => void;
  setOrderDiscount: (orderId: string, discountType: DiscountType, discountValue: number) => void;
  setOrderMeta: (orderId: string, meta: Partial<Pick<Order, 'customerId' | 'waiterId' | 'type' | 'notes' | 'guestCount'>>) => void;
  holdOrder: (orderId: string) => void;
  resumeOrder: (orderId: string) => void;
  sendOrderToKitchen: (orderId: string, urgent?: boolean) => boolean;

  // Kitchen Display Actions
  advanceKitchenTicket: (ticketId: string, nextStatus: KitchenStatus) => void;
  toggleTicketUrgent: (ticketId: string) => void;

  // Payment & Billing Actions
  processPayment: (payload: {
    orderId: string;
    method: PaymentMethod;
    amountCents: number;
    cashReceivedCents?: number;
    splitLabel?: string;
    breakdown?: { method: Exclude<PaymentMethod, 'Mixed'>; amountCents: number }[];
  }) => PaymentRecord | null;

  // Reservations
  addReservation: (payload: Omit<Reservation, 'id' | 'createdAt' | 'status' | 'tableNumber'>) => { ok: boolean; error?: string };
  updateReservationStatus: (reservationId: string, status: ReservationStatus) => void;
  convertReservationToOrder: (reservationId: string, waiterId?: string) => string | null;

  // Menu Management
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  // Inventory
  adjustInventory: (ingredientId: string, delta: number, reason: string) => void;

  // Customers
  addCustomer: (payload: { name: string; phone: string; email?: string; notes?: string }) => string;

  // Staff
  addStaffMember: (payload: Omit<StaffMember, 'id'>) => void;
  toggleStaffActive: (staffId: string) => void;

  // Expenses & Settings
  addExpense: (payload: Omit<ExpenseRecord, 'id'>) => void;
  updateSettings: (updates: Partial<RestaurantSettings>) => void;
  resetDemoData: () => void;
}

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentRole: 'Admin',
      currentUserName: 'Chamilka Harshan',

      activeOrderId: 'ord-101',
      selectedTableId: 'tbl-1',

      tables: SEED_TABLES,
      menu: SEED_MENU,
      orders: SEED_ORDERS,
      kitchenTickets: SEED_KITCHEN_TICKETS,
      payments: SEED_PAYMENTS,
      reservations: SEED_RESERVATIONS,
      customers: SEED_CUSTOMERS,
      staff: SEED_STAFF,
      inventory: SEED_INVENTORY,
      stockMovements: SEED_STOCK_MOVEMENTS,
      expenses: SEED_EXPENSES,
      settings: SEED_SETTINGS,

      orderSeq: 1007,
      kotSeq: 46,
      invoiceSeq: 1000,

      toasts: [],
      addToast: (type, message) => {
        const id = uid('tst');
        set((s) => ({ toasts: [...s.toasts.slice(-3), { id, type, message }] }));
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            get().dismissToast(id);
          }, 3600);
        }
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      loginDemo: (_email, role = 'Admin') => {
        const matched = get().staff.find((st) => st.role === role) || get().staff[0];
        set({
          isAuthenticated: true,
          currentRole: role,
          currentUserName: matched?.name || 'Demo Admin',
        });
        get().addToast('success', `Signed in as ${role} (${matched?.name || 'Demo'})`);
        return true;
      },

      logoutDemo: () => set({ isAuthenticated: false }),

      switchRole: (role) => {
        const matched = get().staff.find((st) => st.role === role);
        set({
          currentRole: role,
          currentUserName: matched?.name || `Demo ${role}`,
        });
        get().addToast('info', `Switched demo role to ${role}`);
      },

      selectTable: (tableId) => {
        const tbl = get().tables.find((t) => t.id === tableId);
        set({
          selectedTableId: tableId,
          activeOrderId: tbl?.activeOrderId || get().activeOrderId,
        });
      },

      startTableOrder: (tableId, guestCount, waiterId, customerId) => {
        const state = get();
        const table = state.tables.find((t) => t.id === tableId);
        if (!table) return null;
        if (table.activeOrderId) {
          set({ activeOrderId: table.activeOrderId, selectedTableId: tableId });
          return table.activeOrderId;
        }
        const safeGuests = Math.max(1, Math.min(20, Math.floor(guestCount || 1)));
        const orderId = uid('ord');
        const orderNumber = `ORD-${state.orderSeq}`;
        const nowIso = new Date().toISOString();

        const newOrder: Order = {
          id: orderId,
          orderNumber,
          type: 'Dine-In',
          tableId,
          tableNumber: table.number,
          waiterId: waiterId || state.staff.find((s) => s.role === 'Waiter')?.id,
          customerId,
          guestCount: safeGuests,
          items: [],
          discountType: 'none',
          discountValue: 0,
          serviceChargeRate: state.settings.serviceChargeRate,
          taxRate: state.settings.taxRate,
          status: 'Draft',
          createdAt: nowIso,
          updatedAt: nowIso,
          paidAmountCents: 0,
        };

        set((s) => ({
          orderSeq: s.orderSeq + 1,
          orders: [newOrder, ...s.orders],
          activeOrderId: orderId,
          selectedTableId: tableId,
          tables: s.tables.map((t) =>
            t.id === tableId
              ? {
                  ...t,
                  status: 'Occupied',
                  guestCount: safeGuests,
                  assignedWaiterId: newOrder.waiterId,
                  occupiedSince: nowIso,
                  activeOrderId: orderId,
                }
              : t
          ),
        }));
        get().addToast('success', `Started order ${orderNumber} on Table ${table.number}`);
        return orderId;
      },

      updateTableStatus: (tableId, status) => {
        const table = get().tables.find((t) => t.id === tableId);
        if (!table) return;
        if (table.activeOrderId && status === 'Available') {
          get().addToast('error', `Table ${table.number} has an active order. Complete payment first.`);
          return;
        }
        set((s) => ({
          tables: s.tables.map((t) =>
            t.id === tableId
              ? {
                  ...t,
                  status,
                  ...(status === 'Available'
                    ? {
                        guestCount: undefined,
                        assignedWaiterId: undefined,
                        occupiedSince: undefined,
                        activeOrderId: undefined,
                      }
                    : {}),
                }
              : t
          ),
        }));
        get().addToast('info', `Table ${table.number} marked ${status}`);
      },

      updateTablePosition: (tableId, x, y) => {
        const clampedX = Math.max(0, Math.min(85, Math.round(x)));
        const clampedY = Math.max(0, Math.min(80, Math.round(y)));
        set((s) => ({
          tables: s.tables.map((t) => (t.id === tableId ? { ...t, x: clampedX, y: clampedY } : t)),
        }));
      },

      addTable: ({ number, section, capacity, shape }) => {
        const cleanNum = number.trim().toUpperCase();
        if (!cleanNum) {
          get().addToast('error', 'Table number is required.');
          return false;
        }
        if (get().tables.some((t) => t.number.toUpperCase() === cleanNum)) {
          get().addToast('error', `Table ${cleanNum} already exists.`);
          return false;
        }
        const safeCap = Math.max(1, Math.min(20, Math.floor(capacity || 4)));
        const width = shape === 'rectangular' ? 150 : 100;
        const height = shape === 'rectangular' ? 96 : 100;
        const newTable: RestaurantTable = {
          id: uid('tbl'),
          number: cleanNum,
          section,
          capacity: safeCap,
          shape,
          status: 'Available',
          x: 12 + (get().tables.length % 4) * 18,
          y: 16 + (get().tables.length % 3) * 24,
          width,
          height,
        };
        set((s) => ({ tables: [...s.tables, newTable] }));
        get().addToast('success', `Added Table ${cleanNum} (${section})`);
        return true;
      },

      editTable: (tableId, payload) => {
        set((s) => ({
          tables: s.tables.map((t) => (t.id === tableId ? { ...t, ...payload } : t)),
        }));
        get().addToast('success', 'Table updated');
      },

      deleteTable: (tableId) => {
        const table = get().tables.find((t) => t.id === tableId);
        if (!table) return false;
        if (table.status !== 'Available' && table.status !== 'Cleaning') {
          get().addToast('error', `Cannot delete Table ${table.number} while ${table.status}.`);
          return false;
        }
        if (table.activeOrderId) {
          get().addToast('error', `Cannot delete Table ${table.number} with an active order.`);
          return false;
        }
        set((s) => ({
          tables: s.tables.filter((t) => t.id !== tableId),
          selectedTableId: s.selectedTableId === tableId ? null : s.selectedTableId,
        }));
        get().addToast('info', `Deleted Table ${table.number}`);
        return true;
      },

      transferTableOrder: (fromTableId, toTableId) => {
        const s = get();
        const fromTbl = s.tables.find((t) => t.id === fromTableId);
        const toTbl = s.tables.find((t) => t.id === toTableId);
        if (!fromTbl || !toTbl) return false;
        if (!fromTbl.activeOrderId) {
          get().addToast('error', `Table ${fromTbl.number} has no active order to transfer.`);
          return false;
        }
        if (toTbl.status !== 'Available' || toTbl.activeOrderId) {
          get().addToast('error', `Target Table ${toTbl.number} must be Available.`);
          return false;
        }

        const orderId = fromTbl.activeOrderId;
        set((state) => ({
          tables: state.tables.map((t) => {
            if (t.id === fromTableId) {
              return {
                ...t,
                status: 'Cleaning',
                guestCount: undefined,
                assignedWaiterId: undefined,
                occupiedSince: undefined,
                activeOrderId: undefined,
              };
            }
            if (t.id === toTableId) {
              return {
                ...t,
                status: fromTbl.status,
                guestCount: fromTbl.guestCount,
                assignedWaiterId: fromTbl.assignedWaiterId,
                occupiedSince: fromTbl.occupiedSince,
                activeOrderId: orderId,
              };
            }
            return t;
          }),
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, tableId: toTableId, tableNumber: toTbl.number, updatedAt: new Date().toISOString() } : o
          ),
          kitchenTickets: state.kitchenTickets.map((kt) =>
            kt.orderId === orderId ? { ...kt, tableNumber: toTbl.number } : kt
          ),
          selectedTableId: toTableId,
        }));
        get().addToast('success', `Transferred order from ${fromTbl.number} to ${toTbl.number}`);
        return true;
      },

      mergeTables: (primaryTableId, secondaryTableId) => {
        if (primaryTableId === secondaryTableId) {
          get().addToast('error', 'Select two different tables to merge.');
          return false;
        }
        const s = get();
        const primary = s.tables.find((t) => t.id === primaryTableId);
        const secondary = s.tables.find((t) => t.id === secondaryTableId);
        if (!primary || !secondary) return false;
        if (!primary.activeOrderId) {
          get().addToast('error', 'Primary table must have an active occupied order.');
          return false;
        }
        if (secondary.status !== 'Occupied' && secondary.status !== 'Available') {
          get().addToast('error', `Table ${secondary.number} (${secondary.status}) cannot be merged right now.`);
          return false;
        }

        const primaryOrder = s.orders.find((o) => o.id === primary.activeOrderId);
        const secondaryOrder = secondary.activeOrderId
          ? s.orders.find((o) => o.id === secondary.activeOrderId)
          : undefined;

        if (secondaryOrder && secondaryOrder.paidAmountCents > 0) {
          get().addToast('error', `Table ${secondary.number} already has partial payments and cannot be merged.`);
          return false;
        }

        const mergedItems: OrderItem[] = [...(primaryOrder?.items || [])];
        if (secondaryOrder) {
          for (const secItem of secondaryOrder.items) {
            const existing = mergedItems.find(
              (i) => i.menuItemId === secItem.menuItemId && (i.notes || '') === (secItem.notes || '')
            );
            if (existing) {
              existing.quantity += secItem.quantity;
              existing.sentToKitchenQty += secItem.sentToKitchenQty;
            } else {
              mergedItems.push({ ...secItem });
            }
          }
        }

        const totalGuests = (primary.guestCount || 0) + (secondary.guestCount || 0);
        const mergedLabel = `${primary.number}+${secondary.number}`;

        set((state) => ({
          orders: state.orders
            .filter((o) => o.id !== secondaryOrder?.id)
            .map((o) =>
              o.id === primary.activeOrderId
                ? {
                    ...o,
                    items: mergedItems,
                    guestCount: totalGuests,
                    tableNumber: mergedLabel,
                    updatedAt: new Date().toISOString(),
                  }
                : o
            ),
          kitchenTickets: state.kitchenTickets.map((kt) =>
            kt.orderId === secondaryOrder?.id
              ? { ...kt, orderId: primary.activeOrderId!, tableNumber: mergedLabel }
              : kt.orderId === primary.activeOrderId
              ? { ...kt, tableNumber: mergedLabel }
              : kt
          ),
          tables: state.tables.map((t) => {
            if (t.id === primaryTableId) {
              return {
                ...t,
                capacity: primary.capacity + secondary.capacity,
                guestCount: totalGuests,
                mergedLabel,
                mergedFromIds: [...(primary.mergedFromIds || []), secondary.id],
              };
            }
            if (t.id === secondaryTableId) {
              return {
                ...t,
                status: 'Available',
                guestCount: undefined,
                assignedWaiterId: undefined,
                occupiedSince: undefined,
                activeOrderId: undefined,
              };
            }
            return t;
          }),
        }));

        get().addToast('success', `Merged ${primary.number} & ${secondary.number} into ${mergedLabel}`);
        return true;
      },

      setActiveOrder: (orderId) => set({ activeOrderId: orderId }),

      createTakeawayOrDeliveryOrder: (type, customerId) => {
        const s = get();
        const orderId = uid('ord');
        const orderNumber = `ORD-${s.orderSeq}`;
        const nowIso = new Date().toISOString();
        const newOrder: Order = {
          id: orderId,
          orderNumber,
          type,
          customerId,
          waiterId: s.staff.find((st) => st.name === s.currentUserName)?.id || s.staff[0]?.id,
          items: [],
          discountType: 'none',
          discountValue: 0,
          serviceChargeRate: 0, // service charge applies to dine-in only
          taxRate: s.settings.taxRate,
          status: 'Draft',
          createdAt: nowIso,
          updatedAt: nowIso,
          paidAmountCents: 0,
        };
        set((state) => ({
          orderSeq: state.orderSeq + 1,
          orders: [newOrder, ...state.orders],
          activeOrderId: orderId,
          selectedTableId: null,
        }));
        get().addToast('success', `Created ${type} order ${orderNumber}`);
        return orderId;
      },

      addItemToOrder: (orderId, menuItem, customizations = [], notes = '') => {
        if (!menuItem.available) {
          get().addToast('warning', `${menuItem.name} is currently unavailable.`);
          return;
        }
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            const customKey = [...customizations].sort().join('|');
            const existing = order.items.find(
              (it) =>
                it.menuItemId === menuItem.id &&
                (it.notes || '') === notes &&
                [...(it.customizations || [])].sort().join('|') === customKey
            );
            const updatedItems = existing
              ? order.items.map((it) => (it.id === existing.id ? { ...it, quantity: it.quantity + 1 } : it))
              : [
                  ...order.items,
                  {
                    id: uid('oi'),
                    menuItemId: menuItem.id,
                    name: menuItem.name,
                    category: menuItem.category,
                    unitPriceCents: menuItem.priceCents,
                    quantity: 1,
                    notes: notes || undefined,
                    customizations: customizations.length > 0 ? customizations : undefined,
                    isBeverage: menuItem.isBeverage,
                    sentToKitchenQty: 0,
                  },
                ];
            return { ...order, items: updatedItems, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      updateOrderItemQty: (orderId, orderItemId, delta) => {
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            const updatedItems = order.items
              .map((it) => {
                if (it.id !== orderItemId) return it;
                const nextQty = it.quantity + delta;
                if (nextQty < it.sentToKitchenQty) {
                  get().addToast('warning', 'Cannot reduce below quantity already sent to kitchen.');
                  return it;
                }
                return { ...it, quantity: nextQty };
              })
              .filter((it) => it.quantity > 0);
            return { ...order, items: updatedItems, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      updateOrderItemNotes: (orderId, orderItemId, notes) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  items: order.items.map((it) => (it.id === orderItemId ? { ...it, notes } : it)),
                  updatedAt: new Date().toISOString(),
                }
              : order
          ),
        }));
      },

      removeOrderItem: (orderId, orderItemId) => {
        const order = get().orders.find((o) => o.id === orderId);
        const target = order?.items.find((i) => i.id === orderItemId);
        if (target && target.sentToKitchenQty > 0) {
          get().addToast('warning', 'Item already sent to kitchen cannot be deleted.');
          return;
        }
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, items: o.items.filter((it) => it.id !== orderItemId), updatedAt: new Date().toISOString() }
              : o
          ),
        }));
      },

      setOrderDiscount: (orderId, discountType, discountValue) => {
        const safeVal = Math.max(0, Number(discountValue) || 0);
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, discountType, discountValue: discountType === 'percentage' ? Math.min(100, safeVal) : safeVal }
              : o
          ),
        }));
      },

      setOrderMeta: (orderId, meta) => {
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;
            const nextType = meta.type || o.type;
            const serviceChargeRate = nextType === 'Dine-In' ? state.settings.serviceChargeRate : 0;
            return { ...o, ...meta, serviceChargeRate, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      holdOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, status: 'Held' } : o)),
        }));
        get().addToast('info', 'Order placed on Hold');
      },

      resumeOrder: (orderId) => {
        set((state) => ({
          activeOrderId: orderId,
          orders: state.orders.map((o) => (o.id === orderId && o.status === 'Held' ? { ...o, status: 'Draft' } : o)),
        }));
        get().addToast('info', 'Order resumed');
      },

      sendOrderToKitchen: (orderId, urgent = false) => {
        const s = get();
        const order = s.orders.find((o) => o.id === orderId);
        if (!order || order.items.length === 0) {
          get().addToast('warning', 'Add items before sending to kitchen.');
          return false;
        }

        // Only send unsent delta quantities!
        const unsentFood = order.items
          .filter((i) => !i.isBeverage && i.quantity > i.sentToKitchenQty)
          .map((i) => ({
            id: i.id,
            name: i.name,
            quantity: i.quantity - i.sentToKitchenQty,
            notes: i.notes,
            customizations: i.customizations,
          }));

        const unsentBev = order.items
          .filter((i) => i.isBeverage && i.quantity > i.sentToKitchenQty)
          .map((i) => ({
            id: i.id,
            name: i.name,
            quantity: i.quantity - i.sentToKitchenQty,
            notes: i.notes,
            customizations: i.customizations,
          }));

        if (unsentFood.length === 0 && unsentBev.length === 0) {
          get().addToast('info', 'All items on this order have already been sent to the kitchen.');
          return false;
        }

        const waiter = s.staff.find((st) => st.id === order.waiterId)?.name || s.currentUserName;
        const nowIso = new Date().toISOString();
        const newTickets: KitchenTicket[] = [];
        let seq = s.kotSeq;

        if (unsentFood.length > 0) {
          newTickets.push({
            id: uid('kot'),
            ticketNumber: `KOT-${String(seq++).padStart(3, '0')}`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            tableNumber: order.tableNumber || order.type,
            waiterName: waiter,
            station: 'Kitchen',
            items: unsentFood,
            status: 'New',
            urgent,
            createdAt: nowIso,
            updatedAt: nowIso,
          });
        }

        if (unsentBev.length > 0) {
          newTickets.push({
            id: uid('bot'),
            ticketNumber: `BOT-${String(seq++).padStart(3, '0')}`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            tableNumber: order.tableNumber || order.type,
            waiterName: waiter,
            station: 'Beverage',
            items: unsentBev,
            status: 'New',
            urgent,
            createdAt: nowIso,
            updatedAt: nowIso,
          });
        }

        set((state) => ({
          kotSeq: seq,
          kitchenTickets: [...newTickets, ...state.kitchenTickets],
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'Sent to Kitchen',
                  updatedAt: nowIso,
                  items: o.items.map((it) => ({ ...it, sentToKitchenQty: it.quantity })),
                }
              : o
          ),
        }));

        get().addToast(
          'success',
          `Sent ${newTickets.map((t) => t.ticketNumber).join(' & ')} to Kitchen Display`
        );
        return true;
      },

      advanceKitchenTicket: (ticketId, nextStatus) => {
        const nowIso = new Date().toISOString();
        const ticket = get().kitchenTickets.find((t) => t.id === ticketId);
        if (!ticket) return;

        set((state) => {
          const updatedTickets = state.kitchenTickets.map((t) =>
            t.id === ticketId ? { ...t, status: nextStatus, updatedAt: nowIso } : t
          );

          // Sync corresponding order status
          const orderTickets = updatedTickets.filter((t) => t.orderId === ticket.orderId);
          let syncedOrderStatus = state.orders.find((o) => o.id === ticket.orderId)?.status || 'Sent to Kitchen';

          if (orderTickets.every((t) => t.status === 'Served')) {
            syncedOrderStatus = 'Served';
          } else if (orderTickets.some((t) => t.status === 'Ready')) {
            syncedOrderStatus = 'Ready';
          } else if (orderTickets.some((t) => t.status === 'Preparing')) {
            syncedOrderStatus = 'Preparing';
          }

          return {
            kitchenTickets: updatedTickets,
            orders: state.orders.map((o) =>
              o.id === ticket.orderId && o.status !== 'Completed'
                ? { ...o, status: syncedOrderStatus, updatedAt: nowIso }
                : o
            ),
          };
        });
        get().addToast('info', `${ticket.ticketNumber} marked ${nextStatus}`);
      },

      toggleTicketUrgent: (ticketId) => {
        set((state) => ({
          kitchenTickets: state.kitchenTickets.map((t) =>
            t.id === ticketId ? { ...t, urgent: !t.urgent } : t
          ),
        }));
      },

      processPayment: ({ orderId, method, amountCents, cashReceivedCents, splitLabel, breakdown }) => {
        const s = get();
        const order = s.orders.find((o) => o.id === orderId);
        if (!order) return null;
        if (order.status === 'Completed') {
          get().addToast('error', `Order ${order.orderNumber} is already fully paid.`);
          return null;
        }
        const totals = getOrderTotals(order);
        if (totals.balanceDueCents <= 0) {
          get().addToast('error', 'No outstanding balance due on this order.');
          return null;
        }

        const payAmount = Math.min(totals.balanceDueCents, Math.max(0, Math.round(amountCents)));
        if (payAmount <= 0) {
          get().addToast('error', 'Payment amount must be greater than LKR 0.00.');
          return null;
        }

        const nowIso = new Date().toISOString();
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(s.invoiceSeq).padStart(4, '0')}`;
        const changeCents =
          method === 'Cash' && cashReceivedCents ? Math.max(0, cashReceivedCents - payAmount) : 0;

        const record: PaymentRecord = {
          id: uid('pay'),
          invoiceNumber,
          orderId: order.id,
          orderNumber: order.orderNumber,
          tableNumber: order.tableNumber,
          customerId: order.customerId,
          method,
          amountCents: payAmount,
          cashReceivedCents,
          changeCents,
          splitLabel,
          breakdown,
          createdAt: nowIso,
          cashierName: s.currentUserName,
          simulated: true,
        };

        const newPaidTotal = order.paidAmountCents + payAmount;
        const fullyPaid = newPaidTotal >= totals.totalCents;

        // Deduct inventory once when order is finalized
        let updatedInventory = [...s.inventory];
        const newMovements: StockMovement[] = [];
        if (fullyPaid && !order.inventoryDeducted) {
          for (const oi of order.items) {
            const menuItem = s.menu.find((m) => m.id === oi.menuItemId);
            if (menuItem?.ingredientIds) {
              for (const req of menuItem.ingredientIds) {
                const deduct = Number((req.qty * oi.quantity).toFixed(3));
                updatedInventory = updatedInventory.map((inv) => {
                  if (inv.id === req.ingredientId) {
                    newMovements.push({
                      id: uid('sm'),
                      ingredientId: inv.id,
                      ingredientName: inv.name,
                      delta: -deduct,
                      reason: `Order ${order.orderNumber} finalized`,
                      createdAt: nowIso,
                    });
                    return { ...inv, stock: Math.max(0, Number((inv.stock - deduct).toFixed(2))) };
                  }
                  return inv;
                });
              }
            }
          }
        }

        set((state) => ({
          invoiceSeq: state.invoiceSeq + 1,
          payments: [record, ...state.payments],
          inventory: updatedInventory,
          stockMovements: [...newMovements, ...state.stockMovements].slice(0, 100),
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  paidAmountCents: newPaidTotal,
                  status: fullyPaid ? 'Completed' : 'Payment Pending',
                  inventoryDeducted: fullyPaid ? true : o.inventoryDeducted,
                  updatedAt: nowIso,
                }
              : o
          ),
          tables: state.tables.map((t) => {
            if (t.id !== order.tableId) return t;
            if (fullyPaid) {
              return {
                ...t,
                status: 'Cleaning',
                guestCount: undefined,
                assignedWaiterId: undefined,
                occupiedSince: undefined,
                activeOrderId: undefined,
                mergedLabel: undefined,
                mergedFromIds: undefined,
              };
            }
            return { ...t, status: 'Payment Pending' };
          }),
          customers:
            fullyPaid && order.customerId
              ? state.customers.map((c) =>
                  c.id === order.customerId
                    ? { ...c, visits: c.visits + 1, totalSpentCents: c.totalSpentCents + totals.totalCents }
                    : c
                )
              : state.customers,
        }));

        get().addToast(
          'success',
          fullyPaid
            ? `Payment complete (${invoiceNumber}). Table moved to Cleaning.`
            : `Partial payment recorded (${invoiceNumber}).`
        );
        return record;
      },

      addReservation: (payload) => {
        const s = get();
        const table = s.tables.find((t) => t.id === payload.tableId);
        if (!table) return { ok: false, error: 'Selected table not found.' };
        if (!payload.customerName.trim() || !payload.phone.trim()) {
          return { ok: false, error: 'Customer name and phone are required.' };
        }

        // Prevent overlapping table reservations
        const toMinutes = (hhmm: string) => {
          const [h, m] = hhmm.split(':').map(Number);
          return h * 60 + m;
        };
        const newStart = toMinutes(payload.time);
        const newEnd = newStart + payload.durationMinutes;

        const conflict = s.reservations.find((r) => {
          if (r.tableId !== payload.tableId || r.date !== payload.date) return false;
          if (r.status === 'Cancelled' || r.status === 'Completed') return false;
          const rStart = toMinutes(r.time);
          const rEnd = rStart + r.durationMinutes;
          return newStart < rEnd && newEnd > rStart;
        });

        if (conflict) {
          return {
            ok: false,
            error: `Table ${table.number} already has a reservation at ${conflict.time} (${conflict.customerName}).`,
          };
        }

        const newRes: Reservation = {
          ...payload,
          id: uid('res'),
          tableNumber: table.number,
          status: 'Confirmed',
          createdAt: new Date().toISOString(),
        };

        const today = new Date().toISOString().slice(0, 10);
        set((state) => ({
          reservations: [newRes, ...state.reservations],
          tables:
            payload.date === today && table.status === 'Available'
              ? state.tables.map((t) => (t.id === table.id ? { ...t, status: 'Reserved' } : t))
              : state.tables,
        }));
        get().addToast('success', `Reservation confirmed for ${payload.customerName} (${table.number})`);
        return { ok: true };
      },

      updateReservationStatus: (reservationId, status) => {
        const res = get().reservations.find((r) => r.id === reservationId);
        set((state) => ({
          reservations: state.reservations.map((r) => (r.id === reservationId ? { ...r, status } : r)),
          tables:
            status === 'Cancelled' && res
              ? state.tables.map((t) =>
                  t.id === res.tableId && t.status === 'Reserved' ? { ...t, status: 'Available' } : t
                )
              : state.tables,
        }));
        get().addToast('info', `Reservation marked ${status}`);
      },

      convertReservationToOrder: (reservationId, waiterId) => {
        const s = get();
        const res = s.reservations.find((r) => r.id === reservationId);
        if (!res) return null;
        const wId = waiterId || s.staff.find((st) => st.role === 'Waiter')?.id || '';
        const orderId = get().startTableOrder(res.tableId, res.guestCount, wId);
        if (orderId) {
          set((state) => ({
            reservations: state.reservations.map((r) =>
              r.id === reservationId ? { ...r, status: 'Seated' } : r
            ),
          }));
        }
        return orderId;
      },

      addMenuItem: (item) => {
        set((state) => ({ menu: [{ ...item, id: uid('mnu') }, ...state.menu] }));
        get().addToast('success', `Added ${item.name} to menu`);
      },

      updateMenuItem: (id, updates) => {
        set((state) => ({
          menu: state.menu.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        }));
        get().addToast('success', 'Menu item updated');
      },

      deleteMenuItem: (id) => {
        set((state) => ({ menu: state.menu.filter((m) => m.id !== id) }));
        get().addToast('info', 'Menu item removed');
      },

      adjustInventory: (ingredientId, delta, reason) => {
        const ing = get().inventory.find((i) => i.id === ingredientId);
        if (!ing) return;
        const nowIso = new Date().toISOString();
        set((state) => ({
          inventory: state.inventory.map((i) =>
            i.id === ingredientId ? { ...i, stock: Math.max(0, Number((i.stock + delta).toFixed(2))) } : i
          ),
          stockMovements: [
            {
              id: uid('sm'),
              ingredientId,
              ingredientName: ing.name,
              delta,
              reason: reason || 'Manual stock adjustment',
              createdAt: nowIso,
            },
            ...state.stockMovements,
          ],
        }));
        get().addToast('success', `Updated ${ing.name} stock (${delta >= 0 ? '+' : ''}${delta} ${ing.unit})`);
      },

      addCustomer: ({ name, phone, email, notes }) => {
        const id = uid('cus');
        const newCus: Customer = {
          id,
          name: name.trim(),
          phone: phone.trim(),
          email: email?.trim(),
          notes,
          visits: 0,
          totalSpentCents: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ customers: [newCus, ...state.customers] }));
        get().addToast('success', `Registered customer ${newCus.name}`);
        return id;
      },

      addStaffMember: (payload) => {
        set((state) => ({ staff: [...state.staff, { ...payload, id: uid('stf') }] }));
        get().addToast('success', `Added staff member ${payload.name}`);
      },

      toggleStaffActive: (staffId) => {
        set((state) => ({
          staff: state.staff.map((st) => (st.id === staffId ? { ...st, active: !st.active } : st)),
        }));
      },

      addExpense: (payload) => {
        set((state) => ({ expenses: [{ ...payload, id: uid('exp') }, ...state.expenses] }));
        get().addToast('success', `Recorded expense: ${payload.title}`);
      },

      updateSettings: (updates) => {
        set((state) => ({ settings: { ...state.settings, ...updates } }));
        get().addToast('success', 'Settings saved');
      },

      resetDemoData: () => {
        set({
          tables: SEED_TABLES,
          menu: SEED_MENU,
          orders: SEED_ORDERS,
          kitchenTickets: SEED_KITCHEN_TICKETS,
          payments: SEED_PAYMENTS,
          reservations: SEED_RESERVATIONS,
          customers: SEED_CUSTOMERS,
          staff: SEED_STAFF,
          inventory: SEED_INVENTORY,
          stockMovements: SEED_STOCK_MOVEMENTS,
          expenses: SEED_EXPENSES,
          settings: SEED_SETTINGS,
          activeOrderId: 'ord-101',
          selectedTableId: 'tbl-1',
          orderSeq: 1007,
          kotSeq: 46,
          invoiceSeq: 1000,
        });
        get().addToast('info', 'Demo data reset to initial state');
      },
    }),
    {
      name: 'restro-pro-pos-storage-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentRole: state.currentRole,
        currentUserName: state.currentUserName,
        activeOrderId: state.activeOrderId,
        selectedTableId: state.selectedTableId,
        tables: state.tables,
        menu: state.menu,
        orders: state.orders,
        kitchenTickets: state.kitchenTickets,
        payments: state.payments,
        reservations: state.reservations,
        customers: state.customers,
        staff: state.staff,
        inventory: state.inventory,
        stockMovements: state.stockMovements,
        expenses: state.expenses,
        settings: state.settings,
        orderSeq: state.orderSeq,
        kotSeq: state.kotSeq,
        invoiceSeq: state.invoiceSeq,
      }),
    }
  )
);
