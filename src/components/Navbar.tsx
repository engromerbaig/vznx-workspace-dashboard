// src/components/layout/Navbar.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FaBars } from 'react-icons/fa';

import SidebarMenu from './SidebarMenu';
import { useLogout } from '@/context/LogoutContext';
import { theme } from '@/theme';

export default function Navbar() {
  const pathname = usePathname();
  const { isLoggingOut } = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === '/') return null;

  return (
    <>
      {/* Mobile Hamburger - Perfect Floating Circle */}
      <button
        onClick={() => setMobileOpen(true)}
        disabled={isLoggingOut}
        className={`
          md:hidden fixed bottom-6 right-6 z-50
          ${theme.gradients.hero}
          text-white p-5 rounded-full
          shadow-2xl backdrop-blur-sm
          hover:scale-110 active:scale-95
          transition-all duration-300
          flex items-center justify-center
          border border-white/20
          ${isLoggingOut ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}
        `}
        aria-label="Open menu"
      >
        <FaBars className="text-2xl" />
      </button>

      {/* Desktop Sidebar - Only on md+ */}
      <div className="hidden md:block">
        <SidebarMenu
          isOpen={true}
          onClose={() => {}}
          isLoggingOut={isLoggingOut}
          variant="desktop"
        />
      </div>

      {/* Mobile Off-Canvas - Only on <md */}
      <div className="md:hidden">
        <SidebarMenu
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          isLoggingOut={isLoggingOut}
          variant="mobile"
        />
      </div>
    </>
  );
}