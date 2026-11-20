import { DiscountType, Order, OrderItem } from '@/types/pos';

/**
 * Decimal-safe integer minor-unit (cents) currency utilities for LKR.
 * 1 LKR = 100 cents. All calculations avoid floating-point arithmetic drift.
 */

export function toCents(lkrAmount: number): number {
  if (!Number.isFinite(lkrAmount) || Number.isNaN(lkrAmount)) return 0;
  return Math.round(lkrAmount * 100);
}

export function fromCents(cents: number): number {
  if (!Number.isFinite(cents) || Number.isNaN(cents)) return 0;
  return cents / 100;
}

export function formatLKR(cents: number): string {
  const safe = Number.isFinite(cents) && !Number.isNaN(cents) ? cents : 0;
  const amount = safe / 100;
  return `LKR ${amount.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatLKRCompact(cents: number): string {
  const safe = Number.isFinite(cents) && !Number.isNaN(cents) ? cents : 0;
  const amount = Math.round(safe / 100);
  return `LKR ${amount.toLocaleString('en-LK')}`;
}

export interface OrderTotals {
  subtotalCents: number;
  discountCents: number;
  discountedSubtotalCents: number;
  serviceChargeCents: number;
  taxCents: number;
  totalCents: number;
  balanceDueCents: number;
}

export function calculateItemsSubtotalCents(items: OrderItem[]): number {
  return items.reduce((sum, item) => {
    const qty = Math.max(0, Math.floor(item.quantity || 0));
    const unit = Math.max(0, Math.round(item.unitPriceCents || 0));
    return sum + unit * qty;
  }, 0);
}

export function calculateOrderTotals(
  items: OrderItem[],
  discountType: DiscountType,
  discountValue: number,
  serviceChargeRate: number,
  taxRate: number,
  paidAmountCents = 0
): OrderTotals {
  const subtotalCents = calculateItemsSubtotalCents(items);

  let discountCents = 0;
  if (discountType === 'percentage') {
    const pct = Math.min(100, Math.max(0, Number(discountValue) || 0));
    discountCents = Math.round((subtotalCents * pct) / 100);
  } else if (discountType === 'fixed') {
    const fixed = Math.max(0, Math.round(Number(discountValue) || 0));
    discountCents = Math.min(subtotalCents, fixed);
  }

  const discountedSubtotalCents = Math.max(0, subtotalCents - discountCents);
  const safeServiceRate = Math.max(0, Number(serviceChargeRate) || 0);
  const safeTaxRate = Math.max(0, Number(taxRate) || 0);

  const serviceChargeCents = Math.round((discountedSubtotalCents * safeServiceRate) / 100);
  const taxCents = Math.round((discountedSubtotalCents * safeTaxRate) / 100);
  const totalCents = discountedSubtotalCents + serviceChargeCents + taxCents;
  const safePaid = Math.max(0, Math.round(paidAmountCents || 0));
  const balanceDueCents = Math.max(0, totalCents - safePaid);

  return {
    subtotalCents,
    discountCents,
    discountedSubtotalCents,
    serviceChargeCents,
    taxCents,
    totalCents,
    balanceDueCents,
  };
}

export function getOrderTotals(order: Order): OrderTotals {
  return calculateOrderTotals(
    order.items,
    order.discountType,
    order.discountValue,
    order.serviceChargeRate,
    order.taxRate,
    order.paidAmountCents
  );
}

export function splitAmountEquallyCents(totalCents: number, parts: number): number[] {
  const n = Math.max(1, Math.floor(parts));
  const base = Math.floor(totalCents / n);
  const remainder = totalCents - base * n;
  return Array.from({ length: n }, (_, i) => (i < remainder ? base + 1 : base));
}

export function formatElapsedMinutes(isoDate?: string): string {
  if (!isoDate) return '0m';
  const start = new Date(isoDate).getTime();
  if (Number.isNaN(start)) return '0m';
  const diffMin = Math.max(0, Math.floor((Date.now() - start) / 60000));
  if (diffMin < 60) return `${diffMin}m`;
  const hrs = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  return `${hrs}h ${mins}m`;
}
