'use client';

import Image from 'next/image';
import LoginForm from '@/components/LoginForm';
import ContactInfo from '@/components/ContactInfo';
import DeveloperCard from '@/components/DeveloperCard';
import DateTimeDisplay from '@/components/DateTimeDisplay';
import { companyInfo } from '@/data/companyInfo';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Date Time Display - Top Right */}
      <div className="hidden md:block absolute top-6 right-6 z-10">
        <DateTimeDisplay />
      </div>

      {/* Centered Login Card */}
      <div className="w-full max-w-md bg-white/30 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/40 p-8 md:p-10 z-10 mx-4">
        <div className="flex flex-col items-center gap-y-6 mb-8">
          <Image
            src="/logo.png"
            alt={companyInfo.name}
            width={220}
            height={80}
            className="object-contain"
            priority
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>
        </div>

        <LoginForm />
      </div>

      {/* Contact Info - Bottom Left */}
      <div className="hidden md:block absolute bottom-6 left-6 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 max-w-xs">
        <ContactInfo />
      </div>

      {/* Developer Card - Bottom Right */}
      <div className="hidden md:block absolute bottom-6 right-6">
        <DeveloperCard />
      </div>

      {/* Mobile Footer - Stacked at bottom */}
      <div className="md:hidden absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full px-6">
        <div className="flex flex-col items-center gap-4">
          {/* Mobile Date Time Display */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-4 w-full max-w-xs">
            <DateTimeDisplay />
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-4 w-full max-w-xs">
            <ContactInfo />
          </div>
          <DeveloperCard />
        </div>
      </div>
    </main>
  );
}