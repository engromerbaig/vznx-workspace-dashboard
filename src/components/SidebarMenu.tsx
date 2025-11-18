// src/components/layout/SidebarMenu.tsx
'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaTimes, FaUser, FaCog } from 'react-icons/fa';
import { CiLogout } from 'react-icons/ci';

import PrimaryButton from '@/components/PrimaryButton';
import { useUser } from '@/context/UserContext';
import { useLogout } from '@/context/LogoutContext';
import { navItems } from '@/data/navItems';
import { theme } from '@/theme';
import { ROLES, hasRole } from '@/lib/roles';

type Variant = 'desktop' | 'mobile';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggingOut: boolean;
  variant: Variant;
}

export default function SidebarMenu({
  isOpen,
  onClose,
  isLoggingOut,
  variant,
}: SidebarMenuProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const { handleGlobalLogout } = useLogout();
  const isMobile = variant === 'mobile';

  const handleNav = () => isMobile && onClose();
  const handleLogout = () => {
    handleGlobalLogout();
    isMobile && onClose();
  };

  // EXACT SAME props used for ALL items — including Control Panel
  const navButtonProps = (path: string, icon: React.ComponentType<any>, label: string) => {
    const isActive = pathname === path;
    return {
      href: path,
      onClick: handleNav,
      text: label,
      bgColor: isActive ? 'bg-primary' : 'bg-transparent',
      textColor: isActive ? 'text-white' : 'text-gray-300',
      hoverColor: isActive ? 'bg-primary/90' : 'bg-gray-700/50',
      hoverTextColor: 'hover:text-white',
      showIcon: true,
      icon,
      iconPosition: 'left' as const,
      className: `w-full justify-start gap-4 px-5 py-3.5 rounded-xl font-medium transition-all ${
        isLoggingOut ? 'pointer-events-none opacity-50' : ''
      }`,
      disabled: isLoggingOut,
    };
  };

  return (
    <>
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full ${theme.gradients.hero} shadow-2xl z-50
          flex flex-col transition-transform duration-300 ease-out
          ${isMobile ? 'w-80' : 'w-64'}
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
          ${isLoggingOut ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <FaUser className="text-sm" />
              </div>
              <div>
                <div className="font-semibold text-sm">@{user?.username}</div>
                <div className="text-xs text-gray-300 capitalize">{user?.role}</div>
              </div>
            </div>
            <button onClick={onClose} disabled={isLoggingOut} className="text-gray-400 hover:text-white p-3">
              <FaTimes size={22} />
            </button>
          </div>
        )}

        {/* Logo */}
        <div className={`border-b max-w-[70%] mx-auto border-gray-700 flex justify-center ${isMobile ? 'py-8' : 'pt-10 pb-8'}`}>
          <a href="/dashboard" onClick={handleNav}>
            <Image
              src="/logo2.png"
              alt="VZNX Logo"
              width={isMobile ? 170 : 150}
              height={isMobile ? 40 : 35}
              className="brightness-0 invert"
            />
          </a>
        </div>

        {/* Navigation — Everything uses the SAME PrimaryButton */}
        <nav className="flex-1 overflow-y-auto py-6">
          <div className="space-y-2 px-5">

            {/* CONTROL PANEL — 100% IDENTICAL to other items */}
            {hasRole(user?.role, ROLES.SUPERADMIN) && (
              <PrimaryButton
                {...navButtonProps('/superadmin', FaCog, 'Control Panel')}
              />
            )}

            {/* Regular Nav Items */}
            {navItems.map((item) => (
              <PrimaryButton
                key={item.name}
                {...navButtonProps(item.path, item.icon, item.name)}
              />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-5 pb-8">
          <div className="max-w-[70%] mx-auto border-t border-gray-700 mb-6" />

          {!isMobile && user && (
            <div className="flex items-center gap-3 text-white mb-5 px-2">
              <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <FaUser className="text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">@{user.username}</div>
                <div className="text-xs text-gray-300 capitalize">{user.role}</div>
              </div>
            </div>
          )}

          <PrimaryButton
            onClick={handleLogout}
            disabled={isLoggingOut}
            bgColor={isLoggingOut ? 'bg-gray-700' : 'bg-red-600/20'}
            textColor={isLoggingOut ? 'text-gray-500' : 'text-red-400'}
            hoverColor="bg-red-600/30"
            hoverTextColor="hover:text-red-300"
            border
            borderColor="border-red-600/40"
            className="w-full justify-center gap-3 py-2 px-3 rounded-xl text-base font-semibold"
            showIcon
            icon={CiLogout}
            iconPosition="left"
            isLoading={isLoggingOut}
            loadingText="Logging out..."
          >
            Logout
          </PrimaryButton>

          {isMobile && user && (
            <div className="mt-6 pt-5 border-t border-gray-700 text-center">
              <p className="text-xs text-gray-200">Logged in as</p>
              <p className="text-sm font-medium text-gray-300 mt-1">{user.name}</p>
              <p className="text-xs text-gray-200 mt-1">{user.email}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}