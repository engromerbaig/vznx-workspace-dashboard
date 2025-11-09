'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { CiLogout } from 'react-icons/ci';
import { FaBars, FaTimes, FaUser, FaCog } from 'react-icons/fa';

import { useUser } from '@/context/UserContext';
import { useLogout } from '@/context/LogoutContext';
import PrimaryButton from '@/components/PrimaryButton';
import { navItems } from '@/data/navItems';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useUser();
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
        className={`fixed top-0 left-0 h-full  shadow-xl z-40 w-64 p-6 flex flex-col gap-4 md:translate-x-0 transform transition-transform duration-300 ${
          isCanvasOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isLoggingOut ? 'pointer-events-none opacity-50' : ''}`}
      >
        <div className="mb-2">
          <a href="/dashboard">
            <Image src="/logo2.png" alt="VZNX Logo" width={140} height={30} />
          </a>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {/* Regular Nav Items */}
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <a
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-md text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors ${
                  pathname === item.path ? 'bg-primary/20 text-primary font-semibold' : ''
                } ${isLoggingOut ? 'pointer-events-none opacity-50' : ''}`}
                onClick={() => setIsCanvasOpen(false)}
              >
                <IconComponent className="text-xl" />
                <span>{item.name}</span>
              </a>
            );
          })}

          {/* Logout Button */}
          <PrimaryButton
            onClick={handleGlobalLogout}
            disabled={isLoggingOut}
            isLoading={isLoggingOut}
            loadingText="Logging out..."
            className="w-full justify-start px-4 py-2 rounded-md transition-colors hover:bg-red-100 border-none shadow-none"
            showIcon={!isLoggingOut}
            icon={CiLogout}
            iconPosition="left"
            textColor="text-black"
            bgColor="bg-red-50"
          >
            Logout
          </PrimaryButton>

          <div className="flex-grow" />

          {/* User Info */}
   
        </nav>
      </div>

      {/* Mobile Overlay */}
      {isCanvasOpen && !isLoggingOut && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsCanvasOpen(false)}
        />
      )}
    </>
  );
}