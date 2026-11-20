export type UserRole = 'Admin' | 'Cashier' | 'Waiter' | 'Kitchen';

export type TableSection =
  | 'Main Dining Area'
  | 'Outdoor Dining'
  | 'VIP Section'
  | 'Family Section';

export type TableShape = 'rectangular' | 'round' | 'square';

export type TableStatus =
  | 'Available'
  | 'Occupied'
  | 'Reserved'
  | 'Cleaning'
  | 'Payment Pending';

export interface RestaurantTable {
  id: string;
  number: string;
  section: TableSection;
  capacity: number;
  shape: TableShape;
  status: TableStatus;
  x: number; // floor-plan X coordinate (%)
  y: number; // floor-plan Y coordinate (%)
  width: number;
  height: number;
  assignedWaiterId?: string;
  guestCount?: number;
  occupiedSince?: string; // ISO timestamp
  activeOrderId?: string;
  mergedFromIds?: string[];
  mergedLabel?: string;
}

export type MenuCategory =
  | 'Rice & Curry'
  | 'Fried Rice'
  | 'Kottu'
  | 'Burgers'
  | 'Pizza'
  | 'Pasta'
  | 'Seafood'
  | 'Appetizers'
  | 'Desserts'
  | 'Hot Beverages'
  | 'Cold Beverages';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  priceCents: number; // LKR * 100
  description: string;
  image: string;
  available: boolean;
  isBeverage: boolean; // Used for separate Kitchen vs Beverage KOT
  prepMinutes: number;
  customizations?: string[];
  ingredientIds?: { ingredientId: string; qty: number }[];
}

export type OrderType = 'Dine-In' | 'Takeaway' | 'Delivery';

export type OrderStatus =
  | 'Draft'
  | 'Sent to Kitchen'
  | 'Preparing'
  | 'Ready'
  | 'Served'
  | 'Payment Pending'
  | 'Completed'
  | 'Held'
  | 'Cancelled';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  category: MenuCategory;
  unitPriceCents: number;
  quantity: number;
  notes?: string;
  customizations?: string[];
  isBeverage: boolean;
  sentToKitchenQty: number; // Prevents duplicating previously submitted items
}

export type DiscountType = 'none' | 'percentage' | 'fixed';

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  tableId?: string;
  tableNumber?: string;
  customerId?: string;
  waiterId?: string;
  guestCount?: number;
  items: OrderItem[];
  discountType: DiscountType;
  discountValue: number; // percentage (0-100) or fixed LKR cents
  serviceChargeRate: number; // e.g., 10 for 10%
  taxRate: number; // e.g., 8 for 8%
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  inventoryDeducted?: boolean;
  paidAmountCents: number;
  notes?: string;
}

export type KitchenStatus = 'New' | 'Preparing' | 'Ready' | 'Served';

export interface KitchenTicket {
  id: string;
  ticketNumber: string;
  orderId: string;
  orderNumber: string;
  tableNumber: string;
  waiterName: string;
  station: 'Kitchen' | 'Beverage';
  items: {
    id: string;
    name: string;
    quantity: number;
    notes?: string;
    customizations?: string[];
  }[];
  status: KitchenStatus;
  urgent: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer' | 'QR Payment' | 'Mixed';

export interface PaymentRecord {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  tableNumber?: string;
  customerId?: string;
  method: PaymentMethod;
  amountCents: number;
  cashReceivedCents?: number;
  changeCents?: number;
  splitLabel?: string;
  breakdown?: { method: Exclude<PaymentMethod, 'Mixed'>; amountCents: number }[];
  createdAt: string;
  cashierName: string;
  simulated: true;
}

export type ReservationStatus = 'Confirmed' | 'Pending' | 'Seated' | 'Completed' | 'Cancelled';

export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  guestCount: number;
  tableId: string;
  tableNumber: string;
  specialRequests?: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  visits: number;
  totalSpentCents: number;
  notes?: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  active: boolean;
  pin?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  costPerUnitCents: number;
  category: string;
}

export interface StockMovement {
  id: string;
  ingredientId: string;
  ingredientName: string;
  delta: number;
  reason: string;
  createdAt: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category: string;
  amountCents: number;
  date: string;
  notes?: string;
}

export interface RestaurantSettings {
  restaurantName: string;
  tagline: string;
  address: string;
  phone: string;
  currency: 'LKR';
  taxRate: number;
  serviceChargeRate: number;
  receiptFooter: string;
  showLogoOnReceipt: boolean;
  defaultPrintWidth: '58mm' | '80mm' | 'A4';
}
