// app/components/ClientLayout.tsx
'use client';
import { usePathname } from 'next/navigation';
import Container from './Container';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRoot = pathname === '/';
  const isNotFound = pathname === '/404';

  return (
    <Container
      disableOnRoot={isRoot} // This will disable container styles on root page
      className={`flex-1 transition-all duration-300 ${
        !isRoot && !isNotFound ? 'md:ml-64' : ''
      }`}
    >
      {children}
    </Container>
  );
}