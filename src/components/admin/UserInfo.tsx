'use client';

import React from 'react';
import { BaseUser } from '@/types/user';

interface UserInfoProps {
  user: BaseUser;
}

export default function UserInfo({ user }: UserInfoProps) {
  return (
    <div className="px-8 py-6 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Logged in as
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-600">Name</p>
          <p className="font-medium text-gray-900">{user.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Username</p>
          <p className="font-medium text-gray-900">{user.username}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Email</p>
          <p className="font-medium text-gray-900">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Role</p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {user.role}
          </span>
        </div>
      </div>
    </div>
  );
}
