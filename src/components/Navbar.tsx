'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { CiLogout } from 'react-icons/ci';
import { FaBars, FaTimes } from 'react-icons/fa';

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
        className="md:hidden fixed top-4 right-4 z-50 bg-primary text-white p-2 rounded-md hover:bg-primary/80 transition-all"
        disabled={isLoggingOut}
      >
        {isCanvasOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      <div
        className={`fixed top-0 left-0 h-full s shadow-xl z-40 w-64 p-6 flex flex-col gap-6 md:translate-x-0 transform transition-transform duration-300 ${
          isCanvasOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isLoggingOut ? 'pointer-events-none opacity-50' : ''}`}
      >
        {/* Horizontally Centered Logo */}
        <div className="flex justify-center mb-4">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-white hover:bg-primary/10 hover:text-primary transition-colors ${
                  pathname === item.path ? 'bg-primary/20 text-primary font-semibold' : ''
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
            <div className="px-4 py-3 border-t border-gray-700 mt-auto">
              <div className="text-sm text-white mb-2">
                <div className="font-medium text-white">@{user.username}</div>
              </div>
              
              {/* Logout Button - Styled consistently */}
              <PrimaryButton
                onClick={handleGlobalLogout}
                disabled={isLoggingOut}
                isLoading={isLoggingOut}
                loadingText="Logging out..."
                className="w-full justify-start px-2 py-1 rounded-full transition-colors hover:bg-red-50 border border-red-200 shadow-sm"
                showIcon={!isLoggingOut}
                icon={CiLogout}
                rounded='rounded-full'
                iconPosition="left"
                textColor="text-red-700"
                bgColor="bg-red-200"
                hoverColor="hover:bg-red-100"
                
              >
                Logout
              </PrimaryButton>
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