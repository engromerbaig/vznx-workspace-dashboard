'use client';

import { FaCircle, FaUser, FaEnvelope, FaUserTag } from 'react-icons/fa';
import { RiAdminLine } from "react-icons/ri";
import { theme } from '@/theme';


interface UserCardProps {
  user: {
    username?: string;
    name?: string;
    role?: string;
    email?: string;
    isActive?: boolean;
  };
  className?: string;
}

const UserCard = ({
  user,
  className = '',
}: UserCardProps) => {
  const displayName = user?.name || user?.username || 'User';
  const isActive = user?.isActive ?? true;

  return (
    <div className={`
      relative 
      bg-gradient-to-br from-gray-900 to-black
      rounded-3xl 
      p-8 
      shadow-2xl 
      border border-gray-800
      mb-6
      overflow-hidden
      ${className}
    `}>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 right-4 w-24 h-24 bg-purple-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-blue-500 rounded-full blur-lg"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center gap-6">
        
        {/* User Avatar - Circular */}
        <div className="relative">
          <div className={`w-20 h-20 ${theme.gradients.hero} rounded-full flex items-center justify-center shadow-lg`}>
            <FaUser className="text-white text-2xl" />
          </div>
          
          {/* Active Status Badge */}
          {isActive && (
            <div className="absolute -bottom-1 -right-1">
              <div className="bg-green-500 rounded-full p-1 shadow-lg border-2 border-gray-900">
                <FaCircle className="text-white text-xs" />
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-2xl font-bold text-white">
              Welcome back, {displayName}!
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-300">
            {/* Username with icon */}
            {user?.username && (
              <span className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg text-sm font-medium">
                <FaUserTag className="text-blue-400 text-sm" />
                @{user.username}
              </span>
            )}
            
            {/* Email with icon */}
            {user?.email && (
              <span className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg text-sm font-medium">
                <FaEnvelope className="text-green-400 text-sm" />
                {user.email}
              </span>
            )}


                 {user?.role && (
              <span className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg text-sm font-medium">
                <RiAdminLine className="text-purple-400 text-sm" />
                {user.role}
              </span>
            )}
          </div>
        </div>

        {/* Single Active Badge */}
        <div className="hidden md:flex flex-col items-end">
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
            isActive 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-gray-700 text-gray-400 border border-gray-600'
          }`}>
            {isActive ? '🟢 Active' : '⚫ Offline'}
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
    </div>
  );
};

export default UserCard;