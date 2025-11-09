// app/components/ClientLayout.tsx
'use client';
import { usePathname } from 'next/navigation';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRoot = pathname === '/';
  const isNotFound = pathname === '/404'; // Detect 404 page

  return (
    <main
      className={`flex-1 transition-all duration-300 ${
        !isRoot && !isNotFound ? 'md:ml-64' : ''
      }`}
    >
      {children}
    </main>
  );
}