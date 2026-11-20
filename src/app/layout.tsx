import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Restro Pro POS — Restaurant POS & Table Management',
  description:
    'Enterprise Restaurant POS, Interactive Floor-Plan Table Management, Kitchen Display System (KDS), and Analytics by Harsh Apex Digital Solutions.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="font-sans antialiased bg-[#F8FAFC] text-[#0F172A] selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
