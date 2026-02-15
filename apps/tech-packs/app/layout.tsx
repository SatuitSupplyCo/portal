import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Satuit Supply Co. — Factory Execution Pack',
  description: 'Factory-ready tech pack portal for Launch v1.0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
