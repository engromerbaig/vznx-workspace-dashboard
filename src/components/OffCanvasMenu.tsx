// src/components/layout/OffCanvasMenu.tsx
'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaUser, FaTimes } from 'react-icons/fa';
import { CiLogout } from 'react-icons/ci';

import { useUser } from '@/context/UserContext';
import { useLogout } from '@/context/LogoutContext';
import { navItems } from '@/data/navItems';

interface OffCanvasMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggingOut: boolean;
}

export default function OffCanvasMenu({ isOpen, onClose, isLoggingOut }: OffCanvasMenuProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const { handleGlobalLogout } = useLogout();

  const handleNavClick = () => {
    onClose();
  };

  const handleLogout = () => {
    handleGlobalLogout();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Menu Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isLoggingOut ? 'pointer-events-none opacity-70' : ''}`}
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <FaUser className="text-white text-sm" />
            </div>
            <div className="text-white">
              <div className="font-semibold text-sm">@{user?.username}</div>
              <div className="text-xs text-gray-300 capitalize">{user?.role}</div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            disabled={isLoggingOut}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center py-6 px-6 border-b border-gray-700">
          <a href="/dashboard" onClick={handleNavClick}>
            <Image 
              src="/logo2.png" 
              alt="VZNX Logo" 
              width={160} 
              height={35}
              className="brightness-0 invert"
            />
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-2 px-4">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.path;
              
              return (
                <a
                  key={item.name}
                  href={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  } ${isLoggingOut ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <IconComponent className={`text-xl ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full ml-auto" />
                  )}
                </a>
              );
            })}
          </div>
        </nav>

        {/* Footer with Logout */}
        <div className="p-6 border-t border-gray-700">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isLoggingOut
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300 border border-red-600/30'
            }`}
          >
            {isLoggingOut ? (
              <>
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">Logging out...</span>
              </>
            ) : (
              <>
                <CiLogout className="text-xl" />
                <span className="font-medium">Logout</span>
              </>
            )}
          </button>
          
          {/* User Info Footer */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-center text-xs text-gray-400">
              <div>Logged in as</div>
              <div className="font-medium text-gray-300 mt-1">{user?.name}</div>
              <div className="text-gray-500 mt-1">{user?.email}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}