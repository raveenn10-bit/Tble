'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Send,
  PauseCircle,
  CreditCard,
  StickyNote,
  Percent,
  Tag,
  ShoppingBag,
  X,
} from 'lucide-react';
import { usePosStore } from '@/store/usePosStore';
import { MenuCategory, MenuItem, OrderType } from '@/types/pos';
import { formatLKR, formatLKRCompact, getOrderTotals, toCents } from '@/lib/currency';
import { CheckoutModal } from './CheckoutModal';
import { motion, AnimatePresence, SPRING, EASE, modalPanel } from '@/lib/motion';

const CATEGORIES: ('All' | MenuCategory)[] = [
  'All',
  'Rice & Curry',
  'Fried Rice',
  'Kottu',
  'Burgers',
  'Pizza',
  'Pasta',
  'Seafood',
  'Appetizers',
  'Desserts',
  'Hot Beverages',
  'Cold Beverages',
];

export function PosView() {
  const {
    menu,
    orders,
    tables,
    customers,
    staff,
    activeOrderId,
    setActiveOrder,
    createTakeawayOrDeliveryOrder,
    addItemToOrder,
    updateOrderItemQty,
    updateOrderItemNotes,
    removeOrderItem,
    setOrderDiscount,
    setOrderMeta,
    holdOrder,
    resumeOrder,
    sendOrderToKitchen,
    addToast,
  } = usePosStore();

  const [category, setCategory] = useState<'All' | MenuCategory>('All');
  const [search, setSearch] = useState('');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedCustomOpts, setSelectedCustomOpts] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  const activeOrder = orders.find((o) => o.id === activeOrderId && o.status !== 'Completed') || null;
  const heldOrders = orders.filter((o) => o.status === 'Held');
  const totals = activeOrder ? getOrderTotals(activeOrder) : null;

  const filteredMenu = menu.filter((m) => {
    const matchCat = category === 'All' || m.category === category;
    const matchSearch =
      !search.trim() ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleProductClick = (item: MenuItem) => {
    let targetOrderId = activeOrder?.id;
    if (!targetOrderId) {
      targetOrderId = createTakeawayOrDeliveryOrder('Takeaway');
    }
    if (item.customizations && item.customizations.length > 0) {
      setCustomizingItem(item);
      setSelectedCustomOpts([]);
      setCustomNote('');
    } else {
      addItemToOrder(targetOrderId, item);
    }
  };

  const confirmCustomAdd = () => {
    if (!customizingItem) return;
    const targetOrderId = activeOrder?.id || createTakeawayOrDeliveryOrder('Takeaway');
    addItemToOrder(targetOrderId, customizingItem, selectedCustomOpts, customNote);
    setCustomizingItem(null);
  };

  return (
    <div className="grid lg:grid-cols-12 gap-4 h-full">
      {/* Left: Categories */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-2.5 shadow-sm flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-y-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`relative px-3 py-2.5 rounded-xl text-xs font-bold text-left whitespace-nowrap transition-colors ${
              category === cat ? 'text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {category === cat && (
              <motion.span
                layoutId="pos-category-pill"
                className="absolute inset-0 rounded-xl bg-[#059669] shadow-sm"
                transition={SPRING}
              />
            )}
            <span className="relative">{cat}</span>
          </button>
        ))}
      </div>

      {/* Center: Product Search & Image Grid */}
      <div className="lg:col-span-6 space-y-3 flex flex-col min-w-0">
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 40+ dishes & beverages..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
            />
          </div>
          <button
            onClick={() => createTakeawayOrDeliveryOrder('Takeaway')}
            className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
          >
            + New Takeaway
          </button>
          <button
            onClick={() => createTakeawayOrDeliveryOrder('Delivery')}
            className="px-3 py-2 rounded-xl bg-emerald-50 text-[#059669] border border-emerald-200 text-xs font-bold hover:bg-emerald-100"
          >
            + Delivery
          </button>
        </div>

        {heldOrders.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-amber-700 shrink-0">Held Orders:</span>
            {heldOrders.map((ho) => (
              <button
                key={ho.id}
                onClick={() => resumeOrder(ho.id)}
                className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-xs font-semibold text-amber-900 shrink-0 hover:bg-amber-100"
              >
                Resume {ho.orderNumber} ({ho.tableNumber || ho.type})
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 auto-rows-max gap-3 overflow-y-auto pr-1 max-h-[640px]">
          <AnimatePresence mode="popLayout" initial={false}>
          {filteredMenu.map((item, idx) => (
            <motion.button
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: Math.min(idx, 12) * 0.025, ease: EASE, duration: 0.3 } }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              whileHover={item.available ? { y: -4 } : undefined}
              whileTap={item.available ? { scale: 0.95 } : undefined}
              type="button"
              disabled={!item.available}
              onClick={() => handleProductClick(item)}
              data-testid={`menu-item-${item.id}`}
              className={`group bg-white rounded-2xl border border-slate-200 overflow-hidden text-left shadow-sm transition-[box-shadow,border-color] hover:shadow-lg hover:border-emerald-300 flex flex-col ${
                !item.available ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
                {!item.available && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                    Sold Out
                  </span>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    {item.category}
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-[#0F172A] line-clamp-2 mt-0.5">
                    {item.name}
                  </div>
                </div>
                <div className="font-extrabold text-sm text-[#059669] mt-2">
                  {formatLKRCompact(item.priceCents)}
                </div>
              </div>
            </motion.button>
          ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Current Order & Checkout */}
      <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-[#0F172A]">
                {activeOrder ? activeOrder.orderNumber : 'No Active Order'}
              </h2>
              <p className="text-xs text-slate-500">
                {activeOrder
                  ? `${activeOrder.type}${activeOrder.tableNumber ? ` • Table ${activeOrder.tableNumber}` : ''} • ${activeOrder.status}`
                  : 'Select a table or tap any item'}
              </p>
            </div>
            {activeOrder && (
              <select
                value={activeOrder.type}
                onChange={(e) => setOrderMeta(activeOrder.id, { type: e.target.value as OrderType })}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              >
                <option value="Dine-In">Dine-In</option>
                <option value="Takeaway">Takeaway</option>
                <option value="Delivery">Delivery</option>
              </select>
            )}
          </div>

          {activeOrder && (
            <div className="grid grid-cols-2 gap-2">
              <select
                value={activeOrder.customerId || ''}
                onChange={(e) => setOrderMeta(activeOrder.id, { customerId: e.target.value || undefined })}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="">Walk-in Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={activeOrder.waiterId || ''}
                onChange={(e) => setOrderMeta(activeOrder.id, { waiterId: e.target.value || undefined })}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="">Assign Staff...</option>
                {staff.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[340px]">
          {!activeOrder || activeOrder.items.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
              <ShoppingBag className="w-8 h-8 opacity-40" />
              <span>Tap menu items to add to order</span>
            </div>
          ) : (
            <AnimatePresence initial={false}>
            {activeOrder.items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: 40, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: -40, height: 0, marginTop: 0, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2 overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-[#0F172A] truncate">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {formatLKRCompact(item.unitPriceCents)} each
                      {item.sentToKitchenQty > 0 && (
                        <span className="ml-2 text-emerald-700 font-semibold">
                          • {item.sentToKitchenQty} sent to kitchen
                        </span>
                      )}
                    </div>
                    {item.customizations && item.customizations.length > 0 && (
                      <div className="text-[11px] text-amber-700 font-medium">
                        {item.customizations.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-[#0F172A] shrink-0">
                    {formatLKRCompact(item.unitPriceCents * item.quantity)}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateOrderItemQty(activeOrder.id, item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateOrderItemQty(activeOrder.id, item.id, 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const note = window.prompt('Kitchen note for this item:', item.notes || '');
                        if (note !== null) updateOrderItemNotes(activeOrder.id, item.id, note);
                      }}
                      title="Add Item Note"
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-slate-800"
                    >
                      <StickyNote className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeOrderItem(activeOrder.id, item.id)}
                      title="Remove Item"
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {item.notes && (
                  <div className="text-[11px] bg-amber-50 text-amber-900 px-2 py-1 rounded-lg">
                    Note: {item.notes}
                  </div>
                )}
              </motion.div>
            ))}
            </AnimatePresence>
          )}
        </div>

        {/* Totals & Actions */}
        {activeOrder && totals && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
            {/* Discount Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOrderDiscount(activeOrder.id, 'percentage', 10)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${
                  activeOrder.discountType === 'percentage'
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <Percent className="w-3 h-3" /> 10% Off
              </button>
              <button
                onClick={() => setOrderDiscount(activeOrder.id, 'fixed', toCents(500))}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${
                  activeOrder.discountType === 'fixed'
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <Tag className="w-3 h-3" /> -LKR 500
              </button>
              {activeOrder.discountType !== 'none' && (
                <button
                  onClick={() => setOrderDiscount(activeOrder.id, 'none', 0)}
                  className="text-[11px] text-red-600 font-semibold ml-auto"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatLKR(totals.subtotalCents)}</span>
              </div>
              {totals.discountCents > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount</span>
                  <span>-{formatLKR(totals.discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Service ({activeOrder.serviceChargeRate}%)</span>
                <span>{formatLKR(totals.serviceChargeCents)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax ({activeOrder.taxRate}%)</span>
                <span>{formatLKR(totals.taxCents)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-base text-[#0F172A] pt-1 border-t border-slate-200">
                <span>Total</span>
                <motion.span
                  key={totals.totalCents}
                  initial={{ scale: 1.18, color: '#059669' }}
                  animate={{ scale: 1, color: 'inherit' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  className="inline-block origin-right"
                >
                  {formatLKR(totals.totalCents)}
                </motion.span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => holdOrder(activeOrder.id)}
                className="py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1"
              >
                <PauseCircle className="w-4 h-4" /> Hold
              </button>
              <button
                onClick={() => sendOrderToKitchen(activeOrder.id)}
                data-testid="send-to-kitchen-btn"
                className="py-2.5 rounded-xl bg-[#F59E0B] hover:bg-amber-500 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1"
              >
                <Send className="w-4 h-4" /> Kitchen
              </button>
              <button
                onClick={() => {
                  if (activeOrder.items.length === 0) return addToast('warning', 'Add items before checkout.');
                  setShowCheckout(true);
                }}
                data-testid="pos-checkout-btn"
                className="py-2.5 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-1"
              >
                <CreditCard className="w-4 h-4" /> Pay
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customization Modal */}
      <AnimatePresence>
      {customizingItem && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <motion.div initial={modalPanel.initial} animate={modalPanel.animate} exit={modalPanel.exit} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{customizingItem.name}</h3>
                <p className="text-xs text-[#059669] font-bold">
                  {formatLKRCompact(customizingItem.priceCents)}
                </p>
              </div>
              <button onClick={() => setCustomizingItem(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {customizingItem.customizations && (
              <div>
                <div className="text-xs font-bold text-slate-600 mb-2">Customizations</div>
                <div className="flex flex-wrap gap-2">
                  {customizingItem.customizations.map((opt) => {
                    const active = selectedCustomOpts.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setSelectedCustomOpts((prev) =>
                            active ? prev.filter((x) => x !== opt) : [...prev, opt]
                          )
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                          active
                            ? 'bg-[#059669] text-white border-[#059669]'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Special Note</label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g., Less spicy, allergies..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <button
              onClick={confirmCustomAdd}
              data-testid="confirm-add-custom-item-btn"
              className="w-full py-3 rounded-xl bg-[#059669] text-white font-bold text-sm hover:bg-emerald-700"
            >
              Add to Order
            </button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
        {showCheckout && activeOrder && (
          <CheckoutModal key="checkout" order={activeOrder} onClose={() => setShowCheckout(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
