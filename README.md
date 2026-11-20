# Restro Pro POS

**Developed by Harsh Apex Digital Solutions**

An enterprise-grade, interactive Restaurant POS & Advanced Table Management System built with **Next.js App Router, React, TypeScript, Tailwind CSS, Zustand, Lucide React, Motion, and Recharts**.

## Demo Credentials
- **Email:** `admin@restropro.demo`
- **Password:** `Demo123`
- **Instant Access:** Click **Enter Live Demo** on the login screen and switch between **Admin**, **Cashier**, **Waiter**, and **Kitchen** roles from the top bar.

> **Note:** Authentication, role permissions, and payment terminals (Cash, Card, Bank Transfer, QR Payment, Mixed) are simulated locally in the browser using `localStorage` for client presentation purposes.

## Key Features
- **Interactive Floor-Plan Table Management (20 Tables):** 4 sections (Main Dining Area, Outdoor Dining, VIP Section, Family Section), rectangular/round/square shapes, status colors (Available, Occupied, Reserved, Cleaning, Payment Pending), drag-and-drop floor-plan editor, grid view, order transfer, table merging, bill splitting, and CRUD.
- **Touchscreen Restaurant POS (44 LKR Menu Items):** 11 categories with local optimized food photography, customizations, item notes, discounts (% or fixed LKR), configurable service charge & tax, hold/resume orders, and incremental KOT sending.
- **Kitchen Display System (KOT & BOT):** Live `New → Preparing → Ready → Served` workflow synchronized with POS & table states, separate Kitchen & Beverage tickets, urgent indicators, elapsed timers, and browser KOT printing.
- **Billing & Printing:** Decimal-safe integer minor-unit (cents) LKR calculations, split equally or by items, simulated payments with automatic change calculation, unique invoice numbers, and 58mm / 80mm thermal + A4 browser print layouts.
- **Full Operational Suite:** Dashboard & Analytics (Recharts), Reservations (overlap prevention + convert to dining order), Orders History, Menu Management, Inventory (automatic stock deduction on payment), Customers, Reports (CSV export & print), Staff Management, and Settings.

## Motion & Animations
Built with **Motion** (`motion/react`) plus lightweight CSS keyframes:
- Login card entrance, ambient glows, shimmer CTA and error shake
- Smooth page transitions, staggered panels and table rows
- Sliding active indicators (sidebar, role switcher, POS categories, mobile bottom nav)
- POS menu grid that reflows on category change, cart items that slide in/out, total "bump"
- Spring-animated modals, slide-in mobile drawer, stacked toast notifications
- Kitchen tickets that animate between states, pulsing urgent tickets & payment-pending tables
- Respects the OS **Reduce Motion** setting

## Local Setup & Vercel Deployment
```bash
npm install
npm run dev
```

For production verification:
```bash
npm run lint
npx tsc --noEmit
npm run build
```

Deploy directly to Vercel by importing this repository (`vercel.json` is pre-configured).
