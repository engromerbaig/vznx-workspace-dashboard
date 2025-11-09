'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { CiLogout } from 'react-icons/ci';
import { FaBars, FaTimes, FaUser } from 'react-icons/fa';

import { useUser } from '@/context/UserContext';
import { useLogout } from '@/context/LogoutContext';
import PrimaryButton from '@/components/PrimaryButton';
import { navItems } from '@/data/navItems';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const { isLoggingOut, handleGlobalLogout } = useLogout();
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);

  if (pathname === '/') return null;

  return (
    <>
      <button
        onClick={() => setIsCanvasOpen(!isCanvasOpen)}
        className="md:hidden fixed top-4 right-4 z-50 shadow-2xl bg-primary text-white p-2 rounded-md hover:bg-primary/80 transition-all"
        disabled={isLoggingOut}
      >
        {isCanvasOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      <div
        className={`fixed top-0 left-0 h-full shadow-xl z-40 w-64 p-6 flex flex-col gap-6 md:translate-x-0 transform transition-transform duration-300 ${
          isCanvasOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isLoggingOut ? 'pointer-events-none opacity-50' : ''}`}
      >
        {/* Logo with border below */}
        <div className="flex justify-center mb-4 pb-4 border-b border-secondary">
          <a href="/dashboard">
            <Image src="/logo2.png" alt="VZNX Logo" width={140} height={30} />
          </a>
        </div>

        <nav className="flex flex-col gap-3 flex-1">
          {/* Regular Nav Items with vertical spacing */}
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <a
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-white hover:bg-primary/30 transition-colors ${
                  pathname === item.path ? 'bg-primary/90 text-primary font-semibold' : ''
                } ${isLoggingOut ? 'pointer-events-none opacity-50' : ''}`}
                onClick={() => setIsCanvasOpen(false)}
              >
                <IconComponent className="text-xl" />
                <span>{item.name}</span>
              </a>
            );
          })}

          <div className="flex-grow" />

          {/* User Info Section */}
          {user && (
            <div className="px-4 py-3 border-t border-secondary mt-auto">
              <div className="flex items-center gap-3 text-white mb-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <FaUser className="text-sm" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">@{user.username}</div>
                </div>
              </div>
              
              {/* Simplified Logout Button */}
              <button
                onClick={handleGlobalLogout}
                disabled={isLoggingOut}
                className={`flex items-center cursor-pointer gap-2 w-full px-3 py-2 text-white hover:bg-primary/30 rounded-md transition-colors ${
                  isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

        {/* Mobile Overlay */}
        {isCanvasOpen && !isLoggingOut && (
          <div
            className="md:hidden fixed inset-0 bg-black z-30"
            onClick={() => setIsCanvasOpen(false)}
          />
        )}
      </div>
    </>
  );
}