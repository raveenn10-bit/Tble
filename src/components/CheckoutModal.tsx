'use client';

import React, { useState } from 'react';
import {
  X,
  Banknote,
  CreditCard,
  Landmark,
  QrCode,
  Layers,
  Printer,
  CheckCircle2,
  Split,
  ShieldAlert,
} from 'lucide-react';
import { Order, PaymentMethod, PaymentRecord } from '@/types/pos';
import { usePosStore } from '@/store/usePosStore';
import { formatLKR, getOrderTotals, splitAmountEquallyCents, toCents } from '@/lib/currency';
import { motion, modalPanel } from '@/lib/motion';

interface CheckoutModalProps {
  order: Order;
  onClose: () => void;
  onPaymentComplete?: (record: PaymentRecord) => void;
}

export function CheckoutModal({ order, onClose, onPaymentComplete }: CheckoutModalProps) {
  const { processPayment, settings } = usePosStore();
  const totals = getOrderTotals(order);

  const [splitMode, setSplitMode] = useState<'full' | 'equal' | 'items'>('full');
  const [splitCount, setSplitCount] = useState(2);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [cashInputLkr, setCashInputLkr] = useState<string>(
    String(Math.ceil(totals.balanceDueCents / 100))
  );
  const [mixedCashLkr, setMixedCashLkr] = useState<string>('0');
  const [completedRecord, setCompletedRecord] = useState<PaymentRecord | null>(null);
  const [printWidth, setPrintWidth] = useState<'58mm' | '80mm' | 'A4'>(settings.defaultPrintWidth);

  const equalParts = splitAmountEquallyCents(totals.balanceDueCents, splitCount);
  const selectedItemsTotalCents = order.items
    .filter((i) => selectedItemIds.includes(i.id))
    .reduce((acc, i) => acc + i.unitPriceCents * i.quantity, 0);

  const proportionalSelectedCents =
    totals.subtotalCents > 0
      ? Math.round((selectedItemsTotalCents / totals.subtotalCents) * totals.totalCents)
      : 0;

  const amountToPayCents =
    splitMode === 'full'
      ? totals.balanceDueCents
      : splitMode === 'equal'
      ? equalParts[0]
      : Math.min(totals.balanceDueCents, proportionalSelectedCents);

  const cashReceivedCents = toCents(Number(cashInputLkr) || 0);
  const changeCents = method === 'Cash' ? Math.max(0, cashReceivedCents - amountToPayCents) : 0;

  const handlePay = () => {
    if (amountToPayCents <= 0) return;
    if (method === 'Cash' && cashReceivedCents < amountToPayCents) return;

    const mixedCashCents = Math.min(amountToPayCents, toCents(Number(mixedCashLkr) || 0));
    const mixedCardCents = Math.max(0, amountToPayCents - mixedCashCents);

    const record = processPayment({
      orderId: order.id,
      method,
      amountCents: amountToPayCents,
      cashReceivedCents: method === 'Cash' ? cashReceivedCents : undefined,
      splitLabel:
        splitMode === 'equal'
          ? `Split 1/${splitCount}`
          : splitMode === 'items'
          ? 'Split by Items'
          : undefined,
      breakdown:
        method === 'Mixed'
          ? [
              { method: 'Cash', amountCents: mixedCashCents },
              { method: 'Card', amountCents: mixedCardCents },
            ]
          : undefined,
    });

    if (record) {
      setCompletedRecord(record);
      onPaymentComplete?.(record);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={modalPanel.initial} animate={modalPanel.animate} exit={modalPanel.exit} className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between no-print">
          <div>
            <h2 className="font-bold text-lg">
              {completedRecord ? `Receipt — ${completedRecord.invoiceNumber}` : `Checkout — ${order.orderNumber}`}
            </h2>
            <p className="text-xs text-slate-300">
              {order.tableNumber ? `Table ${order.tableNumber}` : order.type} • Balance Due:{' '}
              {formatLKR(totals.balanceDueCents)}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!completedRecord ? (
          <div className="p-6 grid md:grid-cols-2 gap-6">
            {/* Left: Bill Split & Summary */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatLKR(totals.subtotalCents)}</span>
                </div>
                {totals.discountCents > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span>-{formatLKR(totals.discountCents)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Service Charge ({order.serviceChargeRate}%)</span>
                  <span>{formatLKR(totals.serviceChargeCents)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({order.taxRate}%)</span>
                  <span>{formatLKR(totals.taxCents)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-base text-[#0F172A]">
                  <span>Total</span>
                  <span>{formatLKR(totals.totalCents)}</span>
                </div>
                {order.paidAmountCents > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Already Paid</span>
                    <span>-{formatLKR(order.paidAmountCents)}</span>
                  </div>
                )}
              </div>

              {/* Split Bill Options */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <Split className="w-3.5 h-3.5" /> Split Bill
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'full', label: 'Full Bill' },
                    { id: 'equal', label: 'Split Equally' },
                    { id: 'items', label: 'By Items' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSplitMode(opt.id as typeof splitMode)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition ${
                        splitMode === opt.id
                          ? 'bg-[#0F172A] text-white border-[#0F172A]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {splitMode === 'equal' && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Number of Ways</span>
                    <div className="flex items-center gap-2">
                      {[2, 3, 4, 5, 6].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setSplitCount(n)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold ${
                            splitCount === n ? 'bg-[#059669] text-white' : 'bg-white border border-slate-200'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {splitMode === 'items' && (
                  <div className="mt-3 max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    {order.items.map((it) => {
                      const checked = selectedItemIds.includes(it.id);
                      return (
                        <label
                          key={it.id}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-white border border-slate-200 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setSelectedItemIds((prev) =>
                                  checked ? prev.filter((x) => x !== it.id) : [...prev, it.id]
                                )
                              }
                            />
                            <span className="font-medium">
                              {it.quantity}x {it.name}
                            </span>
                          </div>
                          <span className="font-semibold">
                            {formatLKR(it.unitPriceCents * it.quantity)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Payment Method & Execution */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Amount to Collect
                </div>
                <div className="text-2xl font-extrabold text-[#059669] mt-0.5">
                  {formatLKR(amountToPayCents)}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(
                  [
                    { id: 'Cash', icon: Banknote },
                    { id: 'Card', icon: CreditCard },
                    { id: 'Bank Transfer', icon: Landmark },
                    { id: 'QR Payment', icon: QrCode },
                    { id: 'Mixed', icon: Layers },
                  ] as { id: PaymentMethod; icon: React.ComponentType<{ className?: string }> }[]
                ).map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                        method === m.id
                          ? 'bg-[#059669] text-white border-[#059669]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {m.id}
                    </button>
                  );
                })}
              </div>

              {method === 'Cash' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Cash Received (LKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={cashInputLkr}
                    onChange={(e) => setCashInputLkr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  />
                  <div className="flex justify-between text-sm font-semibold px-1">
                    <span className="text-slate-600">Change Due:</span>
                    <span className="text-[#059669]">{formatLKR(changeCents)}</span>
                  </div>
                </div>
              )}

              {method === 'Mixed' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Cash Portion (LKR) — Remainder on Card
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={mixedCashLkr}
                    onChange={(e) => setMixedCashLkr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span>Simulated Demo Payment — no real card or bank transaction is processed.</span>
              </div>

              <button
                type="button"
                data-testid="confirm-payment-btn"
                disabled={
                  amountToPayCents <= 0 || (method === 'Cash' && cashReceivedCents < amountToPayCents)
                }
                onClick={handlePay}
                className="w-full py-3.5 rounded-xl bg-[#059669] hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm transition shadow-md"
              >
                Complete Simulated Payment ({formatLKR(amountToPayCents)})
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3 no-print">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-5 h-5" />
                <span>Payment Recorded — {completedRecord.invoiceNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                {(['58mm', '80mm', 'A4'] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => setPrintWidth(w)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      printWidth === w ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white text-slate-700'
                    }`}
                  >
                    {w}
                  </button>
                ))}
                <button
                  onClick={handlePrint}
                  data-testid="print-receipt-btn"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] text-white text-xs font-bold hover:bg-emerald-700"
                >
                  <Printer className="w-4 h-4" /> Print Receipt
                </button>
              </div>
            </div>

            {/* Printable Receipt Preview */}
            <div className="bg-slate-100 p-4 rounded-2xl flex justify-center overflow-x-auto">
              <div
                id="printable-receipt"
                className={`bg-white p-5 shadow-sm border border-slate-200 font-mono text-xs text-slate-900 ${
                  printWidth === '58mm'
                    ? 'w-[220px]'
                    : printWidth === '80mm'
                    ? 'w-[302px]'
                    : 'w-full max-w-[680px]'
                }`}
              >
                <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
                  {settings.showLogoOnReceipt && (
                    <img src="/images/icon.png" alt="Logo" className="w-10 h-10 mx-auto mb-1" />
                  )}
                  <div className="font-bold text-sm">{settings.restaurantName}</div>
                  <div>{settings.address}</div>
                  <div>Tel: {settings.phone}</div>
                </div>
                <div className="space-y-0.5 border-b border-dashed border-slate-300 pb-2 mb-2">
                  <div className="flex justify-between">
                    <span>Invoice:</span>
                    <span className="font-bold">{completedRecord.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order:</span>
                    <span>{order.orderNumber}</span>
                  </div>
                  {order.tableNumber && (
                    <div className="flex justify-between">
                      <span>Table:</span>
                      <span>{order.tableNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(completedRecord.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1 border-b border-dashed border-slate-300 pb-2 mb-2">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex justify-between gap-2">
                      <span className="truncate">
                        {it.quantity}x {it.name}
                      </span>
                      <span className="shrink-0">{formatLKR(it.unitPriceCents * it.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 border-b border-dashed border-slate-300 pb-2 mb-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatLKR(totals.subtotalCents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service ({order.serviceChargeRate}%)</span>
                    <span>{formatLKR(totals.serviceChargeCents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({order.taxRate}%)</span>
                    <span>{formatLKR(totals.taxCents)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-1">
                    <span>PAID ({completedRecord.method})</span>
                    <span>{formatLKR(completedRecord.amountCents)}</span>
                  </div>
                  {completedRecord.changeCents ? (
                    <div className="flex justify-between">
                      <span>Change</span>
                      <span>{formatLKR(completedRecord.changeCents)}</span>
                    </div>
                  ) : null}
                </div>

                <div className="text-center text-[10px] text-slate-600 pt-1">
                  <div>{settings.receiptFooter}</div>
                  <div className="mt-1 font-semibold">SIMULATED DEMO RECEIPT</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
