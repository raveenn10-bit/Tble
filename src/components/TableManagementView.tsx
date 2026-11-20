'use client';

import React, { useState, useRef } from 'react';
import {
  LayoutGrid,
  Map,
  Plus,
  Users,
  Clock,
  ArrowRightLeft,
  GitMerge,
  Trash2,
  Edit3,
  Move,
  UtensilsCrossed,
  CreditCard,
  CheckCircle2,
  X,
} from 'lucide-react';
import { usePosStore } from '@/store/usePosStore';
import { RestaurantTable, TableSection, TableShape, TableStatus } from '@/types/pos';
import { formatElapsedMinutes, formatLKRCompact, getOrderTotals } from '@/lib/currency';
import { CheckoutModal } from './CheckoutModal';
import { NavPage } from './AppShell';
import { motion, AnimatePresence, EASE, modalPanel } from '@/lib/motion';

const SECTIONS: ('All' | TableSection)[] = [
  'All',
  'Main Dining Area',
  'Outdoor Dining',
  'VIP Section',
  'Family Section',
];

const STATUSES: ('All' | TableStatus)[] = [
  'All',
  'Available',
  'Occupied',
  'Reserved',
  'Cleaning',
  'Payment Pending',
];

const STATUS_STYLE: Record<TableStatus, { bg: string; border: string; badge: string; dot: string }> = {
  Available: {
    bg: 'bg-emerald-50 hover:bg-emerald-100/80',
    border: 'border-emerald-400',
    badge: 'bg-emerald-600 text-white',
    dot: 'bg-emerald-500',
  },
  Occupied: {
    bg: 'bg-red-50 hover:bg-red-100/80',
    border: 'border-red-400',
    badge: 'bg-[#DC2626] text-white',
    dot: 'bg-red-500',
  },
  Reserved: {
    bg: 'bg-amber-50 hover:bg-amber-100/80',
    border: 'border-amber-400',
    badge: 'bg-[#F59E0B] text-slate-950',
    dot: 'bg-amber-500',
  },
  Cleaning: {
    bg: 'bg-blue-50 hover:bg-blue-100/80',
    border: 'border-blue-400',
    badge: 'bg-blue-600 text-white',
    dot: 'bg-blue-500',
  },
  'Payment Pending': {
    bg: 'bg-purple-50 hover:bg-purple-100/80',
    border: 'border-purple-400',
    badge: 'bg-purple-600 text-white',
    dot: 'bg-purple-500',
  },
};

export function TableManagementView({ onNavigate }: { onNavigate: (p: NavPage) => void }) {
  const {
    tables,
    orders,
    staff,
    selectedTableId,
    selectTable,
    startTableOrder,
    updateTableStatus,
    updateTablePosition,
    addTable,
    editTable,
    deleteTable,
    transferTableOrder,
    mergeTables,
    addToast,
  } = usePosStore();

  const [viewMode, setViewMode] = useState<'floor' | 'grid'>('floor');
  const [editFloorMode, setEditFloorMode] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<'All' | TableSection>('Main Dining Area');
  const [statusFilter, setStatusFilter] = useState<'All' | TableStatus>('All');

  // Modals / Drawers
  const [showStartModal, setShowStartModal] = useState(false);
  const [guestInput, setGuestInput] = useState(4);
  const [waiterInput, setWaiterInput] = useState(staff.find((s) => s.role === 'Waiter')?.id || '');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [newNum, setNewNum] = useState('');
  const [newSection, setNewSection] = useState<TableSection>('Main Dining Area');
  const [newCap, setNewCap] = useState(4);
  const [newShape, setNewShape] = useState<TableShape>('square');

  const [transferTargetId, setTransferTargetId] = useState('');
  const [mergeTargetId, setMergeTargetId] = useState('');
  const [checkoutOrderId, setCheckoutOrderId] = useState<string | null>(null);

  const floorRef = useRef<HTMLDivElement>(null);
  const waiters = staff.filter((s) => s.role === 'Waiter' || s.role === 'Admin');

  const filteredTables = tables.filter((t) => {
    const matchSection = sectionFilter === 'All' || t.section === sectionFilter;
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSection && matchStatus;
  });

  const selectedTable = tables.find((t) => t.id === selectedTableId) || null;
  const selectedOrder = selectedTable?.activeOrderId
    ? orders.find((o) => o.id === selectedTable.activeOrderId)
    : undefined;
  const selectedOrderTotals = selectedOrder ? getOrderTotals(selectedOrder) : null;

  const availableTargets = tables.filter((t) => t.status === 'Available' && t.id !== selectedTable?.id);
  const mergeCandidates = tables.filter(
    (t) => t.id !== selectedTable?.id && (t.status === 'Occupied' || t.status === 'Available')
  );

  const handleDragEnd = (tableId: string, e: React.DragEvent<HTMLDivElement>) => {
    if (!editFloorMode || !floorRef.current) return;
    const rect = floorRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left - 45) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top - 45) / rect.height) * 100;
    updateTablePosition(tableId, xPct, yPct);
  };

  const handleStartOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    const orderId = startTableOrder(selectedTable.id, guestInput, waiterInput);
    setShowStartModal(false);
    if (orderId) {
      onNavigate('pos');
    }
  };

  const handleSaveTableForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTable) {
      editTable(editingTable.id, {
        number: newNum,
        section: newSection,
        capacity: newCap,
        shape: newShape,
      });
      setEditingTable(null);
      setShowAddModal(false);
    } else {
      const ok = addTable({ number: newNum, section: newSection, capacity: newCap, shape: newShape });
      if (ok) {
        setShowAddModal(false);
        setNewNum('');
      }
    }
  };

  const checkoutOrder = checkoutOrderId ? orders.find((o) => o.id === checkoutOrderId) : undefined;

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {SECTIONS.map((sec) => (
            <button
              key={sec}
              onClick={() => setSectionFilter(sec)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                sectionFilter === sec
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | TableStatus)}
            aria-label="Filter by status"
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('floor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                viewMode === 'floor' ? 'bg-white text-[#059669] shadow-sm' : 'text-slate-600'
              }`}
            >
              <Map className="w-3.5 h-3.5" /> Floor Plan
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                viewMode === 'grid' ? 'bg-white text-[#059669] shadow-sm' : 'text-slate-600'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Grid
            </button>
          </div>

          {viewMode === 'floor' && sectionFilter !== 'All' && (
            <button
              onClick={() => setEditFloorMode(!editFloorMode)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                editFloorMode
                  ? 'bg-[#F59E0B] text-slate-950 border-amber-500'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Move className="w-3.5 h-3.5" /> {editFloorMode ? 'Done Dragging' : 'Edit Layout'}
            </button>
          )}

          <button
            onClick={() => {
              setEditingTable(null);
              setNewNum('');
              setNewSection(sectionFilter === 'All' ? 'Main Dining Area' : sectionFilter);
              setNewCap(4);
              setNewShape('square');
              setShowAddModal(true);
            }}
            data-testid="add-table-btn"
            className="px-3.5 py-2 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Table
          </button>
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap items-center gap-4 px-2 text-xs font-semibold text-slate-600">
        {(['Available', 'Occupied', 'Reserved', 'Cleaning', 'Payment Pending'] as TableStatus[]).map((st) => (
          <div key={st} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${STATUS_STYLE[st].dot} ${st === 'Occupied' || st === 'Payment Pending' ? 'dot-live' : ''}`} />
            <span>
              {st} ({tables.filter((t) => t.status === st).length})
            </span>
          </div>
        ))}
      </div>

      {/* Main Split: Floor/Grid + Inspector Panel */}
      <div className="grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          {viewMode === 'floor' && sectionFilter !== 'All' ? (
            <div
              ref={floorRef}
              onDragOver={(e) => editFloorMode && e.preventDefault()}
              className="relative w-full h-[520px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
              style={{
                backgroundImage:
                  'radial-gradient(#CBD5E1 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              <div className="absolute top-3 left-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                {sectionFilter} {editFloorMode && '— Drag tables to reposition'}
              </div>

              {filteredTables.map((tbl, idx) => {
                const style = STATUS_STYLE[tbl.status];
                const tblOrder = tbl.activeOrderId ? orders.find((o) => o.id === tbl.activeOrderId) : undefined;
                const tblTotal = tblOrder ? getOrderTotals(tblOrder).totalCents : 0;
                const waiter = staff.find((s) => s.id === tbl.assignedWaiterId);
                const isSelected = selectedTableId === tbl.id;

                return (
                  <div
                    key={tbl.id}
                    draggable={editFloorMode}
                    onDragEnd={(e) => handleDragEnd(tbl.id, e)}
                    onClick={() => selectTable(tbl.id)}
                    data-testid={`table-node-${tbl.number}`}
                    style={{
                      left: `${tbl.x}%`,
                      top: `${tbl.y}%`,
                      width: `${tbl.width}px`,
                      height: `${tbl.height}px`,
                      animationDelay: `${idx * 35}ms`,
                    }}
                    className={`animate-pop-in absolute cursor-pointer border-2 p-2 flex flex-col items-center justify-center text-center transition-all duration-300 shadow-sm select-none hover:shadow-md ${
                      tbl.status === 'Payment Pending' ? 'animate-ring-pulse' : ''
                    } ${
                      style.bg
                    } ${style.border} ${
                      tbl.shape === 'round' ? 'rounded-full' : 'rounded-2xl'
                    } ${isSelected ? 'ring-4 ring-[#0F172A]/20 scale-[1.03] z-10' : ''} ${
                      editFloorMode ? 'cursor-grab active:cursor-grabbing' : ''
                    }`}
                  >
                    <div className="font-extrabold text-sm text-[#0F172A] leading-none">
                      {tbl.mergedLabel || tbl.number}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-600 mt-0.5">
                      {tbl.guestCount ? `${tbl.guestCount}/${tbl.capacity}` : `${tbl.capacity} seats`}
                    </div>
                    {tblOrder && (
                      <div className="text-[10px] font-bold text-[#0F172A] mt-0.5 truncate max-w-full">
                        {formatLKRCompact(tblTotal)}
                      </div>
                    )}
                    {tbl.occupiedSince && (
                      <div className="text-[9px] text-slate-500">
                        {formatElapsedMinutes(tbl.occupiedSince)} {waiter ? `• ${waiter.name.split(' ')[0]}` : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredTables.map((tbl, idx) => {
                const style = STATUS_STYLE[tbl.status];
                const tblOrder = tbl.activeOrderId ? orders.find((o) => o.id === tbl.activeOrderId) : undefined;
                const tblTotal = tblOrder ? getOrderTotals(tblOrder).totalCents : 0;
                const waiter = staff.find((s) => s.id === tbl.assignedWaiterId);
                const isSelected = selectedTableId === tbl.id;

                return (
                  <motion.button layout
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: Math.min(idx, 15) * 0.03, ease: EASE, duration: 0.35 }}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    key={tbl.id}
                    type="button"
                    onClick={() => selectTable(tbl.id)}
                    data-testid={`table-card-${tbl.number}`}
                    className={`text-left p-4 rounded-2xl border-2 transition shadow-sm ${style.bg} ${
                      style.border
                    } ${isSelected ? 'ring-4 ring-[#0F172A]/15' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-base text-[#0F172A]">
                        {tbl.mergedLabel || tbl.number}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${style.badge}`}>
                        {tbl.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div>{tbl.section} • {tbl.shape}</div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {tbl.guestCount ?? 0}/{tbl.capacity}
                        </span>
                        {tbl.occupiedSince && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatElapsedMinutes(tbl.occupiedSince)}
                          </span>
                        )}
                      </div>
                      {waiter && <div>Waiter: {waiter.name}</div>}
                      {tblOrder && (
                        <div className="font-bold text-[#0F172A] pt-1">
                          Order {tblOrder.orderNumber}: {formatLKRCompact(tblTotal)}
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Table Inspector & Actions */}
        <div className="lg:col-span-4">
          {selectedTable ? (
            <motion.div key={selectedTable.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: EASE }} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-[#0F172A]">
                      Table {selectedTable.mergedLabel || selectedTable.number}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        STATUS_STYLE[selectedTable.status].badge
                      }`}
                    >
                      {selectedTable.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedTable.section} • {selectedTable.capacity} seats • {selectedTable.shape}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingTable(selectedTable);
                      setNewNum(selectedTable.number);
                      setNewSection(selectedTable.section);
                      setNewCap(selectedTable.capacity);
                      setNewShape(selectedTable.shape);
                      setShowAddModal(true);
                    }}
                    title="Edit Table"
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTable(selectedTable.id)}
                    title="Delete Table"
                    className="p-2 rounded-xl border border-slate-200 hover:bg-red-50 text-[#DC2626]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {selectedOrder && selectedOrderTotals ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-sm text-[#0F172A]">
                    <span>{selectedOrder.orderNumber}</span>
                    <span>{formatLKRCompact(selectedOrderTotals.totalCents)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Guests: {selectedTable.guestCount || selectedOrder.guestCount || 1}</span>
                    <span>Status: {selectedOrder.status}</span>
                  </div>
                  <div className="text-slate-600">
                    Items: {selectedOrder.items.reduce((a, b) => a + b.quantity, 0)} • Elapsed:{' '}
                    {formatElapsedMinutes(selectedTable.occupiedSince)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => onNavigate('pos')}
                      data-testid="open-table-pos-btn"
                      className="py-2.5 px-3 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5"
                    >
                      <UtensilsCrossed className="w-4 h-4" /> Edit Order
                    </button>
                    <button
                      onClick={() => setCheckoutOrderId(selectedOrder.id)}
                      data-testid="table-checkout-btn"
                      className="py-2.5 px-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" /> Pay / Split
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setGuestInput(Math.min(4, selectedTable.capacity));
                      setShowStartModal(true);
                    }}
                    data-testid="start-table-order-btn"
                    className="w-full py-3 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <UtensilsCrossed className="w-4 h-4" /> Start Dine-In Order
                  </button>
                  {selectedTable.status === 'Cleaning' && (
                    <button
                      onClick={() => updateTableStatus(selectedTable.id, 'Available')}
                      data-testid="mark-table-available-btn"
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Table Available
                    </button>
                  )}
                </div>
              )}

              {/* Transfer & Merge Controls */}
              {selectedOrder && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Transfer Order To Available Table
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={transferTargetId}
                        onChange={(e) => setTransferTargetId(e.target.value)}
                        data-testid="transfer-target-select"
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      >
                        <option value="">Select target table...</option>
                        {availableTargets.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.number} ({t.section}, {t.capacity} seats)
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          if (!transferTargetId) return addToast('warning', 'Select a target table first.');
                          if (transferTableOrder(selectedTable.id, transferTargetId)) {
                            setTransferTargetId('');
                          }
                        }}
                        data-testid="transfer-table-btn"
                        className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Merge With Another Table
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={mergeTargetId}
                        onChange={(e) => setMergeTargetId(e.target.value)}
                        data-testid="merge-target-select"
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      >
                        <option value="">Select table to merge...</option>
                        {mergeCandidates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.number} ({t.status}, {t.capacity} seats)
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          if (!mergeTargetId) return addToast('warning', 'Select a table to merge.');
                          if (mergeTables(selectedTable.id, mergeTargetId)) {
                            setMergeTargetId('');
                          }
                        }}
                        data-testid="merge-table-btn"
                        className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1"
                      >
                        <GitMerge className="w-3.5 h-3.5" /> Merge
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Status Change */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Change Status
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['Available', 'Reserved', 'Cleaning'] as TableStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateTableStatus(selectedTable.id, st)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50"
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
              Select a table from the floor plan or grid to start an order, transfer, merge, or checkout.
            </div>
          )}
        </div>
      </div>

      {/* Start Table Order Modal */}
      <AnimatePresence>
      {showStartModal && selectedTable && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <motion.form initial={modalPanel.initial} animate={modalPanel.animate} exit={modalPanel.exit}
            onSubmit={handleStartOrder}
            className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Seat Table {selectedTable.number}</h3>
              <button type="button" onClick={() => setShowStartModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Guests</label>
              <input
                type="number"
                min={1}
                max={20}
                value={guestInput}
                onChange={(e) => setGuestInput(Number(e.target.value))}
                data-testid="guest-count-input"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Waiter</label>
              <select
                value={waiterInput}
                onChange={(e) => setWaiterInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              >
                {waiters.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.role})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              data-testid="confirm-start-table-btn"
              className="w-full py-3 rounded-xl bg-[#059669] text-white font-bold text-sm hover:bg-emerald-700"
            >
              Open Table & Go to POS
            </button>
          </motion.form>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Add/Edit Table Modal */}
      <AnimatePresence>
      {showAddModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <motion.form initial={modalPanel.initial} animate={modalPanel.animate} exit={modalPanel.exit}
            onSubmit={handleSaveTableForm}
            className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{editingTable ? 'Edit Table' : 'Add New Table'}</h3>
              <button type="button" onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Table Number</label>
              <input
                type="text"
                required
                value={newNum}
                onChange={(e) => setNewNum(e.target.value)}
                placeholder="e.g., T9"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
              <select
                value={newSection}
                onChange={(e) => setNewSection(e.target.value as TableSection)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              >
                {SECTIONS.filter((s) => s !== 'All').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newCap}
                  onChange={(e) => setNewCap(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shape</label>
                <select
                  value={newShape}
                  onChange={(e) => setNewShape(e.target.value as TableShape)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="square">Square</option>
                  <option value="round">Round</option>
                  <option value="rectangular">Rectangular</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#059669] text-white font-bold text-sm hover:bg-emerald-700"
            >
              {editingTable ? 'Save Changes' : 'Create Table'}
            </button>
          </motion.form>
        </motion.div>
      )}
      </AnimatePresence>

      {checkoutOrder && (
        <CheckoutModal order={checkoutOrder} onClose={() => setCheckoutOrderId(null)} />
      )}
    </div>
  );
}
