// src/components/layout/Navbar.tsx
'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { FaBars, FaUser } from 'react-icons/fa';

import { useUser } from '@/context/UserContext';
import { useLogout } from '@/context/LogoutContext';
import { navItems } from '@/data/navItems';
import OffCanvasMenu from './OffCanvasMenu';
import { CiLogout } from 'react-icons/ci';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const { isLoggingOut, handleGlobalLogout } = useLogout();
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);

  if (pathname === '/') return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsCanvasOpen(true)}
        disabled={isLoggingOut}
        className="md:hidden fixed top-4 right-4 z-50 shadow-md bg-black text-white p-3 rounded-md hover:bg-black/90 transition-all duration-200"
      >
        <FaBars size={20} />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl z-40 p-6 flex-col gap-6">
        {/* Logo */}
        <div className="flex justify-center mb-4 pb-4 border-b border-gray-700">
          <a href="/dashboard">
            <Image 
              src="/logo2.png" 
              alt="VZNX Logo" 
              width={140} 
              height={30}
              className="brightness-0 invert"
            />
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <a
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <IconComponent className={`text-xl ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="font-medium">{item.name}</span>
              </a>
            );
          })}

          <div className="flex-grow" />

          {/* User Info & Logout */}
          {user && (
            <div className="border-t border-gray-700 pt-4 mt-4">
              <div className="flex items-center gap-3 text-white mb-4 px-2">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <FaUser className="text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">@{user.username}</div>
                  <div className="text-xs text-gray-300 capitalize truncate">{user.role}</div>
                </div>
              </div>
              
              <button
                onClick={handleGlobalLogout}
                disabled={isLoggingOut}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isLoggingOut
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300 border border-red-600/30'
                }`}
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <CiLogout className="text-lg" />
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* OffCanvas Menu for Mobile */}
      <OffCanvasMenu
        isOpen={isCanvasOpen}
        onClose={() => setIsCanvasOpen(false)}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
}