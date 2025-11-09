'use client';

import Image from 'next/image';
import LoginForm from '@/components/LoginForm';

import { companyInfo } from '@/data/companyInfo';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
   

   

      {/* Centered Login Card */}
      <div className="w-full max-w-md bg-white/30 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/40 p-8 md:p-10 z-10 mx-4">
        <div className="flex flex-col items-center gap-y-6 mb-8">
          <Image
            src="/logo2.png"
            alt={companyInfo.name}
            width={220}
            height={80}
            className="object-contain"
            priority
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to {process.env.NEXT_PUBLIC_APP_NAME}</h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>
        </div>

        <LoginForm />
      </div>

   

  
    </main>
  );
}